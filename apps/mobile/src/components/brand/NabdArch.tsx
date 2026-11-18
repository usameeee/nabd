import Svg, { Circle, G, Path } from 'react-native-svg';

// Maghreb pointed/horseshoe arch (mihrab) frame with the brand mark inside it.
// Paths are copied verbatim from design/splash/splash-*.svg — nothing is redrawn.
const ARCH_OUTER = 'M120 270 V190 C120 150 160 130 190 60 C220 130 260 150 260 190 V270';
const ARCH_INNER = 'M130 270 V193 C130 160 166 140 190 82 C214 140 250 160 250 193 V270';
const PULSE_PATH = 'M16 62 L28 62 L34 42 L41 78 L47 62 C52 82 65 92 78 92 C96 92 106 78 106 54';
const MARK_OFFSET = { x: 130, y: 165 };
const DOT = { cx: 78, cy: 32, r: 6.5 };

interface NabdArchProps {
  width: number;
  archColor: string;
  innerColor: string;
  lineColor: string;
  dotColor: string;
}

export function NabdArch({ width, archColor, innerColor, lineColor, dotColor }: NabdArchProps) {
  return (
    <Svg width={width} height={(width * 232) / 164} viewBox="108 46 164 232">
      <Path d={ARCH_OUTER} fill="none" stroke={archColor} strokeWidth={2} />
      <Path d={ARCH_INNER} fill="none" stroke={innerColor} strokeWidth={1.5} />
      <G transform={`translate(${MARK_OFFSET.x},${MARK_OFFSET.y})`}>
        <Path
          d={PULSE_PATH}
          fill="none"
          stroke={lineColor}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={dotColor} />
      </G>
    </Svg>
  );
}
