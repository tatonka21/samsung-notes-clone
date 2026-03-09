import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import chatSlice, { ChatMessage, ChatSession } from "store/slices/chat";
import { nanoid } from "@reduxjs/toolkit";
import { sendChatMessage } from "services/gemini";

const useChat = () => {
  const dispatch = useDispatch();
  const chatState = useSelector((state: RootState) => state.chat);
  const geminiApiKey = useSelector(
    (state: RootState) => state.settings.geminiApiKey
  );

  const activeSession: ChatSession | undefined = chatState.sessions.find(
    (s) => s.id === chatState.activeSessionId
  );

  const createSession = (title?: string) => {
    dispatch(chatSlice.actions.createSession(title));
  };

  const selectSession = (id: string) => {
    dispatch(chatSlice.actions.selectSession(id));
  };

  const deleteSession = (id: string) => {
    dispatch(chatSlice.actions.deleteSession(id));
  };

  const sendMessage = async (text: string) => {
    if (!chatState.activeSessionId) {
      dispatch(chatSlice.actions.createSession());
    }
    const sessionId =
      chatState.activeSessionId || chatState.sessions[0]?.id || "";

    const userMsg: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    dispatch(chatSlice.actions.addMessage({ sessionId, message: userMsg }));
    dispatch(chatSlice.actions.setLoading(true));
    dispatch(chatSlice.actions.setError(null));

    try {
      const history = (activeSession?.messages || []).map((m) => ({
        role: m.role,
        parts: m.content,
      }));
      const responseText = await sendChatMessage(geminiApiKey, history, text);
      const aiMsg: ChatMessage = {
        id: nanoid(),
        role: "model",
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      dispatch(chatSlice.actions.addMessage({ sessionId, message: aiMsg }));
    } catch (e: any) {
      dispatch(
        chatSlice.actions.setError(
          e.message || "Failed to get response from AI"
        )
      );
    } finally {
      dispatch(chatSlice.actions.setLoading(false));
    }
  };

  return {
    chatState,
    activeSession,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
  };
};

export default useChat;
