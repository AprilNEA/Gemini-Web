"use client";

import { ChatMessage, useAppStore } from "@/store";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchEventSource } from "@fortaine/fetch-event-source";
import { useIsClient } from "foxact/use-is-client";
import { Avatar, Button, Card, Flex, Text, TextArea } from "@radix-ui/themes";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useRouter } from "next/navigation";

const shouldSubmit = (e: KeyboardEvent) => {
  if (e.key !== "Enter") return false;

  return !e.shiftKey;
};

function ChatHistory({ messages }: { messages: ChatMessage[] }) {
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // auto scroll
  useLayoutEffect(() => {
    setTimeout(() => {
      const dom = latestMessageRef.current;
      if (dom) {
        dom.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 500);
  });

  return (
    <Flex
      direction="column"
      justify="start"
      align="center"
      className="grow w-full overflow-y-auto hide-scrollbar mb-2"
      gap="2"
    >
      {messages.map((message, index) => (
        <Flex
          key={index}
          direction="row"
          justify="center"
          align="start"
          gap="1"
          className="w-full h-fit"
        >
          <div className="w-8">
            {message.role === "model" && (
              <Avatar size="2" radius="full" src="" fallback="G" />
            )}
          </div>
          <div
            className="grow"
            style={{
              maxWidth: "calc(100% - 4rem)",
            }}
          >
            <Card className="w-full max-w-full">
              <Markdown className="w-full max-w-full break-words whitespace-pre-line overflow-auto scrollbar scrollbar-thumb-gray-400">
                {message.parts}
              </Markdown>
            </Card>
          </div>
          <div className="w-8">
            {message.role === "user" && (
              <Avatar size="2" radius="full" src="" fallback="U" />
            )}
          </div>
        </Flex>
      ))}
      <div ref={latestMessageRef} style={{ opacity: 0, height: "2em" }}>
        -
      </div>
    </Flex>
  );
}

export default function SessionPage() {
  const router = useRouter();
  const {
    apiKey,
    sessions,
    currentSessionId,
    addMessageToSession,
    updateLastMessageInSession,
  } = useAppStore();
  const currentSession = sessions.find((s) => currentSessionId === s.id);
  const [userInput, setUserInput] = useState("");
  const control = new AbortController();

  useEffect(() => {
    if (!currentSessionId) return router.push("/");
  }, [currentSessionId]);

  // check if you should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (shouldSubmit(e.nativeEvent)) {
      onUserSubmit().then((r) => {});
      e.preventDefault();
    }
  };

  const onUserSubmit = async () => {
    if (!currentSessionId || !currentSession) return;

    if (userInput.length <= 0) return;

    addMessageToSession(currentSessionId, { parts: userInput, role: "user" });
    addMessageToSession(currentSessionId, { parts: "", role: "model" });
    setUserInput("");
    await fetchEventSource("/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        prompt: userInput,
        history: [...currentSession.messages],
      }),
      onmessage(e) {
        updateLastMessageInSession(currentSessionId, e.data);
      },
    });
  };

  if (!useIsClient()) {
    return <div>Loading...</div>;
  }

  if (!currentSession) {
    return <div>Not Found...</div>;
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      className="h-full mx-auto max-w-3xl py-4"
    >
      <ChatHistory
        messages={[
          {
            role: "model",
            parts: "I'm Gemini Pro, how can I help you?",
            createdAt: new Date(),
          },
          ...currentSession.messages,
        ]}
      />
      <Flex
        direction="row"
        justify="center"
        align="end"
        gap="2"
        className="w-full"
      >
        <TextArea
          value={userInput}
          className="grow"
          onKeyDown={onInputKeyDown}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button onClick={onUserSubmit}>Send</Button>
      </Flex>
    </Flex>
  );
}
