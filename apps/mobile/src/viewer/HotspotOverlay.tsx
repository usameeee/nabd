import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { darkColors, fontFamily, fontSize, lightColors, radius } from '@nabd/shared';
import { useLocale } from '../i18n/LocaleProvider';
import type { HotspotMarker } from './HotspotAnchors';
import { HEART_TERMS, type HotspotDef } from './hotspots';

interface HotspotOverlayProps {
  hotspots: HotspotDef[];
  markers: Record<string, HotspotMarker>;
  selectedKey: string | null;
  onSelect: (termKey: string) => void;
}

// Numbered hotspots over the 3D model (docs/01): cream circle + amber ring, and — when selected —
// a dashed amber ring plus a label pill with a short leader line. Positions come from the anchors.
export function HotspotOverlay({ hotspots, markers, selectedKey, onSelect }: HotspotOverlayProps) {
  const { locale } = useLocale();

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      {hotspots.map((hotspot) => {
        const marker = markers[hotspot.termKey];
        const term = HEART_TERMS[hotspot.termKey];
        if (!marker || !term) return null;

        const label = term[locale];
        const selected = selectedKey === hotspot.termKey;

        return (
          <Animated.View
            key={hotspot.termKey}
            style={[
              styles.marker,
              { transform: [{ translateX: marker.x }, { translateY: marker.y }] },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => onSelect(hotspot.termKey)}
              style={styles.hit}
            >
              {selected ? (
                <Svg pointerEvents="none" style={styles.ring} viewBox="0 0 44 44">
                  <Circle
                    cx={22}
                    cy={22}
                    r={20}
                    fill="none"
                    stroke={lightColors.reward}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                </Svg>
              ) : null}

              <View
                style={[
                  styles.dot,
                  { backgroundColor: lightColors.bg, borderColor: lightColors.reward },
                  selected ? styles.dotSelected : null,
                ]}
              >
                <Text style={[styles.dotText, { color: darkColors.viewerBg }]}>{hotspot.order}</Text>
              </View>

              {selected ? (
                <>
                  <View
                    pointerEvents="none"
                    style={[styles.leader, { backgroundColor: lightColors.reward }]}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      styles.pill,
                      { backgroundColor: darkColors.surface, borderColor: darkColors.border },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.pillText, { color: darkColors.text, fontFamily: fontFamily.arabicBody }]}
                    >
                      {label}
                    </Text>
                  </View>
                </>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const DOT = 28;
const HIT = 44;

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  // Anchored at the projected point and lifted by half the hit box, so the dot centres on it.
  marker: {
    position: 'absolute',
    left: -HIT / 2,
    top: -HIT / 2,
    width: HIT,
    height: HIT,
  },
  hit: {
    width: HIT,
    height: HIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: HIT,
    height: HIT,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.12 }],
  },
  dotText: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.latinBody,
    fontWeight: '500',
  },
  leader: {
    position: 'absolute',
    top: DOT + 8,
    width: 1.5,
    height: 12,
    borderRadius: 1,
  },
  pill: {
    position: 'absolute',
    top: DOT + 20,
    left: -48,
    width: 140,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
});
