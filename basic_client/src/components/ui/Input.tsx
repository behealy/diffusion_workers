import React from 'react';
import { styled, Text, Stack, StackProps } from '@tamagui/core';

// Simple Input placeholder - will be refined later
const StyledInput = styled(Stack, {
  name: 'Input',
  borderRadius: '$md',
  borderWidth: 1,
  borderColor: '$color6',
  backgroundColor: '$color1',
  paddingHorizontal: '$md',
  height: 40,
});

export interface InputProps extends StackProps {
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export const Input = React.forwardRef<
  React.ElementRef<typeof StyledInput>,
  InputProps
>(({ ...props }, ref) => {
  return <StyledInput ref={ref} {...props} />;
});

Input.displayName = 'Input';