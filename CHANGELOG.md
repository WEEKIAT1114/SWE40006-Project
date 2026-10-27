# Changelog

## 2.0.0 — 27 October 2026

- Preserved the four-page purple interface and top navigation.
- Added assignment due times, effort estimates, custom subjects, and completion checklists.
- Added task editing, scheduled dates and times, priorities, assignment links, history, and overdue carry-forward visibility.
- Connected calendar events, task focus actions, recorded study time, and assignment progress.
- Added configurable in-app deadline reminders and derived overdue warnings that do not change saved statuses.
- Added focus/break modes and atomic, exactly-once session recording across tabs.
- Added dashboard totals, planned/completed task trends, time by subject, and assignment effort summaries.
- Replaced full-object browser writes with serialized IndexedDB transactions and record revision conflict checks.
- Added migration from version 1, strict backup validation, JSON export/import, previous-snapshot recovery, and explicit sample-data controls.
- Restricted the local-file bridge to opaque file origins and removed its hosted cross-origin message interface.
- Improved text contrast, type sizes, mobile navigation, keyboard access, and touch controls.
- Added domain modules, unit/storage tests, Playwright workflows, build checksums, CI, and manually triggered gated deployment/rollback configuration.

Live GitHub Actions execution, public hosting, and production monitoring require repository/hosting setup; local test results do not stand in for that evidence.
