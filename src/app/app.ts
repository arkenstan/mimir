import { Component, inject, HostListener, signal } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { WorkArea } from './components/work-area/work-area';
import { InputArea } from './components/input-area/input-area';
import { RightSidebar } from './components/right-sidebar/right-sidebar';
import { ThemeService } from './core/services/theme.service';
import { ShortcutService } from './core/services/shortcut.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Sidebar, Header, WorkArea, InputArea, RightSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  themeService = inject(ThemeService);
  shortcutService = inject(ShortcutService);

  isResizingLeft = false;
  isResizingRight = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isResizingLeft) {
      const newWidth = Math.max(200, Math.min(600, event.clientX));
      document.documentElement.style.setProperty('--left-sidebar-width', `${newWidth}px`);
    } else if (this.isResizingRight) {
      const newWidth = Math.max(200, Math.min(600, window.innerWidth - event.clientX));
      document.documentElement.style.setProperty('--right-sidebar-width', `${newWidth}px`);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizingLeft = false;
    this.isResizingRight = false;
    document.body.style.cursor = 'default';
  }

  startResizeLeft(event: MouseEvent) {
    this.isResizingLeft = true;
    document.body.style.cursor = 'col-resize';
    event.preventDefault();
  }

  startResizeRight(event: MouseEvent) {
    this.isResizingRight = true;
    document.body.style.cursor = 'col-resize';
    event.preventDefault();
  }
}
