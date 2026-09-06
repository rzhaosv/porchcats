import React from 'react';
import Svg, { Rect, Ellipse, Circle, Path, G, Line } from 'react-native-svg';
import { ItemDef } from '../logic/types';

/** Porch items drawn in code, 100x100 viewBox, resting on y≈92. */
export function ItemSprite({ item, size = 96, dim }: { item: ItemDef; size?: number; dim?: boolean }) {
  const c = item.color;
  const a = item.accent ?? '#2B1D14';
  const o = dim ? 0.5 : 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={o}>
      <Ellipse cx={50} cy={93} rx={36} ry={4} fill="#2B1D14" opacity={0.1} />
      {item.kind === 'cushion' && (
        <G>
          <Rect x={14} y={62} width={72} height={26} rx={12} fill={c} />
          <Rect x={20} y={58} width={60} height={20} rx={10} fill={c} opacity={0.85} />
          <Path d="M 30 72 h 40" stroke="#fff" strokeOpacity={0.25} strokeWidth={3} strokeLinecap="round" />
        </G>
      )}
      {item.kind === 'box' && (
        <G>
          <Rect x={18} y={50} width={64} height={40} fill={c} />
          <Path d="M 18 50 L 50 34 L 82 50 Z" fill={c} opacity={0.75} />
          <Path d="M 18 50 L 10 58 L 42 62 L 50 50 Z" fill={c} opacity={0.9} />
          <Path d="M 82 50 L 90 58 L 58 62 L 50 50 Z" fill={c} opacity={0.9} />
          <Line x1={50} y1={50} x2={50} y2={90} stroke="#2B1D14" strokeOpacity={0.15} strokeWidth={2} />
        </G>
      )}
      {item.kind === 'ball' && (
        <G>
          <Circle cx={50} cy={74} r={17} fill={c} />
          <Path d="M 36 66 q 14 -10 28 0 M 36 82 q 14 10 28 0" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} fill="none" />
          <Circle cx={44} cy={68} r={3} fill="#fff" opacity={0.5} />
        </G>
      )}
      {item.kind === 'tunnel' && (
        <G>
          <Rect x={10} y={54} width={80} height={34} rx={17} fill={c} />
          <Ellipse cx={22} cy={71} rx={11} ry={16} fill="#2B1D14" opacity={0.55} />
          <Ellipse cx={78} cy={71} rx={11} ry={16} fill={c} />
          <Ellipse cx={78} cy={71} rx={7} ry={12} fill="#2B1D14" opacity={0.35} />
        </G>
      )}
      {item.kind === 'post' && (
        <G>
          <Ellipse cx={50} cy={88} rx={26} ry={6} fill={a} opacity={0.6} />
          <Rect x={41} y={30} width={18} height={58} rx={4} fill={c} />
          {[36, 44, 52, 60, 68, 76].map((y) => (
            <Line key={y} x1={41} y1={y} x2={59} y2={y + 3} stroke="#2B1D14" strokeOpacity={0.2} strokeWidth={2} />
          ))}
          <Ellipse cx={50} cy={30} rx={12} ry={5} fill={c} />
        </G>
      )}
      {item.kind === 'bed' && (
        <G>
          <Ellipse cx={50} cy={76} rx={38} ry={16} fill={c} />
          <Ellipse cx={50} cy={72} rx={28} ry={10} fill="#fff" opacity={0.35} />
          {item.id === 'bed_fourposter' && (
            <G>
              <Rect x={14} y={30} width={4} height={44} fill={a} />
              <Rect x={82} y={30} width={4} height={44} fill={a} />
              <Path d="M 12 30 q 38 -14 76 0" stroke={a} strokeWidth={4} fill="none" />
            </G>
          )}
        </G>
      )}
      {item.kind === 'basket' && (
        <G>
          {item.id === 'basket_hanging' && <Line x1={50} y1={4} x2={50} y2={58} stroke={a} strokeWidth={2.5} />}
          <Path d="M 16 60 L 24 90 L 76 90 L 84 60 Z" fill={c} />
          <Path d="M 16 60 L 84 60" stroke="#2B1D14" strokeOpacity={0.2} strokeWidth={3} />
          {[68, 76, 84].map((y) => (
            <Line key={y} x1={22} y1={y} x2={78} y2={y} stroke="#2B1D14" strokeOpacity={0.12} strokeWidth={2} />
          ))}
        </G>
      )}
      {item.kind === 'plant' && (
        <G>
          <Path d="M 34 62 L 40 90 L 60 90 L 66 62 Z" fill={a} />
          <Path d="M 50 62 q -20 -10 -18 -30 q 14 4 18 30 M 50 62 q 20 -10 18 -30 q -14 4 -18 30 M 50 62 q -2 -22 0 -36 q 2 14 0 36" fill={c} />
        </G>
      )}
      {item.kind === 'hat' && (
        <G>
          <Ellipse cx={50} cy={80} rx={40} ry={10} fill={c} />
          <Ellipse cx={50} cy={68} rx={20} ry={14} fill={c} />
          <Path d="M 30 70 q 20 6 40 0" stroke="#8E4A6B" strokeWidth={4} fill="none" />
        </G>
      )}
      {item.kind === 'sock' && (
        <G>
          <Path d="M 40 40 h 20 v 30 q 0 12 -10 16 l -12 4 q -10 2 -10 -8 q 0 -8 8 -10 l 4 -2 Z" fill={c} />
          <Rect x={40} y={38} width={20} height={8} fill="#fff" opacity={0.4} />
        </G>
      )}
      {item.kind === 'teapot' && (
        <G>
          <Ellipse cx={50} cy={72} rx={24} ry={18} fill={c} />
          <Path d="M 74 66 q 14 -2 12 12" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Path d="M 26 66 q -14 4 -6 16" stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Ellipse cx={50} cy={54} rx={10} ry={4} fill={c} />
          <Circle cx={50} cy={50} r={3.5} fill={c} />
        </G>
      )}
      {item.kind === 'radio' && (
        <G>
          <Rect x={18} y={50} width={64} height={40} rx={8} fill={c} />
          <Circle cx={36} cy={70} r={11} fill="#2B1D14" opacity={0.5} />
          <Rect x={54} y={60} width={20} height={6} rx={3} fill={a} />
          <Circle cx={64} cy={78} r={4} fill={a} />
          <Line x1={70} y1={50} x2={84} y2={30} stroke="#2B1D14" strokeWidth={2.5} />
        </G>
      )}
    </Svg>
  );
}

/** The food bowl: fill level 0..1. */
export function Bowl({ level, size = 72, tier = 0 }: { level: number; size?: number; tier?: number }) {
  const food = tier >= 3 ? '#E8896A' : tier >= 1 ? '#C99A6B' : '#B8A88A';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={50} cy={92} rx={34} ry={4} fill="#2B1D14" opacity={0.1} />
      <Path d="M 14 60 q 36 22 72 0 l -6 24 q -30 12 -60 0 Z" fill="#6F8FBF" />
      <Ellipse cx={50} cy={60} rx={36} ry={11} fill="#8FA9D3" />
      {level > 0 && <Ellipse cx={50} cy={58} rx={30 * Math.max(0.35, level)} ry={8 * Math.max(0.4, level)} fill={food} />}
    </Svg>
  );
}
