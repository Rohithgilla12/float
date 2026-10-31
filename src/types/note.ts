export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  colorTag?: string;
}

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'Blocks' | 'Formatting' | 'Utility';
  insertText: string;
}
