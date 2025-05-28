import { create } from 'zustand';

// Define more specific types for Node and Link later, based on shared-types
interface GraphNode {
  id: string;
  label: string;
  // ... other node properties (position, type, etc.)
}

interface GraphLink {
  source: string; // node id
  target: string; // node id
  // ... other link properties
}

interface GraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  isLoading: boolean;
  focusedNodeId: string | null;
  // Add other graph-related state properties here (e.g., layout parameters, view options)
  setGraphData: (data: { nodes: GraphNode[], links: GraphLink[] }) => void;
  addNode: (node: GraphNode) => void;
  updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;
  addLink: (link: GraphLink) => void;
  setLoading: (loading: boolean) => void;
  setFocusedNode: (nodeId: string | null) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  links: [],
  isLoading: false,
  focusedNodeId: null,
  setGraphData: (data) => set({ nodes: data.nodes, links: data.links }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
  })),
  addLink: (link) => set((state) => ({ links: [...state.links, link] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setFocusedNode: (nodeId) => set({ focusedNodeId: nodeId }),
  // Initialize other state properties here
})); 