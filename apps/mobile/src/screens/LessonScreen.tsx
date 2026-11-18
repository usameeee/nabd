import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useLocale } from '../i18n/LocaleProvider';
import { HEART_LESSON, type RunnerStep } from '../lesson/lessons';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

// The 3D-thumbnail used by viewer/video steps (design/screens/04-lesson-quiz-reward.svg): a clay
// heart / cream play glyph on an emerald circle. `variant` picks the glyph.
function StepThumb({ variant }: { variant: 'model' | 'video' }) {
  return (
    <View style={styles.thumb}>
      <Svg width={40} height={40} viewBox="0 0 24 24">
        {variant === 'model' ? (
          <Path
            d="M12 20 C12 20 4 14 4 9.4 C4 6.6 6.3 4.4 9 4.4 C10.6 4.4 12 5.4 12 5.4 C12 5.4 13.4 4.4 15 4.4 C17.7 4.4 20 6.6 20 9.4 C20 14 12 20 12 20 Z"
            fill={darkColors.action}
          />
        ) : (
          <Path d="M8 5 L19 12 L8 19 Z" fill={lightColors.bg} />
        )}
      </Svg>
    </View>
  );
}

// Body of the current step. Only the layout for each type differs; the runner owns the chrome.
function StepBody({ step, onOpenModel }: { step: RunnerStep; onOpenModel: () => void }) {
  const { colors } = useTheme();
  const { locale, rtl } = useLocale();
  const { t } = useTranslation();
  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  // Content is stored in all three languages; the active locale picks the leading one (docs/01).
  const lead = (text: { ar: string; fr: string; en: string }) => text[locale];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {step.type === 'explain' ? (
        <>
          <Text style={[styles.cardTitle, { color: colors.text, textAlign }]}>{lead(step.title)}</Text>
          <Text style={[styles.body, { color: colors.textSecondary, textAlign }]}>{lead(step.body)}</Text>
        </>
      ) : null}

      {step.type === 'viewer' ? (
        <>
          <StepThumb variant="model" />
          <Text style={[styles.cardTitle, { color: colors.text, textAlign }]}>{lead(step.title)}</Text>
          <Button label={t('lesson.openModel')} onPress={onOpenModel} />
        </>
      ) : null}

      {step.type === 'video' ? (
        <>
          <StepThumb variant="video" />
          <Text style={[styles.cardTitle, { color: colors.text, textAlign }]}>{lead(step.title)}</Text>
          <Text style={[styles.body, { color: colors.textSecondary, textAlign }]}>
            {t('lesson.videoSoon')}
          </Text>
        </>
      ) : null}

      {step.type === 'case' ? (
        <>
          <Text style={[styles.cardTitle, { color: colors.text, textAlign }]}>{lead(step.title)}</Text>
          <Text style={[styles.body, { color: colors.textSecondary, textAlign }]}>{lead(step.body)}</Text>
        </>
      ) : null}

      {step.type === 'quiz' ? (
        <Text style={[styles.body, { color: colors.textSecondary, textAlign }]}>
          {t('lesson.quizSoon')}
        </Text>
      ) : null}
    </View>
  );
}

// Lesson runner (T-043, design/screens/04-lesson-quiz-reward.svg): plays a lesson's steps under a
// segmented progress bar with Next/Previous. The quiz step's options land in T-044 and the reward
// screen (XP, streak, terms) in T-045 — the last step's button therefore just exits for now.
export function LessonScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { rtl } = useLocale();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const lesson = HEART_LESSON;
  const total = lesson.steps.length;
  const step = lesson.steps[index];
  // A mounted screen always has at least the current step; guard keeps TS honest.
  if (!step) return null;

  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  const isLast = index === total - 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.content, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('lesson.close')}
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

          <View style={styles.progress}>
            <ProgressBar
              value={(index + 1) / total}
              segments={total}
              trackColor={colors.border}
              fillColor={colors.primary}
            />
          </View>
        </View>

        <Text style={[styles.stepLabel, { color: colors.textSecondary, textAlign }]}>
          {`${t('lesson.stepOf', { current: index + 1, total })} · ${t(`lesson.stepTypes.${step.type}`)}`}
        </Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <StepBody step={step} onOpenModel={() => navigation.navigate('Viewer')} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerSecondary}>
            <Button
              label={t('lesson.previous')}
              variant="secondary"
              onPress={() => setIndex((value) => Math.max(0, value - 1))}
            />
          </View>
          <View style={styles.footerPrimary}>
            <Button
              label={isLast ? t('lesson.finish') : t('lesson.next')}
              onPress={() => (isLast ? navigation.goBack() : setIndex((value) => value + 1))}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  progress: {
    flex: 1,
  },
  stepLabel: {
    fontSize: fontSize.caption,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  thumb: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: darkColors.viewerBg,
  },
  cardTitle: {
    fontSize: fontSize.heading,
    fontFamily: fontFamily.arabicBody,
    fontWeight: '500',
  },
  body: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.arabicBody,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerSecondary: {
    flex: 1,
  },
  footerPrimary: {
    flex: 1,
  },
});
