---
layout: ~/layouts/FuwariPostLayout.astro
title: Getting Started with Astro and Notion
description: Learn how to build a blog using Astro and Notion as a CMS
publishDate: 2023-05-15
image: /images/blog/astro-notion.jpg
tags:
  - astro
  - notion
  - tutorial
author: Your Name
---

# Getting Started with Astro and Notion

Astro is a modern static site generator that allows you to build faster websites with less client-side JavaScript. Combined with Notion as a CMS, you can create a powerful and flexible blogging platform.

## Why Astro?

Astro offers several advantages for building modern websites:

- **Performance-focused**: Astro sends zero JavaScript to the client by default, resulting in extremely fast page loads.
- **Component Islands**: Use your favorite UI components from React, Vue, Svelte, and more.
- **Flexible**: Build sites with Markdown, MDX, or fetch content from a headless CMS like Notion.

## Setting Up Your Project

First, create a new Astro project:

```bash
# Create a new project with npm
npm create astro@latest my-astro-blog

# Navigate to your new project
cd my-astro-blog

# Install dependencies
npm install
```

## Connecting to Notion

To use Notion as a CMS, you'll need to set up the Notion API and create a database for your blog posts.

1. Create a new integration in the [Notion Developers portal](https://developers.notion.com/)
2. Share your database with the integration
3. Install the Notion client in your Astro project:

```bash
npm install @notionhq/client
```

## Creating the Notion Client

Create a new file called `notion.js` in your project:

```javascript
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

export const getDatabase = async (databaseId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
};

export const getPage = async (pageId) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const getBlocks = async (blockId) => {
  const blocks = [];
  let cursor;
  
  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      start_cursor: cursor,
      block_id: blockId,
    });
    blocks.push(...results);
    if (!next_cursor) break;
    cursor = next_cursor;
  }
  
  return blocks;
};
```

## Building Your Blog Pages

Now you can create dynamic pages that fetch content from Notion. Here's an example of how to create a blog index page:

```astro
---
import { getDatabase } from '../lib/notion';
import Layout from '../layouts/Layout.astro';
import BlogPost from '../components/BlogPost.astro';

const posts = await getDatabase(import.meta.env.NOTION_DATABASE_ID);
---

<Layout title="My Blog">
  <main>
    <h1>My Blog</h1>
    <div class="posts">
      {posts.map((post) => (
        <BlogPost post={post} />
      ))}
    </div>
  </main>
</Layout>
```

## Styling Your Blog

With Astro, you have multiple options for styling:

- Use plain CSS files
- Use CSS Modules
- Use a CSS framework like Tailwind CSS
- Use CSS-in-JS libraries with your component frameworks

## Deploying Your Site

Astro sites can be deployed to various platforms:

- Netlify
- Vercel
- GitHub Pages
- And many more!

Most platforms offer simple deployment through GitHub integration or CLI tools.

## Conclusion

Combining Astro with Notion gives you a powerful, flexible, and easy-to-maintain blog. You get the performance benefits of a static site with the convenience of a modern CMS.

Happy blogging!
