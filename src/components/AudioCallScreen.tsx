import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CallStatus = 'ringing' | 'connecting' | 'connected';

interface AudioCallScreenProps {
  callerName: string;
  onEnd: () => void;
  isOutgoing?: boolean;
}

const AudioCallScreen: React.FC<AudioCallScreenProps> = ({ callerName, onEnd, isOutgoing = true }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus>(isOutgoing ? 'ringing' : 'connecting');
  const [statusPosition, setStatusPosition] = useState<'center' | 'top'>('center');

  // Simulate call connection flow
  useEffect(() => {
    if (callStatus === 'ringing') {
      // Simulate ringing for 3 seconds
      const ringTimeout = setTimeout(() => {
        setCallStatus('connecting');
      }, 3000);
      return () => clearTimeout(ringTimeout);
    } else if (callStatus === 'connecting') {
      // Simulate connecting for 1.5 seconds
      const connectTimeout = setTimeout(() => {
        setStatusPosition('top');
        setTimeout(() => {
          setCallStatus('connected');
        }, 300);
      }, 1500);
      return () => clearTimeout(connectTimeout);
    }
  }, [callStatus]);

  // Duration timer only starts when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;
    
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(duration);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Status indicator that slides from center to top */}
      <div
        className={cn(
          'absolute transition-all duration-500 ease-out',
          statusPosition === 'center' 
            ? 'top-1/2 -translate-y-1/2' 
            : 'top-8 translate-y-0'
        )}
      >
        {callStatus !== 'connected' && (
          <div className="flex flex-col items-center animate-fade-in">
            {callStatus === 'ringing' && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            {callStatus === 'connecting' && (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            )}
            <p className="text-lg font-medium text-muted-foreground">{getStatusText()}</p>
          </div>
        )}
        {callStatus === 'connected' && statusPosition === 'top' && (
          <p className="text-lg font-mono text-primary animate-fade-in">{formatDuration(duration)}</p>
        )}
      </div>

      {/* Main content - visible when status moves to top */}
      <div className={cn(
        'flex flex-col items-center transition-all duration-500',
        statusPosition === 'center' ? 'opacity-100' : 'opacity-100'
      )}>
        {/* Caller Avatar */}
        <div className="relative mb-8 animate-fade-in">
          <div className={cn(
            'w-40 h-40 rounded-full bg-secondary flex items-center justify-center',
            callStatus === 'ringing' && 'animate-pulse-glow'
          )}>
            <span className="text-6xl font-bold text-foreground">
              {callerName.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Pulse rings for ringing state */}
          {callStatus === 'ringing' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          {/* Connected indicator */}
          {callStatus === 'connected' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-medium animate-scale-in">
              Connected
            </div>
          )}
        </div>

        {/* Caller Name */}
        <h2 className="text-2xl font-bold mb-2 animate-slide-up">{callerName}</h2>
        
        {/* Duration (only show in center when connected and centered) */}
        {callStatus === 'connected' && statusPosition === 'center' && (
          <p className="text-lg text-muted-foreground font-mono mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {formatDuration(duration)}
          </p>
        )}
        
        {/* Spacer when timer is at top */}
        {statusPosition === 'top' && <div className="mb-12" />}
      </div>

      {/* Controls */}
      <div className="absolute bottom-20 flex items-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            'w-16 h-16 rounded-full transition-all active:scale-90',
            isMuted ? 'bg-destructive text-destructive-foreground' : 'bg-card border border-border hover:bg-secondary'
          )}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={onEnd}
          className="w-20 h-20 rounded-full shadow-lg active:scale-90 animate-bounce-subtle"
        >
          <Phone className="w-8 h-8 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default AudioCallScreen;
