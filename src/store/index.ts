import { configureStore } from "@reduxjs/toolkit";
import formSlice from "./slices/form";
import modelSlice from "./slices/model";
import notesSlice from "./slices/notes";
import sideTab from "./slices/sidetab";
import chatSlice from "./slices/chat";
import appBuilderSlice from "./slices/appBuilder";
import filesSlice from "./slices/files";
import projectsSlice from "./slices/projects";
import settingsSlice from "./slices/settings";

const store = configureStore({
  reducer: {
    sideTab: sideTab.reducer,
    model: modelSlice.reducer,
    form: formSlice.reducer,
    notes: notesSlice.reducer,
    chat: chatSlice.reducer,
    appBuilder: appBuilderSlice.reducer,
    files: filesSlice.reducer,
    projects: projectsSlice.reducer,
    settings: settingsSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
