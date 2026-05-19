"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LevelUI from "@/app/components/LevelUI";

type Level = {
  id: number;
  topicId: number;
  order: number;
  title: string;
  description: string;
  html: string;
  css: string;
  hint?: string;
  xp: number;
};

export default function LevelPage() {
  const params = useParams();
  const id = params?.id as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [prevLevelId, setPrevLevelId] = useState<number | null>(null);
  const [nextLevelId, setNextLevelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      // 1. Текущий уровень
      const resLevel = await fetch(`/api/levels/${id}`);
      const levelData: Level = await resLevel.json();

      if (!levelData) {
        setLoading(false);
        return;
      }

      const resAll = await fetch(`/api/levels`);
      const allLevels: Level[] = await resAll.json();

      const levelsInTopic = allLevels.filter(
        (l) => l.topicId === levelData.topicId,
      );
      levelsInTopic.sort((a, b) => a.order - b.order);

      const currentIndex = levelsInTopic.findIndex(
        (l) => l.id === levelData.id,
      );
      const prev = currentIndex > 0 ? levelsInTopic[currentIndex - 1].id : null;
      const next =
        currentIndex < levelsInTopic.length - 1
          ? levelsInTopic[currentIndex + 1].id
          : null;

      setLevel(levelData);
      setPrevLevelId(prev);
      setNextLevelId(next);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        Loading...
      </div>
    );
  if (!level)
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        Level not found
      </div>
    );

  return (
    <LevelUI
      level={level}
      prevLevelId={prevLevelId}
      nextLevelId={nextLevelId}
    />
  );
}
