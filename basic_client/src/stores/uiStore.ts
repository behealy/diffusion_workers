import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// UI Modal types
export type ModalType = 
  | 'none'
  | 'lora-editor'
  | 'controlnet-editor'
  | 'modifier-selector'
  | 'image-picker'
  | 'settings'
  | 'help';

export interface ModalData {
  type: ModalType;
  data?: any; // Modal-specific data (e.g., index for editing existing items)
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Layout types
export type LayoutOrientation = 'portrait' | 'landscape';
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface UIState {
  // Modal management
  currentModal: ModalData;
  modalHistory: ModalType[];
  
  // Theme and appearance
  themeMode: ThemeMode;
  
  // Layout and responsive
  screenSize: ScreenSize;
  orientation: LayoutOrientation;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Panel visibility (for larger screens)
  panelVisibility: {
    inputPanel: boolean;
    outputPanel: boolean;
    controlPanel: boolean;
    modifierPanel: boolean;
  };
  
  // Loading and feedback
  isLoading: boolean;
  loadingMessage: string;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
  }>;
  
  // App state
  isOnline: boolean;
  isBackground: boolean;
  
  // Keyboard and input
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  
  // Accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  textScale: number;
}

export interface UIActions {
  // Modal management
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  goBackModal: () => void;
  
  // Theme management
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Layout management
  setScreenSize: (size: ScreenSize) => void;
  setOrientation: (orientation: LayoutOrientation) => void;
  setSafeAreaInsets: (insets: Partial<UIState['safeAreaInsets']>) => void;
  
  // Panel visibility
  togglePanel: (panel: keyof UIState['panelVisibility']) => void;
  setPanelVisibility: (panel: keyof UIState['panelVisibility'], visible: boolean) => void;
  resetPanelVisibility: () => void;
  
  // Loading states
  setLoading: (isLoading: boolean, message?: string) => void;
  
  // Toast management
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // App state
  setOnlineStatus: (isOnline: boolean) => void;
  setBackgroundStatus: (isBackground: boolean) => void;
  
  // Keyboard management
  setKeyboardVisible: (visible: boolean, height?: number) => void;
  
  // Accessibility
  setReduceMotion: (reduce: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setTextScale: (scale: number) => void;
  
  // Utility actions
  reset: () => void;
}

export type UIStore = UIState & UIActions;

// Default state
const defaultState: UIState = {
  currentModal: { type: 'none' },
  modalHistory: [],
  themeMode: 'system',
  screenSize: 'mobile',
  orientation: 'portrait',
  safeAreaInsets: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panelVisibility: {
    inputPanel: true,
    outputPanel: true,
    controlPanel: true,
    modifierPanel: true,
  },
  isLoading: false,
  loadingMessage: '',
  toasts: [],
  isOnline: true,
  isBackground: false,
  isKeyboardVisible: false,
  keyboardHeight: 0,
  reduceMotion: false,
  highContrast: false,
  textScale: 1.0,
};

// Utility function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...defaultState,
        
        // Modal management
        openModal: (type, data) => set((state) => {
          if (state.currentModal.type !== 'none') {
            state.modalHistory.push(state.currentModal.type);
          }
          state.currentModal = { type, data };
        }),
        
        closeModal: () => set((state) => {
          state.currentModal = { type: 'none' };
          state.modalHistory = [];
        }),
        
        goBackModal: () => set((state) => {
          const previousModal = state.modalHistory.pop();
          if (previousModal) {
            state.currentModal = { type: previousModal };
          } else {
            state.currentModal = { type: 'none' };
          }
        }),
        
        // Theme management
        setThemeMode: (mode) => set((state) => {
          state.themeMode = mode;
        }),
        
        toggleTheme: () => set((state) => {
          const currentMode = state.themeMode;
          if (currentMode === 'system') {
            state.themeMode = 'light';
          } else if (currentMode === 'light') {
            state.themeMode = 'dark';
          } else {
            state.themeMode = 'light';
          }
        }),
        
        // Layout management
        setScreenSize: (size) => set((state) => {
          state.screenSize = size;
          
          // Auto-adjust panel visibility based on screen size
          if (size === 'mobile') {
            // On mobile, show only one panel at a time typically
            // This is just a default - user can still override
          } else if (size === 'tablet') {
            // On tablet, show most panels
            Object.keys(state.panelVisibility).forEach(key => {
              state.panelVisibility[key as keyof typeof state.panelVisibility] = true;
            });
          } else {
            // On desktop, show all panels
            Object.keys(state.panelVisibility).forEach(key => {
              state.panelVisibility[key as keyof typeof state.panelVisibility] = true;
            });
          }
        }),
        
        setOrientation: (orientation) => set((state) => {
          state.orientation = orientation;
        }),
        
        setSafeAreaInsets: (insets) => set((state) => {
          state.safeAreaInsets = { ...state.safeAreaInsets, ...insets };
        }),
        
        // Panel visibility
        togglePanel: (panel) => set((state) => {
          state.panelVisibility[panel] = !state.panelVisibility[panel];
        }),
        
        setPanelVisibility: (panel, visible) => set((state) => {
          state.panelVisibility[panel] = visible;
        }),
        
        resetPanelVisibility: () => set((state) => {
          state.panelVisibility = defaultState.panelVisibility;
        }),
        
        // Loading states
        setLoading: (isLoading, message = '') => set((state) => {
          state.isLoading = isLoading;
          state.loadingMessage = message;
        }),
        
        // Toast management
        addToast: (toast) => set((state) => {
          const toastWithId = {
            ...toast,
            id: generateId(),
          };
          state.toasts.push(toastWithId);
          
          // Auto-remove toast after duration (if specified)
          if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
              get().removeToast(toastWithId.id);
            }, toast.duration);
          }
        }),
        
        removeToast: (id) => set((state) => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
        }),
        
        clearToasts: () => set((state) => {
          state.toasts = [];
        }),
        
        // App state
        setOnlineStatus: (isOnline) => set((state) => {
          state.isOnline = isOnline;
        }),
        
        setBackgroundStatus: (isBackground) => set((state) => {
          state.isBackground = isBackground;
        }),
        
        // Keyboard management
        setKeyboardVisible: (visible, height = 0) => set((state) => {
          state.isKeyboardVisible = visible;
          state.keyboardHeight = height;
        }),
        
        // Accessibility
        setReduceMotion: (reduce) => set((state) => {
          state.reduceMotion = reduce;
        }),
        
        setHighContrast: (highContrast) => set((state) => {
          state.highContrast = highContrast;
        }),
        
        setTextScale: (scale) => set((state) => {
          state.textScale = Math.max(0.5, Math.min(2.0, scale));
        }),
        
        // Utility actions
        reset: () => set((state) => {
          Object.assign(state, defaultState);
        }),
      })),
      {
        name: 'ui-store',
        // Persist user preferences but not transient state
        partialize: (state) => ({
          themeMode: state.themeMode,
          panelVisibility: state.panelVisibility,
          reduceMotion: state.reduceMotion,
          highContrast: state.highContrast,
          textScale: state.textScale,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);