import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { ImageGenerationResponse, OpStatus } from '../lib/ezdiffusion';

export interface HistoryListItem extends ImageGenerationResponse {
  // Adding any additional properties that might be in the local store
  generationState?: OpStatus;
  progress?: number;
}

export interface HistoryListComponentProps {
  /** Array of generation history items to display */
  items: HistoryListItem[];
  /** Callback when an item is pressed */
  onItemPress: (item: HistoryListItem) => void;
  /** Optional loading state for the entire list */
  isLoading?: boolean;
  /** Optional empty state message */
  emptyMessage?: string;
}

interface HistoryListItemComponentProps {
  status: OpStatus;
  promptText: string;
  statusText: string;
  detailsText: string;
  imageSource: ImageSourcePropType | null;
  onPress: () => void;
}

const HistoryListItemComponent: React.FC<HistoryListItemComponentProps> = ({
  status,
  promptText,
  statusText,
  detailsText,
  imageSource,
  onPress,
}) => {
  const isLoading = status === OpStatus.Pending || status === OpStatus.Queued || status === OpStatus.InProgress;
  const isFailed = status === OpStatus.Failure;

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        isFailed && styles.itemFailed,
        isLoading && styles.itemLoading,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image thumbnail */}
      <View style={styles.thumbnailContainer}>
        {isLoading ? (
          <View style={styles.thumbnailPlaceholder}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : isFailed ? (
          <View style={[styles.thumbnailPlaceholder, styles.thumbnailFailed]}>
            <Text style={styles.failedIcon}>⚠️</Text>
          </View>
        ) : imageSource ? (
          <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderIcon}>🖼️</Text>
          </View>
        )}
      </View>

      {/* Text content - 3 rows */}
      <View style={styles.textContainer}>
        {/* Row 1: Prompt */}
        <Text style={[styles.promptText, isFailed && styles.failedText]} numberOfLines={1}>
          {promptText}
        </Text>

        {/* Row 2: Status */}
        <Text style={[styles.statusText, isFailed && styles.failedStatusText]}>
          {statusText}
        </Text>

        {/* Row 3: Details */}
        <Text style={[styles.detailsText, isFailed && styles.failedText]} numberOfLines={1}>
          {detailsText}
        </Text>
      </View>

      {/* Loading indicator overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const HistoryList: React.FC<HistoryListComponentProps> = ({
  items,
  onItemPress,
  isLoading = false,
  emptyMessage = 'No generation history yet',
}) => {
  // Helper function to process items into the format needed by HistoryListItemComponent
  const processItem = (item: HistoryListItem) => {
    const status = item.status || item.generationState || OpStatus.Pending;
    
    // Format prompt text
    const promptText = (() => {
      const prompt = item.input.prompt;
      return prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt;
    })();

    // Format status text
    const statusText = (() => {
      switch (status) {
        case OpStatus.Pending:
          return 'Pending...';
        case OpStatus.Queued:
          return 'Queued';
        case OpStatus.InProgress:
          return 'Generating...';
        case OpStatus.Success:
          return 'Completed';
        case OpStatus.Failure:
          return 'Failed';
        default:
          return 'Unknown';
      }
    })();

    // Format details text
    const detailsText = (() => {
      const { dimensions, inferenceSteps, guidanceScale } = item.input;
      return `${dimensions?.width || 512}×${dimensions?.height || 512} • ${inferenceSteps || 50} steps • Scale ${guidanceScale || 7.5}`;
    })();

    // Determine image source
    const imageSource = (() => {
      const isCompleted = status === OpStatus.Success;
      if (isCompleted && item.result?.source) {
        // Handle both base64 and URL sources
        if (item.result.source.startsWith('data:')) {
          return { uri: item.result.source };
        } else if (item.result.source.startsWith('http')) {
          return { uri: item.result.source };
        } else {
          // Assume it's a base64 string without prefix
          return { uri: `data:image/png;base64,${item.result.source}` };
        }
      }
      return null;
    })();

    return {
      status,
      promptText,
      statusText,
      detailsText,
      imageSource,
    };
  };

  const renderItem = ({ item }: { item: HistoryListItem }) => {
    const processedItem = processItem(item);
    return (
      <HistoryListItemComponent
        {...processedItem}
        onPress={() => onItemPress(item)}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      <Text style={styles.emptySubtext}>Generate an image to see your history here</Text>
    </View>
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.jobId}
      style={styles.container}
      contentContainerStyle={items.length === 0 ? styles.emptyContentContainer : undefined}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  itemLoading: {
    opacity: 0.7,
  },
  itemFailed: {
    backgroundColor: '#FFEBEE',
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  thumbnailFailed: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  failedIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  failedStatusText: {
    color: '#F44336',
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
  },
  failedText: {
    color: '#666',
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});