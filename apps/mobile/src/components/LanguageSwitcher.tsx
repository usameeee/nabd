import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  LOCALES,
  darkColors,
  fontFamily,
  fontSize,
  lightColors,
  radius,
  spacing,
  type Locale,
} from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import { useTheme } from '../theme/ThemeProvider';

// Home shows three free-standing chips on the themed background. The viewer sits on the emerald
// panel, which stays dark in both themes (docs/01), so it uses the compact segmented pill from
// design/screens/02-viewer-anatomy.svg with short labels (ع | FR | EN) — T-034.
type LanguageSwitcherVariant = 'default' | 'viewer';

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { colors } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const viewer = variant === 'viewer';

  // The viewer chip paints on the emerald panel, so it keeps the on-emerald (dark) palette in
  // both themes; the theme-based chip is only used on the normal screens.
  const activeBg = viewer ? darkColors.reward : colors.reward;
  const activeText = viewer ? lightColors.warningText : colors.text;
  const activeBorder = viewer ? 'transparent' : colors.reward;
  const idleBg = viewer ? 'transparent' : colors.surface;
  const idleText = viewer ? darkColors.text : colors.textSecondary;
  const idleBorder = viewer ? 'transparent' : colors.border;
  const labelKey = viewer ? 'languageShort' : 'language';

  return (
    <View style={viewer ? [styles.segmentTrack, { backgroundColor: darkColors.surface }] : styles.row}>
      {LOCALES.map((code: Locale) => {
        const active = code === locale;
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setLocale(code)}
            style={[
              viewer ? styles.segment : styles.chip,
              {
                backgroundColor: active ? activeBg : idleBg,
                borderColor: active ? activeBorder : idleBorder,
              },
            ]}
          >
            <Text
              style={[
                viewer ? styles.segmentLabel : styles.label,
                {
                  color: active ? activeText : idleText,
                  fontFamily: viewer && code === 'ar' ? fontFamily.arabicBody : fontFamily.latinBody,
                },
              ]}
            >
              {t(`${labelKey}.${code}`)}
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize.body,
  },
  // Compact on-emerald segmented pill (viewer header). 40px segments + 2px track padding = 44px.
  segmentTrack: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: radius.pill,
  },
  segment: {
    minHeight: 40,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentLabel: {
    fontSize: fontSize.caption,
  },
});
