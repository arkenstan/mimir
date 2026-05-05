import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../core/services/session.service';
import { LlmService } from '../../core/services/llm.service';

@Component({
  selector: 'mimir-input-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-area.html',
  styleUrl: './input-area.scss',
})
export class InputArea implements OnInit {
  sessionService = inject(SessionService);
  llmService = inject(LlmService);
  
  inputText: string = '';
  selectedContextTags: Set<string> = new Set();
  
  @ViewChild('inputBox') inputBox!: ElementRef<HTMLTextAreaElement>;

  showMentions = false;
  mentionSearch = '';
  mentionSuggestions: any[] = [];
  mentionStartIndex = -1;

  showTagMentions = false;
  tagMentionSearch = '';
  tagMentionSuggestions: string[] = [];
  tagMentionStartIndex = -1;

  ngOnInit() {}

  get availableTags(): string[] {
    return this.sessionService.getAllTags();
  }

  toggleTagSelection(tag: string) {
    if (this.selectedContextTags.has(tag)) {
      this.selectedContextTags.delete(tag);
    } else {
      this.selectedContextTags.add(tag);
    }
  }

  async onSubmit() {
    if (!this.inputText.trim()) return;

    const raw = this.inputText;
    
    // Extract inline tags
    const inlineTags = raw.match(/#[\w-]+/g) || [];
    
    // Extract references (e.g. @a1b2c3)
    const idRefs = raw.match(/@([a-fA-F0-9]{6,})/g) || [];
    
    let contextIdeas: any[] = [];
    let inheritedTags = new Set<string>(inlineTags);

    // Resolve referenced IDs
    const finalReferencedIds: string[] = [];
    for (const ref of idRefs) {
      const shortId = ref.substring(1);
      const idea = this.sessionService.getIdeaByShortId(shortId);
      if (idea) {
        contextIdeas.push(idea);
        idea.tags.forEach(t => inheritedTags.add(t));
        finalReferencedIds.push(idea.id);
      }
    }

    // Include context from selected context tags
    if (this.selectedContextTags.size > 0) {
      const tagContext = this.sessionService.getIdeasByTags(Array.from(this.selectedContextTags));
      const ids = new Set(contextIdeas.map(i => i.id));
      tagContext.forEach(idea => {
        if (!ids.has(idea.id)) {
          contextIdeas.push(idea);
          ids.add(idea.id);
        }
      });
    }

    // Add Idea
    const finalTags = Array.from(inheritedTags);
    const ideaId = this.sessionService.addIdea(raw, undefined, undefined, finalTags, finalReferencedIds);
    this.inputText = ''; 

    this.sessionService.setIdeaEnriching(ideaId, true);
    try {
      const enriched = await this.llmService.enrichIdea(raw, contextIdeas);
      this.sessionService.updateIdeaEnrichment(ideaId, enriched);
    } catch (e) {
      this.sessionService.updateIdeaEnrichment(ideaId, 'Failed to enrich idea.');
    }
    
    this.selectedContextTags.clear();
  }

  onInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursor = textarea.selectionStart;

    const textBeforeCursor = value.substring(0, cursor);
    
    const matchId = textBeforeCursor.match(/@([a-zA-Z0-9]*)$/);
    if (matchId) {
      this.showMentions = true;
      this.mentionSearch = matchId[1].toLowerCase();
      this.mentionStartIndex = matchId.index!;
      this.updateSuggestions();
      this.closeTagMentions();
      return;
    } else {
      this.closeMentions();
    }

    const matchTag = textBeforeCursor.match(/#([a-zA-Z0-9]*)$/);
    if (matchTag) {
      this.showTagMentions = true;
      this.tagMentionSearch = matchTag[1].toLowerCase();
      this.tagMentionStartIndex = matchTag.index!;
      this.updateTagSuggestions();
    } else {
      this.closeTagMentions();
    }
  }

  updateTagSuggestions() {
    const session = this.sessionService.activeSession();
    const allTags = new Set<string>();
    if (session) {
      session.ideas.forEach(i => i.tags.forEach(t => allTags.add(t)));
    }
    
    this.tagMentionSuggestions = Array.from(allTags)
      .filter(t => t.toLowerCase().includes(this.tagMentionSearch))
      .slice(0, 5);
      
    if (this.tagMentionSuggestions.length === 0) {
      this.closeTagMentions();
    }
  }

  closeTagMentions() {
    this.showTagMentions = false;
    this.tagMentionSuggestions = [];
    this.tagMentionStartIndex = -1;
  }

  selectTagMention(tag: string) {
    if (this.tagMentionStartIndex === -1) return;
    
    const textarea = this.inputBox.nativeElement;
    const text = this.inputText;
    
    const before = text.substring(0, this.tagMentionStartIndex);
    const after = text.substring(textarea.selectionStart);
    
    this.inputText = `${before}#${tag} ${after}`;
    
    this.closeTagMentions();
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = before.length + tag.length + 2;
      textarea.selectionEnd = textarea.selectionStart;
    });
  }

  updateSuggestions() {
    const ideas = this.sessionService.activeSession()?.ideas || [];
    this.mentionSuggestions = ideas
      .filter(i => 
        i.id.toLowerCase().includes(this.mentionSearch) || 
        i.rawText.toLowerCase().includes(this.mentionSearch)
      )
      .slice(0, 5);
      
    if (this.mentionSuggestions.length === 0) {
      this.closeMentions();
    }
  }

  closeMentions() {
    this.showMentions = false;
    this.mentionSuggestions = [];
    this.mentionStartIndex = -1;
  }

  selectMention(idea: any) {
    if (this.mentionStartIndex === -1) return;
    
    const textarea = this.inputBox.nativeElement;
    const text = this.inputText;
    
    const before = text.substring(0, this.mentionStartIndex);
    const after = text.substring(textarea.selectionStart);
    
    const shortId = idea.id.substring(0, 6);
    this.inputText = `${before}@${shortId} ${after}`;
    
    this.closeMentions();
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = before.length + shortId.length + 2;
      textarea.selectionEnd = textarea.selectionStart;
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.showMentions) {
      if (event.key === 'Escape') {
        this.closeMentions();
        return;
      }
    }
    
    if (this.showTagMentions) {
      if (event.key === 'Escape') {
        this.closeTagMentions();
        return;
      }
    }
    
    if (event.key === 'Enter' && !event.shiftKey) {
      if (this.showMentions) {
        event.preventDefault();
        if (this.mentionSuggestions.length > 0) {
          this.selectMention(this.mentionSuggestions[0]);
        }
        return;
      }
      if (this.showTagMentions) {
        event.preventDefault();
        if (this.tagMentionSuggestions.length > 0) {
          this.selectTagMention(this.tagMentionSuggestions[0]);
        }
        return;
      }
      event.preventDefault();
      this.onSubmit();
    }
  }
}
