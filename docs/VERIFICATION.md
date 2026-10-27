# Verification record — 27 October 2026

This record describes local execution, not a remote CI or production certification.

| Check | Actual result |
| --- | --- |
| JavaScript syntax, HTML IDs/navigation/assets | Passed |
| Domain and IndexedDB regression tests | 36 passed, 0 failed |
| Chromium browser workflows | 10 passed |
| Installed Google Chrome browser workflows | 10 passed |
| Installed Microsoft Edge browser workflows | 10 passed |
| Firefox browser workflows | Could not run: the downloaded Firefox executable failed to launch (`spawn UNKNOWN`) in this Windows environment |
| Final Undo + desktop/mobile regression rerun | 6 passed across Chromium, Chrome, and Edge |
| Static production packaging | Passed; 15 public files and a release checksum manifest |
| Local intentionally failed validation gate | Expected validation failure; packaging and deployment blocked by the local demonstration |
| Live GitHub Actions, hosting, production monitoring/rollback | Not executed by this local update |

## Browser workflows exercised

1. Create/edit an assignment, update its deadline/checklist, complete it, reload, and check dashboard/progress.
2. Schedule a task, link it to an assignment, find it in Calendar, edit/reschedule it, and complete it.
3. Keep past unfinished work visible; cancel deletion, confirm deletion, and Undo.
4. Save a form while another tab creates an assignment; retain both changes.
5. Display overdue reminders, mark them read, add a custom subject, and filter overdue work.
6. Export JSON and import it in a fresh browser context.
7. Complete a linked focus session once, offer a break, and retain recorded minutes after reload.
8. Check desktop/mobile layout widths, keyboard search access, and month/week/list calendar modes.
9. Recover a deleted record from the previous snapshot through the settings UI.
10. Migrate legacy version-1 records without overwriting coursework with sample data.

The unit/storage suite additionally covers invalid inputs, exact dates, stale same-record conflicts, atomic concurrent saves, concurrent timer completion, import validation, merge behavior, corrupt-data handling, sample-data removal, restored completion history, and restriction of the local-file bridge on hosted pages.

## Retained evidence

- [Unit/check/build log](evidence/unit-check-build.txt)
- [Full browser result JSON](evidence/browser-results.json): includes 30 application passes and the 10 Firefox launch errors; these errors have not been hidden or labeled as passes.
- [Final targeted browser results](evidence/final-targeted-browser-results.json)
- [Local gate demonstration](evidence/gate-demo.txt)
- [Desktop screenshot](evidence/dashboard-desktop.png)
- [Mobile screenshot](evidence/dashboard-mobile.png)

The browser tests use disposable browser contexts and a local server on port 8123. Existing daily-use browser data was not modified. Screenshots use explicitly loaded, labeled sample records.

## Remaining verification

Run the Firefox suite on a supported environment and retain its actual results. After configuring the team's repository/host, retain real passing/failing CI runs, the public deployment URL, production monitoring evidence, and a real rollback execution. Direct local-file iframe behavior is browser-dependent; the localhost server is the tested and recommended path.
