import { AVATARS } from '../../utils/gameLogic';

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function AvatarPicker({ selectedIndex, onSelect }: AvatarPickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-bold text-center text-white">选择你的头像</h3>
      <div className="grid grid-cols-4 gap-3">
        {AVATARS.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`text-4xl p-3 rounded-lg transition-all duration-300 ${
              selectedIndex === index
                ? 'bg-warm-pink shadow-glow-lg scale-110'
                : 'bg-glass-white hover:scale-105'
            }`}
          >
            {avatar}
          </button>
        ))}
      </div>
    </div>
  );
}
