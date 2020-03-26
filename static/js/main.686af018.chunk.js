(this.webpackJsonpcoronavirus=this.webpackJsonpcoronavirus||[]).push([[0],{166:function(e,t,n){e.exports=n(351)},171:function(e,t,n){},172:function(e,t,n){},351:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),i=n(47),c=n.n(i),o=(n(171),n(14)),l=n(76),u=(n(172),n(173),n(18)),s=n(51),d=function(){var e=r.a.useState({type:"loading"}),t=Object(l.a)(e,2),n=t[0],a=t[1];switch(r.a.useEffect((function(){var e=function(){"loaded"===n.type&&a(Object(o.a)({},n,{window_dimensions:window}))};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}})),r.a.useEffect((function(){fetch("https://covidtracking.com/api/states/daily").then((function(e){return e.json()})).then((function(e){var t=Object(s.a)(e).groupBy((function(e){return e.dateChecked})).map((function(e){return e.groupBy((function(e){return e.state})).map((function(e){return e.first()})).map((function(e){return e.positive}))})).entrySeq().map((function(e){var t=Object(l.a)(e,2),n=t[0],a=t[1];return Object(s.b)(a).set("date",new Date(n).valueOf())})).toList().sortBy((function(e){return e.get("date")})),n=t.last();if(null==n)return r.a.createElement("div",null,'Error: "Empty data"');var i=n.remove("date").sortBy((function(e,t){return-e})).keySeq();a({type:"loaded",data:t,states:i,excluded:Object(s.c)(),highlighted:null,window_dimensions:window,selecting:null,selected:null})}),(function(e){return a({type:"error",error:e})}))}),[]),n.type){case"loading":return r.a.createElement("div",null,"Loading...");case"error":return r.a.createElement("div",null,"Error: ",n.error.message);case"loaded":var i=new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}),c=function(e){return n.highlighted===e?"#ff0079":"#00b6c6"},d=function(e){switch(n.highlighted){case e:case null:return 1;default:return.3}},m=window,f=m.innerWidth,g=m.innerHeight;return r.a.createElement("div",null,r.a.createElement("div",{className:"title"},r.a.createElement("h1",null,"Coronavirus cases over time")),r.a.createElement("div",{className:"instructions"},r.a.createElement("p",null,"Click to remove lines from graphic and resize."," ",n.excluded.isEmpty()?"":"Click on state names to add back to chart.")),r.a.createElement("div",{className:"source"},r.a.createElement("p",null,"source: The Covid Tracking Project")),r.a.createElement("div",{className:"chart"},r.a.createElement(u.b,{width:f,height:g-10,data:(n.selected?n.data.slice(n.selected.left,n.selected.right+1):n.data).toJS(),margin:{top:10,right:10,bottom:10,left:10},onMouseDown:function(e){e&&a(Object(o.a)({},n,{selecting:{left:e.activeTooltipIndex,right:e.activeTooltipIndex}}))},onMouseMove:function(e){if(n.selecting&&e)return a(Object(o.a)({},n,{selecting:{left:n.selecting.left,right:e.activeTooltipIndex}}))},onMouseUp:function(e){return n.selecting&&e&&n.selecting.left!==n.selecting.right?a(Object(o.a)({},n,{selecting:null,selected:n.selecting})):a(Object(o.a)({},n,{selecting:null,selected:null}))}},n.states.filterNot((function(e){return n.excluded.includes(e)})).toArray().map((function(e){return r.a.createElement(u.a,{key:e,type:"monotone",dataKey:e,stroke:c(e),opacity:d(e),isAnimationActive:!1,onMouseOver:function(e){a(Object(o.a)({},n,{highlighted:e.dataKey,excluded:n.excluded}))},onClick:function(e){a(Object(o.a)({},n,{excluded:n.excluded.add(e.dataKey)}))}})})),r.a.createElement(u.e,{dataKey:"date",tickFormatter:function(e){return i.format(new Date(e))}}),r.a.createElement(u.e,{dataKey:"name"}),r.a.createElement(u.f,{orientation:"right"}),r.a.createElement(u.d,{isAnimationActive:!1,offset:-300,allowEscapeViewBox:{x:!0},labelFormatter:function(e){return i.format(new Date(e))}}),function(){if(null==n.selecting)return null;var e=n.data.get(n.selecting.left),t=n.data.get(n.selecting.right),a=e?e.get("date"):null,i=t?t.get("date"):null;return a&&i?r.a.createElement(u.c,{x1:a,x2:i,strokeOpacity:.3}):null}())),r.a.createElement("div",{className:"excluded"},n.excluded.map((function(e){return r.a.createElement("h2",{key:e,className:"hover-red",onClick:function(t){a(Object(o.a)({},n,{excluded:n.excluded.remove(e)}))}},e)}))))}};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(d,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[166,1,2]]]);
//# sourceMappingURL=main.686af018.chunk.js.map