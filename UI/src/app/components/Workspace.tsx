"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/app/store";
import { FileTree } from "@/app/components/FileTree";
import { MarkdownPreview } from "@/app/components/MarkdownPreview";
import {
  Save, Eye, EyeOff, PanelRightClose, PanelRight, Tag, X, Plus,
  Check, AlertCircle, Loader2, History, Download,
  FileText, Command, ChevronLeft
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export function Workspace() {
  const params = useParams<{ noteId?: string | string[] }>();
  const router = useRouter();
  const { state, dispatch, createNote } = useStore();
  const [showProperties, setShowProperties] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showFileTree, setShowFileTree] = useState(true);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const noteId = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;

  const activeNote = noteId
    ? state.notes.find((n) => n.id === noteId && !n.deleted)
    : null;

  // Auto-save
  const triggerSave = useCallback(() => {
    if (!activeNote) return;
    dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
    setTimeout(() => {
      dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
      setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", status: "idle" }), 2000);
    }, 300);
  }, [activeNote, dispatch]);

  const handleContentChange = (content: string) => {
    if (!activeNote) return;
    dispatch({ type: "UPDATE_NOTE", id: activeNote.id, updates: { content } });
    dispatch({ type: "SET_SAVE_STATUS", status: "idle" });

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      triggerSave();
    }, state.autoSaveInterval * 1000);
  };

  const handleTitleChange = (title: string) => {
    if (!activeNote) return;
    dispatch({ type: "UPDATE_NOTE", id: activeNote.id, updates: { title } });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        if (activeNote) {
          dispatch({ type: "CREATE_SNAPSHOT", noteId: activeNote.id });
          triggerSave();
          toast.success("笔记已保存");
        }
      }
      if (mod && e.key === "p") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_PREVIEW" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeNote, dispatch, triggerSave]);

  const handleAddTag = () => {
    if (!activeNote || !tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase();
    if (!activeNote.tags.includes(newTag)) {
      dispatch({
        type: "UPDATE_NOTE",
        id: activeNote.id,
        updates: { tags: [...activeNote.tags, newTag] },
      });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeNote) return;
    dispatch({
      type: "UPDATE_NOTE",
      id: activeNote.id,
      updates: { tags: activeNote.tags.filter((t) => t !== tag) },
    });
  };

  const handleExportNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("笔记已导出");
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    if (!activeNote) return;
    dispatch({ type: "RESTORE_SNAPSHOT", noteId: activeNote.id, snapshotId });
    setShowHistory(false);
    toast.success("快照已恢复");
  };

  const saveStatusIcon = () => {
    switch (state.saveStatus) {
      case "saving":
        return <Loader2 size={14} className="animate-spin text-muted-foreground" />;
      case "saved":
        return <Check size={14} className="text-green-600" />;
      case "error":
        return <AlertCircle size={14} className="text-destructive" />;
      default:
        return null;
    }
  };

  const saveStatusText = () => {
    switch (state.saveStatus) {
      case "saving": return "保存中...";
      case "saved": return "已保存";
      case "error": return "保存失败";
      default: return "";
    }
  };

  if (state.notesLoading) {
    return (
      <div className="flex h-full">
        <div className={`hidden md:block border-r border-border shrink-0 ${showFileTree ? "w-60" : "w-0 overflow-hidden"}`}>
          <FileTree />
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground gap-2" style={{ fontSize: 13 }}>
          <Loader2 size={15} className="animate-spin" />
          正在加载笔记...
        </div>
      </div>
    );
  }

  // Empty state
  if (!activeNote && !noteId) {
    return (
      <div className="flex h-full">
        {/* File Tree - desktop */}
        <div className={`hidden md:block border-r border-border shrink-0 ${showFileTree ? "w-60" : "w-0 overflow-hidden"}`}>
          <FileTree />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText size={28} className="text-muted-foreground" />
          </div>
          <h2 className="mb-2">选择一篇笔记开始编辑</h2>
          <p className="text-muted-foreground mb-6" style={{ fontSize: 14, maxWidth: 360 }}>
            从文件树中选择一篇笔记，或创建新笔记开始。
          </p>
          {state.notesError && (
            <p className="text-destructive mb-4" style={{ fontSize: 12 }}>
              {state.notesError}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const id = createNote();
                router.push(`/workspace/${id}`);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ fontSize: 13 }}
            >
              <Plus size={15} />
              新建笔记
            </button>
          </div>
          <div className="mt-6 flex gap-4 text-muted-foreground" style={{ fontSize: 12 }}>
            <span className="flex items-center gap-1"><Command size={11} />N 新建笔记</span>
            <span className="flex items-center gap-1"><Command size={11} />K 搜索</span>
            <span className="flex items-center gap-1"><Command size={11} />S 保存</span>
          </div>
        </div>
      </div>
    );
  }

  // Note not found
  if (noteId && !activeNote) {
    return (
      <div className="flex h-full">
        <div className={`hidden md:block border-r border-border shrink-0 ${showFileTree ? "w-60" : "w-0 overflow-hidden"}`}>
          <FileTree />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <h2 className="mb-2">笔记未找到</h2>
          <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
            该笔记可能已被删除或移入回收站。
          </p>
          <button
            onClick={() => router.push("/workspace")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            style={{ fontSize: 13 }}
          >
            <ChevronLeft size={15} />
            返回工作区
          </button>
        </div>
      </div>
    );
  }

  const folder = activeNote ? state.folders.find((f) => f.id === activeNote.folderId) : null;
  const wordCount = activeNote ? activeNote.content.split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeNote ? activeNote.content.length : 0;

  return (
    <div className="flex h-full overflow-hidden">
      {/* File Tree - desktop */}
      <div className={`hidden md:block border-r border-border shrink-0 transition-all duration-200 ${showFileTree ? "w-60" : "w-0 overflow-hidden"}`}>
        <FileTree />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 h-12 border-b border-border shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="hidden md:flex p-1.5 rounded hover:bg-accent text-muted-foreground shrink-0"
              onClick={() => setShowFileTree(!showFileTree)}
              title="切换文件树"
            >
              {showFileTree ? <PanelRightClose size={15} className="rotate-180" /> : <PanelRight size={15} className="rotate-180" />}
            </button>
            <button
              className="md:hidden p-1.5 rounded hover:bg-accent text-muted-foreground shrink-0"
              onClick={() => router.push("/workspace")}
            >
              <ChevronLeft size={16} />
            </button>
            {folder && (
              <span className="text-muted-foreground shrink-0 hidden sm:inline" style={{ fontSize: 12 }}>
                {folder.name} /
              </span>
            )}
            <span className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>
              {activeNote?.title}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Save Status */}
            <div className="flex items-center gap-1 text-muted-foreground mr-1" style={{ fontSize: 12 }}>
              {saveStatusIcon()}
              <span className="hidden sm:inline">{saveStatusText()}</span>
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
              className={`p-1.5 rounded transition-colors ${
                state.previewOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
              title="Toggle preview (Ctrl/Cmd+P)"
            >
              {state.previewOpen ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={() => setShowProperties(!showProperties)}
              className={`p-1.5 rounded transition-colors ${
                showProperties ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
              title="属性"
            >
              <Tag size={15} />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded transition-colors hidden sm:flex ${
                showHistory ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
              title="历史记录"
            >
              <History size={15} />
            </button>
            <button
              onClick={handleExportNote}
              className="p-1.5 rounded text-muted-foreground hover:bg-accent transition-colors hidden sm:flex"
              title="导出笔记"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => {
                if (activeNote) {
                  dispatch({ type: "CREATE_SNAPSHOT", noteId: activeNote.id });
                  triggerSave();
                  toast.success("笔记已保存");
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ fontSize: 12 }}
            >
              <Save size={13} />
              保存
            </button>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Column */}
          <div className={`flex flex-col overflow-hidden ${state.previewOpen ? "w-1/2 border-r border-border" : "flex-1"}`}>
            {/* Title */}
            <div className="px-4 sm:px-6 pt-4 pb-2">
              <input
                className="w-full bg-transparent outline-none border-none placeholder:text-muted-foreground"
                style={{ fontSize: 20, fontWeight: 600 }}
                value={activeNote?.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="笔记标题..."
              />
            </div>
            {/* Tags bar */}
            {activeNote && activeNote.tags.length > 0 && (
              <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-1">
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    style={{ fontSize: 11 }}
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Textarea */}
            <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4">
              <textarea
                ref={editorRef}
                className="w-full h-full resize-none bg-transparent outline-none font-mono"
                style={{
                  fontSize: state.editorFontSize,
                  lineHeight: 1.7,
                  tabSize: 2,
                }}
                value={activeNote?.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="开始用 Markdown 写作..."
                spellCheck={false}
              />
            </div>
            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-t border-border text-muted-foreground" style={{ fontSize: 11 }}>
              <div className="flex items-center gap-3">
                <span>{wordCount} 字</span>
                <span>{charCount} 字符</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">Markdown</span>
                <span className="hidden sm:inline">
                  <Command size={9} className="inline mb-px" />S 保存
                </span>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          {state.previewOpen && (
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: 12, fontWeight: 500 }}>预览</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                <MarkdownPreview content={activeNote?.content || ""} />
              </div>
            </div>
          )}

          {/* Properties Panel */}
          {showProperties && (
            <div className="w-64 border-l border-border flex flex-col overflow-hidden shrink-0 hidden md:flex">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <span style={{ fontSize: 12, fontWeight: 500 }}>属性</span>
                <button onClick={() => setShowProperties(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-muted-foreground mb-1 block" style={{ fontSize: 11, fontWeight: 500 }}>创建时间</label>
                  <div style={{ fontSize: 13 }}>{activeNote ? format(new Date(activeNote.createdAt), "MMM d, yyyy HH:mm") : "-"}</div>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block" style={{ fontSize: 11, fontWeight: 500 }}>修改时间</label>
                  <div style={{ fontSize: 13 }}>{activeNote ? format(new Date(activeNote.updatedAt), "MMM d, yyyy HH:mm") : "-"}</div>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block" style={{ fontSize: 11, fontWeight: 500 }}>文件夹</label>
                  <div style={{ fontSize: 13 }}>{folder?.name || "未归档"}</div>
                </div>
                <div>
                  <label className="text-muted-foreground mb-2 block" style={{ fontSize: 11, fontWeight: 500 }}>标签</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activeNote?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        style={{ fontSize: 11 }}
                      >
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-foreground">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      className="flex-1 px-2 py-1 rounded border border-border bg-background outline-none min-w-0"
                      style={{ fontSize: 12 }}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                      placeholder="添加标签..."
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
                      style={{ fontSize: 11 }}
                    >
                      添加
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block" style={{ fontSize: 11, fontWeight: 500 }}>统计</label>
                  <div className="space-y-1" style={{ fontSize: 13 }}>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">字数</span>
                      <span>{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">字符数</span>
                      <span>{charCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">快照数</span>
                      <span>{activeNote?.snapshots.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="w-72 border-l border-border flex flex-col overflow-hidden shrink-0 hidden md:flex">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <span style={{ fontSize: 12, fontWeight: 500 }}>历史记录</span>
                <button onClick={() => setShowHistory(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeNote && activeNote.snapshots.length > 0 ? (
                  activeNote.snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{snap.title}</span>
                      </div>
                      <div className="text-muted-foreground mb-2" style={{ fontSize: 11 }}>
                        {format(new Date(snap.createdAt), "MMM d, HH:mm:ss")}
                      </div>
                      <div className="text-muted-foreground line-clamp-2 mb-2" style={{ fontSize: 11 }}>
                        {snap.content.substring(0, 80)}...
                      </div>
                      <button
                        onClick={() => handleRestoreSnapshot(snap.id)}
                        className="px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
                        style={{ fontSize: 11 }}
                      >
                        恢复
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                    <History size={24} className="text-muted-foreground mb-2" />
                    <p className="text-muted-foreground" style={{ fontSize: 13 }}>暂无快照</p>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: 11 }}>
                      按 <Command size={9} className="inline mb-px" />S 保存快照
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
