import type { GoogleUser, TokenResponse } from '../types';

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt: string }) => void;
  callback?: (tokenResponse: TokenResponse) => void;
}

// More specific typing for the Google Identity Services client
declare global {
  const google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (tokenResponse: TokenResponse) => void;
        }) => GoogleTokenClient;
        revoke: (token: string, done: () => void) => void;
      };
    };
  };
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable not set");
}
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly';

let tokenClient: GoogleTokenClient | null = null;

export const initGoogleAuth = () => {
  // The callback is handled by the promise in signIn, so we provide a no-op function here.
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {},
  });
};

export const signIn = (callback: (token: TokenResponse, profile: GoogleUser) => void) => {
  if (!tokenClient) {
    console.error("Google Auth client not initialized.");
    return;
  }
  
  tokenClient.callback = async (tokenResponse: TokenResponse) => {
    if (tokenResponse && tokenResponse.access_token) {
        try {
            // Fetch user profile
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.statusText}`);
            }
            const profile = await response.json();
            const user: GoogleUser = {
                name: profile.name,
                email: profile.email,
                picture: profile.picture
            }
            callback(tokenResponse, user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }
  };

  // Using 'consent' forces the consent screen to ensure all scopes are requested.
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const signOut = (accessToken: string) => {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Access token revoked.');
    });
  }
};