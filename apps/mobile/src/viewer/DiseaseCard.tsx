import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import type { ViewerDisease } from './diseases';

interface DiseaseCardProps {
  disease: ViewerDisease;
}

/**
 * Disease panel at the foot of the viewer (design/screens/03-viewer-diseases.svg): the name in AR
 * (primary) → FR → EN, an ICD-11 badge, the main symptoms, and the two lesson actions. Like the
 * TermSheet it is a cream sheet that keeps the light palette in both app themes.
 *
 * The video and quiz actions are shown but disabled: the lesson runner (T-043) and quiz step (T-044)
 * don't exist yet, so there is nowhere to navigate. They become live with those tasks.
 */
export function DiseaseCard({ disease }: DiseaseCardProps) {
  const { t } = useTranslation();
  const { locale, rtl } = useLocale();
  const latin = fontFamily.latinBody;
  const arabic = fontFamily.arabicBody;

  return (
    <View style={[styles.card, { direction: rtl ? 'rtl' : 'ltr' }]}>
      <View style={styles.head}>
        <View style={styles.titleBlock}>
          <Text style={[styles.titleAr, { fontFamily: arabic }]}>{disease.term.ar}</Text>
          <Text style={[styles.titleLatin, { fontFamily: latin }]}>{disease.term.fr}</Text>
          <Text style={[styles.titleLatin, { fontFamily: latin }]}>{disease.term.en}</Text>
          {disease.icd11?.code ? (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { fontFamily: latin }]}>
                {t('viewer.icd11')} {disease.icd11.code}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          style={styles.play}
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M6 3 L6 15 L15 9 Z" fill={lightColors.bg} />
          </Svg>
        </Pressable>
      </View>

      <Text
        style={[
          styles.sectionLabel,
          { fontFamily: locale === 'ar' ? arabic : latin },
        ]}
      >
        {t('viewer.symptoms')}
      </Text>
      <View style={styles.symptoms}>
        {disease.symptoms.map((symptom) => (
          <View key={symptom.en} style={styles.symptom}>
            <Text
              style={[
                styles.symptomText,
                { fontFamily: locale === 'ar' ? arabic : latin },
              ]}
            >
              {symptom[locale]}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} style={[styles.action, styles.actionPrimary]}>
          <Text style={[styles.actionText, styles.actionPrimaryText, { fontFamily: arabic }]}>
            {t('viewer.startQuiz')}
          </Text>
        </Pressable>
        <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} style={[styles.action, styles.actionOutline]}>
          <Text style={[styles.actionText, styles.actionOutlineText, { fontFamily: arabic }]}>
            {t('viewer.watch')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: lightColors.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  titleAr: {
    fontSize: fontSize.title,
    color: lightColors.primary,
  },
  titleLatin: {
    fontSize: fontSize.caption,
    color: lightColors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: lightColors.successBg,
  },
  badgeText: {
    fontSize: fontSize.caption,
    color: lightColors.successText,
  },
  play: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: lightColors.action,
  },
  sectionLabel: {
    fontSize: fontSize.caption,
    color: lightColors.primary,
  },
  symptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  symptom: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: lightColors.dangerBg,
  },
  symptomText: {
    fontSize: fontSize.caption,
    color: lightColors.dangerText,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    // Placeholder actions (T-043/T-044 not built): shown, but visibly not yet available.
    opacity: 0.45,
  },
  actionPrimary: {
    backgroundColor: lightColors.action,
    borderColor: lightColors.action,
  },
  actionOutline: {
    backgroundColor: 'transparent',
    borderColor: lightColors.primary,
  },
  actionText: {
    fontSize: fontSize.body,
  },
  actionPrimaryText: {
    color: lightColors.bg,
  },
  actionOutlineText: {
    color: lightColors.primary,
  },
});
