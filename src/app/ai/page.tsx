"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { PageTitle } from "@/components/ui";

/** 챗봇을 화면 가득 크게 쓰는 화면. 오른쪽 아래 챗봇과 같은 대화를 이어서 쓴다. */
export default function AiPage() {
  return (
    <>
      <PageTitle
        title="AI로 예약하기"
        description="대화하듯이 조건을 말하면 AI가 빈 회의실을 찾아 바로 예약해요. 다른 화면에서는 오른쪽 아래 버튼으로도 열 수 있어요."
      />
      <div className="h-[calc(100dvh-15rem)] min-h-[480px] max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface">
        <ChatPanel />
      </div>
    </>
  );
}
