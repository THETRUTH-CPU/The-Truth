/**
 * Room Organizer & Declutterer Types
 */

export interface DeclutterStep {
  id: string;
  phase: string; // e.g. "Phase 1: Sort", "Phase 2: Rearrange", "Phase 3: Store & Style"
  title: string;
  description: string;
}

export interface LayoutSuggestion {
  area: string;
  suggestion: string;
}

export interface StorageSolution {
  item: string;
  purpose: string;
  estimatedCost: "Low" | "Medium" | "High";
}

export interface RoomAnalysisResponse {
  roomType: string;
  roomTypeDisplay: string;
  clutterScore: number; // 1 to 10 scale
  roomAnalysis: string;
  clutterSources: string[];
  declutterSteps: DeclutterStep[];
  layoutSuggestions: LayoutSuggestion[];
  storageSolutions: StorageSolution[];
  aestheticTips: string[];
}

export interface SavedRoomAnalysis {
  id: string;
  timestamp: string; // ISO string
  roomName: string; // e.g. "My Living Room" or "Bedroom"
  imageUrl: string; // Base64 or local URL for rendering
  afterImageUrl?: string; // Base64 or local URL for the transformed state
  afterTimestamp?: string; // ISO string when 'after' photo was uploaded
  goals: string;
  painPoints: string;
  analysis: RoomAnalysisResponse;
  completedStepIds: string[]; // for tracking checklist progress
  userNotes?: string;
}

export interface AnalysisRequest {
  image: string; // Base64 data (without header prefix or with it, we'll handle both)
  roomType: string; // e.g. "living_room", "bedroom", "kitchen", "office", "any"
  goals: string; // custom text or preset
  painPoints: string; // custom text or preset
  clutterFocus: string; // e.g. "high", "medium", "standard"
}
