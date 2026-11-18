import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { radius, spacing } from '@nabd/shared';
import { useTheme } from '../theme/ThemeProvider';

const TABS = ['home', 'learn', 'review', 'profile'] as const;
type TabKey = (typeof TABS)[number];

// Floating rounded tab bar (docs/01). Dot indicators for now — no icon set yet.
export function TabBar({ active = TABS[0] }: { active?: TabKey }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {TABS.map((key) => {
        const selected = key === active;
        return (
          <View
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t(`tabs.${key}`)}
            style={styles.item}
          >
            <View
              style={[
                styles.dot,
                selected
                  ? { backgroundColor: colors.primary }
                  : { borderWidth: 2, borderColor: colors.border },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
  },
});
