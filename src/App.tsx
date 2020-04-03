import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Seq, Collection, List, OrderedMap } from "immutable";
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
      highlighted: null | string;
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
};

/* App */
export default function () {
  return (
    <div className="my-app">
      <MyD3Component data={[1, 2, 3]} />
    </div>
  );
}
