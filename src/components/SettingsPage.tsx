import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Video, 
  Mic, 
  Zap, 
  Eye, 
  Users, 
  Mail,
  Save,
  Trash2,
  Check,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import NetworkStatus from '@/components/ui/NetworkStatus';
import { cn } from '@/lib/utils';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, updateUser, setPassword, removePassword } = useApp();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveUsername = () => {
    if (username.length >= 3) {
      updateUser({ username });
      showSavedMessage();
    }
  };

  const handleSaveEmail = () => {
    if (email) {
      updateUser({ email });
      showSavedMessage();
    }
  };

  const handleSetPassword = () => {
    if (newPassword.length >= 4) {
      setPassword(newPassword);
      setNewPassword('');
      showSavedMessage();
    }
  };

  const handleRemovePassword = () => {
    removePassword();
    showSavedMessage();
  };

  const showSavedMessage = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const updateUISettings = (key: string, value: string) => {
    if (user?.uiSettings) {
      updateUser({
        uiSettings: {
          ...user.uiSettings,
          [key]: value,
        },
      });
      showSavedMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border p-4 animate-slide-down">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-secondary active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
          {showSaved && (
            <div className="ml-auto flex items-center gap-2 text-success animate-fade-in">
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Profile Section */}
        <SettingsSection title="Profile" icon={User}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-secondary border-border rounded-xl"
                />
                <Button onClick={handleSaveUsername} className="rounded-xl">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (Gmail)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@gmail.com"
                  className="flex-1 bg-secondary border-border rounded-xl"
                />
                <Button onClick={handleSaveEmail} className="rounded-xl">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection title="Security" icon={Lock}>
          <div className="space-y-4">
            {user?.hasPassword ? (
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div>
                  <p className="font-medium">Password Protected</p>
                  <p className="text-sm text-muted-foreground">Your account is secured</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleRemovePassword}
                  className="gap-2 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Set Password</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="flex-1 bg-secondary border-border rounded-xl"
                  />
                  <Button onClick={handleSetPassword} className="rounded-xl">
                    <Lock className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* UI Customization */}
        <SettingsSection title="UI Customization" icon={Palette}>
          <div className="space-y-4">
            <SettingsSelect
              label="Button Style"
              value={user?.uiSettings?.buttonStyle || 'filled'}
              onChange={(v) => updateUISettings('buttonStyle', v)}
              options={[
                { value: 'filled', label: 'Filled' },
                { value: 'tonal', label: 'Tonal' },
                { value: 'outlined', label: 'Outlined' },
                { value: 'elevated', label: 'Elevated' },
              ]}
            />
            <SettingsSelect
              label="Button Corners"
              value={user?.uiSettings?.buttonRadius || 'rounded'}
              onChange={(v) => updateUISettings('buttonRadius', v)}
              options={[
                { value: 'square', label: 'Square' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'pill', label: 'Pill' },
              ]}
            />
            <SettingsSelect
              label="Accent Color"
              value={user?.uiSettings?.accentColor || 'cyan'}
              onChange={(v) => updateUISettings('accentColor', v)}
              options={[
                { value: 'cyan', label: 'Cyan' },
                { value: 'blue', label: 'Blue' },
                { value: 'purple', label: 'Purple' },
                { value: 'green', label: 'Green' },
                { value: 'orange', label: 'Orange' },
              ]}
            />
            
            {/* Button Preview */}
            <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-xl">Filled</Button>
                <Button size="sm" variant="tonal" className="rounded-xl">Tonal</Button>
                <Button size="sm" variant="outline" className="rounded-xl">Outlined</Button>
                <Button size="sm" variant="elevated" className="rounded-xl">Elevated</Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Video Quality */}
        <SettingsSection title="Video Quality" icon={Video}>
          <div className="space-y-4">
            <SettingsSelect
              label="Resolution"
              value={user?.videoQuality || 'auto'}
              onChange={(v) => updateUser({ videoQuality: v as any })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: '4k', label: '4K (2160p)' },
                { value: '1080p', label: '1080p HD' },
                { value: '720p', label: '720p' },
                { value: '480p', label: '480p' },
              ]}
            />
            <SettingsSelect
              label="Frame Rate"
              value={user?.frameRate || 'auto'}
              onChange={(v) => updateUser({ frameRate: v as any })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: '60', label: '60 fps' },
                { value: '30', label: '30 fps' },
                { value: '24', label: '24 fps' },
              ]}
            />
          </div>
        </SettingsSection>

        {/* Audio Quality */}
        <SettingsSection title="Audio Quality" icon={Mic}>
          <SettingsSelect
            label="Quality"
            value={user?.audioQuality || 'high'}
            onChange={(v) => updateUser({ audioQuality: v as any })}
            options={[
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </SettingsSection>

        {/* Data & Display */}
        <SettingsSection title="Data & Display" icon={Zap}>
          <div className="space-y-4">
            <SettingsToggle
              label="Data Saving Mode"
              description="Reduce bandwidth usage"
              checked={user?.dataSaving || false}
              onChange={(v) => updateUser({ dataSaving: v })}
            />
            <SettingsToggle
              label="Show Username"
              description="Display name during calls"
              checked={user?.showUsername ?? true}
              onChange={(v) => updateUser({ showUsername: v })}
            />
          </div>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy" icon={Eye}>
          <div className="space-y-4">
            <SettingsSelect
              label="Audio Calls"
              value={user?.audioPrivacy || 'everyone'}
              onChange={(v) => updateUser({ audioPrivacy: v as any })}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'recent', label: 'Recent Contacts' },
                { value: 'selected', label: 'Selected Users' },
              ]}
            />
            <SettingsSelect
              label="Video Calls"
              value={user?.videoPrivacy || 'everyone'}
              onChange={(v) => updateUser({ videoPrivacy: v as any })}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'recent', label: 'Recent Contacts' },
                { value: 'selected', label: 'Selected Users' },
              ]}
            />
          </div>
        </SettingsSection>

        {/* Allowed Users */}
        <SettingsSection title="Allowed Users" icon={Users}>
          <div className="p-4 bg-secondary rounded-xl text-center text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users selected</p>
            <Button variant="outline" size="sm" className="mt-3 rounded-xl">
              Add Users
            </Button>
          </div>
        </SettingsSection>
      </div>

      {/* Bottom Network Status */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
        <NetworkStatus />
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up">
    <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/30">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="font-semibold">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

interface SettingsSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SettingsSelect: React.FC<SettingsSelectProps> = ({ label, value, onChange, options }) => (
  <div className="flex items-center justify-between">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36 bg-secondary border-border rounded-xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default SettingsPage;
