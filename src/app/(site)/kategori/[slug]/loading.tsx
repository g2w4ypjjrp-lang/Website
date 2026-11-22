import { SkeletonGrid } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-x pt-6">
      <div className="skeleton h-3 w-48" />
      <div className="mt-8 border-b border-line pb-8"><div className="skeleton h-10 w-72" /><div className="skeleton mt-4 h-4 w-[28rem] max-w-full" /></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-4 lg:block">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
        <SkeletonGrid n={9} cols="lg:grid-cols-3" />
      </div>
    </div>
  );
}
