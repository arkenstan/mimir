import { Injectable, signal } from '@angular/core';
import { Session, IdeaCard, SynthesisData, IdeaCategory } from '../models/mimir.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly STORAGE_KEY = 'mimir_sessions';
  
  public sessions = signal<Session[]>([]);
  public activeSession = signal<Session | null>(null);

  constructor() {
    this.loadSessions();
  }

  private loadSessions() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.sessions.set(JSON.parse(data));
      if (this.sessions().length > 0) {
        this.activeSession.set(this.sessions()[0]);
      }
    } else {
      this.createNewSession('New Research');
    }
  }

  private saveSessions() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions()));
  }

  createNewSession(name: string, goal?: string) {
    const newSession: Session = {
      id: uuidv4(),
      name,
      creationDate: new Date(),
      goal,
      ideas: []
    };
    
    this.sessions.update(s => [newSession, ...s]);
    this.activeSession.set(newSession);
    this.saveSessions();
  }

  deleteSession(id: string) {
    const sList = this.sessions().filter(s => s.id !== id);
    this.sessions.set(sList);
    if (this.activeSession()?.id === id) {
      this.activeSession.set(sList.length > 0 ? sList[0] : null);
    }
    this.saveSessions();
  }

  updateSessionName(id: string, newName: string) {
    const sList = this.sessions().map(s => s.id === id ? { ...s, name: newName } : s);
    this.sessions.set(sList);
    if (this.activeSession()?.id === id) {
      this.activeSession.set(sList.find(s => s.id === id) || null);
    }
    this.saveSessions();
  }

  setActiveSession(session: Session) {
    this.activeSession.set(session);
  }

  addIdea(rawText: string, enrichedText?: string, parentId?: string, tags: string[] = [], referencedIds: string[] = []): string {
    const current = this.activeSession();
    if (!current) return '';

    const newIdeaId = uuidv4();
    const newIdea: IdeaCard = {
      id: newIdeaId,
      rawText,
      enrichedText,
      timestamp: new Date(),
      parentId,
      category: 'Idea',
      tags: tags,
      referencedIds: referencedIds,
      isEnriching: false,
      isCollapsed: false
    };

    const updatedSession = { ...current, ideas: [...current.ideas, newIdea] };
    this.updateSessionState(updatedSession);
    return newIdeaId;
  }

  setIdeaEnriching(id: string, isEnriching: boolean) {
    this.updateIdeaPartial(id, { isEnriching });
  }

  updateIdeaEnrichment(id: string, enrichedText: string) {
    this.updateIdeaPartial(id, { enrichedText, isEnriching: false });
  }

  updateIdeaCategory(id: string, category: IdeaCategory) {
    this.updateIdeaPartial(id, { category });
  }

  toggleIdeaCollapse(id: string) {
    const current = this.activeSession();
    if (!current) return;
    const idea = current.ideas.find(i => i.id === id);
    if (idea) {
      this.updateIdeaPartial(id, { isCollapsed: !idea.isCollapsed });
    }
  }

  addTagToIdea(id: string, tag: string) {
    const current = this.activeSession();
    if (!current) return;
    const idea = current.ideas.find(i => i.id === id);
    if (idea && !idea.tags.includes(tag)) {
      this.updateIdeaPartial(id, { tags: [...idea.tags, tag] });
    }
  }

  removeTagFromIdea(id: string, tag: string) {
    const current = this.activeSession();
    if (!current) return;
    const idea = current.ideas.find(i => i.id === id);
    if (idea) {
      this.updateIdeaPartial(id, { tags: idea.tags.filter(t => t !== tag) });
    }
  }

  deleteIdea(id: string) {
    const current = this.activeSession();
    if (!current) return;
    const updatedIdeas = current.ideas.filter(idea => idea.id !== id && idea.parentId !== id);
    this.updateSessionState({ ...current, ideas: updatedIdeas });
  }

  updateSynthesis(synthesis: SynthesisData) {
    const current = this.activeSession();
    if (!current) return;
    this.updateSessionState({ ...current, synthesis });
  }

  private updateIdeaPartial(id: string, partial: Partial<IdeaCard>) {
    const current = this.activeSession();
    if (!current) return;
    const updatedIdeas = current.ideas.map(idea => 
      idea.id === id ? { ...idea, ...partial } : idea
    );
    this.updateSessionState({ ...current, ideas: updatedIdeas });
  }

  private updateSessionState(updatedSession: Session) {
    this.activeSession.set(updatedSession);
    this.sessions.update(allSessions => 
      allSessions.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
    this.saveSessions();
  }

  getBranch(ideaId: string): IdeaCard[] {
    const current = this.activeSession();
    if (!current) return [];

    const ideaMap = new Map<string, IdeaCard>();
    current.ideas.forEach(i => ideaMap.set(i.id, i));

    const branch: IdeaCard[] = [];
    const visited = new Set<string>();
    const queue = [ideaId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const idea = ideaMap.get(currentId);
      if (idea) {
        branch.push(idea);
        if (idea.referencedIds) {
          queue.push(...idea.referencedIds);
        }
      }
    }

    return branch.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getIdeaByShortId(shortId: string): IdeaCard | undefined {
    const current = this.activeSession();
    if (!current) return undefined;
    return current.ideas.find(idea => idea.id.startsWith(shortId));
  }

  getIdeasByTags(tags: string[]): IdeaCard[] {
    const current = this.activeSession();
    if (!current || tags.length === 0) return [];
    return current.ideas.filter(idea => idea.tags.some(t => tags.includes(t)));
  }

  getAllTags(): string[] {
    const current = this.activeSession();
    if (!current) return [];
    const tags = new Set<string>();
    current.ideas.forEach(idea => idea.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }

  exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.sessions()));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mimir_sessions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  importJson(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        this.sessions.set(data);
        if (data.length > 0) {
          this.activeSession.set(data[0]);
        }
        this.saveSessions();
      }
    } catch (e) {
      console.error('Invalid JSON', e);
    }
  }
}
