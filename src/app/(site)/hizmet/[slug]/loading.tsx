export default function Loading() {
  return (
    <div className="container-x pt-6" role="status" aria-label="Yükleniyor">
      <div className="skeleton h-3 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div>
          <div className="skeleton h-9 w-4/5" />
          <div className="mt-4 flex items-center gap-3"><div className="skeleton h-9 w-9 rounded-full" /><div className="skeleton h-4 w-40" /></div>
          <div className="skeleton mt-6 aspect-[10/7] w-full rounded-lg" />
        </div>
        <div className="skeleton hidden h-[460px] rounded-lg lg:block" />
      </div>
    </div>
  );
}
