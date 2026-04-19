"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import type { RiskTier } from "@/lib/utils";

const TIER_COLORS: Record<RiskTier, string> = {
  Minimal:      "#4CAF7D",
  Subthreshold: "#F4C842",
  Moderate:     "#E8834A",
  Severe:       "#D96B6B",
};

// Gauge geometry
const CX = 120, CY = 120, R = 90;

function polarToXY(score: number, maxScore = 21) {
  // score 0 → leftmost (180°), score 21 → rightmost (0°)
  const theta = (1 - score / maxScore) * Math.PI;
  return {
    x: CX + R * Math.cos(theta),
    y: CY - R * Math.sin(theta),
  };
}

function arcPath(s1: number, s2: number): string {
  const from = polarToXY(s1);
  const to   = polarToXY(s2);
  // Always going clockwise (sweep=1) through the top
  // Large arc if span > 10.5 (half of 21)
  const large = s2 - s1 > 10.5 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${R} ${R} 0 ${large} 1 ${to.x} ${to.y}`;
}

interface GaugeProps {
  score: number;
  ciLow: number;
  ciHigh: number;
  tier: RiskTier;
}

export default function GaugeChart({ score, ciLow, ciHigh, tier }: GaugeProps) {
  const color = TIER_COLORS[tier];

  // Needle angle: -90° at score=0, +90° at score=21
  const targetAngle = (score / 21) * 180 - 90;

  // CountUp for center number
  const mv = useMotionValue(0);
  const displayed = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    const controls = animate(mv, score, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [score, mv]);

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      <svg viewBox="0 0 240 145" className="w-full overflow-visible">
        {/* Background full arc */}
        <path
          d={arcPath(0, 21)}
          fill="none"
          stroke="currentColor"
          className="text-bg3"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Zone arcs (thin, behind) */}
        {[
          { s1: 0,  s2: 4,  color: "#4CAF7D" },
          { s1: 4,  s2: 9,  color: "#F4C842" },
          { s1: 9,  s2: 14, color: "#E8834A" },
          { s1: 14, s2: 21, color: "#D96B6B" },
        ].map(({ s1, s2, color: c }) => (
          <path
            key={s1}
            d={arcPath(s1, s2)}
            fill="none"
            stroke={c}
            strokeWidth="10"
            strokeLinecap="butt"
            opacity="0.18"
          />
        ))}

        {/* CI arc (dashed) */}
        <path
          d={arcPath(ciLow, ciHigh)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.22"
          strokeDasharray="4 3"
        />

        {/* Progress arc */}
        <motion.path
          d={arcPath(0, 0)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          animate={{ d: arcPath(0, score) }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
        />

        {/* Needle */}
        <motion.g
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: targetAngle }}
          transition={{ type: "spring", stiffness: 75, damping: 16, delay: 0.2 }}
        >
          {/* Needle body */}
          <line x1={CX} y1={CY} x2={CX} y2={CY - R + 14}
                stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Needle base (fatter) */}
          <line x1={CX} y1={CY} x2={CX} y2={CY + 10}
                stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
        </motion.g>

        {/* Center hub */}
        <circle cx={CX} cy={CY} r="7" fill={color} opacity="0.9" />
        <circle cx={CX} cy={CY} r="4" fill="currentColor" className="text-bg2" />

        {/* Score label */}
        <foreignObject x={CX - 36} y={CY + 14} width="72" height="28">
          <div className="flex items-baseline justify-center gap-0.5">
            <motion.span className="text-xl font-black" style={{ color }}>
              {displayed}
            </motion.span>
            <span className="text-xs text-fg3 font-medium">/21</span>
          </div>
        </foreignObject>

        {/* Min/Max labels */}
        <text x="20" y="132" fontSize="9" fill="currentColor" className="text-fg3/60" textAnchor="middle">0</text>
        <text x="220" y="132" fontSize="9" fill="currentColor" className="text-fg3/60" textAnchor="middle">21</text>
      </svg>
    </div>
  );
}
