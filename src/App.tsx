import React from "react";
import * as d3 from "d3";
import { Collection, List, Set } from "immutable";
import { isPresent } from "ts-is-present";

type RawEntry = { state: string; positive: number; dateChecked: string };
type Entry = { state: string; positive: number; dateChecked: number };
type XY = { x: number; y: number };
type Extent = { min: XY; max: XY };

const highlightColor = "#ff0079";
const defaultColor = "#00b6c6";
const margin = { right: 100, bottom: 100 };

function datediff(first: number, second: number): number {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

const Chart: React.FC<{ rawData: RawEntry[] }> = ({ rawData }) => {
  const [mousePos, setMousePos] = React.useState<XY | null>(null);
  const [highlightedState, setHighlightedState] = React.useState<string | null>(
    null
  );
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });

  React.useEffect(() => {
    const listener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  const parsedData = React.useMemo(
    () =>
      List(rawData)
        .map((e) => {
          const date = new Date(e.dateChecked).valueOf();
          return isNaN(date) ? null : { ...e, dateChecked: date };
        })
        .filter(isPresent),
    [rawData]
  );

  const statesToDates = React.useMemo(
    () =>
      parsedData
        .groupBy((e) => e.state)
        .map((entries) =>
          entries
            .groupBy((e) => e.dateChecked)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e) => e.positive)
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

  const extent: Extent = React.useMemo(() => {
    const [left, right] = d3.extent(
      parsedData.filter((e) => included.has(e.state)).toArray(),
      (d) => d.dateChecked
    ) as number[];
    const [top, bottom] = d3.extent(
      parsedData.filter((e) => included.has(e.state)).toArray(),
      (d) => d.positive
    ) as number[];
    return { min: { x: left, y: top }, max: { x: right, y: bottom } };
  }, [parsedData, included]);

  const daysToStates = React.useMemo(
    () =>
      parsedData
        .groupBy((e) => {
          return datediff(extent.min.x, e.dateChecked);
        })
        .map((entries) =>
          entries
            .groupBy((e) => e.state)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e) => e.positive)
            .toOrderedMap()
            .sortBy((v) => -v)
        )
        .toOrderedMap()
        .sortBy((entries) => -(entries.last() as number)),
    [parsedData, extent]
  );

  const [minDay, maxDay] = React.useMemo(
    () => d3.extent(daysToStates.keySeq().toArray(), (d) => d) as number[],
    [daysToStates]
  );

  const paths = React.useMemo(() => {
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
          .push([extent.max.x, 0])
          .push([extent.min.x, 0]);

        return (
          <React.Fragment key={s}>
            <path
              fill="none"
              stroke={isHighlighted ? highlightColor : "none"}
              d={`${line(d.toArray())}`}
              opacity={isHighlighted ? 0.7 : 0.2}
            />
            <path
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
  }, [highlightedState, statesToDates, extent, height, width, included]);

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
          ?.filter((_, state) => included.has(state))
          .map((d, state) => {
            const fill = state === highlightedState ? highlightColor : "black";
            return (
              <tspan
                x={
                  mousePos.x + 80 < width - margin.right
                    ? mousePos.x + 30
                    : mousePos.x - 60
                }
                dy={12}
                fill={fill}
              >
                {state}: {d}
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
                x={10}
                dy={12.8}
                fill={fill}
                onClick={() => {
                  setIncluded(
                    isIncluded ? included.delete(s) : included.add(s)
                  );
                }}
                onDoubleClick={() => {
                  setIncluded(
                    included.size === 1 && included.has(s)
                      ? Set(statesToDates.keys())
                      : Set.of(s)
                  );
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

  return (
    <div>
      <div
        style={{ float: "left", width: width - margin.right }}
        onDoubleClick={() => {
          setIncluded(Set(statesToDates.keys()));
        }}
      >
        <svg
          className="d3-component"
          style={{ overflow: "visible" }}
          width={width}
          height={height}
          viewBox={`${[0, 0, width, height]}`}
          onMouseMove={(e) => setMousePos({ x: e.pageX, y: e.pageY })}
        >
          {paths}
          {tooltipPath}
          {tooltip}
        </svg>
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
    fetch("https://covidtracking.com/api/states/daily")
      .then((res) => res.json())
      .then(
        (rawData) => setState({ type: "loaded", rawData }),
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
