import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';

export interface StageStop {
  key: string;
  label: string;
}

interface StageSliderProps {
  stops: StageStop[];
  active: number;
  onSelect: (index: number) => void;
}

const DOT_AREA = 20;
const TRACK_TOP = DOT_AREA / 2 - 2;

/**
 * Disease stage slider (design/screens/03-viewer-diseases.svg): the stages run along a track and the
 * active one is a larger cream dot with an amber ring. Order follows the reading direction — in RTL
 * the first stage ("healthy") sits on the right, so the row uses logical direction. Tapping a stop
 * selects it; the stage's material states are applied to the same model by `StageVisuals`.
 */
export function StageSlider({ stops, active, onSelect }: StageSliderProps) {
  const { locale, rtl } = useLocale();
  const [width, setWidth] = useState(0);

  const segment = stops.length > 0 ? width / stops.length : 0;
  // Stage `i` is centred in its equal-width segment; RTL mirrors the physical position.
  const centerOf = (index: number) =>
    rtl ? width - (index + 0.5) * segment : (index + 0.5) * segment;
  const trackLeft = segment / 2;
  const trackWidth = Math.max(0, width - segment);
  const startCenter = centerOf(0);
  const activeCenter = centerOf(active);
  const fillLeft = Math.min(startCenter, activeCenter);
  const fillWidth = Math.abs(activeCenter - startCenter);

  return (
    <View
      style={[styles.wrap, { direction: rtl ? 'rtl' : 'ltr' }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <>
          <View style={[styles.track, { left: trackLeft, width: trackWidth }]} />
          <View style={[styles.fill, { left: fillLeft, width: fillWidth }]} />
        </>
      ) : null}

      <View style={[styles.stops, { direction: rtl ? 'rtl' : 'ltr' }]}>
        {stops.map((stop, index) => {
          const selected = index === active;
          return (
            <Pressable
              key={stop.key}
              accessibilityRole="button"
              accessibilityLabel={stop.label}
              accessibilityState={{ selected }}
              onPress={() => onSelect(index)}
              style={styles.stop}
            >
              <View style={styles.dotArea}>
                <View style={[styles.dot, selected ? styles.dotActive : null]} />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: selected ? darkColors.reward : darkColors.textSecondary,
                    fontFamily: locale === 'ar' ? fontFamily.arabicBody : fontFamily.latinBody,
                  },
                ]}
              >
                {stop.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
  },
  track: {
    position: 'absolute',
    top: TRACK_TOP,
    height: 4,
    borderRadius: 2,
    backgroundColor: darkColors.border,
  },
  fill: {
    position: 'absolute',
    top: TRACK_TOP,
    height: 4,
    borderRadius: 2,
    backgroundColor: darkColors.reward,
  },
  stops: {
    flexDirection: 'row',
  },
  stop: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dotArea: {
    height: DOT_AREA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: darkColors.textSecondary,
  },
  dotActive: {
    width: 18,
    height: 18,
    backgroundColor: lightColors.bg,
    borderWidth: 3,
    borderColor: darkColors.reward,
  },
  label: {
    fontSize: fontSize.caption,
  },
});
