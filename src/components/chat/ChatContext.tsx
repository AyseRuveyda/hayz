"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatContextValue = {
  open: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(
    () => ({ open, openChat, closeChat, toggleChat }),
    [open, openChat, closeChat, toggleChat]
  );

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChatDrawer() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatDrawer must be used within ChatProvider");
  }
  return ctx;
}
