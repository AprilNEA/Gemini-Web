"use client";
import { Button, Flex } from "@radix-ui/themes";
import { Model, useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import { useIsClient } from "foxact/use-is-client";
import Loading from "@/app/loading";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { createNewSession } = useAppStore();

  function newChat() {
    createNewSession(Model.GeminiPro);
  }

  if (!useIsClient()) {
    return <Loading />;
  }

  return (
    <Flex direction="column" justify="center" align="center">
      <Link href="/sessions">
        <Button onClick={newChat}>New Chat</Button>
      </Link>
    </Flex>
  );
}
