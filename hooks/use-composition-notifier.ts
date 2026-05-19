"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export type CompositionActiveStatus = "QUEUED" | "PROCESSING";

export interface PendingComposition {
  compositionId: number;
  videoId: number;
  videoTitle: string;
  requestedAt: number;
  activeStatus: CompositionActiveStatus; // updated by polling
}

const STORAGE_KEY = "pendingCompositions";
const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 30 * 60 * 1000;

export function getPendingCompositions(): PendingComposition[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addPendingComposition(entry: Omit<PendingComposition, "requestedAt" | "activeStatus">) {
  const existing = getPendingCompositions();
  if (existing.some((e) => e.compositionId === entry.compositionId)) return;
  const full: PendingComposition = { ...entry, requestedAt: Date.now(), activeStatus: "QUEUED" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, full]));
  window.dispatchEvent(new CustomEvent("pendingCompositionsChanged"));
}

function removePendingComposition(compositionId: number) {
  const updated = getPendingCompositions().filter((e) => e.compositionId !== compositionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("pendingCompositionsChanged"));
}

function updateActiveStatus(compositionId: number, activeStatus: CompositionActiveStatus) {
  const updated = getPendingCompositions().map((e) =>
    e.compositionId === compositionId ? { ...e, activeStatus } : e
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("pendingCompositionsChanged"));
}

/** Returns a map of videoId → activeStatus for all pending compositions. */
export function usePendingVideoStatuses(): Map<number, CompositionActiveStatus> {
  const [map, setMap] = useState<Map<number, CompositionActiveStatus>>(
    () => new Map(getPendingCompositions().map((e) => [e.videoId, e.activeStatus]))
  );

  useEffect(() => {
    const sync = () =>
      setMap(new Map(getPendingCompositions().map((e) => [e.videoId, e.activeStatus])));
    window.addEventListener("pendingCompositionsChanged", sync);
    return () => window.removeEventListener("pendingCompositionsChanged", sync);
  }, []);

  return map;
}

interface ApiCompositionStatus {
  id: number;
  videoId: number;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  failReason: string | null;
}

interface NotifierCallbacks {
  onCompleted: (entry: PendingComposition) => void;
  onFailed: (entry: PendingComposition, reason: string | null) => void;
}

export function useCompositionNotifier({ onCompleted, onFailed }: NotifierCallbacks) {
  const callbacksRef = useRef({ onCompleted, onFailed });
  useEffect(() => {
    callbacksRef.current = { onCompleted, onFailed };
  });

  useEffect(() => {
    const poll = async () => {
      const pending = getPendingCompositions();
      if (pending.length === 0) return;

      await Promise.allSettled(
        pending.map(async (entry) => {
          if (Date.now() - entry.requestedAt > MAX_WAIT_MS) {
            removePendingComposition(entry.compositionId);
            callbacksRef.current.onFailed(entry, "처리 시간이 초과됐습니다.");
            return;
          }

          try {
            const data = await apiClient.get<ApiCompositionStatus>(
              `/api/v1/video-compositions/${entry.compositionId}/status`
            );

            if (data.status === "COMPLETED") {
              removePendingComposition(entry.compositionId);
              callbacksRef.current.onCompleted(entry);
            } else if (data.status === "FAILED") {
              removePendingComposition(entry.compositionId);
              callbacksRef.current.onFailed(entry, data.failReason);
            } else if (data.status !== entry.activeStatus) {
              // QUEUED → PROCESSING transition: update stored status
              updateActiveStatus(entry.compositionId, data.status);
            }
          } catch {
            // Network error — leave in storage, retry next tick
          }
        })
      );
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
