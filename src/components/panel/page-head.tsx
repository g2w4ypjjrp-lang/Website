export function PageHead({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4 lg:mt-0">
      <div>
        <h1 className="text-[26px] font-semibold sm:text-[30px]">{title}</h1>
        {sub && <p className="mt-1 text-[14.5px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
