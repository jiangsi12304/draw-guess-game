import { AVATARS } from '../../utils/gameLogic';

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function AvatarPicker({ selectedIndex, onSelect }: AvatarPickerProps) {
  return (
    <div className="space-y-4 fade-in-up">
      <h3 className="text-lg font-display font-bold text-center text-white gradient-text">
        ✨ 选择你的头像
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {AVATARS.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`text-4xl p-3 rounded-xl transition-all duration-350 relative overflow-hidden backdrop-blur-md ${
              selectedIndex === index
                ? 'bg-gradient-to-br from-warm-pink to-warm-orange shadow-glow-lg scale-110 border-2 border-white/50'
                : 'bg-glass-white hover:scale-105 hover:shadow-lg border border-white/20'
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <span className="relative z-10">{avatar}</span>
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
