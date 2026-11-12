# Disclosures

## Third-party components and open source libraries

This package contains Markdown files only. It includes no code, libraries, fonts, images, models or datasets from third parties.

| Item | Source | Licence | How it was used |
|---|---|---|---|
| UGOS Skill Creation Tool (uliya-skill-kit 0.7.3-en) | UGREEN Hackathon Starter Kit | Provided by UGREEN for the Hackathon under its Skill Hub terms | Development tool only: capability catalog lookup and static checking. Not included in this package. |

## Principal functionality developed for this Hackathon

All of the following was newly written during the Hackathon period. No earlier Skill or submission material was reused.

- The said-versus-signed reconciliation workflow: sorting a project folder into a signed side and a said side, extracting written terms and spoken commitments, and matching them.
- The four-status ledger (CONFIRMED, CONTRADICTS, NOT IN WRITING, UNCLEAR) with a quote and a source on both sides of every row.
- The verification pass: a second, independent search of the agreement documents for every row that would otherwise be reported as a contradiction or a gap, with a downgrade to UNCLEAR when the two passes disagree.
- The draft confirmation note.
- The practice run with fictional sample files and an expected ledger.
- The handling of embedded instructions, partial results and repeat runs.

## AI tools used and their principal uses

| Tool | Principal uses |
|---|---|
| Claude Code (Anthropic) | Reading the Hackathon rules and the official tool; research on existing products; developing the concept with the team; drafting the files in this package; running the static checker; a first draft of the proposal for the team to rewrite in its own words. |
| ChatGPT (OpenAI) | Used by the team to explore an alternative concept that was not adopted. No content from it is in this package. |

## External services and data flows

- The Skill delegates only to three registered experts on the NAS: `file-agent`, `document-agent` and `knowledge-agent`.
- The Skill itself calls no outside service, downloads nothing and contains no credentials.
- Document reading and transcription are performed by the platform's experts. Depending on how the NAS is configured, the platform may use a local model or a cloud AI service that Uliya supports. This package does not control that choice and does not claim that processing is fully local.
- The only data the Skill writes is the ledger file, and the practice folder with two fictional files when the user asks for a practice run. Each write waits for the user's approval.

## Test data

All sample and test data is fictional and was written for this project. Use synthetic or anonymised data when testing. Do not test with real personal, confidential or third-party recordings.

## Responsible use

- Use only recordings and documents you are allowed to keep and process. Laws on recording conversations differ between places.
- The ledger is an aid for checking records. It is not legal advice and it does not decide who is right.
- Check each quote against the original recording or document before relying on it.
