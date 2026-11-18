import { StyleSheet, View } from 'react-native';
import { radius } from '@nabd/shared';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  trackColor: string;
  fillColor: string;
  /** When set (>1), the track is split into N equal segments (docs/01: segmented by lesson steps). */
  segments?: number;
}

// Track used on cards and in the lesson runner. In RTL the fill grows from the right (docs/01) —
// the row inherits the screen's `direction`, so segment 0 sits on the start side.
export function ProgressBar({ value, trackColor, fillColor, segments }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

  if (segments && segments > 1) {
    const filled = Math.round(clamped * segments);
    return (
      <View style={styles.segmented}>
        {Array.from({ length: segments }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < filled ? fillColor : trackColor },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { backgroundColor: fillColor, width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
  },
});
