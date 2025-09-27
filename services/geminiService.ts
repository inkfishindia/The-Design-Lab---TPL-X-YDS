import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createCalendarEventFunction: FunctionDeclaration = {
    name: "createCalendarEvent",
    description: "Creates a new event on the user's Google Calendar. The user must be authenticated.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: "The title or summary of the event.",
            },
            startDateTime: {
                type: Type.STRING,
                description: "The start date and time of the event in ISO 8601 format (e.g., '2024-08-15T10:00:00-07:00').",
            },
            endDateTime: {
                type: Type.STRING,
                description: "The end date and time of the event in ISO 8601 format (e.g., '2024-08-15T11:00:00-07:00').",
            },
            location: {
                type: Type.STRING,
                description: "The location of the event.",
            },
            description: {
                type: Type.STRING,
                description: "A more detailed description of the event."
            }
        },
        required: ["summary", "startDateTime", "endDateTime"],
    }
};

const getCalendarEventsFunction: FunctionDeclaration = {
    name: "getCalendarEvents",
    description: "Gets a list of events from the user's primary Google Calendar for a given date range.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            timeMin: {
                type: Type.STRING,
                description: "The start of the date range in ISO 8601 format. Defaults to the beginning of the current day if not provided.",
            },
            timeMax: {
                type: Type.STRING,
                description: "The end of the date range in ISO 8601 format. Defaults to the end of the current day if not provided.",
            },
        },
        required: [],
    }
};

const getTasksFunction: FunctionDeclaration = {
    name: "getTasks",
    description: "Gets the user's list of tasks from their primary task list.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

const getDailyBriefingFunction: FunctionDeclaration = {
    name: "getDailyBriefing",
    description: "Gets a summary of the user's day, including calendar events, tasks, and important unread emails. Use this when the user asks for a general overview like 'summarize my day' or 'what's on my plate?'.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

const searchEmailsFunction: FunctionDeclaration = {
    name: "searchEmails",
    description: "Searches the user's Gmail for emails matching a specific query.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "The search query, following Gmail's search syntax (e.g., 'from:someone@example.com', 'subject:report', 'is:unread').",
            },
        },
        required: ["query"],
    }
};

const searchDriveFilesFunction: FunctionDeclaration = {
    name: "searchDriveFiles",
    description: "Searches the user's Google Drive for files matching a query.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "The search query, following Google Drive's search syntax (e.g., 'name contains \"Q3 Report\"', 'mimeType=\"application/vnd.google-apps.spreadsheet\"').",
            },
        },
        required: ["query"],
    }
};

const readFileContentFunction: FunctionDeclaration = {
    name: "readFileContent",
    description: "Reads the text content of a specific file from Google Drive using its file ID and MIME type. Use this after finding a file with 'searchDriveFiles' to answer questions about its content.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileId: {
                type: Type.STRING,
                description: "The ID of the file to read."
            },
            mimeType: {
                type: Type.STRING,
                description: "The MIME type of the file, used to determine how to read it."
            }
        },
        required: ["fileId", "mimeType"],
    }
};

const readSheetDataFunction: FunctionDeclaration = {
    name: "readSheetData",
    description: "Reads data from a specific range in a Google Sheet.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            spreadsheetId: {
                type: Type.STRING,
                description: "The ID of the Google Sheet. This can be found in the sheet's URL.",
            },
            range: {
                type: Type.STRING,
                description: "The range to read in A1 notation (e.g., 'Sheet1!A1:C10').",
            },
        },
        required: ["spreadsheetId", "range"],
    }
};


export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful and friendly personal assistant. Your functions are to help the user manage their schedule and access their information across Google services.
- If the user asks for a summary of their day, a briefing, or what they need to focus on, use the 'getDailyBriefing' function to get a comprehensive overview of their calendar, tasks, and important emails, which you can then synthesize into a helpful response.
- You can read the user's calendar events and tasks to answer specific questions about their schedule. Use 'getCalendarEvents' for calendar questions and 'getTasks' for to-do list questions.
- You can create new events on their Google Calendar using the 'createCalendarEvent' tool.
- You can search the user's emails using the 'searchEmails' tool.
- To answer questions about a document, you must follow a two-step process:
  1. First, use 'searchDriveFiles' to locate the document and get its file ID and MIME type.
  2. Then, use the 'readFileContent' tool with the file ID and MIME type to read its contents and provide a summary or answer.
- You can read data from a Google Sheet using the 'readSheetData' tool.
- If a user asks to read a sheet but doesn't provide an ID or range, ask for them. The ID is in the URL of the sheet.
- If a file search returns multiple results, list them for the user so they can clarify which one to read.
- Always infer the current date and time if the user provides relative times like "today", "tomorrow", or "next week". Assume the current year is ${new Date().getFullYear()}.
- Before calling 'createCalendarEvent', confirm with the user.
- If the user is not authenticated, you MUST ask them to sign in first before attempting to use any tools.`,
            tools: [{ functionDeclarations: [
                createCalendarEventFunction, 
                getCalendarEventsFunction, 
                getTasksFunction,
                getDailyBriefingFunction,
                searchEmailsFunction,
                searchDriveFilesFunction,
                readFileContentFunction,
                readSheetDataFunction
            ] }]
        },
    });
};