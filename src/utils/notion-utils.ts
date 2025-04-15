import { dateToDateObjects, richTextToPlainText, fileToUrl } from '@chlorinec-pkgs/notion-astro-loader';
import { getCollection, render } from 'astro:content';

import type { BlogPostData } from '@/types/config';

import type { PostType } from './content-utils';

let _posts: PostType[] | null = null;

export type NotionPostItem = Awaited<ReturnType<typeof getCollection<'notion'>>>[number];

export function getNotionPostData(post: NotionPostItem): BlogPostData {
  const { properties, cover } = post.data;
  return {
    body: post.body || '',
    title: richTextToPlainText(properties.Name.title),
    published: dateToDateObjects(properties.date?.date)?.start ?? new Date(),
    updated: properties.updateAt?.last_edited_time ? new Date(properties.updateAt?.last_edited_time) : undefined,
    description: richTextToPlainText(properties.summary.rich_text),
    tags: properties.tags.multi_select.map((tag) => tag.name),
    image: cover ? fileToUrl(cover) : undefined,
    category: properties.category.select?.name,
  };
}

export async function getNotionPosts(): Promise<PostType[]> {
  if (!_posts) {
    const rawPosts = await getCollection('notion');

    const processedPosts = await Promise.all(
      rawPosts.map(async (p) => {
        const { properties } = p.data;
        return {
          body: p.body || '',
          data: getNotionPostData(p),
          slug: richTextToPlainText(properties.slug.rich_text),
          rendered: await render(p),
        };
      })
    );

    _posts = processedPosts.map((p, i) => ({
      ...p,
      data: {
        ...p.data,
        prevTitle: processedPosts[i - 1]?.data.title,
        prevSlug: processedPosts[i - 1]?.slug,
        nextTitle: processedPosts[i + 1]?.data.title,
        nextSlug: processedPosts[i + 1]?.slug,
      },
    }));
  }
  return _posts;
}
