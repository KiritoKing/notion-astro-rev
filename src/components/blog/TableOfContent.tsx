import type { MarkdownHeading } from 'astro';
import { useEffect, useState } from 'react';

interface Props {
  headings: MarkdownHeading[];
}

const TableOfContent: React.FC<Props> = ({ headings }) => {
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        console.log(entry);
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setActiveSlugs((prev) => [...prev, id]);
        } else {
          setActiveSlugs((prev) => prev.filter((slug) => slug !== id));
        }
      });
    });

    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');

    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [headings]);

  return (
    <aside className="fixed right-2 top-1/4">
      <nav className="p-2">
        <ol className="space-y-1">
          {headings?.map((h) => (
            <li key={h.slug} style={{ marginLeft: `${h.depth / 2}rem` }}>
              <a href={`#${h.slug}`}>{h.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
};

export default TableOfContent;
