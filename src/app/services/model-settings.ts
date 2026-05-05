import { Injectable } from '@angular/core';

export interface ModelSettingsDTO {
  host: string;
  port: number;
  model: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModelSettings {
  public host: string = 'localhost';
  public port: number = 11434;
  public model: string = 'gemma4';

  public hostString(): string {
    return `http://${this.host}:${this.port}`;
  }

  public updateSettings(dto: ModelSettingsDTO) {
    this.host = dto.host;
    this.port = dto.port;
    this.model = dto.model;
  }
}
