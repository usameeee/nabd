import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { lightColors, radius, spacing } from '@nabd/shared';
import { TermCard } from '../components/TermCard';
import { useLocale } from '../i18n/LocaleProvider';
import { HEART_TERMS } from './hotspots';

interface TermSheetProps {
  termKey: string | null;
  onClose: () => void;
}

// Bottom sheet for the selected hotspot (design/screens/02): a cream panel on the emerald viewer,
// holding the shared TermCard. It always paints with the light palette, in both app themes.
export function TermSheet({ termKey, onClose }: TermSheetProps) {
  const { t } = useTranslation();
  const { rtl } = useLocale();

  const term = termKey ? HEART_TERMS[termKey] : undefined;
  if (!term) return null;

  return (
    <View style={[styles.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('viewer.close')}
          onPress={onClose}
          hitSlop={spacing.sm}
          style={styles.close}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path
              d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5"
              stroke={lightColors.text}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>
      <TermCard
        ar={term.ar}
        fr={term.fr}
        en={term.en}
        latin={term.latin}
        source={term.source}
        colors={lightColors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    backgroundColor: lightColors.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
