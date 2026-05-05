export type IdeaCategory = 'Idea' | 'Claim' | 'Definition' | 'Reference' | 'Narrative' | 'Note';
export type ViewType = 'Tiling' | 'Kanban' | 'Chain of Thoughts';

export interface IdeaCard {
  id: string;
  rawText: string;
  enrichedText?: string;
  timestamp: Date;
  parentId?: string;

  isEnriching?: boolean;
  isCollapsed?: boolean;
  category: IdeaCategory;
  tags: string[];
  referencedIds: string[];
}

export interface SynthesisData {
  summary: string;
  suggestedNextIdeas: string[];
  timestamp: Date;
  addedToWorkArea?: boolean;
}

export interface Session {
  id: string;
  name: string;
  creationDate: Date;
  goal?: string;
  ideas: IdeaCard[];
  synthesis?: SynthesisData;
}
