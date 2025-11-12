# Agent Onboarding

This repository ships with extensive API documentation under the `docs/` directory.
Before working on the application UI, make sure you understand the API surface that
the UI needs to expose.

## How to self-orient
- Read `docs/introduction.md` to get the high-level overview of the platform.
- Review the `docs/api.md` for endpoint details, payloads, and usage patterns.
- Inspect the examples in `docs/exemples/` to see end-to-end request and response flows.
- Keep notes on required parameters, error handling, authentication, and any rate limits the UI must respect.
- **Consult `project-manager/general-objectives.md` for the overarching goals of the project.**
- **Refer to `project-manager/styling-guide.md` for UI/UX principles and design consistency.**
- When adding or updating UI features, cross-check that every API interaction traces back to the documented behavior.

## Working guidelines
- Treat the Markdown docs as the source of truth—ask the user only when documentation is unclear or incomplete.
- Surface undocumented gaps or inconsistencies you discover while implementing features.
- Align component naming, user-facing labels, and validation messages with terminology used in the docs.
- Add follow-up documentation updates whenever UI changes require API documentation adjustments.
- **Maintain `project-manager/tasks.md` diligently:**
    - On every run, read and update the `tasks.md` file.
    - Add new tasks as checkboxes under the "Planned" section.
    - Move tasks from "Planned" to "On Progress" when you start working on them.
    - Move tasks from "On Progress" to "Done" when they are completed.
    - Ensure completed tasks are checked `[x]`.
    - Provide concise, descriptive task names.
