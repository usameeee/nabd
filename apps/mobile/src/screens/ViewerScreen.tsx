import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { darkColors, fontFamily, fontSize, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ViewerStage } from '../viewer/ViewerStage';

type Props = NativeStackScreenProps<RootStackParamList, 'Viewer'>;

// Full-screen 3D viewer (design/screens/02-viewer-anatomy.svg). T-032 ships the header + stage;
// hotspots, language switcher and layer chips are T-033/T-034/T-035. Painted on the viewer bg,
// so everything here uses the on-emerald (dark) palette.
export function ViewerScreen({ navigation }: Props) {
  const { rtl } = useLocale();
  const { t } = useTranslation();

  const textAlign = rtl ? 'right' : 'left';
  // Back points right in RTL, left in LTR (mirrors the layout direction).
  const chevron = rtl ? 'M9 5 L16 12 L9 19' : 'M15 5 L8 12 L15 19';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('viewer.back')}
          onPress={() => navigation.goBack()}
          style={[styles.back, { backgroundColor: darkColors.surface }]}
          hitSlop={spacing.sm}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d={chevron}
              fill="none"
              stroke={darkColors.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: darkColors.text, textAlign }]}>
            {t('viewer.organTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: darkColors.textSecondary, textAlign }]}>
            {t('viewer.organSubtitle')}
          </Text>
        </View>
      </View>

      <ViewerStage />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // The whole screen is one continuous emerald field (viewer bg), like the mockup panel.
    backgroundColor: darkColors.viewerBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.arabicBody,
  },
  subtitle: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.latinBody,
  },
});
