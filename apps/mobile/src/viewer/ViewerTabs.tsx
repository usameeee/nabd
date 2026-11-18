import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';

/** The viewer's content tabs. "Anatomy" shows hotspots; "Diseases" the stage slider (T-041). */
export type ViewerTab = 'anatomy' | 'diseases';

const TABS: ViewerTab[] = ['anatomy', 'diseases'];

interface ViewerTabsProps {
  tab: ViewerTab;
  onSelect: (tab: ViewerTab) => void;
}

/**
 * Bottom tab bar of the 3D viewer (design/screens/03-viewer-diseases.svg). It sits on the emerald
 * panel, so it keeps the on-emerald palette: the active tab is amber with a clay underline, the
 * others muted. The mockup's third tab ("function") is deferred until it has content.
 */
export function ViewerTabs({ tab, onSelect }: ViewerTabsProps) {
  const { t } = useTranslation();
  const { locale, rtl } = useLocale();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: darkColors.viewerBg, direction: rtl ? 'rtl' : 'ltr' },
      ]}
    >
      {TABS.map((item) => {
        const active = item === tab;
        const label = t(`viewer.tabs.${item}`);
        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? darkColors.reward : darkColors.textSecondary,
                  fontFamily: locale === 'ar' ? fontFamily.arabicBody : fontFamily.latinBody,
                },
              ]}
            >
              {label}
            </Text>
            <View
              style={[
                styles.underline,
                { backgroundColor: active ? lightColors.action : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tab: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontSize: fontSize.body,
  },
  underline: {
    width: 24,
    height: 3,
    borderRadius: radius.pill,
  },
});
