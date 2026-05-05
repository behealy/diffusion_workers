import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';

export interface SliderProps {
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
}

export const Slider: React.FC<SliderProps> = ({
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
}) => {
  const [inputValue, setInputValue] = React.useState(
    value?.toString() || defaultValue.toString(),
  );

  // Handle slider value change
  const handleSliderChange = React.useCallback(
    (newValue: number) => {
      onValueChange(newValue);
      setInputValue(newValue.toString());
    },
    [onValueChange],
  );

  // Handle input change
  const handleInputChange = React.useCallback(
    (text: string) => {
      setInputValue(text);

      const numValue = parseFloat(text);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onValueChange(clampedValue);
      }
    },
    [min, max, onValueChange],
  );

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
    setInputValue(value?.toString() || defaultValue.toString());
  }, [value, defaultValue]);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.sliderRow}>
        <RNSlider
          style={styles.slider}
          value={value ?? defaultValue}
          onValueChange={handleSliderChange}
          minimumValue={min}
          maximumValue={max}
          step={step}
          disabled={disabled}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#E5E5EA"
        />

        {showInput && (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            editable={!disabled}
            keyboardType="numeric"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
    marginRight: 12,
  },
  thumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
  },
});

Slider.displayName = 'Slider';
