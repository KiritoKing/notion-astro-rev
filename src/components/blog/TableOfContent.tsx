import type { MarkdownHeading } from 'astro';
import { useEffect, useState } from 'react';
import { cn } from '~/utils/utils';

interface Props {
  className?: string;
  headings: MarkdownHeading[];
}

const TableOfContent: React.FC<Props> = ({ headings, className }) => {
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
    <aside className={cn('h-fit px-3 py-2', className)}>
      <h2 className="mb-1 mb-2 text-xl font-bold">目录</h2>
      <nav>
        <ol className="space-y-1">
          {headings?.map((h) => (
            <li
              key={h.slug}
              style={{ marginLeft: `${h.depth / 2}rem` }}
              className={cn(
                'transition-all',
                activeSlugs.includes(h.slug)
                  ? 'font-bold text-purple-700 underline underline-offset-4 dark:text-purple-300'
                  : ''
              )}
            >
              <a href={`#${h.slug}`}>{h.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
};

export default TableOfContent;
