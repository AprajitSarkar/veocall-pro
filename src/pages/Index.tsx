import React, { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import LoginPage from '@/components/LoginPage';
import HomePage from '@/components/HomePage';
import SettingsPage from '@/components/SettingsPage';
import VideoCallScreen from '@/components/VideoCallScreen';
import AudioCallScreen from '@/components/AudioCallScreen';
import IncomingCallScreen from '@/components/IncomingCallScreen';

type Screen = 'login' | 'home' | 'settings' | 'video-call' | 'audio-call' | 'incoming';

interface CallState {
  type: 'audio' | 'video';
  username: string;
}

const AppContent: React.FC = () => {
  const { isLoggedIn, addCallToHistory } = useApp();
  const [screen, setScreen] = useState<Screen>(isLoggedIn ? 'home' : 'login');
  const [callState, setCallState] = useState<CallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallState | null>(null);
  const [callStartTime, setCallStartTime] = useState<number>(0);

  // Simulate incoming call after 10 seconds on home screen
  React.useEffect(() => {
    if (screen === 'home') {
      const timeout = setTimeout(() => {
        setIncomingCall({ type: 'video', username: 'Jordan' });
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [screen]);

  const handleLogin = () => {
    setScreen('home');
  };

  const handleCall = (type: 'audio' | 'video', username: string) => {
    setCallState({ type, username });
    setCallStartTime(Date.now());
    setScreen(type === 'video' ? 'video-call' : 'audio-call');
  };

  const handleEndCall = () => {
    if (callState) {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      addCallToHistory({
        username: callState.username,
        type: callState.type,
        direction: 'outgoing',
        status: duration > 0 ? 'received' : 'missed',
        duration,
      });
    }
    setCallState(null);
    setCallStartTime(0);
    setScreen('home');
  };

  const handleAcceptIncoming = () => {
    if (incomingCall) {
      setCallState(incomingCall);
      setCallStartTime(Date.now());
      setIncomingCall(null);
      setScreen(incomingCall.type === 'video' ? 'video-call' : 'audio-call');
    }
  };

  const handleRejectIncoming = () => {
    if (incomingCall) {
      addCallToHistory({
        username: incomingCall.username,
        type: incomingCall.type,
        direction: 'incoming',
        status: 'declined',
        duration: 0,
      });
    }
    setIncomingCall(null);
  };

  // Show incoming call overlay
  if (incomingCall && screen !== 'video-call' && screen !== 'audio-call') {
    return (
      <>
        {screen === 'home' && <HomePage onSettings={() => setScreen('settings')} onCall={handleCall} />}
        {screen === 'settings' && <SettingsPage onBack={() => setScreen('home')} />}
        <IncomingCallScreen
          callerName={incomingCall.username}
          callType={incomingCall.type}
          onAccept={handleAcceptIncoming}
          onReject={handleRejectIncoming}
        />
      </>
    );
  }

  switch (screen) {
    case 'login':
      return <LoginPage onLogin={handleLogin} />;
    case 'home':
      return <HomePage onSettings={() => setScreen('settings')} onCall={handleCall} />;
    case 'settings':
      return <SettingsPage onBack={() => setScreen('home')} />;
    case 'video-call':
      return callState ? (
        <VideoCallScreen callerName={callState.username} onEnd={handleEndCall} />
      ) : null;
    case 'audio-call':
      return callState ? (
        <AudioCallScreen callerName={callState.username} onEnd={handleEndCall} />
      ) : null;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
};

// Main entry component with AppProvider wrapper
const Index: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default Index;
