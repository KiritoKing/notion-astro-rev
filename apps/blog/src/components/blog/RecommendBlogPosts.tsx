import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';
import { cn } from '~/lib/utils';
import type { PostWithCover } from '~/utils/blog';
import { APP_BLOG } from 'astrowind:config';
import { getPermalink } from '~/utils/permalinks';

interface IProps {
  posts: PostWithCover[];
  className?: string;
}

const RecommendBlogPosts: React.FC<IProps> = ({ posts, className }) => {
  if (!APP_BLOG.isEnabled) return null;
  return (
    <Carousel opts={{ loop: true }} className={cn('w-full', className)}>
      <CarouselContent>
        {posts.map((post) => {
          const src = typeof post.image === 'string' ? post.image : post.image.src;
          const link = getPermalink(post.permalink, 'post');
          return (
            <CarouselItem key={post.permalink}>
              <div className="relative aspect-video overflow-hidden rounded-lg object-cover">
                <a href={link} rel="noopener noreferrer">
                  <img src={src} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white">
                    <h3 className="truncate text-lg font-bold">{post.title}</h3>
                  </div>
                </a>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselNext className="hidden lg:flex" />
      <CarouselPrevious className="hidden lg:flex" />
    </Carousel>
  );
};

export default RecommendBlogPosts;
