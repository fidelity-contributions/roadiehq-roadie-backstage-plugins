---
'@roadiehq/backstage-plugin-jira': minor
---

Add new frontend system support via a new `/alpha` entry point, keeping the old frontend system exports untouched.

The alpha plugin provides the Jira client as an `ApiBlueprint` extension, the three entity cards as `EntityCardBlueprint` extensions (`entity-card:jira/overview`, `entity-card:jira/activity-stream`, `entity-card:jira/query`), and a ready-made `/jira` tab as an `EntityContentBlueprint` extension (`entity-content:jira`). Cards carry the annotation filters that previously had to be wired up in the app with `EntitySwitch`, and the tab is shipped disabled so that installing the plugin never adds a tab an adopter did not ask for.

`HomePageMyJiraTicketsCard` is not part of the alpha entry point yet: it needs `HomePageWidgetBlueprint`, which requires Backstage 1.48 or above.

Note that this adds an `exports` field to the package, which stops deep imports into `dist/` from resolving.
