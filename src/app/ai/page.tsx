"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/ui";
import { useChat } from "@/lib/ai-chat";

/** 예전 AI 예약 화면 주소. 이제는 예약표로 보내면서 오른쪽 아래 챗봇을 연다. */
export default function AiPage() {
  const router = useRouter();
  const { setOpen } = useChat();

  useEffect(() => {
    setOpen(true);
    router.replace("/timeline");
  }, [router, setOpen]);

  return <Loading />;
}
