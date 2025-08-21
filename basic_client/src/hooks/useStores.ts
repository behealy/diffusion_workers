/**
 * Typed hooks for accessing Zustand stores
 * These hooks provide type safety and can include computed values
 */

import { useGenerationStore } from '../stores/generationStore';
import { useImageStore } from '../stores/imageStore';
import { useUIStore } from '../stores/uiStore';

// Re-export store hooks with better typing
export { useGenerationStore, useImageStore, useUIStore };

// Typed selectors for better performance
export const useGenerationState = () => useGenerationStore();
export const useImageState = () => useImageStore();
export const useUIState = () => useUIStore();

// Specific selectors for commonly used state slices
export const usePrompt = () => useGenerationStore((state) => state.prompt);
export const useNegativePrompt = () => useGenerationStore((state) => state.negativePrompt);
export const useGenerationMode = () => useGenerationStore((state) => state.mode);
export const useIsGenerating = () => useGenerationStore((state) => state.isGenerating);
export const useGenerationProgress = () => useGenerationStore((state) => state.generationProgress);

export const useInputImage = () => useImageStore((state) => state.inputImage);
export const useOutputImage = () => useImageStore((state) => state.outputImage);
export const useMask = () => useImageStore((state) => state.mask);
export const useBrushSize = () => useImageStore((state) => state.brushSize);
export const useIsDrawing = () => useImageStore((state) => state.isDrawing);

export const useCurrentModal = () => useUIStore((state) => state.currentModal);
export const useThemeMode = () => useUIStore((state) => state.themeMode);
export const useScreenSize = () => useUIStore((state) => state.screenSize);
export const usePanelVisibility = () => useUIStore((state) => state.panelVisibility);
export const useToasts = () => useUIStore((state) => state.toasts);

// Computed selectors
export const useCanGenerate = () =>
  useGenerationStore((state) => {
    const hasPrompt = state.prompt.trim().length > 0;
    const hasValidDimensions = state.dimensions.width > 0 && state.dimensions.height > 0;
    const notCurrentlyGenerating = !state.isGenerating;

    return hasPrompt && hasValidDimensions && notCurrentlyGenerating;
  });

export const useCanInpaint = () => {
  const inputImage = useInputImage();
  const mask = useMask();
  return inputImage !== null && mask !== null;
};

export const useCanUseImageToImage = () => {
  const inputImage = useInputImage();
  return inputImage !== null;
};

export const useGenerationButtonText = () => {
  const mode = useGenerationMode();
  const isGenerating = useIsGenerating();

  if (isGenerating) {
    return 'Generating...';
  }

  switch (mode) {
    case 'text-to-image':
      return 'Generate Image';
    case 'image-to-image':
      return 'Transform Image';
    case 'inpaint':
      return 'Inpaint Image';
    default:
      return 'Generate';
  }
};

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

export const useSetupNewGeneration = () => {
  const setMode = useGenerationStore((state) => state.setMode);
  const clearOutputImage = useImageStore((state) => state.clearOutputImage);
  const setGenerating = useGenerationStore((state) => state.setGenerating);

  return (mode: 'text-to-image' | 'image-to-image' | 'inpaint') => {
    setMode(mode);
    clearOutputImage();
    setGenerating(false);
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
