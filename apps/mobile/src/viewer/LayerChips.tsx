import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import { HEART_LAYERS, type LayerKey } from './layers';

interface LayerChipsProps {
  active: LayerKey;
  onSelect: (key: LayerKey) => void;
}

/**
 * Layer chips on the emerald viewer panel (docs/01). The panel stays dark in both themes (like
 * D-035), so the chips use the on-emerald palette: active = amber + the "text on amber" token,
 * idle = the mockup's surface fill + border. Only the layers the model supports are rendered (T-035).
 */
export function LayerChips({ active, onSelect }: LayerChipsProps) {
  const { t } = useTranslation();
  const { locale, rtl } = useLocale();
  return (
    <View style={[styles.row, { direction: rtl ? 'rtl' : 'ltr' }]}>
      {HEART_LAYERS.map((layer) => {
        const selected = layer.key === active;
        const label = t(`viewer.layers.${layer.key}`);
        return (
          <Pressable
            key={layer.key}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(layer.key)}
            // Chips are visually compact (mockup); a vertical hitSlop lifts the target to >=44px.
            hitSlop={{ top: spacing.sm, bottom: spacing.sm }}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: darkColors.reward }
                : { backgroundColor: darkColors.surface, borderColor: darkColors.border },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? lightColors.warningText : darkColors.text,
                  fontFamily: locale === 'ar' ? fontFamily.arabicBody : fontFamily.latinBody,
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: fontSize.caption,
  },
});
