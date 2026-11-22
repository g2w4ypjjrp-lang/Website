import { SkeletonRows } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mt-4 lg:mt-0">
      <div className="skeleton h-8 w-56" />
      <div className="skeleton mt-2 h-4 w-72" />
      <div className="mt-8"><SkeletonRows /></div>
    </div>
  );
}
