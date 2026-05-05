import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewType } from '../models/mimir.model';

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {
  public onNewSession = new Subject<void>();
  public onSynthesize = new Subject<void>();

  // State Signals
  public leftSidebarOpen = signal<boolean>(true);
  public rightSidebarOpen = signal<boolean>(false);
  public activeWorkAreaView = signal<ViewType>('Tiling');

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'n') {
        event.preventDefault();
        this.onNewSession.next();
      } else if (event.key === 's') {
        event.preventDefault();
        this.onSynthesize.next();
      } else if (event.key === 'b') {
        event.preventDefault();
        this.rightSidebarOpen.update(v => !v);
      } else if (event.key === 'e') {
        event.preventDefault();
        this.leftSidebarOpen.update(v => !v);
      } else if (event.key === '1') {
        event.preventDefault();
        this.activeWorkAreaView.set('Tiling');
      } else if (event.key === '2') {
        event.preventDefault();
        this.activeWorkAreaView.set('Kanban');
      } else if (event.key === '3') {
        event.preventDefault();
        this.activeWorkAreaView.set('Chain of Thoughts');
      }
    }
  }
}
