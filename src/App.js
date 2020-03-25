import React, { Component } from "react";
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      data: []
    };
  }

  componentDidMount() {
    fetch("https://covidtracking.com/api/states.json")
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            isLoaded: true,
            data: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }
  render() {
    const { error, isLoaded, data } = this.state;
    if (data !== undefined) {
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        const chart = data.map(d => {
          return { x: d.state, y: d.positive };
        });

        console.log(chart);

        const { useCanvas } = this.state;
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
  }
}

export default App;
