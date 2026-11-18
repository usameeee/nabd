import { StyleSheet, View } from 'react-native';
import { radius } from '@nabd/shared';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  trackColor: string;
  fillColor: string;
}

// Segmented-less track used on cards. In RTL the fill grows from the right (docs/01).
export function ProgressBar({ value, trackColor, fillColor }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

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
});
