import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const APP_MIN_SIZE = 200;
const APP_MAX_SIZE = 500;
const APP_DEFAULT_SIZE = 300;
const AI_MIN_SIZE = 60;
const AI_DEFAULT_SIZE = 120;
const GRID_SIZE = 320;
const AI_SIZE_OFFSET = 20;
const CHART_TOP_GUTTER = 8;
const CHART_LEFT_TITLE_GUTTER = 44;
const CHART_LEFT_TICK_GUTTER = 40;
const CHART_RIGHT_BALANCE_GUTTER = CHART_LEFT_TITLE_GUTTER + CHART_LEFT_TICK_GUTTER;
const CHART_BOTTOM_TICK_GUTTER = 28;
const CHART_BOTTOM_TITLE_GUTTER = 30;

type DragTarget = "app" | "ai";

interface DragState {
  target: DragTarget;
  startX: number;
  startSize: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getLevel = (percent: number) => {
  if (percent < 0.33) return 0;
  if (percent < 0.66) return 1;
  return 2;
};

const getRiskColor = (xLevel: number, yLevel: number) => {
  const mapping: Record<string, string> = {
    "0-0": "#00ff66",
    "0-1": "#33cc66",
    "1-0": "#33cc66",
    "2-0": "#ffff00",
    "1-1": "#ffff00",
    "0-2": "#ffff00",
    "2-1": "#ff9900",
    "1-2": "#ff9900",
    "2-2": "#ff0000",
  };

  return mapping[`${xLevel}-${yLevel}`] ?? "#33cc66";
};

export const AiRiskComponent = () => {
  const [appSize, setAppSize] = useState(APP_DEFAULT_SIZE);
  const [aiSize, setAiSize] = useState(AI_DEFAULT_SIZE);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const maxAiSize = Math.max(AI_MIN_SIZE, appSize - AI_SIZE_OFFSET);

  useEffect(() => {
    setAiSize((prev) => clamp(prev, AI_MIN_SIZE, maxAiSize));
  }, [maxAiSize]);

  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.startX;
      const requestedSize = dragState.startSize + deltaX;

      if (dragState.target === "app") {
        const nextAppSize = clamp(requestedSize, APP_MIN_SIZE, APP_MAX_SIZE);
        setAppSize(nextAppSize);
        setAiSize((prev) =>
          clamp(prev, AI_MIN_SIZE, Math.max(AI_MIN_SIZE, nextAppSize - AI_SIZE_OFFSET))
        );
        return;
      }

      setAiSize(clamp(requestedSize, AI_MIN_SIZE, maxAiSize));
    };

    const onPointerUp = () => setDragState(null);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, maxAiSize]);

  const appPercent = (appSize - APP_MIN_SIZE) / (APP_MAX_SIZE - APP_MIN_SIZE);
  const aiPercent = (aiSize - AI_MIN_SIZE) / Math.max(1, appSize - AI_MIN_SIZE);
  const yLevel = getLevel(appPercent);
  const xLevel = getLevel(aiPercent);

  const riskColor = getRiskColor(xLevel, yLevel);

  const riskPointPosition = useMemo(() => {
    const cellWidth = GRID_SIZE / 3;
    const cellHeight = GRID_SIZE / 3;

    return {
      x: xLevel * cellWidth + cellWidth / 2,
      y: (2 - yLevel) * cellHeight + cellHeight / 2,
    };
  }, [xLevel, yLevel]);

  const chartMetrics = useMemo(() => {
    const plotX = CHART_LEFT_TITLE_GUTTER + CHART_LEFT_TICK_GUTTER;
    const plotY = CHART_TOP_GUTTER;
    const cellSize = GRID_SIZE / 3;

    return {
      plotX,
      plotY,
      cellSize,
      svgWidth: plotX + GRID_SIZE + CHART_RIGHT_BALANCE_GUTTER,
      svgHeight:
        CHART_TOP_GUTTER + GRID_SIZE + CHART_BOTTOM_TICK_GUTTER + CHART_BOTTOM_TITLE_GUTTER,
      yTitleX: CHART_LEFT_TITLE_GUTTER / 2,
      yTickX: CHART_LEFT_TITLE_GUTTER + CHART_LEFT_TICK_GUTTER / 2,
      chartBottomY: CHART_TOP_GUTTER + GRID_SIZE,
    };
  }, []);

  return (
    <section className="not-prose my-6 rounded-xl border border-border/70 bg-card p-4 md:p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Drag the bottom-right handles to explore how software dependency and task complexity
        change AI risk.
      </p>

      <div className="flex flex-col items-center">
        <div
          className="mb-8 grid items-center"
          style={{ gridTemplateColumns: `120px ${appSize}px 120px` }}
        >
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center border border-border/80 bg-muted text-xs font-semibold text-foreground sm:h-28 sm:w-28">
            <span className="absolute left-2 top-1.5 text-[11px] font-bold">User</span>
          </div>

          <div
            className="relative flex items-center justify-center border border-border/80 text-foreground"
            style={{ width: `${appSize}px`, height: `${appSize}px`, backgroundColor: riskColor }}
          >
            <span className="absolute left-2 top-1.5 text-[11px] font-bold">
              App / Software
            </span>
            <div
              className="relative flex items-center justify-center border border-border/80 text-foreground"
              style={{ width: `${aiSize}px`, height: `${aiSize}px`, backgroundColor: riskColor }}
            >
              <span className="absolute left-2 top-1.5 text-[11px] font-bold">AI Component</span>
              <button
                type="button"
                aria-label="Resize AI component"
                className="absolute -bottom-2 -right-2 h-3.5 w-3.5 cursor-nwse-resize border border-border bg-foreground/80"
                onPointerDown={(event) => {
                  event.preventDefault();
                  setDragState({
                    target: "ai",
                    startX: event.clientX,
                    startSize: aiSize,
                  });
                }}
              />
            </div>
            <button
              type="button"
              aria-label="Resize app software box"
              className="absolute -bottom-2 -right-2 h-3.5 w-3.5 cursor-nwse-resize border border-border bg-foreground/80"
              onPointerDown={(event) => {
                event.preventDefault();
                setDragState({
                  target: "app",
                  startX: event.clientX,
                  startSize: appSize,
                });
              }}
            />
          </div>

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center border border-border/80 bg-muted text-center text-xs font-semibold text-foreground sm:h-28 sm:w-28">
            <span className="absolute left-2 top-1.5 text-[11px] font-bold">
              Information
              <br />
              Insights
              <br />
              Data
            </span>
          </div>
        </div>

        <div className="mt-1 flex justify-center">
          <svg
            width={chartMetrics.svgWidth}
            height={chartMetrics.svgHeight}
            viewBox={`0 0 ${chartMetrics.svgWidth} ${chartMetrics.svgHeight}`}
            role="img"
            aria-label="AI risk matrix with axis labels and current risk point"
          >
            <text
              x={chartMetrics.yTitleX}
              y={chartMetrics.plotY + GRID_SIZE / 2}
              transform={`rotate(-90 ${chartMetrics.yTitleX} ${chartMetrics.plotY + GRID_SIZE / 2})`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="12"
            >
              Software Dependency Risk
            </text>

            {["high", "medium", "low"].map((label, index) => {
              const y = chartMetrics.plotY + (index + 0.5) * chartMetrics.cellSize;
              return (
                <text
                  key={label}
                  x={chartMetrics.yTickX}
                  y={y}
                  transform={`rotate(-90 ${chartMetrics.yTickX} ${y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  fontSize="12"
                >
                  {label}
                </text>
              );
            })}

            <rect
              x={chartMetrics.plotX}
              y={chartMetrics.plotY}
              width={GRID_SIZE}
              height={GRID_SIZE}
              className="fill-none stroke-foreground/70"
              strokeWidth="2"
            />

            {[1, 2].map((line) => {
              const offset = line * chartMetrics.cellSize;
              return (
                <g key={line}>
                  <line
                    x1={chartMetrics.plotX + offset}
                    y1={chartMetrics.plotY}
                    x2={chartMetrics.plotX + offset}
                    y2={chartMetrics.plotY + GRID_SIZE}
                    className="stroke-border/70"
                    strokeWidth="1"
                  />
                  <line
                    x1={chartMetrics.plotX}
                    y1={chartMetrics.plotY + offset}
                    x2={chartMetrics.plotX + GRID_SIZE}
                    y2={chartMetrics.plotY + offset}
                    className="stroke-border/70"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            <circle
              cx={chartMetrics.plotX + riskPointPosition.x}
              cy={chartMetrics.plotY + riskPointPosition.y}
              r="8"
              fill={riskColor}
              className="stroke-foreground/80"
              strokeWidth="2"
            />

            {["low", "medium", "high"].map((label, index) => (
              <text
                key={label}
                x={chartMetrics.plotX + (index + 0.5) * chartMetrics.cellSize}
                y={chartMetrics.chartBottomY + 22}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                fontSize="12"
              >
                {label}
              </text>
            ))}

            <text
              x={chartMetrics.plotX + GRID_SIZE / 2}
              y={chartMetrics.chartBottomY + CHART_BOTTOM_TICK_GUTTER + 18}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="12"
            >
              Task Complexity Risk
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
};
