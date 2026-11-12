# Said vs Signed

A Skill for UGREEN AI NAS (Uliya), built for the UGREEN Hackathon 2026 on AI NAS, track "Automate Your Workflow".

It reads one project folder on the NAS and lists every commitment made out loud (in call recordings or meeting notes) next to what the signed paperwork says: **confirmed**, **contradicts**, **not in writing** or **unclear**, with the exact quote and its source on both sides.

**Status:** Round 1 package built and statically checked. Nothing has been run on a NAS; that is only possible on a Finalist testing day.

## What is in this repository

| Path | Purpose | Submitted? |
|---|---|---|
| `said-vs-signed/` | The Skill package: `SKILL.md` and five reference files | Yes, as the ZIP |
| `dist/said-vs-signed.zip` | Built ZIP of the package | **Yes** |
| `dist/Said-vs-Signed-Proposal-DRAFT.pdf` | Proposal PDF, draft until team details are filled in | Yes, once final |
| `proposal/` | Proposal source text and team details | No (source for the PDF) |
| `test-corpus/harbor-cafe/` | Fictional test set and answer key | No |
| `round2/` | Testing-day runbook and demo storyboard | No |
| `tools/` | Build and audit scripts | No |
| `docs/audit-report.md` | Output of the last build: every check and its result | No |

Only `SKILL.md` and `references/*.md` go in the ZIP. The Hackathon rules prohibit scripts, manifests and other file types in the package.

## Build and check

You need Node.js, `zip`/`unzip`, the official `uliya-skill-kit` folder (from the Hackathon Starter Kit) and Playwright for the PDF.

    node tools/build.mjs --kit /path/to/uliya-skill-kit

This runs the official static checker, audits the package against the Round 1 limits, builds the ZIP, re-checks the extracted ZIP, counts the proposal words, builds the proposal PDF and writes `docs/audit-report.md`.

## Before submitting (team)

1. Rewrite the ten answers in `proposal/proposal.md` in your own words. Keep the total under 500 words; the build reports the count.
2. Fill in `proposal/team.json` (names, residence, signatures, Representative). Confirm the declaration wording; no official template was published.
3. Check `said-vs-signed/references/disclosures.md` and the "AI tools used" part of the proposal. They must list every AI tool actually used and what for.
4. Rebuild, read `docs/audit-report.md`, and open both files in `dist/`.
5. Read the three agreements linked from the Starter Kit (User Agreement, Privacy Policy, Skill Content Safety and Publishing Guidelines).
6. The Representative submits on Devpost before 15 November 2026, 11:45 pm PT. Do not delete the Round 1 materials afterwards.
