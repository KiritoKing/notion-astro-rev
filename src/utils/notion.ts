import type { ImageMetadata } from 'astro';
import { render, type CollectionEntry } from 'astro:content';
import { dateToDateObjects, fileToImageAsset } from 'node_modules/notion-astro-loader/dist/format';
import { richTextToPlainText } from 'notion-astro-loader';
import type { Post, Taxonomy } from '~/types';
import { generatePermalink } from './blog';
import { cleanSlug } from './permalinks';

export type NotionItem = CollectionEntry<'notion'>;

const getCoverImage = async (
  notionFile: Parameters<typeof fileToImageAsset>[0] | null
): Promise<ImageMetadata | undefined> => {
  if (!notionFile) {
    return undefined;
  }

  const { src, options } = await fileToImageAsset(notionFile);

  //@ts-expect-error: this is a simple hack to make notion image work with Astro <Image />
  return {
    ...options,
    src,
  };
};

const getTaxonomy = (raw: string | null | undefined): Taxonomy | undefined => {
  if (!raw) return undefined;
  return {
    slug: cleanSlug(raw),
    title: raw,
  };
};

export const notionToPost = async (notionItem: NotionItem): Promise<Post> => {
  const props = notionItem.data.properties;
  const coverImg = await getCoverImage(notionItem.data.cover);
  const slug = richTextToPlainText(props.slug.rich_text);
  const date = dateToDateObjects(props.date?.date)?.start ?? new Date();

  const { Content: renderedContent, headings } = await render(notionItem);

  return {
    id: notionItem.id,
    title: richTextToPlainText(props.Name.title),
    slug,
    permalink: await generatePermalink({ id: notionItem.id, slug, publishDate: date, category: undefined }),
    excerpt: richTextToPlainText(props.summary.rich_text),
    category: getTaxonomy(props.category.select?.name),
    tags: props.tags.multi_select.map((tag) => getTaxonomy(tag.name)).filter((item): item is Taxonomy => !!item),
    image: coverImg,
    publishDate: date,
    updateDate: new Date(props.updateAt.last_edited_time),
    Content: renderedContent,
    content: notionItem.rendered?.html,
    headings,
  };
};
