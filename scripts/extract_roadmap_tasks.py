"""
extract_roadmap_tasks.py

Reads README.md, finds incomplete roadmap phases (those without ✅),
and creates one GitHub Issue per roadmap item (with a sub-task checklist).
Skips items that already have an open issue with the same title.

Required env vars (set automatically by GitHub Actions):
  GITHUB_TOKEN      — token with issues: write permission
  GITHUB_REPOSITORY — "owner/repo" (e.g. "thieuluan1618/the-space")
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error

README = "README.md"
LABEL = "roadmap"

# ---------------------------------------------------------------------------
# Sub-task checklists keyed by keywords in the roadmap bullet text.
# First keyword match wins.
# ---------------------------------------------------------------------------
SUBTASK_TEMPLATES = [
    {
        "keywords": ["seo", "generatemetadata", "metadata"],
        "heading": "SEO metadata (`generateMetadata`)",
        "tasks": [
            "Add `generateMetadata` export to `app/works/[id]/page.tsx`",
            "Add `generateMetadata` export to `app/seasons/[slug]/page.tsx`",
            "Populate `title`, `description`, and `openGraph` fields from Supabase data",
            "Add `<meta name=\"robots\">` to prevent indexing of draft content",
        ],
    },
    {
        "keywords": ["email", "signup", "newsletter"],
        "heading": "Email signup for collection updates",
        "tasks": [
            "Create `app/components/UI/EmailSignup.tsx` form component",
            "Add POST route handler at `app/api/subscribe/route.ts`",
            "Integrate signup form into Lobby (`app/page.tsx`)",
            "Add server-side validation and duplicate-email handling",
        ],
    },
    {
        "keywords": ["analytics"],
        "heading": "Analytics (Vercel Analytics)",
        "tasks": [
            "Install `@vercel/analytics` package (`npm i @vercel/analytics`)",
            "Add `<Analytics />` component to `app/layout.tsx`",
            "Add `<SpeedInsights />` component to `app/layout.tsx` (optional)",
            "Verify events appear in the Vercel dashboard after deploy",
        ],
    },
    {
        "keywords": ["about", "contact"],
        "heading": "About / contact page",
        "tasks": [
            "Create `app/about/page.tsx` as a Server Component",
            "Add 'About' link to `app/components/UI/BottomNav.tsx`",
            "Add 'About' link to `app/components/UI/TopAppBar.tsx`",
            "Match existing page design (no borders, warm neutral palette)",
        ],
    },
    {
        "keywords": ["3d", "three", "desktop mode"],
        "heading": "3D experience (optional desktop mode)",
        "tasks": [
            "Unpark `app/components/3d/Lobby.tsx` and `CollectionRoom.tsx`",
            "Add desktop-only conditional render in `app/layout.tsx` or `app/page.tsx`",
            "Ensure the 3D bundle is code-split so mobile users don't load it",
            "Test on desktop breakpoints (≥ 1024px)",
        ],
    },
    {
        "keywords": ["blog", "behind-the-scenes", "content"],
        "heading": "Behind-the-scenes content / blog",
        "tasks": [
            "Create `app/blog/page.tsx` (list view) and `app/blog/[slug]/page.tsx` (detail)",
            "Add `blog_posts` table to Supabase schema (title, slug, body, published_at)",
            "Add helper functions to `app/lib/supabase.ts` for blog queries",
            "Add 'Journal' or 'Blog' link to `app/components/UI/BottomNav.tsx`",
        ],
    },
]


# ---------------------------------------------------------------------------
# README parsing
# ---------------------------------------------------------------------------

def parse_roadmap(readme_path: str) -> list[dict]:
    """Return [{phase, items}] for phases that are NOT marked ✅."""
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


def match_template(bullet_text: str) -> dict:
    lower = bullet_text.lower()
    for tmpl in SUBTASK_TEMPLATES:
        if any(kw in lower for kw in tmpl["keywords"]):
            return tmpl
    # Fallback
    return {"heading": bullet_text, "tasks": [f"Implement: {bullet_text}"]}


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
    except urllib.error.HTTPError as e:
        print(f"GitHub API error {e.code}: {e.read().decode()}", file=sys.stderr)
        raise


def ensure_label(repo: str, token: str):
    """Create the 'roadmap' label if it doesn't already exist."""
    try:
        gh_request("GET", f"/repos/{repo}/labels/{LABEL}", token)
    except urllib.error.HTTPError:
        gh_request("POST", f"/repos/{repo}/labels", token, {
            "name": LABEL,
            "color": "0075ca",
            "description": "Roadmap task auto-generated from README.md",
        })


def get_existing_issue_titles(repo: str, token: str) -> set[str]:
    """Return titles of all open issues labelled 'roadmap'."""
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
    gh_request("POST", f"/repos/{repo}/issues", token, {
        "title": title,
        "body": body,
        "labels": [LABEL, phase_label],
    })
    print(f"  ✓ Created: {title}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")

    if not token or not repo:
        print("ERROR: GITHUB_TOKEN and GITHUB_REPOSITORY must be set.", file=sys.stderr)
        sys.exit(1)

    try:
        phases = parse_roadmap(README)
    except FileNotFoundError:
        print(f"ERROR: {README} not found. Run from the repo root.", file=sys.stderr)
        sys.exit(1)

    if not phases:
        print("All roadmap phases are complete — nothing to do.")
        return

    ensure_label(repo, token)
    existing = get_existing_issue_titles(repo, token)

    created = skipped = 0

    for phase in phases:
        # Derive a short label like "phase-2" from "Phase 2 (Next)"
        phase_label = re.sub(r"[^a-z0-9]+", "-", phase["heading"].lower()).strip("-")

        print(f"\n## {phase['heading']}")

        for item_text in phase["items"]:
            tmpl = match_template(item_text)
            title = tmpl["heading"]

            if title in existing:
                print(f"  – Skipped (already open): {title}")
                skipped += 1
                continue

            checklist = "\n".join(f"- [ ] {t}" for t in tmpl["tasks"])
            body = (
                f"**Phase:** {phase['heading']}\n\n"
                f"### Tasks\n\n"
                f"{checklist}\n\n"
                f"---\n_Auto-generated from `README.md` Phase Roadmap._"
            )

            create_issue(repo, token, title, body, phase_label)
            existing.add(title)  # prevent duplicates within the same run
            created += 1

    print(f"\nDone — {created} issue(s) created, {skipped} skipped (already open).")


if __name__ == "__main__":
    main()
