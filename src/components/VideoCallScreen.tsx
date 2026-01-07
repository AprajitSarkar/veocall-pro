import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Phone, 
  Video, 
  VideoOff, 
  SwitchCamera,
  Loader2,
  ArrowDown,
  ArrowUp,
  Camera,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';

type CallState = 'requesting-permission' | 'permission-denied' | 'active';

interface VideoCallScreenProps {
  callerName: string;
  onEnd: () => void;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ callerName, onEnd }) => {
  const { ping } = useApp();
  const { permissions, requestVideoCallPermissions } = useMediaPermissions();
  const [callState, setCallState] = useState<CallState>('requesting-permission');
  const [showUI, setShowUI] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [pipPosition, setPipPosition] = useState({ x: 16, y: 116 });
  const [pipSize, setPipSize] = useState(0); // 0 = normal, 1 = enlarged
  const [isSwapped, setIsSwapped] = useState(false); // false = other person fullscreen, true = self fullscreen
  const hideTimeout = useRef<NodeJS.Timeout>();
  const pipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const doubleTapTimer = useRef<NodeJS.Timeout>();

  // Request camera and microphone permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      const granted = await requestVideoCallPermissions();
      if (granted) {
        setCallState('active');
      } else {
        setCallState('permission-denied');
      }
    };
    requestPermission();
  }, [requestVideoCallPermissions]);

  useEffect(() => {
    if (callState !== 'active') return;
    
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const resetHideTimer = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowUI(true);
    hideTimeout.current = setTimeout(() => setShowUI(false), 3000);
  };

  const handleScreenClick = () => {
    if (!isDragging.current) {
      resetHideTimer();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = () => {
    if (ping < 100) return 'HD';
    if (ping < 200) return 'SD';
    return 'LD';
  };

  const getPingColor = () => {
    if (ping < 50) return 'text-success';
    if (ping < 150) return 'text-warning';
    return 'text-destructive';
  };

  const getSignalBars = () => {
    if (ping < 50) return 5;
    if (ping < 100) return 4;
    if (ping < 150) return 3;
    if (ping < 300) return 2;
    return 1;
  };

  const pipSizes = [
    { width: 100, height: 140 },
    { width: 140, height: 200 },
  ];

  const handlePipMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDragging.current = true;
    hasMoved.current = false;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Store the initial mouse position
    dragStart.current = { x: clientX, y: clientY };
    // Store the offset from PiP position
    dragOffset.current = { x: pipPosition.x, y: pipPosition.y };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate movement delta
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    // Mark as moved if significant movement
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved.current = true;
    }
    
    // Get container bounds
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const currentSize = pipSizes[pipSize];
    
    // Calculate new position (using left/top coordinates)
    let newX = dragOffset.current.x + deltaX;
    let newY = dragOffset.current.y + deltaY;
    
    // Constrain within bounds with 8px padding
    const padding = 8;
    newX = Math.max(padding, Math.min(containerWidth - currentSize.width - padding, newX));
    newY = Math.max(padding, Math.min(containerHeight - currentSize.height - padding - 100, newY)); // 100 for controls
    
    setPipPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handlePipTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    // Don't trigger tap if we were dragging
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
      
      if (pipSize === 0) {
        // First double tap: enlarge
        setPipSize(1);
        
        // Set timer for swap window (2 seconds)
        doubleTapTimer.current = setTimeout(() => {
          // Reset size back to normal after 2 seconds if not tapped again
          setPipSize(0);
        }, 2000);
      } else if (pipSize === 1) {
        // Second double tap within 2 seconds: swap screens
        if (doubleTapTimer.current) {
          clearTimeout(doubleTapTimer.current);
        }
        setIsSwapped(!isSwapped);
        setPipSize(0);
      }
    }
    
    lastTapTime.current = now;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // Permission denied screen
  if (callState === 'permission-denied') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Camera & Microphone Access Required</h2>
          <p className="text-muted-foreground mb-6 max-w-xs">
            To make video calls, please allow camera and microphone access in your browser settings.
          </p>
          <Button variant="destructive" onClick={onEnd} className="px-8">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Permission requesting screen
  if (callState === 'requesting-permission') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center text-center p-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Camera & Microphone Access</h2>
          <p className="text-muted-foreground mb-4">
            Please allow camera and microphone access to start the video call
          </p>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-background z-50"
      onClick={handleScreenClick}
      onMouseMove={resetHideTimer}
    >
      {/* Full Screen Video */}
      <div className="absolute inset-0 bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl font-bold">
              {isSwapped ? 'You' : callerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-lg text-muted-foreground">
            {isSwapped ? 'Your camera' : 'Connecting video...'}
          </p>
        </div>
      </div>

      {/* Network Overlays */}
      <div 
        className={cn(
          'absolute top-0 left-0 right-0 p-4 flex items-start justify-between transition-all duration-300',
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
      >
        {/* Top Left - Ping */}
        <div className="flex items-center gap-2 px-3 py-2 bg-background/60 backdrop-blur-sm rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className={cn('text-sm font-mono', getPingColor())}>
            Ping: {ping}ms
          </span>
        </div>

        {/* Top Center - Quality & Duration */}
        <div className="flex items-center gap-3 px-4 py-2 bg-background/60 backdrop-blur-sm rounded-lg">
          <span className="text-sm font-medium text-primary">{getQualityLabel()}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-mono">{formatDuration(duration)}</span>
        </div>

        {/* Top Right - Signal & Speed */}
        <div className="flex items-center gap-3 px-3 py-2 bg-background/60 backdrop-blur-sm rounded-lg">
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-sm transition-colors',
                  i <= getSignalBars() ? getPingColor().replace('text-', 'bg-') : 'bg-muted'
                )}
                style={{ height: `${i * 3 + 2}px` }}
              />
            ))}
          </div>
          <div className="flex flex-col text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3" /> 2.5MB/s
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> 1.2MB/s
            </span>
          </div>
        </div>
      </div>

      {/* PIP Video */}
      <div
        ref={pipRef}
        className={cn(
          'absolute bg-card rounded-xl overflow-hidden border-2 shadow-lg cursor-move select-none',
          pipSize === 1 ? 'border-primary animate-pulse' : 'border-primary/50 hover:border-primary',
          'transition-[width,height] duration-200'
        )}
        style={{
          left: pipPosition.x,
          top: pipPosition.y,
          width: pipSizes[pipSize].width,
          height: pipSizes[pipSize].height,
          touchAction: 'none',
        }}
        onMouseDown={handlePipMouseDown}
        onTouchStart={handlePipMouseDown}
        onClick={handlePipTap}
        onTouchEnd={handlePipTap}
      >
        <div className="w-full h-full bg-secondary flex items-center justify-center relative">
          {isVideoOn ? (
            <span className="text-2xl font-bold">
              {isSwapped ? callerName.charAt(0).toUpperCase() : 'You'}
            </span>
          ) : (
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          )}
          {pipSize === 1 && (
            <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-primary font-medium">
              Tap again to swap
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div 
        className={cn(
          'absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4 transition-all duration-300',
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className={cn(
            'w-14 h-14 rounded-full transition-all',
            isMuted ? 'bg-destructive text-destructive-foreground' : 'bg-card border border-border hover:bg-secondary'
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onEnd(); }}
          className="w-16 h-16 rounded-full animate-bounce-subtle shadow-lg"
        >
          <Phone className="w-7 h-7 rotate-[135deg]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); }}
          className="w-14 h-14 rounded-full bg-card border border-border hover:bg-secondary"
        >
          <SwitchCamera className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); setIsVideoOn(!isVideoOn); }}
          className={cn(
            'w-14 h-14 rounded-full transition-all',
            !isVideoOn ? 'bg-destructive text-destructive-foreground' : 'bg-card border border-border hover:bg-secondary'
          )}
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoCallScreen;
