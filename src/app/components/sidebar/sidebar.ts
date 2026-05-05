import { Component, inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../core/services/session.service';
import { ShortcutService } from '../../core/services/shortcut.service';

@Component({
  selector: 'mimir-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  sessionService = inject(SessionService);
  shortcutService = inject(ShortcutService);
  
  isCollapsed = false;
  editingSessionId: string | null = null;
  editingName: string = '';

  private sub: any;

  @HostBinding('class.collapsed') get collapsed() { return this.isCollapsed; }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onNewSession() {
    this.sessionService.createNewSession('New Research');
  }

  onExport() {
    this.sessionService.exportJson();
  }

  onImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.sessionService.importJson(e.target.result as string);
        }
      };
      reader.readAsText(input.files[0]);
    }
  }

  startEdit(session: any, event: Event) {
    event.stopPropagation();
    this.editingSessionId = session.id;
    this.editingName = session.name;
  }

  saveEdit(session: any, event: Event) {
    event.stopPropagation();
    if (this.editingName.trim()) {
      this.sessionService.updateSessionName(session.id, this.editingName);
    }
    this.editingSessionId = null;
  }

  deleteSession(id: string, event: Event) {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(id);
    }
  }
}
