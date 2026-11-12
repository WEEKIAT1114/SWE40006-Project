# Verification record — 27 October 2026

This record describes local execution, not a remote CI or production certification.

| Check                                                        | Actual result                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| JavaScript syntax, HTML IDs/navigation/assets                | Passed                                                                                                          |
| Domain and IndexedDB regression tests                        | 36 passed, 0 failed                                                                                             |
| Chromium browser workflows                                   | 10 passed                                                                                                       |
| Installed Google Chrome browser workflows                    | 10 passed                                                                                                       |
| Installed Microsoft Edge browser workflows                   | 10 passed                                                                                                       |
| Firefox browser workflows                                    | Could not run: the downloaded Firefox executable failed to launch (`spawn UNKNOWN`) in this Windows environment |
| Final Undo + desktop/mobile regression rerun                 | 6 passed across Chromium, Chrome, and Edge                                                                      |
| Static production packaging                                  | Passed; 15 public files and a release checksum manifest                                                         |
| Local intentionally failed validation gate                   | Expected validation failure; packaging and deployment blocked by the local demonstration                        |
| Live GitHub Actions, hosting, production monitoring/rollback | Not executed by this local update                                                                               |

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

## Code cleanup — 5 November 2026

- Formatting and static checks passed.
- All 38 unit, storage, and report-portability tests passed.
- All 10 Chromium browser workflows passed, including desktop/mobile layout checks. Both screenshots were visually reviewed.
- The production build passed with 15 static files and a release checksum manifest.
- Historical report outcomes and timings were retained while machine-specific project paths were made relative.

Current evidence: [checks and build](evidence/cleanup-checks.txt) and [Chromium browser results](evidence/cleanup-browser-results.json). Other browser results above describe the earlier verification run.

## File organization — 12 November 2026

- JavaScript moved into `assets/js/`, CSS into `assets/css/`, and the favicon into `assets/images/`. The changelog is now in `docs/`.
- The four HTML pages and launcher retain their original locations. Script order, navigation paths, storage keys, and application behavior are preserved.
- Build, local-server, validation, test, and CI artifact paths were updated. Browser output now goes into `reports/`; the previous HTML report is preserved in `reports/archive/before-organization/playwright/`.
- Formatting and static asset/navigation checks passed, along with all 38 unit/storage/report tests and all 10 Chromium workflows.
- All 15 production files matched their release checksums. All four built pages loaded under `/blue/` in Chromium at a mobile viewport with no script errors or failed resource requests. The source server served every linked asset and continued to reject requests for development files and reports.
- Desktop and mobile screenshots from the workflow tests were visually reviewed. Firefox, remote CI, and production deployment were not rerun for this organization change.

Evidence: [organization checks](evidence/organization-checks.txt) and [Chromium results](evidence/organization-browser-results.json).
