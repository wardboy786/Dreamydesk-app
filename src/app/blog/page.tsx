
import { getPublishedBlogPosts } from "@/services/blog.service";
import { Metadata } from 'next';
import Link from 'next/link';
import OptimizedImage from "@/components/optimized-image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamydesk.co.in';

export const metadata: Metadata = {
  title: 'Blog - DreamyDesk',
  description: 'Explore articles, updates, and stories from the DreamyDesk team. Discover tips, new collections, and behind-the-scenes content about our wallpapers.',
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
};

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">The DreamyDesk Blog</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Updates, stories, and inspiration from our creative team.
        </p>
      </div>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Card key={post.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <Link href={`/blog/${post.slug}`} className="block relative group overflow-hidden">
                    <AspectRatio ratio={16/9}>
                        <OptimizedImage
                            alt={post.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            src={post.thumbnailUrl}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </AspectRatio>
                </Link>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </CardTitle>
                <CardDescription className="mt-2 flex-grow">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{format(post.createdAt, "PPP")}</span>
                 <Link href={`/blog/${post.slug}`} className={cn(buttonVariants({variant: 'link'}), "p-0 h-auto")}>
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                 </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2">We're working on our first blog post. Check back later!</p>
        </div>
      )}
    </div>
  );
}
