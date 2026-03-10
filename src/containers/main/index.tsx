import React from "react";
import Tabs from "./Tabs";
import Locked from "./Locked";
import AllNotes from "./allNotes";
import Favorites from "./Favorites";
import useSideBar from "store/hooks/useSideBar";
import AiChat from "containers/aichat";
import AppBuilder from "containers/appbuilder";
import Files from "containers/files";
import Projects from "containers/projects";
import Github from "containers/github";
import Settings from "containers/settings";

const MainBar = () => {
  const { sideTabState } = useSideBar();
  switch (sideTabState.tabName) {
    case "All Notes":
      return <AllNotes />;
    case "Favorites":
      return <Favorites />;
    case "Locked":
      return <Locked />;
    case "Tabs":
      return <Tabs />;
    case "AI Chat":
      return <AiChat />;
    case "App Builder":
      return <AppBuilder />;
    case "Files":
      return <Files />;
    case "Projects":
      return <Projects />;
    case "GitHub":
      return <Github />;
    case "Settings":
      return <Settings />;
    default:
      return null;
  }
};

export default MainBar;
