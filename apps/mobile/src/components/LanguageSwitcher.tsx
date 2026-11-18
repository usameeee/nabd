import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LOCALES, fontFamily, fontSize, radius, spacing, type Locale } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import { useTheme } from '../theme/ThemeProvider';

export function LanguageSwitcher() {
  const { colors } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {LOCALES.map((code: Locale) => {
        const active = code === locale;
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setLocale(code)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.reward : colors.surface,
                borderColor: active ? colors.reward : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.text : colors.textSecondary,
                  fontFamily: fontFamily.latinBody,
                },
              ]}
            >
              {t(`language.${code}`)}
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
});
