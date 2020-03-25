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
  VerticalBarSeriesCanvas
} from "react-vis";

type Entry = {
  state: string,
  positive: number,
};

type State = {type: "loading"} | {type: "error", error: any} | {type: "loaded", data: Entry[]}

const App: React.FC<{}> = () => {
  const [state, setState] = React.useState<State>({type: "loading"});

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states.json")
      .then(res => res.json())
      .then(
        data => setState({type: "loaded", data}),
        error => setState({type: "error", error})
      );
  }, []);

  switch (state.type) {
  case 'loading':
    return <div>Loading...</div>;
  case 'error':
    return <div>Error: {state.error.message}</div>;
  case 'loaded':
    type Point = {x: string, y: number};
    const chart = state.data.map((d: Entry) => ({ x: d.state, y: d.positive }));
    chart.sort((d1: Point, d2: Point) => d2.y - d1.y);

    const useCanvas = false;
    const BarSeries = useCanvas
      ? VerticalBarSeriesCanvas
      : VerticalBarSeries;
    return (
      <div>
        <XYPlot xType="ordinal" width={3000} height={300} xDistance={100}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <BarSeries className="vertical-bar-series-example" data={chart} />
        </XYPlot>
      </div>
    );
  }
}

export default App;
