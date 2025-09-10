import { HistoryState } from "./HistoryState";
import { PendingImageGenParamsState } from "./PendingImageGenParamsState";

// Export all Zustand stores from this directory
export type GenerationStore = PendingImageGenParamsState & HistoryState

export { useGenerationStore } from './generationStore';
