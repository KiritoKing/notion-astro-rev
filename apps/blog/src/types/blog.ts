/**
 * Blog post interface for the Fuwari UI components
 */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  publishDate: Date;
  excerpt?: string;
  tags?: Array<string>;
  readingTime?: number;
  author?: string;
}

/**
 * Category interface for the Fuwari UI components
 */
export interface Category {
  name: string;
  count: number;
  icon?: string;
  color?: string;
}

/**
 * Page information for pagination
 */
export interface PageInfo {
  currentPage: number;
  totalPages: number;
  prevUrl?: string;
  nextUrl?: string;
  baseUrl?: string;
}
