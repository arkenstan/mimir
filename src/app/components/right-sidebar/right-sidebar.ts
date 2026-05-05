import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SynthesisPanel } from '../synthesis-panel/synthesis-panel';
import { SettingsPanel } from '../settings-panel/settings-panel';

@Component({
  selector: 'mimir-right-sidebar',
  standalone: true,
  imports: [CommonModule, SynthesisPanel, SettingsPanel],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.scss'
})
export class RightSidebar {
  activeTab: 'Synthesis' | 'Settings' = 'Synthesis';
}
