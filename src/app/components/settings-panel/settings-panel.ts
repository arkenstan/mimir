import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'mimir-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.scss'
})
export class SettingsPanel {
  configService = inject(ConfigService);
  
  host: string = '';
  model: string = '';

  constructor() {
    const current = this.configService.config();
    this.host = current.host;
    this.model = current.model;
  }

  save() {
    this.configService.save({ host: this.host, model: this.model });
    alert('Settings saved!');
  }
}
