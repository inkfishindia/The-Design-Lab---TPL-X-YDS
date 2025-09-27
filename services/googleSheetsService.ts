import type { GoogleUser, DelegationBriefForSheet } from '../types';

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
// The user-provided spreadsheet
const SPREADSHEET_ID = '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw';
const LOG_SHEET_NAME = 'BrainDump';
const LOGIN_SHEET_NAME = 'Login';
const TEAM_ACTIVITY_SHEET_NAME = 'Team Activity Log';

/**
 * Appends a brain dump entry to a Google Sheet.
 * @param content The brain dump text.
 * @param user The authenticated Google user.
 * @param accessToken The user's Google OAuth2 access token.
 * @param priority The AI-determined priority ('High', 'Medium', 'Low').
 */
export const logBrainDump = async (
  content: string, 
  user: GoogleUser | null, 
  accessToken: string, 
  priority: string
): Promise<void> => {
  if (!user) {
    console.warn('Cannot log brain dump without an authenticated user.');
    return;
  }
  
  const timestamp = new Date().toISOString();
  const values = [
    [
      timestamp,       // Timestamp
      'Brain Dump',    // Type
      content,         // Content
      user.email,      // UserEmail
      priority         // Priority
    ]
  ];

  const body = {
    values,
  };
  
  const response = await fetch(
    `${SHEETS_API_URL}/${SPREADSHEET_ID}/values/${LOG_SHEET_NAME}:append?valueInputOption=USER_ENTERED`, 
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to append data to Google Sheet.');
  }
};

/**
 * Appends a delegated task to a Google Sheet.
 * @param brief The delegation brief containing task details.
 * @param user The authenticated Google user who is delegating.
 * @param accessToken The user's Google OAuth2 access token.
 */
export const logDelegation = async (
  brief: DelegationBriefForSheet,
  user: GoogleUser,
  accessToken: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const values = [
    [
      timestamp,                // Timestamp
      'Delegation',             // Type
      brief.task,               // Content/Task
      user.email,               // UserEmail (Delegated By)
      user.name,                // UserName (Delegated By)
      '',                       // Priority (N/A)
      brief.assignedTo,         // Assigned To
      brief.context,            // Context
      brief.successCriteria,    // Success Criteria
      'Delegated',              // Status
    ]
  ];

  const body = { values };
  
  const response = await fetch(
    `${SHEETS_API_URL}/${SPREADSHEET_ID}/values/${LOGIN_SHEET_NAME}:append?valueInputOption=USER_ENTERED`, 
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to append delegation data to Google Sheet.');
  }
};

/**
 * Appends a user sign-in event to a Google Sheet.
 * @param user The authenticated Google user who signed in.
 * @param accessToken The user's Google OAuth2 access token.
 */
export const logUserSignIn = async (
  user: GoogleUser,
  accessToken: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const values = [
    [
      timestamp,          // Timestamp
      'User Sign-In',     // Type
      'User logged in',   // Content/Task
      user.email,         // UserEmail
      user.name,          // UserName
      '',                 // Priority
      '',                 // Assigned To
      '',                 // Context
      '',                 // Success Criteria
      'Completed',        // Status
    ]
  ];

  const body = { values };

  const response = await fetch(
    `${SHEETS_API_URL}/${SPREADSHEET_ID}/values/${LOGIN_SHEET_NAME}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to append sign-in data to Google Sheet.');
  }
};

/**
 * Fetches data from the Team Activity Log sheet.
 * @param accessToken The user's Google OAuth2 access token.
 */
export const getTeamActivityLog = async (accessToken: string): Promise<string[][]> => {
  const range = `${TEAM_ACTIVITY_SHEET_NAME}!A:J`; // Read up to 10 columns for full context
  const response = await fetch(
    `${SHEETS_API_URL}/${SPREADSHEET_ID}/values/${range}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to fetch sheet data.');
  }

  const data = await response.json();
  return data.values || []; // `values` can be undefined if sheet is empty
};

/**
 * Reads data from a specific range in a Google Sheet.
 * @param spreadsheetId The ID of the Google Sheet.
 * @param range The A1 notation of the range to read.
 * @param accessToken The user's Google OAuth2 access token.
 */
export const readSheetData = async (spreadsheetId: string, range: string, accessToken: string): Promise<string[][]> => {
    const url = `${SHEETS_API_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to read data from Google Sheet.');
    }

    const data = await response.json();
    return data.values || [];
};