import { Avatar } from "@/components/ui/primitives";
import { IconStar } from "@/components/icons";
import { fileUrl, formatDate } from "@/lib/utils";
import type { getReviews } from "@/server/queries";

export function ReviewList({ rows }: { rows: Awaited<ReturnType<typeof getReviews>> }) {
  if (!rows.length) return <p className="mt-4 rounded-md border border-dashed border-line px-4 py-6 text-[14px] text-muted">Henüz değerlendirme yok. İlk siparişi veren siz olabilirsiniz.</p>;
  return (
    <ul className="mt-4 divide-y divide-line border-y border-line">
      {rows.map(({ r, buyerName, buyerAvatar, serviceTitle }) => (
        <li key={r.id} className="py-5">
          <div className="flex items-center gap-3">
            <Avatar name={buyerName} src={fileUrl(buyerAvatar)} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{buyerName.split(" ")[0]} {buyerName.split(" ")[1]?.[0] ? `${buyerName.split(" ")[1]![0]}.` : ""}</p>
              <p className="text-[12.5px] text-muted">{formatDate(r.createdAt)}{serviceTitle ? ` · ${serviceTitle}` : ""}</p>
            </div>
            <span className="flex items-center gap-1 text-[14px] font-medium"><IconStar filled size={14} className="text-accent" /> {r.rating}</span>
          </div>
          <p className="mt-3 text-[14.5px] text-ink-2">{r.comment}</p>
          <p className="mt-2 flex gap-4 text-[12px] text-muted"><span>Kalite {r.quality}/5</span><span>İletişim {r.communication}/5</span><span>Teslim {r.delivery}/5</span></p>
          {r.providerReply && <p className="mt-3 border-l-2 border-line pl-3 text-[14px] text-ink-2"><span className="font-medium text-ink">Uzmanın yanıtı: </span>{r.providerReply}</p>}
        </li>
      ))}
    </ul>
  );
}
