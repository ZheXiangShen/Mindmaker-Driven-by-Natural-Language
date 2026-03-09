"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/store";
import {
  FileText, Plus, Search, Clock, Tag, FolderOpen, Trash2,
  ArrowRight, BookOpen, Command, Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const { state, createNote, getAllTags } = useStore();
  const router = useRouter();

  const activeNotes = state.notes.filter((n) => !n.deleted);
  const recentNotes = [...activeNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);
  const totalNotes = activeNotes.length;
  const totalFolders = state.folders.length;
  const totalTags = getAllTags().length;
  const trashCount = state.notes.filter((n) => n.deleted).length;

  const handleNewNote = () => {
    const id = createNote();
    router.push(`/workspace/${id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="mb-1">欢迎回来</h1>
          <p className="text-muted-foreground" style={{ fontSize: 14 }}>
            你有 {totalNotes} 篇笔记，分布在 {totalFolders} 个文件夹中。继续写作吧。
          </p>
          {state.notesError && (
            <p className="mt-2 text-destructive" style={{ fontSize: 12 }}>
              {state.notesError}
            </p>
          )}
        </div>

        {state.notesLoading && (
          <div className="mb-8 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 13 }}>
            <Loader2 size={14} className="animate-spin" />
            正在加载笔记...
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={handleNewNote}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 13, fontWeight: 500 }}>新建笔记</div>
              <div className="text-muted-foreground hidden sm:block" style={{ fontSize: 11 }}>
                <Command size={9} className="inline mb-px" />N
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Search size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 13, fontWeight: 500 }}>搜索</div>
              <div className="text-muted-foreground hidden sm:block" style={{ fontSize: 11 }}>
                <Command size={9} className="inline mb-px" />K
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push("/workspace")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 13, fontWeight: 500 }}>工作区</div>
              <div className="text-muted-foreground hidden sm:block" style={{ fontSize: 11 }}>全部笔记</div>
            </div>
          </button>
          <button
            onClick={() => router.push("/trash")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Trash2 size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 13, fontWeight: 500 }}>回收站</div>
              <div className="text-muted-foreground hidden sm:block" style={{ fontSize: 11 }}>{trashCount} 项</div>
            </div>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-accent/30 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>笔记</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalNotes}</div>
          </div>
          <div className="p-4 rounded-xl bg-accent/30 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>文件夹</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalFolders}</div>
          </div>
          <div className="p-4 rounded-xl bg-accent/30 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>标签</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalTags}</div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              最近编辑
            </h3>
            <button
              onClick={() => router.push("/workspace")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 13 }}
            >
              查看全部 <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNotes.map((note) => {
              const folder = state.folders.find((f) => f.id === note.folderId);
              return (
                <button
                  key={note.id}
                  onClick={() => router.push(`/workspace/${note.id}`)}
                  className="text-left p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{note.title}</div>
                      {folder && (
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5" style={{ fontSize: 11 }}>
                          <FolderOpen size={11} />
                          {folder.name}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-3" style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {note.content.replace(/[#*`>\-|[\]()]/g, "").substring(0, 100)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          style={{ fontSize: 10 }}
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground" style={{ fontSize: 10 }}>
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground shrink-0" style={{ fontSize: 11 }}>
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {!state.notesLoading && totalNotes === 0 && (
            <div className="mt-3 p-6 rounded-xl border border-dashed border-border text-center">
              <p style={{ fontSize: 14, fontWeight: 500 }}>还没有笔记</p>
              <p className="text-muted-foreground mt-1 mb-4" style={{ fontSize: 12 }}>
                从第一篇 Markdown 笔记开始。
              </p>
              <button
                onClick={handleNewNote}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ fontSize: 12 }}
              >
                <Plus size={14} />
                新建笔记
              </button>
            </div>
          )}
        </div>

        {/* Tags Cloud */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-muted-foreground" />
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {getAllTags().map((tag) => {
              const count = activeNotes.filter((n) => n.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    router.push("/search");
                  }}
                  className="px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:border-primary/20 transition-all"
                  style={{ fontSize: 12 }}
                >
                  <span className="text-muted-foreground mr-1">#</span>
                  {tag}
                  <span className="text-muted-foreground ml-1.5" style={{ fontSize: 11 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
