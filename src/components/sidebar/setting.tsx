"use client";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  TextField,
} from "@radix-ui/themes";
import { GearIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useAppStore } from "@/store";

export default function Setting() {
  const { apiKey, setApiKey } = useAppStore();

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="soft">
          <GearIcon width="16" height="16" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content style={{ width: 360 }}>
        <Flex gap="3">
          <Box grow="1">
            <TextField.Root>
              <TextField.Slot>
                <PaperPlaneIcon height="16" width="16" />
              </TextField.Slot>
              <TextField.Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API KEY"
              />
            </TextField.Root>
          </Box>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
