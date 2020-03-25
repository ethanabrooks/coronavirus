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

export default function App() {
  const [state, setState] = React.useState({
    error: null,
    isLoaded: false,
    data: [],
    useCanvas: false
  })

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states.json")
      .then(res => res.json())
      .then(
        result => {
          setState({
            isLoaded: true,
            data: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        error => {
          setState({
            isLoaded: true,
            error
          });
        }
      );
  }, []);

  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  } else if (!state.isLoaded) {
    return <div>Loading...</div>;
  } else {
    const chart = state.data.map(d => ({ x: d.state, y: d.positive }));
    chart.sort((d1, d2) => d2.y - d1.y);

    console.log(chart);

    const BarSeries = state.useCanvas
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