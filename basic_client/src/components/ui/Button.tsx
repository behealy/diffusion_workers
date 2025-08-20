import React from 'react';
import { Button as TamaguiButton, ButtonProps as TamaguiButtonProps, styled } from '@tamagui/core';
import { semanticColors, sizes } from '../../constants/tokens';

// Extend Tamagui's Button with our design system variants
const StyledButton = styled(TamaguiButton, {
  name: 'Button',
  
  // Base styles
  borderRadius: '$md',
  fontWeight: '$medium',
  cursor: 'pointer',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
  
  // Disable text selection and outline
  outlineWidth: 0,
  outlineColor: 'transparent',
  
  // Focus ring
  focusStyle: {
    outlineWidth: 2,
    outlineColor: '$primary9',
    outlineOffset: 2,
  },

  // Hover animations
  hoverStyle: {
    scale: 1.02,
  },

  // Press animations  
  pressStyle: {
    scale: 0.98,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: semanticColors.interactive.primary,
        color: '$white12',
        borderWidth: 0,
        
        hoverStyle: {
          backgroundColor: semanticColors.interactive.primaryHover,
        },
        
        pressStyle: {
          backgroundColor: semanticColors.interactive.primaryActive,
        },
      },
      
      secondary: {
        backgroundColor: semanticColors.interactive.secondary,
        color: semanticColors.text.primary,
        borderWidth: 1,
        borderColor: semanticColors.border.primary,
        
        hoverStyle: {
          backgroundColor: semanticColors.interactive.secondaryHover,
        },
        
        pressStyle: {
          backgroundColor: semanticColors.interactive.secondaryActive,
        },
      },
      
      outline: {
        backgroundColor: 'transparent',
        color: semanticColors.text.primary,
        borderWidth: 1,
        borderColor: semanticColors.border.primary,
        
        hoverStyle: {
          backgroundColor: semanticColors.background.secondary,
          borderColor: semanticColors.border.strong,
        },
        
        pressStyle: {
          backgroundColor: semanticColors.background.tertiary,
        },
      },
      
      ghost: {
        backgroundColor: 'transparent',
        color: semanticColors.text.primary,
        borderWidth: 0,
        
        hoverStyle: {
          backgroundColor: semanticColors.background.secondary,
        },
        
        pressStyle: {
          backgroundColor: semanticColors.background.tertiary,
        },
      },
      
      destructive: {
        backgroundColor: semanticColors.feedback.error,
        color: '$white12',
        borderWidth: 0,
        
        hoverStyle: {
          backgroundColor: '$error10',
        },
        
        pressStyle: {
          backgroundColor: '$error11',
        },
      },
    },
    
    size: {
      sm: {
        height: sizes.button.sm.height,
        paddingHorizontal: sizes.button.sm.paddingHorizontal,
        fontSize: '$sm',
      },
      
      md: {
        height: sizes.button.md.height,
        paddingHorizontal: sizes.button.md.paddingHorizontal,
        fontSize: '$md',
      },
      
      lg: {
        height: sizes.button.lg.height,
        paddingHorizontal: sizes.button.lg.paddingHorizontal,
        fontSize: '$lg',
      },
    },
    
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps extends Omit<TamaguiButtonProps, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<
  React.ElementRef<typeof StyledButton>,
  ButtonProps
>(({ children, loading, leftIcon, rightIcon, disabled, ...props }, ref) => {
  return (
    <StyledButton
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        // TODO: Add a loading spinner component
        'Loading...'
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';