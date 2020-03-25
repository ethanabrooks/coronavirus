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
  VerticalBarSeries,
  LineSeries,
  LineSeriesPoint,
  VerticalBarSeriesCanvas
} from "react-vis";

import { List, Collection } from "immutable";

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
      .then(res => res.json())
      .then(
        data => setState({ type: "loaded", data }),
        error => setState({ type: "error", error })
      );
  }, []);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      const t: [string, Entry[]][] = List(state.data)
        .groupBy((e: Entry) => e.state)
        .map(e => e.valueSeq().toArray())
        .toArray();
      const mydata: [string, LineSeriesPoint[]][] = List(state.data)
        .groupBy((e: Entry) => e.state)
        .map(entries => entries.valueSeq().toList())
        .map((entries: List<Entry>) =>
          entries
            .map((e: Entry) => ({
              x: new Date(e.dateChecked).valueOf(),
              y: e.positive
            }))
            .toArray()
        )
        .toArray();

      return (
        <div>
          <XYPlot xType="ordinal" width={3000} height={300} xDistance={100}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis />
            <YAxis />
            {mydata.map(
              (
                value: [string, LineSeriesPoint[]],
                index: number,
                array: [string, LineSeriesPoint[]][]
              ) => (
                <LineSeries className={value[0]} data={value[1]} />
              )
            )}
          </XYPlot>
        </div>
      );
  }
};
//{data.map(props => (
//<LineSeries {...props} />
//))}

export default App;
