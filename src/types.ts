export interface Folder {
  id: string;
  name: string;
  updatedAt: number;
  isExpanded?: boolean;
  parentId?: string | null;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  folderId?: string | null;
}
