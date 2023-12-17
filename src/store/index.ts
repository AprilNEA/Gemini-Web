import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { produce } from "immer";
import { nanoid } from "nanoid";

export enum Model {
  "GeminiPro" = "gemini-pro",
  "GeminiProVision" = "gemini-pro-vision",
}

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  model: Model;
  topic?: string;
  messages: ChatMessage[];
}

interface AppStore {
  apiKey: string;
  setApiKey: (apiKey: string) => void;

  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  createNewSession: (model: Model) => string;
  addMessageToSession: (
    sessionId: string,
    message: Omit<ChatMessage, "createdAt">,
  ) => void;
  updateLastMessageInSession: (sessionId: string, newContent: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      apiKey: "",
      setApiKey: (apiKey) =>
        set(
          produce((draft: AppStore) => {
            draft.apiKey = apiKey;
          }),
        ),
      sessions: [],
      currentSessionId: null,
      setCurrentSessionId: (sessionId) =>
        set(
          produce((draft: AppStore) => {
            draft.currentSessionId = sessionId;
          }),
        ),
      createNewSession: (model) => {
        const newSessionId = nanoid();
        set(
          produce((draft: AppStore) => {
            draft.sessions.push({
              id: newSessionId,
              model,
              messages: [],
            });
          }),
        );
        get().setCurrentSessionId(newSessionId);
        return newSessionId;
      },
      addMessageToSession: (sessionId, message) =>
        set(
          produce((draft: AppStore) => {
            const session = draft.sessions.find((s) => s.id === sessionId);
            if (session) {
              session.messages.push({ ...message, createdAt: new Date() });
            }
          }),
        ),
      updateLastMessageInSession: (sessionId, newContent) =>
        set(
          produce((draft: AppStore) => {
            const session = draft.sessions.find((s) => s.id === sessionId);
            if (session && session.messages.length > 0) {
              session.messages[session.messages.length - 1].parts =
                session.messages[session.messages.length - 1].parts +
                JSON.parse(newContent);
            }
          }),
        ),
    })),
    {
      name: "gemini-web",
      version: 1,
    },
  ),
);
