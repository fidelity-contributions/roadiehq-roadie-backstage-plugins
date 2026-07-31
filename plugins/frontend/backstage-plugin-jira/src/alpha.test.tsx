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

import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { AnyApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { MockFetchApi, setupRequestMockHandlers } from '@backstage/test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { JiraAPI, jiraApiRef } from './api';
import {
  entityJiraActivityStreamCard,
  entityJiraContent,
  entityJiraOverviewCard,
  entityJiraQueryCard,
} from './alpha';
import {
  activityResponseStub,
  entityStub,
  projectResponseStub,
  searchResponseStub,
  statusesResponseStub,
} from './responseStubs';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const fetchApi = new MockFetchApi();
const configApi = new ConfigReader({});

const apis: [AnyApiRef, Partial<unknown>][] = [
  [jiraApiRef, new JiraAPI({ discoveryApi, configApi, fetchApi })],
];

const entityWithJqlStub = {
  ...entityStub,
  metadata: {
    ...entityStub.metadata,
    annotations: {
      ...entityStub.metadata.annotations,
      'jira/all-issues-jql': 'project = {{ projectKey }}',
    },
  },
};

const renderExtension = (
  extension: Parameters<typeof createExtensionTester>[0],
  entity: typeof entityStub = entityStub,
) =>
  renderInTestApp(
    <TestApiProvider apis={apis}>
      <EntityProvider entity={entity}>
        {createExtensionTester(extension).reactElement()}
      </EntityProvider>
    </TestApiProvider>,
  );

describe('alpha extensions', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    jest.resetAllMocks();
    worker.use(
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/project/BT',
        (_, res, ctx) => res(ctx.json(projectResponseStub)),
      ),
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search/jql',
        (_, res, ctx) => res(ctx.json(searchResponseStub)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/project/BT/statuses',
        (_, res, ctx) => res(ctx.json(statusesResponseStub)),
      ),
      rest.get('http://exampleapi.com/jira/api/activity', (_, res, ctx) =>
        res(ctx.xml(activityResponseStub)),
      ),
    );
  });

  it('renders the overview card', async () => {
    const rendered = await renderExtension(entityJiraOverviewCard);

    expect(await rendered.findByText(/backstage-test/)).toBeInTheDocument();
  });

  it('renders the activity stream card', async () => {
    const rendered = await renderExtension(entityJiraActivityStreamCard);

    expect(await rendered.findByText('Activity Stream')).toBeInTheDocument();
    expect(
      await rendered.findByText(
        /changed the status to Selected for Development/,
      ),
    ).toBeInTheDocument();
  });

  it('renders the query card from the jira/all-issues-jql annotation', async () => {
    const rendered = await renderExtension(
      entityJiraQueryCard,
      entityWithJqlStub,
    );

    expect(await rendered.findByText('Issues')).toBeInTheDocument();
  });

  it('renders the entity content with both the overview and the query card', async () => {
    const rendered = await renderExtension(
      entityJiraContent,
      entityWithJqlStub,
    );

    expect(await rendered.findByText(/backstage-test/)).toBeInTheDocument();
    expect(await rendered.findByText('Issues')).toBeInTheDocument();
  });
});
