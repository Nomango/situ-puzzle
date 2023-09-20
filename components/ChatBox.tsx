import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { fetchChatHistory, type Dialog, fetchChat, Puzzle } from "../lib/api";
import Chat from "./Chat";
import { Button, Card, Loader, Menu, Text, TextInput } from "@mantine/core";
import {
  getHotkeyHandler,
  useEventListener,
  useInputState,
} from "@mantine/hooks";
import {
  IconBan,
  IconChecklist,
  IconMenu2,
  IconRotateRectangle,
  IconSend,
} from "@tabler/icons-react";

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
    if (history.puzzle) {
      setPuzzle(history.puzzle);
      setDialogs(history.discussion || []);
      setChatId(cid);
    }
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
  }, [doAction, appendDialog, chatId]);

  const startNewGame = useCallback(async () => {
    await doAction(async () => {
      setChatId("");
      const { cid } = await fetchChat("");
      await reloadDialogs(cid);
    });
  }, [doAction, reloadDialogs]);

  const stopGame = useCallback(async () => {
    setChatId("");
  }, []);

  const [cookies, setCookie] = useCookies(["cid"]);
  useEffect(() => {
    if (!chatId && cookies.cid) {
      doAction(async () => {
        await reloadDialogs(cookies.cid);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setCookie("cid", chatId, { maxAge: 3600 * 24 * 30 });
  }, [chatId, setCookie]);

  const [question, setQuestion] = useInputState("");
  const submitQuestion = useCallback(async () => {
    if (!question) {
      return;
    }
    doAction(async () => {
      const { reply, cid } = await fetchChat(question, chatId);
      appendDialog({ role: "user", content: question });
      appendDialog({ role: "assistant", content: reply });
      cid && setChatId(cid);
      setQuestion("");
    });
  }, [appendDialog, question, chatId, doAction, setQuestion]);

  const sendIconRef = useEventListener("click", submitQuestion);
  return (
    <>
      <div className="flex flex-col p4 w-full h-full bg-[rgb(247,250,255)] md:rounded-lg md:drop-shadow-lg">
        <Card className="h-20% overflow-auto" withBorder p="xl" radius="md">
          {puzzle ? (
            <>
              <Text fz="xl" ta="center">
                汤面 《{puzzle.title}》
              </Text>
              <Text fz="md" c="gray">
                {puzzle?.mystery}
              </Text>
            </>
          ) : (
            <>
              <Text fz="xl" ta="center">
                海龟汤 with AI
              </Text>
              <Text fz="md" c="gray">
                阅读一个难以理解的事件，试着提出任何问题，并找出事件背后真正的原因吧！
              </Text>
            </>
          )}
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
                  <IconSend ref={sendIconRef} className="w-4 cursor-pointer" />
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
                  <IconMenu2 className="w-4" />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={getAnswer}
                  leftSection={<IconChecklist className="w-4" />}
                >
                  查看汤底
                </Menu.Item>
                <Menu.Item
                  onClick={stopGame}
                  leftSection={<IconBan className="w-4" />}
                >
                  结束游戏
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        ) : (
          <Button onClick={startNewGame} fullWidth disabled={pending}>
            {!pending ? (
              <>
                <IconRotateRectangle className="w-4" />
                &nbsp; 随机上汤
              </>
            ) : (
              <>
                <Loader size={18} />
                &nbsp; 正在上汤
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );
}
