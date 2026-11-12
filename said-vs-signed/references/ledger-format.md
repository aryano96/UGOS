# Ledger format

Use this layout at step 8 and for the saved file at step 9. Write plain Markdown. Replace each value in braces with a real value; if a value was not returned by an expert, write "not available".

## Layout

    # Said vs Signed ledger
    
    Project folder: {PROJECT_FOLDER}
    Run date: {RUN_DATE}
    Result: COMPLETE or PARTIAL
    
    ## Summary
    
    CONTRADICTS: {N} | NOT IN WRITING: {N} | UNCLEAR: {N} | CONFIRMED: {N}
    
    ## Statements
    
    ### S1 - CONTRADICTS
    
    - Said: "{EXACT SPOKEN QUOTE}"
      - Speaker: {SPEAKER LABEL}
      - Source: {FILE PATH}, {START TIME OR LOCATION}
      - Kind: promise, request, change or gives up
    - Signed: "{EXACT WRITTEN SENTENCE}" or no matching term found
      - Source: {FILE PATH}, {PAGE OR SECTION}
    - Reason: {ONE SENTENCE}
    - To check: listen at {START TIME}; read {PAGE OR SECTION}
    
    (one block per statement, ordered CONTRADICTS, NOT IN WRITING, UNCLEAR, CONFIRMED)
    
    ## Sources read
    
    Agreement documents:
    - {FILE PATH} | SHA-256: {CHECKSUM} | {NOTE, for example: marked draft}
    
    Spoken sources:
    - {FILE PATH} | recording or notes | {QUALITY NOTE FROM THE EXPERT}
    
    ## Sources not read
    
    - {FILE PATH} | {REASON}
    
    ## Draft confirmation note
    
    {NOTE TEXT}
    
    ## Embedded instructions not followed
    
    - {FILE PATH}, {LOCATION}: "{WORDS}"
    
    ## Limits of this run
    
    - Check each quote against the original before relying on it. This is not legal advice.
    - {ANY OTHER LIMIT, for example: start times were not available for recording X}

Leave out "Sources not read" and "Embedded instructions not followed" when they are empty.

## Short table for the chat

Before the detailed blocks, show a table so the user sees the result at a glance.

| No. | Status | Said | Signed | Source of the spoken words |
|---|---|---|---|---|
| S1 | CONTRADICTS | "Three rounds of revisions is fine." | "Two rounds of revisions are included." | call-2 recording, 04:31 |

## Draft confirmation note

The note lists only CONTRADICTS and NOT IN WRITING rows. Keep it neutral: state what was said, where the paperwork differs or is silent, and ask for written confirmation. Do not accuse, and do not state what the outcome should be.

    Subject: Confirming points from our recent conversations
    
    Hello {NAME IF THE USER GAVE ONE},
    
    While reviewing our project records I found points we discussed that are not
    reflected in the signed documents. Could you confirm each in writing?
    
    1. On {DATE OR "a recent call"} it was said: "{QUOTE}". The agreement states:
       "{CLAUSE}". Which should apply?
    2. On {DATE OR "a recent call"} it was said: "{QUOTE}". I could not find this
       in the agreement. Can we add it in writing?
    
    Thank you.

The Skill only drafts this note. It never sends it.
