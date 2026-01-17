interface AchievementCardProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    icon: string;
  };
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="glass-card rounded-lg p-5 flex items-center gap-4 border border-glass-border transition-all duration-300 hover:-translate-y-1 hover:border-accent-green hover:shadow-neon-green">
      <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-lg shrink-0">
        <i className={achievement.icon}></i>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-1">{achievement.title}</h4>
        <p className="text-text-dim text-sm">{achievement.description}</p>
      </div>
    </div>
  );
}
