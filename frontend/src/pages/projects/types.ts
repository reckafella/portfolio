export interface ProjectFormData {
  title: string;
  description: string;
  project_type: string;
  category: string;
  client: string;
  project_url: string;
  images: File[];
  youtube_urls: string[];
  existing_images?: Array<{ id: number; url: string }>;
  existing_videos?: Array<{ id: number; youtube_url: string }>;
  images_to_delete?: number[];
  videos_to_delete?: number[];
}

export interface AutoSaveState {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

// Project type and category options
export const PROJECT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'client', label: 'Client' },
  { value: 'open-source', label: 'Open Source' },
];

export const CATEGORIES = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'Desktop Application', label: 'Desktop Application' },
  { value: 'API Development', label: 'API Development' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Other', label: 'Other' },
];
