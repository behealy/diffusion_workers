import {
  ControlNetParams,
  ImageGenerationParams,
  ImageGenerationParamsDimensions,
  ImageGenerationParamsPipelineOptimizations,
  LoraParams,
} from '../lib/ezdiffusion';

// Generation parameter types
export interface PendingImageGenParamsState {
  stagedParams: ImageGenerationParams;
    // Basic parameter setters
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (negativePrompt: string) => void;
  setDimensions: (dimensions: Partial<ImageGenerationParamsDimensions>) => void;
  setInferenceSteps: (steps: number) => void;
  setGuidanceScale: (scale: number) => void;
  setSeed: (seed: number | null) => void;
  setBaseModel: (modelId: string) => void;

  // Pipeline optimizations
  setPipelineOptimizations: (
    optimizations: Partial<ImageGenerationParamsPipelineOptimizations>,
  ) => void;

  // Modifier management
  addLora: (lora: LoraParams) => void;
  updateLora: (index: number, lora: Partial<LoraParams>) => void;
  removeLora: (index: number) => void;
  clearLoras: () => void;

  addControlNet: (controlNet: ControlNetParams) => void;
  updateControlNet: (index: number, controlNet: Partial<ControlNetParams>) => void;
  removeControlNet: (index: number) => void;
  clearControlNets: () => void;

  startGeneration: () => void;

  // Utility actions
  resetToDefaults: () => void;
}



