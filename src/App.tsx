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
      type: "loaded data";
      rawData: RawEntry[];
    };

const highlightColor = "#ff0079";
const defaultColor = "#00b6c6";
const margin = { right: 100, bottom: 100 };

const Chart: React.FC<{ rawData: RawEntry[] }> = ({ rawData }) => {
  const [highlighted, setHighlighted] = React.useState<{
    state: string;
    xpos: number;
  } | null>(null);
  const [extent, setExtent] = React.useState<{ width: number; height: number }>(
    { width: window.innerWidth, height: window.innerHeight }
  );

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      setExtent({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    );
  }, []);

  const { width, height } = extent;

  const content = React.useMemo(() => {
    const parsedData: List<Entry> = List(rawData)
      .map((e: RawEntry): null | Entry => {
        const date = new Date(e.dateChecked).valueOf();
        return isNaN(date) ? null : { ...e, dateChecked: date };
      })
      .filter(isPresent);

    const data: OrderedMap<string, OrderedMap<number, number>> = parsedData
      .groupBy((e: Entry): string => e.state)
      .map(
        (entries: Collection<number, Entry>): OrderedMap<number, number> =>
          entries
            .groupBy((e: Entry) => e.dateChecked)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e: Entry): number => e.positive)
            .toOrderedMap()
            .sortBy((v, k) => k)
      )
      .toOrderedMap()
      .sortBy(
        (entries: OrderedMap<number, number>) => -(entries.last() as number)
      );

    const [left, right] = d3.extent(
      parsedData.toArray(),
      (d: Entry): number => d.dateChecked
    ) as number[];
    const [top, bottom] = d3.extent(
      parsedData.toArray(),
      (d: Entry): number => d.positive
    ) as number[];

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
      .x(([d, _]) => x(d))
      .y(([_, p]) => y(p));

    return data
      .map((d: OrderedMap<number, number>, s: string): [
        JSX.Element,
        JSX.Element
      ] => {
        const isHighlighted = s === highlighted?.state;
        const linePath = (
          <path
            fill="none"
            stroke={isHighlighted ? highlightColor : "none"}
            d={`${[0, height]}`}
            opacity={isHighlighted ? 0.7 : 0.2}
          />
        );
        const a: List<[number, number]> = List(d.entries())
          .push([right, 0])
          .push([left, 0]);
        const areaPath = (
          <path
            fill={defaultColor}
            d={`${line(a.toArray())}`}
            opacity={isHighlighted ? 0.7 : 0.2}
            onMouseOver={(e) => setHighlighted({ state: s, xpos: e.pageX })}
            onMouseOut={(_) => setHighlighted(null)}
          />
        );
        return [linePath, areaPath];
      })
      .valueSeq()
      .flatten()
      .toArray();
  }, [width, height, highlighted, rawData]);

  // const line2 = d3
  //   .line()
  //   .x(([a, _]) => a)
  //   .y(([_, b]) => b);

  // const tooltipLine = highlighted == null ? null : (
  //   <path
  //     fill="none"
  //     stroke={defaultColor}
  //     d={`${line2([
  //       [highlighted.xpos, 0],
  //       [highlighted.xpos, height],
  //     ])}`}
  //     opacity={1}
  //   />
  // );

  return (
    <svg
      className="d3-component"
      style={{ overflow: "visible" }}
      width={width}
      height={height}
      viewBox={`${[0, 0, width, height]}`}
    >
      {content}
    </svg>
  );
};

/* Component */
export const App = (props: IProps) => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states/daily")
      .then((res) => res.json())
      .then((rawData) =>
        setState({
          type: "loaded data",
          rawData,
        })
      );
  }, []);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded data":
      return <Chart rawData={state.rawData} />;
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
