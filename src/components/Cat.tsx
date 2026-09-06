import React from 'react';
import Svg, { Ellipse, Circle, Path, G, Line } from 'react-native-svg';
import { Pattern, Pose } from '../logic/types';

/** Coat colours per pattern: base, markings, points (ears/face), eye. */
const COAT: Record<Pattern, { base: string; mark: string; mark2?: string; eye: string }> = {
  tabby: { base: '#C9A06A', mark: '#8F6A3C', eye: '#5E8F3E' },
  calico: { base: '#F4F1EA', mark: '#E58A3C', mark2: '#2B1D14', eye: '#5E8F3E' },
  tuxedo: { base: '#2B2B2E', mark: '#F4F1EA', eye: '#E6B23A' },
  orange: { base: '#E8964A', mark: '#C9722A', eye: '#5E8F3E' },
  grey: { base: '#9A9DA6', mark: '#70737C', eye: '#E6B23A' },
  black: { base: '#2B2B2E', mark: '#3A3A3E', eye: '#E6B23A' },
  white: { base: '#F7F4EE', mark: '#E6E0D6', eye: '#6FA0D9' },
  siamese: { base: '#EFE3D0', mark: '#5A4535', eye: '#6FA0D9' },
  tortie: { base: '#3A2A22', mark: '#D07A3A', mark2: '#C9A06A', eye: '#E6B23A' },
  cream: { base: '#F1DFC2', mark: '#DDC39B', eye: '#5E8F3E' },
  lilac: { base: '#C9BFCF', mark: '#A899B0', eye: '#6FA0D9' },
};

type Props = { pattern: Pattern; pose?: Pose; size?: number; asleep?: boolean; silhouette?: boolean; flip?: boolean };

/**
 * A chibi cat drawn in code. Body/head proportions change by pose; markings by pattern.
 * viewBox is 100x100 with the cat standing on y≈92.
 */
export function Cat({ pattern, pose = 'sit', size = 96, asleep, silhouette, flip }: Props) {
  const c = silhouette ? { base: '#CDBFAF', mark: '#CDBFAF', mark2: '#CDBFAF', eye: '#CDBFAF' } : COAT[pattern];
  const sleeping = asleep || pose === 'sleep';
  const loaf = pose === 'loaf';
  const stretch = pose === 'stretch';
  // body geometry
  const body = sleeping
    ? { cx: 50, cy: 70, rx: 34, ry: 20 }
    : loaf
    ? { cx: 50, cy: 70, rx: 32, ry: 18 }
    : stretch
    ? { cx: 52, cy: 72, rx: 38, ry: 15 }
    : { cx: 50, cy: 68, rx: 24, ry: 24 };
  const head = sleeping ? { cx: 30, cy: 62, r: 17 } : loaf ? { cx: 50, cy: 46, r: 19 } : stretch ? { cx: 22, cy: 60, r: 17 } : { cx: 50, cy: 40, r: 20 };
  const hr = head.r;
  const earL = `M ${head.cx - hr * 0.85} ${head.cy - hr * 0.35} L ${head.cx - hr * 0.7} ${head.cy - hr * 1.35} L ${head.cx - hr * 0.15} ${head.cy - hr * 0.85} Z`;
  const earR = `M ${head.cx + hr * 0.85} ${head.cy - hr * 0.35} L ${head.cx + hr * 0.7} ${head.cy - hr * 1.35} L ${head.cx + hr * 0.15} ${head.cy - hr * 0.85} Z`;
  const innerL = `M ${head.cx - hr * 0.72} ${head.cy - hr * 0.45} L ${head.cx - hr * 0.64} ${head.cy - hr * 1.1} L ${head.cx - hr * 0.3} ${head.cy - hr * 0.78} Z`;
  const innerR = `M ${head.cx + hr * 0.72} ${head.cy - hr * 0.45} L ${head.cx + hr * 0.64} ${head.cy - hr * 1.1} L ${head.cx + hr * 0.3} ${head.cy - hr * 0.78} Z`;
  const tail = sleeping
    ? `M ${body.cx + body.rx - 4} ${body.cy + 8} q 14 -10 4 -22`
    : stretch
    ? `M ${body.cx + body.rx - 2} ${body.cy - 2} q 14 -14 6 -28`
    : `M ${body.cx + body.rx - 6} ${body.cy + 10} q 20 4 18 -18`;
  const eyeY = head.cy + hr * 0.08;
  const eyeDx = hr * 0.42;
  const isTux = pattern === 'tuxedo';
  const isSia = pattern === 'siamese';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      {/* shadow */}
      <Ellipse cx={50} cy={93} rx={body.rx + 4} ry={4} fill="#2B1D14" opacity={0.12} />
      {/* tail */}
      <Path d={tail} stroke={isSia ? c.mark : pattern === 'tuxedo' ? c.base : c.mark} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* body */}
      <Ellipse cx={body.cx} cy={body.cy} rx={body.rx} ry={body.ry} fill={c.base} />
      {/* body markings */}
      {pattern === 'tabby' && !silhouette && (
        <G>
          <Path d={`M ${body.cx - 12} ${body.cy - body.ry + 4} q 6 8 0 16`} stroke={c.mark} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d={`M ${body.cx} ${body.cy - body.ry + 2} q 6 8 0 16`} stroke={c.mark} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d={`M ${body.cx + 12} ${body.cy - body.ry + 4} q 6 8 0 16`} stroke={c.mark} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      )}
      {(pattern === 'calico' || pattern === 'tortie') && !silhouette && (
        <G>
          <Ellipse cx={body.cx - 10} cy={body.cy - 4} rx={9} ry={7} fill={c.mark} />
          <Ellipse cx={body.cx + 12} cy={body.cy + 4} rx={8} ry={6} fill={c.mark2} />
          <Ellipse cx={body.cx + 2} cy={body.cy + 10} rx={6} ry={4} fill={c.mark} />
        </G>
      )}
      {isTux && !silhouette && <Ellipse cx={body.cx} cy={body.cy + 4} rx={body.rx * 0.45} ry={body.ry * 0.6} fill={c.mark} />}
      {/* paws */}
      {!sleeping && (
        <G>
          <Ellipse cx={body.cx - body.rx * 0.5} cy={body.cy + body.ry - 2} rx={6} ry={4} fill={isTux || isSia ? c.mark : c.base} />
          <Ellipse cx={body.cx + body.rx * 0.5} cy={body.cy + body.ry - 2} rx={6} ry={4} fill={isTux || isSia ? c.mark : c.base} />
        </G>
      )}
      {/* head */}
      <Path d={earL} fill={isSia ? c.mark : c.base} />
      <Path d={earR} fill={isSia ? c.mark : c.base} />
      <Path d={innerL} fill="#F2B8B5" opacity={silhouette ? 0 : 0.9} />
      <Path d={innerR} fill="#F2B8B5" opacity={silhouette ? 0 : 0.9} />
      <Circle cx={head.cx} cy={head.cy} r={hr} fill={c.base} />
      {isSia && !silhouette && <Ellipse cx={head.cx} cy={head.cy + hr * 0.25} rx={hr * 0.62} ry={hr * 0.5} fill={c.mark} opacity={0.85} />}
      {isTux && !silhouette && <Ellipse cx={head.cx} cy={head.cy + hr * 0.35} rx={hr * 0.55} ry={hr * 0.45} fill={c.mark} />}
      {pattern === 'tabby' && !silhouette && (
        <G>
          <Path d={`M ${head.cx - 6} ${head.cy - hr + 3} v 8`} stroke={c.mark} strokeWidth={3} strokeLinecap="round" />
          <Path d={`M ${head.cx} ${head.cy - hr + 1} v 9`} stroke={c.mark} strokeWidth={3} strokeLinecap="round" />
          <Path d={`M ${head.cx + 6} ${head.cy - hr + 3} v 8`} stroke={c.mark} strokeWidth={3} strokeLinecap="round" />
        </G>
      )}
      {(pattern === 'calico' || pattern === 'tortie') && !silhouette && <Ellipse cx={head.cx + hr * 0.5} cy={head.cy - hr * 0.3} rx={hr * 0.45} ry={hr * 0.4} fill={c.mark} />}
      {/* face */}
      {!silhouette &&
        (sleeping ? (
          <G>
            <Path d={`M ${head.cx - eyeDx - 4} ${eyeY} q 4 4 8 0`} stroke="#2B1D14" strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d={`M ${head.cx + eyeDx - 4} ${eyeY} q 4 4 8 0`} stroke="#2B1D14" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Ellipse cx={head.cx - eyeDx} cy={eyeY} rx={3.6} ry={4.4} fill={c.eye} />
            <Ellipse cx={head.cx + eyeDx} cy={eyeY} rx={3.6} ry={4.4} fill={c.eye} />
            <Ellipse cx={head.cx - eyeDx} cy={eyeY} rx={1.6} ry={3.4} fill="#2B1D14" />
            <Ellipse cx={head.cx + eyeDx} cy={eyeY} rx={1.6} ry={3.4} fill="#2B1D14" />
            <Circle cx={head.cx - eyeDx + 1.2} cy={eyeY - 1.6} r={1} fill="#fff" />
            <Circle cx={head.cx + eyeDx + 1.2} cy={eyeY - 1.6} r={1} fill="#fff" />
          </G>
        ))}
      {!silhouette && (
        <G>
          <Path d={`M ${head.cx - 2.2} ${head.cy + hr * 0.42} h 4.4 l -2.2 2.6 z`} fill="#D98A8A" />
          <Path d={`M ${head.cx} ${head.cy + hr * 0.52} q -3 3 -5 1 M ${head.cx} ${head.cy + hr * 0.52} q 3 3 5 1`} stroke="#2B1D14" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <Line x1={head.cx - hr * 0.55} y1={head.cy + hr * 0.4} x2={head.cx - hr * 1.15} y2={head.cy + hr * 0.3} stroke="#2B1D14" strokeWidth={1} opacity={0.5} />
          <Line x1={head.cx - hr * 0.55} y1={head.cy + hr * 0.55} x2={head.cx - hr * 1.15} y2={head.cy + hr * 0.62} stroke="#2B1D14" strokeWidth={1} opacity={0.5} />
          <Line x1={head.cx + hr * 0.55} y1={head.cy + hr * 0.4} x2={head.cx + hr * 1.15} y2={head.cy + hr * 0.3} stroke="#2B1D14" strokeWidth={1} opacity={0.5} />
          <Line x1={head.cx + hr * 0.55} y1={head.cy + hr * 0.55} x2={head.cx + hr * 1.15} y2={head.cy + hr * 0.62} stroke="#2B1D14" strokeWidth={1} opacity={0.5} />
          <Circle cx={head.cx - hr * 0.7} cy={head.cy + hr * 0.35} r={2.6} fill="#F2B8B5" opacity={0.7} />
          <Circle cx={head.cx + hr * 0.7} cy={head.cy + hr * 0.35} r={2.6} fill="#F2B8B5" opacity={0.7} />
        </G>
      )}
      {/* raised paw when playing */}
      {pose === 'play' && !silhouette && <Ellipse cx={body.cx + body.rx * 0.7} cy={body.cy - 6} rx={6} ry={4.5} fill={isTux || isSia ? c.mark : c.base} />}
    </Svg>
  );
}
