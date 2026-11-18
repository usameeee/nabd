import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { fontFamily, fontSize, motion, spacing } from '@nabd/shared';
import { NabdArch } from '../components/brand/NabdArch';
import { useLocale } from '../i18n/LocaleProvider';
import { useTheme } from '../theme/ThemeProvider';

// Keep the splash on screen long enough to read, then fade out (docs/01: motion is short/ease-out).
const SPLASH_MIN_MS = 1200;
const ARCH_WIDTH = 176;

interface SplashScreenProps {
  onFinish: () => void;
}

// Splash: Maghreb arch frame + brand mark over the theme background, with a pulse-dot loader.
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { name, colors } = useTheme();
  const { rtl } = useLocale();
  const { t } = useTranslation();

  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse-dot loading animation (docs/01).
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: motion.long,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: motion.long,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    const timer = setTimeout(() => {
      loop.stop();
      Animated.timing(fade, {
        toValue: 0,
        duration: motion.long,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => onFinish());
    }, SPLASH_MIN_MS);

    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [fade, onFinish, pulse]);

  const dark = name === 'dark';
  const lineColor = dark ? colors.text : colors.primary;
  const dotColor = dark ? colors.reward : colors.action;

  return (
    <Animated.View
      style={[
        styles.root,
        { backgroundColor: colors.bg, opacity: fade, direction: rtl ? 'rtl' : 'ltr' },
      ]}
    >
      <NabdArch
        width={ARCH_WIDTH}
        archColor={colors.primary}
        innerColor={colors.border}
        lineColor={lineColor}
        dotColor={dotColor}
      />
      <Text style={[styles.wordmark, { color: lineColor, fontFamily: fontFamily.arabicDisplay }]}>
        {t('app.wordmark')}
      </Text>
      <Text
        style={[
          styles.latinWordmark,
          { color: dark ? colors.reward : colors.textSecondary, fontFamily: fontFamily.latinDisplay },
        ]}
      >
        {t('app.latinWordmark')}
      </Text>
      <Text
        style={[styles.promise, { color: colors.textSecondary, fontFamily: fontFamily.arabicBody }]}
      >
        {t('home.promise')}
      </Text>
      <Animated.View
        style={[
          styles.pulseDot,
          {
            backgroundColor: dotColor,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.15] }) },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  wordmark: {
    marginTop: spacing.lg,
    fontSize: fontSize.display,
  },
  latinWordmark: {
    fontSize: fontSize.title,
  },
  promise: {
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  pulseDot: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: 999,
    marginTop: spacing.lg,
  },
});
