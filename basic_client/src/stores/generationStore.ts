import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  ImageGenerationParams,
  LoraParams,
  ControlNetParams,
  ImageGenerationParamsDimensions,
  ImageGenerationParamsPipelineOptimizations
} from '../lib/ezdiffusion';

// Generation parameter types
export interface GenerationState {
  // Core generation parameters
  prompt: string;
  negativePrompt: string;
  dimensions: ImageGenerationParamsDimensions;
  inferenceSteps: number;
  guidanceScale: number;
  seed: number | null;
  
  // Pipeline optimizations
  pipelineOptimizations: ImageGenerationParamsPipelineOptimizations;
  
  // Modifiers
  loras: LoraParams[];
  controlnets: ControlNetParams[];
  
  // Generation mode
  mode: 'text-to-image' | 'image-to-image' | 'inpaint';
  
  // Image-to-image specific
  strength: number;
  
  // Model selection
  modelId: string;
  
  // Loading state
  isGenerating: boolean;
  generationProgress: number;
}

export interface GenerationActions {
  // Basic parameter setters
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (negativePrompt: string) => void;
  setDimensions: (dimensions: Partial<ImageGenerationParamsDimensions>) => void;
  setInferenceSteps: (steps: number) => void;
  setGuidanceScale: (scale: number) => void;
  setSeed: (seed: number | null) => void;
  setStrength: (strength: number) => void;
  setModelId: (modelId: string) => void;
  
  // Mode management
  setMode: (mode: GenerationState['mode']) => void;
  
  // Pipeline optimizations
  setPipelineOptimizations: (optimizations: Partial<ImageGenerationParamsPipelineOptimizations>) => void;
  
  // Modifier management
  addLora: (lora: LoraParams) => void;
  updateLora: (index: number, lora: Partial<LoraParams>) => void;
  removeLora: (index: number) => void;
  clearLoras: () => void;
  
  addControlNet: (controlNet: ControlNetParams) => void;
  updateControlNet: (index: number, controlNet: Partial<ControlNetParams>) => void;
  removeControlNet: (index: number) => void;
  clearControlNets: () => void;
  
  // Generation state
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  
  // Utility actions
  resetToDefaults: () => void;
  buildGenerationParams: () => ImageGenerationParams;
}

export type GenerationStore = GenerationState & GenerationActions;

// Default state
const defaultState: GenerationState = {
  prompt: '',
  negativePrompt: '',
  dimensions: {
    width: 1024,
    height: 1024,
  },
  inferenceSteps: 20,
  guidanceScale: 7.5,
  seed: null,
  pipelineOptimizations: {
    useDeepcache: false,
    deepcacheInterval: undefined,
    deepcacheBranchId: undefined,
    useTorchCompile: false,
  },
  loras: [],
  controlnets: [],
  mode: 'text-to-image',
  strength: 0.8,
  modelId: 'Lykon/dreamshaper-8',
  isGenerating: false,
  generationProgress: 0,
};

export const useGenerationStore = create<GenerationStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...defaultState,
        
        // Basic parameter setters
        setPrompt: (prompt) => set((state) => {
          state.prompt = prompt;
        }),
        
        setNegativePrompt: (negativePrompt) => set((state) => {
          state.negativePrompt = negativePrompt;
        }),
        
        setDimensions: (dimensions) => set((state) => {
          state.dimensions = { ...state.dimensions, ...dimensions };
        }),
        
        setInferenceSteps: (steps) => set((state) => {
          state.inferenceSteps = steps;
        }),
        
        setGuidanceScale: (scale) => set((state) => {
          state.guidanceScale = scale;
        }),
        
        setSeed: (seed) => set((state) => {
          state.seed = seed;
        }),
        
        setStrength: (strength) => set((state) => {
          state.strength = strength;
        }),
        
        setModelId: (modelId) => set((state) => {
          state.modelId = modelId;
        }),
        
        // Mode management
        setMode: (mode) => set((state) => {
          state.mode = mode;
        }),
        
        // Pipeline optimizations
        setPipelineOptimizations: (optimizations) => set((state) => {
          state.pipelineOptimizations = { ...state.pipelineOptimizations, ...optimizations };
        }),
        
        // LoRA management
        addLora: (lora) => set((state) => {
          state.loras.push(lora);
        }),
        
        updateLora: (index, lora) => set((state) => {
          if (state.loras[index]) {
            state.loras[index] = { ...state.loras[index], ...lora };
          }
        }),
        
        removeLora: (index) => set((state) => {
          state.loras.splice(index, 1);
        }),
        
        clearLoras: () => set((state) => {
          state.loras = [];
        }),
        
        // ControlNet management
        addControlNet: (controlNet) => set((state) => {
          state.controlnets.push(controlNet);
        }),
        
        updateControlNet: (index, controlNet) => set((state) => {
          if (state.controlnets[index]) {
            state.controlnets[index] = { ...state.controlnets[index], ...controlNet };
          }
        }),
        
        removeControlNet: (index) => set((state) => {
          state.controlnets.splice(index, 1);
        }),
        
        clearControlNets: () => set((state) => {
          state.controlnets = [];
        }),
        
        // Generation state
        setGenerating: (isGenerating) => set((state) => {
          state.isGenerating = isGenerating;
          if (!isGenerating) {
            state.generationProgress = 0;
          }
        }),
        
        setGenerationProgress: (progress) => set((state) => {
          state.generationProgress = progress;
        }),
        
        // Utility actions
        resetToDefaults: () => set((state) => {
          Object.assign(state, defaultState);
        }),
        
        buildGenerationParams: (): ImageGenerationParams => {
          const state = get();
          return {
            prompt: state.prompt,
            negativePrompt: state.negativePrompt || undefined,
            dimensions: state.dimensions,
            inferenceSteps: state.inferenceSteps,
            guidanceScale: state.guidanceScale,
            seed: state.seed || undefined,
            pipelineOptimizations: state.pipelineOptimizations,
            loras: state.loras.length > 0 ? state.loras : undefined,
            controlnets: state.controlnets.length > 0 ? state.controlnets : undefined,
            modelId: state.modelId,
            strength: state.mode === 'image-to-image' ? state.strength : undefined,
          };
        },
      })),
      {
        name: 'generation-store',
        // Only persist user preferences, not transient state
        partialize: (state) => ({
          dimensions: state.dimensions,
          inferenceSteps: state.inferenceSteps,
          guidanceScale: state.guidanceScale,
          pipelineOptimizations: state.pipelineOptimizations,
          strength: state.strength,
          modelId: state.modelId,
        }),
      }
    ),
    {
      name: 'generation-store',
    }
  )
);