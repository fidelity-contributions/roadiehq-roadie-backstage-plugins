/*
 * Copyright 2023 Larder Software Limited
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
  ContainerRunner,
  DockerContainerRunner,
  loggerToWinstonLogger,
} from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { TemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  createBuiltinActions,
  createRouter,
} from '@backstage/plugin-scaffolder-backend';
import { createHttpBackstageAction } from '@roadiehq/scaffolder-backend-module-http-request';
import {
  createAppendFileAction,
  createJSONataAction,
  createJsonJSONataTransformAction,
  createMergeAction,
  createMergeJSONAction,
  createParseFileAction,
  createSerializeJsonAction,
  createSerializeYamlAction,
  createSleepAction,
  createWriteFileAction,
  createYamlJSONataTransformAction,
  createZipAction,
} from '@roadiehq/scaffolder-backend-module-utils';
import {
  createAwsS3CpAction,
  createEcrAction,
} from '@roadiehq/scaffolder-backend-module-aws';
import Docker from 'dockerode';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { ScmIntegrations } from '@backstage/integration';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/plugin-permission-common';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { Logger } from 'winston';

export const createActions = (options: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
  config: Config;
  containerRunner: ContainerRunner;
  catalogClient: CatalogClient;
  discovery: DiscoveryApi;
}): TemplateAction<any>[] => {
  const { reader, integrations, config, catalogClient, discovery } = options;
  const defaultActions = createBuiltinActions({
    reader,
    integrations,
    catalogClient,
    config,
  });

  return [
    createZipAction(),
    createSleepAction(),
    createWriteFileAction(),
    createAppendFileAction(),
    createMergeJSONAction({}),
    createMergeAction(),
    createAwsS3CpAction(),
    createEcrAction(),
    createParseFileAction(),
    createSerializeYamlAction(),
    createSerializeJsonAction(),
    createJSONataAction(),
    createYamlJSONataTransformAction(),
    createJsonJSONataTransformAction(),
    createHttpBackstageAction({ discovery }),
    ...defaultActions,
  ];
};

export default async function createPlugin({
  logger,
  config,
  database,
  reader,
  discovery,
}: PluginEnvironment): Promise<Router> {
  const dockerClient = new Docker();
  const containerRunner = new DockerContainerRunner({ dockerClient });

  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const winstonLogger =
    logger instanceof Logger ? logger : loggerToWinstonLogger(logger);

  return await createRouter({
    logger: winstonLogger,
    config,
    database,
    catalogClient,
    reader,
    actions: createActions({
      reader,
      integrations: ScmIntegrations.fromConfig(config),
      config,
      discovery,
      catalogClient: catalogClient,
      containerRunner: containerRunner,
    }),
  });
}
