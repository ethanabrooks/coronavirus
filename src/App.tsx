import React from "react";
import "./App.css";
import "react-vis/dist/style.css";
import {
  ReferenceArea,
  XAxis,
  AreaChart,
  Area,
  YAxis,
  Tooltip
} from "recharts";
import { Seq, OrderedMap, Map, List, Collection, Set } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type XSelection = { left: number; right: number };
type Data = List<OrderedMap<string, number>>;

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: Data;
      states: Seq.Indexed<string>;
      excluded: Set<string>;
      highlighted: null | string;
      window_dimensions: { innerWidth: number; innerHeight: number };
      selecting: null | XSelection;
      selected: null | XSelection;
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
          window_dimensions: window
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
      .then(res => res.json())
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

          const most_recent_data: OrderedMap<string, number> = data.last();
          if (most_recent_data == null) {
            return <div>Error: "Empty data"</div>;
          }

          const states: Seq.Indexed<string> = most_recent_data
            .remove("date")
            .sortBy((v, k) => -v)
            .keySeq();
          setState({
            type: "loaded",
            data,
            states,
            excluded: Set(),
            highlighted: null,
            window_dimensions: window,
            selecting: null,
            selected: null
          });
        },
        error => setState({ type: "error", error })
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
        day: "numeric"
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
        innerHeight: height
      }: { innerWidth: number; innerHeight: number } = window;

      const chart_data = () => {
        if (state.selected) {
          return state.data.slice(
            state.selected.left,
            state.selected.right + 1
          );
        }
        return state.data;
      };
      const referenceArea = () => {
        if (state.selecting == null) {
          return null;
        }

        const left_date = state.data.get(state.selecting.left);
        const right_date = state.data.get(state.selecting.right);
        const left = left_date ? left_date.get("date") : null;
        const right = right_date ? right_date.get("date") : null;

        return left && right ? (
          <ReferenceArea x1={left} x2={right} strokeOpacity={0.3} />
        ) : null;
      };
      return (
        <div>
          <div className="title">
            <h1>Coronavirus Cases</h1>
          </div>
          <div className="instructions">
            <p>
              Click to remove lines from graphic and resize.{" "}
              {state.excluded.isEmpty()
                ? ""
                : "Click on state names to add back to chart."}
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
              onMouseDown={e => {
                if (e) {
                  setState({
                    ...state,
                    selecting: {
                      left: e.activeTooltipIndex,
                      right: e.activeTooltipIndex
                    }
                  });
                }
              }}
              onMouseMove={e => {
                if (state.selecting && e) {
                  return setState({
                    ...state,
                    selecting: {
                      left: state.selecting.left,
                      right: e.activeTooltipIndex
                    }
                  });
                }
              }}
              onMouseUp={e => {
                if (state.selecting && e) {
                  if (state.selecting.left !== state.selecting.right) {
                    return setState({
                      ...state,
                      selecting: null,
                      selected: state.selecting
                    });
                  }
                }
                return setState({
                  ...state,
                  selecting: null,
                  selected: null
                });
              }}
            >
              {state.states
                .filterNot(s => state.excluded.includes(s))
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
                      onMouseOver={d => {
                        setState({
                          ...state,
                          highlighted: d.dataKey,
                          excluded: state.excluded
                        });
                      }}
                      onClick={d => {
                        setState({
                          ...state,
                          excluded: state.excluded.add(d.dataKey)
                        });
                      }}
                    />
                  );
                })}
              <XAxis
                dataKey="date"
                tickFormatter={d => dtf.format(new Date(d))}
              />
              <XAxis dataKey="name" />
              <YAxis orientation="right" />
              <Tooltip
                isAnimationActive={false}
                offset={-300}
                allowEscapeViewBox={{ x: true }}
                labelFormatter={label => dtf.format(new Date(label))}
              />
              {referenceArea()}
            </AreaChart>
          </div>
          <div className="excluded">
            {state.excluded.map((s: string) => (
              <h2
                key={s}
                className="hover-red"
                onClick={d => {
                  setState({
                    ...state,
                    excluded: state.excluded.remove(s)
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
