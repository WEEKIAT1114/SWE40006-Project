# Where to find the code

Use **Ctrl + Shift + F** in VS Code to search the whole project. The search terms below also appear in comments beside the relevant code. Use **Ctrl + Shift + O** inside a JavaScript file to jump to a function.

| What you want to change                 | Main files                                         | Search for                                                    |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Dashboard cards and totals              | `index.html`, `app.js`, `js/progress.js`           | `Dashboard page`, `Dashboard totals`                          |
| Assignment form and validation          | The four HTML pages, `app.js`, `js/assignments.js` | `Assignment form`, `Assignment save`, `Assignment validation` |
| Assignment search and filters           | `assignments.html`, `app.js`                       | `Assignment filters`, `filteredAssignments`                   |
| Study tasks and scheduling              | `app.js`, `js/tasks.js`                            | `Task form`, `Task save`, `Task views`                        |
| Month, week, and list calendar          | `calendar.html`, `app.js`                          | `Calendar events`, `renderCalendar`                           |
| Focus timer and breaks                  | `index.html`, `app.js`, `js/timer.js`              | `Focus timer`, `Timer controls`, `Session completion`         |
| Charts and completion statistics        | `progress.html`, `app.js`, `js/progress.js`        | `Progress page`, `Weekly activity`, `Assignment effort`       |
| Deadline notifications                  | `app.js`, `js/reminders.js`                        | `Deadline reminders`, `Reminder list`                         |
| Profile and preferences                 | The four HTML pages, `app.js`, `js/model.js`       | `Profile and preferences`, `Preference save`                  |
| Export, import, and recovery            | `app.js`, `js/model.js`, `storage.js`              | `Backup files`, `Backup import`, `Recovery`                   |
| Browser storage and tab synchronization | `storage.js`, `app.js`                             | `Atomic updates`, `Change notifications`, `Cross-tab updates` |
| Older saved-data migration              | `js/model.js`                                      | `Legacy migration`, `Workspace validation`                    |
| Colours, fonts, and responsive layout   | `styles.css`                                       | `Theme variables`, a component name, or `Responsive layout`   |
| Build output and file checks            | `scripts/build.cjs`, `scripts/check.cjs`           | `Public assets`, `Release manifest`, `HTML checks`            |

## How the files work together

Each HTML file supplies its page layout and the shared dialogs. Its `data-page` value tells `app.js` which page to render. Buttons with `data-action` values are handled by the page actions in `app.js`.

`app.js` reads form values and renders the interface. The files in `js/` contain validation and calculations. `js/model.js` applies workspace changes, and `storage.js` saves them in IndexedDB.

The shared dialogs appear in all four HTML files because each page opens independently. When changing a common form field, update the corresponding dialog in every page.

`styles.css` starts with base styles and contains later component refinements and media queries. Search all occurrences of a selector when changing its appearance, because a later rule may override an earlier one.

Edit the source files, then run `npm run build` to refresh `dist/`. That folder is generated from the source. Run `npm run format:check` and `npm run verify` before committing.
