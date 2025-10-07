export type VsmViewType = 'radial' | 'hierarchy' | 'funnel' | 'network';

export type NodeType = 'brand' | 'flywheel' | 'businessUnit' | 'hub' | 'project' | 'task' | 'person' | 'platform' | 'touchpoint' | 'campaign';

export interface VsmNode {
    id: string;
    label: string;
    type: NodeType;
    data: any;
    children?: VsmNode[];
}

export type FilterSettings = {
    [key in NodeType]?: boolean;
};
