"""
extract_roadmap_tasks.py

1. Parses README.md for incomplete roadmap items.
2. Creates a GitHub Milestone per phase (Phase 2, Phase 3).
3. For each item, calls the Claude API with real codebase context to generate:
   - Specific, file-level sub-tasks
   - Priority (high / medium / low)
   - Dependency on another roadmap item (if any)
4. Creates one GitHub Issue per item with:
   - [TaskAugen] prefix
   - Priority label
   - Phase milestone
   - Dependency note in body
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
MAX_FILE_CHARS = 3000
ISSUE_PREFIX = "[TaskAugen]"

PRIORITY_LABELS = {
    "priority: high":   ("d73a4a", "Blocks other tasks or highest business value — do first"),
    "priority: medium": ("e4e669", "Important but not blocking"),
    "priority: low":    ("0e8a16", "Nice to have — do last"),
}

PRIORITY_ICON = {"high": "🔴", "medium": "🟡", "low": "🟢"}


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
    skip_dirs = {"node_modules", ".next", ".git", "__pycache__", "3d"}
    lines = [f"{root}/"]
    root_path = Path(root)
    if not root_path.exists():
        return "(app/ directory not found)"

    for path in sorted(root_path.rglob("*")):
        if set(path.parts) & skip_dirs:
            continue
        rel = path.relative_to(root_path)
        if len(rel.parts) > max_depth:
            continue
        indent = "  " * len(rel.parts)
        lines.append(f"{indent}{path.name}{'/' if path.is_dir() else ''}")

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
    lower = item_text.lower()
    files: dict[str, str] = {}

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

    if any(k in lower for k in ["blog", "behind", "content"]):
        files["app/lib/supabase.ts"] = read_file("app/lib/supabase.ts")
        files["app/seasons/page.tsx"] = read_file("app/seasons/page.tsx")

    return files


# ---------------------------------------------------------------------------
# Claude API
# ---------------------------------------------------------------------------

def build_prompt(item_text: str, phase: str, all_items: list[str],
                 file_tree: str, relevant_files: dict) -> str:
    files_section = "\n\n".join(
        f"### {path}\n```tsx\n{content}\n```"
        for path, content in relevant_files.items()
    )
    other_items = [i for i in all_items if i != item_text]
    siblings = "\n".join(f"- {i}" for i in other_items) or "None"

    return f"""You are a senior Next.js engineer breaking a roadmap item into actionable sub-tasks.

## Project
The Space — a mobile-first 2D digital gallery for fashion designer Trinh Chau.
Stack: Next.js 14 App Router, Tailwind CSS, Supabase (read-only), TypeScript.
Rules: border-radius 0px, no borders for sectioning, warm neutral palette, no commerce.

## App directory structure
```
{file_tree}
```

## Relevant existing files
{files_section}

## Other items in this roadmap phase
{siblings}

## Item to analyse
Phase: {phase}
Item: {item_text}

Respond with ALL THREE tags below — no prose outside them:

<tasks>["specific sub-task referencing exact file paths", ...]</tasks>

<priority>high|medium|low</priority>
(high = blocks other tasks or highest user-facing value; low = nice-to-have)

<depends_on>exact name of another roadmap item this must come after, or "none"</depends_on>"""


def call_claude(prompt: str, api_key: str) -> dict:
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

    tasks_match    = re.search(r"<tasks>(.*?)</tasks>",         text, re.DOTALL)
    priority_match = re.search(r"<priority>(.*?)</priority>",   text, re.DOTALL)
    depends_match  = re.search(r"<depends_on>(.*?)</depends_on>", text, re.DOTALL)

    tasks      = json.loads(tasks_match.group(1).strip()) if tasks_match else []
    priority   = priority_match.group(1).strip().lower()  if priority_match else "medium"
    depends_on = depends_match.group(1).strip()           if depends_match else "none"

    if priority not in ("high", "medium", "low"):
        priority = "medium"

    return {"tasks": tasks, "priority": priority, "depends_on": depends_on}


# ---------------------------------------------------------------------------
# GitHub API helpers
# ---------------------------------------------------------------------------

def gh_request(method: str, path: str, token: str, body: dict | None = None):
    url = f"https://api.github.com{path}"
    req = urllib.request.Request(
        url,
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


def ensure_label(repo: str, token: str, name: str, color: str, description: str = ""):
    try:
        gh_request("POST", f"/repos/{repo}/labels", token,
                   {"name": name, "color": color, "description": description})
    except urllib.error.HTTPError:
        pass  # 422 = already exists


def ensure_milestone(repo: str, token: str, title: str, description: str = "") -> int:
    """Return the milestone number for title, creating it if needed."""
    for state in ("open", "closed"):
        milestones = gh_request("GET",
            f"/repos/{repo}/milestones?state={state}&per_page=100", token)
        for m in milestones:
            if m["title"] == title:
                return m["number"]
    result = gh_request("POST", f"/repos/{repo}/milestones", token,
                        {"title": title, "description": description})
    return result["number"]


def get_existing_issue_titles(repo: str, token: str) -> set[str]:
    titles, page = set(), 1
    while True:
        issues = gh_request("GET",
            f"/repos/{repo}/issues?state=open&labels={LABEL}&per_page=100&page={page}",
            token)
        if not issues:
            break
        for issue in issues:
            titles.add(issue["title"])
        if len(issues) < 100:
            break
        page += 1
    return titles


def create_issue(repo: str, token: str, title: str, body: str,
                 phase_label: str, priority: str, milestone_number: int):
    try:
        gh_request("POST", f"/repos/{repo}/issues", token, {
            "title": title,
            "body": body,
            "labels": [LABEL, phase_label, f"priority: {priority}"],
            "milestone": milestone_number,
        })
        icon = PRIORITY_ICON.get(priority, "")
        print(f"  ✓ Created [{icon} {priority}]: {title}")
    except urllib.error.HTTPError as e:
        if e.code == 410:
            print(f"  ✗ Issues are disabled on {repo}. "
                  "Enable them under Settings → Features → Issues.", file=sys.stderr)
            sys.exit(1)
        raise


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    token   = os.environ.get("GITHUB_TOKEN")
    repo    = os.environ.get("GITHUB_REPOSITORY")
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

    # Ensure base labels exist
    ensure_label(repo, token, LABEL, "0075ca", "Roadmap task auto-generated from README.md")
    for name, (color, desc) in PRIORITY_LABELS.items():
        ensure_label(repo, token, name, color, desc)

    existing = get_existing_issue_titles(repo, token)
    created = skipped = 0

    for phase in phases:
        phase_label = re.sub(r"[^a-z0-9]+", "-", phase["heading"].lower()).strip("-")
        milestone_number = ensure_milestone(repo, token, phase["heading"])
        print(f"\n## {phase['heading']}  (milestone #{milestone_number})")

        all_items = phase["items"]

        for item_text in all_items:
            title = f"{ISSUE_PREFIX} {item_text}"

            if title in existing:
                print(f"  – Skipped (already open): {title}")
                skipped += 1
                continue

            print(f"  → Analyzing: {item_text}")
            relevant_files = get_relevant_files(item_text)
            prompt = build_prompt(item_text, phase["heading"], all_items,
                                  file_tree, relevant_files)

            try:
                analysis = call_claude(prompt, api_key)
            except Exception as e:
                print(f"    Claude API error: {e} — skipping", file=sys.stderr)
                continue

            subtasks   = analysis["tasks"]
            priority   = analysis["priority"]
            depends_on = analysis["depends_on"]

            icon      = PRIORITY_ICON.get(priority, "")
            dep_line  = (f"> **Depends on:** {depends_on}\n\n"
                         if depends_on.lower() != "none" else "")
            checklist = "\n".join(f"- [ ] {t}" for t in subtasks)

            body = (
                f"**Phase:** {phase['heading']}\n"
                f"**Priority:** {icon} {priority.capitalize()}\n\n"
                f"{dep_line}"
                f"### Tasks\n\n"
                f"{checklist}\n\n"
                f"---\n_Sub-tasks generated by Claude from codebase analysis of `README.md`._"
            )

            create_issue(repo, token, title, body, phase_label,
                         priority, milestone_number)
            existing.add(title)
            created += 1

    print(f"\nDone — {created} issue(s) created, {skipped} skipped (already open).")


if __name__ == "__main__":
    main()
