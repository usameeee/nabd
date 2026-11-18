import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ProgressBar } from '../components/ProgressBar';
import { TabBar } from '../components/TabBar';
import { TermCard } from '../components/TermCard';
import { useLocale } from '../i18n/LocaleProvider';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeProvider';

// Static content until the API is wired (T-019).
const STUDENT = { name: 'سارة', xp: 420 };
const LESSON_PROGRESS = 0.62;
// Today's lesson — matches the runner fixture (T-043) until /lessons is wired.
const LESSON_KEY = 'heart_circulation';
// Static preview for the TermCard until the viewer/API feed it (T-025 → T-033).
const TERM_OF_DAY = {
  ar: 'البطين الأيسر',
  fr: 'Ventricule gauche',
  en: 'Left ventricle',
  latin: 'Ventriculus sinister',
  source: 'MANUAL',
} as const;
const INTERACTIONS = [
  { key: 'model', tone: 'primary' },
  { key: 'clinicalCase', tone: 'action' },
  { key: 'video', tone: 'reward' },
  { key: 'quiz', tone: 'textSecondary' },
] as const;

// Home: today's lesson card + the ways to learn (docs/01 design). Static data for now.
export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { name, colors } = useTheme();
  const { rtl } = useLocale();
  const { t } = useTranslation();

  const dark = name === 'dark';
  const textAlign = rtl ? 'right' : 'left';

  // The lesson card is always an inverted surface: brand emerald on light, cream on dark (docs/01).
  const onBrand = dark ? lightColors : darkColors;
  const lessonBg = dark ? colors.text : colors.primary;
  const lessonTitleColor = dark ? lightColors.text : lightColors.bg;
  const lessonFill = dark ? lightColors.primary : colors.reward;

  const tone = {
    primary: colors.primary,
    action: colors.action,
    reward: colors.reward,
    textSecondary: colors.textSecondary,
  } as const;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { direction: rtl ? 'rtl' : 'ltr' }]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.action }]} />
          <Text
            style={[styles.greeting, { color: colors.text, fontFamily: fontFamily.arabicBody, textAlign }]}
          >
            {t('home.greeting', { name: STUDENT.name })}
          </Text>
          <View style={[styles.xpPill, { backgroundColor: colors.reward }]}>
            <Text
              style={[styles.xpText, { color: lightColors.warningText, fontFamily: fontFamily.latinDisplay }]}
            >
              {STUDENT.xp} {t('home.xpLabel')}
            </Text>
          </View>
        </View>

        <View style={[styles.lessonCard, { backgroundColor: lessonBg }]}>
          <Text
            style={[
              styles.lessonLabel,
              { color: onBrand.textSecondary, fontFamily: fontFamily.arabicBody, textAlign },
            ]}
          >
            {t('home.todayLesson')}
          </Text>
          <Text
            style={[
              styles.lessonTitle,
              { color: lessonTitleColor, fontFamily: fontFamily.arabicBody, textAlign },
            ]}
          >
            {t('home.lessonTitle')}
          </Text>
          <ProgressBar
            value={LESSON_PROGRESS}
            trackColor={onBrand.border}
            fillColor={lessonFill}
          />
          <View style={styles.lessonAction}>
            <Button
              label={t('home.continue')}
              onPress={() => navigation.navigate('Lesson', { lessonKey: LESSON_KEY })}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.arabicBody, textAlign }]}>
          {t('home.learnYourWay')}
        </Text>

        <View style={styles.grid}>
          {INTERACTIONS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              // Only the anatomy model is wired so far (T-032); the rest land in later tasks.
              disabled={item.key !== 'model'}
              onPress={() => navigation.navigate('Viewer')}
              style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.tileDot, { backgroundColor: tone[item.tone] }]} />
              <Text style={[styles.tileLabel, { color: colors.text, fontFamily: fontFamily.arabicBody }]}>
                {t(`home.interaction.${item.key}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.arabicBody, textAlign }]}>
          {t('home.termOfDay')}
        </Text>
        <TermCard
          ar={TERM_OF_DAY.ar}
          fr={TERM_OF_DAY.fr}
          en={TERM_OF_DAY.en}
          latin={TERM_OF_DAY.latin}
          source={TERM_OF_DAY.source}
        />

        <LanguageSwitcher />
      </ScrollView>
      <View style={styles.tabBarWrap}>
        <TabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.pill,
  },
  greeting: {
    flex: 1,
    fontSize: fontSize.body,
  },
  xpPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  xpText: {
    fontSize: fontSize.caption,
  },
  lessonCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.button,
  },
  lessonLabel: {
    fontSize: fontSize.caption,
  },
  lessonTitle: {
    fontSize: fontSize.title,
  },
  lessonAction: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  tile: {
    width: '48%',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  tileDot: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: radius.pill,
  },
  tileLabel: {
    fontSize: fontSize.caption,
  },
  tabBarWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
