(this.webpackJsonpcoronavirus=this.webpackJsonpcoronavirus||[]).push([[0],{70:function(e,t,n){e.exports=n(93)},75:function(e,t,n){},93:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),o=n(17),i=n.n(o),u=(n(75),n(18)),c=n(1),l=n(3),s=n(5),m=n(29),f=n(30),d=100,y=100;var x=function(e){var t=e.rawData;a.a.useEffect((function(){var e=function(){return M({width:window.innerWidth,height:window.innerHeight})};return window.addEventListener("resize",e),function(){return window.removeEventListener("resize",e)}}),[]);var n=a.a.useState(null),r=Object(c.a)(n,2),o=r[0],i=r[1],x=a.a.useState(null),h=Object(c.a)(x,2),v=h[0],p=h[1],g=a.a.useState({width:window.innerWidth,height:window.innerHeight}),b=Object(c.a)(g,2),w=b[0],k=w.width,E=w.height,M=b[1],O=a.a.useState(null),j=Object(c.a)(O,2),S=j[0],B=j[1],C=a.a.useState(null),A=Object(c.a)(C,2),D=A[0],X=A[1],Y=a.a.useMemo((function(){return Object(s.a)(t).map((function(e){var t=new Date(e.dateChecked).valueOf();return isNaN(t)?null:Object(u.a)({},e,{dateChecked:t})})).filter(m.isPresent)}),[t]),L=a.a.useMemo((function(){return Y.groupBy((function(e){return e.state})).map((function(e){return e.groupBy((function(e){return e.dateChecked})).map((function(e){return e.first()})).map((function(e){return e.positive})).toOrderedMap().sortBy((function(e,t){return t}))})).toOrderedMap().sortBy((function(e){return-e.last()}))}),[Y]),W=a.a.useState(Object(s.b)(L.keys())),z=Object(c.a)(W,2),q=z[0],N=z[1],H=a.a.useMemo((function(){var e=l.a(Y.toArray(),(function(e){return e.dateChecked})),t=Object(c.a)(e,2),n=t[0],r=t[1],a=l.a(Y.filter((function(e){return q.has(e.state)})).toArray(),(function(e){return e.positive})),o=Object(c.a)(a,2);return{min:{x:n,y:o[0]},max:{x:r,y:o[1]}}}),[Y,q]),J=a.a.useMemo((function(){var e=l.a(Y.filter((function(e){return q.has(e.state)})).toArray(),(function(e){return e.dateChecked})),t=Object(c.a)(e,2),n=t[0],r=t[1],a=l.a(Y.filter((function(e){return q.has(e.state)})).toArray(),(function(e){return e.positive})),o=Object(c.a)(a,2);return{min:{x:n,y:o[0]},max:{x:r,y:o[1]}}}),[Y,q]),F=D||J,I=a.a.useMemo((function(){return Y.groupBy((function(e){return t=H.min.x,n=e.dateChecked,Math.round((n-t)/864e5);var t,n})).map((function(e){return e.groupBy((function(e){return e.state})).map((function(e){return e.first()})).map((function(e){return e.positive})).toOrderedMap().sortBy((function(e){return-e}))})).toOrderedMap().sortBy((function(e){return-e.last()}))}),[Y,H]),P=a.a.useMemo((function(){return l.a(I.keySeq().toArray(),(function(e){return e}))}),[I]),U=Object(c.a)(P,2),$=U[0],G=U[1],K=a.a.useMemo((function(){return function(e){console.log(e);var t=l.c().domain([e.min.x,e.max.x]).range([0,k-d]),n=l.c().domain([e.min.y,e.max.y]).range([E-y,0]),r=l.b().x((function(e){var n=Object(c.a)(e,2),r=n[0];n[1];return t(r)})).y((function(e){var t=Object(c.a)(e,2),r=(t[0],t[1]);return n(r)}));return L.filter((function(e,t){return q.has(t)})).map((function(e,t){var n=t===v,o=Object(s.a)(e.entries()).push([J.max.x,0]).push([J.min.x,0]);return a.a.createElement(a.a.Fragment,{key:t},a.a.createElement("path",{style:{transition:"width 2s"},fill:"none",stroke:n?"#ff0079":"none",d:"".concat(r(e.toArray())),opacity:n?.7:.2}),a.a.createElement("path",{style:{transition:"width 2s"},fill:"#00b6c6",d:"".concat(r(o.toArray())),opacity:n?.7:.2,onMouseEnter:function(){return p(t)},onMouseLeave:function(){return p((function(e){return e===t?null:e}))},onClick:function(){return N(s.b.of(t))}}))})).toArray()}}),[F,v,L,J,E,k,q]),Q=null,R=null;if(null!=o&&o.x<k-d){var T,V=l.b().x((function(e){var t=Object(c.a)(e,2),n=t[0];t[1];return n})).y((function(e){var t=Object(c.a)(e,2);t[0];return t[1]})),Z=l.c().domain([0,k-d]).range([$,G]),_=l.c().domain([$,G]).range([0,k-d]),ee=Math.round(Z(o.x));Q=a.a.createElement("path",{fill:"none",stroke:"black",strokeWidth:.15,d:"".concat(V([[_(ee),0],[_(ee),E]])),style:{pointerEvents:"none"}}),R=a.a.createElement("text",{style:{fontSize:10,userSelect:"none"}},null===(T=I.get(ee))||void 0===T?void 0:T.filter((function(e,t){return q.has(t)})).map((function(e,t){var n=t===v?"#ff0079":"black";return a.a.createElement("tspan",{key:"".concat(t,"-tooltip"),x:o.x+80<k-d?o.x+30:o.x-60,dy:12,fill:n},t,": ",e)})).valueSeq().toArray())}var te=a.a.useMemo((function(){return a.a.createElement("text",{style:{fontSize:10,userSelect:"none"}},L.sortBy((function(e,t){return t})).map((function(e,t){var n=q.has(t),r=n?"black":"lightgrey";return a.a.createElement("tspan",{key:"".concat(t,"-toggle"),x:10,dy:12.8,fill:r,onClick:function(){N(n?q.delete(t):q.add(t))},onDoubleClick:function(){N(s.b.of(t)),X(null)}},t)})).valueSeq().toArray())}),[q,L]),ne=null,re=null;S&&S.to&&(re={min:{x:Math.min(S.from.x,S.to.x),y:Math.min(S.from.y,S.to.y)},max:{x:Math.max(S.from.x,S.to.x),y:Math.max(S.from.y,S.to.y)}},ne=a.a.createElement("svg",{style:{overflow:"visible"}},a.a.createElement("rect",{x:re.min.x,y:re.min.y,width:re.max.x-re.min.x,height:re.max.y-re.min.y,fill:"black",opacity:.3})));var ae=l.c().domain([0,k-d]).range([F.min.x,F.max.x]),oe=l.c().domain([0,E-y]).range([F.max.y,F.min.y]),ie=function(e){return{minX:e.min.x,maxX:e.max.x,minY:e.min.y,maxY:e.max.y}};return a.a.createElement("div",null,a.a.createElement("div",{style:{float:"right",width:k,height:0}},ne),a.a.createElement("div",{style:{float:"left",width:k-d},onDoubleClick:function(){N(Object(s.b)(L.keys())),X(null),B(null)},onClick:function(){return B(null)},onMouseLeave:function(){return B(null)},onMouseDown:function(e){B({from:{x:e.pageX,y:e.pageY},to:null})},onMouseMove:function(e){S&&B(Object(u.a)({},S,{to:{x:e.pageX,y:e.pageY}}))},onMouseUp:function(e){S&&re?(re.max.x-re.min.x)*(re.max.y-re.min.y)>50&&X({min:{x:ae(re.min.x),y:oe(re.max.y)},max:{x:ae(re.max.x),y:oe(re.min.y)}}):(X(null),B(null))}},a.a.createElement(f.Spring,{to:ie(D||J)},(function(e){return a.a.createElement("svg",{className:"d3-component",viewBox:"".concat([0,0,k-d,E-y]),onMouseMove:function(e){return i({x:e.pageX,y:e.pageY})}},K({min:{x:(t=e).minX,y:t.minY},max:{x:t.maxX,y:t.maxY}}),Q,R);var t}))),a.a.createElement("div",{style:{float:"left",width:d}},a.a.createElement("svg",{style:{overflow:"visible"}},te)))},h=function(){var e=a.a.useState({type:"loading"}),t=Object(c.a)(e,2),n=t[0],r=t[1];switch(a.a.useEffect((function(){fetch("https://covidtracking.com/api/states/daily").then((function(e){return e.json()})).then((function(e){return r({type:"loaded",rawData:e})}),(function(e){return r({type:"error",error:e})}))}),[]),n.type){case"loading":return a.a.createElement("div",null,"Loading\u2026");case"error":return a.a.createElement("div",null,"Error: ",n.error.message);case"loaded":return a.a.createElement(x,{rawData:n.rawData})}};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(a.a.createElement(h,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[70,1,2]]]);
//# sourceMappingURL=main.3b6e8e8a.chunk.js.map