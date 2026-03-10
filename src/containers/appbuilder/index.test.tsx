import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AppBuilder from "./index";
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
import sideTab from "store/slices/sidetab";
import modelSlice from "store/slices/model";
import formSlice from "store/slices/form";
import notesSlice from "store/slices/notes";
import chatSlice from "store/slices/chat";
import appBuilderSlice from "store/slices/appBuilder";
import filesSlice from "store/slices/files";
import projectsSlice from "store/slices/projects";
import settingsSlice from "store/slices/settings";
import { RootState } from "store";

const reducer = {
  sideTab: sideTab.reducer,
  model: modelSlice.reducer,
  form: formSlice.reducer,
  notes: notesSlice.reducer,
  chat: chatSlice.reducer,
  appBuilder: appBuilderSlice.reducer,
  files: filesSlice.reducer,
  projects: projectsSlice.reducer,
  settings: settingsSlice.reducer,
};

const renderWithStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer,
    preloadedState: preloadedState as RootState,
  });

  return render(
    <Provider store={store}>
      <AppBuilder />
    </Provider>
  );
};

describe("AppBuilder files panel", () => {
  it("shows generated files with preview and export actions", () => {
    const project = {
      id: "p1",
      name: "Demo Project",
      description: "Test project for file export",
      type: "web" as const,
      messages: [],
      files: [
        {
          name: "index.tsx",
          content: "console.log('hello world');",
          language: "tsx",
        },
      ],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    renderWithStore({
      appBuilder: {
        projects: [project],
        activeProjectId: project.id,
        isLoading: false,
        error: null,
      },
      settings: { geminiApiKey: "fake-key", githubToken: "", githubUsername: "" },
    });

    expect(screen.getByText("Generated Files")).toBeInTheDocument();
    expect(screen.getAllByText("index.tsx").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /download \.zip/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByText("console.log('hello world');")).toBeInTheDocument();
  });
});
