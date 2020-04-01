import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Seq, Collection, List, OrderedMap } from "immutable";
import { isPresent } from "ts-is-present";

interface IProps {
  data?: number[];
}

type RawEntry = { state: string; positive: number; dateChecked: string };

type Entry = { state: string; positive: number; dateChecked: number };

/* Component */
export const MyD3Component = (props: IProps) => {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
       passes. In this case it will hold our component's SVG DOM element. It's
       initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null);

  const {
    innerWidth: width,
    innerHeight: height,
  }: { innerWidth: number; innerHeight: number } = window;

  /* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
  useEffect(
    () => {
      fetch("https://covidtracking.com/api/states/daily")
        .then((res) => res.json())
        .then((raw_data: RawEntry[]) => {
          if (props.data && d3Container.current) {
            const _data: OrderedMap<string, OrderedMap<number, number>> = List(
              raw_data
            )
              .map((e: RawEntry): null | Entry => {
                const date = new Date(e.dateChecked).valueOf();
                return isNaN(date) ? null : { ...e, dateChecked: date };
              })
              .filter(isPresent)
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
                    .sort()
              )
              .toOrderedMap()
              .sortBy((entries: OrderedMap<number, number>) => entries.last());
            console.log(d3Container.current);
            var dataset = [5, 10, 15, 20, 25];

            const svg = d3.select(d3Container.current);
            // @ts-ignore
            //.attr("viewBox", [0, 1, width, height]);
            //.style("overflow", "visible");

            // Bind D3 data
            const data = _data.get("MI");
            if (data) {
              console.log(data.toJS());
              console.log(d3.extent(data.keySeq().toArray()));
              const x = d3
                .scaleLinear()
                .domain(d3.extent(data.keySeq().toArray()) as number[])
                .range([0, width]);
              const y = d3
                .scaleLinear()
                .domain(d3.extent(data.valueSeq().toArray()) as number[])
                .range([0, height]);
              //const line = d3
              //.line()
              //.x((d) => x(d.date))
              //.y((d) => y(d.value));
              const update = svg.selectAll("circle").data(data.toArray());

              // Enter new D3 elements
              update
                .enter()
                .append("circle")
                // @ts-ignore
                .attr("cx", ([d, p]) => x(d))
                .attr("cy", ([d, p]) => {
                  return y(p);
                })
                .attr("r", 22)
                .attr("fill", "blue");

              // Update existing D3 elements
              // @ts-ignore
              //update.attr("x", (d, i) => i * 40).text((d: number) => d);

              // Remove old D3 elements
              update.exit().remove();
            }
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
      width={width}
      height={height - 50}
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
