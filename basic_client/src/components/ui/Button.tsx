import React from 'react';
import { styled, Stack, StackProps, Text } from '@tamagui/core';
import { semanticColors, sizes } from '../../constants/tokens';

// Simple Button implementation using Stack
const StyledButton = styled(Stack, {
  name: 'Button',
  borderRadius: '$md',
  fontWeight: '$medium',
  cursor: 'pointer',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
  backgroundColor: '$primary9',
  color: '$white12',
  
  variants: {
    size: {
      sm: {
        height: sizes.button.sm.height,
        paddingHorizontal: sizes.button.sm.paddingHorizontal,
      },
      md: {
        height: sizes.button.md.height,
        paddingHorizontal: sizes.button.md.paddingHorizontal,
      },
      lg: {
        height: sizes.button.lg.height,
        paddingHorizontal: sizes.button.lg.paddingHorizontal,
      },
    },
  },
  
  defaultVariants: {
    size: 'md',
  },
});

export interface ButtonProps extends StackProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<
  React.ElementRef<typeof StyledButton>,
  ButtonProps
>(({ children, ...props }, ref) => {
  return (
    <StyledButton ref={ref} {...props}>
      <Text>{children}</Text>
    </StyledButton>
  );
});

Button.displayName = 'Button';