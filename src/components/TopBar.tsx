import { formatDate } from "../lib/format";

export function TopBar({ asOf }: { asOf: string }) {
  return (
    <div className="topbar sticky top-0 z-20">
      <div className="mx-auto flex h-15 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-7">
        <div className="flex items-center gap-2.5 whitespace-nowrap text-[15.5px] font-bold tracking-tight">
          <span className="grid size-7 flex-none place-items-center rounded-lg bg-ink text-xs font-bold text-white">
            ng<span className="text-[#a39dff]">.</span>
          </span>
          Customer Health
          <span className="hidden rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wider text-accent-2 sm:inline">
            PROTOTYP
          </span>
        </div>
        <span className="glass-inner inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] text-mut">
          <span className="size-[7px] rounded-full bg-gruen shadow-[0_0_0_3px_rgb(21_163_74/0.18)]" />
          Stand {formatDate(asOf, "short")}
        </span>
      </div>
    </div>
  );
}
