import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import settingsSlice from "store/slices/settings";

const useSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const setGeminiApiKey = (key: string) => {
    dispatch(settingsSlice.actions.setGeminiApiKey(key));
  };

  const setGithubToken = (token: string) => {
    dispatch(settingsSlice.actions.setGithubToken(token));
  };

  const setGithubUsername = (username: string) => {
    dispatch(settingsSlice.actions.setGithubUsername(username));
  };

  const updateSettings = (updates: Partial<typeof settings>) => {
    dispatch(settingsSlice.actions.updateSettings(updates));
  };

  const hasGeminiKey = Boolean(settings.geminiApiKey);
  const hasGithubToken = Boolean(settings.githubToken);

  return {
    settings,
    hasGeminiKey,
    hasGithubToken,
    setGeminiApiKey,
    setGithubToken,
    setGithubUsername,
    updateSettings,
  };
};

export default useSettings;
