"use client";

import { useCompositionNotifier, type PendingComposition } from "@/hooks/use-composition-notifier";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function CompositionNotifier() {
  const { toast } = useToast();
  const router = useRouter();

  useCompositionNotifier({
    onCompleted: (entry: PendingComposition) => {
      toast({
        title: "AI 합성 완료 ✅",
        description: `"${entry.videoTitle}" 합성이 완료됐습니다. 지금 바로 확인하세요.`,
        duration: 8000,
        action: (
          <button
            onClick={() => router.push(`/watch/${entry.videoId}`)}
            className="rounded bg-white px-3 py-1 text-sm font-semibold text-black hover:bg-gray-200"
          >
            영상 보기
          </button>
        ) as React.ReactElement,
      });
    },
    onFailed: (entry: PendingComposition, reason: string | null) => {
      toast({
        title: "AI 합성 실패 ❌",
        description: `"${entry.videoTitle}" 합성에 실패했습니다.${reason ? ` 사유: ${reason}` : ""}`,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  return null;
}
