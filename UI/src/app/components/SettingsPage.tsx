"use client";

import { useStore } from "@/app/store";
import {
  Settings, Monitor, Type, Save, Keyboard, HardDrive, Moon, Sun,
  Download, Upload, RotateCcw, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { ExportModal, ImportModal } from "@/app/components/ImportExportModal";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import { toast } from "sonner";

const SHORTCUTS = [
  { keys: ["Ctrl/Cmd", "N"], action: "新建笔记" },
  { keys: ["Ctrl/Cmd", "S"], action: "保存并创建快照" },
  { keys: ["Ctrl/Cmd", "K"], action: "全局搜索" },
  { keys: ["Ctrl/Cmd", "P"], action: "切换预览" },
  { keys: ["Ctrl/Cmd", "B"], action: "加粗" },
  { keys: ["Ctrl/Cmd", "I"], action: "斜体" },
  { keys: ["Tab"], action: "增加缩进" },
  { keys: ["Shift", "Tab"], action: "减少缩进" },
];

export function SettingsPage() {
  const { state, dispatch, refreshNotes } = useStore();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetData = async () => {
    try {
      const response = await fetch("/api/notes?hard=1", { method: "DELETE" });
      if (!response.ok) throw new Error("清空数据库失败");
      localStorage.removeItem("mindmark-ui-settings");
      setConfirmReset(false);
      await refreshNotes();
      toast.success("已重置所有数据");
    } catch {
      toast.error("重置失败，请稍后再试");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="flex items-center gap-2 mb-1">
          <Settings size={22} className="text-muted-foreground" />
          设置
        </h1>
        <p className="text-muted-foreground mb-8" style={{ fontSize: 13 }}>
          自定义你的 MindMark 体验。
        </p>

        {/* Appearance */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-muted-foreground" />
            外观
          </h3>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>主题</div>
                <div className="text-muted-foreground" style={{ fontSize: 12 }}>在浅色和深色模式间切换</div>
              </div>
              <button
                onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                style={{ fontSize: 13 }}
              >
                {state.darkMode ? <Sun size={15} /> : <Moon size={15} />}
                {state.darkMode ? "浅色模式" : "深色模式"}
              </button>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <Type size={16} className="text-muted-foreground" />
            编辑器
          </h3>
          <div className="space-y-5 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>字体大小</div>
                <div className="text-muted-foreground" style={{ fontSize: 12 }}>编辑器字体大小（像素）</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: "SET_EDITOR_FONT_SIZE", size: Math.max(10, state.editorFontSize - 1) })}
                  className="w-8 h-8 rounded-lg border border-border hover:bg-accent flex items-center justify-center transition-colors"
                  style={{ fontSize: 14 }}
                >
                  -
                </button>
                <span className="w-10 text-center" style={{ fontSize: 14 }}>{state.editorFontSize}</span>
                <button
                  onClick={() => dispatch({ type: "SET_EDITOR_FONT_SIZE", size: Math.min(24, state.editorFontSize + 1) })}
                  className="w-8 h-8 rounded-lg border border-border hover:bg-accent flex items-center justify-center transition-colors"
                  style={{ fontSize: 14 }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>行号</div>
                <div className="text-muted-foreground" style={{ fontSize: 12 }}>在编辑器中显示行号</div>
              </div>
              <button
                onClick={() => dispatch({ type: "SET_SHOW_LINE_NUMBERS", show: !state.showLineNumbers })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  state.showLineNumbers ? "bg-primary" : "bg-switch-background"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                    state.showLineNumbers ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>自动保存间隔</div>
                <div className="text-muted-foreground" style={{ fontSize: 12 }}>停止输入后自动保存的等待秒数</div>
              </div>
              <select
                value={state.autoSaveInterval}
                onChange={(e) => dispatch({ type: "SET_AUTO_SAVE_INTERVAL", interval: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-border bg-background outline-none"
                style={{ fontSize: 13 }}
              >
                <option value={1}>1 秒</option>
                <option value={3}>3 秒</option>
                <option value={5}>5 秒</option>
                <option value={10}>10 秒</option>
              </select>
            </div>
          </div>
        </section>

        {/* Storage */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <HardDrive size={16} className="text-muted-foreground" />
            存储
          </h3>
          <div className="space-y-4 pl-6">
            <div className="p-4 rounded-xl bg-accent/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, fontWeight: 500 }}>本地存储</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" style={{ fontSize: 11 }}>
                  使用中
                </span>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                笔记通过 Next.js API 持久化到本地 SQLite 数据库。设置项会继续保存在浏览器本地。
              </p>
              <div className="mt-3 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
                <span>{state.notes.length} 篇笔记</span>
                <span>|</span>
                <span>{state.folders.length} 个文件夹</span>
                <span>|</span>
                <span>~{Math.round(JSON.stringify(state.notes).length / 1024)} KB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Import/Export */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <Save size={16} className="text-muted-foreground" />
            导入 / 导出
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex gap-3">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
                style={{ fontSize: 13 }}
              >
                <Upload size={15} />
                导入 .md 文件
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
                style={{ fontSize: 13 }}
              >
                <Download size={15} />
                导出笔记
              </button>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4">
            <Keyboard size={16} className="text-muted-foreground" />
            快捷键
          </h3>
          <div className="pl-6">
            <div className="border border-border rounded-xl overflow-hidden">
              {SHORTCUTS.map((shortcut, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2.5 ${
                    i < SHORTCUTS.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span style={{ fontSize: 13 }}>{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, j) => (
                      <span key={j}>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border" style={{ fontSize: 11 }}>
                          {key}
                        </kbd>
                        {j < shortcut.keys.length - 1 && <span className="mx-0.5 text-muted-foreground" style={{ fontSize: 11 }}>+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-8">
          <h3 className="flex items-center gap-2 mb-4 text-destructive">
            <AlertTriangle size={16} />
            危险操作
          </h3>
          <div className="pl-6">
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>重置所有数据</div>
                  <div className="text-muted-foreground" style={{ fontSize: 12 }}>删除所有笔记、文件夹和设置</div>
                </div>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  style={{ fontSize: 13 }}
                >
                  <RotateCcw size={14} />
                  重置
                </button>
              </div>
            </div>
          </div>
        </section>

        <ConfirmDialog
          open={confirmReset}
          title="重置所有数据"
          description="这将永久删除你所有的笔记、文件夹和设置。页面将以默认数据重新加载。"
          confirmLabel="重置所有"
          destructive
          onCancel={() => setConfirmReset(false)}
          onConfirm={handleResetData}
        />
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
