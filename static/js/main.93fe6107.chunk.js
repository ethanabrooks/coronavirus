(this.webpackJsonpcoronavirus=this.webpackJsonpcoronavirus||[]).push([[0],{166:function(e,t,n){e.exports=n(351)},171:function(e,t,n){},172:function(e,t,n){},351:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),o=n(48),c=n.n(o),i=(n(171),n(11)),l=n(76),s=(n(172),n(173),n(18)),u=n(36),d=function(){var e=r.a.useState({type:"loading"}),t=Object(l.a)(e,2),n=t[0],a=t[1];switch(r.a.useEffect((function(){var e=function(){"loaded"===n.type&&a(Object(i.a)({},n,{window_dimensions:window}))};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}})),r.a.useEffect((function(){fetch("https://covidtracking.com/api/states/daily").then((function(e){return e.json()})).then((function(e){var t=Object(u.a)(e).groupBy((function(e){return e.dateChecked})).map((function(e){return e.groupBy((function(e){return e.state})).map((function(e){return e.first()})).map((function(e){return e.positive}))})),n=t.entrySeq().map((function(e){var t=Object(l.a)(e,2),n=t[0],a=t[1];return Object(u.b)(a).set("date",new Date(n).valueOf())})).toList().sortBy((function(e){return e.get("date")})),r=t.map((function(e){return e.keySeq()})).valueSeq().flatten().toOrderedSet().remove("date"),o=Object(u.b)(r.map((function(e){var t=n.findLast((function(t){return t.has(e)}));return[e,t?t.get(e,0):0]}))),c=r.sortBy((function(e,t){return-o.get(t,0)}));a({type:"loaded",data:n,latest_data:o,states:c,excluded:Object(u.c)(),highlighted:null,window_dimensions:window,selecting:null,selected:null,mouseOverMessage:""})}),(function(e){return a({type:"error",error:e})}))}),[]),n.type){case"loading":return r.a.createElement("div",null,"Loading...");case"error":return r.a.createElement("div",null,"Error: ",n.error.message);case"loaded":var o=new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}),c=function(e){return n.highlighted===e?"#ff0079":"#00b6c6"},d=function(e){switch(n.highlighted){case e:case null:return 1;default:return.3}},f=window,m=f.innerWidth,h=f.innerHeight,g=function(e){return n.latest_data.get(e,0)};return r.a.createElement("div",null,r.a.createElement("div",{className:"title"},r.a.createElement("h1",null,"Coronavirus Cases")),r.a.createElement("div",{className:"instructions"},r.a.createElement("p",null,"Mouse over the graph to see which state each line/area represents."),r.a.createElement("p",null,"".concat(n.mouseOverMessage)),r.a.createElement("p",null,n.excluded.isEmpty()?"":"Click on state names to add this state and all those with fewer cases back to chart.")),r.a.createElement("div",{className:"source"},r.a.createElement("p",null,"source: The Covid Tracking Project")),r.a.createElement("div",{className:"chart"},r.a.createElement(s.b,{width:m,height:h-10,data:(n.selected?n.data.slice(n.selected.left,n.selected.right+1):n.data).toJS(),margin:{top:10,right:10,bottom:10,left:10},onMouseDown:function(e){e&&a(Object(i.a)({},n,{selecting:{left:e.activeTooltipIndex,right:e.activeTooltipIndex}}))},onMouseMove:function(e){if(n.selecting&&e)return a(Object(i.a)({},n,{selecting:{left:n.selecting.left,right:e.activeTooltipIndex}}))},onMouseUp:function(e){return n.selecting&&e&&n.selecting.left!==n.selecting.right?a(Object(i.a)({},n,{selecting:null,selected:n.selecting})):a(Object(i.a)({},n,{selecting:null,selected:null}))}},n.states.filterNot((function(e){return n.excluded.includes(e)})).toArray().map((function(e){return r.a.createElement(s.a,{key:e,type:"monotone",dataKey:e,stroke:c(e),opacity:d(e),isAnimationActive:!1,onMouseOver:function(e){a(Object(i.a)({},n,{highlighted:e.dataKey,mouseOverMessage:"Click to remove all states with more cases (currently) than ".concat(e.dataKey," from the graph."),excluded:n.excluded}))},onMouseLeave:function(e){a(Object(i.a)({},n,{mouseOverMessage:""}))},onClick:function(e){var t=g(e.dataKey);a(Object(i.a)({},n,{excluded:n.states.filter((function(e){return g(e)>t})).toSet().union(n.excluded)}))}})})),r.a.createElement(s.e,{dataKey:"date",tickFormatter:function(e){return o.format(new Date(e))}}),r.a.createElement(s.e,{dataKey:"name"}),r.a.createElement(s.f,{orientation:"right"}),r.a.createElement(s.d,{isAnimationActive:!1,offset:-300,allowEscapeViewBox:{x:!0},labelFormatter:function(e){return o.format(new Date(e))},itemSorter:function(e){return-e.value}}),function(){var e,t;if(null==n.selecting)return null;var a=null===(e=n.data.get(n.selecting.left))||void 0===e?void 0:e.get("date"),o=null===(t=n.data.get(n.selecting.right))||void 0===t?void 0:t.get("date");return a&&o?r.a.createElement(s.c,{x1:a,x2:o,strokeOpacity:.3}):null}())),r.a.createElement("div",{className:"excluded"},n.excluded.map((function(e){return r.a.createElement("h2",{key:e,className:"hover-red",onClick:function(t){var r=g(e);a(Object(i.a)({},n,{excluded:n.excluded.filter((function(e){return g(e)>r}))}))}},e)}))))}};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(d,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[166,1,2]]]);
//# sourceMappingURL=main.93fe6107.chunk.js.map