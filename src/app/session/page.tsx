"use client";

import { ChatMessage, useAppStore } from "@/store";

import { useState } from "react";
import { fetchEventSource } from "@fortaine/fetch-event-source";
import { useIsClient } from "foxact/use-is-client";
import { Avatar, Button, Card, Flex, Text, TextArea } from "@radix-ui/themes";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatHistory({ messages }: { messages: ChatMessage[] }) {
  return (
    <Flex
      direction="column"
      justify="start"
      align="center"
      className="grow w-full overflow-auto mb-2"
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
          <Avatar size="2" radius="full" src="" fallback="G" />
          <Card className="grow h-auto min-h-[20px]">
            <Text className="whitespace-pre-line">
              {/*<Markdown>{message.content}</Markdown>*/}
              <Markdown
                /* eslint-disable-next-line react/no-children-prop */
                children={message.content.replace(/\n\n/g, "\n")}
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");

                    return match ? ( // @ts-ignore
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        className="rounded-xl"
                        /* eslint-disable-next-line react/no-children-prop */
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                        style={materialDark}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </Text>
          </Card>
        </Flex>
      ))}
    </Flex>
  );
}

export default function SessionPage() {
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

  // const mutation = trpc.chat.useMutation({
  //   onSuccess: (data) => {
  //     addMessageToSession({ id: nanoid(), text: data.text, role: "bot" });
  //   },
  // });

  async function send() {
    if (!currentSessionId) return;

    addMessageToSession(currentSessionId, { content: userInput, role: "user" });
    addMessageToSession(currentSessionId, { content: "", role: "model" });
    setUserInput("");

    await fetchEventSource("/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        prompt: userInput,
      }),
      // signal: ctrl.signal,
      // async onopen(response) {
      //   console.log("onopen", await response.text());
      // },
      onmessage(e) {
        updateLastMessageInSession(currentSessionId, e.data);
      },
    });
  }

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
      className="h-full mx-auto max-w-2xl py-4"
    >
      <ChatHistory messages={currentSession.messages} />
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
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button onClick={send}>Send</Button>
      </Flex>
    </Flex>
  );
}
