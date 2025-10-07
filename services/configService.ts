/**
 * ===========================================================================
 * 1. Sheet & Spreadsheet Logical Keys (Enums)
 * ===========================================================================
 * Provides consistent keys for referencing sheets across the application.
 */
export enum SheetKey {
    // Execution Spreadsheet Sheets
    PEOPLE = 'PEOPLE & CAPACITY',
    HUBS = 'HUB',
    TASKS = 'TASKS',
    PROJECTS = 'PROJECTS',

    // Strategy Spreadsheet Sheets
    BUSINESS_UNITS = 'BUSINESS UNITS',
    CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT',
    TOUCHPOINTS = 'TOUCHPOINTS',
    FLYWHEEL = 'FLYWHEEL',
    APP_STORES = 'APP_STORES',
}

export enum SpreadsheetKey {
    STRATEGY = 'STRATEGY',
    EXECUTION = 'EXECUTION',
}

/**
 * ===========================================================================
 * 2. Spreadsheet File Configuration
 * ===========================================================================
 * Maps the logical spreadsheet name to its unique Google Sheet ID (SSID).
 */
const STRATEGY_SHEET_ID = process.env.STRATEGY_SPREADSHEET_ID;
const EXECUTION_SHEET_ID = process.env.EXECUTION_SPREADSHEET_ID;

if (!STRATEGY_SHEET_ID || !EXECUTION_SHEET_ID) {
    throw new Error("Spreadsheet IDs are not configured in process.env");
}

export const SPREADSHEET_CONFIG = {
    [SpreadsheetKey.STRATEGY]: STRATEGY_SHEET_ID,
    [SpreadsheetKey.EXECUTION]: EXECUTION_SHEET_ID,
};

/**
 * ===========================================================================
 * 3. Sheet (Tab) Registry
 * ===========================================================================
 * Details the physical location (Sheet Name/GID) and association (Spreadsheet)
 * for every logical sheet key.
 */
export interface SheetConfig {
    spreadsheetKey: SpreadsheetKey;
    sheetName: string;
    gid: string;
}

export const SHEET_REGISTRY: { [key in SheetKey]: SheetConfig } = {
    // Strategy Sheets
    [SheetKey.BUSINESS_UNITS]: { spreadsheetKey: SpreadsheetKey.STRATEGY, sheetName: 'BUSINESS UNITS', gid: '0' },
    [SheetKey.CUSTOMER_SEGMENT]: { spreadsheetKey: SpreadsheetKey.STRATEGY, sheetName: 'Customer Segment & foundation', gid: '1469082015' },
    [SheetKey.TOUCHPOINTS]: { spreadsheetKey: SpreadsheetKey.STRATEGY, sheetName: 'TOUCHPOINTS', gid: '1839538407' },
    [SheetKey.FLYWHEEL]: { spreadsheetKey: SpreadsheetKey.STRATEGY, sheetName: 'FLYWHEEL', gid: '225662612' },
    [SheetKey.APP_STORES]: { spreadsheetKey: SpreadsheetKey.STRATEGY, sheetName: 'APP STORES', gid: '1447819195' },

    // Execution Sheets
    [SheetKey.PEOPLE]: { spreadsheetKey: SpreadsheetKey.EXECUTION, sheetName: 'PEOPLE & CAPACITY', gid: '40806932' },
    [SheetKey.HUBS]: { spreadsheetKey: SpreadsheetKey.EXECUTION, sheetName: 'Hub', gid: '1215383665' },
    [SheetKey.TASKS]: { spreadsheetKey: SpreadsheetKey.EXECUTION, sheetName: 'TASKS', gid: '268128158' },
    [SheetKey.PROJECTS]: { spreadsheetKey: SpreadsheetKey.EXECUTION, sheetName: 'PROJECTS', gid: '784960017' },
};

/**
 * ===========================================================================
 * 4. Data Hydration Mappings
 * ===========================================================================
 */
export interface HydrationMapping {
    sourceSheet: SheetKey;
    sourceColumnId: string;
    targetSheet: SheetKey;
    targetColumnId: string;
    displayColumn: string;
}

export const HYDRATION_MAP: HydrationMapping[] = [
    // PROJECTS Mappings
    { sourceSheet: SheetKey.PROJECTS, sourceColumnId: 'owner_User_id', targetSheet: SheetKey.PEOPLE, targetColumnId: 'User_id', displayColumn: 'full_name' },
    { sourceSheet: SheetKey.PROJECTS, sourceColumnId: 'business_unit_id', targetSheet: SheetKey.BUSINESS_UNITS, targetColumnId: 'bu_id', displayColumn: 'bu_name' },

    // TASKS Mappings
    { sourceSheet: SheetKey.TASKS, sourceColumnId: 'Project id', targetSheet: SheetKey.PROJECTS, targetColumnId: 'project_id', displayColumn: 'Project Name' },
    { sourceSheet: SheetKey.TASKS, sourceColumnId: 'assignee_User_id', targetSheet: SheetKey.PEOPLE, targetColumnId: 'User_id', displayColumn: 'full_name' },
    { sourceSheet: SheetKey.TASKS, sourceColumnId: 'reporter_User_id', targetSheet: SheetKey.PEOPLE, targetColumnId: 'User_id', displayColumn: 'full_name' },
    
    // TOUCHPOINTS Mappings
    { sourceSheet: SheetKey.TOUCHPOINTS, sourceColumnId: 'bu_id', targetSheet: SheetKey.BUSINESS_UNITS, targetColumnId: 'bu_id', displayColumn: 'bu_name' },

    // BUSINESS_UNITS Mappings
    { sourceSheet: SheetKey.BUSINESS_UNITS, sourceColumnId: 'owner_User_id', targetSheet: SheetKey.PEOPLE, targetColumnId: 'User_id', displayColumn: 'full_name' },
    { sourceSheet: SheetKey.BUSINESS_UNITS, sourceColumnId: 'primary_flywheel_id', targetSheet: SheetKey.FLYWHEEL, targetColumnId: 'flywheel_id', displayColumn: 'flywheel_name' },
    
    // PEOPLE Mappings
    { sourceSheet: SheetKey.PEOPLE, sourceColumnId: 'manager_id', targetSheet: SheetKey.PEOPLE, targetColumnId: 'User_id', displayColumn: 'full_name' },
];

// Re-export for convenience
export const CONFIG_SERVICE = {
    SPREADSHEET_CONFIG,
    SHEET_REGISTRY,
    HYDRATION_MAP,
};