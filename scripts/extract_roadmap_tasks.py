"""
extract_roadmap_tasks.py

1. Parses README.md for incomplete roadmap items.
2. For each item, calls the Claude API with real codebase context to generate
   specific, file-level sub-tasks (no hardcoded templates).
3. Creates one GitHub Issue per item with a [TaskAugen] prefix.
   Skips items that already have an open issue with the same title.

Required env vars (set automatically by GitHub Actions):
  GITHUB_TOKEN      — token with issues: write permission
  GITHUB_REPOSITORY — "owner/repo"
  ANTHROPIC_API_KEY — Anthropic API key
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

README = "README.md"
LABEL = "roadmap"
CLAUDE_MODEL = "claude-haiku-4-5-20251001"
MAX_FILE_CHARS = 3000   # Truncate large files to keep prompt size reasonable
ISSUE_PREFIX = "[TaskAugen]"


# ---------------------------------------------------------------------------
# README parsing
# ---------------------------------------------------------------------------

def parse_roadmap(readme_path: str) -> list[dict]:
    """Return [{heading, items}] for phases that are NOT marked ✅."""
    with open(readme_path, encoding="utf-8") as f:
        lines = f.readlines()

    phases, current_phase, in_roadmap = [], None, False

    for line in lines:
        stripped = line.rstrip()

        if re.match(r"^## Phase Roadmap", stripped):
            in_roadmap = True
            continue
        if not in_roadmap:
            continue
        if re.match(r"^## ", stripped):
            break

        phase_match = re.match(r"^### (.+)", stripped)
        if phase_match:
            heading = phase_match.group(1)
            current_phase = {"heading": heading, "complete": "✅" in heading, "items": []}
            phases.append(current_phase)
            continue

        bullet_match = re.match(r"^- (.+)", stripped)
        if bullet_match and current_phase:
            current_phase["items"].append(bullet_match.group(1))

    return [p for p in phases if not p["complete"]]


# ---------------------------------------------------------------------------
# Codebase context helpers
# ---------------------------------------------------------------------------

def get_file_tree(root: str = "app", max_depth: int = 3) -> str:
    """Return a compact directory tree, excluding noise."""
    skip_dirs = {"node_modules", ".next", ".git", "__pycache__", "3d"}
    lines = [f"{root}/"]
    root_path = Path(root)
    if not root_path.exists():
        return "(app/ directory not found)"

    for path in sorted(root_path.rglob("*")):
        parts = set(path.parts)
        if parts & skip_dirs:
            continue
        rel = path.relative_to(root_path)
        if len(rel.parts) > max_depth:
            continue
        indent = "  " * len(rel.parts)
        suffix = "/" if path.is_dir() else ""
        lines.append(f"{indent}{path.name}{suffix}")

    return "\n".join(lines)


def read_file(path: str) -> str:
    try:
        content = Path(path).read_text(encoding="utf-8")
        if len(content) > MAX_FILE_CHARS:
            content = content[:MAX_FILE_CHARS] + "\n… (truncated)"
        return content
    except (FileNotFoundError, OSError):
        return "(not found)"


def get_relevant_files(item_text: str) -> dict[str, str]:
    """Return {path: content} for files most relevant to the roadmap item."""
    lower = item_text.lower()
    files: dict[str, str] = {}

    # Architecture anchors — always useful
    for p in ["app/layout.tsx", "app/lib/supabase.ts", "app/lib/types.ts"]:
        files[p] = read_file(p)

    if any(k in lower for k in ["seo", "metadata", "generatemetadata"]):
        files["app/works/[id]/page.tsx"] = read_file("app/works/[id]/page.tsx")
        files["app/seasons/[slug]/page.tsx"] = read_file("app/seasons/[slug]/page.tsx")

    if any(k in lower for k in ["email", "signup", "newsletter"]):
        files["app/page.tsx"] = read_file("app/page.tsx")

    if any(k in lower for k in ["about", "contact", "nav"]):
        files["app/components/UI/BottomNav.tsx"] = read_file("app/components/UI/BottomNav.tsx")
        files["app/components/UI/TopAppBar.tsx"] = read_file("app/components/UI/TopAppBar.tsx")

    if any(k in lower for k in ["analytics"]):
        files["app/layout.tsx"] = read_file("app/layout.tsx")

    if any(k in lower for k in ["blog", "behind", "content"]):
        files["app/lib/supabase.ts"] = read_file("app/lib/supabase.ts")
        files["app/seasons/page.tsx"] = read_file("app/seasons/page.tsx")

    return files


# ---------------------------------------------------------------------------
# Claude API
# ---------------------------------------------------------------------------

def build_prompt(item_text: str, phase: str, file_tree: str, relevant_files: dict) -> str:
    files_section = "\n\n".join(
        f"### {path}\n```tsx\n{content}\n```"
        for path, content in relevant_files.items()
    )
    return f"""You are a senior Next.js engineer. Your job is to break a roadmap item into specific, actionable sub-tasks by analyzing the real codebase.

## Project
The Space — a mobile-first 2D digital gallery for fashion designer Trinh Chau.
Stack: Next.js 14 App Router, Tailwind CSS, Supabase (read-only), TypeScript.
Design rules: border-radius 0px everywhere, no borders for sectioning, warm neutral palette, no commerce features.

## App directory structure
```
{file_tree}
```

## Relevant existing files
{files_section}

## Roadmap item
Phase: {phase}
Item: {item_text}

Based on the actual files above, generate 4–6 specific, actionable sub-tasks to implement this item.
Reference exact file paths. Point out files that need to be created vs modified.
Return ONLY a valid JSON array of strings — no explanation, no markdown fences.
Example: ["Add generateMetadata export to app/works/[id]/page.tsx", "Create app/api/subscribe/route.ts"]"""


def call_claude(prompt: str, api_key: str) -> list[str]:
    payload = {
        "model": CLAUDE_MODEL,
        "max_tokens": 1024,
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

    text = result["content"][0]["text"].strip()
    # Handle model wrapping output in ```json ... ```
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(text)


# ---------------------------------------------------------------------------
# GitHub API helpers
# ---------------------------------------------------------------------------

def gh_request(method: str, path: str, token: str, body: dict | None = None):
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
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


def ensure_label(repo: str, token: str):
    try:
        gh_request("POST", f"/repos/{repo}/labels", token, {
            "name": LABEL,
            "color": "0075ca",
            "description": "Roadmap task auto-generated from README.md",
        })
    except urllib.error.HTTPError:
        pass  # 422 = already exists; ignore


def get_existing_issue_titles(repo: str, token: str) -> set[str]:
    titles, page = set(), 1
    while True:
        issues = gh_request(
            "GET",
            f"/repos/{repo}/issues?state=open&labels={LABEL}&per_page=100&page={page}",
            token,
        )
        if not issues:
            break
        for issue in issues:
            titles.add(issue["title"])
        if len(issues) < 100:
            break
        page += 1
    return titles


def create_issue(repo: str, token: str, title: str, body: str, phase_label: str):
    try:
        gh_request("POST", f"/repos/{repo}/issues", token, {
            "title": title,
            "body": body,
            "labels": [LABEL, phase_label],
        })
        print(f"  ✓ Created: {title}")
    except urllib.error.HTTPError as e:
        if e.code == 410:
            print(f"  ✗ Issues are disabled on {repo}. Enable them under Settings → Features → Issues.", file=sys.stderr)
            sys.exit(1)
        raise


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not token or not repo:
        print("ERROR: GITHUB_TOKEN and GITHUB_REPOSITORY must be set.", file=sys.stderr)
        sys.exit(1)
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY must be set.", file=sys.stderr)
        sys.exit(1)

    try:
        phases = parse_roadmap(README)
    except FileNotFoundError:
        print(f"ERROR: {README} not found. Run from the repo root.", file=sys.stderr)
        sys.exit(1)

    if not phases:
        print("All roadmap phases are complete — nothing to do.")
        return

    file_tree = get_file_tree("app")
    ensure_label(repo, token)
    existing = get_existing_issue_titles(repo, token)

    created = skipped = 0

    for phase in phases:
        phase_label = re.sub(r"[^a-z0-9]+", "-", phase["heading"].lower()).strip("-")
        print(f"\n## {phase['heading']}")

        for item_text in phase["items"]:
            title = f"{ISSUE_PREFIX} {item_text}"

            if title in existing:
                print(f"  – Skipped (already open): {title}")
                skipped += 1
                continue

            print(f"  → Analyzing: {item_text}")
            relevant_files = get_relevant_files(item_text)
            prompt = build_prompt(item_text, phase["heading"], file_tree, relevant_files)

            try:
                subtasks = call_claude(prompt, api_key)
            except Exception as e:
                print(f"    Claude API error: {e} — skipping", file=sys.stderr)
                continue

            checklist = "\n".join(f"- [ ] {t}" for t in subtasks)
            body = (
                f"**Phase:** {phase['heading']}\n\n"
                f"### Tasks\n\n"
                f"{checklist}\n\n"
                f"---\n_Sub-tasks generated by Claude from codebase analysis of `README.md`._"
            )

            create_issue(repo, token, title, body, phase_label)
            existing.add(title)
            created += 1

    print(f"\nDone — {created} issue(s) created, {skipped} skipped (already open).")


if __name__ == "__main__":
    main()
