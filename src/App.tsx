import SideBar from "containers/sidebar";
import MainBar from "containers/main";
import css from "styles/app.module.scss";
import StickyButton from "components/sticky";
import ModelContainer from "components/Model";
import Form from "components/form";
import useModel from "store/hooks/useModel";
import useSideBar from "store/hooks/useSideBar";

function App() {
  const { modelHandler, modelState } = useModel();
  const { sideTabState } = useSideBar();

  const isForm = modelState === "formModel";
  const showSticky = ["All Notes", "Favorites"].includes(sideTabState.tabName);

  return (
    <div className={css.app}>
      <SideBar />
      <MainBar />
      <ModelContainer isOpen={isForm}>
        <Form
          onSubmit={function (): void {
            throw new Error("Function not implemented.");
          }}
          onClose={() => modelHandler("")}
        />
      </ModelContainer>
      {showSticky && (
        <StickyButton onClickModel={() => modelHandler("formModel")} />
      )}
    </div>
  );
}
export default App;
