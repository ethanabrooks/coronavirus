import React from "react";
import "./App.css";
import "react-vis/dist/style.css";
import { HashRouter as Router, Route, useParams } from "react-router-dom";

import {
  VictoryChart,
  VictoryGroup,
  VictoryArea,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
} from "victory";
import {
  Seq,
  OrderedSet,
  OrderedMap,
  Map,
  List,
  Collection,
  Set,
} from "immutable";

type UnparsedEntry = {
  state: string;
  positive: number;
  dateChecked: string;
};

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type XSelection = { left: number; right: number };
type Data = Seq<Date, number>;

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: OrderedMap<string, Data>;
      window_dimensions: { innerWidth: number; innerHeight: number };
      selected: null | XSelection;
      selecting: null | XSelection;
      mouseOverMessage: string;
      highlighted: null | string;
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
      .then((res: Response) => res.json())
      .then(
        (raw_data: UnparsedEntry[]) => {
          const data: OrderedMap<string, Data> = List(raw_data)
            .map((e: UnparsedEntry) => {
              return { ...e, dateChecked: new Date(e.dateChecked) };
            })
            .filterNot((e: Entry) => isNaN(+e.dateChecked))
            .filter(
              (e: Entry) =>
                e.state == "PA" || e.state == "MD" || e.state == "MI"
            )
            .groupBy((e: Entry): string => e.state)
            .map(
              (entries: Collection<number, Entry>): Data =>
                Seq.Keyed(
                  entries
                    .map((e: Entry): [Date, number] => [
                      e.dateChecked,
                      e.positive,
                    ])
                    .values()
                ).sort()
              //entries
              //.groupBy((e: Entry): Date => e.dateChecked)
              //.map(
              //(entries: Collection<number, Entry>): Entry =>
              //entries.first()
              //)
              //.map((e: Entry) => e.positive)
            )
            .toOrderedMap()
            .sortBy((d: Data): number => {
              const last: number = d.last();
              return -last;
            });
          setState({
            type: "loaded",
            data,
            window_dimensions: window,
            selecting: null,
            selected: null,
            mouseOverMessage: "",
            highlighted: null,
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
      const {
        innerWidth: width,
        innerHeight: height,
      }: { innerWidth: number; innerHeight: number } = window;

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
                {//state.excluded.isEmpty()
                false
                  ? ""
                  : "Click on state names to add this state and all those with fewer cases back to chart."}
              </p>
            </div>
          </div>
          <div className="source">
            <p>source: The Covid Tracking Project</p>
          </div>
          <div className="chart">
            <VictoryChart
              width={width}
              height={height}
              containerComponent={
                <VictoryVoronoiContainer
                  voronoiDimension="x"
                  labels={(d: any) => d.datum.l}
                  labelComponent={<VictoryTooltip />}
                />
              }
              scale={{ x: "time" }}
            >
              <VictoryAxis orientation="bottom" />
              <VictoryAxis dependentAxis orientation="right" />
              <VictoryGroup>
                {state.data.entrySeq().map(
                  ([s, d]: [string, Data]): JSX.Element => {
                    return (
                      <VictoryArea
                        data={d
                          .entrySeq()
                          .map(([d, c]: [Date, number]) => {
                            return { x: d, y: c, l: `${s}: ${c}` };
                          })
                          .toArray()}
                        interpolation={"natural"}
                        style={{
                          data: {
                            fill: (d) => default_color,
                            opacity: (d) => 0.3,
                          },
                          labels: {
                            fill: (d) => {
                              console.log("labels1", d);
                              return s === state.highlighted
                                ? highlight_color
                                : default_color;
                            },
                          },
                        }}
                        events={[
                          {
                            target: "data",
                            eventHandlers: {
                              onMouseOver: () => {
                                return [
                                  {
                                    target: "data",
                                    mutation: (props) => {
                                      setState({ ...state, highlighted: s });
                                      return {
                                        active: true,
                                        style: {
                                          fill: highlight_color,
                                          opacity: 1,
                                        },
                                      };
                                    },
                                  },
                                ];
                              },

                              onMouseOut: () => {
                                return [
                                  {
                                    target: "data",
                                    mutation: (props) => {
                                      return {
                                        style: {
                                          fill: default_color,
                                          opacity: 0.3,
                                        },
                                      };
                                    },
                                  },
                                ];
                              },
                            },
                          },
                        ]}
                      />
                    );
                  }
                )}
              </VictoryGroup>
            </VictoryChart>
          </div>
        </div>
      );
  }
};
//<XYPlot width={width - 100} height={height}>
//{state.data
//.entrySeq()
//.map(
//([s, d]: [string, Data]): JSX.Element => (
//<AreaSeries
//color={default_color}
//opacity={0.3}
//stroke={getStroke(s)}
//onSeriesMouseOver={(e) => {
//setState({ ...state, highlighted: s });
//}}
//data={d
//.entrySeq()
//.map(
//([d, c]: [number, number]): AreaSeriesPoint => {
//return { x: d.valueOf(), y: c };
//}
//)
//.toArray()}
///>
//)
//)
//.toArray()}
//</XYPlot>

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
