"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useRef } from "react";

interface UsePersistedMessagesOptions {
  api: string;
  storageKey: string;
  maxMessages?: number;
}

const DEFAULT_MAX_MESSAGES = 50;

export function usePersistedMessages({
  api,
  storageKey,
  maxMessages = DEFAULT_MAX_MESSAGES,
}: UsePersistedMessagesOptions) {
  const isInitialized = useRef(false);

  const chat = useChat({
    transport: new DefaultChatTransport({ api }),
  });

  useEffect(() => {
    if (isInitialized.current) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const messages = JSON.parse(stored) as UIMessage[];
        if (Array.isArray(messages) && messages.length > 0) {
          chat.setMessages(messages);
        }
      }
    } catch (error) {
      console.warn("Failed to load messages from localStorage:", error);
    }

    isInitialized.current = true;
  }, [storageKey, chat]);

  useEffect(() => {
    if (!isInitialized.current) return;

    try {
      if (chat.messages.length > 0) {
        const messagesToStore = chat.messages.slice(-maxMessages);
        localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn("Failed to save messages to localStorage:", error);
    }
  }, [chat.messages, storageKey, maxMessages]);

  const clearMessages = useCallback(() => {
    chat.setMessages([]);
    localStorage.removeItem(storageKey);
  }, [chat, storageKey]);

  useEffect(() => {
    if (chat.messages.length > maxMessages) {
      const messagesToKeep = chat.messages.slice(-maxMessages);
      chat.setMessages(messagesToKeep);
    }
  }, [chat.messages.length, maxMessages, chat]);

  return {
    ...chat,
    clearMessages,
  };
}
