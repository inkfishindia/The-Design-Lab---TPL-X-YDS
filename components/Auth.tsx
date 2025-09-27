import React from 'react';
import type { GoogleUser } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';
import { Button } from './ui/Button';

interface AuthProps {
  user: GoogleUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Auth: React.FC<AuthProps> = ({ user, onSignIn, onSignOut }) => {
  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
        <span className="text-sm font-medium hidden sm:inline text-cream">{user.name}</span>
        <Button onClick={onSignOut} variant="secondary" size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onSignIn}
      disabled={isApiKeyMissing}
      title={isApiKeyMissing ? "Please configure your Gemini API Key in index.html to enable sign-in." : "Sign in with Google"}
      variant="primary"
      size="md"
      leftIcon={<GoogleIcon className="w-5 h-5" />}
    >
      Sign in
    </Button>
  );
};