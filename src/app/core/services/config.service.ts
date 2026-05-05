import { Injectable, signal, effect } from '@angular/core';

export interface OllamaConfig {
  host: string;
  model: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configKey = 'mimir_ollama_config';
  
  public config = signal<OllamaConfig>({
    host: 'http://127.0.0.1:11434',
    model: 'gemma4:latest'
  });

  constructor() {
    this.load();
    effect(() => {
      // Whenever config changes, optionally do something globally
    });
  }

  load() {
    const saved = localStorage.getItem(this.configKey);
    if (saved) {
      try {
        this.config.set(JSON.parse(saved));
      } catch(e) {}
    }
  }

  save(cfg: OllamaConfig) {
    this.config.set(cfg);
    localStorage.setItem(this.configKey, JSON.stringify(cfg));
  }
}
