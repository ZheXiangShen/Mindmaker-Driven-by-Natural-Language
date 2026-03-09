"use client";

import { useStore, Note } from "@/app/store";
import {
  Upload, Download, X, FileText, Check,
  ChevronRight, Loader2
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

// ─── Import Modal ────────────────────────────────────────────────────────────
interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { dispatch } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const loaded: { name: string; content: string }[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt")) {
        const content = await file.text();
        loaded.push({ name: file.name.replace(/\.(md|markdown|txt)$/, ""), content });
      }
    }
    setFiles(loaded);
    if (loaded.length > 0) setStep("preview");
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const notes: Note[] = files.map((f) => ({
        id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
        title: f.name,
        content: f.content,
        folderId: null,
        tags: [],
        createdAt: now,
        updatedAt: now,
        deleted: false,
        deletedAt: null,
        snapshots: [],
      }));
      dispatch({ type: "IMPORT_NOTES", notes });
      setImporting(false);
      setStep("done");
      toast.success(`${notes.length} 篇笔记已导入`);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-popover rounded-2xl shadow-xl border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-muted-foreground" />
            <h3>导入笔记</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-2" style={{ fontSize: 12 }}>
          <span className={step === "select" ? "text-foreground" : "text-muted-foreground"}>
            1. 选择文件
          </span>
          <ChevronRight size={12} className="text-muted-foreground" />
          <span className={step === "preview" ? "text-foreground" : "text-muted-foreground"}>
            2. 预览
          </span>
          <ChevronRight size={12} className="text-muted-foreground" />
          <span className={step === "done" ? "text-foreground" : "text-muted-foreground"}>
            3. 完成
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === "select" && (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                className="border-2 border-dashed border-border rounded-xl p-10 hover:border-primary/30 hover:bg-accent/20 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Upload size={22} className="text-muted-foreground" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>点击选择文件</p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: 12 }}>
                  支持 .md、.markdown 和 .txt 文件
                </p>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div>
              <p className="mb-3 text-muted-foreground" style={{ fontSize: 13 }}>
                {files.length} 个文件准备导入：
              </p>
              <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/30 border border-border"
                  >
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <span className="truncate flex-1" style={{ fontSize: 13 }}>{file.name}</span>
                    <span className="text-muted-foreground shrink-0" style={{ fontSize: 11 }}>
                      {file.content.length} 字符
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setStep("select"); setFiles([]); }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                >
                  返回
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ fontSize: 13 }}
                >
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {importing ? "导入中..." : `导入 ${files.length} 个文件`}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
                <Check size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>导入完成</p>
              <p className="text-muted-foreground mt-1 mb-4" style={{ fontSize: 12 }}>
                {files.length} 篇笔记已成功导入。
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ fontSize: 13 }}
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { state } = useStore();
  const [step, setStep] = useState<"options" | "exporting" | "done">("options");
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const activeNotes = state.notes.filter((n) => !n.deleted);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    setStep("exporting");
    setTimeout(() => {
      const notesToExport =
        exportType === "all"
          ? activeNotes
          : activeNotes.filter((n) => selectedIds.includes(n.id));

      if (notesToExport.length === 1) {
        const note = notesToExport[0];
        const blob = new Blob([note.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${note.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Export as concatenated text with separators (simplified for demo)
        const content = notesToExport
          .map((n) => `# ${n.title}\n\n${n.content}`)
          .join("\n\n---\n\n");
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mindmark-export.md";
        a.click();
        URL.revokeObjectURL(url);
      }

      setStep("done");
      toast.success(`${notesToExport.length} 篇笔记已导出`);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-popover rounded-2xl shadow-xl border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-muted-foreground" />
            <h3>导出笔记</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === "options" && (
            <div>
              {/* Export type selection */}
              <div className="space-y-2 mb-4">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    exportType === "all" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === "all"}
                    onChange={() => setExportType("all")}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    exportType === "all" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {exportType === "all" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>导出全部笔记</div>
                    <div className="text-muted-foreground" style={{ fontSize: 12 }}>{activeNotes.length} 篇笔记</div>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    exportType === "selected" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === "selected"}
                    onChange={() => setExportType("selected")}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    exportType === "selected" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {exportType === "selected" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>选择笔记导出</div>
                    <div className="text-muted-foreground" style={{ fontSize: 12 }}>选择特定笔记</div>
                  </div>
                </label>
              </div>

              {/* Note selection */}
              {exportType === "selected" && (
                <div className="max-h-48 overflow-y-auto space-y-1 mb-4 border border-border rounded-xl p-2">
                  {activeNotes.map((note) => (
                    <label
                      key={note.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedIds.includes(note.id) ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(note.id)}
                        onChange={() => toggleSelect(note.id)}
                        className="rounded border-border"
                      />
                      <FileText size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate" style={{ fontSize: 13 }}>{note.title}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                >
                  取消
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportType === "selected" && selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ fontSize: 13 }}
                >
                  <Download size={14} />
                  导出
                </button>
              </div>
            </div>
          )}

          {step === "exporting" && (
            <div className="text-center py-6">
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
              <p style={{ fontSize: 14 }}>导出中...</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
                <Check size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>导出完成</p>
              <p className="text-muted-foreground mt-1 mb-4" style={{ fontSize: 12 }}>
                你的笔记已下载为 Markdown 文件。
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ fontSize: 13 }}
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
