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
import { Set, Map, List, Collection } from "immutable";

type Entry = {
  state: string;
  positive: number;
  dateChecked: Date;
};

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | { type: "loaded"; data: Entry[] };

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
      const states: Set<string> = Set(state.data.map((e: Entry) => e.state));
      const dtf = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
      const dat = List(state.data)
        .groupBy((e: Entry): Date => e.dateChecked)
        .map((entries: Collection<number, Entry>) =>
          entries
            .groupBy((e: Entry): string => e.state)
            .map((entries: Collection<number, Entry>): Entry => entries.first())
            .map((e: Entry) => e.positive)
        )
        .entrySeq()
        .map(([date, cases]) =>
          Map(cases).set("name", new Date(date).valueOf())
        );

      const data = [
        {
          name: 1585166400000,
          uv: 4000,
          pv: 2400,
          amt: 2400
        },
        {
          name: "Page B",
          uv: 3000,
          pv: 1398,
          amt: 2210
        },
        {
          name: "Page C",
          uv: 2000,
          pv: 9800,
          amt: 2290
        },
        {
          name: "Page D",
          uv: 2780,
          pv: 3908,
          amt: 2000
        },
        {
          name: "Page E",
          uv: 1890,
          pv: 4800,
          amt: 2181
        },
        {
          name: "Page F",
          uv: 2390,
          pv: 3800,
          amt: 2500
        },
        {
          name: "Page G",
          uv: 3490,
          pv: 4300,
          amt: 2100
        }
      ];

      console.log("data start");
      console.log(dat.toJS());
      console.log("data end");
      console.log(data);
      return (
        <div>
          <h1> hello</h1>
          <LineChart
            width={600}
            height={300}
            data={dat.toJS()}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            {states.toArray().map((s: string) => {
              return <Line type="monotone" dataKey={s} stroke="#8884d8" />;
            })}
            <XAxis dataKey="name" />
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
