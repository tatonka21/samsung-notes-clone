import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface FilesState {
  items: FileItem[];
  selectedId: string | null;
  expandedFolders: string[];
}

const saved = localStorage.getItem("filesState");
const initialState: FilesState = saved
  ? JSON.parse(saved)
  : {
      items: [
        {
          id: "root-docs",
          name: "Documents",
          type: "folder",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "root-projects",
          name: "Projects",
          type: "folder",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "root-research",
          name: "Research",
          type: "folder",
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      selectedId: null,
      expandedFolders: [],
    };

function persist(state: FilesState) {
  localStorage.setItem("filesState", JSON.stringify(state));
}

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    createItem: (
      state,
      action: PayloadAction<{
        name: string;
        type: "file" | "folder";
        parentId: string | null;
        content?: string;
        mimeType?: string;
        tags?: string[];
      }>
    ) => {
      const item: FileItem = {
        id: nanoid(),
        name: action.payload.name,
        type: action.payload.type,
        parentId: action.payload.parentId,
        content: action.payload.content || "",
        mimeType: action.payload.mimeType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: action.payload.tags || [],
      };
      state.items.push(item);
      state.selectedId = item.id;
      persist(state);
    },
    updateItem: (
      state,
      action: PayloadAction<Partial<FileItem> & { id: string }>
    ) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
        persist(state);
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      const toDelete = new Set<string>();
      const collect = (id: string) => {
        toDelete.add(id);
        state.items
          .filter((i) => i.parentId === id)
          .forEach((i) => collect(i.id));
      };
      collect(action.payload);
      state.items = state.items.filter((i) => !toDelete.has(i.id));
      if (state.selectedId && toDelete.has(state.selectedId)) {
        state.selectedId = null;
      }
      persist(state);
    },
    selectItem: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    toggleFolder: (state, action: PayloadAction<string>) => {
      const idx = state.expandedFolders.indexOf(action.payload);
      if (idx >= 0) {
        state.expandedFolders.splice(idx, 1);
      } else {
        state.expandedFolders.push(action.payload);
      }
      persist(state);
    },
    bulkCreateItems: (state, action: PayloadAction<FileItem[]>) => {
      state.items.push(...action.payload);
      persist(state);
    },
  },
});

export default filesSlice;
