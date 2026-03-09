import css from "styles/app.module.scss";
import useSideBar from "store/hooks/useSideBar";
import {
  FiFileText,
  FiMessageSquare,
  FiCode,
  FiFolder,
  FiTrello,
  FiGithub,
  FiSettings,
  FiStar,
  FiLock,
  FiLayers,
} from "react-icons/fi";

const tabData = [
  { name: "All Notes", icon: <FiFileText /> },
  { name: "Favorites", icon: <FiStar /> },
  { name: "Locked", icon: <FiLock /> },
  { name: "Tabs", icon: <FiLayers /> },
  { name: "AI Chat", icon: <FiMessageSquare /> },
  { name: "App Builder", icon: <FiCode /> },
  { name: "Files", icon: <FiFolder /> },
  { name: "Projects", icon: <FiTrello /> },
  { name: "GitHub", icon: <FiGithub /> },
  { name: "Settings", icon: <FiSettings /> },
];

const SideBar = () => {
  const { sideTabState, tabHandler } = useSideBar();
  return (
    <div className={css.side}>
      <div className={css.logo}>
        <h4>✨ AI Notes</h4>
      </div>
      <div className={css.controls}>
        {tabData.map((data, index) => {
          const check = sideTabState.tabName === data.name;
          const buttonStyle = {
            background: check ? "#2196f3" : "",
          };
          return (
            <button
              style={buttonStyle}
              key={index}
              onClick={() => tabHandler(data.name)}
              className={css.navBtn}
            >
              <span className={css.navIcon}>{data.icon}</span>
              {data.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
