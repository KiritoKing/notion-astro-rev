import type { GetImageResult } from 'astro';
import { render, type CollectionEntry } from 'astro:content';
import {
  richTextToPlainText,
  dateToDateObjects,
  fileToImageAsset,
  fileToUrl,
} from '@chlorinec-pkgs/notion-astro-loader';
import type { Post, Taxonomy } from '~/types';
import { generatePermalink } from './blog';
import { cleanSlug } from './permalinks';
import { getImage } from 'astro:assets';

export type NotionItem = CollectionEntry<'notion'>;

export type GetNotionImageResult = {
  result: GetImageResult;
  src: string;
  /** 原始URL，用于直接传给<Image>组件 */
  raw: string;
};

/**
 * @deprecated 请在本地缓存notion图片，不要依赖astro缓存
 */
export const getNotionImage = async (
  notionFile: Parameters<typeof fileToImageAsset>[0] | string | null
): Promise<GetNotionImageResult | null> => {
  if (typeof notionFile === 'string') {
    try {
      const url = new URL(notionFile);
      // 不处理非notion文件的url
      if (!url.host.includes('amazonaws.com')) return null;
    } catch {
      // invalid url
      return null;
    }
  } else if (!notionFile || notionFile.type !== 'file') {
    // 不处理notion external image
    return null;
  }

  const rawImageUrl = typeof notionFile === 'string' ? notionFile : fileToUrl(notionFile);
  const imageAsset = await getImage({
    src: rawImageUrl,
    inferSize: true,
  });

  return {
    result: imageAsset,
    src: imageAsset.src,
    raw: rawImageUrl,
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
    image: notionItem.data.cover ? await fileToUrl(notionItem.data.cover) : undefined,
    publishDate: date,
    updateDate: new Date(props.updateAt.last_edited_time),
    Content: renderedContent,
    content: notionItem.rendered?.html,
    headings,
  };
};
