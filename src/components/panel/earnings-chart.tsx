import { formatTRY } from "@/lib/utils";

/** Bağımlılıksız, erişilebilir çubuk grafik. */
export function EarningsChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure className="mt-5">
      <div className="flex h-36 items-end gap-2" role="img" aria-label={`Aylık kazanç: ${data.map((d) => `${d.label} ${formatTRY(d.value)}`).join(", ")}`}>
        {data.map((d, i) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col justify-end">
            <span className="num mb-1 text-center text-[10.5px] text-muted opacity-0 transition-opacity group-hover:opacity-100">{d.value ? formatTRY(d.value) : ""}</span>
            <div className={`w-full rounded-t-[2px] ${i === data.length - 1 ? "bg-accent" : "bg-ink/80"}`} style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, opacity: d.value ? 1 : 0.15 }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex gap-2">{data.map((d) => <span key={d.label} className="flex-1 text-center text-[11.5px] text-muted">{d.label}</span>)}</figcaption>
    </figure>
  );
}
