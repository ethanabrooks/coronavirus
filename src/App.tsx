import React, { useEffect } from "react";
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
      line: d3.Line<[number, number]>;
      highlighted: string | null;
      extent: { top: number; right: number; bottom: number; left: number };
    };
const highlight_color = "#ff0079";
const default_color = "#00b6c6";

/* Component */
export const App = (props: IProps) => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  const {
    innerWidth: width,
    innerHeight: height,
  }: { innerWidth: number; innerHeight: number } = window;
  const margin = { top: 30, right: 15, bottom: 15, left: 15 };

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
        const x = d3
          .scaleLinear()
          .domain([left, right])
          .range([margin.left, width - margin.right]);
        const y = d3
          .scaleLinear()
          .domain([top, bottom])
          .range([height - margin.bottom, margin.top]);

        const line = d3
          .line()
          .defined((d) => true)
          .x(([d, p]) => x(d))
          .y(([d, p]) => y(p));

        setState({
          type: "loaded",
          data,
          line,
          highlighted: null,
          extent: { left, right, top, bottom },
        });
      });
  }, []);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      const jsxs: JSX.Element[] = state.data
        .toArray()
        .map(([s, d]: [string, OrderedMap<number, number>]): [
          JSX.Element,
          JSX.Element
        ] => {
          const highlighted = s === state.highlighted;
          const line = (
            <path
              fill="none"
              stroke={highlighted ? highlight_color : "none"}
              d={`${state.line(List(d.entries()).toArray())}`}
              opacity={highlighted ? 0.7 : 0.2}
            />
          );
          const a: List<[number, number]> = List(d.entries())
            .push([state.extent.right, 0])
            .push([state.extent.left, 0]);
          const area = (
            <path
              fill={default_color}
              d={`${state.line(a.toArray())}`}
              opacity={s === state.highlighted ? 0.7 : 0.2}
              onMouseOver={(e) => {
                setState({
                  ...state,
                  highlighted: s,
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
          return [area, line];
        })
        .flat();
      return (
        <svg
          className="d3-component"
          style={{ overflow: "visible" }}
          width={width}
          height={height - 50}
          viewBox={`${[0, 0, width, height]}`}
          transform={`translate(${margin.left}, ${margin.top})`}
        >
          {jsxs}
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
