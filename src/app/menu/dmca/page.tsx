
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function DMCAPage() {
  return (
    <div className="space-y-8">
       <Link href="/menu" className={cn(buttonVariants({ variant: 'ghost' }), "pl-0")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
        </Link>
      <div className="text-center">
        <ShieldAlert className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-4xl font-bold font-headline mt-4">DMCA & Copyright Policy</h1>
        <p className="text-muted-foreground">Our policy on copyright infringement and takedown requests.</p>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardContent className="prose dark:prose-invert prose-sm sm:prose-base prose-a:text-primary p-6 space-y-4 text-muted-foreground">
            <p>
                DreamyDesk respects the intellectual property rights of others and expects its users to do the same. We comply with the provisions of the Digital Millennium Copyright Act (DMCA). If you are a copyright owner or an agent thereof and believe that any content on our service infringes upon your copyrights, please submit a notice.
            </p>

            <h2 className="text-xl font-bold text-foreground">How to File a DMCA Notice</h2>
            <p>
                To file a notice of copyright infringement, you must provide a written communication that sets forth the items specified below. You will be liable for damages (including costs and attorneys' fees) if you materially misrepresent that a product or activity is infringing your copyrights.
            </p>
             <p>
                Please send your notice to our designated Copyright Agent via email. Your notice must include the following:
            </p>
            <ul className="list-decimal pl-6">
                <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
                <li>A description of the copyrighted work that you claim has been infringed.</li>
                <li>A description of where the material that you claim is infringing is located on our site, including the specific URL(s) of the page(s) where the material is found.</li>
                <li>Your address, telephone number, and email address.</li>
                <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">Designated Copyright Agent</h2>
            <p>
                Please submit your infringement notice to our Designated Copyright Agent at:
            </p>
            <p className="text-center font-semibold">
                <a href="mailto:info@dreamydesk.co.in" className="text-primary underline">info@dreamydesk.co.in</a>
            </p>
            <p>
                Upon receipt of a valid DMCA notice, we will take whatever action we deem appropriate, including removal of the challenged content from the Service. We may also, in our discretion, terminate the accounts of users who are repeat infringers.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
