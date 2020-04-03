import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { OrderedSet, Collection, List, OrderedMap } from "immutable";
import { isPresent } from "ts-is-present";

interface IProps {
  data?: number[];
}

type RawEntry = { state: string; positive: number; dateChecked: string };
type Entry = { state: string; positive: number; dateChecked: number };

type State =
  | { type: "loading" }
  | { type: "error"; error: any }
  | {
      type: "loaded";
      data: OrderedMap<string, OrderedMap<number, number>>;
      x: any;
      y: any;
      line: any;
    };

/* Component */
export const MyD3Component = (props: IProps) => {
  const [state, setState] = React.useState<State>({ type: "loading" });
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
       passes. In this case it will hold our component's SVG DOM element. It's
       initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null);

  const {
    innerWidth: width,
    innerHeight: height,
  }: { innerWidth: number; innerHeight: number } = window;
  const margin = { top: 30, right: 15, bottom: 15, left: 15 };

  /* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      fetch("https://covidtracking.com/api/states/daily")
        .then((res) => res.json())
        .then((raw_data: RawEntry[]) => {
          if (props.data && d3Container.current) {
            const parsed_data: List<Entry> = List(raw_data)
              .map((e: RawEntry): null | Entry => {
                const date = new Date(e.dateChecked).valueOf();
                return isNaN(date) ? null : { ...e, dateChecked: date };
              })
              .filter(isPresent);
            const data: OrderedMap<
              string,
              OrderedMap<number, number>
            > = parsed_data
              .groupBy((e: Entry): string => e.state)
              .map(
                (
                  entries: Collection<number, Entry>
                ): OrderedMap<number, number> =>
                  entries
                    .groupBy((e: Entry) => e.dateChecked)
                    .map(
                      (entries: Collection<number, Entry>): Entry =>
                        entries.first()
                    )
                    .map((e: Entry): number => e.positive)
                    .toOrderedMap()
                    .sortBy((v, k) => k)
              )
              .toOrderedMap()
              .sortBy((entries: OrderedMap<number, number>) => entries.last());
            console.log(d3Container.current);

            // Bind D3 data
            const x = d3
              .scaleLinear()
              .domain(
                // @ts-ignore
                d3.extent(
                  parsed_data.toArray(),
                  (d: Entry): number => d.dateChecked
                )
              )
              .range([margin.left, width - margin.right]);
            const y = d3
              .scaleLinear()
              .domain(
                // @ts-ignore
                d3.extent(
                  parsed_data.toArray(),
                  (d: Entry): number => d.positive
                )
              )
              .range([height - margin.bottom, margin.top]);

            const line = d3
              .line()
              .defined((d) => true)
              .x(([d, p]) => x(d))
              .y(([d, p]) => y(p));

            const svg = d3
              .select(d3Container.current)
              //.style("overflow", "visible")
              //.attr("fill", "none")
              //.attr("stroke", "steelblue")
              //.attr("stroke-linejoin", "round")
              //.attr("stroke-linecap", "round")
              .selectAll("path")
              .data(data.toArray())
              .join("path")
              .on("mouseenter", () => alert("hello"))
              .attr("d", ([s, d]: [string, OrderedMap<number, number>]) =>
                line(d.toArray())
              );

            svg.exit().remove();
            setState({ type: "loaded", data, x, y, line });
          }
        });
    },

    /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
    [props.data, d3Container.current]
  );

  //React.useEffect(() => {
  //fetch("https://covidtracking.com/api/states/daily")
  //.then((res) => res.json())
  //.then(
  //(raw_data: Entry[]) => {
  //const nested_data: Collection.Keyed<
  //number,
  //Collection.Keyed<string, number>
  //> = List(raw_data)
  //.groupBy((e: Entry): number => e.dateChecked.valueOf())
  //.map((entries: Collection<number, Entry>) =>
  //entries
  //.groupBy((e: Entry): string => e.state)
  //.map(
  //(entries: Collection<number, Entry>): Entry => entries.first()
  //)
  //.map((e: Entry) => e.positive)
  //);
  //const data = nested_data
  //.entrySeq()
  //.map(([date, cases]) =>
  //OrderedMap(cases).set("date", new Date(date).valueOf())
  //)
  //.toList();

  //const unsortedStates = nested_data
  //.map((d) => d.keySeq())
  //.valueSeq()
  //.flatten()
  //.toOrderedSet()
  //.remove("date");

  //const latest_data = OrderedMap(
  //unsortedStates.map((s) => {
  //const last = data.findLast((d) => d.has(s));
  //return [s, last ? last.get(s, 0) : 0];
  //})
  //);

  //const states: OrderedSet<string> = unsortedStates.sortBy(
  //(v: number, s: string) => -latest_data.get(s, 0)
  //);

  //setState({
  //type: "loaded",
  //highlighted: null,
  //});
  //},
  //(error) => setState({ type: "error", error })
  //);
  //}, []);

  //switch (state.type) {
  //case "loading":
  //return <div>Loading...</div>;
  //case "error":
  //return <div>Error: {state.error.message}</div>;
  //case "loaded":
  return (
    <svg
      className="d3-component"
      style={{ overflow: "visible" }}
      width={width}
      height={height - 50}
      viewBox={`${[0, 0, width, height]}`}
      transform={`translate(${margin.left}, ${margin.top})`}
      fill="none"
      stroke="steelblue"
      ref={d3Container}
    />
  );
  //}
};

/* App */
export default function () {
  return (
    <div className="my-app">
      <MyD3Component data={[1, 2, 3]} />
    </div>
  );
}
