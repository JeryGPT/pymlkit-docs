import { Header } from "@/components/Header";
import { MobileNav, Sidebar, Toc } from "@/components/DocsNav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MobileNav />
      <div className="mx-auto max-w-6xl px-5 flex gap-8">
        <Sidebar />
        <main className="min-w-0 flex-1 py-10 lg:py-12 max-w-3xl">{children}</main>
        <Toc />
      </div>
    </>
  );
}
