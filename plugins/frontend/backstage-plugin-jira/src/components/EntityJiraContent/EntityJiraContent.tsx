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

import Grid from '@material-ui/core/Grid';
import { useEntity } from '@backstage/plugin-catalog-react';
import { JiraOverviewCard } from '../JiraOverviewCard';
import { EntityJiraQueryCard } from '../EntityJiraQueryCard';
import { hasJiraQuery } from '../Router';

/**
 * Body of the Jira entity tab in the new frontend system. Deliberately renders no
 * page shell (`Page`/`Header`/`PageWithHeader`) — the framework's page layout
 * provides it.
 */
export const EntityJiraContent = () => {
  const { entity } = useEntity();

  return (
    <Grid container spacing={3}>
      <Grid item md={12}>
        <JiraOverviewCard />
      </Grid>
      {hasJiraQuery(entity) ? (
        <Grid item md={12}>
          <EntityJiraQueryCard />
        </Grid>
      ) : null}
    </Grid>
  );
};
