import Link from "next/link";
import type { DemandPost } from "../data";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

export type DetailViewer = "guest" | "official" | "supplier";

export function CommunityDetailView({ post, viewer }: { post: DemandPost; viewer: DetailViewer }) {
  const active = post.status === "진행중";
  const comments = post.comments ?? [];
  return (
    <div style={{ maxWidth: "839px", margin: "0 auto" }}>

      <nav className="flex items-center" style={{ gap: "7.32px", marginBottom: "24.4px" }}>
        <Link href="/community" style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", textDecoration: "none" }}>미등록 수요 게시판</Link>
        <Chevron />
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</span>
      </nav>

      <article style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", padding: "30.28px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", padding: "4.88px 12.2px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", background: active ? "rgba(30,58,95,0.1)" : "#F5F5F7", color: active ? NAVY : "rgba(29,29,31,0.4)" }}>{post.status}</span>

        <h1 style={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", letterSpacing: "-0.5px", color: INK, margin: "14.64px 0 0" }}>{post.title}</h1>

        <div className="flex items-center flex-wrap" style={{ gap: "14.64px", marginTop: "19.52px", paddingBottom: "20.52px", borderBottom: "1px solid rgba(210,210,215,0.15)" }}>
          <Meta icon={<BuildingIcon />}>{post.org}</Meta>
          <Meta icon={<CalIcon />}>{post.date}</Meta>
          <Meta icon={<EyeIcon />}>조회 {post.views}</Meta>
          <Meta icon={<CommentIcon />}>업체 답변 {post.answers}건</Meta>
        </div>

        {post.videoUrl && (
          <div style={{ marginTop: "24.4px", borderRadius: "19.52px", overflow: "hidden", background: "#000", aspectRatio: "16 / 9" }}>
            <iframe
              src={post.videoUrl}
              title="동영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          </div>
        )}

        <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.21px", color: "rgba(29,29,31,0.7)", margin: "24.4px 0 0", whiteSpace: "pre-wrap" }}>{post.summary}</p>

        {post.attachments && post.attachments.length > 0 && (
          <div style={{ marginTop: "24.4px", borderRadius: "19.52px", background: "#F5F5F7", border: "1px solid rgba(210,210,215,0.1)", padding: "25.4px" }}>
            <p className="flex items-center" style={{ gap: "7.32px", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.364px", color: "rgba(29,29,31,0.6)", margin: "0 0 14.64px" }}>
              <ClipIcon /> 첨부파일 <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.3)" }}>({post.attachments.length}개)</span>
            </p>
            <div className="flex flex-col" style={{ gap: "7.32px" }}>
              {post.attachments.map((f) => (
                <div key={f.name} className="flex items-center justify-between" style={{ borderRadius: "14.64px", background: "#fff", border: "1px solid rgba(210,210,215,0.1)", padding: "15.64px 20.52px" }}>
                  <div className="flex items-center" style={{ gap: "14.64px", minWidth: 0 }}>
                    <span className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "9.76px", background: "#F5F5F7", flexShrink: 0 }}><FileIcon /></span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", color: INK, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                      <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)", margin: "2.44px 0 0" }}>{f.size}</p>
                    </div>
                  </div>
                  <DownloadIcon />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "29.28px", borderTop: "1px solid rgba(210,210,215,0.15)", paddingTop: "20.52px" }}>
          <Link href="/community" className="inline-flex items-center" style={{ gap: "7.32px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: "rgba(29,29,31,0.5)", textDecoration: "none" }}>
            <BackArrow /> 목록으로
          </Link>
        </div>
      </article>

      <section style={{ marginTop: "24.4px", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", overflow: "hidden" }}>

        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px" }}>
          <p className="flex items-center" style={{ gap: "5px", margin: 0 }}>
            <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK }}>업체 답변</span>
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: NAVY }}>{post.answers}</span>
          </p>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.3)" }}>입점업체만 답변 등록 가능</span>
        </div>

        <div className="flex flex-col">
          {comments.map((c, i) => (
            <div key={i} style={{ padding: i === 0 ? "24.4px 29.28px" : "25.4px 29.28px 24.4px", borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}>

              <div className="flex" style={{ gap: "14.64px" }}>
                <span style={{ paddingTop: "2.44px", flexShrink: 0 }}>
                  <span className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "9999px" }}><CompanyAvatarIcon /></span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between" style={{ paddingBottom: "7.32px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: INK }}>{c.company}</span>
                    <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{c.date}</span>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.125px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.7)", margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
                </div>
              </div>

              {c.reply && (
                <div className="flex" style={{ marginTop: "14.64px", marginLeft: "58.56px", gap: "12.2px" }}>
                  <span style={{ paddingTop: "2.44px", flexShrink: 0 }}>
                    <span className="flex items-center justify-center" style={{ width: "34px", height: "34px", borderRadius: "9999px", background: "#FFFBEB", border: "1px solid #FDE68A" }}><ReplyAvatarIcon /></span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0, borderRadius: "14.64px", background: "#FAFAFA", border: "1px solid rgba(210,210,215,0.15)", padding: "13.2px 18.08px" }}>
                    <div className="flex items-center justify-between" style={{ paddingBottom: "4.88px" }}>
                      <span className="flex items-center" style={{ gap: "7.32px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: INK }}>{c.reply.name}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", background: "#FEF3C7", padding: "2.44px 7.32px", fontSize: "10px", fontWeight: 500, letterSpacing: "-0.15px", lineHeight: "18px", color: "#B45309" }}>작성자</span>
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{c.reply.date}</span>
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "19.5px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.7)", margin: 0, whiteSpace: "pre-wrap" }}>{c.reply.body}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {viewer === "guest" && (
          <div style={{ background: "#FAFAFA", borderTop: "1px solid rgba(210,210,215,0.15)", padding: "20.52px 29.28px 19.52px" }}>
            <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)", margin: "0 0 14.64px" }}>업체 답변은 로그인한 입점업체만 작성할 수 있습니다</p>
            <div style={{ textAlign: "center" }}>
              <Link href="/login" style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: NAVY, textDecoration: "none" }}>로그인하기</Link>
            </div>
          </div>
        )}
        {viewer === "official" && (
          <div style={{ background: "#FAFAFA", borderTop: "1px solid rgba(210,210,215,0.15)", padding: "20.52px 29.28px 19.52px" }}>
            <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)", margin: 0 }}>업체 답변은 입점업체(파트너) 계정으로만 작성할 수 있습니다</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center" style={{ gap: "4.88px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", whiteSpace: "nowrap" }}>
      {icon}{children}
    </span>
  );
}

const stroke = "rgba(29,29,31,0.4)";
function Chevron() { return <svg width={4} height={7} viewBox="0 0 4 7" fill="none" aria-hidden><path d="M1 1l2 2.5L1 6" stroke={stroke} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BuildingIcon() { return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} aria-hidden><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2" /></svg>; }
function CalIcon() { return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function EyeIcon() { return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} aria-hidden><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>; }
function CommentIcon() { return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 21 11.5z" /></svg>; }
function ClipIcon() { return <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>; }
function FileIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>; }
function DownloadIcon() { return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>; }
function BackArrow() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }

function CompanyAvatarIcon() { return <svg width={18} height={17} viewBox="0 0 16 15" fill="none" aria-hidden><path d="M1.45453 13.1229V3.31637C1.45453 3.15907 1.49817 3.01652 1.58544 2.88872C1.67271 2.76091 1.78907 2.67243 1.93453 2.62328L8.95991 0.0278744C9.05688 -0.01145 9.15142 -0.00899139 9.24354 0.0352482C9.33566 0.0794877 9.39627 0.150763 9.42536 0.249074C9.44475 0.288398 9.45445 0.327723 9.45445 0.367046V4.0242L14.0508 5.5726C14.1962 5.62175 14.315 5.71269 14.4071 5.84541C14.4992 5.97813 14.5453 6.12314 14.5453 6.28044V13.1229H15.9998V14.5975H0V13.1229H1.45453ZM2.90906 13.1229H7.99992V1.94493L2.90906 3.8325V13.1229ZM13.0908 13.1229V6.81131L9.45445 5.5726V13.1229H13.0908Z" fill="#1E3A5F" fillOpacity={0.6} /></svg>; }
function ReplyAvatarIcon() { return <svg width={15} height={12} viewBox="0 0 14 11" fill="none" aria-hidden><path d="M11.4444 1.83333H13.2514V3.05556H12.6491V9.77778H13.2514V11H0V9.77778H0.602336V3.05556H0V1.83333H1.80701V0.611111C1.80701 0.44 1.86523 0.295371 1.98169 0.177222C2.09814 0.0590744 2.24069 0 2.40934 0H10.8421C11.0107 0 11.1533 0.0590744 11.2697 0.177222C11.3862 0.295371 11.4444 0.44 11.4444 0.611111V1.83333ZM11.4444 3.05556H1.80701V9.77778H3.61402V5.5H4.81869V9.77778H6.02336V5.5H7.22803V9.77778H8.43271V5.5H9.63738V9.77778H11.4444V3.05556ZM3.01168 1.22222V1.83333H10.2397V1.22222H3.01168Z" fill="#D97706" /></svg>; }
