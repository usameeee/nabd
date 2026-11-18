import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import type { ViewerDisease } from './diseases';

interface DiseaseChipsProps {
  diseases: ViewerDisease[];
  activeKey: string;
  onSelect: (key: string) => void;
}

/**
 * Disease picker above the model (design/screens/03-viewer-diseases.svg): the chosen disease is an
 * amber pill, the rest sit on the emerald panel. It scrolls horizontally, so a longer list of
 * diseases just extends the row (the mockup's "+N" overflow chip is unnecessary with a scroll).
 */
export function DiseaseChips({ diseases, activeKey, onSelect }: DiseaseChipsProps) {
  const { locale, rtl } = useLocale();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { direction: rtl ? 'rtl' : 'ltr' }]}
    >
      {diseases.map((disease) => {
        const selected = disease.key === activeKey;
        return (
          <Pressable
            key={disease.key}
            accessibilityRole="button"
            accessibilityLabel={disease.term.ar}
            accessibilityState={{ selected }}
            onPress={() => onSelect(disease.key)}
            hitSlop={{ top: spacing.sm, bottom: spacing.sm }}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: darkColors.reward }
                : { backgroundColor: darkColors.surface, borderColor: darkColors.border },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: selected ? lightColors.warningText : darkColors.text,
                  fontFamily: locale === 'ar' ? fontFamily.arabicBody : fontFamily.latinBody,
                },
              ]}
            >
              {disease.term[locale]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
