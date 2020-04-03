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
    };

/* Component */
export const App = (props: IProps) => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  const {
    innerWidth: width,
    innerHeight: height,
  }: { innerWidth: number; innerHeight: number } = window;
  const margin = { top: 30, right: 15, bottom: 15, left: 15 };

  useEffect(() => {
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
          .sortBy((entries: OrderedMap<number, number>) => entries.last());

        const x = d3
          .scaleLinear()
          .domain(
            d3.extent(
              parsed_data.toArray(),
              (d: Entry): number => d.dateChecked
            ) as number[]
          )
          .range([margin.left, width - margin.right]);
        const y = d3
          .scaleLinear()
          .domain(
            d3.extent(
              parsed_data.toArray(),
              (d: Entry): number => d.positive
            ) as number[]
          )
          .range([height - margin.bottom, margin.top]);

        const line = d3
          .line()
          .defined((d) => true)
          .x(([d, p]) => x(d))
          .y(([d, p]) => y(p));

        setState({ type: "loaded", data, line });
      });
  });

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      return (
        <svg
          className="d3-component"
          style={{ overflow: "visible" }}
          width={width}
          height={height - 50}
          viewBox={`${[0, 0, width, height]}`}
          transform={`translate(${margin.left}, ${margin.top})`}
          fill="none"
          stroke="steelblue"
        >
          {state.data.toArray().map(
            ([s, d]: [string, OrderedMap<number, number>]): JSX.Element => (
              <path d={`${state.line(d.toArray())}`} />
            )
          )}
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
