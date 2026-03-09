"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Search,
  Trash2,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Upload,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { Toaster } from "sonner";
import { useStore } from "@/app/store";
import { ImportModal } from "@/app/components/ImportExportModal";
import { AppBrand } from "@/app/components/layout/AppBrand";
import { SidebarNav } from "@/app/components/layout/SidebarNav";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "仪表盘", shortcut: "" },
  { path: "/workspace", icon: FileText, label: "笔记", shortcut: "" },
  { path: "/search", icon: Search, label: "搜索", shortcut: "K" },
  { path: "/trash", icon: Trash2, label: "回收站", shortcut: "" },
  { path: "/settings", icon: Settings, label: "设置", shortcut: "" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { state, dispatch, createNote } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showImport, setShowImport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
      if (mod && e.key === "n") {
        e.preventDefault();
        const id = createNote();
        router.push(`/workspace/${id}`);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, createNote]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleNewNote = () => {
    const id = createNote();
    router.push(`/workspace/${id}`);
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const trashCount = state.notes.filter((n) => n.deleted).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${
          state.sidebarOpen ? "w-60" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <AppBrand />
          <button
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="p-1 rounded hover:bg-accent text-muted-foreground"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={handleNewNote}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            style={{ fontSize: 13 }}
          >
            <Plus size={15} />
            新建笔记
          </button>
        </div>

        <SidebarNav
          items={NAV_ITEMS}
          pathname={pathname}
          trashCount={trashCount}
          onNavigate={handleNavigate}
        />

        <div className="px-2 pb-2">
          <div className="mt-1 mb-1 px-3 flex items-center justify-between">
            <span
              className="text-muted-foreground"
              style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              快捷操作
            </span>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            <Upload size={16} />
            导入
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            <Download size={16} />
            导出
          </button>
        </div>

        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            {state.darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {state.darkMode ? "浅色模式" : "深色模式"}
          </button>
        </div>
      </aside>

      {!state.sidebarOpen && (
        <button
          onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          className="hidden md:flex items-center justify-center w-10 border-r border-border hover:bg-accent transition-colors shrink-0"
        >
          <PanelLeft size={16} className="text-muted-foreground" />
        </button>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <PanelLeft size={18} />
          </button>
          <AppBrand />
          <button onClick={handleNewNote} className="p-2 rounded-lg hover:bg-accent">
            <Plus size={18} />
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-sidebar border-r border-border" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                <AppBrand />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-accent">
                  <PanelLeftClose size={16} />
                </button>
              </div>
              <div className="px-3 py-2">
                <button
                  onClick={handleNewNote}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground"
                  style={{ fontSize: 13 }}
                >
                  <Plus size={15} />
                  新建笔记
                </button>
              </div>
              <SidebarNav
                items={NAV_ITEMS}
                pathname={pathname}
                trashCount={trashCount}
                mobile
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        )}

        {children}
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
