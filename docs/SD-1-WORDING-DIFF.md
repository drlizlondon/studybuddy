# SD-1 wording diff (before | after)

Every line of wording that changed in SD-1, for the founder to approve before landing. Nothing else in the data files changed: `node scripts/check-wording-diff.mjs` compares the base commit `b8190052` with the current files and fails on any changed line that is not in this table.

Identifier-only renames are not wording and are not listed: `averyLine` to `pipLine`, `requiresUserAnswer` to `waitsForAnswer`, `AVERY_*` to `PIP_*`, file names `averySequences.ts` to `pipSequences.js` and `averyThreads.ts` to `pipThreads.js`.

## 1. Lines about exams, revision, studying, portfolios, interviews, applications (`pipSequences.js`, `pipThreads.js`)

15 rows. The spec expected about 11. Four rows go slightly beyond the named ones, because they are about studying as school: the thread id `dont-want-to-revise` (needed so the D1 grep is clean), "while we study", "not a study plan" and "while you study". Drop any of them and I will restore the original line.

| Before | After |
|---|---|
| Your exam does not need panic from you. It needs small, repeated contact. | Your deadline does not need panic from you. It needs small, repeated contact. |
| Should I play some music while we study? | Should I play some music while we work? |
| dont-want-to-revise | dont-want-to-work |
| I don't want to revise anymore | I don't want to work on this anymore |
| Thank you for being honest. If stopping is avoidance, we do one more small block. I am doing one awkward interview question too. | Thank you for being honest. If stopping is avoidance, we do one more small block. I am doing one awkward email too. |
| Good. We are not trying to rescue the whole day. I will do the next section of my application with you. | Good. We are not trying to rescue the whole day. I will do the next section of my report with you. |
| I'm scared I won't pass | I'm scared I won't get it done |
| You can be scared and still keep going gently. That fear is loud, but it is not a study plan. | You can be scared and still keep going gently. That fear is loud, but it is not a plan. |
| Yes. Your exam does not need panic from you. It needs small, repeated contact. My exam notes are messy too. | Yes. Your deadline does not need panic from you. It needs small, repeated contact. My notes are messy too. |
| Passing is built in small, boring blocks. This can be one of them. | Getting it done is built in small, boring blocks. This can be one of them. |
| Open it, name the first ugly step, and do only that. I am doing the hardest portfolio paragraph with you. | Open it, name the first ugly step, and do only that. I am doing the hardest paragraph with you. |
| A clean ending is part of studying well. | A clean ending is part of working well. |
| Write the next physical action, not the whole outcome. My application is only one paragraph right now. | Write the next physical action, not the whole outcome. My report is only one paragraph right now. |
| Just open it. No promise to finish. I will open my interview notes at the same time. | Just open it. No promise to finish. I will open my notes at the same time. |
| You are allowed to be a person while you study. | You are allowed to be a person while you work. |

## 2. UI strings in `main.jsx` that are about studying (before | after)

| Before | After |
|---|---|
| How long are we studying today? | How long are we working today? |
| Finish revising Chapter 6 and complete end of chapter questions. | Read the report and write three notes on it. |
| Study duration | Work duration |
| Study session | Work session |
| You studied for N minutes. | You worked for N minutes. |
| Revision piano | Piano |
| Stay focused on today's study goal. | (removed: a blank task stays blank and is saved as an empty string, never filled with a made-up task) |

## 3. Name and pronoun changes (Avery to Pip), `main.jsx`

| Before | After |
|---|---|
| Avery | Pip |
| Avery's task | Pip's task |
| Avery completed N% of her task. | Pip finished N% of his task. |
| Avery's vibe | Pip's vibe |
| Talk to Avery | Talk to Pip |
| Tell Avery when you're back | Tell Pip when you're back |
| Should Avery suggest breaks? | Should Pip suggest breaks? |
| 10-minute push · stay with Avery. | 10-minute push · stay with Pip. |
| Avery response size | Pip response size |
| Close Avery conversation | Close Pip conversation |
| Close Avery options | Close Pip options |

## 4. Pip's own task (SD-1c), replaces `AVERY_TASKS`

| Before | After |
|---|---|
| Finish my portfolio section. | Reading a long report and making notes. |
| Review my interview notes. | Sorting my inbox into three piles. |
| Complete my application draft. | Writing a thank-you letter. |
| Revise my weak topics. | Tidying my notes from this week. |
| Finish my deadline plan. | Reading two chapters of my book. |
| Practise my exam questions. | Planning next week's meals. |

## 5. New lines (SD-1e closing question), marked new

| Before | After |
|---|---|
| new | Did you finish what you set out to do? |
| new | Did you get done what you wanted to? |
| new | Yes |
| new | Part of it |
| new | Not this time |
| new | You did what you said you'd do. That's the whole thing. |
| new | Part of it is real progress. Next time we start from there. |
| new | That's honest. Starting again is the skill, and you've practised it. |

## 6. New accessible names for Pip's scene (SD-1b), marked new

| Before | After |
|---|---|
| new | Pip at his desk, settling in |
| new | Pip at his desk, reading |
| new | Pip at his desk, writing |
| new | Pip at his desk, turning to you |
| new | Pip at his desk, taking a break |
| new | Choose your view |
| new | Swiss summer |
| new | Country views |
| new | Future office |

Removed with the quiz (SD-1a, not rewritten): the "Test me" and "Revision score" buttons and every quiz and NotebookLM line.
