import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";
import type { ProcessedTableData, ChatMessage } from '../types';

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

const searchNotionPagesFunction: FunctionDeclaration = {
    name: "searchNotionPages",
    description: "Searches the user's connected Notion workspace for pages matching a query.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "The text to search for in Notion page titles and content.",
            },
        },
        required: ["query"],
    }
};

const readNotionPageContentFunction: FunctionDeclaration = {
    name: "readNotionPageContent",
    description: "Reads the content of a specific Notion page using its page ID. Use this after finding a page with 'searchNotionPages' to answer questions about its content.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            pageId: {
                type: Type.STRING,
                description: "The ID of the Notion page to read."
            }
        },
        required: ["pageId"],
    }
};

const readNotionDatabaseFunction: FunctionDeclaration = {
    name: "readNotionDatabase",
    description: "Reads and displays a Notion database as a table. Use this after finding a database with 'searchNotionPages'.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            databaseId: {
                type: Type.STRING,
                description: "The ID of the Notion database to read."
            }
        },
        required: ["databaseId"],
    }
};

const createTableFunction: FunctionDeclaration = {
    name: "createTable",
    description: "Creates a table with a title, specified headers, and rows of data. The user can then save this table to Google Drive.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "The title for the table, which will be used as the filename if saved."
            },
            headers: {
                type: Type.ARRAY,
                description: "An array of strings for the table column headers.",
                items: { type: Type.STRING }
            },
            rows: {
                type: Type.ARRAY,
                description: "An array of arrays, where each inner array represents a row of cells as strings.",
                items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        },
        required: ["title", "headers", "rows"],
    }
};

const personalityInstructions = {
    default: `You are a helpful and friendly personal assistant. Your functions are to help the user manage their schedule and access their information across Google services and Notion.
- You can also create tables for the user when they ask for information to be structured in a tabular format. Use the 'createTable' function for this. The user will be given an option to save the generated table to their Google Drive.
- Your connection to Notion is already configured. You can use Notion tools without asking the user to connect.
- If the user asks for a summary of their day, a briefing, or what they need to focus on, use the 'getDailyBriefing' function to get a comprehensive overview of their calendar, tasks, and important emails, which you can then synthesize into a helpful response.
- You can read the user's calendar events and tasks to answer specific questions about their schedule. Use 'getCalendarEvents' for calendar questions and 'getTasks' for to-do list questions.
- You can create new events on their Google Calendar using the 'createCalendarEvent' tool.
- You can search the user's emails using the 'searchEmails' tool.
- To answer questions about a document in Google Drive, you must follow a two-step process:
  1. First, use 'searchDriveFiles' to locate the document and get its file ID and MIME type.
  2. Then, use the 'readFileContent' tool with the file ID and MIME type to read its contents and provide a summary or answer.
- To answer questions about a Notion page, you must follow a two-step process:
  1. First, use 'searchNotionPages' to locate the page and get its ID.
  2. Then, use the 'readNotionPageContent' tool with the page ID to read its contents and provide a summary or answer.
- To read a Notion database or table, you must follow a two-step process:
  1. First, use 'searchNotionPages' to locate the database and get its ID. Note that the search result will indicate if it's a 'database' or a 'page'.
  2. Then, use the 'readNotionDatabase' tool with the database ID to read its contents and display it to the user as a table.
- If a file or page search returns multiple results, list them for the user so they can clarify which one to read.
- Always infer the current date and time if the user provides relative times like "today", "tomorrow", or "next week". Assume the current year is ${new Date().getFullYear()}.
- Before calling 'createCalendarEvent', confirm with the user.
- For Google services, if the user is not authenticated, you MUST ask them to sign in first before attempting to use any tools related to it.`,
    concise: `You are a direct and concise personal assistant. Provide answers and execute functions with minimal conversational fluff. Prioritize accuracy and brevity.
- You have access to tools for Google services (Calendar, Tasks, Drive, Mail) and Notion. Use them without asking for permission, but inform the user of the actions you're taking.
- If the user is not authenticated for Google services, state that sign-in is required for the requested action.
- When a search returns multiple results, list them succinctly.`,
    creative: `You are a creative and proactive brainstorming partner. While you perform assistant tasks, your primary goal is to help the user explore ideas and think outside the box.
- When answering questions or summarizing information, look for opportunities to suggest related ideas, next steps, or creative applications of the information.
- You have access to the user's Google and Notion data. Use this context to make your suggestions more relevant and insightful.
- When asked to perform a simple task like creating an event, you might ask a follow-up question to enhance it, e.g., "Great, I've scheduled that. Would you like me to find and attach a relevant document from your Drive to the event description?"`,
    socratic: `You are a Socratic coaching assistant. Your purpose is to help the user clarify their thinking by asking insightful questions. Instead of just giving the answer, guide the user to their own conclusions.
- When the user asks a question, respond with a question that helps them break down the problem. For example, if they ask "Summarize my day," you could reply, "To give you the most useful summary, what is your main priority for today?"
- When using tools, frame the results as a starting point for discussion. "I see you have 3 meetings and 5 tasks. Which of these feels like the biggest lever for your goals today?"
- You must still execute function calls when it's the only logical next step (like creating a calendar event after all details are confirmed).`
};

export const createChatSession = (history?: ChatMessage[]): Chat => {
    let systemInstruction = personalityInstructions.default;
    try {
        const savedPersonality = localStorage.getItem('aiPersonality');
        if (savedPersonality) {
            const personalityKey = JSON.parse(savedPersonality) as keyof typeof personalityInstructions;
            if (personalityInstructions[personalityKey]) {
                systemInstruction = personalityInstructions[personalityKey];
            }
        }
    } catch (e) {
        console.error("Could not parse AI personality from localStorage", e);
    }
    
    // Convert our ChatMessage[] history to the format the SDK expects.
    // The SDK's history is just the text content, so we extract that.
    const historyForSDK = history?.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({
            text: part.text || (part.table ? `[User displayed table: ${part.title || 'Untitled'}]` : '')
        }))
    }));

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyForSDK,
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [
                createCalendarEventFunction, 
                getCalendarEventsFunction, 
                getTasksFunction,
                getDailyBriefingFunction,
                searchEmailsFunction,
                searchDriveFilesFunction,
                readFileContentFunction,
                searchNotionPagesFunction,
                readNotionPageContentFunction,
                readNotionDatabaseFunction,
                createTableFunction,
            ] }]
        },
    });
};

export const generateChatTitleAndIcon = async (firstMessage: string): Promise<{title: string, icon: string}> => {
    const categories = ['chat', 'planning', 'writing', 'analysis', 'code', 'design'];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following user message. Based on its content, generate a very short, concise title (3-5 words max). Then, classify the message into one of the following categories: ${categories.join(', ')}.
            
            User Message: "${firstMessage}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A short, concise title for the chat session (3-5 words max)." },
                        category: {
                            type: Type.STRING,
                            description: `The most relevant category from the provided list: ${categories.join(', ')}.`
                        }
                    },
                    required: ["title", "category"]
                }
            }
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        
        const icon = categories.includes(result.category) ? result.category : 'chat';
        
        return { title: result.title, icon };
    } catch (e) {
        console.error("Failed to generate title and icon:", e);
        // Fallback for safety
        const fallbackTitle = firstMessage.length > 30 ? firstMessage.substring(0, 27) + '...' : firstMessage;
        return { title: fallbackTitle, icon: 'chat' };
    }
};

export const generateStructuredContentFromText = async (
  text: string,
  action: 'table' | 'summary' | 'actions' | 'doc',
  titleSuggestion: string = 'AI Generated Document'
): Promise<string | ProcessedTableData> => {
  if (action === 'table') {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following text and structure it into a table. Infer appropriate headers and extract the data into rows. Provide a suitable title for the table.\n\nTEXT:\n${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A concise and relevant title for the table." },
                headers: {
                    type: Type.ARRAY,
                    description: "An array of strings for the table column headers.",
                    items: { type: Type.STRING }
                },
                rows: {
                    type: Type.ARRAY,
                    description: "An array of arrays, where each inner array represents a row of cells as strings.",
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            },
            required: ["title", "headers", "rows"],
          }
        }
      });
      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr);
      return { title: parsed.title || titleSuggestion, headers: parsed.headers, rows: parsed.rows };
  } else {
    let prompt: string;
    switch (action) {
      case 'summary':
        prompt = `Summarize the following text concisely and clearly:\n\n${text}`;
        break;
      case 'actions':
        prompt = `Extract all action items or tasks from the following text. List them as a clear, bulleted list:\n\n${text}`;
        break;
      case 'doc':
        prompt = `Format the following text into a clean, well-structured document. Add headings, paragraphs, and bullet points where appropriate to improve readability:\n\n${text}`;
        break;
      default:
        prompt = text;
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }
};
