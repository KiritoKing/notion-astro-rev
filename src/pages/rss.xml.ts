import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { siteConfig } from '@/config';
import { getSortedPosts } from '@utils/content-utils';

const parser = new MarkdownIt();

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
        link: `/posts/${post.slug}/`,
        content: sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
      };
    }),
    // customData: `<language>${siteConfig.lang}</language>`,
  });
}
