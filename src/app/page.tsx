"use client";
import { Button, Flex } from "@radix-ui/themes";
import { Model, useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import { useIsClient } from "foxact/use-is-client";

export default function Home() {
  const router = useRouter();
  const { createNewSession } = useAppStore();

  function newChat() {
    createNewSession(Model.GeminiPro);
    router.push("session");
  }

  if (!useIsClient()) {
    return <div>Loading...</div>;
  }

  return (
    <Flex direction="column" justify="center" align="center">
      <Button onClick={newChat}>New Chat</Button>
    </Flex>
  );
}
