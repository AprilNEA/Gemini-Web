import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface AppStore {
  history: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (text: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      history: [
        {
          id: "init",
          role: "bot",
          text: "Hello, I'm Gemini, your personal AI assistant. How can I help you today?",
        },
      ],
      addMessage: (message: ChatMessage) => {
        set((state) => ({
          history: [...state.history, message],
        }));
      },
      updateLastMessage: (text: string) => {
        const history = get().history;
        if (history.length > 0) {
          // 替换最后一条消息
          history[history.length - 1] = {
            ...history[history.length - 1],
            text: `${history[history.length - 1].text}${JSON.parse(text)}`,
          };
          set({ history: [...history] });
        }
      },
    }),
    {
      name: "gemini-web",
      version: 1,
    },
  ),
);
