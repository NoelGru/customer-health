export function TopBar() {
  return (
    <div className="topbar sticky top-0 z-20">
      <div className="mx-auto flex h-15 max-w-[1360px] items-center px-4 sm:px-7">
        <div className="flex items-center gap-2.5 whitespace-nowrap text-[15.5px] font-bold tracking-tight">
          <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-ink text-xs font-bold text-white">
            ng<span className="text-[#a39dff]">.</span>
          </span>
          Customer Health
          <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wider text-accent-2">
            PROTOTYP
          </span>
        </div>
      </div>
    </div>
  );
}
