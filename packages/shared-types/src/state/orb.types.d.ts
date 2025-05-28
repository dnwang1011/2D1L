export interface Orb {
    orb_id: string;
    user_id: string;
    name: string;
    description?: string | null;
    metadata?: any;
    created_at: Date;
    updated_at?: Date | null;
}
export interface DerivedArtifact {
    artifact_id: string;
    user_id: string;
    artifact_type: string;
    title?: string | null;
    content_summary?: string | null;
    insight_content?: any;
    metadata?: any;
    created_at: Date;
}
export interface OrbData extends Orb {
    memoryUnitCount?: number;
    conceptCount?: number;
    artifactCount?: number;
}
export interface OrbState {
    orbs: Record<string, OrbData>;
    selectedOrbId: string | null;
    isLoadingOrbs: boolean;
    isLoadingSelectedOrbDetails: boolean;
    error: string | null;
}
export interface OrbActions {
    addOrb: (orb: OrbData) => void;
    setOrbs: (orbs: OrbData[]) => void;
    updateOrb: (orbId: string, updates: Partial<OrbData>) => void;
    removeOrb: (orbId: string) => void;
    selectOrb: (orbId: string | null) => void;
    createOrb: (name: string, description?: string) => Promise<OrbData | null>;
    fetchOrbs: (userId: string) => Promise<void>;
    fetchOrbDetails: (orbId: string) => Promise<void>;
    updateOrbNameAndDescription: (orbId: string, name: string, description?: string) => Promise<OrbData | null>;
    deleteOrb: (orbId: string) => Promise<boolean>;
    setLoadingOrbs: (isLoading: boolean) => void;
    setLoadingSelectedOrbDetails: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}
export type OrbStore = OrbState & OrbActions;
//# sourceMappingURL=orb.types.d.ts.map