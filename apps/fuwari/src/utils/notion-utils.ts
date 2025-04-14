import type { BlogPostData } from '@/types/config'
import {
  dateToDateObjects,
  richTextToPlainText,
  fileToUrl,
} from '@chlorinec-pkgs/notion-astro-loader'

export async function notionPropertiesToBlogData(
  notionItem: any,
): Promise<BlogPostData> {
  const props = notionItem.data.properties
  const date = dateToDateObjects(props.date?.date)?.start ?? new Date()

  return {
    body: notionItem.body,
    title: richTextToPlainText(props.Name.title),
    published: date,
    description: richTextToPlainText(props.summary.rich_text),
    category: props.category.select?.name,
    tags: props.tags.multi_select.map((tag: any) => tag.name),
    image: notionItem.data.cover
      ? await fileToUrl(notionItem.data.cover)
      : undefined,
  }
}
