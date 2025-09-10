import {
  ImageGenerationParams,
  ImageGenerationResponse,
  OpStatus,
} from '../lib/ezdiffusion';

export interface HistoryState {
    generationHistory: ImageGenerationResponse[];
    addPendingItemToHistory: (stagedParams: ImageGenerationParams, opStatus: OpStatus) => void;
}