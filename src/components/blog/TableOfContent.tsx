import type { MarkdownHeading } from 'astro';
import { useEffect, useState } from 'react';
import { cn } from '~/utils/utils';

interface Props {
  className?: string;
  title?: string;
  headings: MarkdownHeading[];
}

const TableOfContent: React.FC<Props> = ({ headings, className, title }) => {
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
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
      <h2 className="mb-1 font-bold">目录</h2>
      {title && <h1 className="mb-4 text-xl font-bold">{title}</h1>}
      <nav>
        <ol className="space-y-1">
          {headings?.map((h) => (
            <li
              key={h.slug}
              style={{ marginLeft: `${h.depth / 2}rem` }}
              className={cn(
                'text-sm transition-all',
                activeSlugs.includes(h.slug) ? 'font-bold text-primary underline underline-offset-4' : ''
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
