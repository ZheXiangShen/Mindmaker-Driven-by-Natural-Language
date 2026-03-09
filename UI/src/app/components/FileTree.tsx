"use client";

import { useStore, Folder, Note } from "@/app/store";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight, ChevronDown, FolderOpen, Folder as FolderIcon,
  FileText, Plus, MoreHorizontal, Pencil, Trash2, FolderPlus, Loader2
} from "lucide-react";
import { useState } from "react";

export function FileTree() {
  const { state, dispatch, createNote } = useStore();
  const router = useRouter();
  const params = useParams<{ noteId?: string | string[] }>();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: "folder" | "note"; id: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const activeNotes = state.notes.filter((n) => !n.deleted);
  const rootFolders = state.folders.filter((f) => f.parentId === null);
  const unfiledNotes = activeNotes.filter((n) => !n.folderId);

  const handleNoteClick = (noteId: string) => {
    router.push(`/workspace/${noteId}`);
  };

  const handleNewNoteInFolder = (folderId: string) => {
    const id = createNote(folderId);
    router.push(`/workspace/${id}`);
    setContextMenu(null);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      // Check if it's a folder or note
      const isFolder = state.folders.some((f) => f.id === renamingId);
      if (isFolder) {
        dispatch({ type: "RENAME_FOLDER", id: renamingId, name: renameValue.trim() });
      } else {
        dispatch({ type: "UPDATE_NOTE", id: renamingId, updates: { title: renameValue.trim() } });
      }
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleCreateFolder = (parentId: string | null) => {
    setNewFolderParent(parentId);
    setNewFolderName("");
    setContextMenu(null);
  };

  const handleFinishCreateFolder = () => {
    if (newFolderName.trim()) {
      const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      dispatch({
        type: "CREATE_FOLDER",
        folder: { id, name: newFolderName.trim(), parentId: newFolderParent, expanded: false },
      });
    }
    setNewFolderParent(null);
    setNewFolderName("");
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const childFolders = state.folders.filter((f) => f.parentId === folder.id);
    const folderNotes = activeNotes.filter((n) => n.folderId === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors group`}
          style={{ paddingLeft: 8 + depth * 16, fontSize: 13 }}
          onClick={() => dispatch({ type: "TOGGLE_FOLDER", id: folder.id })}
        >
          {folder.expanded ? (
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
          )}
          {folder.expanded ? (
            <FolderOpen size={14} className="shrink-0 text-muted-foreground" />
          ) : (
            <FolderIcon size={14} className="shrink-0 text-muted-foreground" />
          )}
          {renamingId === folder.id ? (
            <input
              className="flex-1 bg-background border border-border rounded px-1 py-0 min-w-0 outline-none"
              style={{ fontSize: 13 }}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishRename();
                if (e.key === "Escape") { setRenamingId(null); }
              }}
              onBlur={handleFinishRename}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate flex-1 ml-1">{folder.name}</span>
          )}
          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" style={{ fontSize: 11 }}>
            {folderNotes.length}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                type: "folder",
                id: folder.id,
              });
            }}
          >
            <MoreHorizontal size={13} className="text-muted-foreground" />
          </button>
        </div>
        {folder.expanded && (
          <div>
            {childFolders.map((child) => renderFolder(child, depth + 1))}
            {newFolderParent === folder.id && (
              <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: 24 + depth * 16 }}>
                <FolderIcon size={14} className="text-muted-foreground shrink-0" />
                <input
                  className="flex-1 bg-background border border-border rounded px-1.5 py-0.5 min-w-0 outline-none"
                  style={{ fontSize: 12 }}
                  placeholder="文件夹名称..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFinishCreateFolder();
                    if (e.key === "Escape") setNewFolderParent(null);
                  }}
                  onBlur={handleFinishCreateFolder}
                  autoFocus
                />
              </div>
            )}
            {folderNotes.map((note) => renderNote(note, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNote = (note: Note, depth: number = 0) => {
    const activeNoteId = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;
    const isActive = activeNoteId === note.id;
    return (
      <div
        key={note.id}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
          isActive ? "bg-accent" : "hover:bg-accent/50"
        }`}
        style={{ paddingLeft: 24 + depth * 16, fontSize: 13 }}
        onClick={() => handleNoteClick(note.id)}
      >
        <FileText size={14} className="shrink-0 text-muted-foreground" />
        {renamingId === note.id ? (
          <input
            className="flex-1 bg-background border border-border rounded px-1 py-0 min-w-0 outline-none"
            style={{ fontSize: 13 }}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFinishRename();
              if (e.key === "Escape") setRenamingId(null);
            }}
            onBlur={handleFinishRename}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{note.title}</span>
        )}
        <button
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              type: "note",
              id: note.id,
            });
          }}
        >
          <MoreHorizontal size={13} className="text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }} className="text-muted-foreground">
          文件
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCreateFolder(null)}
            className="p-1 rounded hover:bg-accent text-muted-foreground"
            title="新建文件夹"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={() => {
              const id = createNote();
              router.push(`/workspace/${id}`);
            }}
            className="p-1 rounded hover:bg-accent text-muted-foreground"
            title="新建笔记"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1 px-1">
        {state.notesLoading && (
          <div className="px-3 py-3 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
            <Loader2 size={13} className="animate-spin" />
            加载笔记中...
          </div>
        )}
        {state.notesError && !state.notesLoading && (
          <div className="px-3 py-2 text-destructive" style={{ fontSize: 11 }}>
            {state.notesError}
          </div>
        )}
        {rootFolders.map((folder) => renderFolder(folder))}
        {unfiledNotes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="px-3 mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 11, fontWeight: 500 }}>未归档</span>
            </div>
            {unfiledNotes.map((note) => renderNote(note))}
          </div>
        )}
        {!state.notesLoading && activeNotes.length === 0 && (
          <div className="px-3 py-4 text-muted-foreground text-center" style={{ fontSize: 12 }}>
            暂无笔记，点击上方 + 创建
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-40"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === "folder" && (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => handleNewNoteInFolder(contextMenu.id)}
                >
                  <Plus size={14} /> 在此新建笔记
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => handleCreateFolder(contextMenu.id)}
                >
                  <FolderPlus size={14} /> 新建子文件夹
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    const folder = state.folders.find((f) => f.id === contextMenu.id);
                    if (folder) handleStartRename(folder.id, folder.name);
                  }}
                >
                  <Pencil size={14} /> 重命名
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/10 text-destructive transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    dispatch({ type: "DELETE_FOLDER", id: contextMenu.id });
                    setContextMenu(null);
                  }}
                >
                  <Trash2 size={14} /> 删除文件夹
                </button>
              </>
            )}
            {contextMenu.type === "note" && (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    const note = state.notes.find((n) => n.id === contextMenu.id);
                    if (note) handleStartRename(note.id, note.title);
                  }}
                >
                  <Pencil size={14} /> 重命名
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/10 text-destructive transition-colors"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    dispatch({ type: "DELETE_NOTE", id: contextMenu.id });
                    setContextMenu(null);
                  }}
                >
                  <Trash2 size={14} /> 移入回收站
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
