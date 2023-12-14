"use client";

import { Button, Flex, TextArea, Text, Card } from "@radix-ui/themes";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useAppStore } from "@/store";
import { nanoid } from "nanoid";
import { useIsClient } from "foxact/use-is-client";
import { fetchEventSource } from "@fortaine/fetch-event-source";

function ChatHistory() {
  const { history } = useAppStore();

  return (
    <Flex
      direction="column"
      justify="start"
      align="center"
      className="grow w-full"
      gap="2"
    >
      {history.map((item) => (
        <Card key={item.id} className="w-full h-fit">
          <Text className="whitespace-pre-line">
            {item.role.toUpperCase()}: {item.text}
          </Text>
        </Card>
      ))}
    </Flex>
  );
}

export default function Home() {
  const { addMessage, updateLastMessage } = useAppStore();
  const [userInput, setUserInput] = useState("");
  const control = new AbortController();

  const mutation = trpc.chat.useMutation({
    onSuccess: (data) => {
      addMessage({ id: nanoid(), text: data.text, role: "bot" });
    },
  });

  async function send() {
    addMessage({ id: nanoid(), text: userInput, role: "user" });
    addMessage({ id: nanoid(), text: "", role: "bot" });
    // mutation.mutate({
    //   prompt: userInput,
    //   apiKey: "fff",
    // });
    await fetchEventSource("/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: "ffffff",
        prompt: userInput,
      }),
      // signal: ctrl.signal,
      // async onopen(response) {
      //   console.log("onopen", await response.text());
      // },
      onmessage(e) {
        updateLastMessage(e.data);
      },
    });

    setUserInput("");
  }

  if (!useIsClient()) {
    return <div>Loading...</div>;
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      className="h-full mx-auto max-w-2xl py-4"
    >
      <ChatHistory />
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
