import React, { Component } from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";
import {
  XYPlot,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis
} from "react-vis";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      result: []
    };
  }

  componentDidMount() {
    fetch("https://covidtracking.com/api/states.json")
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            isLoaded: true,
            result
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
    const { error, isLoaded, result } = this.state;
    if (result !== undefined) {
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        const data = [
          { x: 0, y: 8 },
          { x: 1, y: 5 },
          { x: 2, y: 4 },
          { x: 3, y: 9 },
          { x: 4, y: 1 },
          { x: 5, y: 7 },
          { x: 6, y: 6 },
          { x: 7, y: 3 },
          { x: 8, y: 2 },
          { x: 9, y: 0 }
        ];

        const states = result.map(i => i.state);
        console.log(states);
        return (
          <div className="App">
            <XYPlot height={300} width={300}>
              <VerticalGridLines />
              <HorizontalGridLines />
              <XAxis />
              <YAxis />
              <LineSeries data={data} />
            </XYPlot>
            <ul>
              {result.map(item => (
                <li key={item.state}>{item.state}</li>
              ))}
            </ul>
          </div>
        );
      }
    }
  }
}

export default App;
