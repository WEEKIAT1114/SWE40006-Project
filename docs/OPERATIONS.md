# StudySprint operating and release guide

## Environments

| Environment | Configuration | Data |
| --- | --- | --- |
| Development | `npm start`, http://127.0.0.1:8000 | Your browser's development workspace |
| Automated testing | Playwright starts a separate server on port 8123 and fresh browser contexts | Disposable test workspaces; no access to the development origin's data |
| Production | Contents of `dist/` on the chosen static host | A separate browser workspace for that production origin |

Use one stable address for daily work. `localhost`, `127.0.0.1`, different ports, and different browsers have separate storage. Export/import when moving between them.

## Local commands

Requires Node.js 20+ for tooling. The deployed site itself has no runtime package dependencies.

```powershell
npm ci
npm run check
npm test
npx playwright install chromium firefox
npm run test:browser
npm run build
```

`npm run verify` runs syntax/link checks, unit/storage tests, and packaging. The browser suite is a separate command and is required by both supplied GitHub workflows.

For installed Chrome and Edge on Windows:

```powershell
$env:TEST_EDGE='1'
$env:TEST_CHROME='1'
npm run test:browser -- --project=chromium --project=chrome --project=edge
```

Firefox was downloaded but could not launch in the local Windows verification environment (`spawn UNKNOWN`). Its tests remain configured; run `npm run test:browser -- --project=firefox` on a supported machine or inspect the Linux CI result. Do not label this as a Firefox application failure or a passed compatibility check.

## GitHub CI and release gate

1. Push this project, including `.github/workflows`, `package-lock.json`, scripts, and tests, to the team's repository.
2. The **Validate and test** workflow runs on pushes and pull requests. It validates source/assets, runs unit/storage tests, installs test browsers, runs browser workflows, and packages the site only after success.
3. Open **Actions → Validate and test → selected run** to inspect step logs. Download `browser-test-evidence` for reports/traces and `studysprint-validated-site` for the packaged site.
4. Configure repository branch protection/rulesets to require the `verify` job if merges must also be blocked. This repository file cannot configure those account settings automatically.
5. Demonstrate a failed gate on a temporary pull-request branch by deliberately changing a tested expected value. Keep the resulting real failed workflow screenshot, then revert the deliberate change before merging. Do not submit an intentionally broken main branch.

`npm run demo:gate` provides an additional local demonstration: an invalid backup deliberately fails validation and the script reports packaging/deployment as blocked. It does not create a GitHub run or deploy anything.

## Deploy the static build

The project stays local until you explicitly configure a host and run deployment.

The supplied **Deploy or restore a verified version** workflow supports GitHub Pages:

1. In repository **Settings → Pages**, select GitHub Actions as the build/deployment source.
2. Add environment protections to `github-pages` if your team needs a final deployment approval.
3. In Actions, manually run the deployment workflow with the intended branch, tag, or commit.
4. The packaging job reruns validation, unit tests, and browser tests. The deployment job has `needs: verify-and-package`, so a failed check prevents publication.
5. Record the actual deployment URL returned by the workflow. Verify page navigation, assignment creation/editing, linked task scheduling, JSON backup, and the `RELEASE.json` version at that URL.

If the approved course plan requires Azure, upload the same `dist/` artifact to the selected Azure static hosting service and adapt only the final deployment job using the team's selected service/credentials. An Azure environment has not been provisioned by this local update.

## Restore an earlier application release

1. Export a workspace backup from Profile → Backup & recovery before changing a live version.
2. Identify a previously verified version-2-compatible release tag or commit.
3. Run **Deploy or restore a verified version** with that reference. The same gates run before the earlier artifact is deployed.
4. Verify the deployed `RELEASE.json`, core workflows, and existing data, and retain the real workflow/deployment results.
5. Avoid rolling back to version 1 without a data migration plan: it uses a different persistence mechanism and does not understand the richer version-2 data.

This guide and workflow prepare a rollback procedure. A live production rollback has not been executed locally.

## Workspace backup and recovery

- Export a JSON backup regularly and keep it outside the browser/device.
- Import validates the entire file before committing any changes. Merge keeps current records when IDs match; replace restores the imported workspace and resets its active timer.
- Before a valid mutation, IndexedDB stores the previous valid workspace as one recovery snapshot. **Restore previous snapshot** recovers that single preceding version. It is not an unlimited history or an external backup.
- Invalid legacy data is not overwritten with sample records. The recovery panel can export the original content, import a valid backup, or restore an available snapshot.
- Version 1 coursework is migrated to version 2 on first use of the same origin. The legacy localStorage key is retained. After migration, version-2 saves use IndexedDB.
- An old edit form cannot silently overwrite a newer edit to the same record. A conflict message asks the user to reopen and review that record. Independent updates are merged against the latest committed state.

## Reminders, timers, and limits

In-app reminder stages support 7, 3, 1, and 0 days before a deadline, plus overdue warnings. Read state resets naturally when a reminder advances to a new stage or its deadline changes. These are not email, SMS, push, or closed-page reminders.

Focus sessions save absolute end times. A late completion after reopening is credited to its actual end date. Focus time is recorded once by timer ID in the transaction, even if two tabs try to complete it. Break time does not count as study time. A completed focus session offers a short or periodic long break.

Only completed focus sessions contribute study minutes; partially completed/reset sessions are not counted as completed study time. User assignment status remains explicit: linked tasks and checklists inform progress but do not automatically change it.

## Evidence to retain for SWE40006

- Real unit and browser execution results and screenshots.
- A real passing and deliberately failing CI run, with the failed release gate visible.
- Environment configuration and the actual production URL/version.
- Deployment/host logs and the selected platform's monitoring evidence.
- A real rollback run and post-rollback functional checks.

The local evidence folder records only work actually performed. Public deployment, remote CI, production monitoring, and production rollback remain separate operational steps.
