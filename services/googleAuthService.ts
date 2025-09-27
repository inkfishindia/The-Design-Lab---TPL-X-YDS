import type { GoogleUser, TokenResponse } from '../types';

// FIX: Declare the 'google' object from the Google Identity Services script to make it available in the TypeScript scope.
declare const google: any;

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable not set");
}
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly';

// FIX: Changed google.accounts.oauth2.TokenClient to `any` to resolve the "Cannot find namespace 'google'" error.
let tokenClient: any | null = null;

export const initGoogleAuth = () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // The callback is handled by the promise in signIn
  });
};

export const signIn = (callback: (token: TokenResponse, profile: GoogleUser) => void) => {
  if (!tokenClient) {
    console.error("Google Auth client not initialized.");
    return;
  }
  
  tokenClient.callback = async (tokenResponse: TokenResponse) => {
    if (tokenResponse && tokenResponse.access_token) {
        // Fetch user profile
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.access_token}`
            }
        });
        const profile = await response.json();
        const user: GoogleUser = {
            name: profile.name,
            email: profile.email,
            picture: profile.picture
        }
        callback(tokenResponse, user);
    }
  };

  // Prompt the user to select an account and grant access
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const signOut = (accessToken: string) => {
  // Revoke the token to effectively sign out
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Access token revoked.');
    });
  }
};