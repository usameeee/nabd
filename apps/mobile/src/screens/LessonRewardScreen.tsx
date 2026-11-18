import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { Button } from '../components/Button';
import { useLocale } from '../i18n/LocaleProvider';
import { HEART_LESSON } from '../lesson/lessons';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { STUDENT_NAME } from '../profile/student';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonReward'>;

// The arch + amber heart badge + stars (design/screens/04-lesson-quiz-reward.svg, right panel).
// Paths and polygons are copied verbatim from that mockup — nothing is redrawn.
const ARCH_OUTER = 'M45 150 V92 C45 64 70 54 85 16 C100 54 125 64 125 92 V150';
const ARCH_INNER = 'M53 150 V94 C53 70 74 60 85 32 C96 60 117 70 117 94 V150';
const HEART =
  'M120 190 C70 160 70 110 100 105 C112 103 120 112 120 118 C120 112 128 103 140 105 C170 110 170 160 120 190 Z';
const STARS = [
  '55,160 57.4,165.5 62.6,165.5 58.5,169 60,174.5 55,171.2 50,174.5 51.5,169 47.4,165.5 52.6,165.5',
  '85,156 87.4,161.5 92.6,161.5 88.5,165 90,170.5 85,167.2 80,170.5 81.5,165 77.4,161.5 82.6,161.5',
  '115,160 117.4,165.5 122.6,165.5 118.5,169 120,174.5 115,171.2 110,174.5 111.5,169 107.4,165.5 112.6,165.5',
];

// Lesson-complete reward (T-045). This is an "on-brand" moment: the emerald surface + amber accents
// are pinned in light AND dark (like the viewer's language switcher, D-035) — it is not a themed
// surface, so it reads the same on every device.
export function LessonRewardScreen({ navigation, route }: Props) {
  const { xp, terms, streak } = route.params;
  const { locale, rtl } = useLocale();
  const { t } = useTranslation();

  const lessonTitle = HEART_LESSON.title[locale];
  const amber = lightColors.reward;
  const cream = lightColors.bg;
  const card = darkColors.border;
  const muted = darkColors.textSecondary;

  // Right-to-left in RTL (direction reverses the row), matching the mockup: XP · terms · streak.
  const stats = [
    { key: 'xp' as const, value: xp > 0 ? `+${xp}` : `${xp}`, color: amber },
    { key: 'terms' as const, value: `${terms}`, color: cream },
    { key: 'streak' as const, value: `${streak}`, color: cream },
  ];

  return (
    <View style={[styles.root, { direction: rtl ? 'rtl' : 'ltr' }]}>
      <Svg width={170} height={185} viewBox="0 0 170 185">
        <Path d={ARCH_OUTER} fill="none" stroke={amber} strokeWidth={1.5} />
        <Path d={ARCH_INNER} fill="none" stroke={card} strokeWidth={1.2} />
        <Circle cx={85} cy={104} r={28} fill={amber} />
        <G transform="translate(85,106) scale(0.34) translate(-120,-150)">
          <Path d={HEART} fill={lightColors.action} />
        </G>
        {STARS.map((points) => (
          <Polygon key={points} points={points} fill={amber} />
        ))}
      </Svg>

      <Text style={[styles.title, { color: cream }]}>
        {t('lesson.reward.title', { name: STUDENT_NAME })}
      </Text>
      <Text style={[styles.subtitle, { color: muted }]}>
        {t('lesson.reward.complete', { lesson: lessonTitle })}
      </Text>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.key} style={[styles.statCard, { backgroundColor: card }]}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: muted }]}>{t(`lesson.reward.${stat.key}`)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label={t('lesson.reward.next')} onPress={() => navigation.popToTop()} />
      </View>

      {/* Spaced-repetition review is T-046 — the link stays inert until it exists. */}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: true }} disabled>
        <Text style={[styles.review, { color: muted }]}>{t('lesson.reward.review')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: lightColors.primary,
  },
  title: {
    marginTop: spacing.md,
    fontSize: fontSize.heading,
    fontFamily: fontFamily.arabicBody,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.arabicBody,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  statValue: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.latinDisplay,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.arabicBody,
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  review: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    fontFamily: fontFamily.arabicBody,
    textDecorationLine: 'underline',
  },
});
