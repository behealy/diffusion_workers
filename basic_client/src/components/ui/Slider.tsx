import React from 'react';
import { Slider as TamaguiSlider, SliderProps as TamaguiSliderProps, XStack, YStack, Text, styled } from '@tamagui/core';
import { Input } from './Input';
import { semanticColors } from '../../constants/tokens';

// Custom styled Slider components
const StyledSlider = styled(TamaguiSlider, {
  name: 'Slider',
  backgroundColor: semanticColors.background.tertiary,
  
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
  },
});

const StyledSliderTrack = styled(TamaguiSlider.Track, {
  backgroundColor: semanticColors.background.tertiary,
  borderRadius: '$full',
  position: 'relative',
});

const StyledSliderTrackActive = styled(TamaguiSlider.TrackActive, {
  backgroundColor: '$primary9',
  borderRadius: '$full',
});

const StyledSliderThumb = styled(TamaguiSlider.Thumb, {
  name: 'SliderThumb',
  size: '$1',
  backgroundColor: '$primary9',
  borderRadius: '$full',
  borderWidth: 2,
  borderColor: '$white12',
  
  hoverStyle: {
    scale: 1.1,
  },
  
  pressStyle: {
    scale: 1.05,
  },
  
  focusStyle: {
    outlineWidth: 2,
    outlineColor: '$primary5',
    outlineOffset: 2,
  },
});

const Label = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: semanticColors.text.primary,
  marginBottom: '$xs',
});

export interface SliderProps extends Omit<TamaguiSliderProps, 'value' | 'onValueChange' | 'defaultValue'> {
  value: number;
  onValueChange: (value: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showInput?: boolean;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  size?: '$1' | '$2' | '$3' | '$4' | '$5';
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof StyledSlider>,
  SliderProps
>(({
  value,
  onValueChange,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  label,
  showInput = true,
  disabled = false,
  formatValue,
  size = '$4',
  ...props
}, ref) => {
  const [inputValue, setInputValue] = React.useState(value?.toString() || defaultValue.toString());
  
  // Convert single value to array for Tamagui Slider (which supports multiple thumbs)
  const sliderValue = [value ?? defaultValue];
  
  // Handle slider value change
  const handleSliderChange = React.useCallback((values: number[]) => {
    const newValue = values[0];
    onValueChange(newValue);
    setInputValue(newValue.toString());
  }, [onValueChange]);
  
  // Handle input change
  const handleInputChange = React.useCallback((text: string) => {
    setInputValue(text);
    
    const numValue = parseFloat(text);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onValueChange(clampedValue);
    }
  }, [min, max, onValueChange]);
  
  // Handle input blur (validate and correct value)
  const handleInputBlur = React.useCallback(() => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setInputValue(value?.toString() || defaultValue.toString());
    } else {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setInputValue(clampedValue.toString());
      if (clampedValue !== value) {
        onValueChange(clampedValue);
      }
    }
  }, [inputValue, value, defaultValue, min, max, onValueChange]);
  
  // Update input value when prop value changes
  React.useEffect(() => {
    if (document.activeElement?.tagName !== 'INPUT') {
      setInputValue(value?.toString() || defaultValue.toString());
    }
  }, [value, defaultValue]);
  
  const displayValue = formatValue ? formatValue(value ?? defaultValue) : inputValue;
  
  return (
    <YStack width="100%" disabled={disabled}>
      {label && <Label>{label}</Label>}
      
      <XStack alignItems="center" gap="$md" width="100%">
        <StyledSlider
          ref={ref}
          size={size}
          value={sliderValue}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          orientation="horizontal"
          flex={1}
          {...props}
        >
          <StyledSliderTrack>
            <StyledSliderTrackActive />
          </StyledSliderTrack>
          <StyledSliderThumb index={0} circular />
        </StyledSlider>
        
        {showInput && (
          <Input
            size="sm"
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            width={80}
            textAlign="center"
          />
        )}
      </XStack>
    </YStack>
  );
});

Slider.displayName = 'Slider';