import { Command } from "lucide-react";
import { type LucideIcon } from "lucide-react";

type NavItem = {
  path: string;
  label: string;
  shortcut: string;
  icon: LucideIcon;
};

interface SidebarNavProps {
  items: NavItem[];
  pathname: string;
  trashCount: number;
  mobile?: boolean;
  onNavigate: (path: string) => void;
}

export function SidebarNav({ items, pathname, trashCount, mobile = false, onNavigate }: SidebarNavProps) {
  return (
    <nav className={mobile ? "px-2 py-1" : "flex-1 overflow-y-auto px-2 py-1"}>
      {items.map((item) => {
        const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 ${mobile ? "py-2.5" : "py-2"} rounded-lg mb-0.5 transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
            style={{ fontSize: mobile ? 14 : 13 }}
          >
            <item.icon size={mobile ? 18 : 16} />
            <span className={mobile ? "text-left" : "flex-1 text-left"}>{item.label}</span>
            {!mobile && item.label === "回收站" && trashCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                style={{ fontSize: 11 }}
              >
                {trashCount}
              </span>
            )}
            {!mobile && item.shortcut && (
              <kbd
                className="hidden lg:inline px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                style={{ fontSize: 10 }}
              >
                <Command size={9} className="inline mb-px" />
                {item.shortcut}
              </kbd>
            )}
          </button>
        );
      })}
    </nav>
  );
}
