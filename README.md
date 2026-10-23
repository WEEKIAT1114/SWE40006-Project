# StudySprint

A responsive student productivity website based on the supplied reference, with the navigation across the **top** of every screen. Each screen is now a separate HTML page.

## Open the website

Double-click **index.html**. No installation, build tools, account, or internet connection is required.

For a local server, open a terminal in this folder and run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000 in your browser. Use the same address each time to keep access to your saved browser data.

## Features

- Dashboard with live statistics, upcoming assignments, study tasks, and weekly activity.
- Assignment manager with search, status tabs, subject and priority filters, sorting, and add/edit/delete actions.
- Calendar with month, week, and list views, date selection, and assignment details.
- Progress overview with completion by subject and daily focus activity.
- Focus timer with start, pause, reset, and adjustable session length. Completed sessions are recorded locally.
- Editable profile and daily focus goal.
- Keyboard shortcuts: `/` focuses search; `Escape` closes dialogs and popovers.
- Responsive layouts, keyboard access, labeled controls, and reduced-motion support.

## Files

- `index.html` — dashboard, welcome banner, statistics, upcoming assignments, study plan, and focus timer.
- `assignments.html` — assignment manager, status tabs, filters, and table.
- `calendar.html` — calendar controls, month/week/list views, and selected-day agenda.
- `progress.html` — subject progress, overall completion, focus activity, and milestones.
- `styles.css` — responsive layout and styling.
- `app.js` — shared application logic, sample data, and dynamic data rendering.
- `storage.js` — shared browser storage, including support for navigation between local HTML files.
- `favicon.svg` — StudySprint icon.

Each HTML file contains its own page layout inside `<main>`. The header, navigation, footer, and shared forms are included in every page so the files can open directly without server-side includes or a build process. Edit a page's HTML to change its layout; `app.js` fills in its changing data such as assignment rows and chart values.

The navigation uses ordinary relative links between the HTML files. The search field filters live on the assignments page. On another page, enter a query and press **Enter** or click the search icon to open the matching assignments.

Sample assignments use dates relative to the first launch. Changes are saved with `localStorage` in the current browser and origin. For direct `file:` access, `storage.js` uses a hidden frame of `index.html` as a common storage location, preserving the original dashboard's saved data and sharing it with the other pages. Some browsers restrict local-file frames or storage; if the app reports a storage problem, use the local server above. The server and local-file modes have separate browser storage.

This is a standalone front-end application: it does not synchronize across devices or send notifications when the page is closed. Focus timer state is saved when starting, pausing, or resetting, and its remaining time is recalculated when navigating or returning to a page. Keep a StudySprint page open to see completion messages. If storage is blocked or full, the app displays a warning and keeps changes in memory for the current page.

## Customize

Change the colors and fonts in the `:root` variables in `styles.css`. Sample content, subjects, and the default profile are defined near the top of `app.js`.
