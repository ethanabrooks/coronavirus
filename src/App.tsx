/// <reference types="react-vis-types" />
import React from "react";
import "./App.css";
import "react-vis/dist/style.css";
import { HashRouter as Router, Route, useParams } from "react-router-dom";

import { XYPlot, AreaSeries, AreaSeriesPoint } from "react-vis";
import { OrderedSet, OrderedMap, Map, List, Collection, Set } from "immutable";

type Entry = {
  state: string;
  positive: number;
  date: number;
};

type XSelection = { left: number; right: number };
type Data = OrderedMap<number, number>;

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: Map<string, Data>;
      latest_data: Map<string, number>;
      states: OrderedSet<string>;
      excluded: Set<string>;
      highlighted: null | string;
      window_dimensions: { innerWidth: number; innerHeight: number };
      selecting: null | XSelection;
      selected: null | XSelection;
      mouseOverMessage: string;
    };

const highlight_color = "#ff0079";
const default_color = "#00b6c6";

const App: React.FC<{}> = () => {
  const [state, setState] = React.useState<State>({ type: "loading" });
  const params: { stateId?: string } = useParams();

  React.useEffect(() => {
    const handleResize = () => {
      if (state.type === "loaded") {
        setState({
          ...state,
          window_dimensions: window,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states/daily")
      .then((res) => res.json())
      .then(
        (raw_data: Entry[]) => {
          const data: Map<string, Data> = List(raw_data)
            .groupBy((e: Entry): string => e.state)
            .map((entries: Collection<number, Entry>) =>
              OrderedMap(
                entries
                  .groupBy((e: Entry): number => e.date)
                  .mapKeys((d) => {
                    return d;
                  })
                  .map(
                    (entries: Collection<number, Entry>): Entry =>
                      entries.first()
                  )
                  .map((e: Entry) => e.positive)
              )
            )
            .toMap();

          const latest_data: Map<string, number> = OrderedMap(
            data.map((d) => d.last())
          );

          const states: OrderedSet<string> = OrderedSet(data.keys());
          const cases_selected = params.stateId
            ? latest_data.get(params.stateId, 0)
            : null;
          const excluded = cases_selected
            ? states.filter((s) => latest_data.get(s, 0) > cases_selected)
            : Set();

          setState({
            type: "loaded",
            data,
            latest_data,
            states,
            excluded: excluded,
            highlighted: null,
            window_dimensions: window,
            selecting: null,
            selected: null,
            mouseOverMessage: "",
          });
        },
        (error) => setState({ type: "error", error })
      );
  }, [params.stateId]);

  switch (state.type) {
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error: {state.error.message}</div>;
    case "loaded":
      const dtf = new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      });

      const getStroke = (s: String) => {
        if (state.highlighted === s) {
          return highlight_color;
        } else {
          return default_color;
        }
      };

      const getOpacity = (s: String) => {
        switch (state.highlighted) {
          case s:
            return 1;
          case null:
            return 1;
          default:
            return 0.3;
        }
      };
      const {
        innerWidth: width,
        innerHeight: height,
      }: { innerWidth: number; innerHeight: number } = window;

      const chart_data = () => {
        if (state.selected) {
          const left = state.selected.left;
          const right = state.selected.right;
          return state.data.slice(
            Math.min(left, right),
            Math.max(left, right) + 1
          );
        }
        return state.data;
      };
      const getCases = (s: string): number => state.latest_data.get(s, 0);
      return (
        <div>
          <div className="intro">
            <div className="title">
              <h1>Coronavirus Cases</h1>
            </div>
            <div className="instructions">
              <p>
                Mouse over the graph to see which state each line/area
                represents.
              </p>
              <p>{`${state.mouseOverMessage}`}</p>
              <p>
                {state.excluded.isEmpty()
                  ? ""
                  : "Click on state names to add this state and all those with fewer cases back to chart."}
              </p>
            </div>
          </div>
          <div className="source">
            <p>source: The Covid Tracking Project</p>
          </div>
          <div className="chart">
            <XYPlot width={width} height={height}>
              {state.data
                .entrySeq()
                .map(
                  ([s, d]: [string, Data]): JSX.Element => (
                    <AreaSeries
                      color={default_color}
                      opacity={0.3}
                      stroke={getStroke(s)}
                      mouseOver={(e) => {
                        console.log(e);
                        setState({ ...state });
                      }}
                      data={d
                        .entrySeq()
                        .map(
                          ([d, c]: [number, number]): AreaSeriesPoint => {
                            return { x: d.valueOf(), y: c };
                          }
                        )
                        .toArray()}
                    />
                  )
                )
                .toArray()}
            </XYPlot>
          </div>
        </div>
      );
  }
};

export default function () {
  return (
    <Router>
      <Route path="/">
        <App />
      </Route>
      <Route path="/state/:stateId">
        <App />
      </Route>
    </Router>
  );
}
