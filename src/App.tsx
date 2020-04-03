import React from "react";
import * as d3 from "d3";
import { Collection, List, OrderedMap } from "immutable";
import { isPresent } from "ts-is-present";

interface IProps {
  data?: number[];
}

type RawEntry = { state: string; positive: number; dateChecked: string };
type Entry = { state: string; positive: number; dateChecked: number };

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: OrderedMap<string, OrderedMap<number, number>>;
      highlighted: { state: string; xpos: number } | null;
      extent: { top: number; right: number; bottom: number; left: number };
    };
const highlightColor = "#ff0079";
const defaultColor = "#00b6c6";
const margin = { right: 100, bottom: 100 };

/* Component */
export const App = (props: IProps) => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  const {
    innerWidth: width,
    innerHeight: height,
  }: { innerWidth: number; innerHeight: number } = window;

  React.useMemo(() => {
    fetch("https://covidtracking.com/api/states/daily")
      .then((res) => res.json())
      .then((raw_data: RawEntry[]) => {
        const parsed_data: List<Entry> = List(raw_data)
          .map((e: RawEntry): null | Entry => {
            const date = new Date(e.dateChecked).valueOf();
            return isNaN(date) ? null : { ...e, dateChecked: date };
          })
          .filter(isPresent);
        const data: OrderedMap<string, OrderedMap<number, number>> = parsed_data
          .groupBy((e: Entry): string => e.state)
          .map(
            (entries: Collection<number, Entry>): OrderedMap<number, number> =>
              entries
                .groupBy((e: Entry) => e.dateChecked)
                .map(
                  (entries: Collection<number, Entry>): Entry => entries.first()
                )
                .map((e: Entry): number => e.positive)
                .toOrderedMap()
                .sortBy((v, k) => k)
          )
          .toOrderedMap()
          .sortBy(
            (entries: OrderedMap<number, number>) => -(entries.last() as number)
          );

        const [left, right] = d3.extent(
          parsed_data.toArray(),
          (d: Entry): number => d.dateChecked
        ) as number[];
        const [top, bottom] = d3.extent(
          parsed_data.toArray(),
          (d: Entry): number => d.positive
        ) as number[];

        setState({
          type: "loaded",
          data,
          highlighted: null,
          extent: { left, right, top, bottom },
        });
      });
  }, [height, width]);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      const { left, right, top, bottom } = state.extent;
      const x = d3
        .scaleLinear()
        .domain([left, right])
        .range([0, width - margin.right]);
      const y = d3
        .scaleLinear()
        .domain([top, bottom])
        .range([height - margin.bottom, 0]);
      const line = d3
        .line()
        .x(([d, p]) => x(d))
        .y(([d, p]) => y(p));
      const jsxs: JSX.Element[] = state.data
        .toArray()
        .map(([s, d]: [string, OrderedMap<number, number>]): [
          JSX.Element,
          JSX.Element
        ] => {
          const highlighted = s === state.highlighted?.state;
          const linePath = (
            <path
              fill="none"
              stroke={highlighted ? highlightColor : "none"}
              d={`${[0, height]}`}
              opacity={highlighted ? 0.7 : 0.2}
            />
          );
          const a: List<[number, number]> = List(d.entries())
            .push([state.extent.right, 0])
            .push([state.extent.left, 0]);
          const areaPath = (
            <path
              fill={defaultColor}
              d={`${line(a.toArray())}`}
              opacity={highlighted ? 0.7 : 0.2}
              onMouseOver={(e) => {
                setState({
                  ...state,
                  highlighted: { state: s, xpos: e.pageX },
                });
              }}
              onMouseOut={(e) => {
                setState({
                  ...state,
                  highlighted: null,
                });
              }}
            />
          );
          return [linePath, areaPath];
        })
        .flat();
      const line2 = d3
        .line()
        .x(([a, b]) => a)
        .y(([a, b]) => b);
      const tooltipLine = state.highlighted ? (
        <path
          fill="none"
          stroke={defaultColor}
          d={`${line2([
            [state.highlighted.xpos, 0],
            [state.highlighted.xpos, height],
          ])}`}
          opacity={1}
        />
      ) : null;
      return (
        <svg
          className="d3-component"
          style={{ overflow: "visible" }}
          width={width}
          height={height}
          viewBox={`${[0, 0, width, height]}`}
        >
          {jsxs}
          {tooltipLine}
        </svg>
      );
  }
};

/* App */
export default function () {
  return (
    <div className="my-app">
      <App />
    </div>
  );
}
