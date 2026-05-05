import { Injectable } from '@angular/core';
import { Ollama as OllamaLib } from 'ollama/browser';
import { ModelSettings } from './model-settings';

@Injectable({
  providedIn: 'root',
})
export class Ollama {
  client: OllamaLib;

  constructor(private $settings: ModelSettings) {
    this.client = new OllamaLib({
      host: $settings.hostString(),
    });
  }

  public async generate(prompt: string) {
    return this.client.generate({
      model: this.$settings.model,
      prompt,
      stream: false,
    });
  }
}
