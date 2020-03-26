import React from "react";
import "./App.css";
import "react-vis/dist/style.css";
import { XAxis, AreaChart, Area, YAxis, Tooltip } from "recharts";
import { OrderedMap, Map, List, Collection, Set } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type RefArea = {
  left: number | undefined;
  right: number | undefined;
};

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: Entry[];
      excluded: Set<string>;
      highlighted: null | string;
      window_dimensions: { innerWidth: number; innerHeight: number };
      refArea: RefArea;
    };

const highlight_color = "#ff0079";
const default_color = "#00b6c6";

const App: React.FC<{}> = () => {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const handleResize = () => {
      if (state.type === "loaded") {
        setState({
          type: "loaded",
          data: state.data,
          highlighted: state.highlighted,
          excluded: state.excluded,
          window_dimensions: window,
          refArea: { left: undefined, right: undefined }
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
            refArea: { left: undefined, right: undefined }
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
        .filterNot(s => state.excluded.includes(s))
        .toArray();

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

      //onMouseUp={zoom}
      return (
        <div>
          <div className="chart">
            <AreaChart
              width={width}
              height={height}
              data={data.toJS()}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              onMouseDown={e =>
                setState({
                  type: "loaded",
                  data: state.data,
                  highlighted: state.highlighted,
                  excluded: state.excluded,
                  window_dimensions: window,
                  refArea: {
                    left: e.activeTooltipIndex,
                    right: state.refArea.right
                  }
                })
              }
              onMouseUp={e =>
                state.refArea &&
                setState({
                  type: "loaded",
                  data: state.data,
                  highlighted: state.highlighted,
                  excluded: state.excluded,
                  window_dimensions: window,
                  refArea: {
                    left: state.refArea.left,
                    right: e.activeTooltipIndex
                  }
                })
              }
            >
              {states.map((s: string) => {
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
                        type: "loaded",
                        data: state.data,
                        highlighted: d.dataKey,
                        excluded: state.excluded,
                        window_dimensions: window,
                        refArea: state.refArea
                      });
                    }}
                    onClick={d => {
                      setState({
                        type: "loaded",
                        data: state.data,
                        highlighted: state.highlighted,
                        excluded: state.excluded.add(d.dataKey),
                        window_dimensions: window,
                        refArea: state.refArea
                      });
                    }}
                  />
                );
              })}
              <XAxis
                dataKey={e => {
                  const [
                    { value: mo },
                    { value: da },
                    { value: ye }
                  ] = dtf.formatToParts(new Date(e.date));
                  return `${mo} ${da} ${ye}`;
                }}
              />
              <XAxis dataKey="name" />
              <YAxis orientation="right" />
              <Tooltip
                isAnimationActive={false}
                offset={-200}
                allowEscapeViewBox={{ x: true }}
              />
            </AreaChart>
          </div>
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
            <div className="excluded">
              {state.excluded.map((s: string) => (
                <h2
                  key={s}
                  className="hover-red"
                  onClick={d => {
                    setState({
                      type: "loaded",
                      data: state.data,
                      highlighted: state.highlighted,
                      excluded: state.excluded.remove(s),
                      window_dimensions: window,
                      refArea: state.refArea
                    });
                  }}
                >
                  {s}
                </h2>
              ))}
            </div>
          </div>
        </div>
      );
  }
};

export default App;
