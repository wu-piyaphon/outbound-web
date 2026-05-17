import type { SVGProps } from "react";

const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;

const FACE_RADIUS = 86;

const EYE = {
  offsetX: 20,
  top: 40,
  bottom: 50,
};

const STROKE_WIDTH = 5;

// Left-side eyebrow strokes as [x1, y1, x2, y2] in viewBox units.
// The right side is mirrored across the vertical center, so geometry
// only needs to be defined once.
const LEFT_BROW_STROKES: ReadonlyArray<
  readonly [number, number, number, number]
> = [
  [12, 16, 28, 32],
  [26, 6, 42, 22],
];

const mirrorX = (x: number) => VIEWBOX - x;

export function Mascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} aria-hidden="true" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      >
        <circle cx={CENTER} cy={CENTER} r={FACE_RADIUS} />

        {[-EYE.offsetX, EYE.offsetX].map((dx) => (
          <line
            key={dx}
            x1={CENTER + dx}
            y1={EYE.top}
            x2={CENTER + dx}
            y2={EYE.bottom}
          />
        ))}

        {LEFT_BROW_STROKES.map(([x1, y1, x2, y2], i) => (
          <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
        {LEFT_BROW_STROKES.map(([x1, y1, x2, y2], i) => (
          <line
            key={`r${i}`}
            x1={mirrorX(x1)}
            y1={y1}
            x2={mirrorX(x2)}
            y2={y2}
          />
        ))}
      </g>
    </svg>
  );
}
