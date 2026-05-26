"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RankProgress } from "@/lib/levelUtils";

interface VictoryModalProps {
  open: boolean;
  levelTitle: string;
  xpAwarded: number;
  topicBonusXp: number;
  rankProgress: RankProgress;
  topicCompleted: boolean;
  nextLevelId: number | null;
  onContinue: () => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
}

function AnimatedXp({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 24));
    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        setValue(target);
        clearInterval(id);
      } else {
        setValue(current);
      }
    }, 40);
    return () => clearInterval(id);
  }, [target]);

  return <span className="xp-pop-number">+{value}</span>;
}

export default function VictoryModal({
  open,
  levelTitle,
  xpAwarded,
  topicBonusXp,
  rankProgress,
  topicCompleted,
  nextLevelId,
  onContinue,
  soundEnabled,
  onSoundToggle,
}: VictoryModalProps) {
  if (!open) return null;

  const totalXpGain = xpAwarded + topicBonusXp;

  return (
    <div className="victory-overlay fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="victory-modal glass-card rounded-2xl p-8 max-w-md w-full text-center border border-accent-purple shadow-2xl relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          aria-hidden
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-purple/40 blur-3xl rounded-full" />
        </div>

        <button
          type="button"
          onClick={() => onSoundToggle(!soundEnabled)}
          className="absolute top-4 right-4 text-text-dim hover:text-accent-blue transition-colors z-10"
          title={soundEnabled ? "Выключить звук" : "Включить звук"}
        >
          <i className={`fas ${soundEnabled ? "fa-volume-up" : "fa-volume-mute"}`} />
        </button>

        <div className="victory-trophy-ring w-24 h-24 mx-auto mb-5 rounded-full bg-linear-to-br from-accent-blue/30 to-accent-purple/30 flex items-center justify-center border-2 border-accent-blue shadow-neon-blue relative z-10">
          <i className="fas fa-trophy text-5xl text-accent-yellow" />
        </div>

        <p className="text-accent-green text-sm font-semibold uppercase tracking-wider mb-1 relative z-10">
          Уровень пройден
        </p>
        <h3 className="text-2xl font-bold mb-2 gradient-text relative z-10">
          {levelTitle}
        </h3>

        {totalXpGain > 0 && (
          <div className="my-4 relative z-10">
            <div className="text-4xl font-bold text-accent-green flex items-center justify-center gap-2">
              <i className="fas fa-bolt" />
              <AnimatedXp target={totalXpGain} />
              <span className="text-lg text-text-dim">XP</span>
            </div>
            {topicBonusXp > 0 && (
              <p className="text-sm text-accent-yellow mt-1">
                +{topicBonusXp} XP бонус за завершение темы
              </p>
            )}
          </div>
        )}

        <div className="my-6 p-4 rounded-xl bg-secondary-dark/60 border border-glass-border text-left relative z-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-dim">Ранг</span>
            <span className="font-semibold text-accent-blue">
              {rankProgress.rankTitle}
            </span>
          </div>
          {rankProgress.nextRankTitle ? (
            <>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-linear-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${rankProgress.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-text-dim">
                До «{rankProgress.nextRankTitle}»:{" "}
                <span className="text-accent-purple font-semibold">
                  {rankProgress.xpToNext} XP
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-accent-yellow">Максимальный ранг достигнут</p>
          )}
        </div>

        {topicCompleted && (
          <p className="text-text-dim text-sm mb-4 relative z-10">
            Тема полностью завершена — отличная работа!
          </p>
        )}

        <div className="flex flex-col gap-3 relative z-10">
          {nextLevelId !== null ? (
            <button
              type="button"
              onClick={onContinue}
              className="btn-primary-glow w-full py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg"
            >
              <i className="fas fa-arrow-right mr-2" />
              Следующий уровень
            </button>
          ) : (
            <Link
              href="/topics"
              className="btn-primary-glow w-full py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg inline-block"
            >
              <i className="fas fa-book-open mr-2" />
              К списку тем
            </Link>
          )}
          {nextLevelId !== null && (
            <Link
              href="/topics"
              className="text-text-dim text-sm hover:text-accent-blue transition-colors"
            >
              Остаться на странице
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
