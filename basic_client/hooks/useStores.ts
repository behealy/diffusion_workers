/**
 * Typed hooks for accessing Zustand stores
 * These hooks provide type safety and can include computed values
 */

import { useGenerationStore } from '@/stores';
import { useImageStore } from '../stores/imageStore';
import { useUIStore } from '../stores/uiStore';

// Re-export store hooks with better typing
export { useGenerationStore, useImageStore, useUIStore };

// Specific selectors for commonly used state slices
export const useStagedGenerationParamsState = () => useGenerationStore((state) => state.stagedParams);

// export const useInputImage = () => useImageStore((state) => state.inputImage);
// export const useOutputImage = () => useImageStore((state) => state.outputImage);
// export const useMask = () => useImageStore((state) => state.mask);
// export const useBrushSize = () => useImageStore((state) => state.brushSize);
// export const useIsDrawing = () => useImageStore((state) => state.isDrawing);

export const useCurrentModal = () => useUIStore((state) => state.currentModal);
export const useThemeMode = () => useUIStore((state) => state.themeMode);
export const useScreenSize = () => useUIStore((state) => state.screenSize);
export const usePanelVisibility = () => useUIStore((state) => state.panelVisibility);
export const useToasts = () => useUIStore((state) => state.toasts);

// Computed selectors
export const useCanGenerate = () =>
  useGenerationStore((state) => {
    const params = state.stagedParams
    const hasPrompt = params.prompt.trim().length > 0;
    const hasValidDimensions = params.dimensions.width > 0 && params.dimensions.height > 0;
    return hasPrompt && hasValidDimensions;
  });

// Action creators that combine multiple store actions
export const useResetAllStores = () => {
  const resetGeneration = useGenerationStore((state) => state.resetToDefaults);
  const resetImages = useImageStore((state) => state.reset);
  const resetUI = useUIStore((state) => state.reset);

  return () => {
    resetGeneration();
    resetImages();
    resetUI();
  };
};

// Store subscription helpers for debugging and development
export const useStoreDevtools = () => {
  const generationStore = useGenerationStore.getState();
  const imageStore = useImageStore.getState();
  const uiStore = useUIStore.getState();

  return {
    generation: generationStore,
    image: imageStore,
    ui: uiStore,

    // Helper to log all store states
    logAllStates: () => {
      console.group('Store States');
      console.log('Generation Store:', generationStore);
      console.log('Image Store:', imageStore);
      console.log('UI Store:', uiStore);
      console.groupEnd();
    },
  };
};
