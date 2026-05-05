import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

export interface Thought {
  userInput: string;
  addedAt: string;
  hashTopics: string[];

  thoughtId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThoughtService {
  public thoughts: Thought[] = [];

  public addThought(userInput: string, hashTopics: string[]) {
    const newThought: Thought = {
      userInput,
      addedAt: new Date().toISOString(),
      hashTopics,
      thoughtId: uuidv4(),
    };
    this.thoughts.push(newThought);
  }

  public updateThoughtUserInput(thoughtId: string, userInput: string) {
    const thoughtIndex = this.thoughts.findIndex((t) => t.thoughtId === thoughtId);
    if (thoughtIndex !== -1) {
      this.thoughts[thoughtIndex] = {
        ...this.thoughts[thoughtIndex],
        userInput,
      };
    }
  }

  public updateThoughtHashTopics(thoughtId: string, hashTopics: string[]) {
    const thoughtIndex = this.thoughts.findIndex((t) => t.thoughtId === thoughtId);
    if (thoughtIndex !== -1) {
      this.thoughts[thoughtIndex] = {
        ...this.thoughts[thoughtIndex],
        hashTopics,
      };
    }
  }
}
