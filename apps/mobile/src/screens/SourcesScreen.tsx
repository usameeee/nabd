import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ATTRIBUTION_KINDS, fontFamily, fontSize, radius, spacing, type AttributionEntry } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { loadAttributions } from '../sources/attributions';
import { useTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Sources'>;

// "Sources & licenses" (T-052): the attribution view generated from the DB's `license`/`attribution`
// fields (docs/03), grouped by kind. Licence names and attribution texts are credited data shown
// verbatim — only the chrome is localised. Loaded offline-first (cache → API → fixture, T-050).
export function SourcesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { rtl } = useLocale();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AttributionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadAttributions().then((result) => {
        if (!active) return;
        setEntries(result.entries);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  // Stable kind order (model → term → media); a group only appears when it has entries.
  const groups = ATTRIBUTION_KINDS.map((kind) => ({
    kind,
    items: entries.filter((entry) => entry.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sources.title')}
          onPress={() => navigation.goBack()}
          style={[styles.close, { backgroundColor: colors.surface, borderColor: colors.border }]}
          hitSlop={spacing.sm}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M6 6 L18 18 M18 6 L6 18"
              fill="none"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.arabicBody, textAlign }]}>
          {t('sources.title')}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { direction: rtl ? 'rtl' : 'ltr' }]}
      >
        <Text style={[styles.intro, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody, textAlign }]}>
          {t('sources.intro')}
        </Text>

        {loaded && entries.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody, textAlign }]}>
            {t('sources.empty')}
          </Text>
        ) : null}

        {groups.map((group) => (
          <View key={group.kind} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody, textAlign }]}>
              {t(`sources.kinds.${group.kind}`)}
            </Text>
            {group.items.map((entry) => (
              <View
                key={`${entry.kind}:${entry.key}`}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.cardHead}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.arabicBody, textAlign }]}>
                    {entry.title}
                  </Text>
                  <View style={[styles.license, { backgroundColor: colors.reward }]}>
                    <Text style={[styles.licenseText, { fontFamily: fontFamily.latinDisplay }]}>
                      {entry.license}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.attribution, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody, textAlign }]}>
                  {entry.attribution}
                </Text>
                {entry.sourceUrl ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(entry.sourceUrl as string)}
                  >
                    <Text style={[styles.link, { color: colors.primary, fontFamily: fontFamily.arabicBody, textAlign }]}>
                      {t('sources.viewSource')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: fontSize.title,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  intro: {
    fontSize: fontSize.body,
  },
  empty: {
    fontSize: fontSize.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.caption,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: fontSize.body,
    fontWeight: '500',
  },
  license: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  licenseText: {
    fontSize: fontSize.caption,
  },
  attribution: {
    fontSize: fontSize.caption,
    lineHeight: 20,
  },
  link: {
    fontSize: fontSize.caption,
    textDecorationLine: 'underline',
  },
});
