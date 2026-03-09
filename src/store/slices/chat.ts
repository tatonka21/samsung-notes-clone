import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

const saved = localStorage.getItem("chatSessions");
const initialState: ChatState = {
  sessions: saved ? JSON.parse(saved) : [],
  activeSessionId: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createSession: (state, action: PayloadAction<string | undefined>) => {
      const session: ChatSession = {
        id: nanoid(),
        title: action.payload || "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      state.sessions.unshift(session);
      state.activeSessionId = session.id;
      localStorage.setItem("chatSessions", JSON.stringify(state.sessions));
    },
    selectSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions[0]?.id || null;
      }
      localStorage.setItem("chatSessions", JSON.stringify(state.sessions));
    },
    addMessage: (
      state,
      action: PayloadAction<{ sessionId: string; message: ChatMessage }>
    ) => {
      const session = state.sessions.find(
        (s) => s.id === action.payload.sessionId
      );
      if (session) {
        session.messages.push(action.payload.message);
        if (session.messages.length === 1) {
          session.title = action.payload.message.content.slice(0, 40) + "...";
        }
        localStorage.setItem("chatSessions", JSON.stringify(state.sessions));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export default chatSlice;
