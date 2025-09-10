import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Slider } from './widgets/Slider';

export interface GenerationParamsPanelProps {
  /** Text prompt describing the desired image */
  prompt: string;
  onPromptChange: (value: string) => void;
  
  /** Negative prompt to avoid unwanted elements */
  negativePrompt?: string;
  onNegativePromptChange: (value: string) => void;
  
  /** HuggingFace model identifier to use for generation */
  baseModel?: string;
  onBaseModelChange: (value: string) => void;
  
  /** How closely to follow the prompt (0.0-20.0, default 7.5) */
  guidanceScale: number;
  onGuidanceScaleChange: (value: number) => void;
  
  /** Number of denoising steps (1-100, default 50) */
  inferenceSteps: number;
  onInferenceStepsChange: (value: number) => void;
  
  /** Random seed for reproducible generation */
  seed?: number;
  onSeedChange: (value: number | undefined) => void;
  
  /** Output image dimensions */
  width: number;
  height: number;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  
  /** Pipeline optimization settings */
  useDeepCache: boolean;
  onUseDeepCacheChange: (value: boolean) => void;
  
  deepCacheInterval: number;
  onDeepCacheIntervalChange: (value: number) => void;
  
  deepCacheBranchId: number;
  onDeepCacheBranchIdChange: (value: number) => void;
  
  useTorchCompile: boolean;
  onUseTorchCompileChange: (value: boolean) => void;
  
  /** Handler for starting image generation */
  onStartGeneration: () => void;
}

export const GenerationParamsPanel: React.FC<GenerationParamsPanelProps> = ({
  prompt,
  onPromptChange,
  negativePrompt = '',
  onNegativePromptChange,
  baseModel = '',
  onBaseModelChange,
  guidanceScale,
  onGuidanceScaleChange,
  inferenceSteps,
  onInferenceStepsChange,
  seed,
  onSeedChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  useDeepCache,
  onUseDeepCacheChange,
  deepCacheInterval,
  onDeepCacheIntervalChange,
  deepCacheBranchId,
  onDeepCacheBranchIdChange,
  useTorchCompile,
  onUseTorchCompileChange,
  onStartGeneration,
}) => {
  const handleSeedChange = (text: string) => {
    if (text === '') {
      onSeedChange(undefined);
    } else {
      const numValue = parseInt(text, 10);
      if (!isNaN(numValue)) {
        onSeedChange(numValue);
      }
    }
  };

  const handleWidthChange = (text: string) => {
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onWidthChange(numValue);
    }
  };

  const handleHeightChange = (text: string) => {
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onHeightChange(numValue);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Generation Parameters</Text>
      
      {/* Prompt */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Prompt *</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={prompt}
          onChangeText={onPromptChange}
          placeholder="A beautiful landscape with mountains and lakes, highly detailed"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Negative Prompt */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Negative Prompt</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={negativePrompt}
          onChangeText={onNegativePromptChange}
          placeholder="blurry, low quality, distorted"
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Base Model */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Base Model</Text>
        <TextInput
          style={styles.textInput}
          value={baseModel}
          onChangeText={onBaseModelChange}
          placeholder="stabilityai/stable-diffusion-xl-base-1.0"
        />
      </View>

      {/* Guidance Scale - Using Slider */}
      <View style={styles.fieldContainer}>
        <Slider
          label="Guidance Scale"
          value={guidanceScale}
          onValueChange={onGuidanceScaleChange}
          min={0.0}
          max={20.0}
          step={0.1}
          showInput={true}
        />
      </View>

      {/* Inference Steps - Using Slider */}
      <View style={styles.fieldContainer}>
        <Slider
          label="Inference Steps"
          value={inferenceSteps}
          onValueChange={onInferenceStepsChange}
          min={1}
          max={100}
          step={1}
          showInput={true}
        />
      </View>

      {/* Seed */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Seed</Text>
        <TextInput
          style={styles.textInput}
          value={seed?.toString() || ''}
          onChangeText={handleSeedChange}
          placeholder="Random (leave empty)"
          keyboardType="numeric"
        />
      </View>

      {/* Dimensions */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Dimensions</Text>
        <View style={styles.dimensionsContainer}>
          <View style={styles.dimensionField}>
            <Text style={styles.dimensionLabel}>Width</Text>
            <TextInput
              style={styles.dimensionInput}
              value={width.toString()}
              onChangeText={handleWidthChange}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.dimensionSeparator}>×</Text>
          <View style={styles.dimensionField}>
            <Text style={styles.dimensionLabel}>Height</Text>
            <TextInput
              style={styles.dimensionInput}
              value={height.toString()}
              onChangeText={handleHeightChange}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Pipeline Optimizations Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pipeline Optimizations</Text>
        
        {/* Use DeepCache */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Use DeepCache</Text>
          <Switch
            value={useDeepCache}
            onValueChange={onUseDeepCacheChange}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={useDeepCache ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        {/* DeepCache Interval - only show if DeepCache is enabled */}
        {useDeepCache && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>DeepCache Interval</Text>
            <TextInput
              style={styles.textInput}
              value={deepCacheInterval.toString()}
              onChangeText={(text) => {
                const numValue = parseInt(text, 10);
                if (!isNaN(numValue) && numValue > 0) {
                  onDeepCacheIntervalChange(numValue);
                }
              }}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* DeepCache Branch ID - only show if DeepCache is enabled */}
        {useDeepCache && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>DeepCache Branch ID</Text>
            <TextInput
              style={styles.textInput}
              value={deepCacheBranchId.toString()}
              onChangeText={(text) => {
                const numValue = parseInt(text, 10);
                if (!isNaN(numValue) && numValue >= 0) {
                  onDeepCacheBranchIdChange(numValue);
                }
              }}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Use Torch Compile */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Use Torch Compile</Text>
          <Switch
            value={useTorchCompile}
            onValueChange={onUseTorchCompileChange}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={useTorchCompile ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>

      {/* Generate Button */}
      <View style={styles.generateButtonContainer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            prompt.trim().length === 0 && styles.generateButtonDisabled
          ]}
          onPress={onStartGeneration}
          disabled={prompt.trim().length === 0}
        >
          <Text style={[
            styles.generateButtonText,
            prompt.trim().length === 0 && styles.generateButtonTextDisabled
          ]}>
            Generate Image
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionField: {
    flex: 1,
  },
  dimensionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  dimensionInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000',
    textAlign: 'center',
  },
  dimensionSeparator: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 16,
    color: '#666',
  },
  sectionContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  generateButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateButtonTextDisabled: {
    color: '#999999',
  },
});