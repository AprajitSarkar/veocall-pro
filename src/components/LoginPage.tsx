import React, { useState } from 'react';
import { Video, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameBlur = () => {
    // Simulate checking if username exists and requires password
    if (username.length >= 3) {
      // For demo, usernames starting with 'p' require password
      setRequiresPassword(username.toLowerCase().startsWith('p'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (requiresPassword && !password) {
      setError('Password is required for this account');
      return;
    }

    login(username, password);
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative animate-bounce-subtle">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Video className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-primary/20 animate-pulse-glow -z-10" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gradient">VeoCall</h1>
          <p className="mt-2 text-muted-foreground">Professional Video Calling</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg animate-slide-up">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleUsernameBlur}
                  placeholder="Enter your username"
                  className="h-12 bg-secondary border-border focus:border-primary focus:ring-primary"
                />
              </div>

              {requiresPassword && (
                <div className="space-y-2 animate-slide-down">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 bg-secondary border-border focus:border-primary focus:ring-primary pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className={cn(
              'w-full h-14 text-lg font-semibold gradient-primary',
              'hover:opacity-90 transition-all duration-300',
              'shadow-glow hover:shadow-lg',
              'animate-bounce-subtle'
            )}
          >
            <span>Join VeoCall</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By joining, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
