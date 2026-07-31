/*
 * Copyright 2026 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ApiBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { JiraAPI, jiraApiRef } from './api';
import { hasJiraQuery, isJiraAvailable } from './components/Router';

/**
 * @alpha
 */
export const jiraApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: jiraApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, fetchApi }) =>
        new JiraAPI({ discoveryApi, configApi, fetchApi }),
    }),
});

/**
 * @alpha
 */
export const entityJiraOverviewCard = EntityCardBlueprint.make({
  name: 'overview',
  params: {
    type: 'content',
    filter: isJiraAvailable,
    loader: () =>
      import('./components/JiraOverviewCard').then(m => <m.JiraOverviewCard />),
  },
});

/**
 * @alpha
 */
export const entityJiraActivityStreamCard = EntityCardBlueprint.make({
  name: 'activity-stream',
  params: {
    type: 'content',
    filter: isJiraAvailable,
    loader: () =>
      import('./components/EntityJiraActivityStreamCard').then(m => (
        <m.EntityJiraActivityStreamCard />
      )),
  },
});

/**
 * @alpha
 */
export const entityJiraQueryCard = EntityCardBlueprint.make({
  name: 'query',
  params: {
    type: 'content',
    filter: hasJiraQuery,
    loader: () =>
      import('./components/EntityJiraQueryCard').then(m => (
        <m.EntityJiraQueryCard />
      )),
  },
});

/**
 * A ready-made Jira tab, equivalent to the composition documented in the README
 * for the old frontend system. Shipped disabled so that installing this plugin
 * never adds a tab an adopter did not ask for: enable it with
 * `entity-content:jira: true` under `app.extensions` in app-config.
 *
 * @alpha
 */
export const entityJiraContent = EntityContentBlueprint.make({
  disabled: true,
  params: {
    path: '/jira',
    title: 'Jira',
    filter: isJiraAvailable,
    loader: () =>
      import('./components/EntityJiraContent').then(m => (
        <m.EntityJiraContent />
      )),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'jira',
  extensions: [
    jiraApi,
    entityJiraOverviewCard,
    entityJiraActivityStreamCard,
    entityJiraQueryCard,
    entityJiraContent,
  ],
  // Same flag as the old frontend system plugin: shows the linked pull requests
  // column in the Jira tickets table (Jira Data Center only).
  featureFlags: [{ name: 'jira-show-linked-prs' }],
});
