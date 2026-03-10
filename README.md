# ✨ AI Notes — AI-Powered Productivity Platform

A Samsung Notes clone evolved into a full-featured AI productivity platform, powered by Google Gemini 2.0 Flash.

## Features

### 📝 AI-Enhanced Notes
- Create, view, and delete notes (Samsung Notes style)
- **AI Actions** on each note: Summarize, Expand, Rewrite, Convert to Bullets
- Powered by Gemini 2.0 Flash

### 💬 AI Chat
- General-purpose conversational AI
- Persistent chat sessions with history
- Markdown rendering with code highlighting
- Powered by Gemini 2.0 Flash (free tier)

### 🔨 AI App Builder
- Create web, mobile, API, or other project types
- Chat with AI to generate architecture, code, and guidance
- Automatically extracts and tracks generated code files
- Preview generated files and export them as a ready-to-import ZIP
- Step-by-step app building workflow

### 📁 File & Folder Manager
- Hierarchical tree-based file system
- Create, edit, and delete files and folders
- Built-in text editor
- **AI Research Mode**: Enter a topic → AI auto-creates a folder with subtopic notes
  - Example: "Top 100 AI Opportunities" → creates 10+ researched subtopic files

### 📋 Project Management
- Kanban board with 4 columns: To Do, In Progress, Done, Blocked
- Task priorities: Low, Medium, High, Critical
- Multiple projects with color coding
- Full task CRUD with drag-column buttons

### 🐙 GitHub Integration
- Connect via Personal Access Token
- View all repositories
- Create new repositories
- Manage issues (view + create)
- Browse commit history

### ⚙️ Settings
- Gemini API key management (masked input)
- GitHub Personal Access Token setup
- All settings persisted to localStorage

## Setup

### 1. Get a Gemini API Key (Free)
Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API key.

### 2. Get a GitHub Token (Optional)
Visit [github.com/settings/tokens](https://github.com/settings/tokens) and create a token with `repo` scope.

### 3. Configure in Settings
Open the app → click **Settings** in the sidebar → enter your keys → Save.

## Available Scripts

```bash
npm install     # Install dependencies
npm start       # Run development server at http://localhost:3000
npm run build   # Build for production
npm test        # Run tests
```

## Tech Stack

- **React 18** + **TypeScript**
- **Redux Toolkit** — state management
- **@google/generative-ai** — Gemini 2.0 Flash API
- **react-markdown** — AI response rendering
- **react-icons** — iconography
- **SCSS Modules** — component styling
- **localStorage** — all data persistence (no backend required)

## Screenshots

| All Notes | AI Chat | Settings |
|-----------|---------|----------|
| ![All Notes](https://github.com/user-attachments/assets/679b5790-90d9-4939-ba81-c21b4124e765) | ![AI Chat](https://github.com/user-attachments/assets/52b21171-33b9-4cc4-8296-6a5d222f6883) | ![Settings](https://github.com/user-attachments/assets/73b05473-e5e9-47d6-abae-1a96aee22ed5) |

| App Builder | Files & Folders |
|-------------|-----------------|
| ![App Builder](https://github.com/user-attachments/assets/2c090143-49b8-49f5-be39-202505187c99) | ![Files](https://github.com/user-attachments/assets/5f7794db-0e13-4670-a8fb-ddc8a45f79fd) |
