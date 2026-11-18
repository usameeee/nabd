import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, fontSize, radius, spacing } from '@nabd/shared';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useLocale } from '../i18n/LocaleProvider';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dueTermKeys, loadProgress, MAX_BOX, reviewTerm } from '../progress/progress';
import { useTheme } from '../theme/ThemeProvider';
import { HEART_TERMS } from '../viewer/hotspots';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

// Spaced-repetition review (T-046): the terms the lessons collected come back on a Leitner schedule
// of boxes 1-5 (docs/03 `termCollection`). Each card is a tap-to-reveal flashcard — front shows the
// Arabic term, reveal adds the FR/EN/Latin layers (docs/01: Arabic primary, FR then EN), then the
// student answers "again" (→ box 1) or "got it" (→ next box). No lives, no punishment (docs/01).
export function ReviewScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { rtl } = useLocale();
  const { t } = useTranslation();

  // The queue is a snapshot taken when the screen opens, so answering a card doesn't reshuffle the
  // rest of the sitting (reviewTerm persists the new box for the NEXT visit).
  const [queue, setQueue] = useState<string[]>([]);
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadProgress().then((state) => {
        if (!active) return;
        setQueue(dueTermKeys(state));
        setBoxes(Object.fromEntries(Object.values(state.terms).map((term) => [term.termKey, term.box])));
        setIndex(0);
        setRevealed(false);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  const total = queue.length;
  const current = queue[index];
  const term = current ? HEART_TERMS[current] : undefined;
  const finished = loaded && index >= total;

  const answer = async (correct: boolean) => {
    if (!current) return;
    await reviewTerm(current, correct);
    setRevealed(false);
    setIndex((value) => value + 1);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.content, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('review.back')}
            onPress={() => navigation.popToTop()}
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
            {t('review.title')}
          </Text>
        </View>

        {loaded && !finished ? (
          <>
            <Text style={[styles.due, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody, textAlign }]}>
              {t('review.due', { n: total })}
            </Text>
            <ProgressBar
              value={index / total}
              segments={total}
              trackColor={colors.border}
              fillColor={colors.primary}
            />
          </>
        ) : null}

        {loaded && total === 0 ? (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody }]}>
              {t('review.empty')}
            </Text>
            <Button label={t('review.back')} onPress={() => navigation.popToTop()} />
          </View>
        ) : null}

        {finished && total > 0 ? (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.primary, fontFamily: fontFamily.arabicBody }]}>
              {t('review.done')}
            </Text>
            <Button label={t('review.back')} onPress={() => navigation.popToTop()} />
          </View>
        ) : null}

        {loaded && !finished && current ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: revealed }}
              disabled={revealed}
              onPress={() => setRevealed(true)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.box, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody }]}>
                {t('review.boxOf', { box: boxes[current] ?? 1, total: MAX_BOX })}
              </Text>
              <Text style={[styles.ar, { color: colors.primary, fontFamily: fontFamily.arabicBody }]}>
                {term?.ar ?? current}
              </Text>
              {revealed ? (
                <View style={styles.lines}>
                  {term ? (
                    <Text style={[styles.line, { color: colors.textSecondary, fontFamily: fontFamily.mono }]}>
                      {term.fr}
                    </Text>
                  ) : null}
                  {term ? (
                    <Text style={[styles.line, { color: colors.textSecondary, fontFamily: fontFamily.mono }]}>
                      {term.en}
                    </Text>
                  ) : null}
                  {term?.latin ? (
                    <Text style={[styles.line, { color: colors.textSecondary, fontFamily: fontFamily.mono }]}>
                      {term.latin}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody }]}>
                  {t('review.tapToReveal')}
                </Text>
              )}
            </Pressable>

            {revealed ? (
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button label={t('review.again')} variant="secondary" onPress={() => void answer(false)} />
                </View>
                <View style={styles.action}>
                  <Button label={t('review.gotIt')} onPress={() => void answer(true)} />
                </View>
              </View>
            ) : (
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button label={t('review.showAnswer')} onPress={() => setRevealed(true)} />
                </View>
              </View>
            )}
          </>
        ) : null}
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
    gap: spacing.md,
    padding: spacing.lg,
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
  title: {
    flex: 1,
    fontSize: fontSize.title,
    fontWeight: '500',
  },
  due: {
    fontSize: fontSize.caption,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  placeholderText: {
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  box: {
    fontSize: fontSize.caption,
  },
  ar: {
    fontSize: fontSize.heading,
    fontWeight: '500',
    textAlign: 'center',
  },
  lines: {
    gap: spacing.xs,
  },
  line: {
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  hint: {
    fontSize: fontSize.body,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});
