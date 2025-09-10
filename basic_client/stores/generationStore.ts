import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import diffusionService from '@/services/diffusionService';
import {
  ControlNetParams,
  ImageGenerationParams,
  ImageGenerationParamsDimensions,
  ImageGenerationParamsPipelineOptimizations,
  ImageGenerationResponse,
  ImageToImageParams,
  LoraParams,
  OpStatus,
} from '../lib/ezdiffusion';
import { createHistoryState } from './historyStore';
import { MiddlewareEnabledStateCreator } from '../types';
import { GenerationStore } from '.';
import { PendingImageGenParamsState } from './PendingImageGenParamsState';


const stagedParamsDefaults = {
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
      useTorchCompile: false,
    },
    loras: [],
    controlnets: [],
    baseModel: 'Lykon/dreamshaper-8',
  }

const createPendingImageGenParamsState: MiddlewareEnabledStateCreator<GenerationStore, PendingImageGenParamsState> = (set, get, store) => ({
  stagedParams: stagedParamsDefaults,

  // Basic parameter setters
  setPrompt: (prompt) =>
    set((state) => {
      state.stagedParams.prompt = prompt;
    }),

  setNegativePrompt: (negativePrompt) =>
    set((state) => {
      state.stagedParams.negativePrompt = negativePrompt;
    }),

  setDimensions: (dimensions) =>
    set((state) => {
      state.stagedParams.dimensions = { ...state.stagedParams.dimensions, ...dimensions };
    }),

  setInferenceSteps: (steps) =>
    set((state) => {
      state.stagedParams.inferenceSteps = steps;
    }),

  setGuidanceScale: (scale) =>
    set((state) => {
      state.stagedParams.guidanceScale = scale;
    }),

  setSeed: (seed) =>
    set((state) => {
      state.stagedParams.seed = seed;
    }),

  setBaseModel: (modelId) =>
    set((state) => {
      state.stagedParams.baseModel = modelId;
    }),

  // Pipeline optimizations
  setPipelineOptimizations: (optimizations) =>
    set((state) => {
      state.stagedParams.pipelineOptimizations = { ...state.stagedParams.pipelineOptimizations, ...optimizations };
    }),

  // LoRA management
  addLora: (lora) =>
    set((state) => {
      state.stagedParams.loras?.push(lora);
    }),

  updateLora: (index, lora) =>
    set((state) => {
      if (state.stagedParams.loras?.at(index)) {
        state.stagedParams.loras[index] = { ...state.stagedParams.loras[index], ...lora };
      }
    }),

  removeLora: (index) =>
    set((state) => {
      state.stagedParams.loras?.splice(index, 1);
    }),

  clearLoras: () =>
    set((state) => {
      state.stagedParams.loras = [];
    }),

  // ControlNet management
  addControlNet: (controlNet) =>
    set((state) => {
      state.stagedParams.controlnets?.push(controlNet);
    }),

  updateControlNet: (index, controlNet) =>
    set((state) => {
      if (state.stagedParams.controlnets?.at(index)) {
        state.stagedParams.controlnets[index] = { ...state.stagedParams.controlnets[index], ...controlNet };
      }
    }),

  removeControlNet: (index) =>
    set((state) => {
      state.stagedParams.controlnets?.splice(index, 1);
    }),

  clearControlNets: () =>
    set((state) => {
      state.stagedParams.controlnets = [];
    }),

  // Utility actions
  resetToDefaults: () =>
    set((state) => {
      Object.assign(state, stagedParamsDefaults);
    }),

  startGeneration: async () => {
    const stagedParams = get().stagedParams;
    get().addPendingItemToHistory(stagedParams, OpStatus.Pending)

    try {
      const response = await diffusionService.generateImage({
        input: stagedParams
      })

      if (response.result) {
        const history = await diffusionService.getHistory({
          index: 0,
          length: 10
        })
        set((state) => {
          state.generationHistory = history.results
        })
      }
    } catch (error) {
      get().addPendingItemToHistory(stagedParams, OpStatus.Failure)
    }
  },
})




export const useGenerationStore = create<GenerationStore>()(
  devtools(
    persist(
      immer((set, get, store) => ({
        ...createHistoryState(set, get, store),
        ...createPendingImageGenParamsState(set, get, store)
      })),
      {
        name: 'generation-store',
        // Only persist user preferences, not transient state
        partialize: (state) => {
          const params = state.stagedParams;
          return {
            stagedParams: {
              dimensions: params.dimensions,
              inferenceSteps: params.inferenceSteps,
              guidanceScale: params.guidanceScale,
              pipelineOptimizations: params.pipelineOptimizations,
              baseModel: params.baseModel
            }
          }
        }
      },
    ),
    {
      name: 'generation-store',
    },
  ),
);
