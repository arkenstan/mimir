import { Component, inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../core/services/session.service';
import { LlmService } from '../../core/services/llm.service';
import { ShortcutService } from '../../core/services/shortcut.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'mimir-synthesis-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './synthesis-panel.html',
  styleUrl: './synthesis-panel.scss',
})
export class SynthesisPanel implements OnInit {
  sessionService = inject(SessionService);
  llmService = inject(LlmService);
  shortcutService = inject(ShortcutService);
  
  isSynthesizing = false;

  ngOnInit() {
    this.shortcutService.onSynthesize.subscribe(() => this.onSynthesize());
  }

  async onSynthesize() {
    const session = this.sessionService.activeSession();
    if (!session || session.ideas.length === 0) return;

    this.isSynthesizing = true;
    try {
      const data = await this.llmService.synthesize(session.ideas);
      this.sessionService.updateSynthesis({
        ...data,
        timestamp: new Date()
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.isSynthesizing = false;
    }
  }

  useSuggested(ideaText: string) {
    this.sessionService.addIdea(ideaText);
  }

  get parsedSynthesisSummary(): string {
    const session = this.sessionService.activeSession();
    if (!session || !session.synthesis || !session.synthesis.summary) return '';
    const rawMarkup = marked.parse(session.synthesis.summary) as string;
    return DOMPurify.sanitize(rawMarkup);
  }

  addSynthesisToWorkArea() {
    const session = this.sessionService.activeSession();
    if (session && session.synthesis && session.synthesis.summary) {
      const ideaId = this.sessionService.addIdea(
        'Synthesized Document', 
        session.synthesis.summary
      );
      this.sessionService.updateIdeaCategory(ideaId, 'Narrative');
      
      this.sessionService.updateSynthesis({
        ...session.synthesis,
        addedToWorkArea: true
      });
    }
  }
}
