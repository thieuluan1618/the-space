"""
coding_agent.py

1. Fetches the highest-priority open roadmap issue.
2. Parses its unchecked tasks and asks Claude to sort them easiest → hardest.
3. For each task (easiest first), asks Claude to generate file changes.
4. Applies all changes, commits to branch taskaugen/issue-{N}, opens a draft PR.

Required env vars:
  GITHUB_TOKEN      — contents: write + pull-requests: write + issues: write
  GITHUB_REPOSITORY — "owner/repo"
  ANTHROPIC_API_KEY — Anthropic API key
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error
from pathlib import Path

LABEL = "roadmap"
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")
MAX_FILE_CHARS = 4000
ISSUE_PREFIX = "[TaskAugen]"
PRIORITY_ORDER = {"priority: high": 0, "priority: medium": 1, "priority: low": 2}


# ---------------------------------------------------------------------------
# Helpers — file I/O
# ---------------------------------------------------------------------------

def read_file(path: str) -> str | None:
    try:
        content = Path(path).read_text(encoding="utf-8")
        if len(content) > MAX_FILE_CHARS:
            content = content[:MAX_FILE_CHARS] + "\n… (truncated)"
        return content
    except (FileNotFoundError, OSError):
        return None


def get_relevant_files(task: str, issue_title: str) -> dict[str, str]:
    """Load files most relevant to this task based on keywords and mentioned paths."""
    lower = (task + " " + issue_title).lower()
    candidates: list[str] = []

    # Architecture anchors — always useful
    candidates += ["app/layout.tsx", "app/lib/supabase.ts", "app/lib/types.ts"]

    if any(k in lower for k in ["seo", "metadata", "generatemetadata"]):
        candidates += ["app/works/[id]/page.tsx", "app/seasons/[slug]/page.tsx"]

    if any(k in lower for k in ["email", "signup", "newsletter", "subscribe"]):
        candidates += ["app/page.tsx"]

    if any(k in lower for k in ["about", "contact"]):
        candidates += ["app/components/UI/BottomNav.tsx",
                       "app/components/UI/TopAppBar.tsx"]

    if any(k in lower for k in ["nav", "bottom", "topapp"]):
        candidates += ["app/components/UI/BottomNav.tsx",
                       "app/components/UI/TopAppBar.tsx"]

    if any(k in lower for k in ["analytics", "vercel"]):
        candidates += ["app/layout.tsx", "package.json"]

    if any(k in lower for k in ["blog", "behind", "journal"]):
        candidates += ["app/lib/supabase.ts", "app/seasons/page.tsx"]

    # Paths explicitly mentioned in the task text
    for match in re.findall(r'[\w./\[\]-]+\.(?:tsx|ts|js|jsx|css|json)', task):
        candidates.append(match)

    files: dict[str, str] = {}
    for path in dict.fromkeys(candidates):   # deduplicate, preserve order
        content = read_file(path)
        if content:
            files[path] = content

    return files


# ---------------------------------------------------------------------------
# Helpers — git
# ---------------------------------------------------------------------------

def git(*args: str) -> str:
    result = subprocess.run(
        ["git"] + list(args),
        capture_output=True, text=True, check=True,
    )
    return result.stdout.strip()


def setup_git_identity(token: str, repo: str):
    git("config", "user.email", "taskaugen-bot@users.noreply.github.com")
    git("config", "user.name", "TaskAugen Bot")
    git("remote", "set-url", "origin",
        f"https://x-access-token:{token}@github.com/{repo}.git")


# ---------------------------------------------------------------------------
# GitHub API
# ---------------------------------------------------------------------------

def gh_request(method: str, path: str, token: str, body: dict | None = None):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=json.dumps(body).encode() if body else None,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError:
        raise


def get_highest_priority_issue(repo: str, token: str) -> dict | None:
    """Return the single highest-priority open roadmap issue."""
    issues = gh_request("GET",
        f"/repos/{repo}/issues?state=open&labels={LABEL}&per_page=100", token)

    if not issues:
        return None

    def priority_key(issue):
        label_names = {lb["name"] for lb in issue.get("labels", [])}
        for label, order in PRIORITY_ORDER.items():
            if label in label_names:
                return order
        return 99

    return min(issues, key=priority_key)


def create_pr(repo: str, token: str, head: str, base: str,
              title: str, body: str) -> str:
    """Create a draft PR. head can be 'branch' or 'owner:branch' for cross-repo."""
    result = gh_request("POST", f"/repos/{repo}/pulls", token, {
        "title": title,
        "body": body,
        "head": head,
        "base": base,
        "draft": True,
    })
    return result["html_url"]


# ---------------------------------------------------------------------------
# Claude API
# ---------------------------------------------------------------------------

def call_claude(prompt: str, api_key: str, max_tokens: int = 4096) -> str:
    payload = {
        "model": CLAUDE_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode(),
        method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["content"][0]["text"].strip()


def sort_tasks_by_easiness(tasks: list[str], api_key: str) -> list[str]:
    """Ask Claude to sort tasks from easiest to hardest."""
    if len(tasks) <= 1:
        return tasks

    numbered = "\n".join(f"{i + 1}. {t}" for i, t in enumerate(tasks))
    prompt = f"""Sort these coding tasks from easiest to hardest to implement.
Consider: new file vs modifying existing, number of touch points, external dependencies.

Tasks:
{numbered}

Return ONLY a <sorted> tag with a JSON array of the task strings in easiest-first order.
<sorted>["easiest task", "harder task", ...]</sorted>"""

    text = call_claude(prompt, api_key, max_tokens=1024)
    match = re.search(r"<sorted>(.*?)</sorted>", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            pass
    return tasks   # fallback: original order


def generate_file_changes(task: str, issue_title: str,
                          relevant_files: dict[str, str],
                          api_key: str) -> list[dict]:
    """
    Ask Claude to implement the task. Returns list of:
      {"path": str, "content": str, "is_new": bool}
    """
    files_section = "\n\n".join(
        f'<existing_file path="{path}">\n```tsx\n{content}\n```\n</existing_file>'
        for path, content in relevant_files.items()
    )

    prompt = f"""You are implementing a single coding task in a Next.js 14 codebase.

## Project
The Space — a mobile-first 2D digital gallery for fashion designer Trinh Chau.
Stack: Next.js 14 App Router, Tailwind CSS, Supabase (read-only), TypeScript.
Design rules: border-radius 0px everywhere, no borders for sectioning, warm neutral palette (#faf9f6 bg, #6a5e45 secondary, #0d0f0d headings), Inter font.
No commerce, no auth, no rounded corners.

## Current files
{files_section}

## Task to implement
Issue: {issue_title}
Task: {task}

Instructions:
- Implement ONLY what this task requires. No extra features.
- Match existing code style exactly.
- For EACH file you create or modify, output the COMPLETE new file content wrapped in:
  <file path="path/from/repo/root">
  ...complete content...
  </file>
- Output ONLY <file> tags. No explanation, no prose."""

    text = call_claude(prompt, api_key, max_tokens=4096)

    changes = []
    for match in re.finditer(
        r'<file\s+path="([^"]+)"[^>]*>(.*?)</file>', text, re.DOTALL
    ):
        path = match.group(1).strip()
        content = match.group(2).strip()
        # Strip accidental markdown fences Claude might wrap content in
        content = re.sub(r'^```[a-z]*\n', '', content)
        content = re.sub(r'\n```$', '', content)
        is_new = not Path(path).exists()
        changes.append({"path": path, "content": content, "is_new": is_new})

    return changes


# ---------------------------------------------------------------------------
# Issue parsing
# ---------------------------------------------------------------------------

def parse_unchecked_tasks(body: str) -> list[str]:
    """Extract unchecked `- [ ] ...` items from an issue body."""
    return [
        m.group(1).strip()
        for m in re.finditer(r"^- \[ \] (.+)", body, re.MULTILINE)
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    token           = os.environ.get("GITHUB_TOKEN")
    repo            = os.environ.get("GITHUB_REPOSITORY")
    upstream_repo   = os.environ.get("UPSTREAM_REPO", "")
    upstream_token  = os.environ.get("UPSTREAM_TOKEN", "")
    api_key         = os.environ.get("ANTHROPIC_API_KEY")

    if not token or not repo:
        print("ERROR: GITHUB_TOKEN and GITHUB_REPOSITORY must be set.", file=sys.stderr)
        sys.exit(1)
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY must be set.", file=sys.stderr)
        sys.exit(1)

    # 1. Pick highest-priority issue
    print("Fetching highest-priority roadmap issue…")
    issue = get_highest_priority_issue(repo, token)
    if not issue:
        print("No open roadmap issues found — nothing to do.")
        return

    issue_number = issue["number"]
    issue_title  = issue["title"]
    print(f"  → #{issue_number}: {issue_title}")

    # 2. Parse unchecked tasks
    tasks = parse_unchecked_tasks(issue.get("body") or "")
    if not tasks:
        print("  All tasks already checked off — closing agent.")
        return

    print(f"  Found {len(tasks)} unchecked task(s)")

    # 3. Sort easiest first
    print("Sorting tasks by easiness…")
    tasks = sort_tasks_by_easiness(tasks, api_key)
    for i, t in enumerate(tasks, 1):
        print(f"  {i}. {t}")

    # 4. Set up git branch
    setup_git_identity(token, repo)
    clean_title = re.sub(r"^\[TaskAugen\]\s*", "", issue_title)
    slug = re.sub(r"[^a-z0-9]+", "-", clean_title.lower()).strip("-")[:40]
    branch = f"taskaugen/issue-{issue_number}-{slug}"
    base   = git("rev-parse", "--abbrev-ref", "HEAD")

    git("checkout", "-b", branch)
    print(f"\nBranch: {branch}")

    # 5. Implement each task
    all_changed_files: list[str] = []

    for i, task in enumerate(tasks, 1):
        print(f"\n[{i}/{len(tasks)}] {task}")
        relevant = get_relevant_files(task, issue_title)
        print(f"  Context files: {list(relevant.keys())}")

        try:
            changes = generate_file_changes(task, issue_title, relevant, api_key)
        except Exception as e:
            print(f"  ✗ Claude error: {e} — skipping task", file=sys.stderr)
            continue

        if not changes:
            print("  ✗ Claude returned no file changes — skipping task")
            continue

        for change in changes:
            path = change["path"]
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            Path(path).write_text(change["content"], encoding="utf-8")
            status = "Created" if change["is_new"] else "Modified"
            print(f"  ✓ {status}: {path}")
            all_changed_files.append(path)

    if not all_changed_files:
        print("\nNo file changes generated — aborting PR creation.")
        git("checkout", base)
        git("branch", "-D", branch)
        return

    # 6. Commit
    unique_files = list(dict.fromkeys(all_changed_files))
    for f in unique_files:
        git("add", f)

    clean_title_short = clean_title[:60]
    git("commit", "-m",
        f"feat: {clean_title_short} (TaskAugen #{issue_number})\n\n"
        f"Auto-implemented by TaskAugen coding agent.\n"
        f"Closes #{issue_number}")

    # 7. Push
    git("push", "-u", "origin", branch)
    print(f"\nPushed branch: {branch}")

    # 8. Create draft PRs
    fork_owner   = repo.split("/")[0]
    changed_list = "\n".join(f"- `{f}`" for f in unique_files)
    task_list    = "\n".join(f"- [x] {t}" for t in tasks)
    pr_title     = f"[TaskAugen] {clean_title}"

    pr_body = (
        f"Closes #{issue_number}\n\n"
        f"## Tasks implemented\n\n{task_list}\n\n"
        f"## Files changed\n\n{changed_list}\n\n"
        f"---\n_Auto-generated by TaskAugen coding agent. Please review before merging._"
    )

    # PR 1 — fork (branch → fork main)
    try:
        url = create_pr(repo, token, branch, base, pr_title, pr_body)
        print(f"\n✓ Fork PR:     {url}")
    except urllib.error.HTTPError as e:
        print(f"Fork PR failed: {e}", file=sys.stderr)

    # PR 2 — upstream (fork:branch → upstream main)
    if upstream_repo and upstream_token:
        try:
            url = create_pr(
                upstream_repo, upstream_token,
                head=f"{fork_owner}:{branch}",
                base="main",
                title=pr_title,
                body=pr_body,
            )
            print(f"✓ Upstream PR: {url}")
        except urllib.error.HTTPError as e:
            print(f"Upstream PR failed (check UPSTREAM_TOKEN permissions): {e}",
                  file=sys.stderr)
    else:
        print("ℹ Upstream PR skipped — set UPSTREAM_REPO + UPSTREAM_TOKEN to enable")


if __name__ == "__main__":
    main()
