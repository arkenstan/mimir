import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SynthesisPanel } from '../synthesis-panel/synthesis-panel';
import { SettingsPanel } from '../settings-panel/settings-panel';
import { ShortcutService } from '../../core/services/shortcut.service';

@Component({
  selector: 'mimir-right-sidebar',
  standalone: true,
  imports: [CommonModule, SynthesisPanel, SettingsPanel],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.scss'
})
export class RightSidebar {
  shortcutService = inject(ShortcutService);
  activeTab: 'Synthesis' | 'Settings' = 'Synthesis';

  toggleTab(tab: 'Synthesis' | 'Settings') {
    if (this.shortcutService.rightSidebarOpen() && this.activeTab === tab) {
      this.shortcutService.rightSidebarOpen.set(false);
    } else {
      this.activeTab = tab;
      this.shortcutService.rightSidebarOpen.set(true);
    }
  }

  close() {
    this.shortcutService.rightSidebarOpen.set(false);
  }
}
