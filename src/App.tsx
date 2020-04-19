import React from "react";
import * as d3 from "d3";
import { Collection, List, Set } from "immutable";
import { Spring } from "react-spring/renderprops";
import { Do } from "fp-ts-contrib/lib/Do";
import {
  option,
  fromNullable,
  fold,
  none,
  some,
  Option,
} from "fp-ts/lib/Option";
import { array } from "fp-ts/lib/Array";

type RawEntry = d3.DSVRowString<"state" | "cases" | "date">;
type Entry = { state: string; cases: number; date: number };
type XY = { x: number; y: number };
type Extent = { min: XY; max: XY };
type FlatExtent = { minX: number; minY: number; maxX: number; maxY: number };

const highlightColor = "#ff0079";
const defaultColor = "#00b6c6";
const margin = { right: 100, bottom: 100 };

function datediff(first: number, second: number): number {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

const Chart: React.FC<{ rawData: RawEntry[] }> = ({ rawData }) => {
  React.useEffect(() => {
    const listener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  const [mousePos, setMousePos] = React.useState<XY | null>(null);
  const [highlightedState, setHighlightedState] = React.useState<string | null>(
    null
  );
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });

  const [selecting, setSelecting] = React.useState<null | {
    from: XY;
    to: null | XY;
  }>(null);

  const [zoom, setZoom] = React.useState<Extent | null>(null);

  const parsedData: List<Entry> = React.useMemo(() => {
    const maybeEntries: Option<Entry>[] = rawData.map((e: RawEntry) =>
      Do(option)
        .bind("state", fromNullable(e.state))
        .bind("unparsedCases", fromNullable(e.cases))
        .bindL("cases", ({ unparsedCases: c }) => (isNaN(+c) ? none : some(+c)))
        .bind("unparsedDate", fromNullable(e.date))
        .bindL("date", ({ unparsedDate: d }) => {
          const date = new Date(d).valueOf();
          return isNaN(date) ? none : some(date);
        })
        .done()
    );
    return List(
      array.chain(
        maybeEntries,
        fold(
          () => [],
          (x: Entry) => [x]
        )
      )
    );
  }, [rawData]);

  const statesToDates = React.useMemo(
    () =>
      parsedData
        .groupBy((e) => e.state)
        .map((entries) =>
          entries
            .groupBy((e) => e.date)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e) => e.cases)
            .toOrderedMap()
            .sortBy((_, k) => k)
        )
        .toOrderedMap()
        .sortBy((entries) => -(entries.last() as number)),
    [parsedData]
  );

  const [included, setIncluded] = React.useState<Set<string>>(
    Set(statesToDates.keys())
  );

  const initialExtent = React.useMemo(() => {
    const [left, right] = d3.extent(
      parsedData.toArray(),
      (d) => d.date
    ) as number[];
    const [top, bottom] = d3.extent(
      parsedData.filter((e) => included.has(e.state)).toArray(),
      (d) => d.cases
    ) as number[];
    return {
      min: { x: left, y: top },
      max: { x: right, y: bottom },
    };
  }, [parsedData, included]);

  const includedExtent = React.useMemo(() => {
    const [left, right] = d3.extent(
      parsedData.filter((e) => included.has(e.state)).toArray(),
      (d) => d.date
    ) as number[];
    const [top, bottom] = d3.extent(
      parsedData.filter((e) => included.has(e.state)).toArray(),
      (d) => d.cases
    ) as number[];
    return {
      min: { x: left, y: top },
      max: { x: right, y: bottom },
    };
  }, [parsedData, included]);

  const extent = zoom ? zoom : includedExtent;

  const daysToStates = React.useMemo(
    () =>
      parsedData
        .groupBy((e) => {
          return datediff(initialExtent.min.x, e.date);
        })
        .map((entries) =>
          entries
            .groupBy((e) => e.state)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e) => e.cases)
            .toOrderedMap()
            .sortBy((v) => -v)
        )
        .toOrderedMap()
        .sortBy((entries) => -(entries.last() as number)),
    [parsedData, initialExtent]
  );

  const [minDay, maxDay] = React.useMemo(
    () => d3.extent(daysToStates.keySeq().toArray(), (d) => d) as number[],
    [daysToStates]
  );

  const paths = React.useMemo(
    () => (extent) => {
      const x = d3
        .scaleLinear()
        .domain([extent.min.x, extent.max.x])
        .range([0, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([extent.min.y, extent.max.y])
        .range([height - margin.bottom, 0]);

      const line = d3
        .line()
        .x(([d, _]) => x(d))
        .y(([_, p]) => y(p));

      return statesToDates
        .filter((_, state) => included.has(state))
        .map((d, s) => {
          const isHighlighted = s === highlightedState;
          const a = List(d.entries())
            .push([includedExtent.max.x, 0])
            .push([includedExtent.min.x, 0]);

          return (
            <React.Fragment key={s}>
              <path
                style={{ transition: "width 2s" }}
                fill="none"
                stroke={isHighlighted ? highlightColor : "none"}
                d={`${line(d.toArray())}`}
                opacity={isHighlighted ? 0.7 : 0.2}
              />
              <path
                style={{ transition: "width 2s" }}
                fill={defaultColor}
                d={`${line(a.toArray())}`}
                opacity={isHighlighted ? 0.7 : 0.2}
                onMouseEnter={() => setHighlightedState(s)}
                onMouseLeave={() =>
                  setHighlightedState((oldState) =>
                    oldState === s ? null : oldState
                  )
                }
                onClick={() => setIncluded(Set.of(s))}
              />
            </React.Fragment>
          );
        })
        .toArray();
    },
    [highlightedState, statesToDates, includedExtent, height, width, included]
  );

  let tooltipPath: JSX.Element | null = null;
  let tooltip: JSX.Element | null = null;
  if (mousePos != null && mousePos.x < width - margin.right) {
    const line = d3
      .line()
      .x(([a, _]) => a)
      .y(([_, b]) => b);
    const pageToDay = d3
      .scaleLinear()
      .domain([0, width - margin.right])
      .range([minDay, maxDay]);
    const dayToPage = d3
      .scaleLinear()
      .domain([minDay, maxDay])
      .range([0, width - margin.right]);
    const xpos = Math.round(pageToDay(mousePos.x));
    tooltipPath = (
      <path
        fill="none"
        stroke={"black"}
        strokeWidth={0.15}
        d={`${line([
          [dayToPage(xpos), 0],
          [dayToPage(xpos), height],
        ])}`}
        style={{ pointerEvents: "none" }}
      />
    );
    tooltip = (
      <text style={{ fontSize: 10, userSelect: "none" }}>
        {daysToStates
          .get(xpos)
          ?.filter((_, s) => included.has(s))
          .map((d, s) => {
            const fill = s === highlightedState ? highlightColor : "black";
            return (
              <tspan
                key={`${s}-tooltip`}
                x={
                  mousePos.x + 150 < width - margin.right
                    ? mousePos.x + 30
                    : mousePos.x - 150
                }
                dy={12}
                fill={fill}
              >
                {s}: {d}
              </tspan>
            );
          })
          .valueSeq()
          .toArray()}
      </text>
    );
  }

  const stateList = React.useMemo(
    () => (
      <text style={{ fontSize: 10, userSelect: "none" }}>
        {statesToDates
          .sortBy((_, k) => k)
          .map((d, s) => {
            const isIncluded = included.has(s);
            const fill = isIncluded ? "black" : "lightgrey";
            return (
              <tspan
                key={`${s}-toggle`}
                x={10}
                dy={12.8}
                fill={fill}
                onClick={() => {
                  setIncluded(
                    isIncluded && included.size > 1
                      ? included.delete(s)
                      : included.add(s)
                  );
                }}
                onDoubleClick={() => {
                  setIncluded(Set.of(s));
                  setZoom(null);
                }}
              >
                {s}
              </tspan>
            );
          })
          .valueSeq()
          .toArray()}
      </text>
    ),
    [included, statesToDates]
  );

  let selectionArea: null | JSX.Element = null;
  let rectExtent: null | Extent = null;
  if (selecting && selecting.to) {
    rectExtent = {
      min: {
        x: Math.min(selecting.from.x, selecting.to.x),
        y: Math.min(selecting.from.y, selecting.to.y),
      },
      max: {
        x: Math.max(selecting.from.x, selecting.to.x),
        y: Math.max(selecting.from.y, selecting.to.y),
      },
    };
    selectionArea = (
      <svg style={{ overflow: "visible" }}>
        <rect
          x={rectExtent.min.x}
          y={rectExtent.min.y}
          width={rectExtent.max.x - rectExtent.min.x}
          height={rectExtent.max.y - rectExtent.min.y}
          fill="black"
          opacity={0.3}
        />
      </svg>
    );
  }

  const xInverse = d3
    .scaleLinear()
    .domain([0, width - margin.right])
    .range([extent.min.x, extent.max.x]);

  const yInverse = d3
    .scaleLinear()
    .domain([0, height - margin.bottom])
    .range([extent.max.y, extent.min.y]);

  const flattenExtent = (e: Extent): FlatExtent => ({
    minX: e.min.x,
    maxX: e.max.x,
    minY: e.min.y,
    maxY: e.max.y,
  });

  return (
    <div>
      <div style={{ float: "right", width: width, height: 0 }}>
        {selectionArea}
      </div>
      <div
        style={{ float: "left", width: width - margin.right }}
        onDoubleClick={() => {
          setIncluded(Set(statesToDates.keys()));
          setZoom(null);
          setSelecting(null);
        }}
        onClick={() => setSelecting(null)}
        onMouseLeave={() => setSelecting(null)}
        onMouseDown={(e) => {
          setSelecting({
            from: { x: e.pageX, y: e.pageY },
            to: null,
          });
        }}
        onMouseMove={(e) => {
          if (selecting) {
            setSelecting({
              ...selecting,
              to: { x: e.pageX, y: e.pageY },
            });
          }
        }}
        onMouseUp={(e) => {
          if (selecting && rectExtent) {
            const rectSize =
              (rectExtent.max.x - rectExtent.min.x) *
              (rectExtent.max.y - rectExtent.min.y);
            if (rectSize > 50) {
              setZoom({
                min: {
                  x: xInverse(rectExtent.min.x),
                  y: yInverse(rectExtent.max.y),
                },
                max: {
                  x: xInverse(rectExtent.max.x),
                  y: yInverse(rectExtent.min.y),
                },
              });
            }
          } else {
            setZoom(null);
            setSelecting(null);
          }
        }}
      >
        <Spring to={flattenExtent(zoom ? zoom : includedExtent)}>
          {(flatExtent: FlatExtent) => {
            return (
              <svg
                className="d3-component"
                viewBox={`${[
                  0,
                  0,
                  width - margin.right,
                  height - margin.bottom,
                ]}`}
                onMouseMove={(e) => setMousePos({ x: e.pageX, y: e.pageY })}
              >
                {paths({
                  min: { x: flatExtent.minX, y: flatExtent.minY },
                  max: { x: flatExtent.maxX, y: flatExtent.maxY },
                })}
                {tooltipPath}
                {tooltip}
              </svg>
            );
          }}
        </Spring>
      </div>
      <div style={{ float: "left", width: margin.right }}>
        <svg style={{ overflow: "visible" }}>{stateList}</svg>
      </div>
    </div>
  );
};

export default function () {
  type State =
    | { type: "loading" }
    | { type: "error"; error: any }
    | { type: "loaded"; rawData: RawEntry[] };

  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    )
      .then((response) =>
        response.ok ? response.text() : Promise.reject(response.status)
      )
      .then(
        (text) => setState({ type: "loaded", rawData: d3.csvParse(text) }),
        (error) => setState({ type: "error", error })
      );
  }, []);

  switch (state.type) {
    case "loading":
      return <div>Loading…</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      return <Chart rawData={state.rawData} />;
  }
}
