import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { DemandForm } from "./demand-form";

export const dynamic = "force-dynamic";

export default async function DemandNewPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const claims = await getSessionClaims();
  if (claims?.role !== "OFFICIAL") redirect("/community");

  const { edit } = await searchParams;
  const post = edit
    ? await prisma.post.findUnique({
        where: { id: edit, boardType: "DEMAND" },
        select: { id: true, authorId: true, title: true, content: true, videoUrl: true, isPublished: true, attachments: { select: { fileUrl: true, fileName: true } } },
      })
    : null;
  if (edit && (!post || !post.isPublished || post.authorId !== claims.sub)) redirect("/community");

  const initial = post
    ? {
        postId: post.id,
        title: post.title,
        content: post.content,
        videoUrl: post.videoUrl ?? "",
        attachments: post.attachments.map((a) => ({ url: a.fileUrl, name: a.fileName })),
      }
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pt-[58.56px] pb-[78.08px]">
          <DemandForm initial={initial} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
