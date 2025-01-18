import { getCollection, render, type CollectionEntry } from 'astro:content';
import { dateToDateObjects, fileToImageAsset } from 'node_modules/notion-astro-loader/dist/format';
import { richTextToPlainText } from 'notion-astro-loader';
import type { Post } from '~/types';

export type NotionItem = CollectionEntry<'notion'>;

export const notionToPost = async (notionItem: NotionItem): Promise<Post> => {
  const props = notionItem.data.properties;
  let coverImg: string | undefined = undefined;
  try {
    if (notionItem.data.cover) {
      coverImg = (await fileToImageAsset(notionItem.data.cover)).src;
    }
  } catch (e) {
    console.error(e);
  }
  const slug = richTextToPlainText(props.slug.rich_text);

  const { Content: renderedContent } = await render(notionItem);

  return {
    id: notionItem.id,
    title: richTextToPlainText(props.title.title),
    slug,
    // TODO: 与blog能力同步，支持配置
    permalink: `/${slug}`,
    excerpt: richTextToPlainText(props.summary.rich_text),
    image: coverImg,
    publishDate: dateToDateObjects(props.date?.date)?.start ?? new Date(),
    updateDate: new Date(props.updateAt.last_edited_time),
    Content: renderedContent,
    content: notionItem.rendered?.html,
  };
};

export const getNotionPostList = async () => {
  const database = await getCollection('notion');
  const posts = await Promise.all(database.map(notionToPost));
  return posts;
};

export const getNotionPost = async (slug?: string) => {
  if (!slug) return undefined;
  const database = await getCollection('notion');
  return database.find((post) => post.data.properties.slug.rich_text[0].plain_text === slug);
};
