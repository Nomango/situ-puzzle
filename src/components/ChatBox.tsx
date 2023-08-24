import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { fetchChatHistory, type Dialog, fetchChat, Puzzle } from "../lib/api";
import Chat from "./Chat";
import {
  Button,
  Card,
  Loader,
  Menu,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import {
  ArrowPathIcon,
  Bars3Icon,
  DocumentCheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  getHotkeyHandler,
  useEventListener,
  useInputState,
} from "@mantine/hooks";

export default function ChatBox() {
  const [pending, setPending] = useState(false);
  const [chatId, setChatId] = useState("");
  const [puzzle, setPuzzle] = useState<Puzzle>();
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const appendDialog = useCallback((dialog: Dialog) => {
    setDialogs((prev) => prev.concat(dialog));
  }, []);

  const doAction = useCallback(
    async (f: () => Promise<any>) => {
      if (pending) {
        return;
      }
      setPending(true);
      try {
        await f();
      } finally {
        setPending(false);
      }
    },
    [pending]
  );

  const reloadDialogs = useCallback(async (cid: string) => {
    const history = await fetchChatHistory(cid);
    setPuzzle(history.puzzle);
    setDialogs(history.discussion || []);
    setChatId(cid);
  }, []);

  const getAnswer = useCallback(async () => {
    if (!chatId) {
      return;
    }
    await doAction(async () => {
      const { reply } = await fetchChat("<<PLACEHOLDER>>:answer", chatId);
      appendDialog({ role: "assistant", content: reply });
      setChatId("");
    });
  }, [appendDialog, chatId]);

  const startNewGame = useCallback(async () => {
    await doAction(async () => {
      setChatId("");
      const { cid } = await fetchChat("");
      await reloadDialogs(cid);
    });
  }, [reloadDialogs]);

  const [cookies, setCookie] = useCookies(["cid"]);
  useEffect(() => {
    cookies.cid = cookies.cid || "a5d81020-dbb9-43e1-8dfb-75bf1abc4969";
    if (cookies.cid) {
      doAction(async () => {
        await reloadDialogs(cookies.cid);
      });
    }
  }, []);
  useEffect(() => {
    setCookie("cid", chatId, { maxAge: 3600 * 24 * 30 });
  }, [chatId]);

  const [question, setQuestion] = useInputState("");
  const submitQuestion = useCallback(async () => {
    if (!question) {
      return;
    }
    doAction(async () => {
      const { reply, cid } = await fetchChat(question, chatId);
      appendDialog({ role: "user", content: question });
      appendDialog({ role: "assistant", content: reply });
      setChatId(cid);
      setQuestion("");
    });
  }, [appendDialog, question, chatId]);

  const sendIconRef = useEventListener("click", submitQuestion);
  return (
    <>
      <div className="flex flex-col p4 w-full h-full bg-[rgb(247,250,255)] md:rounded-lg md:drop-shadow-lg">
        <Card className="h-20% overflow-auto" withBorder p="xl" radius="md">
          <Text fz="xl">汤面 {puzzle && `《${puzzle.title}》`}</Text>
          <Text fz="md">{puzzle?.mystery}</Text>
        </Card>
        <div className="h-70% flex-1">
          <Chat dialogs={dialogs}></Chat>
        </div>
        {chatId ? (
          <div className="flex gap-1 items-center justify-center">
            <TextInput
              className="flex-1"
              value={question}
              onChange={pending ? undefined : setQuestion}
              onKeyDown={getHotkeyHandler([["Enter", submitQuestion]])}
              radius="sm"
              size="md"
              rightSection={
                !pending ? (
                  <PaperAirplaneIcon
                    ref={sendIconRef}
                    className="w-4 cursor-pointer"
                  />
                ) : (
                  <Loader size={18} />
                )
              }
              placeholder="提问"
              rightSectionWidth={42}
              maxLength={60}
            />
            <Menu
              transitionProps={{ transition: "pop-top-right" }}
              position="top-end"
              width={220}
              withinPortal
            >
              <Menu.Target>
                <Button>
                  <Bars3Icon className="w-4" />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={getAnswer}
                  icon={<DocumentCheckIcon className="w-4" />}
                >
                  查看汤底
                </Menu.Item>
                <Menu.Item
                  onClick={startNewGame}
                  icon={<ArrowPathIcon className="w-4" />}
                >
                  重新开始
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        ) : (
          <Button
            onClick={startNewGame}
            fullWidth
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark" ? "#5865F2" : "#5865F2",
              "&:not([data-disabled]):hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.fn.lighten("#5865F2", 0.05)
                    : theme.fn.darken("#5865F2", 0.05),
              },
            })}
            disabled={pending}
          >
            {!pending ? (
              <ArrowPathIcon className="w-4" />
            ) : (
              <Loader size={18} />
            )}
            &nbsp; 开始新游戏
          </Button>
        )}
      </div>
    </>
  );
}