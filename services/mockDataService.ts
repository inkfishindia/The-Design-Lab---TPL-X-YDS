import type { SheetRow, Project, SheetUser, BusinessUnit, Flywheel, Hub, Touchpoint, CustomerSegmentFoundation, ProjectTask } from '../types';
import { SheetKey } from './configService';

const mockUsers: SheetUser[] = [
    { rowIndex: 1, User_id: 'user_001', full_name: 'Danish Hanif', email: 'danish@example.com', role_title: 'Founder', weekly_hours_capacity: 50, phone: '', department: '', manager_id: '', employment_type: '', location: '', notes: '', is_active: true, skills: '', budget_approval_level: '', platform_access: '', claude_access_level: '', delegation_authority_level: '', ai_workflow_preferences: '', notion_User_id: '', created_at: '', updated_at: '', 'App role': '', hub_id: 'hub_02', bu_focus: 'SaaS', utilization_target_pct: 80, current_utilization_pct: 95, velocity_points_per_week: 20, primary_responsibility: 'Strategy' },
    { rowIndex: 2, User_id: 'user_002', full_name: 'Jane Smith', email: 'jane@example.com', role_title: 'Project Manager', manager_id: 'user_001', weekly_hours_capacity: 40, phone: '', department: '', employment_type: '', location: '', notes: '', is_active: true, skills: '', budget_approval_level: '', platform_access: '', claude_access_level: '', delegation_authority_level: '', ai_workflow_preferences: '', notion_User_id: '', created_at: '', updated_at: '', 'App role': '', hub_id: 'hub_01', bu_focus: 'SaaS', utilization_target_pct: 90, current_utilization_pct: 85, velocity_points_per_week: 15, primary_responsibility: 'Execution' },
    { rowIndex: 3, User_id: 'user_003', full_name: 'Arun Nair', email: 'arun@example.com', role_title: 'Lead Developer', manager_id: 'user_002', weekly_hours_capacity: 40, phone: '', department: '', employment_type: '', location: '', notes: '', is_active: true, skills: '', budget_approval_level: '', platform_access: '', claude_access_level: '', delegation_authority_level: '', ai_workflow_preferences: '', notion_User_id: '', created_at: '', updated_at: '', 'App role': '', hub_id: 'hub_01', bu_focus: 'SaaS, D2C', utilization_target_pct: 90, current_utilization_pct: 110, velocity_points_per_week: 25, primary_responsibility: 'Development' },
    { rowIndex: 4, User_id: 'user_004', full_name: 'Emily White', email: 'emily@example.com', role_title: 'SDR', manager_id: 'user_001', weekly_hours_capacity: 40, phone: '', department: '', employment_type: '', location: '', notes: '', is_active: true, skills: '', budget_approval_level: '', platform_access: '', claude_access_level: '', delegation_authority_level: '', ai_workflow_preferences: '', notion_User_id: '', created_at: '', updated_at: '', 'App role': '', hub_id: 'hub_02', bu_focus: 'D2C', utilization_target_pct: 85, current_utilization_pct: 70, velocity_points_per_week: 10, primary_responsibility: 'Sales' },
];

const mockBusinessUnits: BusinessUnit[] = [
    { rowIndex: 1, bu_id: 'bu_01', bu_name: 'Nexus AI', bu_focus: 'SaaS, B2B', primary_flywheel_id: 'fw_01', bu_type: 'SaaS', platform_type: 'Web App', interface: 'Web', pricing_model: 'Subscription', owner_User_id: 'user_001', Upsell_flywheel_id: '', avg_order_value: 5000, target_margin_pct: 0.6, 'Customer Type': 'Enterprise', 'Tech Build': 'Custom', 'Sales Motion': 'Sales-Led', 'Support Type': 'Dedicated', 'Pricing Logic': 'Tiered', current_revenue: 120000, current_orders: 24, variance_pct: 0.05, health_status: 'Healthy', growth_rate_required: 0.1, priority_level: 'High', status: 'Active', order_volume_range: '10-50', customer_type: 'B2B' },
    { rowIndex: 2, bu_id: 'bu_02', bu_name: 'Product Lab', bu_focus: 'D2C, E-commerce', primary_flywheel_id: 'fw_02', bu_type: 'E-commerce', platform_type: 'Shopify', interface: 'Web', pricing_model: 'Per-Item', owner_User_id: 'user_001', Upsell_flywheel_id: '', avg_order_value: 200, target_margin_pct: 0.4, 'Customer Type': 'Consumer', 'Tech Build': 'Turnkey', 'Sales Motion': 'Marketing-Led', 'Support Type': 'Community', 'Pricing Logic': 'Fixed', current_revenue: 50000, current_orders: 250, variance_pct: -0.1, health_status: 'At Risk', growth_rate_required: 0.2, priority_level: 'Medium', status: 'Active', order_volume_range: '200-500', customer_type: 'D2C' },
];

const mockProjects: Project[] = [
    { rowIndex: 1, project_id: 'proj_001', 'Project Name': 'Q4 Marketing Campaign', business_unit_id: 'bu_01', owner_User_id: 'user_001', objective: 'Increase lead gen by 20%', priority: 'High', Status: 'planning', status: 'planning', start_date: '2024-10-01', target_end_date: '2024-12-31', confidence_pct: 80, budget_planned: 50000, budget_spent: 0, risk_flag: 'Low', risk_note: '', notion_project_id: '', integration_status: '', automation_level: '', team_members: '', success_metrics: 'Lead conversion rate', created_at: '', updated_at: '', target_impact: '', go_nogo_criteria: '', hub_dependencies: '', metric_impact: '', blocks_project_id: '', target_bu_id: 'bu_01', target_flywheel_id: 'fw_01', target_platform_ids: '', target_metric: 'Leads', baseline_value: 100, target_value: 120, actual_value: 0, impact_status: '' },
    { rowIndex: 2, project_id: 'proj_002', 'Project Name': 'New Feature Rollout: AI Insights', business_unit_id: 'bu_01', owner_User_id: 'user_002', objective: 'Drive adoption of new AI feature', priority: 'High', Status: 'in_progress', status: 'in_progress', start_date: '2024-09-01', target_end_date: '2024-10-31', confidence_pct: 95, budget_planned: 20000, budget_spent: 5000, risk_flag: 'Medium', risk_note: '', notion_project_id: '', integration_status: '', automation_level: '', team_members: '', success_metrics: 'User adoption', created_at: '', updated_at: '', target_impact: '', go_nogo_criteria: '', hub_dependencies: '', metric_impact: '', blocks_project_id: '', target_bu_id: 'bu_01', target_flywheel_id: 'fw_01', target_platform_ids: '', target_metric: 'Adoption Rate', baseline_value: 0, target_value: 0.15, actual_value: 0.02, impact_status: '' },
    { rowIndex: 3, project_id: 'proj_003', 'Project Name': 'Website Redesign', business_unit_id: 'bu_02', owner_User_id: 'user_001', objective: 'Improve mobile conversion rate', priority: 'Medium', Status: 'at risk', status: 'at risk', start_date: '2024-09-15', target_end_date: '2024-11-15', confidence_pct: 60, budget_planned: 30000, budget_spent: 10000, risk_flag: 'High', risk_note: 'Scope creep identified', notion_project_id: '', integration_status: '', automation_level: '', team_members: '', success_metrics: 'Conversion rate', created_at: '', updated_at: '', target_impact: '', go_nogo_criteria: '', hub_dependencies: '', metric_impact: '', blocks_project_id: '', target_bu_id: 'bu_02', target_flywheel_id: 'fw_02', target_platform_ids: '', target_metric: 'Conversion Rate', baseline_value: 0.02, target_value: 0.04, actual_value: 0.02, impact_status: '' },
];

const mockTasks: ProjectTask[] = [
    { rowIndex: 1, task_id: 'task_001', title: 'Design new landing page', 'Project id': 'proj_003', assignee_User_id: 'user_003', status: 'in_progress', priority: 'High', estimate_hours: 16, reporter_User_id: 'user_002', labels: 'design, web', description: 'Create mockups for the new homepage', logged_hours: 4, due_date: '2024-09-30', completed_at: '', energy_level: 'High', department: 'Design', Blocker: 'No', 'Blocker Description': '', delegation_status: 'Not Delegated', days_overdue: 0, founder_critical: false, notion_task_id: '', auto_delegation_eligible: true, resource_requirements: 'Figma Pro', platform: 'Web', content_type: 'Design Mockup', created_at: '', updated_at: '' },
    { rowIndex: 2, task_id: 'task_002', title: 'Develop AI Insights API', 'Project id': 'proj_002', assignee_User_id: 'user_003', status: 'done', priority: 'High', estimate_hours: 40, reporter_User_id: 'user_002', labels: 'backend, api', description: 'Build and deploy the main API endpoints', logged_hours: 45, due_date: '2024-09-20', completed_at: '2024-09-22', energy_level: 'Medium', department: 'Engineering', Blocker: 'No', 'Blocker Description': '', delegation_status: 'Completed', days_overdue: 0, founder_critical: true, notion_task_id: '', auto_delegation_eligible: false, resource_requirements: 'AWS Lambda', platform: 'API', content_type: 'Code', created_at: '', updated_at: '' },
    { rowIndex: 3, task_id: 'task_003', title: 'Plan social media posts', 'Project id': 'proj_001', assignee_User_id: 'user_004', status: 'to_do', priority: 'Medium', estimate_hours: 8, reporter_User_id: 'user_002', labels: 'marketing', description: 'Draft content for the first week of the campaign', logged_hours: 0, due_date: '2024-10-10', completed_at: '', energy_level: 'Low', department: 'Marketing', Blocker: 'Yes', 'Blocker Description': 'Waiting for brand assets', delegation_status: 'Pending', days_overdue: 0, founder_critical: false, notion_task_id: '', auto_delegation_eligible: true, resource_requirements: 'Buffer', platform: 'Social', content_type: 'Text/Image', created_at: '', updated_at: '' },
];

const mockFlywheels: Flywheel[] = [
    { rowIndex: 1, flywheel_id: 'fw_01', flywheel_name: 'B2B SaaS Flywheel', description: 'Flywheel for B2B SaaS products.'},
    { rowIndex: 2, flywheel_id: 'fw_02', flywheel_name: 'D2C Product Flywheel', description: 'Flywheel for direct-to-consumer products.'},
];

const mockHubs: Hub[] = [
    { rowIndex: 1, function_id: 'hub_01', function_name: 'Engineering', owner: 'user_002' },
    { rowIndex: 2, function_id: 'hub_02', function_name: 'Marketing', owner: 'user_001' },
];

const mockTouchpoints: Touchpoint[] = [
    { rowIndex: 1, touchpoint_id: 'tp_01', touchpoint_name: 'Website Landing Page', touchpoint_type: 'Website', status: 'Live', bu_id: 'bu_01' },
    { rowIndex: 2, touchpoint_id: 'tp_02', touchpoint_name: 'Q4 Ad Campaign', touchpoint_type: 'Paid Ad', status: 'Planning', bu_id: 'bu_01' },
];

const mockCustomerSegments: CustomerSegmentFoundation[] = [
    { rowIndex: 1, 'Customer segment': 'Startup Founders', Purpose: 'To provide tools for growth' }
];

const allMockData: Record<string, SheetRow[]> = {
    [SheetKey.PROJECTS]: mockProjects,
    [SheetKey.TASKS]: mockTasks,
    [SheetKey.PEOPLE]: mockUsers,
    [SheetKey.BUSINESS_UNITS]: mockBusinessUnits,
    [SheetKey.FLYWHEEL]: mockFlywheels,
    [SheetKey.HUBS]: mockHubs,
    [SheetKey.TOUCHPOINTS]: mockTouchpoints,
    [SheetKey.CUSTOMER_SEGMENT]: mockCustomerSegments,
    [SheetKey.APP_STORES]: [],
};

export const getMockData = (sheetKey: SheetKey): any[] => {
    // Return a deep copy to prevent mutations from affecting the source
    return JSON.parse(JSON.stringify(allMockData[sheetKey] || []));
};