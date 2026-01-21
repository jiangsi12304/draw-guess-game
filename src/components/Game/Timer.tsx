import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // 秒
  onTimeUp?: () => void;
  isActive?: boolean;
}

export default function Timer({ duration, onTimeUp, isActive = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);

      if (newTime === 0) {
        onTimeUp?.();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive, onTimeUp]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isWarning ? '#FF6B6B' : '#FFB6C1'}
            strokeWidth="4"
            strokeDasharray={`${(percentage / 100) * 283} 283`}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xl font-bold font-display ${
              isWarning ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
