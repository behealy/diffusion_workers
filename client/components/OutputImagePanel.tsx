import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

export interface OutputImagePanelProps {
  /** The generated image URI to display */
  imageUri?: string;
  /** Whether image generation is currently in progress */
  isLoading?: boolean;
  /** Callback when user wants to use the output image as input */
  onUseAsInput?: (imageUri: string) => void;
  /** Loading progress text */
  loadingText?: string;
}

export const OutputImagePanel: React.FC<OutputImagePanelProps> = ({
  imageUri,
  isLoading = false,
  onUseAsInput,
  loadingText = 'Generating image...',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageSize = Math.min(screenWidth - 32, 400); // Max 400px, with 16px margin on each side

  const handleUseAsInput = () => {
    if (imageUri && onUseAsInput) {
      onUseAsInput(imageUri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generated Image</Text>
      
      <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No image generated yet</Text>
            <Text style={styles.placeholderSubtext}>
              Generate an image to see it here
            </Text>
          </View>
        )}
      </View>

      {/* Use as Input Button - only show if we have an image and not loading */}
      {imageUri && !isLoading && (
        <TouchableOpacity
          style={styles.useAsInputButton}
          onPress={handleUseAsInput}
          activeOpacity={0.7}
        >
          <Text style={styles.useAsInputButtonText}>Use as Input</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  useAsInputButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  useAsInputButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});