
export interface Channel {
  id: string;
  name: string;
  logo: string;
  link: string;
  category: string; // Changed from union type to string to support dynamic categories
  createdAt?: number;
}

export interface CategoryItem {
  id: string;
  label: string;
  isSystem?: boolean; // To prevent deleting essential categories like 'all'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export interface AppSettings {
  aboutContent: string;
  shareTitle: string;
  shareText: string;
  shareUrl: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  isEditing: boolean;
  editingId: string | null;
}
