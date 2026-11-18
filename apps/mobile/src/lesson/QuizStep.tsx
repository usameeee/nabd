import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import { HEART_TERMS } from '../viewer/hotspots';
import type { QuizOption, QuizQuestion, QuizText } from './quizzes';
import { useTheme } from '../theme/ThemeProvider';

interface QuizStepProps {
  question: QuizQuestion;
  /** XP granted by a correct answer — the step's `xp` (docs/03). */
  xp: number;
  /** Fires once an option is picked, so the runner can release "Next". */
  onAnswer: () => void;
}

// An option's label: a `termKey` resolves through the local terms seam (docs/03 "prefer termKey"),
// otherwise the inline `text` is used. Both are AR/FR/EN.
function optionText(option: QuizOption): QuizText | undefined {
  if (option.termKey) {
    const term = HEART_TERMS[option.termKey];
    if (term) return { ar: term.ar, fr: term.fr, en: term.en };
  }
  return option.text;
}

type OptionState = 'neutral' | 'correct' | 'wrong';

// Quiz step (T-044, design/screens/04-lesson-quiz-reward.svg): a prompt card + options that reveal
// three states — neutral / correct (success) / wrong (danger). Picking an option locks the answer
// and opens the explanation sheet. Wrong answers are NOT punished (no lives) — a wrong pick simply
// shows the explanation; the runner only holds "Next" back until an option is picked.
export function QuizStep({ question, xp, onAnswer }: QuizStepProps) {
  const { t } = useTranslation();
  const { locale, rtl } = useLocale();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);

  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  const answered = selected !== null;
  const isCorrect = answered && question.options[selected]?.correct === true;

  const pick = (index: number) => {
    if (answered) return;
    setSelected(index);
    onAnswer();
  };

  // Only the two snapshot palettes matter per state; neutral follows the active theme.
  const palette: Record<OptionState, { bg: string; border: string; title: string; latin: string }> = {
    neutral: { bg: colors.surface, border: colors.border, title: colors.text, latin: colors.textSecondary },
    correct: {
      bg: lightColors.successBg,
      border: lightColors.successText,
      title: lightColors.successText,
      latin: lightColors.successText,
    },
    wrong: {
      bg: lightColors.dangerBg,
      border: lightColors.action,
      title: lightColors.dangerText,
      latin: lightColors.dangerText,
    },
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.thumb, { backgroundColor: lightColors.viewerBg }]}>
          <Svg width={40} height={40} viewBox="0 0 24 24">
            <Path
              d="M12 20 C12 20 4 14 4 9.4 C4 6.6 6.3 4.4 9 4.4 C10.6 4.4 12 5.4 12 5.4 C12 5.4 13.4 4.4 15 4.4 C17.7 4.4 20 6.6 20 9.4 C20 14 12 20 12 20 Z"
              fill={lightColors.action}
            />
          </Svg>
        </View>
        <Text style={[styles.prompt, { color: colors.text, textAlign }]}>
          {question.prompt[locale]}
        </Text>
      </View>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const state: OptionState = !answered
            ? 'neutral'
            : option.correct
              ? 'correct'
              : index === selected
                ? 'wrong'
                : 'neutral';
          const skin = palette[state];
          const text = optionText(option);

          return (
            <Pressable
              key={option.termKey ?? `${index}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: answered, selected: index === selected }}
              disabled={answered}
              onPress={() => pick(index)}
              style={[styles.option, { backgroundColor: skin.bg, borderColor: skin.border }]}
            >
              <View style={styles.optionTexts}>
                <Text style={[styles.optionTitle, { color: skin.title }]}>{text?.ar}</Text>
                <Text style={[styles.optionLatin, { color: skin.latin }]}>{text?.fr}</Text>
                <Text style={[styles.optionLatin, { color: skin.latin }]}>{text?.en}</Text>
              </View>

              {state === 'neutral' ? null : (
                <View
                  style={[
                    styles.mark,
                    { backgroundColor: state === 'correct' ? lightColors.primary : lightColors.action },
                  ]}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    {state === 'correct' ? (
                      <Path
                        d="M5 12.5 L10 17.5 L19 7"
                        fill="none"
                        stroke={lightColors.bg}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <Path
                        d="M6 6 L18 18 M18 6 L6 18"
                        fill="none"
                        stroke={lightColors.bg}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {answered ? (
        <View
          style={[
            styles.explanation,
            { backgroundColor: isCorrect ? lightColors.successBg : lightColors.dangerBg },
          ]}
        >
          <View style={styles.feedbackRow}>
            <Text
              style={[
                styles.feedback,
                { color: isCorrect ? lightColors.successText : lightColors.dangerText },
              ]}
            >
              {isCorrect ? t('lesson.quiz.correct') : t('lesson.quiz.wrong')}
            </Text>
            {isCorrect ? (
              <Text style={[styles.xp, { color: lightColors.successText }]}>
                {t('lesson.quiz.xpReward', { xp })}
              </Text>
            ) : null}
          </View>
          <Text
            style={[
              styles.explanationText,
              {
                color: isCorrect ? lightColors.successText : lightColors.dangerText,
                textAlign,
              },
            ]}
          >
            {question.explanation[locale]}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
  },
  prompt: {
    fontSize: fontSize.heading,
    fontFamily: fontFamily.arabicBody,
    fontWeight: '500',
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
  },
  optionTexts: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.arabicBody,
    fontWeight: '500',
  },
  optionLatin: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.latinBody,
  },
  mark: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  explanation: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.sheet,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  feedback: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.arabicBody,
    fontWeight: '500',
  },
  xp: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.latinBody,
    fontWeight: '500',
  },
  explanationText: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.arabicBody,
    lineHeight: 20,
  },
});
