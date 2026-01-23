import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  className?: string;
  onComplete?: (minutes: number) => void;
  compact?: boolean;
}

// Sound frequencies for a pleasant alarm
const playAlarmSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Play a pleasant chime sequence
  const now = audioContext.currentTime;
  playTone(523.25, now, 0.3);       // C5
  playTone(659.25, now + 0.15, 0.3); // E5
  playTone(783.99, now + 0.3, 0.4);  // G5
  playTone(1046.50, now + 0.5, 0.5); // C6
};

export function PomodoroTimer({ className, onComplete, compact = false }: PomodoroTimerProps) {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = useCallback(() => {
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setIsRunning(false);
    startTimeRef.current = null;
  }, [mode, focusDuration, breakDuration]);

  const toggleMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setIsRunning(false);
    startTimeRef.current = null;
  };

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      
      // Play sound
      if (soundEnabled) {
        playAlarmSound();
      }
      
      // Calculate elapsed minutes
      if (mode === 'focus') {
        const elapsedMinutes = focusDuration;
        setSessionsCompleted((prev) => prev + 1);
        onComplete?.(elapsedMinutes);
      }
      
      // Auto switch to break/focus
      setTimeout(() => {
        toggleMode();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled, mode, focusDuration, onComplete]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    }
  }, [focusDuration, breakDuration]);

  const progress = mode === 'focus' 
    ? ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  if (compact) {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Pomodoro</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </Button>
            <Badge 
              variant={mode === 'focus' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {mode === 'focus' ? 'Foco' : 'Pausa'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * progress) / 100}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={resetTimer}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={isRunning ? handlePause : handleStart}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
            {sessionsCompleted > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {sessionsCompleted} sessão(ões) concluída(s)
              </p>
            )}
          </div>
        </div>

        {!isRunning && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex gap-2 text-xs">
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block">Foco (min)</label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full h-7 px-2 text-center rounded border border-input bg-background text-sm"
                  min={1}
                  max={120}
                />
              </div>
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block">Pausa (min)</label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-full h-7 px-2 text-center rounded border border-input bg-background text-sm"
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-foreground" />
          <h3 className="font-semibold text-foreground">Pomodoro</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleMode}>
            {mode === 'focus' ? 'Foco' : 'Pausa'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {!isRunning && (
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Foco:</label>
              <input
                type="number"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25))}
                className="w-14 h-8 px-2 text-center rounded border border-input bg-background"
                min={1}
                max={120}
              />
              <span className="text-muted-foreground">min</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Pausa:</label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-14 h-8 px-2 text-center rounded border border-input bg-background"
                min={1}
                max={30}
              />
              <span className="text-muted-foreground">min</span>
            </div>
          </div>
        )}

        {sessionsCompleted > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            {sessionsCompleted} sessão(ões) de foco concluída(s)
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            onClick={isRunning ? handlePause : handleStart}
            className="min-w-24"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Need to import Badge for compact mode
import { Badge } from '@/components/ui/badge';
