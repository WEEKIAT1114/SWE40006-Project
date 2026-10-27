# StudySprint 2.0

Student Study Planner & Assignment Deadline Tracker. A four-page, browser-local application that connects assignments, scheduled study tasks, focus sessions, and progress. The purple interface, top navigation, and Student profile are preserved.

## Open the website

Keep using the same browser and address as before so the existing workspace can migrate automatically. If your current server is already running, refresh it after the update.

For a new local session, double-click **Start StudySprint.cmd**, or run:

```powershell
node scripts/serve.cjs
```

Open **http://127.0.0.1:8000**. The runtime uses Node's built-in modules; no package installation is required just to serve the website. If you prefer Python:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Directly opening `index.html` is supported through a file-only storage bridge where the browser permits it. Local-file frames/storage vary between browsers; the stable local server is the recommended daily-use setup. Different addresses, ports, browsers, and file/server modes have separate data.

## Connected student workflow

1. Create an assignment with a subject, deadline/time, priority, effort estimate, and checklist.
2. Use its calendar icon in Assignments to plan linked study tasks across different dates.
3. View today plus unfinished past tasks, upcoming work, all tasks, or completed history on Dashboard.
4. Start a linked focus session from a task or assignment. Complete a focus session, then take a short or longer break.
5. Review task/checklist completion, recorded focus minutes, estimates, reminders, and progress across all four pages.

Assignment status is explicit: finishing a checklist or study task does not unexpectedly mark the assignment completed.

## Features

- Full assignment CRUD, custom subjects, deadline time, estimated hours, and editable completion checklist.
- Full study-task CRUD, scheduling/rescheduling, time, priority, assignment links, completion, and history.
- Month/week/list calendar with both study tasks and assignment deadlines.
- Dashboard totals, derived overdue warnings, linked task counts, and recorded study time.
- Configurable in-app reminders at 7, 3, 1, and 0 days, plus overdue warnings.
- Focus, short-break, and long-break modes with linked context and exactly-once completion across tabs.
- Progress by subject, planned/completed task trends, assignment effort, and focus minutes.
- JSON export/import with preview, merge/replace options, strict validation, and a previous-snapshot recovery action.
- IndexedDB transactions and record revisions prevent unrelated multi-tab edits from replacing each other and reject stale edits to the same record.
- Version-1 data migration; invalid saved data is not silently replaced with demo records.
- Optional labeled samples, clear-sample controls, confirmation and Undo for record deletion.
- Larger text, stronger contrast, responsive navigation, keyboard shortcuts, and accessible labels.

## Settings and backup

Click the Student avatar/name to edit profile, focus goals, break preferences, reminder intervals, subjects, and backup/recovery options. Export backups regularly and keep a copy outside the browser. Only one previous valid mutation snapshot is retained automatically; it is not an external backup.

Sample records are opt-in. Existing version-1 records remain intact and unmarked because the app cannot safely infer whether previously edited records are demonstration data or coursework. Clear sample records removes only records explicitly labeled Sample.

## Testing and build

For development tooling, install Node.js 20+ and run:

```powershell
npm ci
npm run verify
npx playwright install chromium firefox
npm run test:browser
npm run demo:gate
```

Unit/storage tests use Node's test runner and fake-indexeddb. Browser tests use Playwright. `npm run build` creates a dependency-free static site in `dist/` and a SHA-256 release manifest. `node_modules` is not part of the website or source delivery; `npm ci` restores test dependencies.

Chromium, installed Google Chrome, and installed Microsoft Edge passed the local workflow suite. Firefox could not launch in the local Windows environment; its tests remain configured for another supported environment/CI. See [verification evidence](docs/VERIFICATION.md) for exact results and limitations.

## Project structure

- `index.html`, `assignments.html`, `calendar.html`, `progress.html`: each page's own layout and shared forms.
- `app.js`: application controller, page rendering, and user interactions.
- `js/utils.js`, `assignments.js`, `tasks.js`, `timer.js`, `progress.js`, `reminders.js`, `model.js`: domain logic, validation, migration, and atomic operations.
- `storage.js`: IndexedDB repository and restricted local-file bridge.
- `styles.css`, `favicon.svg`: appearance and branding.
- `tests/`: unit/storage regression tests and browser workflows.
- `scripts/`: local server, static checks, packaging, and a local failed-gate demonstration.
- `.github/workflows/`: push/PR checks and manually triggered gated deployment/rollback.
- `docs/OPERATIONS.md`: environment, logs, hosting, recovery, rollback, and evidence instructions.
- `CHANGELOG.md`: version history.

## Deployment and limitations

The supplied workflows are ready to commit to the team's repository. They have not been run on GitHub or used to publish a production site by this local update. The manual deployment workflow supports GitHub Pages; see [operations](docs/OPERATIONS.md) if the approved team hosting plan requires Azure instead.

Data remains in the browser; accounts and cloud synchronization are not included. Reminders update while the website is open. Email/SMS/push and reliable closed-page reminders need additional infrastructure. Only completed focus sessions contribute recorded study minutes. Local tests do not certify every browser, device, or production environment.
