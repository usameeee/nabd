import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  fontFamily,
  fontSize,
  lightColors,
  radius,
  spacing,
  type TermSource,
  type ThemeColors,
} from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import { useTheme } from '../theme/ThemeProvider';

interface TermCardProps {
  ar: string;
  fr: string;
  en: string;
  /** Latin/TA name when the term has one. */
  latin?: string;
  /** Shows the ICD-11 badge when the term came from ICD-11 (docs/01). */
  source?: TermSource;
  /** Audio is a placeholder for now (T-025); wire it when the audio field is served. */
  onSpeak?: () => void;
  /** Overrides the palette — the viewer sheet is cream on the emerald panel, so it always passes the light tokens. */
  colors?: ThemeColors;
}

// TermCard (docs/01): AR title (large, emerald) → FR line → EN line + speaker (clay circle).
// All three languages always show — the switcher only changes which layer is emphasized.
export function TermCard({ ar, fr, en, latin, source, onSpeak, colors: override }: TermCardProps) {
  const { colors: themeColors } = useTheme();
  const colors = override ?? themeColors;
  const { rtl } = useLocale();
  const { t } = useTranslation();

  const textAlign: 'right' | 'left' = rtl ? 'right' : 'left';
  const latinLine = [styles.latinLine, { color: colors.textSecondary, fontFamily: fontFamily.mono, textAlign }];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, direction: rtl ? 'rtl' : 'ltr' },
      ]}
    >
      <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.primary, fontFamily: fontFamily.arabicBody, textAlign }]}>
          {ar}
        </Text>
        <Text style={latinLine}>{fr}</Text>
        <Text style={latinLine}>{en}</Text>
        {latin ? <Text style={latinLine}>{latin}</Text> : null}
        {source === 'ICD11' ? (
          <View style={[styles.badge, { borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.textSecondary, fontFamily: fontFamily.mono }]}>
              ICD-11
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('term.speak')}
        onPress={onSpeak}
        style={styles.speakerHit}
      >
        <View style={[styles.speakerCircle, { backgroundColor: colors.action }]}>
          {/* Speaker glyph — same white triangle as design/screens/02-viewer-anatomy.svg. */}
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M5 2 L5 14 L13 8 Z" fill={lightColors.bg} />
          </Svg>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '500',
  },
  latinLine: {
    fontSize: fontSize.caption,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: fontSize.caption,
  },
  speakerHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerCircle: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
