import { Pressable, StyleSheet, Text } from 'react-native';
import { fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useTheme } from '../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Visually dims and blocks presses — used to hold "Next" until a quiz is answered (T-044). */
  disabled?: boolean;
}

// Pill button (docs/01): primary = clay filled, secondary = outlined emerald. 44px touch target.
export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const { colors } = useTheme();
  const filled = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: filled ? colors.action : 'transparent',
          borderColor: filled ? colors.action : colors.primary,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: filled ? lightColors.bg : colors.primary, fontFamily: fontFamily.arabicBody },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize.title,
    textAlign: 'center',
  },
});
