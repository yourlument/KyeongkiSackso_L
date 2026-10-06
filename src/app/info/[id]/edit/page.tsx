import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { getSessionClaims } from "@/lib/auth/session";
import { loadOwnedInfoEdit } from "@/lib/info";
import { CATEGORIES, type Category } from "../../data";
import { InfoPostForm } from "../../info-post-form";

export const dynamic = "force-dynamic";

function toCategory(value: string | null): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : CATEGORIES[0];
}

export default async function InfoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  const { id } = await params;
  const post = await loadOwnedInfoEdit(id, claims.sub);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pt-[58.56px] pb-[78.08px]">
          <InfoPostForm
            postId={post.id}
            initial={{
              category: toCategory(post.category),
              title: post.title,
              videoUrl: post.videoUrl ?? "",
              content: post.content,
              attachments: post.attachments,
            }}
          />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
