import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioCallScreenProps {
  callerName: string;
  onEnd: () => void;
}

const AudioCallScreen: React.FC<AudioCallScreenProps> = ({ callerName, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      {/* Caller Avatar */}
      <div className="relative mb-8 animate-fade-in">
        <div className="w-40 h-40 rounded-full bg-secondary flex items-center justify-center animate-pulse-glow">
          <span className="text-6xl font-bold text-foreground">
            {callerName.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Caller Name */}
      <h2 className="text-2xl font-bold mb-2 animate-slide-up">{callerName}</h2>
      
      {/* Duration */}
      <p className="text-lg text-muted-foreground font-mono mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {formatDuration(duration)}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            'w-16 h-16 rounded-full transition-all',
            isMuted ? 'bg-destructive text-destructive-foreground' : 'bg-card border border-border hover:bg-secondary'
          )}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={onEnd}
          className="w-20 h-20 rounded-full shadow-lg animate-bounce-subtle"
        >
          <Phone className="w-8 h-8 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default AudioCallScreen;
