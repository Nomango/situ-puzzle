import { useEffect } from "react";
import type { Dialog } from "../lib/api";

export default function Chat({ dialogs }: { dialogs: Dialog[] }) {
  useEffect(() => {
    const elem = document.getElementById("chat");
    if (elem) {
      elem.scrollTop = elem.scrollHeight;
    }
  }, [dialogs]);
  return (
    <div id="chat" className="w-full h-full flex flex-col overflow-auto">
      {dialogs.map((v, index) =>
        v.role === "user" ? (
          <p
            className="bg-[#c1dbfd] rounded-[5px_5px_0_5px] p-2 my-2 ml-8"
            key={v.id || index}
          >
            {v.content}
          </p>
        ) : (
          <p
            className="bg-[#eaeaea] rounded-[5px_5px_5px_0] p-2 my-2 mr-8"
            key={v.id || index}
          >
            {v.content}
          </p>
        )
      )}
    </div>
  );
}
