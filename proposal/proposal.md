# Said vs Signed

Track: Automate Your Workflow
Skill name: said-vs-signed

<!-- ANSWERS: everything between here and END-ANSWERS counts toward the 500-word limit (headings excluded). -->

## 1. One sentence: what does the Skill do?

Said vs Signed finds every commitment made out loud in a project's recordings and meeting notes, and shows whether the signed paperwork confirms it, contradicts it, or is silent.

## 2. Who is the target user, and what is their problem?

Freelancers, small agencies and anyone managing a contractor. Things get agreed on calls (an extra revision round, an earlier date, added work) and never reach the contract. Later nobody can show what was said.

## 3. What is your proposed solution?

The user points the Skill at one project folder. It reads the agreements, transcribes the recordings and reads any meeting notes. Each spoken commitment gets a status: confirmed, contradicts, not in writing, or unclear, with the exact quote beside the exact clause and both sources. It also drafts a note requesting written confirmation.

## 4. What is the core user flow?

The user names a folder and confirms how the Skill sorted its files into agreements, recordings and notes. The Skill extracts and matches both sides, re-checks every contradiction or gap with a second search, shows the ledger, and saves it as a new file if the user agrees.

## 5. What substantive difference does it offer?

Meeting tools summarise calls and contract tools review documents; neither compares the two. A general chatbot can, but only after private contracts and long recordings are uploaded. Here, gaps and conflicts are the main output, and no contradiction is reported without a quote on both sides.

## 6. Which UGREEN AI NAS capabilities are used, and at which step?

File management lists the folder and checksums the agreements (steps 1, 3). Documents extracts written terms, reads notes and runs the verification search (steps 4, 5, 7). Knowledge transcribes recordings (step 5) and saves the ledger after approval (step 9).

## 7. What is your technical approach?

A Markdown-only Skill following the Uliya standard, delegating to three registered experts: file-agent (ug-filesystem), document-agent (ug-document) and knowledge-agent (ug-knowledge). Input: one folder. Analysis is read-only; the single write waits for user approval. No outside service is called and no credentials are held. It uses the NAS's configured model; we do not claim fully local processing. File contents are treated as evidence, never as instructions.

## 8. What is the current development status?

Built: SKILL.md and five references passing the official static checker with no errors or warnings, plus a fictional practice set with its expected ledger. Not built: comparing a new ledger with the previous one. Pending NAS validation: all runtime behaviour, notably transcript start times, formats and saving.

## 9. What is your final validation plan?

Core 1: agreements plus three scripted recordings; at least seven of eight planted commitments found, both contradictions flagged, no invented quotes. Core 2: documents only via the built-in practice run, then a repeat run saving a second ledger without overwriting. Edge: a damaged recording and a note with an embedded "delete the folder" instruction; expected: partial result, nothing deleted.

## 10. What are the known limitations, risks and dependencies?

Results depend on transcription quality; without start times, rows cite the recording only. One folder and ten recordings per run. Not legal advice; recording laws vary. Depends only on the NAS's experts and model.

<!-- END-ANSWERS -->

## Third-party components, licences and data flows

- Third-party components in the package: none. It contains Markdown files only.
- Development tool: UGOS Skill Creation Tool (uliya-skill-kit 0.7.3-en) from the UGREEN Hackathon Starter Kit, used for capability lookup and static checking under UGREEN's Skill Hub terms. It is not part of the package.
- External services: the Skill calls none. Document reading and transcription run through the NAS's registered experts, which may use a local model or a cloud AI service supported by Uliya, depending on how the NAS is configured.
- Data written: one ledger file per run, and a practice folder with two fictional files when requested. Each write waits for user approval.
- Test data: fictional, written for this project.

## AI tools used

- Claude Code (Anthropic): research on the rules, the official tool and existing products; concept development with the team; drafting of the Skill package; static checking; a first draft of this proposal, rewritten by the team.
- ChatGPT (OpenAI): used by the team to explore an alternative concept that was not adopted.

## Team and consent

{{TEAM_BLOCK}}
