import React, { useState, useRef, useCallback } from 'react';
import { Alert, View, Text } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Image as SkiaImage,
  useImage,
  Paint,
  PaintStyle,
  BlendMode,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as DocumentPicker from 'expo-document-picker';
import { Slider } from '@/components/widgets'

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  path: string;
  brushSize: number;
}

interface InputImagePanelProps {
  onImageChange?: (imageUri: string | null) => void;
  onMaskChange?: (maskBase64: string | null) => void;
}

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;

const InputImagePanel: React.FC<InputImagePanelProps> = ({
  onImageChange,
  onMaskChange,
}) => {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useCanvasRef();
  const currentPath = useRef<string>('');
  
  // Load the selected image for Skia rendering
  const skiaImage = useImage(selectedImageUri);

  const selectImage = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        onImageChange?.(asset.uri);
        // Clear existing strokes when new image is selected
        setStrokes([]);
        onMaskChange?.(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error('Image selection error:', error);
    }
  }, [onImageChange, onMaskChange]);

  const clearImage = useCallback(() => {
    setSelectedImageUri(null);
    setStrokes([]);
    onImageChange?.(null);
    onMaskChange?.(null);
  }, [onImageChange, onMaskChange]);

  const clearMask = useCallback(() => {
    setStrokes([]);
    onMaskChange?.(null);
  }, [onMaskChange]);

  const exportMask = useCallback(async () => {
    if (strokes.length === 0) {
      onMaskChange?.(null);
      return;
    }

    try {
      // Create a new surface for the mask
      const surface = Skia.Surface.MakeOffscreen(CANVAS_WIDTH, CANVAS_HEIGHT);
      if (!surface) {
        throw new Error('Failed to create surface');
      }

      const canvas = surface.getCanvas();
      
      // Fill with transparent background
      canvas.clear(Skia.Color('transparent'));
      
      // Create paint for mask strokes (white on transparent)
      const paint = Skia.Paint();
      paint.setStyle(PaintStyle.Stroke);
      paint.setAntiAlias(true);
      paint.setColor(Skia.Color('white'));

      // Draw all strokes
      strokes.forEach((stroke) => {
        const path = Skia.Path.MakeFromSVGString(stroke.path);
        if (path) {
          paint.setStrokeWidth(stroke.brushSize);
          canvas.drawPath(path, paint);
        }
      });

      // Get image data and convert to base64
      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...data));
      const base64WithPrefix = `data:image/png;base64,${base64}`;
      
      onMaskChange?.(base64WithPrefix);
    } catch (error) {
      console.error('Failed to export mask:', error);
      Alert.alert('Error', 'Failed to export mask');
    }
  }, [strokes, onMaskChange]);

  const drawingGesture = Gesture.Pan()
    .onStart((event) => {
      setIsDrawing(true);
      const newPath = Skia.Path.Make();
      newPath.moveTo(event.x, event.y);
      currentPath.current = newPath.toSVGString();
    })
    .onUpdate((event) => {
      if (isDrawing) {
        const path = Skia.Path.MakeFromSVGString(currentPath.current);
        if (path) {
          path.lineTo(event.x, event.y);
          currentPath.current = path.toSVGString();
          
          // Update the current stroke in real-time
          setStrokes((prev) => {
            const newStrokes = [...prev];
            if (newStrokes.length > 0 && newStrokes[newStrokes.length - 1].path === currentPath.current) {
              // Update existing stroke
              newStrokes[newStrokes.length - 1] = {
                path: currentPath.current,
                brushSize,
              };
            } else {
              // Add new stroke
              newStrokes.push({
                path: currentPath.current,
                brushSize,
              });
            }
            return newStrokes;
          });
        }
      }
    })
    .onEnd(() => {
      setIsDrawing(false);
      exportMask();
    });

  const renderCanvas = () => (
    <View
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <GestureDetector gesture={drawingGesture}>
        <Canvas
          ref={canvasRef}
          style={{ flex: 1 }}
        >
          {/* Render the selected image */}
          {skiaImage && (
            <SkiaImage
              image={skiaImage}
              fit="contain"
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            />
          )}
          
          {/* Render mask strokes */}
          {strokes.map((stroke, index) => {
            const path = Skia.Path.MakeFromSVGString(stroke.path);
            if (!path) return null;
            
            return (
              <Path
                key={index}
                path={path}
                style="stroke"
                strokeWidth={stroke.brushSize}
                color="rgba(0, 0, 0, 0.5)"
                strokeCap="round"
                strokeJoin="round"
              />
            );
          })}
        </Canvas>
      </GestureDetector>
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: '#ff0',
      }}
    >
      <Text style={{ color: "red" }}>
        Input Image Panel
      </Text> 
      

      {/* Canvas */}
      {/* {renderCanvas()} */}
        

    </View>
  );
};

export default InputImagePanel;