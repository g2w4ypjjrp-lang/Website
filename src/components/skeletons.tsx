/** Gerçek düzeni taklit eden iskelet bileşenleri: yüklenme sırasında sayfa zıplamaz (CLS 0). */
export function SkeletonCard() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[10/7] w-full rounded-md" />
      <div className="mt-3 flex items-center gap-2"><div className="skeleton h-5 w-5 rounded-full" /><div className="skeleton h-3 w-24" /></div>
      <div className="skeleton mt-2 h-4 w-full" />
      <div className="skeleton mt-1.5 h-4 w-2/3" />
      <div className="skeleton mt-4 h-3 w-full" />
    </div>
  );
}

export function SkeletonGrid({ n = 8, cols = "lg:grid-cols-4" }: { n?: number; cols?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 ${cols}`} role="status" aria-label="Yükleniyor">
      {Array.from({ length: n }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonRows({ n = 6 }: { n?: number }) {
  return (
    <div className="divide-y divide-line-2 rounded-lg border border-line bg-surface" role="status" aria-label="Yükleniyor">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-1/2" /><div className="skeleton h-3 w-1/4" /></div>
          <div className="skeleton h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
