import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Image data types
export interface ImageData {
  id: string;
  uri: string; // base64 data URI or file URI
  width: number;
  height: number;
  mimeType: string;
  createdAt: number;
  source: 'generated' | 'imported' | 'camera';
  generationParams?: any; // Store the parameters used to generate this image
}

export interface MaskData {
  id: string;
  uri: string; // base64 mask data
  width: number;
  height: number;
  brushSize: number;
  createdAt: number;
}

export interface GenerationHistoryItem {
  id: string;
  inputImage?: ImageData;
  outputImage?: ImageData;
  mask?: MaskData;
  generationParams: any;
  timestamp: number;
  mode: 'text-to-image' | 'image-to-image' | 'inpaint';
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

export interface ImageState {
  // Current working images
  inputImage: ImageData | null;
  outputImage: ImageData | null;
  mask: MaskData | null;

  // Canvas drawing state
  brushSize: number;
  isDrawing: boolean;

  showMask: boolean;
  previewZoom: number;
}

export interface ImageActions {
  // Output image management
  setOutputImage: (image: ImageData | null) => void;
  clearOutputImage: () => void;

  // Canvas drawing
  setBrushSize: (size: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setShowMask: (show: boolean) => void

  // UI state
  setPreviewZoom: (zoom: number) => void;

  // Import/Export
  importImage: (uri: string, source: ImageData['source']) => Promise<ImageData>;
  exportImage: (image: ImageData, format?: 'png' | 'jpg') => Promise<string>;

  // Utility actions
  reset: () => void;
}

export type ImageStore = ImageState & ImageActions;

// Default state
const defaultState: ImageState = {
  outputImage: null,
  inputImage: null,
  mask: null,
  brushSize: 20,
  isDrawing: false,
  showMask: true,
  previewZoom: 1.0,
};

// Utility function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utility function to get image dimensions from URI
const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  // TODO: implementation
  return new Promise((resolve, reject) => {
    // const img = new Image();
    // img.onload = () => {
    //   resolve({ width: img.width, height: img.height });
    // };
    // img.onerror = reject;
    // img.src = uri;
    resolve({ width: 0, height: 0 });
  });
};

export const useImageStore = create<ImageStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...defaultState,
        // Output image management
        setOutputImage: (image) =>
          set((state) => {
            state.outputImage = image;
          }),

        clearOutputImage: () =>
          set((state) => {
            state.outputImage = null;
          }),

        useOutputAsInput: () =>
          set((state) => {
            if (state.outputImage) {
              state.inputImage = state.outputImage;
              state.outputImage = null;
              state.mask = null; // Clear mask when switching images
            }
          }),

        // Canvas drawing
        setBrushSize: (size) =>
          set((state) => {
            state.brushSize = Math.max(1, Math.min(100, size));
          }),

        setIsDrawing: (isDrawing) =>
          set((state) => {
            state.isDrawing = isDrawing;
          }),

        setShowMask: (show) =>
          set((state) => {
            state.showMask = show;
          }),

        // UI state
        setPreviewZoom: (zoom) =>
          set((state) => {
            state.previewZoom = Math.max(0.1, Math.min(5.0, zoom));
          }),

        // Import/Export
        importImage: async (uri, source) => {
          try {
            const dimensions = await getImageDimensions(uri);
            const imageData: ImageData = {
              id: generateId(),
              uri,
              width: dimensions.width,
              height: dimensions.height,
              mimeType: uri.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              createdAt: Date.now(),
              source,
            };

            return imageData;
          } catch (error) {
            throw new Error(`Failed to import image: ${(error as Error).message}`);
          }
        },

        exportImage: async (image) => {
          // This would integrate with Expo FileSystem for actual file export
          // For now, return the base64 URI
          return image.uri;
        },

        // Utility actions
        reset: () =>
          set((state) => {
            Object.assign(state, defaultState);
          }),
      })),
      {
        name: 'image-store',
        // Don't persist actual image data, only settings
        partialize: (state) => ({
          brushSize: state.brushSize,
          showMask: state.showMask,
          previewZoom: state.previewZoom,
        }),
      },
    ),
    {
      name: 'image-store',
    },
  ),
);
