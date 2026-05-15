"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SessionTracker() {
  const { status } = useSession();
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    startTimeRef.current = new Date();

    const sendActivity = async () => {
      if (!startTimeRef.current) return;
      const now = new Date();
      const minutesSpent = Math.round(
        (now.getTime() - startTimeRef.current.getTime()) / (1000 * 60),
      );
      if (minutesSpent >= 1) {
        await fetch("/api/activity/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutes: minutesSpent }),
        });
        startTimeRef.current = now;
      }
    };

    intervalRef.current = setInterval(sendActivity, 5 * 60 * 1000);

    const handleBeforeUnload = () => {
      if (startTimeRef.current) {
        const minutesSpent = Math.round(
          (new Date().getTime() - startTimeRef.current.getTime()) / (1000 * 60),
        );
        if (minutesSpent >= 1) {
          fetch("/api/activity/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ minutes: minutesSpent }),
            keepalive: true,
          });
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (startTimeRef.current) {
        const minutesSpent = Math.round(
          (new Date().getTime() - startTimeRef.current.getTime()) / (1000 * 60),
        );
        if (minutesSpent >= 1) {
          fetch("/api/activity/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ minutes: minutesSpent }),
            keepalive: true,
          });
        }
      }
    };
  }, [status]);

  return null;
}
