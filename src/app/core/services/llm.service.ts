import { Injectable, inject } from '@angular/core';
import { Ollama } from 'ollama/browser';
import { IdeaCard } from '../models/mimir.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  configService = inject(ConfigService);

  get ollama() {
    return new Ollama({ host: this.configService.config().host });
  }

  get modelName() {
    return this.configService.config().model;
  }

  constructor() {}

  async enrichIdea(rawIdea: string, contextIdeas: IdeaCard[]): Promise<string> {
    let prompt = '';
    
    if (contextIdeas.length > 0) {
      const contextStr = contextIdeas.map(c => `- ${c.rawText}`).join('\n');
      prompt = `Context (related ideas):\n${contextStr}\n\n`;
      prompt += `You are a brainstorming assistant. Synthesize the new idea below in relation to the provided context.\n`;
      prompt += `New Idea: ${rawIdea}\n\n`;
      prompt += `Provide a brief, high-level summary of how this idea fits with the context. Do not go into deep details, action plans, or lengthy lists unless explicitly requested.`;
    } else {
      prompt = `You are a brainstorming assistant. Please provide a brief, high-level summary or initial expansion of the following idea:\n\n`;
      prompt += `Idea: ${rawIdea}\n\n`;
      prompt += `Do not go into deep details, action plans, or lengthy lists unless explicitly requested. Keep it concise.`;
    }

    try {
      const response = await this.ollama.generate({
        model: this.modelName,
        prompt: prompt,
      });
      return response.response;
    } catch (e) {
      console.error('LLM Enrichment failed:', e);
      return 'LLM enrichment failed. Please ensure Ollama is running and gemma4:latest is pulled.';
    }
  }

  async synthesize(ideas: IdeaCard[]): Promise<{summary: string, suggestedNextIdeas: string[]}> {
    if (ideas.length === 0) return { summary: '', suggestedNextIdeas: [] };
    
    const ideasText = ideas.map(i => i.rawText).join('\n- ');
    const prompt = `Here are the brainstormed ideas:\n- ${ideasText}\n\nPlease provide:\n1. A short summary of emerging themes or connections.\n2. 3 suggested next ideas.\nFormat your response as JSON with keys "summary" (string) and "suggestedNextIdeas" (array of strings).`;

    try {
      const response = await this.ollama.generate({
        model: this.modelName,
        prompt: prompt,
        format: 'json'
      });
      return JSON.parse(response.response);
    } catch (e) {
      console.error('LLM Synthesis failed:', e);
      return { summary: 'Synthesis failed.', suggestedNextIdeas: [] };
    }
  }

  async synthesizeDocument(branchIdeas: IdeaCard[], title: string, instructions: string): Promise<string> {
    const text = branchIdeas.map(i => `- ${i.rawText}`).join('\n');
    let prompt = `You are an expert technical writer and AI assistant. The user has formed a Chain of Thoughts through the following brainstormed ideas:\n\n${text}\n\n`;
    prompt += `Your task is to synthesize these ideas into a single, cohesive, and comprehensive document. Do not just list them; structure them into a coherent narrative or plan. Use markdown.\n\n`;
    
    if (title) prompt += `Please title or theme the document around: ${title}\n`;
    if (instructions) prompt += `Specific user instructions: ${instructions}\n`;
    
    try {
      const response = await this.ollama.generate({
        model: this.modelName,
        prompt: prompt,
      });
      return response.response;
    } catch (e) {
      console.error('LLM Synthesis failed:', e);
      return 'Branch synthesis failed.';
    }
  }
}
