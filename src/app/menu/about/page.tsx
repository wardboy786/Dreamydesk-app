
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MountainSnow, Sparkles, Users, Palette } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { DreamyDeskLogo } from '@/components/layout/dreamy-desk-logo';

export default function AboutPage() {
  return (
    <div className="space-y-8">
       <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
        </Link>
      <div className="text-center">
        <DreamyDeskLogo className="w-16 h-16 mx-auto" />
        <h1 className="text-4xl font-bold font-headline mt-4">About DreamyDesk</h1>
        <p className="text-muted-foreground mt-2">Your daily dose of digital inspiration.</p>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            At DreamyDesk, we believe your digital space should be a source of calm, creativity, and inspiration. In a world of digital noise, your desktop or phone background is a personal sanctuary. Our mission is to provide a meticulously curated collection of stunning, high-quality wallpapers that transform your screens into beautiful works of art.
          </p>
          <p>
            We are more than just a wallpaper repository; we are a community of artists, photographers, and dreamers. We partner with creators to bring you exclusive content, from breathtaking landscapes that transport you to another world, to abstract designs that spark your imagination. Every wallpaper is hand-picked to ensure it meets our high standards of quality and artistic merit.
          </p>
          <p>
            Whether you're looking for a simple, minimalist background to help you focus, or a vibrant, dynamic image to brighten your day, DreamyDesk is here to help you personalize your digital life. Thank you for joining us on this journey.
          </p>
        </CardContent>
      </Card>
       <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardHeader>
            <Palette className="w-8 h-8 mx-auto text-primary" />
            <CardTitle className="mt-2 text-xl">Stunning Quality</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Every wallpaper is available in high resolution, ensuring a crisp and clear look on any device.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Sparkles className="w-8 h-8 mx-auto text-primary" />
            <CardTitle className="mt-2 text-xl">Curated Collections</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Explore unique collections hand-picked by our team to match any mood or style.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="w-8 h-8 mx-auto text-primary" />
            <CardTitle className="mt-2 text-xl">Community Focused</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We support digital artists and photographers by providing a platform to showcase their amazing work.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
