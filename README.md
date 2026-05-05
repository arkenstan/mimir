# Mimir 🧠

![Mimir Logo](https://github.com/arkenstan/mimir/raw/main/public/assets/mimir_logo.png)

Mimir is an advanced, local-first brainstorming and thought-synthesis platform. Designed to act as a deeply integrated "second brain", Mimir allows you to capture ideas, link them together in a physics-based graph, and use local Large Language Models (LLMs) to synthesize complex branches of thought into cohesive narratives.

![Mimir Overview](https://img.shields.io/badge/Status-Beta-blue)
![Angular](https://img.shields.io/badge/Angular-17%2B-DD0031?logo=angular)
![D3.js](https://img.shields.io/badge/D3.js-Graph_Physics-F9A03C?logo=d3.js)
![Ollama](https://img.shields.io/badge/Ollama-Local_LLMs-white?logo=ollama)

---

## 🌟 Key Features

- **Local-First AI Integration:** Fully powered by local LLMs via [Ollama](https://ollama.ai/), ensuring 100% privacy for your thoughts. By default, Mimir is configured to use the powerful `gemma4:latest` model.
- **Chain of Thoughts (D3 Graph):** Visualize how your ideas connect! Mimir uses a physics-based, force-directed graph to map out your thoughts. Clicking any node allows you to trace the ancestry of that idea and synthesize the entire branch.
- **Smart Mention System:**
  - Use `@` in the input area to search and link existing ideas, establishing connections and context for the LLM.
  - Use `#` to quickly categorize and tag your thoughts with autocomplete suggestions based on your active session.
- **Dynamic Work Area:** Switch seamlessly between Tiling, Kanban (WIP), and Graph views to explore your ideas the way that makes sense to you.
- **Interactive Synthesis:** Use the built-in Angular Material Dialogs to provide custom instructions (e.g., "Write this as a formal proposal") when having the LLM synthesize a branch of thoughts into a cohesive markdown document.
- **Modern Angular Architecture:** Built on the bleeding edge of Angular, utilizing native **Signals** for deeply reactive UI state management and the new `@if`/`@for` control flow for maximum performance.
- **Highly Customizable UI:** Features a sleek dark mode with neon accents inspired by Nodepad, complete with resizable sidebars to tailor the workspace to your monitor.

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: Ensure you have Node installed (v18+ recommended).
2.  **Ollama**: You must have [Ollama](https://ollama.com/) installed and running on your machine to power the AI features.

### 1. Configure Ollama

Start your local Ollama server. By default, Mimir expects it to be running at `http://127.0.0.1:11434`.

Pull the default language model:

```bash
ollama run gemma4:latest
```

_(Note: You can change the target model and host URL directly within the Mimir UI via the Right Sidebar -> Settings tab)._

### 2. Install Dependencies

Clone this repository and install the Angular dependencies:

```bash
cd mimir
npm install
```

### 3. Run the Application

Start the local development server:

```bash
npm run dev
# OR
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

---

## ⌨️ Keyboard Shortcuts

Mimir is built for power users. Keep your hands on the keyboard with these global shortcuts:

- **`Ctrl + N`**: Create a new brainstorming session.
- **`Ctrl + S`**: Manually trigger synthesis on the current canvas.
- **`Ctrl + B`**: Toggle the Right Sidebar (Synthesis & Settings).
- **`Ctrl + E`**: Toggle the Left Sidebar (Spaces).
- **`Ctrl + 1`**: Switch to Tiling View.
- **`Ctrl + 2`**: Switch to Kanban View.
- **`Ctrl + 3`**: Switch to Chain of Thoughts (Graph) View.

---

## 🛠 Tech Stack

- **Frontend Framework**: Angular (Standalone Components, Signals)
- **UI Components**: Angular Material
- **Visualization**: D3.js (Force Layout)
- **Markdown Parsing**: marked, DOMPurify
- **AI Backend**: Ollama API

---

_Built with ❤️ to elevate your brainstorming sessions._
