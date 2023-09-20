"use client";

import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center m-auto w-full h-full">
      <div className="position-absolute w-full h-full md:w-[600px] md:max-w-[calc(100%-2rem)] md:h-80%">
        <ChatBox />
      </div>
    </main>
  );
}
