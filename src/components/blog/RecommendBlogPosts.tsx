import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';
import { cn } from '~/lib/utils';
import type { PostWithCover } from '~/utils/blog';

interface IProps {
  posts: PostWithCover[];
  className?: string;
}

const RecommendBlogPosts: React.FC<IProps> = ({ posts, className }) => {
  return (
    <Carousel opts={{ loop: true }} className={cn('w-full', className)}>
      <CarouselContent>
        {posts.map((post) => (
          <CarouselItem key={post.permalink}>
            <div className="relative aspect-video overflow-hidden rounded-lg object-cover">
              <a href={post.permalink} rel="noopener noreferrer">
                <img src={post.image?.src} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white">
                  <h3 className="truncate text-lg font-bold">{post.title}</h3>
                </div>
              </a>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
      <CarouselPrevious />
    </Carousel>
  );
};

export default RecommendBlogPosts;
