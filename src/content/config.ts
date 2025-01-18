import { defineCollection } from 'astro:content';
import { notionLoader } from 'notion-astro-loader';
import rehypePrism from 'rehype-prism';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// const metadataDefinition = () =>
//   z
//     .object({
//       title: z.string().optional(),
//       ignoreTitleTemplate: z.boolean().optional(),

//       canonical: z.string().url().optional(),

//       robots: z
//         .object({
//           index: z.boolean().optional(),
//           follow: z.boolean().optional(),
//         })
//         .optional(),

//       description: z.string().optional(),

//       openGraph: z
//         .object({
//           url: z.string().optional(),
//           siteName: z.string().optional(),
//           images: z
//             .array(
//               z.object({
//                 url: z.string(),
//                 width: z.number().optional(),
//                 height: z.number().optional(),
//               })
//             )
//             .optional(),
//           locale: z.string().optional(),
//           type: z.string().optional(),
//         })
//         .optional(),

//       twitter: z
//         .object({
//           handle: z.string().optional(),
//           site: z.string().optional(),
//           cardType: z.string().optional(),
//         })
//         .optional(),
//     })
//     .optional();

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
    rehypePlugins: [rehypePrism, rehypeAutolinkHeadings],
  }),
});

export const collections = {
  notion: database,
};
