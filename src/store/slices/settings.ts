import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  geminiApiKey: string;
  githubToken: string;
  githubUsername: string;
}

const saved = localStorage.getItem("appSettings");
const initialState: SettingsState = saved
  ? JSON.parse(saved)
  : {
      geminiApiKey: "",
      githubToken: "",
      githubUsername: "",
    };

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setGeminiApiKey: (state, action: PayloadAction<string>) => {
      state.geminiApiKey = action.payload;
      localStorage.setItem("appSettings", JSON.stringify(state));
    },
    setGithubToken: (state, action: PayloadAction<string>) => {
      state.githubToken = action.payload;
      localStorage.setItem("appSettings", JSON.stringify(state));
    },
    setGithubUsername: (state, action: PayloadAction<string>) => {
      state.githubUsername = action.payload;
      localStorage.setItem("appSettings", JSON.stringify(state));
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
      localStorage.setItem("appSettings", JSON.stringify(state));
    },
  },
});

export default settingsSlice;
