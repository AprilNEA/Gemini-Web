import clsx from "clsx";
import Link from "next/link";

import { Button, Separator, Strong, Text } from "@radix-ui/themes";
import { Model, useAppStore } from "@/store";
import Search from "@/components/sidebar/search";
import packageMeta from "@/../package.json";
import { useIsClient } from "foxact/use-is-client";
import Setting from "@/components/sidebar/setting";
import Loading from "@/app/loading";

export default function Sidebar() {
  const { sessions, createNewSession, currentSessionId, setCurrentSessionId } =
    useAppStore();

  if (!useIsClient()) {
    return <Loading />;
  }

  function newChat() {
    createNewSession(Model.GeminiPro);
  }

  return (
    <div
      className={clsx(
        "flex-none",
        "flex flex-col items-start justify-start w-1/4 max-w-[300px]",
        "py-4 px-2 gap-y-2",
      )}
    >
      <Search />
      <Separator size="4" />
      <Link href="/sessions" prefetch={true}>
        <Button onClick={newChat}>New Chat</Button>
      </Link>
      <Separator size="4" />
      <div
        className={clsx(
          "w-full grow",
          "flex flex-col items-start justify-start gap-y-2",
        )}
      >
        {sessions.map((session) => (
          <Link
            key={session.id}
            href="/sessions"
            prefetch={true}
            onClick={() => setCurrentSessionId(session.id)}
            className={clsx(
              "w-full px-2 py-1",
              currentSessionId === session.id &&
                "border border-solid border-gray-200 bg-gray-200 rounded-md",
              "flex flex-row justify-start items-center gap-x-1",
            )}
          >
            <Text
              size={{
                initial: "1",
                md: "2",
              }}
              className="truncate"
            >
              {session?.topic ?? "New Chat"}
            </Text>
          </Link>
        ))}
      </div>
      <Separator size="4" />
      <div className="w-full px-2 py-1 flex flex-row justify-between items-center">
        <Text as="p" size="1">
          <Strong>
            <Link href="https://github.com/AprilNEA/Gemini-Web">DevUtils</Link>{" "}
            by{" "}
            <Link href="https://sku.moe" prefetch={true}>
              AprilNEA
            </Link>{" "}
            (v{packageMeta.version})
          </Strong>
        </Text>
        <Setting />
      </div>
    </div>
  );
}
