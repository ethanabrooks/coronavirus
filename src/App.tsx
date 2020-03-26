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
import { OrderedMap, Map, List, Collection, Set } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type XSelection = { left: number; right: number };

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: Entry[];
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
        data =>
          setState({
            type: "loaded",
            data,
            excluded: Set(),
            highlighted: null,
            window_dimensions: window,
            selecting: null,
            selected: null
          }),
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
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
      const nested_data: Collection.Keyed<
        Date,
        Collection.Keyed<string, number>
      > = List(state.data)
        .groupBy((e: Entry): Date => e.dateChecked)
        .map((entries: Collection<number, Entry>) =>
          entries
            .groupBy((e: Entry): string => e.state)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
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

      const states = most_recent_data
        .remove("date")
        .sortBy((v, k) => -v)
        .keySeq()
        .filterNot(s => state.excluded.includes(s));

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
          return data.slice(state.selected.left, state.selected.right);
        }
        return data;
      };
      const referenceArea = () => {
        if (state.selecting) {
          const left = data.get(state.selecting.left);
          const right = data.get(state.selecting.right);
          if (left && right) {
            const left_date = left.get("date");
            const right_date = right.get("date");
            if (left_date && right_date) {
              return (
                <ReferenceArea
                  x1={left_date}
                  x2={right_date}
                  strokeOpacity={0.3}
                />
              );
            }
          }
        }
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
              height={height}
              data={chart_data().toJS()}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              onMouseDown={e => {
                if (e) {
                  setState({
                    ...state,
                    selecting: {
                      left: e.activeTooltipIndex,
                      right: e.activeTooltipIndex
                    },
                    selected: null
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
              {states.toArray().map((s: string) => {
                return (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={getStroke(s)}
                    opacity={getOpacity(s)}
                    animationDuration={300}
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
                tickFormatter={d => {
                  const [
                    { value: mo },
                    { value: da },
                    { value: ye }
                  ] = dtf.formatToParts(new Date(d));
                  return `${mo} ${da} ${ye}`;
                }}
              />
              <XAxis dataKey="name" />
              <YAxis orientation="right" />
              <Tooltip
                isAnimationActive={false}
                offset={-300}
                allowEscapeViewBox={{ x: true }}
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
