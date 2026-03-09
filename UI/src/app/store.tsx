"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";

export interface Snapshot {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt: string | null;
  snapshots: Snapshot[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  expanded: boolean;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface AppState {
  notes: Note[];
  notesLoading: boolean;
  notesError: string | null;
  folders: Folder[];
  activeNoteId: string | null;
  saveStatus: SaveStatus;
  searchQuery: string;
  searchTagFilter: string[];
  sidebarOpen: boolean;
  previewOpen: boolean;
  darkMode: boolean;
  editorFontSize: number;
  autoSaveInterval: number;
  showLineNumbers: boolean;
}

type Action =
  | { type: "SET_NOTES"; notes: Note[] }
  | { type: "SET_NOTES_LOADING"; loading: boolean }
  | { type: "SET_NOTES_ERROR"; error: string | null }
  | { type: "SET_FOLDERS"; folders: Folder[] }
  | { type: "CREATE_NOTE"; note: Note }
  | { type: "UPDATE_NOTE"; id: string; updates: Partial<Note> }
  | { type: "DELETE_NOTE"; id: string }
  | { type: "RESTORE_NOTE"; id: string }
  | { type: "PERMANENTLY_DELETE_NOTE"; id: string }
  | { type: "EMPTY_TRASH" }
  | { type: "CREATE_FOLDER"; folder: Folder }
  | { type: "RENAME_FOLDER"; id: string; name: string }
  | { type: "DELETE_FOLDER"; id: string }
  | { type: "TOGGLE_FOLDER"; id: string }
  | { type: "SET_ACTIVE_NOTE"; id: string | null }
  | { type: "SET_SAVE_STATUS"; status: SaveStatus }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_SEARCH_TAG_FILTER"; tags: string[] }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_EDITOR_FONT_SIZE"; size: number }
  | { type: "SET_AUTO_SAVE_INTERVAL"; interval: number }
  | { type: "SET_SHOW_LINE_NUMBERS"; show: boolean }
  | { type: "CREATE_SNAPSHOT"; noteId: string }
  | { type: "RESTORE_SNAPSHOT"; noteId: string; snapshotId: string }
  | { type: "IMPORT_NOTES"; notes: Note[] }
  | {
      type: "LOAD_SETTINGS";
      settings: Partial<Pick<AppState, "folders" | "darkMode" | "editorFontSize" | "autoSaveInterval" | "showLineNumbers" | "sidebarOpen" | "previewOpen">>;
    };

const uid = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

const seedFolders: Folder[] = [
  { id: "f1", name: "快速入门", parentId: null, expanded: true },
  { id: "f2", name: "项目", parentId: null, expanded: false },
  { id: "f3", name: "Web 开发", parentId: "f2", expanded: false },
  { id: "f4", name: "读书笔记", parentId: null, expanded: false },
  { id: "f5", name: "个人", parentId: null, expanded: false },
];

const initialState: AppState = {
  notes: [],
  notesLoading: true,
  notesError: null,
  folders: seedFolders,
  activeNoteId: null,
  saveStatus: "idle",
  searchQuery: "",
  searchTagFilter: [],
  sidebarOpen: true,
  previewOpen: true,
  darkMode: false,
  editorFontSize: 14,
  autoSaveInterval: 3,
  showLineNumbers: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_SETTINGS":
      return { ...state, ...action.settings };
    case "SET_NOTES":
      return { ...state, notes: action.notes };
    case "SET_NOTES_LOADING":
      return { ...state, notesLoading: action.loading };
    case "SET_NOTES_ERROR":
      return { ...state, notesError: action.error };
    case "SET_FOLDERS":
      return { ...state, folders: action.folders };
    case "CREATE_NOTE":
      return { ...state, notes: [action.note, ...state.notes], activeNoteId: action.note.id };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, ...action.updates, updatedAt: now() } : n,
        ),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, deleted: true, deletedAt: now() } : n,
        ),
        activeNoteId: state.activeNoteId === action.id ? null : state.activeNoteId,
      };
    case "RESTORE_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, deleted: false, deletedAt: null } : n,
        ),
      };
    case "PERMANENTLY_DELETE_NOTE":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    case "EMPTY_TRASH":
      return { ...state, notes: state.notes.filter((n) => !n.deleted) };
    case "CREATE_FOLDER":
      return { ...state, folders: [...state.folders, action.folder] };
    case "RENAME_FOLDER":
      return {
        ...state,
        folders: state.folders.map((f) => (f.id === action.id ? { ...f, name: action.name } : f)),
      };
    case "DELETE_FOLDER":
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.id),
        notes: state.notes.map((n) => (n.folderId === action.id ? { ...n, folderId: null } : n)),
      };
    case "TOGGLE_FOLDER":
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.id === action.id ? { ...f, expanded: !f.expanded } : f,
        ),
      };
    case "SET_ACTIVE_NOTE":
      return { ...state, activeNoteId: action.id };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_SEARCH_TAG_FILTER":
      return { ...state, searchTagFilter: action.tags };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "TOGGLE_PREVIEW":
      return { ...state, previewOpen: !state.previewOpen };
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "SET_EDITOR_FONT_SIZE":
      return { ...state, editorFontSize: action.size };
    case "SET_AUTO_SAVE_INTERVAL":
      return { ...state, autoSaveInterval: action.interval };
    case "SET_SHOW_LINE_NUMBERS":
      return { ...state, showLineNumbers: action.show };
    case "CREATE_SNAPSHOT": {
      const note = state.notes.find((n) => n.id === action.noteId);
      if (!note) return state;
      const snap: Snapshot = { id: uid(), content: note.content, title: note.title, createdAt: now() };
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.noteId ? { ...n, snapshots: [snap, ...n.snapshots].slice(0, 20) } : n,
        ),
      };
    }
    case "RESTORE_SNAPSHOT": {
      const note = state.notes.find((n) => n.id === action.noteId);
      if (!note) return state;
      const snap = note.snapshots.find((s) => s.id === action.snapshotId);
      if (!snap) return state;
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.noteId
            ? { ...n, content: snap.content, title: snap.title, updatedAt: now() }
            : n,
        ),
      };
    }
    case "IMPORT_NOTES":
      return { ...state, notes: [...action.notes, ...state.notes] };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  createNote: (folderId?: string | null) => string;
  getAllTags: () => string[];
  refreshNotes: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const updateTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadNotes = useCallback(async () => {
    rawDispatch({ type: "SET_NOTES_LOADING", loading: true });
    rawDispatch({ type: "SET_NOTES_ERROR", error: null });

    try {
      const data = await fetchJson<{ notes: Note[] }>("/api/notes", { cache: "no-store" });
      rawDispatch({ type: "SET_NOTES", notes: data.notes });
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载笔记失败";
      rawDispatch({ type: "SET_NOTES_ERROR", error: message });
    } finally {
      rawDispatch({ type: "SET_NOTES_LOADING", loading: false });
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mindmark-ui-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        rawDispatch({ type: "LOAD_SETTINGS", settings: parsed });
      }
    } catch {
      // ignore invalid local settings
    }

    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const settings = {
      folders: state.folders,
      darkMode: state.darkMode,
      editorFontSize: state.editorFontSize,
      autoSaveInterval: state.autoSaveInterval,
      showLineNumbers: state.showLineNumbers,
      sidebarOpen: state.sidebarOpen,
      previewOpen: state.previewOpen,
    };
    localStorage.setItem("mindmark-ui-settings", JSON.stringify(settings));
  }, [
    state.folders,
    state.darkMode,
    state.editorFontSize,
    state.autoSaveInterval,
    state.showLineNumbers,
    state.sidebarOpen,
    state.previewOpen,
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  const syncNote = useCallback(async (noteId: string) => {
    const note = stateRef.current.notes.find((item) => item.id === noteId);
    if (!note) return;

    await fetchJson(`/api/notes/${noteId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: note.title,
        content: note.content,
        folderId: note.folderId,
        folderName: note.folderId
          ? stateRef.current.folders.find((folder) => folder.id === note.folderId)?.name
          : undefined,
        tags: note.tags,
        deleted: note.deleted,
        deletedAt: note.deletedAt,
      }),
    });
  }, []);

  const scheduleNoteSync = useCallback((noteId: string) => {
    const timer = updateTimers.current.get(noteId);
    if (timer) {
      window.clearTimeout(timer);
    }

    const nextTimer = window.setTimeout(() => {
      void syncNote(noteId).catch((error) => {
        const message = error instanceof Error ? error.message : "同步笔记失败";
        rawDispatch({ type: "SET_NOTES_ERROR", error: message });
      });
      updateTimers.current.delete(noteId);
    }, 500);

    updateTimers.current.set(noteId, nextTimer);
  }, [syncNote]);

  const syncAction = useCallback(async (action: Action, prevState: AppState) => {
    try {
      switch (action.type) {
        case "CREATE_NOTE": {
          await fetchJson("/api/notes", {
            method: "POST",
            body: JSON.stringify({
              id: action.note.id,
              title: action.note.title,
              content: action.note.content,
              folderId: action.note.folderId,
              folderName: action.note.folderId
                ? prevState.folders.find((folder) => folder.id === action.note.folderId)?.name
                : undefined,
              tags: action.note.tags,
              deleted: action.note.deleted,
              deletedAt: action.note.deletedAt,
            }),
          });
          break;
        }
        case "UPDATE_NOTE":
          scheduleNoteSync(action.id);
          break;
        case "RESTORE_SNAPSHOT":
          scheduleNoteSync(action.noteId);
          break;
        case "DELETE_NOTE": {
          const timer = updateTimers.current.get(action.id);
          if (timer) window.clearTimeout(timer);
          await fetchJson(`/api/notes/${action.id}`, { method: "DELETE" });
          break;
        }
        case "RESTORE_NOTE": {
          const timer = updateTimers.current.get(action.id);
          if (timer) window.clearTimeout(timer);
          await fetchJson(`/api/notes/${action.id}/restore`, { method: "POST" });
          break;
        }
        case "PERMANENTLY_DELETE_NOTE": {
          const timer = updateTimers.current.get(action.id);
          if (timer) window.clearTimeout(timer);
          await fetchJson(`/api/notes/${action.id}?hard=1`, { method: "DELETE" });
          break;
        }
        case "EMPTY_TRASH": {
          const deletedIds = prevState.notes.filter((note) => note.deleted).map((note) => note.id);
          await Promise.all(
            deletedIds.map(async (id) => {
              const timer = updateTimers.current.get(id);
              if (timer) window.clearTimeout(timer);
              await fetchJson(`/api/notes/${id}?hard=1`, { method: "DELETE" });
            }),
          );
          break;
        }
        case "IMPORT_NOTES": {
          await Promise.all(
            action.notes.map((note) =>
              fetchJson("/api/notes", {
                method: "POST",
                body: JSON.stringify({
                  id: note.id,
                  title: note.title,
                  content: note.content,
                  folderId: note.folderId,
                  folderName: note.folderId
                    ? prevState.folders.find((folder) => folder.id === note.folderId)?.name
                    : undefined,
                  tags: note.tags,
                }),
              }),
            ),
          );
          break;
        }
        default:
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "同步失败";
      rawDispatch({ type: "SET_NOTES_ERROR", error: message });
    }
  }, [scheduleNoteSync]);

  const dispatch = useCallback((action: Action) => {
    const prevState = stateRef.current;
    rawDispatch(action);
    void syncAction(action, prevState);
  }, [syncAction]);

  const createNote = useCallback(
    (folderId: string | null = null) => {
      const id = uid();
      const note: Note = {
        id,
        title: "无标题笔记",
        content: "",
        folderId,
        tags: [],
        createdAt: now(),
        updatedAt: now(),
        deleted: false,
        deletedAt: null,
        snapshots: [],
      };
      dispatch({ type: "CREATE_NOTE", note });
      return id;
    },
    [dispatch],
  );

  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    state.notes.filter((note) => !note.deleted).forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [state.notes]);

  return (
    <StoreContext.Provider value={{ state, dispatch, createNote, getAllTags, refreshNotes: loadNotes }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
