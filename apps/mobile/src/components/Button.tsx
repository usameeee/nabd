import { Pressable, StyleSheet, Text } from 'react-native';
import { fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useTheme } from '../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
}

// Pill button (docs/01): primary = clay filled, secondary = outlined emerald. 44px touch target.
export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  const { colors } = useTheme();
  const filled = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: filled ? colors.action : 'transparent',
          borderColor: filled ? colors.action : colors.primary,
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
