/**
 * Notion data structure types
 */

export interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionTitle {
  title: Array<{
    plain_text: string;
    annotations?: any;
    href?: string | null;
    type?: string;
    [key: string]: any;
  }>;
}

export interface NotionRichText {
  rich_text: Array<{
    plain_text: string;
    annotations?: any;
    href?: string | null;
    type?: string;
    [key: string]: any;
  }>;
}

export interface NotionDate {
  date: {
    start: string;
    end?: string | null;
    time_zone?: string | null;
  };
}

export interface NotionMultiSelect {
  multi_select: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

export interface NotionSelect {
  select: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface NotionProperties {
  Name?: NotionTitle;
  name?: NotionTitle;
  title?: NotionTitle;
  summary?: NotionRichText;
  description?: NotionRichText;
  slug?: NotionRichText;
  date?: NotionDate;
  publishDate?: NotionDate;
  tags?: NotionMultiSelect;
  status?: NotionSelect;
  [key: string]: any;
}

export interface NotionCover {
  type: 'external' | 'file';
  external?: { url: string };
  file?: { url: string };
}

export interface NotionItem {
  id: string;
  slug?: string;
  data: {
    properties: NotionProperties;
    cover?: NotionCover;
    [key: string]: any;
  };
  [key: string]: any;
}

export type NotionCollection = NotionItem[];
