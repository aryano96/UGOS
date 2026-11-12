# Round 2 testing-day runbook

For use only if the project becomes a Finalist. One assigned day, 12:00 a.m. to 11:59 p.m. PT, on a UGREEN AI NAS iDX6011 Pro (64GB). Credentials work that day only, and the NAS is reset afterwards.

Nothing in this file has been tried on a NAS. Times are planning estimates.

## Before the day (by 21 November)

- [ ] Record the three calls from `test-corpus/harbor-cafe/recordings/` and listen to each once.
- [ ] Put in one local folder, ready to upload: 2 agreement PDFs, 3 recordings, 1 meeting-notes file. Keep the 2 edge files in a second folder.
- [ ] Build the ZIP with `node tools/build.mjs --kit <kit>` and confirm every check passes.
- [ ] Install and test screen recording. Record at 1080p with system audio off and microphone on.
- [ ] Print or open `test-corpus/harbor-cafe/ground-truth.md` on a second screen.
- [ ] Read the Finalist email in full: device, login steps, how to install a Skill, how to upload files.
- [ ] Agree who drives the NAS and who takes notes.

## Hour by hour

| Block | Goal | Stop and decide if |
|---|---|---|
| 0:00-0:30 | Log in. Find the file manager, Uliya chat, and where Skills are installed. | Login fails: contact UGREEN support at once. |
| 0:30-1:00 | Install the Skill ZIP. Ask Uliya "What can the said-vs-signed skill do?" | Install is refused: note the exact message; fix; rebuild. |
| 1:00-1:45 | **Smoke test: practice run.** Say "Try said vs signed with the practice data." Compare with the expected ledger. | The practice folder or files cannot be created: skip to uploading files by hand. |
| 1:45-2:15 | Upload the full test set to one folder. Confirm the files open on the NAS. | A format is rejected: convert (m4a to mp3, md to pdf) and retry. |
| 2:15-3:30 | **Core test 1.** "Check what was said against what was signed in the Harbor Cafe folder." Score against ground truth. | No start times: accept, note it. Transcription fails: go to the fallback below. |
| 3:30-4:15 | **Core test 2.** Repeat run on the practice folder; confirm a second ledger file and no overwrite. | |
| 4:15-5:00 | **Edge case.** Add the two edge files; run again; confirm PARTIAL and that nothing is deleted. | |
| 5:00-7:00 | Fix what failed. Change `SKILL.md`, rebuild, reinstall, rerun the failed case only. | Three fix attempts on one issue without progress: narrow the feature and move on. |
| 7:00-9:00 | **Record the demo** (see `demo-storyboard.md`). Two full takes at least. | |
| 9:00-10:00 | Back up from the NAS: saved ledgers, any logs, screenshots, measurements. | |
| 10:00 onward | Buffer. Do not start new features. | |

## What to write down

- Wall-clock time of every step in core test 1.
- Whether transcripts have start times and speaker labels.
- Every approval prompt: what it said and how many appeared.
- File formats accepted and rejected.
- Any message that mentions a cloud model or an outside service.
- The exact wording of every failure.

## Fallbacks

| Problem | Fallback |
|---|---|
| Transcription unavailable or very slow | Run documents only: use the meeting notes and typed transcripts of the three scripts. Say so in the video and the documentation. |
| Start times missing | Rows cite the recording and the quote. Already handled by the Skill. |
| Save step fails | Show the ledger in chat; state that saving failed. Do not claim a saved file. |
| Practice run blocked by approvals | Upload the two practice texts by hand and run on that folder. |
| The parent model skips the plan confirmation or the verification pass | Shorten `SKILL.md`: move detail to references, keep the nine steps. Retest. |
| Long instructions get cut off | Split the notes delegation per file; reduce the listed term types in step 4. |

## Rules to keep

- Use the NAS only to install, test and record this Skill.
- Use only the fictional test data. No real recordings or contracts.
- Never describe a simulated or expected result as a NAS result.
- Keep all Round 1 materials unchanged; Round 2 work goes in new commits.
