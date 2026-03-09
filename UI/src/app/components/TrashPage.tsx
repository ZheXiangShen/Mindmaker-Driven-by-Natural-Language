"use client";

import { useStore } from "@/app/store";
import {
  Trash2, RotateCcw, FileText, Clock, Search, Loader2
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";

export function TrashPage() {
  const { state, dispatch } = useStore();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const trashedNotes = state.notes
    .filter((n) => n.deleted)
    .sort((a, b) => new Date(b.deletedAt || "").getTime() - new Date(a.deletedAt || "").getTime());

  const filteredNotes = searchQuery
    ? trashedNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trashedNotes;

  const handleRestore = (id: string) => {
    dispatch({ type: "RESTORE_NOTE", id });
    toast.success("笔记已恢复");
  };

  const handlePermanentDelete = (id: string) => {
    dispatch({ type: "PERMANENTLY_DELETE_NOTE", id });
    setConfirmDeleteId(null);
    toast.success("笔记已永久删除");
  };

  const handleEmptyTrash = () => {
    dispatch({ type: "EMPTY_TRASH" });
    setConfirmEmpty(false);
    toast.success("回收站已清空");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="flex items-center gap-2">
              <Trash2 size={22} className="text-muted-foreground" />
              回收站
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
              {trashedNotes.length} 篇已删除笔记。在永久删除前会一直保留。
            </p>
            {state.notesError && (
              <p className="text-destructive mt-2" style={{ fontSize: 12 }}>
                {state.notesError}
              </p>
            )}
          </div>
          {trashedNotes.length > 0 && (
            <button
              onClick={() => setConfirmEmpty(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
              style={{ fontSize: 13 }}
            >
              <Trash2 size={14} />
              清空回收站
            </button>
          )}
        </div>

        {/* Search */}
        {trashedNotes.length > 3 && (
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background outline-none"
              style={{ fontSize: 13 }}
              placeholder="搜索回收站..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {state.notesLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-6" style={{ fontSize: 13 }}>
            <Loader2 size={14} className="animate-spin" />
            正在加载回收站...
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2">
          {filteredNotes.map((note) => {
            const folder = state.folders.find((f) => f.id === note.folderId);
            return (
              <div
                key={note.id}
                className="p-4 rounded-xl border border-border hover:border-border/80 transition-all bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-muted-foreground shrink-0" />
                      <span className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{note.title}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mb-2 ml-6" style={{ fontSize: 12 }}>
                      {note.content.replace(/[#*`>\-|[\]()]/g, "").substring(0, 120)}
                    </p>
                    <div className="flex items-center gap-3 ml-6 text-muted-foreground" style={{ fontSize: 11 }}>
                      {folder && (
                        <span className="flex items-center gap-1">
                          {folder.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Deleted {note.deletedAt ? formatDistanceToNow(new Date(note.deletedAt), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestore(note.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
                      style={{ fontSize: 12 }}
                    >
                      <RotateCcw size={13} />
                      恢复
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(note.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                      style={{ fontSize: 12 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {!state.notesLoading && trashedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Trash2 size={28} className="text-muted-foreground" />
            </div>
            <h2 className="mb-2">回收站为空</h2>
            <p className="text-muted-foreground" style={{ fontSize: 14, maxWidth: 320 }}>
              删除的笔记将显示在这里。你可以恢复或永久删除它们。
            </p>
          </div>
        )}
        {!state.notesLoading && trashedNotes.length > 0 && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h2 className="mb-2">没有匹配结果</h2>
            <p className="text-muted-foreground" style={{ fontSize: 14, maxWidth: 320 }}>
              试试其他关键词。
            </p>
          </div>
        )}

        <ConfirmDialog
          open={confirmEmpty}
          title="清空回收站"
          description={`回收站中的 ${trashedNotes.length} 篇笔记将被永久删除。此操作无法恢复。`}
          confirmLabel="全部删除"
          destructive
          onCancel={() => setConfirmEmpty(false)}
          onConfirm={handleEmptyTrash}
        />

        <ConfirmDialog
          open={Boolean(confirmDeleteId)}
          title="永久删除"
          description="此笔记将被永久删除。此操作无法撤销。"
          confirmLabel="删除"
          destructive
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            if (confirmDeleteId) {
              handlePermanentDelete(confirmDeleteId);
            }
          }}
        />
      </div>
    </div>
  );
}
