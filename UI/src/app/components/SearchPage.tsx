"use client";

import React from "react";
import { useStore } from "@/app/store";
import { useRouter } from "next/navigation";
import {
  Search, X, FileText, FolderOpen, Filter, Command, Loader2
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SearchPage() {
  const { state, getAllTags } = useStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(state.searchQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(state.searchTagFilter);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const allTags = getAllTags();
  const activeNotes = state.notes.filter((n) => !n.deleted);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    let filtered = activeNotes;

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((n) => selectedTags.some((t) => n.tags.includes(t)));
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by relevance (title match first, then by updatedAt)
    return filtered.sort((a, b) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const aTitle = a.title.toLowerCase().includes(q);
        const bTitle = b.title.toLowerCase().includes(q);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [activeNotes, query, selectedTags]);

  const getContextSnippet = (content: string, q: string) => {
    if (!q.trim()) return content.replace(/[#*`>\-|[\]()]/g, "").substring(0, 120);
    const idx = content.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return content.replace(/[#*`>\-|[\]()]/g, "").substring(0, 120);
    const start = Math.max(0, idx - 40);
    const end = Math.min(content.length, idx + q.length + 80);
    let snippet = content.substring(start, end).replace(/[#*`>\-|[\]()]/g, "");
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet += "...";
    return snippet;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Search Header */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              className="w-full pl-11 pr-20 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              style={{ fontSize: 15 }}
              placeholder="按标题、内容或标签搜索笔记..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-muted text-muted-foreground" style={{ fontSize: 10 }}>
                <Command size={9} className="inline mb-px" />K
              </kbd>
            </div>
          </div>
          {state.notesError && (
            <p className="mt-2 text-destructive" style={{ fontSize: 12 }}>
              {state.notesError}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                showTagFilter || selectedTags.length > 0
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
              style={{ fontSize: 12 }}
            >
              <Filter size={13} />
              标签
              {selectedTags.length > 0 && (
                <span className="px-1.5 py-0 rounded-full bg-primary text-primary-foreground" style={{ fontSize: 10 }}>
                  {selectedTags.length}
                </span>
              )}
            </button>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: 12 }}
              >
                清除全部
              </button>
            )}
          </div>
          <span className="text-muted-foreground" style={{ fontSize: 12 }}>
            {results.length} 条{results.length === 1 ? "结果" : "结果"}
          </span>
        </div>

        {/* Tag Filter Panel */}
        {showTagFilter && (
          <div className="mb-4 p-3 rounded-xl border border-border bg-accent/20">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                  style={{ fontSize: 12 }}
                >
                  #{tag}
                </button>
              ))}
              {allTags.length === 0 && (
                <span className="text-muted-foreground" style={{ fontSize: 12 }}>暂无标签</span>
              )}
            </div>
          </div>
        )}

        {state.notesLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-6" style={{ fontSize: 13 }}>
            <Loader2 size={14} className="animate-spin" />
            正在加载可搜索笔记...
          </div>
        )}

        {/* Results */}
        <div className="space-y-1">
          {results.map((note) => {
            const folder = state.folders.find((f) => f.id === note.folderId);
            const snippet = getContextSnippet(note.content, query);
            return (
              <button
                key={note.id}
                onClick={() => router.push(`/workspace/${note.id}`)}
                className="w-full text-left p-4 rounded-xl border border-transparent hover:border-border hover:bg-accent/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <span className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>
                      {highlightText(note.title, query)}
                    </span>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2" style={{ fontSize: 11 }}>
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                {folder && (
                  <div className="flex items-center gap-1 text-muted-foreground mb-1 ml-6" style={{ fontSize: 11 }}>
                    <FolderOpen size={11} />
                    {folder.name}
                  </div>
                )}
                <p className="text-muted-foreground ml-6 mb-2" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  {highlightText(snippet, query)}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex gap-1 ml-6 flex-wrap">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        style={{ fontSize: 10 }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {!state.notesLoading && activeNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mb-1">还没有笔记</h3>
            <p className="text-muted-foreground" style={{ fontSize: 13, maxWidth: 320 }}>
              先创建一篇笔记，再回来搜索内容。
            </p>
          </div>
        )}
        {!state.notesLoading && activeNotes.length > 0 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mb-1">未找到结果</h3>
            <p className="text-muted-foreground" style={{ fontSize: 13, maxWidth: 320 }}>
              {query
                ? `没有匹配「${query}」的笔记，请尝试其他搜索词或调整筛选条件。`
                : "开始输入以搜索所有笔记。"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
