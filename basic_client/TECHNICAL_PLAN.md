# EZ Diffusion Client - Technical Planning Document

## Executive Summary

This document outlines the technical architecture, technology stack, and
implementation plan for building a cross-platform client application for the EZ
Diffusion API. The client will support text-to-image, image-to-image, and
inpainting generation with advanced features like mask drawing, LoRA adapters,
and ControlNet integration.

## Technology Stack Decision

### Primary Framework: React Native + Expo

**Rationale**: Chosen for excellent cross-platform support (web, iOS, Android,
desktop) with single codebase, strong ecosystem, and seamless integration with
our requirements.

### Core Dependencies

| Library                          | Version  | Purpose                   | Key Benefits                                              |
| -------------------------------- | -------- | ------------------------- | --------------------------------------------------------- |
| **Expo**                         | ~51.0.0  | Cross-platform framework  | File-based routing, easy deployment, universal APIs       |
| **React Native Skia**            | ^1.3.0   | Graphics & Canvas Drawing | GPU-accelerated drawing, image masking, 60fps performance |
| **Tamagui**                      | ^1.112.0 | UI Component Library      | Performance-focused, web compatibility, utility styling   |
| **Expo Router**                  | ~3.5.0   | Navigation                | File-based routing, web support, simplified setup         |
| **React Native Reanimated**      | ~3.10.0  | Animations                | Works with Skia, smooth interactions                      |
| **React Native Gesture Handler** | ~2.16.0  | Touch Interactions        | Canvas drawing gestures, pan/pinch                        |
| **Zustand**                      | ^4.5.0   | State Management          | Lightweight, modern, TypeScript-friendly                  |
| **React Hook Form**              | ^7.53.0  | Form Management           | Performance, validation for generation controls           |

### Additional Libraries

- **Expo Document Picker**: File selection from device
- **Expo File System**: Image handling and base64 conversion
- **React Native Safe Area Context**: Cross-platform safe areas
- **EZ Diffusion Client**: Existing OpenAPI-generated client

## Architecture Overview

### Clean Architecture Implementation

```
├── src/
|   |-- lib/                  # local lib code
│   ├── components/           # Reusable UI components (stateless)
│   ├── screens/             # Screen-level components
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   ├── services/            # API integration layer
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript definitions
│   └── constants/           # App constants
├── app/                     # Expo Router file-based routing
└── assets/                  # Static assets
```

### State Management Strategy

- **Global State**: Zustand stores for generation parameters, images, modifiers
- **Local State**: React Hook Form for complex forms, React state for UI
  interactions
- **Async State**: React Query patterns integrated with Zustand

### Component Architecture

- **Stateless Components**: Pure UI components receiving props
- **Stateful Wrappers**: Custom hooks and store integrations
- **Screen Components**: Route-level components coordinating multiple features

## Detailed Implementation Plan

### Phase 1: Project Setup & Core Infrastructure (Tasks 1-7)

#### Task 1: Initialize Expo Project

- [x] Create new Expo project with TypeScript template
- [x] Configure `app.config.js` for multi-platform deployment
- [x] Set up development scripts and environment configuration
- [x] Configure Metro bundler for Skia support

#### Task 2: Install and Configure Dependencies

- [x] Install all core dependencies from technology stack
- [x] Configure Tamagui with custom theme configuration
- [x] Set up React Native Skia platform-specific setup
- [x] Configure TypeScript with strict mode

<!-- Task 3 not needed anymore -->
<!-- #### Task 3: Project Structure Setup
- [ ] Create directory structure following Clean Architecture
- [ ] Create index files for clean imports
- [ ] Set up ESLint and Prettier configuration -->

#### Task 4: OpenAPI Client Integration
- [ ] Use generated client code and typescript types in
      basic_client/src/lib/ezdiffusion (you will have to run the ./build.sh
      project to ensure this code is generated there first)
- [ ] Create API service layer wrapping the client
- [ ] Set up environment-based API endpoint configuration

#### Task 5: Base Layout and Navigation
- [ ] Set up Expo Router file structure
- [ ] Create base layout with responsive design
- [ ] Implement navigation structure for main screen
- [ ] Set up safe area handling for all platforms

#### Task 6: Theme and Design System

- [ ] Configure Tamagui theme with custom colors and spacing
- [ ] Create design tokens for consistent styling
- [ ] Set up responsive breakpoints for different screen sizes
- [ ] Create base component variants (buttons, inputs, etc.)

#### Task 7: State Management Foundation

- [ ] Create Zustand stores for each major feature area
- [ ] Set up store persistence for user preferences
- [ ] Implement store DevTools integration
- [ ] Create typed hooks for store access

### Phase 2: Core UI Components (Tasks 8-15)

#### Task 8: Input Image Panel Component

- [ ] Create image picker integration with Expo Document Picker
- [ ] Implement image display with proper aspect ratio handling
- [ ] Build image preview component with zoom/pan capabilities
- [ ] Add file validation and error handling

#### Task 9: Canvas Mask Drawing System

- [ ] Integrate React Native Skia canvas component
- [ ] Implement brush drawing with configurable size
- [ ] Create mask overlay system (black mask over image)
- [ ] Add brush size slider control
- [ ] Implement drawing gesture handling with smooth strokes

#### Task 10: Output Image Panel Component

- [ ] Create image display component for generated results
- [ ] Implement "Use as Input" button functionality
- [ ] Add image saving/sharing capabilities
- [ ] Create loading states during generation

#### Task 11: Generation Control Panel

- [ ] Build dynamic form system using React Hook Form
- [ ] Create input components for all generation parameters
- [ ] Implement form validation based on OpenAPI schemas
- [ ] Add parameter presets and quick settings

#### Task 12: Contextual Modal System

- [ ] Create flexible modal container with animations
- [ ] Implement close and save button functionality
- [ ] Add modal backdrop and responsive sizing
- [ ] Create modal content switching system

#### Task 13: Modifier Items List Panel

- [ ] Build scrollable list component for modifiers
- [ ] Create LoRA modifier item component with editable parameters
- [ ] Create ControlNet modifier item with image preview
- [ ] Implement floating "+" button for adding modifiers

#### Task 14: Shared UI Components

- [ ] Create numerical slider with text input component
- [ ] Build consistent button variants and states
- [ ] Implement loading indicators and progress bars
- [ ] Create error boundary components

#### Task 15: Responsive Layout System

- [ ] Implement adaptive layouts for different screen sizes
- [ ] Create breakpoint-based component variations
- [ ] Add orientation change handling
- [ ] Test and refine layouts across all target platforms

### Phase 3: Business Logic Integration (Tasks 16-20)

#### Task 16: Image Processing Pipeline

- [ ] Implement base64 encoding/decoding for API integration
- [ ] Create image optimization for different use cases
- [ ] Add image format validation and conversion
- [ ] Implement mask extraction from canvas

#### Task 17: API Integration Layer

- [ ] Create service methods for each generation endpoint
- [ ] Implement request/response transformation
- [ ] Add error handling and retry logic
- [ ] Create progress tracking for long-running requests

#### Task 18: State Synchronization

- [ ] Connect UI components to Zustand stores
- [ ] Implement automatic form field syncing
- [ ] Add undo/redo functionality for critical actions
- [ ] Create state persistence for app settings

#### Task 19: Advanced Features

- [ ] Implement LoRA parameter management
- [ ] Create ControlNet image preprocessing
- [ ] Add batch processing capabilities
- [ ] Implement generation history tracking

#### Task 20: File System Integration

- [ ] Create image import/export functionality
- [ ] Implement project save/load system
- [ ] Add recent files management
- [ ] Create automatic backup system

### Phase 4: Testing & Optimization (Tasks 21-25)

#### Task 21: Component Testing

- [ ] Set up React Native Testing Library
- [ ] Write unit tests for pure components
- [ ] Create integration tests for complex interactions
- [ ] Add snapshot testing for UI consistency

#### Task 22: Performance Optimization

- [ ] Implement React.memo for expensive components
- [ ] Optimize Skia canvas rendering performance
- [ ] Add image lazy loading and caching
- [ ] Profile and optimize state updates

#### Task 23: Cross-Platform Testing

- [ ] Test on iOS devices and simulators
- [ ] Test on Android devices and emulators
- [ ] Test web deployment and functionality
- [ ] Verify desktop functionality with Expo

#### Task 24: User Experience Polish

- [ ] Add haptic feedback for mobile interactions
- [ ] Implement keyboard shortcuts for desktop/web
- [ ] Create onboarding and tutorial flow
- [ ] Add accessibility improvements

#### Task 25: Deployment Preparation

- [ ] Configure build settings for each platform
- [ ] Set up CI/CD pipeline with GitHub Actions
- [ ] Create app store assets and metadata
- [ ] Prepare web deployment configuration

## Technical Specifications

### Canvas Drawing Implementation

```typescript
// Core drawing functionality using Skia
interface DrawingState {
  paths: SkPath[];
  currentPath: SkPath | null;
  brushSize: number;
  isDrwing: boolean;
  mask: SkImage | null;
}

// Mask overlay system
const MaskCanvas: React.FC<Props> = ({ image, onMaskChange }) => {
  // Skia canvas with gesture handling
  // Real-time mask generation
  // Export mask as base64 for API
};
```

### State Management Structure

```typescript
// Generation parameters store
interface GenerationStore {
  prompt: string;
  negativePrompt: string;
  dimensions: ImageDimensions;
  controlNets: ControlNetParams[];
  loras: LoraParams[];
  // ... other parameters
}

// Image management store
interface ImageStore {
  inputImage: string | null;
  outputImage: string | null;
  mask: string | null;
  history: GenerationResult[];
}
```

### API Integration Pattern

```typescript
// Service layer wrapping OpenAPI client
class DiffusionService {
  async generateImage(params: GenerationParams): Promise<ImageResult> {
    // Transform UI state to API format
    // Handle different generation modes
    // Process response and update stores
  }
}
```

## Development Guidelines

### Code Quality Standards

- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Testing**: 80%+ test coverage for business logic
- **Performance**: 60fps target for all interactions
- **Accessibility**: WCAG 2.1 AA compliance

### Platform Considerations

- **iOS**: Native look and feel, proper safe area handling
- **Android**: Material Design alignment, back button handling
- **Web**: Keyboard navigation, responsive breakpoints
- **Desktop**: Mouse interactions, window management

### Success Criteria

1. **Performance**: Smooth 60fps drawing on all target devices
2. **Usability**: Intuitive interface requiring minimal learning
3. **Reliability**: Robust error handling and offline capabilities
4. **Maintainability**: Clean, documented, testable codebase
5. **Cross-platform**: Consistent experience across all platforms

## Next Steps

1. **Immediate**: Begin Phase 1 implementation starting with Task 1
2. **Week 1-2**: Complete project setup and core infrastructure
3. **Week 3-4**: Build foundational UI components
4. **Week 5-6**: Integrate business logic and API connections
5. **Week 7**: Testing, optimization, and deployment preparation

This plan provides a comprehensive roadmap for building a production-ready,
cross-platform image generation client that meets all functional and
non-functional requirements while following modern development best practices.
