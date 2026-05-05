import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { SessionService } from '../../core/services/session.service';
import { ShortcutService } from '../../core/services/shortcut.service';

@Component({
  selector: 'mimir-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  themeService = inject(ThemeService);
  sessionService = inject(SessionService);
  shortcutService = inject(ShortcutService);
  
  currentTime = new Date();
  private timerId: any;

  ngOnInit() {
    this.timerId = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  toggleSidebar() {
    this.shortcutService.leftSidebarOpen.update(v => !v);
  }
}
