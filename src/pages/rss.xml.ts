import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { siteConfig } from '@/config';
import { getSortedPosts } from '@utils/content-utils';

export async function GET(context: APIContext) {
  const blog = await getSortedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: context.site || '',
    items: blog.map((post) => {
      return {
        title: post.data.title,
        pubDate: post.data.published,
        description: post.data.description || '',
        link: `${context.site}/posts/${post.slug}/`,
      };
    }),
    customData: `
    <language>${siteConfig.lang.replace('_', '-')}</language>
    <follow_challenge>
      <feedId>${import.meta.env.FOLLOW_FEEDID}</feedId>
      <userId>${import.meta.env.FOLLOW_USERID}</userId>
    </follow_challenge>
    `,
  });
}
