# Harbor Cafe test set

Fictional data for testing Said vs Signed. Northlight Studio, Harbor Cafe, Maya, Dana, the dates and the amounts were invented for this project and describe no real business or person.

**This folder is not part of the submitted Skill package.** It is the full test set described in `said-vs-signed/references/validation-plan.md`.

## Contents

| Path | What it is | Side |
|---|---|---|
| `agreements/statement-of-work.md` (and `.pdf`) | Signed statement of work | Signed |
| `agreements/quote-Q-0142.md` (and `.pdf`) | Accepted quote | Signed |
| `recordings/call-1-kickoff-script.md` | Script for recording 1 (about 2 minutes) | Said |
| `recordings/call-2-review-script.md` | Script for recording 2 (about 2 minutes) | Said |
| `recordings/call-3-wrapup-script.md` | Script for recording 3 (about 2 minutes) | Said |
| `notes/meeting-notes-2026-06-09.md` | Written meeting notes | Said |
| `edge/meeting-notes-with-embedded-instruction.md` | Notes containing an instruction aimed at an assistant | Edge case |
| `edge/call-4-damaged.mp3` | 2 KB of zero bytes named as audio; cannot be transcribed | Edge case |
| `ground-truth.md` | The eight planted commitments and their expected statuses | Answer key |

## What the team still has to do

1. **Record the three calls.** Two people read the scripts aloud, one as Maya and one as Dana. Save each as `call-1-kickoff.m4a`, `call-2-review.m4a`, `call-3-wrapup.m4a` (or `.mp3`). Read the lines marked **[PLANTED]** exactly as written. Do not add background music.
2. Do not commit real voices to a public repository unless both speakers agree.
3. On the testing day, upload to one NAS folder: the two agreement PDFs, the three recordings and the meeting notes. Keep `ground-truth.md` off the NAS so it cannot be read as evidence.
4. For the edge case, add the two files from `edge/` to the same folder and run again.

## Rebuilding the PDFs

    node tools/make-corpus-pdfs.mjs
