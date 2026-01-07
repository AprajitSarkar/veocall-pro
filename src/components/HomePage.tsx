import React, { useState } from 'react';
import { Settings, Search, Phone, Video, Clock, User, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp, CallHistoryItem } from '@/contexts/AppContext';
import NetworkStatus from '@/components/ui/NetworkStatus';
import { cn } from '@/lib/utils';

interface HomePageProps {
  onSettings: () => void;
  onCall: (type: 'audio' | 'video', username: string) => void;
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  
  if (days === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (days === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const HomePage: React.FC<HomePageProps> = ({ onSettings, onCall }) => {
  const { user, onlineUsers, callHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = onlineUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = onlineUsers.filter(u => u.isOnline).length;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="p-6 pb-4 animate-slide-down">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Hello, <span className="text-gradient">{user?.username}</span>
            </h1>
            <p className="text-muted-foreground">Ready to connect?</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="w-12 h-12 rounded-xl bg-card border border-border hover:bg-secondary hover:border-primary transition-all"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="h-12 pl-12 bg-card border-border focus:border-primary"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-1 px-6">
        <Tabs defaultValue="online" className="animate-fade-in">
          <TabsList className="w-full h-12 bg-card border border-border p-1">
            <TabsTrigger
              value="online"
              className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Online ({onlineCount})
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="mt-4 space-y-3">
            {filteredUsers.filter(u => u.isOnline).map((contact, index) => (
              <UserCard
                key={contact.username}
                user={contact}
                onAudioCall={() => onCall('audio', contact.username)}
                onVideoCall={() => onCall('video', contact.username)}
                delay={index * 0.1}
              />
            ))}
            {filteredUsers.filter(u => u.isOnline).length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No online users found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-4 space-y-3">
            {callHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent calls</p>
              </div>
            ) : (
              callHistory.map((call, index) => (
                <RecentCallCard
                  key={call.id}
                  call={call}
                  onAudioCall={() => onCall('audio', call.username)}
                  onVideoCall={() => onCall('video', call.username)}
                  delay={index * 0.1}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Network Status */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
        <NetworkStatus />
      </div>
    </div>
  );
};

interface UserCardProps {
  user: { username: string; isOnline: boolean; lastSeen?: Date };
  onAudioCall: () => void;
  onVideoCall: () => void;
  delay?: number;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onAudioCall, 
  onVideoCall, 
  delay = 0
}) => {
  return (
    <div 
      className={cn(
        'flex items-center gap-4 p-4 bg-card rounded-xl border border-border',
        'hover:border-primary/50 transition-all duration-300',
        'animate-slide-up'
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xl font-semibold text-foreground">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-card" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{user.username}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          {user.isOnline ? (
            <span className="text-success">Online</span>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              Offline
            </>
          )}
        </p>
      </div>

      {/* Call Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAudioCall}
          className="w-11 h-11 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Phone className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideoCall}
          className="w-11 h-11 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-glow"
        >
          <Video className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

interface RecentCallCardProps {
  call: CallHistoryItem;
  onAudioCall: () => void;
  onVideoCall: () => void;
  delay?: number;
}

const RecentCallCard: React.FC<RecentCallCardProps> = ({ 
  call, 
  onAudioCall, 
  onVideoCall, 
  delay = 0 
}) => {
  const isMissed = call.status === 'missed';
  const isIncoming = call.direction === 'incoming';
  
  const getDirectionIcon = () => {
    if (isMissed) {
      return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }
    if (isIncoming) {
      return <PhoneIncoming className="w-4 h-4 text-success" />;
    }
    return <PhoneOutgoing className="w-4 h-4 text-primary" />;
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-4 p-4 bg-card rounded-xl border border-border',
        'hover:border-primary/50 transition-all duration-300',
        'animate-slide-up',
        isMissed && 'border-destructive/30'
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Avatar with direction indicator */}
      <div className="relative">
        <div className={cn(
          "w-14 h-14 rounded-full bg-secondary flex items-center justify-center",
          isMissed && "bg-destructive/20"
        )}>
          <span className={cn(
            "text-xl font-semibold",
            isMissed ? "text-destructive" : "text-foreground"
          )}>
            {call.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
          isMissed ? "bg-destructive/20" : "bg-card border border-border"
        )}>
          {call.type === 'video' ? (
            <Video className={cn("w-3 h-3", isMissed ? "text-destructive" : "text-primary")} />
          ) : (
            <Phone className={cn("w-3 h-3", isMissed ? "text-destructive" : "text-primary")} />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-semibold truncate",
            isMissed ? "text-destructive" : "text-foreground"
          )}>
            {call.username}
          </h3>
          {getDirectionIcon()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{isIncoming ? 'Incoming' : 'Outgoing'} {call.type}</span>
          {call.duration > 0 && (
            <>
              <span>•</span>
              <span>{formatDuration(call.duration)}</span>
            </>
          )}
          {isMissed && (
            <>
              <span>•</span>
              <span className="text-destructive">Missed</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimestamp(call.timestamp)}
        </p>
      </div>

      {/* Call Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAudioCall}
          className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideoCall}
          className="w-10 h-10 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-glow"
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
