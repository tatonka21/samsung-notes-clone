import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import filesSlice, { FileItem } from "store/slices/files";
import { nanoid } from "@reduxjs/toolkit";

const useFiles = () => {
  const dispatch = useDispatch();
  const filesState = useSelector((state: RootState) => state.files);

  const selectedItem = filesState.items.find(
    (i) => i.id === filesState.selectedId
  );

  const getChildren = (parentId: string | null) =>
    filesState.items.filter((i) => i.parentId === parentId);

  const createItem = (
    name: string,
    type: "file" | "folder",
    parentId: string | null,
    content?: string,
    tags?: string[]
  ) => {
    dispatch(filesSlice.actions.createItem({ name, type, parentId, content, tags }));
  };

  const updateItem = (id: string, updates: Partial<FileItem>) => {
    dispatch(filesSlice.actions.updateItem({ id, ...updates }));
  };

  const deleteItem = (id: string) => {
    dispatch(filesSlice.actions.deleteItem(id));
  };

  const selectItem = (id: string | null) => {
    dispatch(filesSlice.actions.selectItem(id));
  };

  const toggleFolder = (id: string) => {
    dispatch(filesSlice.actions.toggleFolder(id));
  };

  const bulkCreate = (items: FileItem[]) => {
    dispatch(filesSlice.actions.bulkCreateItems(items));
  };

  const createResearchProject = (
    topic: string,
    subtopics: string[],
    summaries: Record<string, string>
  ) => {
    const folderId = nanoid();
    const folderItem: FileItem = {
      id: folderId,
      name: topic,
      type: "folder",
      parentId: "root-research",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const fileItems: FileItem[] = subtopics.map((st) => ({
      id: nanoid(),
      name: `${st}.md`,
      type: "file",
      parentId: folderId,
      content: summaries[st] || `# ${st}\n\nResearch notes on ${st}...`,
      mimeType: "text/markdown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [topic],
    }));
    dispatch(filesSlice.actions.bulkCreateItems([folderItem, ...fileItems]));
  };

  return {
    filesState,
    selectedItem,
    getChildren,
    createItem,
    updateItem,
    deleteItem,
    selectItem,
    toggleFolder,
    bulkCreate,
    createResearchProject,
  };
};

export default useFiles;
