import { defineCollection } from 'astro:content';
import { notionLoader } from '@chlorinec-pkgs/notion-astro-loader';
import rehypePrism from 'rehype-prism';

const database = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_DATABASE_ID,
    // Use Notion sorting and filtering
    filter: {
      property: 'status',
      select: {
        equals: 'Published',
      },
    },
    sorts: [{ property: 'date', direction: 'descending' }],
    rehypePlugins: [rehypePrism],
    experimentalCacheImageInData: true,
    experimentalRootSourceAlias: '~',
  }),
});

export const collections = {
  notion: database,
};
