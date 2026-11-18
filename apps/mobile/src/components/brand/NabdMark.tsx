import Svg, { Circle, Path } from 'react-native-svg';

// Brand mark reused verbatim from design/logo/nabd-icon-*.svg (ن whose bowl becomes a single
// ECG peak, with the dot above). The logo is NOT redrawn — this path/dot data is the asset.
const PULSE_PATH = 'M16 62 L28 62 L34 42 L41 78 L47 62 C52 82 65 92 78 92 C96 92 106 78 106 54';
const DOT = { cx: 78, cy: 32, r: 6.5 };

interface NabdMarkProps {
  width: number;
  lineColor: string;
  dotColor: string;
}

export function NabdMark({ width, lineColor, dotColor }: NabdMarkProps) {
  return (
    <Svg width={width} height={(width * 98) / 122} viewBox="0 12 122 98">
      <Path
        d={PULSE_PATH}
        fill="none"
        stroke={lineColor}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={dotColor} />
    </Svg>
  );
}
