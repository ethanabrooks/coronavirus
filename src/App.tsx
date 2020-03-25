/// <reference path="../vendor/react-vis.d.ts"/>
import React from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";

import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineSeries,
  LineSeriesPoint,
} from "react-vis";

import { List } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | { type: "loaded"; data: Entry[] };

const App: React.FC<{}> = () => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states/daily")
      .then((res) => res.json())
      .then(
        (data) => setState({ type: "loaded", data }),
        (error) => setState({ type: "error", error })
      );
  }, []);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      const data: [string, LineSeriesPoint[]][] = List(state.data)
        .groupBy((e: Entry) => e.state)
        .map((entries) => entries.valueSeq().toList())
        .map((entries: List<Entry>) =>
          entries
            .map((e: Entry) => ({
              x: new Date(e.dateChecked).valueOf(),
              y: e.positive,
            }))
            .sort((p1: LineSeriesPoint, p2: LineSeriesPoint) => p1.x - p2.x)
            .toArray()
        )
        .toArray();

      return (
        <div>
          <XYPlot xType="ordinal" width={1300} height={500}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis />
            <YAxis />
            {data.map(([className, points]: [string, LineSeriesPoint[]]) => (
              <LineSeries className={className} data={points} />
            ))}
          </XYPlot>
        </div>
      );
  }
};

export default App;
