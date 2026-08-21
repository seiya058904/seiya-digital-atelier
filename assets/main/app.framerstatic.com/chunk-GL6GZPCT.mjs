var m="__framer_force_showing_editorbar_since",k="__framer_editor_button_position",a="2147483647";var L=300;var s=12,p="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAApNJREFUSA2tlUtLlFEYgEe7mtFFQ8NLFBG1SJAwahtiLVy5ceVSEPQH1LZf0Lp9FO1bdYNyI7gyBFcS2kAzilYq3sfxeYZ55Zv6FGfohWfOd97vnPd23u9MXeZoaeb1Q7gPHXAFzsAS5GACxiEPqVKXqs1kmtAPQi+cAtedToz1PJ8ExxPwDl7CAlRImoN7rBiF86ABHTiGAzMIh8n3O+ifwWc4EL0n5TGTYQijvjNSxbUadozInUeGZ3nuh1WYgpIkM+hGMwYajAgdrfUn+AaLoLTCAxiAOxCZxL4RdB+gZMjxEjwHo4hS8Jh5DR9hz0mKaNizegoNEI7Wee6FXJTISG6AUgDr+QImoAiHie+mwZJow/PRps4uwnsnRj8Epqc4voVJJ8eULOtW4BFYYjPpgjc+3IWI2sh/wFeoVl6xYQ48dDGLfjOwc/ygQqz595hUMVouS9QHBm4l6k3HWpnBLqicgVrlCxujSbR1Swd+UDpQYRS/oVaZZ2MWwlZBB9Zdxf+QTYw8SRgq6sAvz7vH6JULEB9USVHFjzZskgPRQR4ayxoXXIdaHdg9HrB2rErByWxZERnYtrWUzD0esDbtTmXPhzXwHrKLxEUbYGbVyDkWWwkdadfqbPmwDXZSCyh2VAf8BM/nOOJH5Y0QopMt2I5U/KO4DZZJB47XwEX+ex0mGroMV8sLwp56gyuGwiyW4SZ4c8bt2cZzO7jBNeqtsRHbeZ1g9krsMbhfYPv/c5gecA+4yAVuitFszE5Hjva872OMdXagF19JIoOYWyozMTI3J0tmA6gLvXPfO1cc/XOqOLe/HbjwD8yCXRD3VNJROEgatiRZMJsKsbZHia3nAdphtq8fkiWyXJbBe8uM1aXKPouNnz2Bm1kwAAAAAElFTkSuQmCC",h="__framer-editorbar-container",c="__framer-editorbar-label",d="__framer-editorbar-button",_="__framer-editorbar-loading-spinner",w="__framer-editorbar-button-tooltip-visible",E=`
#${h} {
    align-items: center;
    display: flex;
    gap: 8px;
    position: fixed;
    z-index: calc(${a});
    width: max-content;
    cursor: pointer;
}

#${c} {
    background-color: #111;
    border-radius: 8px;
    font-family: "Inter", "Inter-Regular", system-ui, Arial, sans-serif;
    font-size: 12px;
    height: fit-content;
    opacity: 0;
    padding: 4px 8px;
    transition: opacity 0.4s ease-out;
    font-weight: 500;
    flex-shrink: 0;
    position: fixed;
    width: max-content;
    pointer-events: none;
    user-select: none;
}

#${d} {
    all: unset;
    align-items: center;
    border-radius: 15px;
    display: flex;
    height: 30px;
    justify-content: center;
    width: 30px;
    flex-shrink: 0;
}

#${c}.${w} {
    opacity: 1;
}

#${c}, #${d} {
    backdrop-filter: blur(10px);
    background-color: rgba(34, 34, 34, 0.8);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(0, 0, 0, 0.05) 0px 1px 0px 0px, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px;
    color: #fff;
}

#${_} {
    width: ${s}px;
    height: ${s}px;
    -webkit-mask: url(${p});
    mask: url(${p});
    -webkit-mask-size: ${s}px;
    mask-size: ${s}px;
    background-color: #fff;


    animation-duration: 800ms;
    animation-iteration-count: infinite;
    animation-name: __framer-loading-spin;
    animation-timing-function: linear;
}

@keyframes __framer-loading-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
`,x=document.createElement("style");x.innerHTML=E;document.head.appendChild(x);var u=class extends Promise{_state="initial";resolve;reject;get state(){return this._state}pending(){return this._state="pending",this}isResolved(){return this._state==="fulfilled"||this._state==="rejected"}constructor(){let t,n;super((o,r)=>{t=o,n=r}),this.resolve=o=>{this._state="fulfilled",t(o)},this.reject=o=>{this._state="rejected",n(o)}}};u.prototype.constructor=Promise;function i(){return typeof navigator<"u"?navigator:void 0}var R=/Edg\//u;function g(){let e=i();return e?R.test(e.userAgent):!1}var v=/Chrome/u,I=/Google Inc/u;function A(){let e=i();return e?v.test(e.userAgent)&&I.test(e.vendor)&&!g():!1}var O=/AppleWebKit\//u;function T(){let e=i();return e?O.test(e.userAgent)&&!A()&&!g():!1}function S(){let e=i();return e?A()&&e.userAgent.toLowerCase().includes("; wv)"):!1}function y(){let e=i();return e?T()&&!e.userAgent.toLowerCase().includes("safari/"):!1}function U(){return S()||y()}function b(e){let t=window.__framer_editorBarDependencies;if(!t)throw new Error("Dependencies not found");if(t.__version<1||t.__version>3)throw new Error("Unsupported version");let n=t[e];if(!n)throw new Error("Dependency not found");return n}var{createElement:f,memo:X,useCallback:j,useEffect:Z,useRef:z,useState:Y,useLayoutEffect:H}=b("react");function $(e,t,n){let{children:o,...r}=t??{};return n!==void 0&&(r.key=n),f(e,r,o)}function J(e,t,n){let{children:o,...r}=t??{};return n!==void 0&&(r.key=n),f(e,r,...o)}var l=class extends Error{};function q(e,t){if(e)return;if(typeof t=="function")try{t=t()}catch{t="(assert message threw)"}typeof t=="string"&&t.length>2048&&(t=t.slice(0,2048)+"\u2026");let n=new l(t?"Assertion Error: "+t:"Assertion Error");if(n.stack)try{let o=n.stack.split(`
`);o[1]?.includes("assert")?(o.splice(1,1),n.stack=o.join(`
`)):o[0]?.includes("assert")&&(o.splice(0,1),n.stack=o.join(`
`))}catch{}throw n}function ee(e,t){throw t instanceof Error?t:t!==void 0?new Error(String(t)):new Error(e?`Unexpected value: ${e}`:"Application entered invalid state")}export{m as a,k as b,a as c,L as d,h as e,c as f,d as g,_ as h,w as i,u as j,U as k,b as l,X as m,j as n,Z as o,z as p,Y as q,q as r,ee as s,$ as t,J as u};
//# sourceMappingURL=/seiya-digital-atelier/assets/main/app.framerstatic.com/chunk-GL6GZPCT.mjs.map
