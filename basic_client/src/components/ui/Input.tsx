import React from 'react';
import { Input as TamaguiInput, InputProps as TamaguiInputProps, styled, Text, XStack, YStack } from '@tamagui/core';
import { semanticColors, sizes } from '../../constants/tokens';

// Styled Input component with design system integration
const StyledInput = styled(TamaguiInput, {
  name: 'Input',
  
  // Base styles
  borderRadius: '$md',
  borderWidth: 1,
  borderColor: semanticColors.border.primary,
  backgroundColor: semanticColors.background.primary,
  color: semanticColors.text.primary,
  fontSize: '$md',
  lineHeight: '$md',
  outlineWidth: 0,
  
  // Focus styles
  focusStyle: {
    borderColor: '$primary9',
    outlineWidth: 2,
    outlineColor: '$primary5',
    outlineOffset: 0,
  },
  
  // Placeholder styles
  placeholderTextColor: semanticColors.text.muted,
  
  variants: {
    size: {
      sm: {
        height: sizes.input.sm.height,
        paddingHorizontal: sizes.input.sm.paddingHorizontal,
        fontSize: '$sm',
      },
      
      md: {
        height: sizes.input.md.height,
        paddingHorizontal: sizes.input.md.paddingHorizontal,
        fontSize: '$md',
      },
      
      lg: {
        height: sizes.input.lg.height,
        paddingHorizontal: sizes.input.lg.paddingHorizontal,
        fontSize: '$lg',
      },
    },
    
    variant: {
      default: {
        borderColor: semanticColors.border.primary,
        backgroundColor: semanticColors.background.primary,
      },
      
      filled: {
        borderColor: 'transparent',
        backgroundColor: semanticColors.background.secondary,
      },
      
      flushed: {
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: semanticColors.border.primary,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
      },
    },
    
    state: {
      error: {
        borderColor: semanticColors.feedback.error,
        focusStyle: {
          borderColor: semanticColors.feedback.error,
          outlineColor: semanticColors.feedback.errorSubtle,
        },
      },
      
      success: {
        borderColor: semanticColors.feedback.success,
        focusStyle: {
          borderColor: semanticColors.feedback.success,
          outlineColor: semanticColors.feedback.successSubtle,
        },
      },
      
      warning: {
        borderColor: semanticColors.feedback.warning,
        focusStyle: {
          borderColor: semanticColors.feedback.warning,
          outlineColor: semanticColors.feedback.warningSubtle,
        },
      },
    },
    
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: semanticColors.background.secondary,
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

const Label = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: semanticColors.text.primary,
  marginBottom: '$xs',
});

const HelperText = styled(Text, {
  fontSize: '$xs',
  marginTop: '$xs',
  
  variants: {
    state: {
      error: {
        color: semanticColors.feedback.error,
      },
      success: {
        color: semanticColors.feedback.success,
      },
      warning: {
        color: semanticColors.feedback.warning,
      },
      default: {
        color: semanticColors.text.muted,
      },
    },
  },
  
  defaultVariants: {
    state: 'default',
  },
});

export interface InputProps extends Omit<TamaguiInputProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  state?: 'error' | 'success' | 'warning';
  label?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<
  React.ElementRef<typeof StyledInput>,
  InputProps
>(({ 
  label, 
  helperText, 
  leftElement, 
  rightElement, 
  state, 
  required,
  ...props 
}, ref) => {
  const hasElements = leftElement || rightElement;
  
  const inputElement = (
    <StyledInput
      ref={ref}
      state={state}
      {...props}
    />
  );
  
  const wrappedInput = hasElements ? (
    <XStack
      alignItems="center"
      position="relative"
      width="100%"
    >
      {leftElement && (
        <XStack
          position="absolute"
          left="$sm"
          zIndex={1}
          pointerEvents="none"
        >
          {leftElement}
        </XStack>
      )}
      
      <StyledInput
        ref={ref}
        state={state}
        paddingLeft={leftElement ? '$xxxl' : undefined}
        paddingRight={rightElement ? '$xxxl' : undefined}
        {...props}
      />
      
      {rightElement && (
        <XStack
          position="absolute"
          right="$sm"
          zIndex={1}
          pointerEvents="none"
        >
          {rightElement}
        </XStack>
      )}
    </XStack>
  ) : inputElement;
  
  if (label || helperText) {
    return (
      <YStack width="100%">
        {label && (
          <Label>
            {label}
            {required && (
              <Text color={semanticColors.feedback.error}> *</Text>
            )}
          </Label>
        )}
        
        {wrappedInput}
        
        {helperText && (
          <HelperText state={state}>
            {helperText}
          </HelperText>
        )}
      </YStack>
    );
  }
  
  return wrappedInput;
});

Input.displayName = 'Input';