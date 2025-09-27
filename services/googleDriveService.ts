

const DRIVE_API_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_API_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * Creates a new Google Doc in the user's Google Drive.
 * @param title The title of the document.
 * @param content The text content of the document.
 * @param accessToken The user's Google OAuth2 access token.
 * @returns The file metadata object from the Google Drive API.
 */
export const createDoc = async (title: string, content: string, accessToken: string) => {
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document',
  };

  const boundary = '----BOUNDARY----';
  const multipartRequestBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const response = await fetch(DRIVE_API_UPLOAD_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to create Google Doc.');
  }

  return await response.json();
};

/**
 * Searches for files in the user's Google Drive.
 * @param query The search query string (e.g., "name contains 'report'").
 * @param accessToken The user's Google OAuth2 access token.
 * @returns A list of file objects from the Google Drive API.
 */
export const searchFiles = async (query: string, accessToken: string) => {
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,webViewLink)',
    pageSize: '10',
  });

  const response = await fetch(`${DRIVE_API_FILES_URL}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to search for files in Google Drive.');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Reads the text content of a specific file from Google Drive.
 * It can export Google Docs as plain text or read plain text files directly.
 * @param fileId The ID of the file to read.
 * @param mimeType The MIME type of the file.
 * @param accessToken The user's Google OAuth2 access token.
 * @returns The text content of the file.
 */
export const getFileContent = async (fileId: string, mimeType: string, accessToken: string): Promise<string> => {
  let url = `${DRIVE_API_FILES_URL}/${fileId}`;
  let isGoogleDoc = false;

  if (mimeType === 'application/vnd.google-apps.document') {
      url += '/export?mimeType=text/plain';
      isGoogleDoc = true;
  } else {
      url += '?alt=media';
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to read file content from Google Drive.');
  }
  
  // Google Docs export as text, other files are read directly
  return await response.text();
};