import React from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";
import {
  XAxis,
  LineChart,
  Line,
  CartesianGrid,
  YAxis,
  Tooltip
} from "recharts";
import { Map, List, Collection } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | { type: "loaded"; data: Entry[] };

const colors = [
  "#ff0079",
  "#fd1c7d",
  "#fb2b80",
  "#fa3584",
  "#f83e88",
  "#f6468b",
  "#f44d8f",
  "#f25393",
  "#ef5996",
  "#ed5f9a",
  "#eb649e",
  "#e969a1",
  "#e66ea5",
  "#e472a8",
  "#e177ac",
  "#df7baf",
  "#dc7fb2",
  "#da83b6",
  "#d787b9",
  "#d48bbc",
  "#d18fc0",
  "#ce92c3",
  "#cb96c6",
  "#c89ac9",
  "#c59dcc",
  "#c2a1cf",
  "#bea4d2",
  "#bba7d5",
  "#b7abd8",
  "#b4aeda",
  "#b0b1dd",
  "#adb4e0",
  "#a9b7e2",
  "#a5bae5",
  "#a1bde7",
  "#9dc0e9",
  "#99c3ec",
  "#95c6ee",
  "#90c9f0",
  "#8cccf2",
  "#88cff3",
  "#83d2f5",
  "#7fd4f7",
  "#7ad7f8",
  "#76dafa",
  "#71ddfb",
  "#6cdffc",
  "#68e2fd",
  "#63e4fe",
  "#5fe7fe",
  "#5beaff",
  "#57ecff",
  "#53efff"
];

const App: React.FC<{}> = () => {
  const [state, setState] = React.useState<State>({ type: "loading" });
  //rest of code will be performing for iOS on background too
  //

  React.useEffect(() => {
    fetch("https://covidtracking.com/api/states/daily")
      .then(res => res.json())
      .then(
        data => setState({ type: "loaded", data }),
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
      const most_recent_data = nested_data.maxBy((_, k) => k);
      if (typeof most_recent_data === "undefined") {
        return <div>Error: "Empty data"</div>;
      }
      const states: string[] = most_recent_data
        .sortBy((v, k) => -v)
        .keySeq()
        .toArray();
      console.log(states);

      const data = nested_data
        .entrySeq()
        .map(([date, cases]) =>
          Map(cases).set("date", new Date(date).valueOf())
        )
        .toList()

        .sortBy((m: Map<string, number>) => m.get("date"));

      return (
        <div>
          <LineChart
            width={1000}
            height={600}
            data={data.toJS()}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {states.map((s: string, i: number) => {
              return <Line type="monotone" dataKey={s} stroke={colors[i]} />;
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
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </div>
      );
  }
};

export default App;
