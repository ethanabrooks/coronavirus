(this.webpackJsonpcoronavirus=this.webpackJsonpcoronavirus||[]).push([[0],{33:function(e,t,n){e.exports=n(63)},38:function(e,t,n){},39:function(e,t,n){},63:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),o=n(27),c=n.n(o),i=(n(38),n(30)),u=(n(39),n(40),n(5)),l=n(29),s=function(){var e=r.a.useState({type:"loading"}),t=Object(i.a)(e,2),n=t[0],a=t[1];switch(r.a.useEffect((function(){fetch("https://covidtracking.com/api/states/daily").then((function(e){return e.json()})).then((function(e){return a({type:"loaded",data:e})}),(function(e){return a({type:"error",error:e})}))}),[]),n.type){case"loading":return r.a.createElement("div",null,"Loading...");case"error":return r.a.createElement("div",null,"Error: ",n.error.message);case"loaded":var o=Object(l.a)(n.data).groupBy((function(e){return e.state})).map((function(e){return e.valueSeq().toList()})).map((function(e){return e.map((function(e){return{x:new Date(e.dateChecked).valueOf(),y:e.positive}})).sort((function(e,t){return e.x-t.x})).toArray()})).toArray();return r.a.createElement("div",null,r.a.createElement(u.e,{xType:"ordinal",width:1300,height:500},r.a.createElement(u.c,null),r.a.createElement(u.a,null),r.a.createElement(u.d,null),r.a.createElement(u.f,null),o.map((function(e){return r.a.createElement(u.b,{className:e[0],data:e[1]})}))))}};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(s,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[33,1,2]]]);
//# sourceMappingURL=main.49678aae.chunk.js.map