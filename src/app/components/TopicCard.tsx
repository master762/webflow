import Link from "next/link";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    icon: string;
    description: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    isBoss: boolean;
  };
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link
      href={topic.isBoss ? "/boss" : `/level?topic=${topic.id}`}
      className={`glass-card rounded-xl p-6 block no-underline text-text-light transition-all duration-300 hover:-translate-y-2.5 ${
        topic.isBoss
          ? "border-accent-red shadow-neon-red hover:shadow-[0_0_25px_rgba(255,0,85,0.5)]"
          : "hover:shadow-neon-blue hover:border-accent-blue"
      }`}
    >
      <div
        className={`text-4xl mb-4 ${
          topic.isBoss ? "text-accent-red" : "text-accent-blue"
        }`}
      >
        <i className={topic.icon}></i>
      </div>
      <h3 className="text-xl font-bold mb-3">{topic.title}</h3>
      <p className="text-text-dim text-sm mb-6">{topic.description}</p>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className={`progress-fill ${topic.isBoss ? "gradient-bg-red" : ""}`}
          style={{ width: `${topic.progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-text-dim">
        <span>
          {topic.lessonsCompleted}/{topic.totalLessons} уроков
        </span>
        <span>
          {topic.isBoss && topic.progress === 0
            ? "Заблокировано"
            : `${topic.progress}%`}
        </span>
      </div>
    </Link>
  );
}
