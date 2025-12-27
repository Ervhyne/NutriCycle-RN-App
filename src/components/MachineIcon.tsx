import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

type Props = {
  width?: number;
  height?: number;
};

export default function MachineIcon({ width = 48, height = 48 }: Props) {
  const bodyColor = '#CDE4C9'; // soft green for inner body
  const bodyDark = '#9ABF90';
  const outline = colors.primary;

  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 64 64" fill="none">
        {/* outer rounded square */}
        <Rect x="2" y="2" width="60" height="60" rx="12" fill={colors.softGreenSurface} stroke={colors.cardBorder} strokeWidth={1.5} />

        {/* machine body */}
        <Rect x="14" y="14" width="36" height="28" rx="6" fill={bodyColor} stroke={bodyDark} strokeWidth={1.6} />

        {/* panel lines */}
        <Path d="M20 24 H44" stroke={bodyDark} strokeWidth={1.2} strokeLinecap="round" />
        <Circle cx="34" cy="28" r="3" fill={bodyDark} />

        {/* base vents */}
        <Rect x="18" y="34" width="8" height="4" rx="1" fill={bodyDark} opacity="0.22" />
        <Rect x="30" y="34" width="8" height="4" rx="1" fill={bodyDark} opacity="0.22" />
      </Svg>
    </View>
  );
}
