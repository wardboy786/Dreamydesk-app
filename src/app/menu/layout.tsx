
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <Footer />
    </div>
  );
}
