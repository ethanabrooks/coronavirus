import React from "react";
import "./App.css";
import "react-vis/dist/style.css";
import { Router, Link } from "@reach/router";

import {
  ReferenceArea,
  XAxis,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from "recharts";
import { OrderedSet, OrderedMap, Map, List, Collection, Set } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type XSelection = { left: number; right: number };
type Data = OrderedMap<string, number>;

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: List<Data>;
      latest_data: Data;
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
          const nested_data: Collection.Keyed<
            Date,
            Collection.Keyed<string, number>
          > = List(raw_data)
            .groupBy((e: Entry): Date => e.dateChecked)
            .map((entries: Collection<number, Entry>) =>
              entries
                .groupBy((e: Entry): string => e.state)
                .map(
                  (entries: Collection<number, Entry>): Entry => entries.first()
                )
                .map((e: Entry) => e.positive)
            );
          const data = nested_data
            .entrySeq()
            .map(([date, cases]) =>
              OrderedMap(cases).set("date", new Date(date).valueOf())
            )
            .toList()

            .sortBy((m: Map<string, number>) => m.get("date"));

          const unsortedStates = nested_data
            .map((d) => d.keySeq())
            .valueSeq()
            .flatten()
            .toOrderedSet()
            .remove("date");

          const latest_data = OrderedMap(
            unsortedStates.map((s) => {
              const last = data.findLast((d) => d.has(s));
              return [s, last ? last.get(s, 0) : 0];
            })
          );

          const states: OrderedSet<string> = unsortedStates.sortBy(
            (v: number, s: string) => -latest_data.get(s, 0)
          );

          setState({
            type: "loaded",
            data,
            latest_data,
            states,
            excluded: Set(),
            highlighted: null,
            window_dimensions: window,
            selecting: null,
            selected: null,
            mouseOverMessage: "",
          });
        },
        (error) => setState({ type: "error", error })
      );
  }, []);

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
      const referenceArea = () => {
        if (state.selecting == null) {
          return null;
        }

        const left = state.data.get(state.selecting.left)?.get("date");
        const right = state.data.get(state.selecting.right)?.get("date");

        return left && right ? (
          <ReferenceArea
            x1={Math.min(left, right)}
            x2={Math.max(left, right)}
            strokeOpacity={0.3}
          />
        ) : null;
      };
      const getCases = (s: string): number => state.latest_data.get(s, 0);
      return (
        <div>
          <div className="title">
            <h1>Coronavirus Cases</h1>
          </div>
          <div className="instructions">
            <p>
              Mouse over the graph to see which state each line/area represents.
              Click and drag to zoom.
            </p>
            <p>{`${state.mouseOverMessage}`}</p>
            <p>
              {state.excluded.isEmpty()
                ? ""
                : "Click on state names to add this state and all those with fewer cases back to chart."}
            </p>
          </div>
          <div className="source">
            <p>source: The Covid Tracking Project</p>
          </div>
          <div className="chart">
            <AreaChart
              width={width}
              height={height - 10}
              data={chart_data().toJS()}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              onMouseDown={(e) => {
                if (e) {
                  setState({
                    ...state,
                    selecting: {
                      left: e.activeTooltipIndex,
                      right: e.activeTooltipIndex,
                    },
                  });
                }
              }}
              onMouseMove={(e) => {
                if (state.selecting && e) {
                  return setState({
                    ...state,
                    selecting: {
                      left: state.selecting.left,
                      right: e.activeTooltipIndex,
                    },
                  });
                }
              }}
              onMouseUp={(e) => {
                if (state.selecting && e) {
                  if (state.selecting.left !== state.selecting.right) {
                    return setState({
                      ...state,
                      selecting: null,
                      selected: state.selecting,
                    });
                  }
                }
                return setState({
                  ...state,
                  selecting: null,
                  selected: null,
                });
              }}
            >
              {state.states
                .filterNot((s) => state.excluded.includes(s))
                .toArray()
                .map((s: string) => {
                  return (
                    <Area
                      key={s}
                      type="monotone"
                      dataKey={s}
                      stroke={getStroke(s)}
                      opacity={getOpacity(s)}
                      isAnimationActive={false}
                      activeDot={{ r: 0 }}
                      onMouseOver={(d) => {
                        setState({
                          ...state,
                          highlighted: d.dataKey,
                          mouseOverMessage: `Click to remove all states with more cases (currently) than ${d.dataKey} from the graph.`,
                          excluded: state.excluded,
                        });
                      }}
                      onMouseLeave={(d) => {
                        setState({
                          ...state,
                          mouseOverMessage: "",
                        });
                      }}
                      onClick={(d) => {
                        const thisStateCases = getCases(d.dataKey);
                        setState({
                          ...state,
                          excluded: state.states
                            .filter((s) => getCases(s) > thisStateCases)
                            .toSet()
                            .union(state.excluded),
                        });
                      }}
                    />
                  );
                })}
              <XAxis
                dataKey="date"
                tickFormatter={(d) => dtf.format(new Date(d))}
              />
              <XAxis dataKey="name" />
              <YAxis orientation="right" />
              <Tooltip
                isAnimationActive={false}
                offset={-300}
                allowEscapeViewBox={{ x: true }}
                labelFormatter={(label) => dtf.format(new Date(label))}
                itemSorter={(i) => -i.value}
              />
              {referenceArea()}
            </AreaChart>
          </div>
          <div className="excluded">
            {state.excluded.map((s: string) => (
              <h2
                key={s}
                className="hover-red"
                onClick={(d) => {
                  const thisStateCases = getCases(s);
                  setState({
                    ...state,
                    excluded: state.excluded.filter(
                      (s) => getCases(s) > thisStateCases
                    ),
                  });
                }}
              >
                {s}
              </h2>
            ))}
          </div>
        </div>
      );
  }
};

export default App;
