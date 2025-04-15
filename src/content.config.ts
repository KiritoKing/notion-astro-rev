import { notionLoader } from '@chlorinec-pkgs/notion-astro-loader';
import rehypeShiki from '@shikijs/rehype';
import { defineCollection } from 'astro:content';

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
    rehypePlugins: [
      [
        rehypeShiki,
        {
          theme: 'dracula-soft',
        },
      ],
    ],
    experimentalCacheImageInData: true,
    experimentalRootSourceAlias: '~',
  }),
});

export const collections = {
  notion: database,
};
