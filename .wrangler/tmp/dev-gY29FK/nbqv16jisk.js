var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-RHI0xr/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-RHI0xr/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// .wrangler/tmp/pages-iVWdjF/bundledWorker-0.8840403555845551.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
__name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader2.apply(null, argArray)
    ]);
  }
});
var wt = Object.defineProperty;
var Le = /* @__PURE__ */ __name2((e) => {
  throw TypeError(e);
}, "Le");
var Et = /* @__PURE__ */ __name2((e, t, r) => t in e ? wt(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r, "Et");
var p = /* @__PURE__ */ __name2((e, t, r) => Et(e, typeof t != "symbol" ? t + "" : t, r), "p");
var De = /* @__PURE__ */ __name2((e, t, r) => t.has(e) || Le("Cannot " + r), "De");
var o = /* @__PURE__ */ __name2((e, t, r) => (De(e, t, "read from private field"), r ? r.call(e) : t.get(e)), "o");
var g = /* @__PURE__ */ __name2((e, t, r) => t.has(e) ? Le("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), "g");
var f = /* @__PURE__ */ __name2((e, t, r, s) => (De(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r), "f");
var v = /* @__PURE__ */ __name2((e, t, r) => (De(e, t, "access private method"), r), "v");
var Fe = /* @__PURE__ */ __name2((e, t, r, s) => ({ set _(n) {
  f(e, t, n, r);
}, get _() {
  return o(e, t, s);
} }), "Fe");
var qe = /* @__PURE__ */ __name2((e, t, r) => (s, n) => {
  let i = -1;
  return a(0);
  async function a(h) {
    if (h <= i)
      throw new Error("next() called multiple times");
    i = h;
    let l, c = false, u;
    if (e[h] ? (u = e[h][0][0], s.req.routeIndex = h) : u = h === e.length && n || void 0, u)
      try {
        l = await u(s, () => a(h + 1));
      } catch (d) {
        if (d instanceof Error && t)
          s.error = d, l = await t(d, s), c = true;
        else
          throw d;
      }
    else
      s.finalized === false && r && (l = await r(s));
    return l && (s.finalized === false || c) && (s.res = l), s;
  }
  __name(a, "a");
  __name2(a, "a");
}, "qe");
var yt = Symbol();
var xt = /* @__PURE__ */ __name2(async (e, t = /* @__PURE__ */ Object.create(null)) => {
  const { all: r = false, dot: s = false } = t, i = (e instanceof st ? e.raw.headers : e.headers).get("Content-Type");
  return i != null && i.startsWith("multipart/form-data") || i != null && i.startsWith("application/x-www-form-urlencoded") ? bt(e, { all: r, dot: s }) : {};
}, "xt");
async function bt(e, t) {
  const r = await e.formData();
  return r ? Rt(r, t) : {};
}
__name(bt, "bt");
__name2(bt, "bt");
function Rt(e, t) {
  const r = /* @__PURE__ */ Object.create(null);
  return e.forEach((s, n) => {
    t.all || n.endsWith("[]") ? jt(r, n, s) : r[n] = s;
  }), t.dot && Object.entries(r).forEach(([s, n]) => {
    s.includes(".") && (Ot(r, s, n), delete r[s]);
  }), r;
}
__name(Rt, "Rt");
__name2(Rt, "Rt");
var jt = /* @__PURE__ */ __name2((e, t, r) => {
  e[t] !== void 0 ? Array.isArray(e[t]) ? e[t].push(r) : e[t] = [e[t], r] : t.endsWith("[]") ? e[t] = [r] : e[t] = r;
}, "jt");
var Ot = /* @__PURE__ */ __name2((e, t, r) => {
  let s = e;
  const n = t.split(".");
  n.forEach((i, a) => {
    a === n.length - 1 ? s[i] = r : ((!s[i] || typeof s[i] != "object" || Array.isArray(s[i]) || s[i] instanceof File) && (s[i] = /* @__PURE__ */ Object.create(null)), s = s[i]);
  });
}, "Ot");
var Qe = /* @__PURE__ */ __name2((e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, "Qe");
var St = /* @__PURE__ */ __name2((e) => {
  const { groups: t, path: r } = Tt(e), s = Qe(r);
  return At(s, t);
}, "St");
var Tt = /* @__PURE__ */ __name2((e) => {
  const t = [];
  return e = e.replace(/\{[^}]+\}/g, (r, s) => {
    const n = `@${s}`;
    return t.push([n, r]), n;
  }), { groups: t, path: e };
}, "Tt");
var At = /* @__PURE__ */ __name2((e, t) => {
  for (let r = t.length - 1; r >= 0; r--) {
    const [s] = t[r];
    for (let n = e.length - 1; n >= 0; n--)
      if (e[n].includes(s)) {
        e[n] = e[n].replace(s, t[r][1]);
        break;
      }
  }
  return e;
}, "At");
var Oe = {};
var _t = /* @__PURE__ */ __name2((e, t) => {
  if (e === "*")
    return "*";
  const r = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (r) {
    const s = `${e}#${t}`;
    return Oe[s] || (r[2] ? Oe[s] = t && t[0] !== ":" && t[0] !== "*" ? [s, r[1], new RegExp(`^${r[2]}(?=/${t})`)] : [e, r[1], new RegExp(`^${r[2]}$`)] : Oe[s] = [e, r[1], true]), Oe[s];
  }
  return null;
}, "_t");
var ke = /* @__PURE__ */ __name2((e, t) => {
  try {
    return t(e);
  } catch {
    return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (r) => {
      try {
        return t(r);
      } catch {
        return r;
      }
    });
  }
}, "ke");
var Ct = /* @__PURE__ */ __name2((e) => ke(e, decodeURI), "Ct");
var Ze = /* @__PURE__ */ __name2((e) => {
  const t = e.url, r = t.indexOf("/", t.indexOf(":") + 4);
  let s = r;
  for (; s < t.length; s++) {
    const n = t.charCodeAt(s);
    if (n === 37) {
      const i = t.indexOf("?", s), a = t.slice(r, i === -1 ? void 0 : i);
      return Ct(a.includes("%25") ? a.replace(/%25/g, "%2525") : a);
    } else if (n === 63)
      break;
  }
  return t.slice(r, s);
}, "Ze");
var Pt = /* @__PURE__ */ __name2((e) => {
  const t = Ze(e);
  return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
}, "Pt");
var se = /* @__PURE__ */ __name2((e, t, ...r) => (r.length && (t = se(t, ...r)), `${(e == null ? void 0 : e[0]) === "/" ? "" : "/"}${e}${t === "/" ? "" : `${(e == null ? void 0 : e.at(-1)) === "/" ? "" : "/"}${(t == null ? void 0 : t[0]) === "/" ? t.slice(1) : t}`}`), "se");
var et = /* @__PURE__ */ __name2((e) => {
  if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":"))
    return null;
  const t = e.split("/"), r = [];
  let s = "";
  return t.forEach((n) => {
    if (n !== "" && !/\:/.test(n))
      s += "/" + n;
    else if (/\:/.test(n))
      if (/\?/.test(n)) {
        r.length === 0 && s === "" ? r.push("/") : r.push(s);
        const i = n.replace("?", "");
        s += "/" + i, r.push(s);
      } else
        s += "/" + n;
  }), r.filter((n, i, a) => a.indexOf(n) === i);
}, "et");
var Ie = /* @__PURE__ */ __name2((e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), e.indexOf("%") !== -1 ? ke(e, rt) : e) : e, "Ie");
var tt = /* @__PURE__ */ __name2((e, t, r) => {
  let s;
  if (!r && t && !/[%+]/.test(t)) {
    let a = e.indexOf("?", 8);
    if (a === -1)
      return;
    for (e.startsWith(t, a + 1) || (a = e.indexOf(`&${t}`, a + 1)); a !== -1; ) {
      const h = e.charCodeAt(a + t.length + 1);
      if (h === 61) {
        const l = a + t.length + 2, c = e.indexOf("&", l);
        return Ie(e.slice(l, c === -1 ? void 0 : c));
      } else if (h == 38 || isNaN(h))
        return "";
      a = e.indexOf(`&${t}`, a + 1);
    }
    if (s = /[%+]/.test(e), !s)
      return;
  }
  const n = {};
  s ?? (s = /[%+]/.test(e));
  let i = e.indexOf("?", 8);
  for (; i !== -1; ) {
    const a = e.indexOf("&", i + 1);
    let h = e.indexOf("=", i);
    h > a && a !== -1 && (h = -1);
    let l = e.slice(i + 1, h === -1 ? a === -1 ? void 0 : a : h);
    if (s && (l = Ie(l)), i = a, l === "")
      continue;
    let c;
    h === -1 ? c = "" : (c = e.slice(h + 1, a === -1 ? void 0 : a), s && (c = Ie(c))), r ? (n[l] && Array.isArray(n[l]) || (n[l] = []), n[l].push(c)) : n[l] ?? (n[l] = c);
  }
  return t ? n[t] : n;
}, "tt");
var Nt = tt;
var Dt = /* @__PURE__ */ __name2((e, t) => tt(e, t, true), "Dt");
var rt = decodeURIComponent;
var Ue = /* @__PURE__ */ __name2((e) => ke(e, rt), "Ue");
var ae;
var A;
var L;
var nt;
var it;
var $e;
var U;
var Ve;
var st = (Ve = /* @__PURE__ */ __name2(class {
  constructor(e, t = "/", r = [[]]) {
    g(this, L);
    p(this, "raw");
    g(this, ae);
    g(this, A);
    p(this, "routeIndex", 0);
    p(this, "path");
    p(this, "bodyCache", {});
    g(this, U, (e2) => {
      const { bodyCache: t2, raw: r2 } = this, s = t2[e2];
      if (s)
        return s;
      const n = Object.keys(t2)[0];
      return n ? t2[n].then((i) => (n === "json" && (i = JSON.stringify(i)), new Response(i)[e2]())) : t2[e2] = r2[e2]();
    });
    this.raw = e, this.path = t, f(this, A, r), f(this, ae, {});
  }
  param(e) {
    return e ? v(this, L, nt).call(this, e) : v(this, L, it).call(this);
  }
  query(e) {
    return Nt(this.url, e);
  }
  queries(e) {
    return Dt(this.url, e);
  }
  header(e) {
    if (e)
      return this.raw.headers.get(e) ?? void 0;
    const t = {};
    return this.raw.headers.forEach((r, s) => {
      t[s] = r;
    }), t;
  }
  async parseBody(e) {
    var t;
    return (t = this.bodyCache).parsedBody ?? (t.parsedBody = await xt(this, e));
  }
  json() {
    return o(this, U).call(this, "text").then((e) => JSON.parse(e));
  }
  text() {
    return o(this, U).call(this, "text");
  }
  arrayBuffer() {
    return o(this, U).call(this, "arrayBuffer");
  }
  blob() {
    return o(this, U).call(this, "blob");
  }
  formData() {
    return o(this, U).call(this, "formData");
  }
  addValidatedData(e, t) {
    o(this, ae)[e] = t;
  }
  valid(e) {
    return o(this, ae)[e];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [yt]() {
    return o(this, A);
  }
  get matchedRoutes() {
    return o(this, A)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return o(this, A)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
}, "Ve"), ae = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakSet(), nt = /* @__PURE__ */ __name2(function(e) {
  const t = o(this, A)[0][this.routeIndex][1][e], r = v(this, L, $e).call(this, t);
  return r && /\%/.test(r) ? Ue(r) : r;
}, "nt"), it = /* @__PURE__ */ __name2(function() {
  const e = {}, t = Object.keys(o(this, A)[0][this.routeIndex][1]);
  for (const r of t) {
    const s = v(this, L, $e).call(this, o(this, A)[0][this.routeIndex][1][r]);
    s !== void 0 && (e[r] = /\%/.test(s) ? Ue(s) : s);
  }
  return e;
}, "it"), $e = /* @__PURE__ */ __name2(function(e) {
  return o(this, A)[1] ? o(this, A)[1][e] : e;
}, "$e"), U = /* @__PURE__ */ new WeakMap(), Ve);
var It = { Stringify: 1 };
var at = /* @__PURE__ */ __name2(async (e, t, r, s, n) => {
  typeof e == "object" && !(e instanceof String) && (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  const i = e.callbacks;
  return i != null && i.length ? (n ? n[0] += e : n = [e], Promise.all(i.map((h) => h({ phase: t, buffer: n, context: s }))).then((h) => Promise.all(h.filter(Boolean).map((l) => at(l, t, false, s, n))).then(() => n[0]))) : Promise.resolve(e);
}, "at");
var Ht = "text/plain; charset=UTF-8";
var He = /* @__PURE__ */ __name2((e, t) => ({ "Content-Type": e, ...t }), "He");
var ve;
var we;
var H;
var oe;
var $;
var T;
var Ee;
var ce;
var le;
var Y;
var ye;
var xe;
var B;
var ne;
var Ge;
var $t = (Ge = /* @__PURE__ */ __name2(class {
  constructor(e, t) {
    g(this, B);
    g(this, ve);
    g(this, we);
    p(this, "env", {});
    g(this, H);
    p(this, "finalized", false);
    p(this, "error");
    g(this, oe);
    g(this, $);
    g(this, T);
    g(this, Ee);
    g(this, ce);
    g(this, le);
    g(this, Y);
    g(this, ye);
    g(this, xe);
    p(this, "render", (...e2) => (o(this, ce) ?? f(this, ce, (t2) => this.html(t2)), o(this, ce).call(this, ...e2)));
    p(this, "setLayout", (e2) => f(this, Ee, e2));
    p(this, "getLayout", () => o(this, Ee));
    p(this, "setRenderer", (e2) => {
      f(this, ce, e2);
    });
    p(this, "header", (e2, t2, r) => {
      this.finalized && f(this, T, new Response(o(this, T).body, o(this, T)));
      const s = o(this, T) ? o(this, T).headers : o(this, Y) ?? f(this, Y, new Headers());
      t2 === void 0 ? s.delete(e2) : r != null && r.append ? s.append(e2, t2) : s.set(e2, t2);
    });
    p(this, "status", (e2) => {
      f(this, oe, e2);
    });
    p(this, "set", (e2, t2) => {
      o(this, H) ?? f(this, H, /* @__PURE__ */ new Map()), o(this, H).set(e2, t2);
    });
    p(this, "get", (e2) => o(this, H) ? o(this, H).get(e2) : void 0);
    p(this, "newResponse", (...e2) => v(this, B, ne).call(this, ...e2));
    p(this, "body", (e2, t2, r) => v(this, B, ne).call(this, e2, t2, r));
    p(this, "text", (e2, t2, r) => !o(this, Y) && !o(this, oe) && !t2 && !r && !this.finalized ? new Response(e2) : v(this, B, ne).call(this, e2, t2, He(Ht, r)));
    p(this, "json", (e2, t2, r) => v(this, B, ne).call(this, JSON.stringify(e2), t2, He("application/json", r)));
    p(this, "html", (e2, t2, r) => {
      const s = /* @__PURE__ */ __name2((n) => v(this, B, ne).call(this, n, t2, He("text/html; charset=UTF-8", r)), "s");
      return typeof e2 == "object" ? at(e2, It.Stringify, false, {}).then(s) : s(e2);
    });
    p(this, "redirect", (e2, t2) => {
      const r = String(e2);
      return this.header("Location", /[^\x00-\xFF]/.test(r) ? encodeURI(r) : r), this.newResponse(null, t2 ?? 302);
    });
    p(this, "notFound", () => (o(this, le) ?? f(this, le, () => new Response()), o(this, le).call(this, this)));
    f(this, ve, e), t && (f(this, $, t.executionCtx), this.env = t.env, f(this, le, t.notFoundHandler), f(this, xe, t.path), f(this, ye, t.matchResult));
  }
  get req() {
    return o(this, we) ?? f(this, we, new st(o(this, ve), o(this, xe), o(this, ye))), o(this, we);
  }
  get event() {
    if (o(this, $) && "respondWith" in o(this, $))
      return o(this, $);
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (o(this, $))
      return o(this, $);
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return o(this, T) || f(this, T, new Response(null, { headers: o(this, Y) ?? f(this, Y, new Headers()) }));
  }
  set res(e) {
    if (o(this, T) && e) {
      e = new Response(e.body, e);
      for (const [t, r] of o(this, T).headers.entries())
        if (t !== "content-type")
          if (t === "set-cookie") {
            const s = o(this, T).headers.getSetCookie();
            e.headers.delete("set-cookie");
            for (const n of s)
              e.headers.append("set-cookie", n);
          } else
            e.headers.set(t, r);
    }
    f(this, T, e), this.finalized = true;
  }
  get var() {
    return o(this, H) ? Object.fromEntries(o(this, H)) : {};
  }
}, "Ge"), ve = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap(), oe = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakSet(), ne = /* @__PURE__ */ __name2(function(e, t, r) {
  const s = o(this, T) ? new Headers(o(this, T).headers) : o(this, Y) ?? new Headers();
  if (typeof t == "object" && "headers" in t) {
    const i = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
    for (const [a, h] of i)
      a.toLowerCase() === "set-cookie" ? s.append(a, h) : s.set(a, h);
  }
  if (r)
    for (const [i, a] of Object.entries(r))
      if (typeof a == "string")
        s.set(i, a);
      else {
        s.delete(i);
        for (const h of a)
          s.append(i, h);
      }
  const n = typeof t == "number" ? t : (t == null ? void 0 : t.status) ?? o(this, oe);
  return new Response(e, { status: n, headers: s });
}, "ne"), Ge);
var y = "ALL";
var kt = "all";
var Mt = ["get", "post", "put", "delete", "options", "patch"];
var ot = "Can not add a route since the matcher is already built.";
var ct = /* @__PURE__ */ __name2(class extends Error {
}, "ct");
var Lt = "__COMPOSED_HANDLER";
var Ft = /* @__PURE__ */ __name2((e) => e.text("404 Not Found", 404), "Ft");
var Be = /* @__PURE__ */ __name2((e, t) => {
  if ("getResponse" in e) {
    const r = e.getResponse();
    return t.newResponse(r.body, r);
  }
  return console.error(e), t.text("Internal Server Error", 500);
}, "Be");
var _;
var x;
var lt;
var C;
var K;
var Se;
var Te;
var he;
var qt = (he = /* @__PURE__ */ __name2(class {
  constructor(t = {}) {
    g(this, x);
    p(this, "get");
    p(this, "post");
    p(this, "put");
    p(this, "delete");
    p(this, "options");
    p(this, "patch");
    p(this, "all");
    p(this, "on");
    p(this, "use");
    p(this, "router");
    p(this, "getPath");
    p(this, "_basePath", "/");
    g(this, _, "/");
    p(this, "routes", []);
    g(this, C, Ft);
    p(this, "errorHandler", Be);
    p(this, "onError", (t2) => (this.errorHandler = t2, this));
    p(this, "notFound", (t2) => (f(this, C, t2), this));
    p(this, "fetch", (t2, ...r) => v(this, x, Te).call(this, t2, r[1], r[0], t2.method));
    p(this, "request", (t2, r, s2, n2) => t2 instanceof Request ? this.fetch(r ? new Request(t2, r) : t2, s2, n2) : (t2 = t2.toString(), this.fetch(new Request(/^https?:\/\//.test(t2) ? t2 : `http://localhost${se("/", t2)}`, r), s2, n2)));
    p(this, "fire", () => {
      addEventListener("fetch", (t2) => {
        t2.respondWith(v(this, x, Te).call(this, t2.request, t2, void 0, t2.request.method));
      });
    });
    [...Mt, kt].forEach((i) => {
      this[i] = (a, ...h) => (typeof a == "string" ? f(this, _, a) : v(this, x, K).call(this, i, o(this, _), a), h.forEach((l) => {
        v(this, x, K).call(this, i, o(this, _), l);
      }), this);
    }), this.on = (i, a, ...h) => {
      for (const l of [a].flat()) {
        f(this, _, l);
        for (const c of [i].flat())
          h.map((u) => {
            v(this, x, K).call(this, c.toUpperCase(), o(this, _), u);
          });
      }
      return this;
    }, this.use = (i, ...a) => (typeof i == "string" ? f(this, _, i) : (f(this, _, "*"), a.unshift(i)), a.forEach((h) => {
      v(this, x, K).call(this, y, o(this, _), h);
    }), this);
    const { strict: s, ...n } = t;
    Object.assign(this, n), this.getPath = s ?? true ? t.getPath ?? Ze : Pt;
  }
  route(t, r) {
    const s = this.basePath(t);
    return r.routes.map((n) => {
      var a;
      let i;
      r.errorHandler === Be ? i = n.handler : (i = /* @__PURE__ */ __name2(async (h, l) => (await qe([], r.errorHandler)(h, () => n.handler(h, l))).res, "i"), i[Lt] = n.handler), v(a = s, x, K).call(a, n.method, n.path, i);
    }), this;
  }
  basePath(t) {
    const r = v(this, x, lt).call(this);
    return r._basePath = se(this._basePath, t), r;
  }
  mount(t, r, s) {
    let n, i;
    s && (typeof s == "function" ? i = s : (i = s.optionHandler, s.replaceRequest === false ? n = /* @__PURE__ */ __name2((l) => l, "n") : n = s.replaceRequest));
    const a = i ? (l) => {
      const c = i(l);
      return Array.isArray(c) ? c : [c];
    } : (l) => {
      let c;
      try {
        c = l.executionCtx;
      } catch {
      }
      return [l.env, c];
    };
    n || (n = (() => {
      const l = se(this._basePath, t), c = l === "/" ? 0 : l.length;
      return (u) => {
        const d = new URL(u.url);
        return d.pathname = d.pathname.slice(c) || "/", new Request(d, u);
      };
    })());
    const h = /* @__PURE__ */ __name2(async (l, c) => {
      const u = await r(n(l.req.raw), ...a(l));
      if (u)
        return u;
      await c();
    }, "h");
    return v(this, x, K).call(this, y, se(t, "*"), h), this;
  }
}, "he"), _ = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakSet(), lt = /* @__PURE__ */ __name2(function() {
  const t = new he({ router: this.router, getPath: this.getPath });
  return t.errorHandler = this.errorHandler, f(t, C, o(this, C)), t.routes = this.routes, t;
}, "lt"), C = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ __name2(function(t, r, s) {
  t = t.toUpperCase(), r = se(this._basePath, r);
  const n = { basePath: this._basePath, path: r, method: t, handler: s };
  this.router.add(t, r, [s, n]), this.routes.push(n);
}, "K"), Se = /* @__PURE__ */ __name2(function(t, r) {
  if (t instanceof Error)
    return this.errorHandler(t, r);
  throw t;
}, "Se"), Te = /* @__PURE__ */ __name2(function(t, r, s, n) {
  if (n === "HEAD")
    return (async () => new Response(null, await v(this, x, Te).call(this, t, r, s, "GET")))();
  const i = this.getPath(t, { env: s }), a = this.router.match(n, i), h = new $t(t, { path: i, matchResult: a, env: s, executionCtx: r, notFoundHandler: o(this, C) });
  if (a[0].length === 1) {
    let c;
    try {
      c = a[0][0][0][0](h, async () => {
        h.res = await o(this, C).call(this, h);
      });
    } catch (u) {
      return v(this, x, Se).call(this, u, h);
    }
    return c instanceof Promise ? c.then((u) => u || (h.finalized ? h.res : o(this, C).call(this, h))).catch((u) => v(this, x, Se).call(this, u, h)) : c ?? o(this, C).call(this, h);
  }
  const l = qe(a[0], this.errorHandler, o(this, C));
  return (async () => {
    try {
      const c = await l(h);
      if (!c.finalized)
        throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
      return c.res;
    } catch (c) {
      return v(this, x, Se).call(this, c, h);
    }
  })();
}, "Te"), he);
var ht = [];
function Ut(e, t) {
  const r = this.buildAllMatchers(), s = /* @__PURE__ */ __name2((n, i) => {
    const a = r[n] || r[y], h = a[2][i];
    if (h)
      return h;
    const l = i.match(a[0]);
    if (!l)
      return [[], ht];
    const c = l.indexOf("", 1);
    return [a[1][c], l];
  }, "s");
  return this.match = s, s(e, t);
}
__name(Ut, "Ut");
__name2(Ut, "Ut");
var _e = "[^/]+";
var ge = ".*";
var me = "(?:|/.*)";
var ie = Symbol();
var Bt = new Set(".\\+*[^]$()");
function zt(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === ge || e === me ? 1 : t === ge || t === me ? -1 : e === _e ? 1 : t === _e ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
__name(zt, "zt");
__name2(zt, "zt");
var X;
var Q;
var P;
var te;
var Wt = (te = /* @__PURE__ */ __name2(class {
  constructor() {
    g(this, X);
    g(this, Q);
    g(this, P, /* @__PURE__ */ Object.create(null));
  }
  insert(t, r, s, n, i) {
    if (t.length === 0) {
      if (o(this, X) !== void 0)
        throw ie;
      if (i)
        return;
      f(this, X, r);
      return;
    }
    const [a, ...h] = t, l = a === "*" ? h.length === 0 ? ["", "", ge] : ["", "", _e] : a === "/*" ? ["", "", me] : a.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let c;
    if (l) {
      const u = l[1];
      let d = l[2] || _e;
      if (u && l[2] && (d === ".*" || (d = d.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(d))))
        throw ie;
      if (c = o(this, P)[d], !c) {
        if (Object.keys(o(this, P)).some((m) => m !== ge && m !== me))
          throw ie;
        if (i)
          return;
        c = o(this, P)[d] = new te(), u !== "" && f(c, Q, n.varIndex++);
      }
      !i && u !== "" && s.push([u, o(c, Q)]);
    } else if (c = o(this, P)[a], !c) {
      if (Object.keys(o(this, P)).some((u) => u.length > 1 && u !== ge && u !== me))
        throw ie;
      if (i)
        return;
      c = o(this, P)[a] = new te();
    }
    c.insert(h, r, s, n, i);
  }
  buildRegExpStr() {
    const r = Object.keys(o(this, P)).sort(zt).map((s) => {
      const n = o(this, P)[s];
      return (typeof o(n, Q) == "number" ? `(${s})@${o(n, Q)}` : Bt.has(s) ? `\\${s}` : s) + n.buildRegExpStr();
    });
    return typeof o(this, X) == "number" && r.unshift(`#${o(this, X)}`), r.length === 0 ? "" : r.length === 1 ? r[0] : "(?:" + r.join("|") + ")";
  }
}, "te"), X = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap(), te);
var Ce;
var be;
var Ke;
var Vt = (Ke = /* @__PURE__ */ __name2(class {
  constructor() {
    g(this, Ce, { varIndex: 0 });
    g(this, be, new Wt());
  }
  insert(e, t, r) {
    const s = [], n = [];
    for (let a = 0; ; ) {
      let h = false;
      if (e = e.replace(/\{[^}]+\}/g, (l) => {
        const c = `@\\${a}`;
        return n[a] = [c, l], a++, h = true, c;
      }), !h)
        break;
    }
    const i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let a = n.length - 1; a >= 0; a--) {
      const [h] = n[a];
      for (let l = i.length - 1; l >= 0; l--)
        if (i[l].indexOf(h) !== -1) {
          i[l] = i[l].replace(h, n[a][1]);
          break;
        }
    }
    return o(this, be).insert(i, t, s, o(this, Ce), r), s;
  }
  buildRegExp() {
    let e = o(this, be).buildRegExpStr();
    if (e === "")
      return [/^$/, [], []];
    let t = 0;
    const r = [], s = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (n, i, a) => i !== void 0 ? (r[++t] = Number(i), "$()") : (a !== void 0 && (s[Number(a)] = ++t), "")), [new RegExp(`^${e}`), r, s];
  }
}, "Ke"), Ce = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), Ke);
var Gt = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var Ae = /* @__PURE__ */ Object.create(null);
function ut(e) {
  return Ae[e] ?? (Ae[e] = new RegExp(e === "*" ? "" : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, r) => r ? `\\${r}` : "(?:|/.*)")}$`));
}
__name(ut, "ut");
__name2(ut, "ut");
function Kt() {
  Ae = /* @__PURE__ */ Object.create(null);
}
__name(Kt, "Kt");
__name2(Kt, "Kt");
function Jt(e) {
  var c;
  const t = new Vt(), r = [];
  if (e.length === 0)
    return Gt;
  const s = e.map((u) => [!/\*|\/:/.test(u[0]), ...u]).sort(([u, d], [m, E]) => u ? 1 : m ? -1 : d.length - E.length), n = /* @__PURE__ */ Object.create(null);
  for (let u = 0, d = -1, m = s.length; u < m; u++) {
    const [E, b, N] = s[u];
    E ? n[b] = [N.map(([R]) => [R, /* @__PURE__ */ Object.create(null)]), ht] : d++;
    let w;
    try {
      w = t.insert(b, d, E);
    } catch (R) {
      throw R === ie ? new ct(b) : R;
    }
    E || (r[d] = N.map(([R, F]) => {
      const Re = /* @__PURE__ */ Object.create(null);
      for (F -= 1; F >= 0; F--) {
        const [je, D] = w[F];
        Re[je] = D;
      }
      return [R, Re];
    }));
  }
  const [i, a, h] = t.buildRegExp();
  for (let u = 0, d = r.length; u < d; u++)
    for (let m = 0, E = r[u].length; m < E; m++) {
      const b = (c = r[u][m]) == null ? void 0 : c[1];
      if (!b)
        continue;
      const N = Object.keys(b);
      for (let w = 0, R = N.length; w < R; w++)
        b[N[w]] = h[b[N[w]]];
    }
  const l = [];
  for (const u in a)
    l[u] = r[a[u]];
  return [i, l, n];
}
__name(Jt, "Jt");
__name2(Jt, "Jt");
function re(e, t) {
  if (e) {
    for (const r of Object.keys(e).sort((s, n) => n.length - s.length))
      if (ut(r).test(t))
        return [...e[r]];
  }
}
__name(re, "re");
__name2(re, "re");
var z;
var W;
var Pe;
var dt;
var Je;
var Yt = (Je = /* @__PURE__ */ __name2(class {
  constructor() {
    g(this, Pe);
    p(this, "name", "RegExpRouter");
    g(this, z);
    g(this, W);
    p(this, "match", Ut);
    f(this, z, { [y]: /* @__PURE__ */ Object.create(null) }), f(this, W, { [y]: /* @__PURE__ */ Object.create(null) });
  }
  add(e, t, r) {
    var h;
    const s = o(this, z), n = o(this, W);
    if (!s || !n)
      throw new Error(ot);
    s[e] || [s, n].forEach((l) => {
      l[e] = /* @__PURE__ */ Object.create(null), Object.keys(l[y]).forEach((c) => {
        l[e][c] = [...l[y][c]];
      });
    }), t === "/*" && (t = "*");
    const i = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const l = ut(t);
      e === y ? Object.keys(s).forEach((c) => {
        var u;
        (u = s[c])[t] || (u[t] = re(s[c], t) || re(s[y], t) || []);
      }) : (h = s[e])[t] || (h[t] = re(s[e], t) || re(s[y], t) || []), Object.keys(s).forEach((c) => {
        (e === y || e === c) && Object.keys(s[c]).forEach((u) => {
          l.test(u) && s[c][u].push([r, i]);
        });
      }), Object.keys(n).forEach((c) => {
        (e === y || e === c) && Object.keys(n[c]).forEach((u) => l.test(u) && n[c][u].push([r, i]));
      });
      return;
    }
    const a = et(t) || [t];
    for (let l = 0, c = a.length; l < c; l++) {
      const u = a[l];
      Object.keys(n).forEach((d) => {
        var m;
        (e === y || e === d) && ((m = n[d])[u] || (m[u] = [...re(s[d], u) || re(s[y], u) || []]), n[d][u].push([r, i - c + l + 1]));
      });
    }
  }
  buildAllMatchers() {
    const e = /* @__PURE__ */ Object.create(null);
    return Object.keys(o(this, W)).concat(Object.keys(o(this, z))).forEach((t) => {
      e[t] || (e[t] = v(this, Pe, dt).call(this, t));
    }), f(this, z, f(this, W, void 0)), Kt(), e;
  }
}, "Je"), z = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), dt = /* @__PURE__ */ __name2(function(e) {
  const t = [];
  let r = e === y;
  return [o(this, z), o(this, W)].forEach((s) => {
    const n = s[e] ? Object.keys(s[e]).map((i) => [i, s[e][i]]) : [];
    n.length !== 0 ? (r || (r = true), t.push(...n)) : e !== y && t.push(...Object.keys(s[y]).map((i) => [i, s[y][i]]));
  }), r ? Jt(t) : null;
}, "dt"), Je);
var V;
var k;
var Ye;
var Xt = (Ye = /* @__PURE__ */ __name2(class {
  constructor(e) {
    p(this, "name", "SmartRouter");
    g(this, V, []);
    g(this, k, []);
    f(this, V, e.routers);
  }
  add(e, t, r) {
    if (!o(this, k))
      throw new Error(ot);
    o(this, k).push([e, t, r]);
  }
  match(e, t) {
    if (!o(this, k))
      throw new Error("Fatal error");
    const r = o(this, V), s = o(this, k), n = r.length;
    let i = 0, a;
    for (; i < n; i++) {
      const h = r[i];
      try {
        for (let l = 0, c = s.length; l < c; l++)
          h.add(...s[l]);
        a = h.match(e, t);
      } catch (l) {
        if (l instanceof ct)
          continue;
        throw l;
      }
      this.match = h.match.bind(h), f(this, V, [h]), f(this, k, void 0);
      break;
    }
    if (i === n)
      throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, a;
  }
  get activeRouter() {
    if (o(this, k) || o(this, V).length !== 1)
      throw new Error("No active router has been determined yet.");
    return o(this, V)[0];
  }
}, "Ye"), V = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), Ye);
var pe = /* @__PURE__ */ Object.create(null);
var G;
var S;
var Z;
var ue;
var O;
var M;
var J;
var de;
var Qt = (de = /* @__PURE__ */ __name2(class {
  constructor(t, r, s) {
    g(this, M);
    g(this, G);
    g(this, S);
    g(this, Z);
    g(this, ue, 0);
    g(this, O, pe);
    if (f(this, S, s || /* @__PURE__ */ Object.create(null)), f(this, G, []), t && r) {
      const n = /* @__PURE__ */ Object.create(null);
      n[t] = { handler: r, possibleKeys: [], score: 0 }, f(this, G, [n]);
    }
    f(this, Z, []);
  }
  insert(t, r, s) {
    f(this, ue, ++Fe(this, ue)._);
    let n = this;
    const i = St(r), a = [];
    for (let h = 0, l = i.length; h < l; h++) {
      const c = i[h], u = i[h + 1], d = _t(c, u), m = Array.isArray(d) ? d[0] : c;
      if (m in o(n, S)) {
        n = o(n, S)[m], d && a.push(d[1]);
        continue;
      }
      o(n, S)[m] = new de(), d && (o(n, Z).push(d), a.push(d[1])), n = o(n, S)[m];
    }
    return o(n, G).push({ [t]: { handler: s, possibleKeys: a.filter((h, l, c) => c.indexOf(h) === l), score: o(this, ue) } }), n;
  }
  search(t, r) {
    var l;
    const s = [];
    f(this, O, pe);
    let i = [this];
    const a = Qe(r), h = [];
    for (let c = 0, u = a.length; c < u; c++) {
      const d = a[c], m = c === u - 1, E = [];
      for (let b = 0, N = i.length; b < N; b++) {
        const w = i[b], R = o(w, S)[d];
        R && (f(R, O, o(w, O)), m ? (o(R, S)["*"] && s.push(...v(this, M, J).call(this, o(R, S)["*"], t, o(w, O))), s.push(...v(this, M, J).call(this, R, t, o(w, O)))) : E.push(R));
        for (let F = 0, Re = o(w, Z).length; F < Re; F++) {
          const je = o(w, Z)[F], D = o(w, O) === pe ? {} : { ...o(w, O) };
          if (je === "*") {
            const q = o(w, S)["*"];
            q && (s.push(...v(this, M, J).call(this, q, t, o(w, O))), f(q, O, D), E.push(q));
            continue;
          }
          const [mt, Me, fe] = je;
          if (!d && !(fe instanceof RegExp))
            continue;
          const I = o(w, S)[mt], vt = a.slice(c).join("/");
          if (fe instanceof RegExp) {
            const q = fe.exec(vt);
            if (q) {
              if (D[Me] = q[0], s.push(...v(this, M, J).call(this, I, t, o(w, O), D)), Object.keys(o(I, S)).length) {
                f(I, O, D);
                const Ne = ((l = q[0].match(/\//)) == null ? void 0 : l.length) ?? 0;
                (h[Ne] || (h[Ne] = [])).push(I);
              }
              continue;
            }
          }
          (fe === true || fe.test(d)) && (D[Me] = d, m ? (s.push(...v(this, M, J).call(this, I, t, D, o(w, O))), o(I, S)["*"] && s.push(...v(this, M, J).call(this, o(I, S)["*"], t, D, o(w, O)))) : (f(I, O, D), E.push(I)));
        }
      }
      i = E.concat(h.shift() ?? []);
    }
    return s.length > 1 && s.sort((c, u) => c.score - u.score), [s.map(({ handler: c, params: u }) => [c, u])];
  }
}, "de"), G = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakMap(), ue = /* @__PURE__ */ new WeakMap(), O = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakSet(), J = /* @__PURE__ */ __name2(function(t, r, s, n) {
  const i = [];
  for (let a = 0, h = o(t, G).length; a < h; a++) {
    const l = o(t, G)[a], c = l[r] || l[y], u = {};
    if (c !== void 0 && (c.params = /* @__PURE__ */ Object.create(null), i.push(c), s !== pe || n && n !== pe))
      for (let d = 0, m = c.possibleKeys.length; d < m; d++) {
        const E = c.possibleKeys[d], b = u[c.score];
        c.params[E] = n != null && n[E] && !b ? n[E] : s[E] ?? (n == null ? void 0 : n[E]), u[c.score] = true;
      }
  }
  return i;
}, "J"), de);
var ee;
var Xe;
var Zt = (Xe = /* @__PURE__ */ __name2(class {
  constructor() {
    p(this, "name", "TrieRouter");
    g(this, ee);
    f(this, ee, new Qt());
  }
  add(e, t, r) {
    const s = et(t);
    if (s) {
      for (let n = 0, i = s.length; n < i; n++)
        o(this, ee).insert(e, s[n], r);
      return;
    }
    o(this, ee).insert(e, t, r);
  }
  match(e, t) {
    return o(this, ee).search(e, t);
  }
}, "Xe"), ee = /* @__PURE__ */ new WeakMap(), Xe);
var ft = /* @__PURE__ */ __name2(class extends qt {
  constructor(e = {}) {
    super(e), this.router = e.router ?? new Xt({ routers: [new Yt(), new Zt()] });
  }
}, "ft");
var er = /* @__PURE__ */ __name2((e) => {
  const r = { ...{ origin: "*", allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"], allowHeaders: [], exposeHeaders: [] }, ...e }, s = ((i) => typeof i == "string" ? i === "*" ? () => i : (a) => i === a ? a : null : typeof i == "function" ? i : (a) => i.includes(a) ? a : null)(r.origin), n = ((i) => typeof i == "function" ? i : Array.isArray(i) ? () => i : () => [])(r.allowMethods);
  return async function(a, h) {
    var u;
    function l(d, m) {
      a.res.headers.set(d, m);
    }
    __name(l, "l");
    __name2(l, "l");
    const c = await s(a.req.header("origin") || "", a);
    if (c && l("Access-Control-Allow-Origin", c), r.credentials && l("Access-Control-Allow-Credentials", "true"), (u = r.exposeHeaders) != null && u.length && l("Access-Control-Expose-Headers", r.exposeHeaders.join(",")), a.req.method === "OPTIONS") {
      r.origin !== "*" && l("Vary", "Origin"), r.maxAge != null && l("Access-Control-Max-Age", r.maxAge.toString());
      const d = await n(a.req.header("origin") || "", a);
      d.length && l("Access-Control-Allow-Methods", d.join(","));
      let m = r.allowHeaders;
      if (!(m != null && m.length)) {
        const E = a.req.header("Access-Control-Request-Headers");
        E && (m = E.split(/\s*,\s*/));
      }
      return m != null && m.length && (l("Access-Control-Allow-Headers", m.join(",")), a.res.headers.append("Vary", "Access-Control-Request-Headers")), a.res.headers.delete("Content-Length"), a.res.headers.delete("Content-Type"), new Response(null, { headers: a.res.headers, status: 204, statusText: "No Content" });
    }
    await h(), r.origin !== "*" && a.header("Vary", "Origin", { append: true });
  };
}, "er");
var tr = /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ze = /* @__PURE__ */ __name2((e, t = sr) => {
  const r = /\.([a-zA-Z0-9]+?)$/, s = e.match(r);
  if (!s)
    return;
  let n = t[s[1]];
  return n && n.startsWith("text") && (n += "; charset=utf-8"), n;
}, "ze");
var rr = { aac: "audio/aac", avi: "video/x-msvideo", avif: "image/avif", av1: "video/av1", bin: "application/octet-stream", bmp: "image/bmp", css: "text/css", csv: "text/csv", eot: "application/vnd.ms-fontobject", epub: "application/epub+zip", gif: "image/gif", gz: "application/gzip", htm: "text/html", html: "text/html", ico: "image/x-icon", ics: "text/calendar", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", jsonld: "application/ld+json", map: "application/json", mid: "audio/x-midi", midi: "audio/x-midi", mjs: "text/javascript", mp3: "audio/mpeg", mp4: "video/mp4", mpeg: "video/mpeg", oga: "audio/ogg", ogv: "video/ogg", ogx: "application/ogg", opus: "audio/opus", otf: "font/otf", pdf: "application/pdf", png: "image/png", rtf: "application/rtf", svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", ts: "video/mp2t", ttf: "font/ttf", txt: "text/plain", wasm: "application/wasm", webm: "video/webm", weba: "audio/webm", webmanifest: "application/manifest+json", webp: "image/webp", woff: "font/woff", woff2: "font/woff2", xhtml: "application/xhtml+xml", xml: "application/xml", zip: "application/zip", "3gp": "video/3gpp", "3g2": "video/3gpp2", gltf: "model/gltf+json", glb: "model/gltf-binary" };
var sr = rr;
var nr = /* @__PURE__ */ __name2((...e) => {
  let t = e.filter((n) => n !== "").join("/");
  t = t.replace(new RegExp("(?<=\\/)\\/+", "g"), "");
  const r = t.split("/"), s = [];
  for (const n of r)
    n === ".." && s.length > 0 && s.at(-1) !== ".." ? s.pop() : n !== "." && s.push(n);
  return s.join("/") || ".";
}, "nr");
var pt = { br: ".br", zstd: ".zst", gzip: ".gz" };
var ir = Object.keys(pt);
var ar = "index.html";
var or = /* @__PURE__ */ __name2((e) => {
  const t = e.root ?? "./", r = e.path, s = e.join ?? nr;
  return async (n, i) => {
    var u, d, m, E;
    if (n.finalized)
      return i();
    let a;
    if (e.path)
      a = e.path;
    else
      try {
        if (a = decodeURIComponent(n.req.path), /(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(a))
          throw new Error();
      } catch {
        return await ((u = e.onNotFound) == null ? void 0 : u.call(e, n.req.path, n)), i();
      }
    let h = s(t, !r && e.rewriteRequestPath ? e.rewriteRequestPath(a) : a);
    e.isDir && await e.isDir(h) && (h = s(h, ar));
    const l = e.getContent;
    let c = await l(h, n);
    if (c instanceof Response)
      return n.newResponse(c.body, c);
    if (c) {
      const b = e.mimes && ze(h, e.mimes) || ze(h);
      if (n.header("Content-Type", b || "application/octet-stream"), e.precompressed && (!b || tr.test(b))) {
        const N = new Set((d = n.req.header("Accept-Encoding")) == null ? void 0 : d.split(",").map((w) => w.trim()));
        for (const w of ir) {
          if (!N.has(w))
            continue;
          const R = await l(h + pt[w], n);
          if (R) {
            c = R, n.header("Content-Encoding", w), n.header("Vary", "Accept-Encoding", { append: true });
            break;
          }
        }
      }
      return await ((m = e.onFound) == null ? void 0 : m.call(e, h, n)), n.body(c);
    }
    await ((E = e.onNotFound) == null ? void 0 : E.call(e, h, n)), await i();
  };
}, "or");
var cr = /* @__PURE__ */ __name2(async (e, t) => {
  let r;
  t && t.manifest ? typeof t.manifest == "string" ? r = JSON.parse(t.manifest) : r = t.manifest : typeof __STATIC_CONTENT_MANIFEST == "string" ? r = JSON.parse(__STATIC_CONTENT_MANIFEST) : r = __STATIC_CONTENT_MANIFEST;
  let s;
  t && t.namespace ? s = t.namespace : s = __STATIC_CONTENT;
  const n = r[e] || e;
  if (!n)
    return null;
  const i = await s.get(n, { type: "stream" });
  return i || null;
}, "cr");
var lr = /* @__PURE__ */ __name2((e) => async function(r, s) {
  return or({ ...e, getContent: async (i) => cr(i, { manifest: e.manifest, namespace: e.namespace ? e.namespace : r.env ? r.env.__STATIC_CONTENT : void 0 }) })(r, s);
}, "lr");
var hr = /* @__PURE__ */ __name2((e) => lr(e), "hr");
var j = new ft();
j.use("/api/*", er());
j.use("/static/*", hr({ root: "./public" }));
j.get("/api/auth/me", async (e) => e.json({ id: "u1", name: "\u5C71\u7530 \u592A\u90CE", role: "USER", email: "user1@example.com" }));
j.post("/api/auth/kyc-verify", async (e) => {
  const { image: t } = await e.req.json();
  return e.json({ success: true, status: "VERIFIED" });
});
j.get("/api/bookings", async (e) => {
  const { DB: t } = e.env, { results: r } = await t.prepare("SELECT * FROM bookings ORDER BY scheduled_start DESC").all();
  return e.json(r);
});
j.get("/api/bookings/:id", async (e) => {
  const { DB: t } = e.env, r = e.req.param("id"), { results: s } = await t.prepare("SELECT * FROM bookings WHERE id = ?").bind(r).all();
  return e.json(s[0] || null);
});
j.post("/api/bookings", async (e) => {
  const { DB: t } = e.env, r = await e.req.json();
  return await t.prepare(`INSERT INTO bookings (id, user_id, therapist_id, site_id, office_id, type, status, service_name, duration, scheduled_start, price, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(r.id, r.userId, r.therapistId, r.siteId, r.officeId, r.type, "PENDING", r.serviceName, r.duration, r.scheduledStart, r.price, "PENDING").run(), e.json({ success: true, id: r.id });
});
j.patch("/api/bookings/:id/status", async (e) => {
  const { DB: t } = e.env, r = e.req.param("id"), { status: s } = await e.req.json();
  return await t.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(s, r).run(), e.json({ success: true });
});
j.get("/api/bookings/:id/messages", async (e) => {
  const { DB: t } = e.env, r = e.req.param("id"), { results: s } = await t.prepare("SELECT * FROM messages WHERE booking_id = ? ORDER BY created_at ASC").bind(r).all();
  return e.json(s);
});
j.patch("/api/bookings/:id/location", async (e) => {
  const { DB: t } = e.env, r = e.req.param("id"), { lat: s, lng: n } = await e.req.json();
  return await t.prepare(`INSERT INTO messages (id, booking_id, sender_id, content, type)
     VALUES (?, ?, ?, ?, ?)`).bind(`msg-${Date.now()}`, r, "system", JSON.stringify({ lat: s, lng: n }), "LOCATION").run(), e.json({ success: true });
});
j.post("/api/payments/create-session", async (e) => {
  const { STRIPE_SECRET: t } = e.env, { bookingId: r, amount: s } = await e.req.json(), i = await (await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ mode: "payment", success_url: `${e.req.url.split("/api")[0]}/#/app/booking/success?id=${r}`, cancel_url: `${e.req.url.split("/api")[0]}/#/app/booking/new`, "line_items[0][price_data][currency]": "jpy", "line_items[0][price_data][product_data][name]": "Soothe Wellness Session", "line_items[0][price_data][unit_amount]": s.toString(), "line_items[0][quantity]": "1" }) })).json();
  return e.json({ checkoutUrl: i.url });
});
j.get("/api/payments/connect-onboarding", async (e) => {
  const { STRIPE_SECRET: t } = e.env;
  return e.json({ url: "https://connect.stripe.com/setup/..." });
});
j.post("/api/notify/email", async (e) => {
  const { RESEND_API_KEY: t } = e.env, { to: r, subject: s, html: n } = await e.req.json(), a = await (await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Soothe <noreply@soothe.jp>", to: r, subject: s, html: n }) })).json();
  return e.json(a);
});
j.get("/api/storage/upload-url", async (e) => {
  const { STORAGE: t } = e.env, r = e.req.query("file"), s = `uploads/${Date.now()}-${r}`;
  return e.json({ url: `https://storage.soothe.jp/${s}` });
});
j.get("/api/therapists", async (e) => {
  const { DB: t } = e.env, { results: r } = await t.prepare(`
    SELECT u.id, u.name, tp.rating, tp.review_count, tp.specialties, tp.approved_areas
    FROM users u
    JOIN therapist_profiles tp ON u.id = tp.user_id
    WHERE u.role = 'THERAPIST' AND tp.is_active = TRUE
  `).all();
  return e.json(r);
});
j.get("/api/therapists/:id", async (e) => {
  const { DB: t } = e.env, r = e.req.param("id"), { results: s } = await t.prepare(`
    SELECT u.*, tp.*
    FROM users u
    JOIN therapist_profiles tp ON u.id = tp.user_id
    WHERE u.id = ?
  `).bind(r).all();
  return e.json(s[0] || null);
});
j.get("/", (e) => e.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soothe x CARE CUBE Japan</title>
        <meta name="description" content="\u7652\u3084\u3057\u3092\u3001\u90FD\u5E02\u306E\u30A4\u30F3\u30D5\u30E9\u3078\u3002\u6B21\u4E16\u4EE3\u30A6\u30A7\u30EB\u30CD\u30B9\u30FB\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/static/index.js"><\/script>
    </body>
    </html>
  `));
var We = new ft();
var ur = Object.assign({ "/src/index.tsx": j });
var gt = false;
for (const [, e] of Object.entries(ur))
  e && (We.route("/", e), We.notFound(e.notFoundHandler), gt = true);
if (!gt)
  throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = We;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-iVWdjF/nbqv16jisk.js
var define_ROUTES_default = { version: 1, include: ["/*"], exclude: [] };
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = middleware_loader_entry_default;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-RHI0xr/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = pages_dev_pipeline_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-RHI0xr/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=nbqv16jisk.js.map
