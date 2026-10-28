import { ACTIVE, LIVE_COMPONENTS, NAV_GROUPS } from "../docs/nav";

/**
 * shadcn-style docs rail. Shipped components (Button, Overlay) are live links;
 * everything else is inert by design so the rail doubles as the roadmap.
 */
export function Sidebar({ active = ACTIVE, onSelect }) {
  return (
    <nav className="sticky top-10 hidden h-[calc(100vh-5rem)] w-56 shrink-0 overflow-y-auto border-r border-white/10 pr-4 md:block">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
            {group.title}
          </h3>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const live = LIVE_COMPONENTS.includes(item);
              const isSelected = item === active;
              return (
                <li key={item}>
                  {live ? (
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={(e) => {
                        if (onSelect) {
                          e.preventDefault();
                          onSelect(item);
                        }
                      }}
                      className={`block border-l-2 px-2 py-1 font-mono text-xs transition-colors ${
                        isSelected
                          ? "border-white bg-white/10 text-white"
                          : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      title="Not implemented yet"
                      className="block cursor-not-allowed border-l-2 border-transparent px-2 py-1 font-mono text-xs text-white/25 select-none"
                    >
                      {item}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}