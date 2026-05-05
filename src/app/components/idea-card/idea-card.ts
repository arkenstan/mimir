import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeaCard as IdeaCardModel, IdeaCategory } from '../../core/models/mimir.model';
import { SessionService } from '../../core/services/session.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'mimir-idea-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idea-card.html',
  styleUrl: './idea-card.scss',
})
export class IdeaCard {
  @Input({ required: true }) idea!: IdeaCardModel;
  
  sessionService = inject(SessionService);

  readonly categories: IdeaCategory[] = ['Idea', 'Claim', 'Definition', 'Reference', 'Narrative', 'Note'];

  get parsedMarkdown(): string {
    if (!this.idea.enrichedText) return '';
    const rawMarkup = marked.parse(this.idea.enrichedText) as string;
    return DOMPurify.sanitize(rawMarkup);
  }

  get categoryColorClass(): string {
    return `color-${this.idea.category.toLowerCase()}`;
  }

  onToggleCollapse() {
    this.sessionService.toggleIdeaCollapse(this.idea.id);
  }

  onDelete() {
    this.sessionService.deleteIdea(this.idea.id);
  }
  
  isCategoryMenuOpen = false;

  toggleCategoryMenu() {
    this.isCategoryMenuOpen = !this.isCategoryMenuOpen;
  }

  setCategory(cat: IdeaCategory) {
    this.sessionService.updateIdeaCategory(this.idea.id, cat);
    this.isCategoryMenuOpen = false;
  }

  addTag(event: any) {
    const value = event.target.value.trim();
    if (value && event.key === 'Enter') {
      const tag = value.startsWith('#') ? value : '#' + value;
      this.sessionService.addTagToIdea(this.idea.id, tag);
      event.target.value = '';
    }
  }

  removeTag(tag: string) {
    this.sessionService.removeTagFromIdea(this.idea.id, tag);
  }
}
