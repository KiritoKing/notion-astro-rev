import { Client, isFullPage, iteratePaginatedAPI } from '@notionhq/client';
import type { RehypePlugins } from 'astro';
import type { Loader } from 'astro/loaders';
import { propertiesSchemaForDatabase } from './database-properties.js';
import { buildProcessor, NotionPageRenderer, type RehypePlugin } from './render.js';
import { notionPageSchema } from './schemas/page.js';
import type { ClientOptions, QueryDatabaseParameters } from './types.js';
import * as path from 'node:path';
import { VIRTUAL_CONTENT_ROOT } from './image.js';

export interface NotionLoaderOptions
  extends Pick<ClientOptions, 'auth' | 'timeoutMs' | 'baseUrl' | 'notionVersion' | 'fetch' | 'agent'>,
    Pick<QueryDatabaseParameters, 'database_id' | 'filter_properties' | 'sorts' | 'filter' | 'archived'> {
  /**
   * Pass rehype plugins to customize how the Notion output HTML is processed.
   * You can import and apply the plugin function (recommended), or pass the plugin name as a string.
   */
  rehypePlugins?: RehypePlugins;
  /**
   * The path to save the images.
   * Defaults to 'public'.
   */
  publicPath?: string;
  /**
   * MUST STORED IN `src` TO BE PROCESSED PROPERLY
   * The path to save the images relative to `src`.
   * Defaults to 'assets/images/notion'.
   */
  imageSavePath?: string;
  /**
   * Whether to cache images in the data.
   * Defaults to `false`.
   */
  experimentalCacheImageInData?: boolean;
  /**
   * The root alias for the images.
   * Defaults to `src`.
   */
  experimentalRootSourceAlias?: string;
}

const DEFAULT_IMAGE_SAVE_PATH = 'assets/images/notion';

/**
 * Notion loader for the Astro Content Layer API.
 *
 * It allows you to load pages from a Notion database then render them as pages in a collection.
 *
 * @param options Takes in same options as `notionClient.databases.query` and `Client` constructor.
 *
 * @example
 * // src/content/config.ts
 * import { defineCollection } from "astro:content";
 * import { notionLoader } from "notion-astro-loader";
 *
 * const database = defineCollection({
 *   loader: notionLoader({
 *     auth: import.meta.env.NOTION_TOKEN,
 *     database_id: import.meta.env.NOTION_DATABASE_ID,
 *     filter: {
 *       property: "Hidden",
 *       checkbox: { equals: false },
 *     }
 *   }),
 * });
 */
export function notionLoader({
  database_id,
  filter_properties,
  sorts,
  filter,
  archived,
  imageSavePath = DEFAULT_IMAGE_SAVE_PATH,
  rehypePlugins = [],
  experimentalCacheImageInData = false,
  experimentalRootSourceAlias = 'src',
  ...clientOptions
}: NotionLoaderOptions): Loader {
  const notionClient = new Client(clientOptions);

  const resolvedRehypePlugins = Promise.all(
    rehypePlugins.map(async (config) => {
      let plugin: RehypePlugin | string;
      let options: any;
      if (Array.isArray(config)) {
        [plugin, options] = config;
      } else {
        plugin = config;
      }

      if (typeof plugin === 'string') {
        plugin = (await import(/* @vite-ignore */ plugin)).default as RehypePlugin;
      }
      return [plugin, options] as const;
    })
  );
  const processor = buildProcessor(resolvedRehypePlugins);

  return {
    name: 'notion-loader',
    schema: async () =>
      notionPageSchema({
        properties: await propertiesSchemaForDatabase(notionClient, database_id),
      }),
    async load(ctx) {
      const { store, logger, parseData } = ctx;
      logger.info('Loading notion pages');

      const existingPageIds = new Set<string>(store.keys());
      const renderPromises: Promise<void>[] = [];

      const pages = iteratePaginatedAPI(notionClient.databases.query, {
        database_id,
        filter_properties,
        sorts,
        filter,
        archived,
      });
      for await (const page of pages) {
        if (!isFullPage(page)) {
          continue;
        }

        existingPageIds.delete(page.id);
        const existingPage = store.get(page.id);

        // If the page has been updated, re-render it
        if (existingPage?.digest !== page.last_edited_time) {
          const realSavePath = path.resolve(process.cwd(), 'src', imageSavePath);

          const renderer = new NotionPageRenderer(notionClient, page, realSavePath, logger);

          const data = await parseData(
            await renderer.getPageData(experimentalCacheImageInData, experimentalRootSourceAlias)
          );

          const renderPromise = renderer.render(processor).then((rendered) => {
            store.set({
              id: page.id,
              digest: page.last_edited_time,
              data,
              rendered,
              filePath: `${VIRTUAL_CONTENT_ROOT}/${page.id}.md`, // 不重要，有就行
              assetImports: rendered?.metadata.imagePaths,
            });
          });

          renderPromises.push(renderPromise);
        }
      }

      // Remove any pages that have been deleted
      for (const deletedPageId of existingPageIds) {
        store.delete(deletedPageId);
      }

      // Wait for rendering to complete
      await Promise.all(renderPromises);
    },
  };
}
