import type { GmailMessage } from '../types';

const GMAIL_API_URL = 'https://www.googleapis.com/gmail/v1/users/me/messages';

interface GmailMessageList {
  messages: { id: string; threadId: string }[];
  resultSizeEstimate: number;
}

// Helper to decode Base64URL
const base64UrlDecode = (str: string) => {
    try {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        return atob(str);
    } catch (e) {
        console.error("Base64 decoding failed:", e);
        return "";
    }
};

// Helper to recursively find the correct body part
const findPart = (parts: any[], mimeType: string): any | null => {
    for (const part of parts) {
        if (part.mimeType === mimeType) {
            return part;
        }
        if (part.parts) {
            const found = findPart(part.parts, mimeType);
            if (found) return found;
        }
    }
    return null;
};


export const getInboxStats = async (accessToken: string): Promise<{ unreadCount: number; oldMailCount: number; }> => {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
  };

  try {
    const unreadQuery = 'is:unread in:inbox';
    const oldMailQuery = 'in:inbox older_than:2d';

    const unreadPromise = fetch(`${GMAIL_API_URL}?q=${encodeURIComponent(unreadQuery)}&maxResults=1`, { headers })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `Gmail API error: ${res.statusText}`);
        return data as GmailMessageList;
      });
      
    const oldMailPromise = fetch(`${GMAIL_API_URL}?q=${encodeURIComponent(oldMailQuery)}&maxResults=1`, { headers })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `Gmail API error: ${res.statusText}`);
        return data as GmailMessageList;
      });

    const [unreadResponse, oldMailResponse] = await Promise.all([unreadPromise, oldMailPromise]);
    
    return {
      unreadCount: unreadResponse.resultSizeEstimate || 0,
      oldMailCount: oldMailResponse.resultSizeEstimate || 0,
    };
  } catch (error) {
    console.error("Error fetching Gmail stats:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching mail stats.";
    throw new Error(errorMessage);
  }
};


export const getRecentEmails = async (accessToken: string): Promise<GmailMessage[]> => {
  const headers = { 'Authorization': `Bearer ${accessToken}` };

  const listResponse = await fetch(`${GMAIL_API_URL}?maxResults=5&q=in:inbox`, { headers });
  const listData = await listResponse.json();

  if (!listResponse.ok) {
    throw new Error(listData.error?.message || 'Failed to fetch Gmail message list.');
  }

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const messagePromises = listData.messages.map((message: { id: string }) =>
    fetch(`${GMAIL_API_URL}/${message.id}`, { headers })
      .then(res => res.json())
  );

  const messageResults = await Promise.all(messagePromises);

  return messageResults.map(msg => {
    if (!msg.payload || !msg.payload.headers) {
      return { id: msg.id, threadId: msg.threadId, snippet: msg.snippet, subject: '(No subject)', from: '(Unknown sender)', date: '', labelIds: [] };
    }
    const getHeader = (name: string) => msg.payload.headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    
    const fromHeader = getHeader('From');
    const fromMatch = fromHeader.match(/(.*)<.*>/);
    let fromName = fromHeader;
    if (fromMatch && fromMatch[1]) {
      fromName = fromMatch[1].trim().replace(/"/g, '');
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      snippet: msg.snippet,
      subject: getHeader('Subject'),
      from: fromName,
      date: getHeader('Date'),
      labelIds: msg.labelIds || [],
    };
  });
};

export const getEmail = async (messageId: string, accessToken: string): Promise<GmailMessage> => {
  const headers = { 'Authorization': `Bearer ${accessToken}` };
  const response = await fetch(`${GMAIL_API_URL}/${messageId}?format=full`, { headers });
  const msg = await response.json();

  if (!response.ok) {
    throw new Error(msg.error?.message || 'Failed to fetch email content.');
  }

  const getHeader = (name: string) => msg.payload.headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  const fromHeader = getHeader('From');
  const fromMatch = fromHeader.match(/(.*)<.*>/);
  let fromName = fromHeader;
  if (fromMatch && fromMatch[1]) {
    fromName = fromMatch[1].trim().replace(/"/g, '');
  }

  let bodyHtml = '';
  let bodyText = '';
  
  const payload = msg.payload;
  if (payload.parts) {
    // Multipart email, look for html and text parts
    const htmlPart = findPart(payload.parts, 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      bodyHtml = base64UrlDecode(htmlPart.body.data);
    }
    const textPart = findPart(payload.parts, 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      bodyText = base64UrlDecode(textPart.body.data);
    }
  } else if (payload.body && payload.body.data) {
    // Single part email
    if (payload.mimeType === 'text/html') {
      bodyHtml = base64UrlDecode(payload.body.data);
    } else if (payload.mimeType === 'text/plain') {
      bodyText = base64UrlDecode(payload.body.data);
    }
  }
  
  if (!bodyHtml && bodyText) {
      bodyHtml = `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: sans-serif; font-size: 14px; color: #0A192F;">${bodyText}</pre>`;
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet,
    subject: getHeader('Subject'),
    from: fromName,
    date: getHeader('Date'),
    labelIds: msg.labelIds || [],
    bodyHtml,
    bodyText,
  };
};

export const searchEmails = async (accessToken: string, query: string): Promise<GmailMessage[]> => {
  const headers = { 'Authorization': `Bearer ${accessToken}` };

  const listResponse = await fetch(`${GMAIL_API_URL}?maxResults=5&q=${encodeURIComponent(query)}`, { headers });
  const listData = await listResponse.json();

  if (!listResponse.ok) {
    throw new Error(listData.error?.message || 'Failed to search Gmail messages.');
  }

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const messagePromises = listData.messages.map((message: { id: string }) =>
    fetch(`${GMAIL_API_URL}/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, { headers })
      .then(res => res.json())
  );

  const messageResults = await Promise.all(messagePromises);

  return messageResults.map(msg => {
    if (!msg.payload || !msg.payload.headers) {
      return { id: msg.id, threadId: msg.threadId, snippet: msg.snippet, subject: '(No subject)', from: '(Unknown sender)', date: '' };
    }
    const getHeader = (name: string) => msg.payload.headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    
    const fromHeader = getHeader('From');
    const fromMatch = fromHeader.match(/(.*)<.*>/);
    let fromName = fromHeader;
    if (fromMatch && fromMatch[1]) {
      fromName = fromMatch[1].trim().replace(/"/g, '');
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      snippet: msg.snippet,
      subject: getHeader('Subject'),
      from: fromName,
      date: getHeader('Date'),
    };
  });
};