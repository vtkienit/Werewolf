(function() {
    const h = document.createElement("link").relList;
    if (h && h.supports && h.supports("modulepreload"))
        return;
    for (const w of document.querySelectorAll('link[rel="modulepreload"]'))
        y(w);
    new MutationObserver(w => {
        for (const C of w)
            if (C.type === "childList")
                for (const B of C.addedNodes)
                    B.tagName === "LINK" && B.rel === "modulepreload" && y(B)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function a(w) {
        const C = {};
        return w.integrity && (C.integrity = w.integrity),
        w.referrerPolicy && (C.referrerPolicy = w.referrerPolicy),
        w.crossOrigin === "use-credentials" ? C.credentials = "include" : w.crossOrigin === "anonymous" ? C.credentials = "omit" : C.credentials = "same-origin",
        C
    }
    function y(w) {
        if (w.ep)
            return;
        w.ep = !0;
        const C = a(w);
        fetch(w.href, C)
    }
}
)();
function rc(u) {
    return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u
}
var zo = {
    exports: {}
}
  , xr = {}
  , Do = {
    exports: {}
}
  , q = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ua;
function cf() {
    if (Ua)
        return q;
    Ua = 1;
    var u = Symbol.for("react.element")
      , h = Symbol.for("react.portal")
      , a = Symbol.for("react.fragment")
      , y = Symbol.for("react.strict_mode")
      , w = Symbol.for("react.profiler")
      , C = Symbol.for("react.provider")
      , B = Symbol.for("react.context")
      , _ = Symbol.for("react.forward_ref")
      , P = Symbol.for("react.suspense")
      , U = Symbol.for("react.memo")
      , O = Symbol.for("react.lazy")
      , L = Symbol.iterator;
    function K(p) {
        return p === null || typeof p != "object" ? null : (p = L && p[L] || p["@@iterator"],
        typeof p == "function" ? p : null)
    }
    var Z = {
        isMounted: function() {
            return !1
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
    }
      , $ = Object.assign
      , W = {};
    function G(p, S, X) {
        this.props = p,
        this.context = S,
        this.refs = W,
        this.updater = X || Z
    }
    G.prototype.isReactComponent = {},
    G.prototype.setState = function(p, S) {
        if (typeof p != "object" && typeof p != "function" && p != null)
            throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, p, S, "setState")
    }
    ,
    G.prototype.forceUpdate = function(p) {
        this.updater.enqueueForceUpdate(this, p, "forceUpdate")
    }
    ;
    function Y() {}
    Y.prototype = G.prototype;
    function F(p, S, X) {
        this.props = p,
        this.context = S,
        this.refs = W,
        this.updater = X || Z
    }
    var re = F.prototype = new Y;
    re.constructor = F,
    $(re, G.prototype),
    re.isPureReactComponent = !0;
    var D = Array.isArray
      , ae = Object.prototype.hasOwnProperty
      , ne = {
        current: null
    }
      , Ee = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
    };
    function Be(p, S, X) {
        var J, le = {}, ie = null, ce = null;
        if (S != null)
            for (J in S.ref !== void 0 && (ce = S.ref),
            S.key !== void 0 && (ie = "" + S.key),
            S)
                ae.call(S, J) && !Ee.hasOwnProperty(J) && (le[J] = S[J]);
        var ue = arguments.length - 2;
        if (ue === 1)
            le.children = X;
        else if (1 < ue) {
            for (var pe = Array(ue), be = 0; be < ue; be++)
                pe[be] = arguments[be + 2];
            le.children = pe
        }
        if (p && p.defaultProps)
            for (J in ue = p.defaultProps,
            ue)
                le[J] === void 0 && (le[J] = ue[J]);
        return {
            $$typeof: u,
            type: p,
            key: ie,
            ref: ce,
            props: le,
            _owner: ne.current
        }
    }
    function On(p, S) {
        return {
            $$typeof: u,
            type: p.type,
            key: S,
            ref: p.ref,
            props: p.props,
            _owner: p._owner
        }
    }
    function xn(p) {
        return typeof p == "object" && p !== null && p.$$typeof === u
    }
    function Jn(p) {
        var S = {
            "=": "=0",
            ":": "=2"
        };
        return "$" + p.replace(/[=:]/g, function(X) {
            return S[X]
        })
    }
    var mn = /\/+/g;
    function Ge(p, S) {
        return typeof p == "object" && p !== null && p.key != null ? Jn("" + p.key) : S.toString(36)
    }
    function un(p, S, X, J, le) {
        var ie = typeof p;
        (ie === "undefined" || ie === "boolean") && (p = null);
        var ce = !1;
        if (p === null)
            ce = !0;
        else
            switch (ie) {
            case "string":
            case "number":
                ce = !0;
                break;
            case "object":
                switch (p.$$typeof) {
                case u:
                case h:
                    ce = !0
                }
            }
        if (ce)
            return ce = p,
            le = le(ce),
            p = J === "" ? "." + Ge(ce, 0) : J,
            D(le) ? (X = "",
            p != null && (X = p.replace(mn, "$&/") + "/"),
            un(le, S, X, "", function(be) {
                return be
            })) : le != null && (xn(le) && (le = On(le, X + (!le.key || ce && ce.key === le.key ? "" : ("" + le.key).replace(mn, "$&/") + "/") + p)),
            S.push(le)),
            1;
        if (ce = 0,
        J = J === "" ? "." : J + ":",
        D(p))
            for (var ue = 0; ue < p.length; ue++) {
                ie = p[ue];
                var pe = J + Ge(ie, ue);
                ce += un(ie, S, X, pe, le)
            }
        else if (pe = K(p),
        typeof pe == "function")
            for (p = pe.call(p),
            ue = 0; !(ie = p.next()).done; )
                ie = ie.value,
                pe = J + Ge(ie, ue++),
                ce += un(ie, S, X, pe, le);
        else if (ie === "object")
            throw S = String(p),
            Error("Objects are not valid as a React child (found: " + (S === "[object Object]" ? "object with keys {" + Object.keys(p).join(", ") + "}" : S) + "). If you meant to render a collection of children, use an array instead.");
        return ce
    }
    function gn(p, S, X) {
        if (p == null)
            return p;
        var J = []
          , le = 0;
        return un(p, J, "", "", function(ie) {
            return S.call(X, ie, le++)
        }),
        J
    }
    function $e(p) {
        if (p._status === -1) {
            var S = p._result;
            S = S(),
            S.then(function(X) {
                (p._status === 0 || p._status === -1) && (p._status = 1,
                p._result = X)
            }, function(X) {
                (p._status === 0 || p._status === -1) && (p._status = 2,
                p._result = X)
            }),
            p._status === -1 && (p._status = 0,
            p._result = S)
        }
        if (p._status === 1)
            return p._result.default;
        throw p._result
    }
    var ye = {
        current: null
    }
      , T = {
        transition: null
    }
      , Q = {
        ReactCurrentDispatcher: ye,
        ReactCurrentBatchConfig: T,
        ReactCurrentOwner: ne
    };
    function R() {
        throw Error("act(...) is not supported in production builds of React.")
    }
    return q.Children = {
        map: gn,
        forEach: function(p, S, X) {
            gn(p, function() {
                S.apply(this, arguments)
            }, X)
        },
        count: function(p) {
            var S = 0;
            return gn(p, function() {
                S++
            }),
            S
        },
        toArray: function(p) {
            return gn(p, function(S) {
                return S
            }) || []
        },
        only: function(p) {
            if (!xn(p))
                throw Error("React.Children.only expected to receive a single React element child.");
            return p
        }
    },
    q.Component = G,
    q.Fragment = a,
    q.Profiler = w,
    q.PureComponent = F,
    q.StrictMode = y,
    q.Suspense = P,
    q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Q,
    q.act = R,
    q.cloneElement = function(p, S, X) {
        if (p == null)
            throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + p + ".");
        var J = $({}, p.props)
          , le = p.key
          , ie = p.ref
          , ce = p._owner;
        if (S != null) {
            if (S.ref !== void 0 && (ie = S.ref,
            ce = ne.current),
            S.key !== void 0 && (le = "" + S.key),
            p.type && p.type.defaultProps)
                var ue = p.type.defaultProps;
            for (pe in S)
                ae.call(S, pe) && !Ee.hasOwnProperty(pe) && (J[pe] = S[pe] === void 0 && ue !== void 0 ? ue[pe] : S[pe])
        }
        var pe = arguments.length - 2;
        if (pe === 1)
            J.children = X;
        else if (1 < pe) {
            ue = Array(pe);
            for (var be = 0; be < pe; be++)
                ue[be] = arguments[be + 2];
            J.children = ue
        }
        return {
            $$typeof: u,
            type: p.type,
            key: le,
            ref: ie,
            props: J,
            _owner: ce
        }
    }
    ,
    q.createContext = function(p) {
        return p = {
            $$typeof: B,
            _currentValue: p,
            _currentValue2: p,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
            _defaultValue: null,
            _globalName: null
        },
        p.Provider = {
            $$typeof: C,
            _context: p
        },
        p.Consumer = p
    }
    ,
    q.createElement = Be,
    q.createFactory = function(p) {
        var S = Be.bind(null, p);
        return S.type = p,
        S
    }
    ,
    q.createRef = function() {
        return {
            current: null
        }
    }
    ,
    q.forwardRef = function(p) {
        return {
            $$typeof: _,
            render: p
        }
    }
    ,
    q.isValidElement = xn,
    q.lazy = function(p) {
        return {
            $$typeof: O,
            _payload: {
                _status: -1,
                _result: p
            },
            _init: $e
        }
    }
    ,
    q.memo = function(p, S) {
        return {
            $$typeof: U,
            type: p,
            compare: S === void 0 ? null : S
        }
    }
    ,
    q.startTransition = function(p) {
        var S = T.transition;
        T.transition = {};
        try {
            p()
        } finally {
            T.transition = S
        }
    }
    ,
    q.unstable_act = R,
    q.useCallback = function(p, S) {
        return ye.current.useCallback(p, S)
    }
    ,
    q.useContext = function(p) {
        return ye.current.useContext(p)
    }
    ,
    q.useDebugValue = function() {}
    ,
    q.useDeferredValue = function(p) {
        return ye.current.useDeferredValue(p)
    }
    ,
    q.useEffect = function(p, S) {
        return ye.current.useEffect(p, S)
    }
    ,
    q.useId = function() {
        return ye.current.useId()
    }
    ,
    q.useImperativeHandle = function(p, S, X) {
        return ye.current.useImperativeHandle(p, S, X)
    }
    ,
    q.useInsertionEffect = function(p, S) {
        return ye.current.useInsertionEffect(p, S)
    }
    ,
    q.useLayoutEffect = function(p, S) {
        return ye.current.useLayoutEffect(p, S)
    }
    ,
    q.useMemo = function(p, S) {
        return ye.current.useMemo(p, S)
    }
    ,
    q.useReducer = function(p, S, X) {
        return ye.current.useReducer(p, S, X)
    }
    ,
    q.useRef = function(p) {
        return ye.current.useRef(p)
    }
    ,
    q.useState = function(p) {
        return ye.current.useState(p)
    }
    ,
    q.useSyncExternalStore = function(p, S, X) {
        return ye.current.useSyncExternalStore(p, S, X)
    }
    ,
    q.useTransition = function() {
        return ye.current.useTransition()
    }
    ,
    q.version = "18.3.1",
    q
}
var Ha;
function Wo() {
    return Ha || (Ha = 1,
    Do.exports = cf()),
    Do.exports
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Va;
function df() {
    if (Va)
        return xr;
    Va = 1;
    var u = Wo()
      , h = Symbol.for("react.element")
      , a = Symbol.for("react.fragment")
      , y = Object.prototype.hasOwnProperty
      , w = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner
      , C = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
    };
    function B(_, P, U) {
        var O, L = {}, K = null, Z = null;
        U !== void 0 && (K = "" + U),
        P.key !== void 0 && (K = "" + P.key),
        P.ref !== void 0 && (Z = P.ref);
        for (O in P)
            y.call(P, O) && !C.hasOwnProperty(O) && (L[O] = P[O]);
        if (_ && _.defaultProps)
            for (O in P = _.defaultProps,
            P)
                L[O] === void 0 && (L[O] = P[O]);
        return {
            $$typeof: h,
            type: _,
            key: K,
            ref: Z,
            props: L,
            _owner: w.current
        }
    }
    return xr.Fragment = a,
    xr.jsx = B,
    xr.jsxs = B,
    xr
}
var Wa;
function ff() {
    return Wa || (Wa = 1,
    zo.exports = df()),
    zo.exports
}
var c = ff()
  , ee = Wo();
const hf = rc(ee);
var zl = {}
  , Io = {
    exports: {}
}
  , Qe = {}
  , Ao = {
    exports: {}
}
  , Fo = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ka;
function pf() {
    return Ka || (Ka = 1,
    (function(u) {
        function h(T, Q) {
            var R = T.length;
            T.push(Q);
            e: for (; 0 < R; ) {
                var p = R - 1 >>> 1
                  , S = T[p];
                if (0 < w(S, Q))
                    T[p] = Q,
                    T[R] = S,
                    R = p;
                else
                    break e
            }
        }
        function a(T) {
            return T.length === 0 ? null : T[0]
        }
        function y(T) {
            if (T.length === 0)
                return null;
            var Q = T[0]
              , R = T.pop();
            if (R !== Q) {
                T[0] = R;
                e: for (var p = 0, S = T.length, X = S >>> 1; p < X; ) {
                    var J = 2 * (p + 1) - 1
                      , le = T[J]
                      , ie = J + 1
                      , ce = T[ie];
                    if (0 > w(le, R))
                        ie < S && 0 > w(ce, le) ? (T[p] = ce,
                        T[ie] = R,
                        p = ie) : (T[p] = le,
                        T[J] = R,
                        p = J);
                    else if (ie < S && 0 > w(ce, R))
                        T[p] = ce,
                        T[ie] = R,
                        p = ie;
                    else
                        break e
                }
            }
            return Q
        }
        function w(T, Q) {
            var R = T.sortIndex - Q.sortIndex;
            return R !== 0 ? R : T.id - Q.id
        }
        if (typeof performance == "object" && typeof performance.now == "function") {
            var C = performance;
            u.unstable_now = function() {
                return C.now()
            }
        } else {
            var B = Date
              , _ = B.now();
            u.unstable_now = function() {
                return B.now() - _
            }
        }
        var P = []
          , U = []
          , O = 1
          , L = null
          , K = 3
          , Z = !1
          , $ = !1
          , W = !1
          , G = typeof setTimeout == "function" ? setTimeout : null
          , Y = typeof clearTimeout == "function" ? clearTimeout : null
          , F = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function re(T) {
            for (var Q = a(U); Q !== null; ) {
                if (Q.callback === null)
                    y(U);
                else if (Q.startTime <= T)
                    y(U),
                    Q.sortIndex = Q.expirationTime,
                    h(P, Q);
                else
                    break;
                Q = a(U)
            }
        }
        function D(T) {
            if (W = !1,
            re(T),
            !$)
                if (a(P) !== null)
                    $ = !0,
                    $e(ae);
                else {
                    var Q = a(U);
                    Q !== null && ye(D, Q.startTime - T)
                }
        }
        function ae(T, Q) {
            $ = !1,
            W && (W = !1,
            Y(Be),
            Be = -1),
            Z = !0;
            var R = K;
            try {
                for (re(Q),
                L = a(P); L !== null && (!(L.expirationTime > Q) || T && !Jn()); ) {
                    var p = L.callback;
                    if (typeof p == "function") {
                        L.callback = null,
                        K = L.priorityLevel;
                        var S = p(L.expirationTime <= Q);
                        Q = u.unstable_now(),
                        typeof S == "function" ? L.callback = S : L === a(P) && y(P),
                        re(Q)
                    } else
                        y(P);
                    L = a(P)
                }
                if (L !== null)
                    var X = !0;
                else {
                    var J = a(U);
                    J !== null && ye(D, J.startTime - Q),
                    X = !1
                }
                return X
            } finally {
                L = null,
                K = R,
                Z = !1
            }
        }
        var ne = !1
          , Ee = null
          , Be = -1
          , On = 5
          , xn = -1;
        function Jn() {
            return !(u.unstable_now() - xn < On)
        }
        function mn() {
            if (Ee !== null) {
                var T = u.unstable_now();
                xn = T;
                var Q = !0;
                try {
                    Q = Ee(!0, T)
                } finally {
                    Q ? Ge() : (ne = !1,
                    Ee = null)
                }
            } else
                ne = !1
        }
        var Ge;
        if (typeof F == "function")
            Ge = function() {
                F(mn)
            }
            ;
        else if (typeof MessageChannel < "u") {
            var un = new MessageChannel
              , gn = un.port2;
            un.port1.onmessage = mn,
            Ge = function() {
                gn.postMessage(null)
            }
        } else
            Ge = function() {
                G(mn, 0)
            }
            ;
        function $e(T) {
            Ee = T,
            ne || (ne = !0,
            Ge())
        }
        function ye(T, Q) {
            Be = G(function() {
                T(u.unstable_now())
            }, Q)
        }
        u.unstable_IdlePriority = 5,
        u.unstable_ImmediatePriority = 1,
        u.unstable_LowPriority = 4,
        u.unstable_NormalPriority = 3,
        u.unstable_Profiling = null,
        u.unstable_UserBlockingPriority = 2,
        u.unstable_cancelCallback = function(T) {
            T.callback = null
        }
        ,
        u.unstable_continueExecution = function() {
            $ || Z || ($ = !0,
            $e(ae))
        }
        ,
        u.unstable_forceFrameRate = function(T) {
            0 > T || 125 < T ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : On = 0 < T ? Math.floor(1e3 / T) : 5
        }
        ,
        u.unstable_getCurrentPriorityLevel = function() {
            return K
        }
        ,
        u.unstable_getFirstCallbackNode = function() {
            return a(P)
        }
        ,
        u.unstable_next = function(T) {
            switch (K) {
            case 1:
            case 2:
            case 3:
                var Q = 3;
                break;
            default:
                Q = K
            }
            var R = K;
            K = Q;
            try {
                return T()
            } finally {
                K = R
            }
        }
        ,
        u.unstable_pauseExecution = function() {}
        ,
        u.unstable_requestPaint = function() {}
        ,
        u.unstable_runWithPriority = function(T, Q) {
            switch (T) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            default:
                T = 3
            }
            var R = K;
            K = T;
            try {
                return Q()
            } finally {
                K = R
            }
        }
        ,
        u.unstable_scheduleCallback = function(T, Q, R) {
            var p = u.unstable_now();
            switch (typeof R == "object" && R !== null ? (R = R.delay,
            R = typeof R == "number" && 0 < R ? p + R : p) : R = p,
            T) {
            case 1:
                var S = -1;
                break;
            case 2:
                S = 250;
                break;
            case 5:
                S = 1073741823;
                break;
            case 4:
                S = 1e4;
                break;
            default:
                S = 5e3
            }
            return S = R + S,
            T = {
                id: O++,
                callback: Q,
                priorityLevel: T,
                startTime: R,
                expirationTime: S,
                sortIndex: -1
            },
            R > p ? (T.sortIndex = R,
            h(U, T),
            a(P) === null && T === a(U) && (W ? (Y(Be),
            Be = -1) : W = !0,
            ye(D, R - p))) : (T.sortIndex = S,
            h(P, T),
            $ || Z || ($ = !0,
            $e(ae))),
            T
        }
        ,
        u.unstable_shouldYield = Jn,
        u.unstable_wrapCallback = function(T) {
            var Q = K;
            return function() {
                var R = K;
                K = Q;
                try {
                    return T.apply(this, arguments)
                } finally {
                    K = R
                }
            }
        }
    }
    )(Fo)),
    Fo
}
var Qa;
function mf() {
    return Qa || (Qa = 1,
    Ao.exports = pf()),
    Ao.exports
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ga;
function gf() {
    if (Ga)
        return Qe;
    Ga = 1;
    var u = Wo()
      , h = mf();
    function a(e) {
        for (var n = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, t = 1; t < arguments.length; t++)
            n += "&args[]=" + encodeURIComponent(arguments[t]);
        return "Minified React error #" + e + "; visit " + n + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }
    var y = new Set
      , w = {};
    function C(e, n) {
        B(e, n),
        B(e + "Capture", n)
    }
    function B(e, n) {
        for (w[e] = n,
        e = 0; e < n.length; e++)
            y.add(n[e])
    }
    var _ = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u")
      , P = Object.prototype.hasOwnProperty
      , U = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/
      , O = {}
      , L = {};
    function K(e) {
        return P.call(L, e) ? !0 : P.call(O, e) ? !1 : U.test(e) ? L[e] = !0 : (O[e] = !0,
        !1)
    }
    function Z(e, n, t, r) {
        if (t !== null && t.type === 0)
            return !1;
        switch (typeof n) {
        case "function":
        case "symbol":
            return !0;
        case "boolean":
            return r ? !1 : t !== null ? !t.acceptsBooleans : (e = e.toLowerCase().slice(0, 5),
            e !== "data-" && e !== "aria-");
        default:
            return !1
        }
    }
    function $(e, n, t, r) {
        if (n === null || typeof n > "u" || Z(e, n, t, r))
            return !0;
        if (r)
            return !1;
        if (t !== null)
            switch (t.type) {
            case 3:
                return !n;
            case 4:
                return n === !1;
            case 5:
                return isNaN(n);
            case 6:
                return isNaN(n) || 1 > n
            }
        return !1
    }
    function W(e, n, t, r, l, i, o) {
        this.acceptsBooleans = n === 2 || n === 3 || n === 4,
        this.attributeName = r,
        this.attributeNamespace = l,
        this.mustUseProperty = t,
        this.propertyName = e,
        this.type = n,
        this.sanitizeURL = i,
        this.removeEmptyString = o
    }
    var G = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
        G[e] = new W(e,0,!1,e,null,!1,!1)
    }),
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
        var n = e[0];
        G[n] = new W(n,1,!1,e[1],null,!1,!1)
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
        G[e] = new W(e,2,!1,e.toLowerCase(),null,!1,!1)
    }),
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
        G[e] = new W(e,2,!1,e,null,!1,!1)
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
        G[e] = new W(e,3,!1,e.toLowerCase(),null,!1,!1)
    }),
    ["checked", "multiple", "muted", "selected"].forEach(function(e) {
        G[e] = new W(e,3,!0,e,null,!1,!1)
    }),
    ["capture", "download"].forEach(function(e) {
        G[e] = new W(e,4,!1,e,null,!1,!1)
    }),
    ["cols", "rows", "size", "span"].forEach(function(e) {
        G[e] = new W(e,6,!1,e,null,!1,!1)
    }),
    ["rowSpan", "start"].forEach(function(e) {
        G[e] = new W(e,5,!1,e.toLowerCase(),null,!1,!1)
    });
    var Y = /[\-:]([a-z])/g;
    function F(e) {
        return e[1].toUpperCase()
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
        var n = e.replace(Y, F);
        G[n] = new W(n,1,!1,e,null,!1,!1)
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
        var n = e.replace(Y, F);
        G[n] = new W(n,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)
    }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
        var n = e.replace(Y, F);
        G[n] = new W(n,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)
    }),
    ["tabIndex", "crossOrigin"].forEach(function(e) {
        G[e] = new W(e,1,!1,e.toLowerCase(),null,!1,!1)
    }),
    G.xlinkHref = new W("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),
    ["src", "href", "action", "formAction"].forEach(function(e) {
        G[e] = new W(e,1,!1,e.toLowerCase(),null,!0,!0)
    });
    function re(e, n, t, r) {
        var l = G.hasOwnProperty(n) ? G[n] : null;
        (l !== null ? l.type !== 0 : r || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && ($(n, t, l, r) && (t = null),
        r || l === null ? K(n) && (t === null ? e.removeAttribute(n) : e.setAttribute(n, "" + t)) : l.mustUseProperty ? e[l.propertyName] = t === null ? l.type === 3 ? !1 : "" : t : (n = l.attributeName,
        r = l.attributeNamespace,
        t === null ? e.removeAttribute(n) : (l = l.type,
        t = l === 3 || l === 4 && t === !0 ? "" : "" + t,
        r ? e.setAttributeNS(r, n, t) : e.setAttribute(n, t))))
    }
    var D = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      , ae = Symbol.for("react.element")
      , ne = Symbol.for("react.portal")
      , Ee = Symbol.for("react.fragment")
      , Be = Symbol.for("react.strict_mode")
      , On = Symbol.for("react.profiler")
      , xn = Symbol.for("react.provider")
      , Jn = Symbol.for("react.context")
      , mn = Symbol.for("react.forward_ref")
      , Ge = Symbol.for("react.suspense")
      , un = Symbol.for("react.suspense_list")
      , gn = Symbol.for("react.memo")
      , $e = Symbol.for("react.lazy")
      , ye = Symbol.for("react.offscreen")
      , T = Symbol.iterator;
    function Q(e) {
        return e === null || typeof e != "object" ? null : (e = T && e[T] || e["@@iterator"],
        typeof e == "function" ? e : null)
    }
    var R = Object.assign, p;
    function S(e) {
        if (p === void 0)
            try {
                throw Error()
            } catch (t) {
                var n = t.stack.trim().match(/\n( *(at )?)/);
                p = n && n[1] || ""
            }
        return `
` + p + e
    }
    var X = !1;
    function J(e, n) {
        if (!e || X)
            return "";
        X = !0;
        var t = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            if (n)
                if (n = function() {
                    throw Error()
                }
                ,
                Object.defineProperty(n.prototype, "props", {
                    set: function() {
                        throw Error()
                    }
                }),
                typeof Reflect == "object" && Reflect.construct) {
                    try {
                        Reflect.construct(n, [])
                    } catch (v) {
                        var r = v
                    }
                    Reflect.construct(e, [], n)
                } else {
                    try {
                        n.call()
                    } catch (v) {
                        r = v
                    }
                    e.call(n.prototype)
                }
            else {
                try {
                    throw Error()
                } catch (v) {
                    r = v
                }
                e()
            }
        } catch (v) {
            if (v && r && typeof v.stack == "string") {
                for (var l = v.stack.split(`
`), i = r.stack.split(`
`), o = l.length - 1, s = i.length - 1; 1 <= o && 0 <= s && l[o] !== i[s]; )
                    s--;
                for (; 1 <= o && 0 <= s; o--,
                s--)
                    if (l[o] !== i[s]) {
                        if (o !== 1 || s !== 1)
                            do
                                if (o--,
                                s--,
                                0 > s || l[o] !== i[s]) {
                                    var d = `
` + l[o].replace(" at new ", " at ");
                                    return e.displayName && d.includes("<anonymous>") && (d = d.replace("<anonymous>", e.displayName)),
                                    d
                                }
                            while (1 <= o && 0 <= s);
                        break
                    }
            }
        } finally {
            X = !1,
            Error.prepareStackTrace = t
        }
        return (e = e ? e.displayName || e.name : "") ? S(e) : ""
    }
    function le(e) {
        switch (e.tag) {
        case 5:
            return S(e.type);
        case 16:
            return S("Lazy");
        case 13:
            return S("Suspense");
        case 19:
            return S("SuspenseList");
        case 0:
        case 2:
        case 15:
            return e = J(e.type, !1),
            e;
        case 11:
            return e = J(e.type.render, !1),
            e;
        case 1:
            return e = J(e.type, !0),
            e;
        default:
            return ""
        }
    }
    function ie(e) {
        if (e == null)
            return null;
        if (typeof e == "function")
            return e.displayName || e.name || null;
        if (typeof e == "string")
            return e;
        switch (e) {
        case Ee:
            return "Fragment";
        case ne:
            return "Portal";
        case On:
            return "Profiler";
        case Be:
            return "StrictMode";
        case Ge:
            return "Suspense";
        case un:
            return "SuspenseList"
        }
        if (typeof e == "object")
            switch (e.$$typeof) {
            case Jn:
                return (e.displayName || "Context") + ".Consumer";
            case xn:
                return (e._context.displayName || "Context") + ".Provider";
            case mn:
                var n = e.render;
                return e = e.displayName,
                e || (e = n.displayName || n.name || "",
                e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"),
                e;
            case gn:
                return n = e.displayName || null,
                n !== null ? n : ie(e.type) || "Memo";
            case $e:
                n = e._payload,
                e = e._init;
                try {
                    return ie(e(n))
                } catch {}
            }
        return null
    }
    function ce(e) {
        var n = e.type;
        switch (e.tag) {
        case 24:
            return "Cache";
        case 9:
            return (n.displayName || "Context") + ".Consumer";
        case 10:
            return (n._context.displayName || "Context") + ".Provider";
        case 18:
            return "DehydratedFragment";
        case 11:
            return e = n.render,
            e = e.displayName || e.name || "",
            n.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
        case 7:
            return "Fragment";
        case 5:
            return n;
        case 4:
            return "Portal";
        case 3:
            return "Root";
        case 6:
            return "Text";
        case 16:
            return ie(n);
        case 8:
            return n === Be ? "StrictMode" : "Mode";
        case 22:
            return "Offscreen";
        case 12:
            return "Profiler";
        case 21:
            return "Scope";
        case 13:
            return "Suspense";
        case 19:
            return "SuspenseList";
        case 25:
            return "TracingMarker";
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
            if (typeof n == "function")
                return n.displayName || n.name || null;
            if (typeof n == "string")
                return n
        }
        return null
    }
    function ue(e) {
        switch (typeof e) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
            return e;
        case "object":
            return e;
        default:
            return ""
        }
    }
    function pe(e) {
        var n = e.type;
        return (e = e.nodeName) && e.toLowerCase() === "input" && (n === "checkbox" || n === "radio")
    }
    function be(e) {
        var n = pe(e) ? "checked" : "value"
          , t = Object.getOwnPropertyDescriptor(e.constructor.prototype, n)
          , r = "" + e[n];
        if (!e.hasOwnProperty(n) && typeof t < "u" && typeof t.get == "function" && typeof t.set == "function") {
            var l = t.get
              , i = t.set;
            return Object.defineProperty(e, n, {
                configurable: !0,
                get: function() {
                    return l.call(this)
                },
                set: function(o) {
                    r = "" + o,
                    i.call(this, o)
                }
            }),
            Object.defineProperty(e, n, {
                enumerable: t.enumerable
            }),
            {
                getValue: function() {
                    return r
                },
                setValue: function(o) {
                    r = "" + o
                },
                stopTracking: function() {
                    e._valueTracker = null,
                    delete e[n]
                }
            }
        }
    }
    function Er(e) {
        e._valueTracker || (e._valueTracker = be(e))
    }
    function Go(e) {
        if (!e)
            return !1;
        var n = e._valueTracker;
        if (!n)
            return !0;
        var t = n.getValue()
          , r = "";
        return e && (r = pe(e) ? e.checked ? "true" : "false" : e.value),
        e = r,
        e !== t ? (n.setValue(e),
        !0) : !1
    }
    function Cr(e) {
        if (e = e || (typeof document < "u" ? document : void 0),
        typeof e > "u")
            return null;
        try {
            return e.activeElement || e.body
        } catch {
            return e.body
        }
    }
    function $l(e, n) {
        var t = n.checked;
        return R({}, n, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: t ?? e._wrapperState.initialChecked
        })
    }
    function bo(e, n) {
        var t = n.defaultValue == null ? "" : n.defaultValue
          , r = n.checked != null ? n.checked : n.defaultChecked;
        t = ue(n.value != null ? n.value : t),
        e._wrapperState = {
            initialChecked: r,
            initialValue: t,
            controlled: n.type === "checkbox" || n.type === "radio" ? n.checked != null : n.value != null
        }
    }
    function Yo(e, n) {
        n = n.checked,
        n != null && re(e, "checked", n, !1)
    }
    function Ul(e, n) {
        Yo(e, n);
        var t = ue(n.value)
          , r = n.type;
        if (t != null)
            r === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + t) : e.value !== "" + t && (e.value = "" + t);
        else if (r === "submit" || r === "reset") {
            e.removeAttribute("value");
            return
        }
        n.hasOwnProperty("value") ? Hl(e, n.type, t) : n.hasOwnProperty("defaultValue") && Hl(e, n.type, ue(n.defaultValue)),
        n.checked == null && n.defaultChecked != null && (e.defaultChecked = !!n.defaultChecked)
    }
    function Xo(e, n, t) {
        if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
            var r = n.type;
            if (!(r !== "submit" && r !== "reset" || n.value !== void 0 && n.value !== null))
                return;
            n = "" + e._wrapperState.initialValue,
            t || n === e.value || (e.value = n),
            e.defaultValue = n
        }
        t = e.name,
        t !== "" && (e.name = ""),
        e.defaultChecked = !!e._wrapperState.initialChecked,
        t !== "" && (e.name = t)
    }
    function Hl(e, n, t) {
        (n !== "number" || Cr(e.ownerDocument) !== e) && (t == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + t && (e.defaultValue = "" + t))
    }
    var At = Array.isArray;
    function ft(e, n, t, r) {
        if (e = e.options,
        n) {
            n = {};
            for (var l = 0; l < t.length; l++)
                n["$" + t[l]] = !0;
            for (t = 0; t < e.length; t++)
                l = n.hasOwnProperty("$" + e[t].value),
                e[t].selected !== l && (e[t].selected = l),
                l && r && (e[t].defaultSelected = !0)
        } else {
            for (t = "" + ue(t),
            n = null,
            l = 0; l < e.length; l++) {
                if (e[l].value === t) {
                    e[l].selected = !0,
                    r && (e[l].defaultSelected = !0);
                    return
                }
                n !== null || e[l].disabled || (n = e[l])
            }
            n !== null && (n.selected = !0)
        }
    }
    function Vl(e, n) {
        if (n.dangerouslySetInnerHTML != null)
            throw Error(a(91));
        return R({}, n, {
            value: void 0,
            defaultValue: void 0,
            children: "" + e._wrapperState.initialValue
        })
    }
    function qo(e, n) {
        var t = n.value;
        if (t == null) {
            if (t = n.children,
            n = n.defaultValue,
            t != null) {
                if (n != null)
                    throw Error(a(92));
                if (At(t)) {
                    if (1 < t.length)
                        throw Error(a(93));
                    t = t[0]
                }
                n = t
            }
            n == null && (n = ""),
            t = n
        }
        e._wrapperState = {
            initialValue: ue(t)
        }
    }
    function Jo(e, n) {
        var t = ue(n.value)
          , r = ue(n.defaultValue);
        t != null && (t = "" + t,
        t !== e.value && (e.value = t),
        n.defaultValue == null && e.defaultValue !== t && (e.defaultValue = t)),
        r != null && (e.defaultValue = "" + r)
    }
    function Zo(e) {
        var n = e.textContent;
        n === e._wrapperState.initialValue && n !== "" && n !== null && (e.value = n)
    }
    function eu(e) {
        switch (e) {
        case "svg":
            return "http://www.w3.org/2000/svg";
        case "math":
            return "http://www.w3.org/1998/Math/MathML";
        default:
            return "http://www.w3.org/1999/xhtml"
        }
    }
    function Wl(e, n) {
        return e == null || e === "http://www.w3.org/1999/xhtml" ? eu(n) : e === "http://www.w3.org/2000/svg" && n === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e
    }
    var _r, nu = (function(e) {
        return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(n, t, r, l) {
            MSApp.execUnsafeLocalFunction(function() {
                return e(n, t, r, l)
            })
        }
        : e
    }
    )(function(e, n) {
        if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML"in e)
            e.innerHTML = n;
        else {
            for (_r = _r || document.createElement("div"),
            _r.innerHTML = "<svg>" + n.valueOf().toString() + "</svg>",
            n = _r.firstChild; e.firstChild; )
                e.removeChild(e.firstChild);
            for (; n.firstChild; )
                e.appendChild(n.firstChild)
        }
    });
    function Ft(e, n) {
        if (n) {
            var t = e.firstChild;
            if (t && t === e.lastChild && t.nodeType === 3) {
                t.nodeValue = n;
                return
            }
        }
        e.textContent = n
    }
    var Bt = {
        animationIterationCount: !0,
        aspectRatio: !0,
        borderImageOutset: !0,
        borderImageSlice: !0,
        borderImageWidth: !0,
        boxFlex: !0,
        boxFlexGroup: !0,
        boxOrdinalGroup: !0,
        columnCount: !0,
        columns: !0,
        flex: !0,
        flexGrow: !0,
        flexPositive: !0,
        flexShrink: !0,
        flexNegative: !0,
        flexOrder: !0,
        gridArea: !0,
        gridRow: !0,
        gridRowEnd: !0,
        gridRowSpan: !0,
        gridRowStart: !0,
        gridColumn: !0,
        gridColumnEnd: !0,
        gridColumnSpan: !0,
        gridColumnStart: !0,
        fontWeight: !0,
        lineClamp: !0,
        lineHeight: !0,
        opacity: !0,
        order: !0,
        orphans: !0,
        tabSize: !0,
        widows: !0,
        zIndex: !0,
        zoom: !0,
        fillOpacity: !0,
        floodOpacity: !0,
        stopOpacity: !0,
        strokeDasharray: !0,
        strokeDashoffset: !0,
        strokeMiterlimit: !0,
        strokeOpacity: !0,
        strokeWidth: !0
    }
      , hc = ["Webkit", "ms", "Moz", "O"];
    Object.keys(Bt).forEach(function(e) {
        hc.forEach(function(n) {
            n = n + e.charAt(0).toUpperCase() + e.substring(1),
            Bt[n] = Bt[e]
        })
    });
    function tu(e, n, t) {
        return n == null || typeof n == "boolean" || n === "" ? "" : t || typeof n != "number" || n === 0 || Bt.hasOwnProperty(e) && Bt[e] ? ("" + n).trim() : n + "px"
    }
    function ru(e, n) {
        e = e.style;
        for (var t in n)
            if (n.hasOwnProperty(t)) {
                var r = t.indexOf("--") === 0
                  , l = tu(t, n[t], r);
                t === "float" && (t = "cssFloat"),
                r ? e.setProperty(t, l) : e[t] = l
            }
    }
    var pc = R({
        menuitem: !0
    }, {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        embed: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0
    });
    function Kl(e, n) {
        if (n) {
            if (pc[e] && (n.children != null || n.dangerouslySetInnerHTML != null))
                throw Error(a(137, e));
            if (n.dangerouslySetInnerHTML != null) {
                if (n.children != null)
                    throw Error(a(60));
                if (typeof n.dangerouslySetInnerHTML != "object" || !("__html"in n.dangerouslySetInnerHTML))
                    throw Error(a(61))
            }
            if (n.style != null && typeof n.style != "object")
                throw Error(a(62))
        }
    }
    function Ql(e, n) {
        if (e.indexOf("-") === -1)
            return typeof n.is == "string";
        switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            return !1;
        default:
            return !0
        }
    }
    var Gl = null;
    function bl(e) {
        return e = e.target || e.srcElement || window,
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
    }
    var Yl = null
      , ht = null
      , pt = null;
    function lu(e) {
        if (e = ur(e)) {
            if (typeof Yl != "function")
                throw Error(a(280));
            var n = e.stateNode;
            n && (n = Yr(n),
            Yl(e.stateNode, e.type, n))
        }
    }
    function iu(e) {
        ht ? pt ? pt.push(e) : pt = [e] : ht = e
    }
    function ou() {
        if (ht) {
            var e = ht
              , n = pt;
            if (pt = ht = null,
            lu(e),
            n)
                for (e = 0; e < n.length; e++)
                    lu(n[e])
        }
    }
    function uu(e, n) {
        return e(n)
    }
    function su() {}
    var Xl = !1;
    function au(e, n, t) {
        if (Xl)
            return e(n, t);
        Xl = !0;
        try {
            return uu(e, n, t)
        } finally {
            Xl = !1,
            (ht !== null || pt !== null) && (su(),
            ou())
        }
    }
    function $t(e, n) {
        var t = e.stateNode;
        if (t === null)
            return null;
        var r = Yr(t);
        if (r === null)
            return null;
        t = r[n];
        e: switch (n) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
            (r = !r.disabled) || (e = e.type,
            r = !(e === "button" || e === "input" || e === "select" || e === "textarea")),
            e = !r;
            break e;
        default:
            e = !1
        }
        if (e)
            return null;
        if (t && typeof t != "function")
            throw Error(a(231, n, typeof t));
        return t
    }
    var ql = !1;
    if (_)
        try {
            var Ut = {};
            Object.defineProperty(Ut, "passive", {
                get: function() {
                    ql = !0
                }
            }),
            window.addEventListener("test", Ut, Ut),
            window.removeEventListener("test", Ut, Ut)
        } catch {
            ql = !1
        }
    function mc(e, n, t, r, l, i, o, s, d) {
        var v = Array.prototype.slice.call(arguments, 3);
        try {
            n.apply(t, v)
        } catch (x) {
            this.onError(x)
        }
    }
    var Ht = !1
      , Tr = null
      , jr = !1
      , Jl = null
      , gc = {
        onError: function(e) {
            Ht = !0,
            Tr = e
        }
    };
    function vc(e, n, t, r, l, i, o, s, d) {
        Ht = !1,
        Tr = null,
        mc.apply(gc, arguments)
    }
    function yc(e, n, t, r, l, i, o, s, d) {
        if (vc.apply(this, arguments),
        Ht) {
            if (Ht) {
                var v = Tr;
                Ht = !1,
                Tr = null
            } else
                throw Error(a(198));
            jr || (jr = !0,
            Jl = v)
        }
    }
    function Zn(e) {
        var n = e
          , t = e;
        if (e.alternate)
            for (; n.return; )
                n = n.return;
        else {
            e = n;
            do
                n = e,
                (n.flags & 4098) !== 0 && (t = n.return),
                e = n.return;
            while (e)
        }
        return n.tag === 3 ? t : null
    }
    function cu(e) {
        if (e.tag === 13) {
            var n = e.memoizedState;
            if (n === null && (e = e.alternate,
            e !== null && (n = e.memoizedState)),
            n !== null)
                return n.dehydrated
        }
        return null
    }
    function du(e) {
        if (Zn(e) !== e)
            throw Error(a(188))
    }
    function kc(e) {
        var n = e.alternate;
        if (!n) {
            if (n = Zn(e),
            n === null)
                throw Error(a(188));
            return n !== e ? null : e
        }
        for (var t = e, r = n; ; ) {
            var l = t.return;
            if (l === null)
                break;
            var i = l.alternate;
            if (i === null) {
                if (r = l.return,
                r !== null) {
                    t = r;
                    continue
                }
                break
            }
            if (l.child === i.child) {
                for (i = l.child; i; ) {
                    if (i === t)
                        return du(l),
                        e;
                    if (i === r)
                        return du(l),
                        n;
                    i = i.sibling
                }
                throw Error(a(188))
            }
            if (t.return !== r.return)
                t = l,
                r = i;
            else {
                for (var o = !1, s = l.child; s; ) {
                    if (s === t) {
                        o = !0,
                        t = l,
                        r = i;
                        break
                    }
                    if (s === r) {
                        o = !0,
                        r = l,
                        t = i;
                        break
                    }
                    s = s.sibling
                }
                if (!o) {
                    for (s = i.child; s; ) {
                        if (s === t) {
                            o = !0,
                            t = i,
                            r = l;
                            break
                        }
                        if (s === r) {
                            o = !0,
                            r = i,
                            t = l;
                            break
                        }
                        s = s.sibling
                    }
                    if (!o)
                        throw Error(a(189))
                }
            }
            if (t.alternate !== r)
                throw Error(a(190))
        }
        if (t.tag !== 3)
            throw Error(a(188));
        return t.stateNode.current === t ? e : n
    }
    function fu(e) {
        return e = kc(e),
        e !== null ? hu(e) : null
    }
    function hu(e) {
        if (e.tag === 5 || e.tag === 6)
            return e;
        for (e = e.child; e !== null; ) {
            var n = hu(e);
            if (n !== null)
                return n;
            e = e.sibling
        }
        return null
    }
    var pu = h.unstable_scheduleCallback
      , mu = h.unstable_cancelCallback
      , wc = h.unstable_shouldYield
      , Sc = h.unstable_requestPaint
      , we = h.unstable_now
      , xc = h.unstable_getCurrentPriorityLevel
      , Zl = h.unstable_ImmediatePriority
      , gu = h.unstable_UserBlockingPriority
      , Pr = h.unstable_NormalPriority
      , Nc = h.unstable_LowPriority
      , vu = h.unstable_IdlePriority
      , Lr = null
      , vn = null;
    function Ec(e) {
        if (vn && typeof vn.onCommitFiberRoot == "function")
            try {
                vn.onCommitFiberRoot(Lr, e, void 0, (e.current.flags & 128) === 128)
            } catch {}
    }
    var sn = Math.clz32 ? Math.clz32 : Tc
      , Cc = Math.log
      , _c = Math.LN2;
    function Tc(e) {
        return e >>>= 0,
        e === 0 ? 32 : 31 - (Cc(e) / _c | 0) | 0
    }
    var Mr = 64
      , Or = 4194304;
    function Vt(e) {
        switch (e & -e) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 4:
            return 4;
        case 8:
            return 8;
        case 16:
            return 16;
        case 32:
            return 32;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return e & 4194240;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
            return e & 130023424;
        case 134217728:
            return 134217728;
        case 268435456:
            return 268435456;
        case 536870912:
            return 536870912;
        case 1073741824:
            return 1073741824;
        default:
            return e
        }
    }
    function Rr(e, n) {
        var t = e.pendingLanes;
        if (t === 0)
            return 0;
        var r = 0
          , l = e.suspendedLanes
          , i = e.pingedLanes
          , o = t & 268435455;
        if (o !== 0) {
            var s = o & ~l;
            s !== 0 ? r = Vt(s) : (i &= o,
            i !== 0 && (r = Vt(i)))
        } else
            o = t & ~l,
            o !== 0 ? r = Vt(o) : i !== 0 && (r = Vt(i));
        if (r === 0)
            return 0;
        if (n !== 0 && n !== r && (n & l) === 0 && (l = r & -r,
        i = n & -n,
        l >= i || l === 16 && (i & 4194240) !== 0))
            return n;
        if ((r & 4) !== 0 && (r |= t & 16),
        n = e.entangledLanes,
        n !== 0)
            for (e = e.entanglements,
            n &= r; 0 < n; )
                t = 31 - sn(n),
                l = 1 << t,
                r |= e[t],
                n &= ~l;
        return r
    }
    function jc(e, n) {
        switch (e) {
        case 1:
        case 2:
        case 4:
            return n + 250;
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return n + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
            return -1;
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
            return -1;
        default:
            return -1
        }
    }
    function Pc(e, n) {
        for (var t = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
            var o = 31 - sn(i)
              , s = 1 << o
              , d = l[o];
            d === -1 ? ((s & t) === 0 || (s & r) !== 0) && (l[o] = jc(s, n)) : d <= n && (e.expiredLanes |= s),
            i &= ~s
        }
    }
    function ei(e) {
        return e = e.pendingLanes & -1073741825,
        e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
    }
    function yu() {
        var e = Mr;
        return Mr <<= 1,
        (Mr & 4194240) === 0 && (Mr = 64),
        e
    }
    function ni(e) {
        for (var n = [], t = 0; 31 > t; t++)
            n.push(e);
        return n
    }
    function Wt(e, n, t) {
        e.pendingLanes |= n,
        n !== 536870912 && (e.suspendedLanes = 0,
        e.pingedLanes = 0),
        e = e.eventTimes,
        n = 31 - sn(n),
        e[n] = t
    }
    function Lc(e, n) {
        var t = e.pendingLanes & ~n;
        e.pendingLanes = n,
        e.suspendedLanes = 0,
        e.pingedLanes = 0,
        e.expiredLanes &= n,
        e.mutableReadLanes &= n,
        e.entangledLanes &= n,
        n = e.entanglements;
        var r = e.eventTimes;
        for (e = e.expirationTimes; 0 < t; ) {
            var l = 31 - sn(t)
              , i = 1 << l;
            n[l] = 0,
            r[l] = -1,
            e[l] = -1,
            t &= ~i
        }
    }
    function ti(e, n) {
        var t = e.entangledLanes |= n;
        for (e = e.entanglements; t; ) {
            var r = 31 - sn(t)
              , l = 1 << r;
            l & n | e[r] & n && (e[r] |= n),
            t &= ~l
        }
    }
    var se = 0;
    function ku(e) {
        return e &= -e,
        1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1
    }
    var wu, ri, Su, xu, Nu, li = !1, zr = [], Rn = null, zn = null, Dn = null, Kt = new Map, Qt = new Map, In = [], Mc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    function Eu(e, n) {
        switch (e) {
        case "focusin":
        case "focusout":
            Rn = null;
            break;
        case "dragenter":
        case "dragleave":
            zn = null;
            break;
        case "mouseover":
        case "mouseout":
            Dn = null;
            break;
        case "pointerover":
        case "pointerout":
            Kt.delete(n.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture":
            Qt.delete(n.pointerId)
        }
    }
    function Gt(e, n, t, r, l, i) {
        return e === null || e.nativeEvent !== i ? (e = {
            blockedOn: n,
            domEventName: t,
            eventSystemFlags: r,
            nativeEvent: i,
            targetContainers: [l]
        },
        n !== null && (n = ur(n),
        n !== null && ri(n)),
        e) : (e.eventSystemFlags |= r,
        n = e.targetContainers,
        l !== null && n.indexOf(l) === -1 && n.push(l),
        e)
    }
    function Oc(e, n, t, r, l) {
        switch (n) {
        case "focusin":
            return Rn = Gt(Rn, e, n, t, r, l),
            !0;
        case "dragenter":
            return zn = Gt(zn, e, n, t, r, l),
            !0;
        case "mouseover":
            return Dn = Gt(Dn, e, n, t, r, l),
            !0;
        case "pointerover":
            var i = l.pointerId;
            return Kt.set(i, Gt(Kt.get(i) || null, e, n, t, r, l)),
            !0;
        case "gotpointercapture":
            return i = l.pointerId,
            Qt.set(i, Gt(Qt.get(i) || null, e, n, t, r, l)),
            !0
        }
        return !1
    }
    function Cu(e) {
        var n = et(e.target);
        if (n !== null) {
            var t = Zn(n);
            if (t !== null) {
                if (n = t.tag,
                n === 13) {
                    if (n = cu(t),
                    n !== null) {
                        e.blockedOn = n,
                        Nu(e.priority, function() {
                            Su(t)
                        });
                        return
                    }
                } else if (n === 3 && t.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = t.tag === 3 ? t.stateNode.containerInfo : null;
                    return
                }
            }
        }
        e.blockedOn = null
    }
    function Dr(e) {
        if (e.blockedOn !== null)
            return !1;
        for (var n = e.targetContainers; 0 < n.length; ) {
            var t = oi(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent);
            if (t === null) {
                t = e.nativeEvent;
                var r = new t.constructor(t.type,t);
                Gl = r,
                t.target.dispatchEvent(r),
                Gl = null
            } else
                return n = ur(t),
                n !== null && ri(n),
                e.blockedOn = t,
                !1;
            n.shift()
        }
        return !0
    }
    function _u(e, n, t) {
        Dr(e) && t.delete(n)
    }
    function Rc() {
        li = !1,
        Rn !== null && Dr(Rn) && (Rn = null),
        zn !== null && Dr(zn) && (zn = null),
        Dn !== null && Dr(Dn) && (Dn = null),
        Kt.forEach(_u),
        Qt.forEach(_u)
    }
    function bt(e, n) {
        e.blockedOn === n && (e.blockedOn = null,
        li || (li = !0,
        h.unstable_scheduleCallback(h.unstable_NormalPriority, Rc)))
    }
    function Yt(e) {
        function n(l) {
            return bt(l, e)
        }
        if (0 < zr.length) {
            bt(zr[0], e);
            for (var t = 1; t < zr.length; t++) {
                var r = zr[t];
                r.blockedOn === e && (r.blockedOn = null)
            }
        }
        for (Rn !== null && bt(Rn, e),
        zn !== null && bt(zn, e),
        Dn !== null && bt(Dn, e),
        Kt.forEach(n),
        Qt.forEach(n),
        t = 0; t < In.length; t++)
            r = In[t],
            r.blockedOn === e && (r.blockedOn = null);
        for (; 0 < In.length && (t = In[0],
        t.blockedOn === null); )
            Cu(t),
            t.blockedOn === null && In.shift()
    }
    var mt = D.ReactCurrentBatchConfig
      , Ir = !0;
    function zc(e, n, t, r) {
        var l = se
          , i = mt.transition;
        mt.transition = null;
        try {
            se = 1,
            ii(e, n, t, r)
        } finally {
            se = l,
            mt.transition = i
        }
    }
    function Dc(e, n, t, r) {
        var l = se
          , i = mt.transition;
        mt.transition = null;
        try {
            se = 4,
            ii(e, n, t, r)
        } finally {
            se = l,
            mt.transition = i
        }
    }
    function ii(e, n, t, r) {
        if (Ir) {
            var l = oi(e, n, t, r);
            if (l === null)
                Ni(e, n, r, Ar, t),
                Eu(e, r);
            else if (Oc(l, e, n, t, r))
                r.stopPropagation();
            else if (Eu(e, r),
            n & 4 && -1 < Mc.indexOf(e)) {
                for (; l !== null; ) {
                    var i = ur(l);
                    if (i !== null && wu(i),
                    i = oi(e, n, t, r),
                    i === null && Ni(e, n, r, Ar, t),
                    i === l)
                        break;
                    l = i
                }
                l !== null && r.stopPropagation()
            } else
                Ni(e, n, r, null, t)
        }
    }
    var Ar = null;
    function oi(e, n, t, r) {
        if (Ar = null,
        e = bl(r),
        e = et(e),
        e !== null)
            if (n = Zn(e),
            n === null)
                e = null;
            else if (t = n.tag,
            t === 13) {
                if (e = cu(n),
                e !== null)
                    return e;
                e = null
            } else if (t === 3) {
                if (n.stateNode.current.memoizedState.isDehydrated)
                    return n.tag === 3 ? n.stateNode.containerInfo : null;
                e = null
            } else
                n !== e && (e = null);
        return Ar = e,
        null
    }
    function Tu(e) {
        switch (e) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
            return 1;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
            return 4;
        case "message":
            switch (xc()) {
            case Zl:
                return 1;
            case gu:
                return 4;
            case Pr:
            case Nc:
                return 16;
            case vu:
                return 536870912;
            default:
                return 16
            }
        default:
            return 16
        }
    }
    var An = null
      , ui = null
      , Fr = null;
    function ju() {
        if (Fr)
            return Fr;
        var e, n = ui, t = n.length, r, l = "value"in An ? An.value : An.textContent, i = l.length;
        for (e = 0; e < t && n[e] === l[e]; e++)
            ;
        var o = t - e;
        for (r = 1; r <= o && n[t - r] === l[i - r]; r++)
            ;
        return Fr = l.slice(e, 1 < r ? 1 - r : void 0)
    }
    function Br(e) {
        var n = e.keyCode;
        return "charCode"in e ? (e = e.charCode,
        e === 0 && n === 13 && (e = 13)) : e = n,
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
    }
    function $r() {
        return !0
    }
    function Pu() {
        return !1
    }
    function Ye(e) {
        function n(t, r, l, i, o) {
            this._reactName = t,
            this._targetInst = l,
            this.type = r,
            this.nativeEvent = i,
            this.target = o,
            this.currentTarget = null;
            for (var s in e)
                e.hasOwnProperty(s) && (t = e[s],
                this[s] = t ? t(i) : i[s]);
            return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? $r : Pu,
            this.isPropagationStopped = Pu,
            this
        }
        return R(n.prototype, {
            preventDefault: function() {
                this.defaultPrevented = !0;
                var t = this.nativeEvent;
                t && (t.preventDefault ? t.preventDefault() : typeof t.returnValue != "unknown" && (t.returnValue = !1),
                this.isDefaultPrevented = $r)
            },
            stopPropagation: function() {
                var t = this.nativeEvent;
                t && (t.stopPropagation ? t.stopPropagation() : typeof t.cancelBubble != "unknown" && (t.cancelBubble = !0),
                this.isPropagationStopped = $r)
            },
            persist: function() {},
            isPersistent: $r
        }),
        n
    }
    var gt = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: 0,
        isTrusted: 0
    }, si = Ye(gt), Xt = R({}, gt, {
        view: 0,
        detail: 0
    }), Ic = Ye(Xt), ai, ci, qt, Ur = R({}, Xt, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: fi,
        button: 0,
        buttons: 0,
        relatedTarget: function(e) {
            return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
        },
        movementX: function(e) {
            return "movementX"in e ? e.movementX : (e !== qt && (qt && e.type === "mousemove" ? (ai = e.screenX - qt.screenX,
            ci = e.screenY - qt.screenY) : ci = ai = 0,
            qt = e),
            ai)
        },
        movementY: function(e) {
            return "movementY"in e ? e.movementY : ci
        }
    }), Lu = Ye(Ur), Ac = R({}, Ur, {
        dataTransfer: 0
    }), Fc = Ye(Ac), Bc = R({}, Xt, {
        relatedTarget: 0
    }), di = Ye(Bc), $c = R({}, gt, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    }), Uc = Ye($c), Hc = R({}, gt, {
        clipboardData: function(e) {
            return "clipboardData"in e ? e.clipboardData : window.clipboardData
        }
    }), Vc = Ye(Hc), Wc = R({}, gt, {
        data: 0
    }), Mu = Ye(Wc), Kc = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
    }, Qc = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
    }, Gc = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
    };
    function bc(e) {
        var n = this.nativeEvent;
        return n.getModifierState ? n.getModifierState(e) : (e = Gc[e]) ? !!n[e] : !1
    }
    function fi() {
        return bc
    }
    var Yc = R({}, Xt, {
        key: function(e) {
            if (e.key) {
                var n = Kc[e.key] || e.key;
                if (n !== "Unidentified")
                    return n
            }
            return e.type === "keypress" ? (e = Br(e),
            e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Qc[e.keyCode] || "Unidentified" : ""
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: fi,
        charCode: function(e) {
            return e.type === "keypress" ? Br(e) : 0
        },
        keyCode: function(e) {
            return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        },
        which: function(e) {
            return e.type === "keypress" ? Br(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        }
    })
      , Xc = Ye(Yc)
      , qc = R({}, Ur, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
    })
      , Ou = Ye(qc)
      , Jc = R({}, Xt, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: fi
    })
      , Zc = Ye(Jc)
      , ed = R({}, gt, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    })
      , nd = Ye(ed)
      , td = R({}, Ur, {
        deltaX: function(e) {
            return "deltaX"in e ? e.deltaX : "wheelDeltaX"in e ? -e.wheelDeltaX : 0
        },
        deltaY: function(e) {
            return "deltaY"in e ? e.deltaY : "wheelDeltaY"in e ? -e.wheelDeltaY : "wheelDelta"in e ? -e.wheelDelta : 0
        },
        deltaZ: 0,
        deltaMode: 0
    })
      , rd = Ye(td)
      , ld = [9, 13, 27, 32]
      , hi = _ && "CompositionEvent"in window
      , Jt = null;
    _ && "documentMode"in document && (Jt = document.documentMode);
    var id = _ && "TextEvent"in window && !Jt
      , Ru = _ && (!hi || Jt && 8 < Jt && 11 >= Jt)
      , zu = " "
      , Du = !1;
    function Iu(e, n) {
        switch (e) {
        case "keyup":
            return ld.indexOf(n.keyCode) !== -1;
        case "keydown":
            return n.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
            return !0;
        default:
            return !1
        }
    }
    function Au(e) {
        return e = e.detail,
        typeof e == "object" && "data"in e ? e.data : null
    }
    var vt = !1;
    function od(e, n) {
        switch (e) {
        case "compositionend":
            return Au(n);
        case "keypress":
            return n.which !== 32 ? null : (Du = !0,
            zu);
        case "textInput":
            return e = n.data,
            e === zu && Du ? null : e;
        default:
            return null
        }
    }
    function ud(e, n) {
        if (vt)
            return e === "compositionend" || !hi && Iu(e, n) ? (e = ju(),
            Fr = ui = An = null,
            vt = !1,
            e) : null;
        switch (e) {
        case "paste":
            return null;
        case "keypress":
            if (!(n.ctrlKey || n.altKey || n.metaKey) || n.ctrlKey && n.altKey) {
                if (n.char && 1 < n.char.length)
                    return n.char;
                if (n.which)
                    return String.fromCharCode(n.which)
            }
            return null;
        case "compositionend":
            return Ru && n.locale !== "ko" ? null : n.data;
        default:
            return null
        }
    }
    var sd = {
        color: !0,
        date: !0,
        datetime: !0,
        "datetime-local": !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function Fu(e) {
        var n = e && e.nodeName && e.nodeName.toLowerCase();
        return n === "input" ? !!sd[e.type] : n === "textarea"
    }
    function Bu(e, n, t, r) {
        iu(r),
        n = Qr(n, "onChange"),
        0 < n.length && (t = new si("onChange","change",null,t,r),
        e.push({
            event: t,
            listeners: n
        }))
    }
    var Zt = null
      , er = null;
    function ad(e) {
        rs(e, 0)
    }
    function Hr(e) {
        var n = xt(e);
        if (Go(n))
            return e
    }
    function cd(e, n) {
        if (e === "change")
            return n
    }
    var $u = !1;
    if (_) {
        var pi;
        if (_) {
            var mi = "oninput"in document;
            if (!mi) {
                var Uu = document.createElement("div");
                Uu.setAttribute("oninput", "return;"),
                mi = typeof Uu.oninput == "function"
            }
            pi = mi
        } else
            pi = !1;
        $u = pi && (!document.documentMode || 9 < document.documentMode)
    }
    function Hu() {
        Zt && (Zt.detachEvent("onpropertychange", Vu),
        er = Zt = null)
    }
    function Vu(e) {
        if (e.propertyName === "value" && Hr(er)) {
            var n = [];
            Bu(n, er, e, bl(e)),
            au(ad, n)
        }
    }
    function dd(e, n, t) {
        e === "focusin" ? (Hu(),
        Zt = n,
        er = t,
        Zt.attachEvent("onpropertychange", Vu)) : e === "focusout" && Hu()
    }
    function fd(e) {
        if (e === "selectionchange" || e === "keyup" || e === "keydown")
            return Hr(er)
    }
    function hd(e, n) {
        if (e === "click")
            return Hr(n)
    }
    function pd(e, n) {
        if (e === "input" || e === "change")
            return Hr(n)
    }
    function md(e, n) {
        return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n
    }
    var an = typeof Object.is == "function" ? Object.is : md;
    function nr(e, n) {
        if (an(e, n))
            return !0;
        if (typeof e != "object" || e === null || typeof n != "object" || n === null)
            return !1;
        var t = Object.keys(e)
          , r = Object.keys(n);
        if (t.length !== r.length)
            return !1;
        for (r = 0; r < t.length; r++) {
            var l = t[r];
            if (!P.call(n, l) || !an(e[l], n[l]))
                return !1
        }
        return !0
    }
    function Wu(e) {
        for (; e && e.firstChild; )
            e = e.firstChild;
        return e
    }
    function Ku(e, n) {
        var t = Wu(e);
        e = 0;
        for (var r; t; ) {
            if (t.nodeType === 3) {
                if (r = e + t.textContent.length,
                e <= n && r >= n)
                    return {
                        node: t,
                        offset: n - e
                    };
                e = r
            }
            e: {
                for (; t; ) {
                    if (t.nextSibling) {
                        t = t.nextSibling;
                        break e
                    }
                    t = t.parentNode
                }
                t = void 0
            }
            t = Wu(t)
        }
    }
    function Qu(e, n) {
        return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? Qu(e, n.parentNode) : "contains"in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1
    }
    function Gu() {
        for (var e = window, n = Cr(); n instanceof e.HTMLIFrameElement; ) {
            try {
                var t = typeof n.contentWindow.location.href == "string"
            } catch {
                t = !1
            }
            if (t)
                e = n.contentWindow;
            else
                break;
            n = Cr(e.document)
        }
        return n
    }
    function gi(e) {
        var n = e && e.nodeName && e.nodeName.toLowerCase();
        return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true")
    }
    function gd(e) {
        var n = Gu()
          , t = e.focusedElem
          , r = e.selectionRange;
        if (n !== t && t && t.ownerDocument && Qu(t.ownerDocument.documentElement, t)) {
            if (r !== null && gi(t)) {
                if (n = r.start,
                e = r.end,
                e === void 0 && (e = n),
                "selectionStart"in t)
                    t.selectionStart = n,
                    t.selectionEnd = Math.min(e, t.value.length);
                else if (e = (n = t.ownerDocument || document) && n.defaultView || window,
                e.getSelection) {
                    e = e.getSelection();
                    var l = t.textContent.length
                      , i = Math.min(r.start, l);
                    r = r.end === void 0 ? i : Math.min(r.end, l),
                    !e.extend && i > r && (l = r,
                    r = i,
                    i = l),
                    l = Ku(t, i);
                    var o = Ku(t, r);
                    l && o && (e.rangeCount !== 1 || e.anchorNode !== l.node || e.anchorOffset !== l.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (n = n.createRange(),
                    n.setStart(l.node, l.offset),
                    e.removeAllRanges(),
                    i > r ? (e.addRange(n),
                    e.extend(o.node, o.offset)) : (n.setEnd(o.node, o.offset),
                    e.addRange(n)))
                }
            }
            for (n = [],
            e = t; e = e.parentNode; )
                e.nodeType === 1 && n.push({
                    element: e,
                    left: e.scrollLeft,
                    top: e.scrollTop
                });
            for (typeof t.focus == "function" && t.focus(),
            t = 0; t < n.length; t++)
                e = n[t],
                e.element.scrollLeft = e.left,
                e.element.scrollTop = e.top
        }
    }
    var vd = _ && "documentMode"in document && 11 >= document.documentMode
      , yt = null
      , vi = null
      , tr = null
      , yi = !1;
    function bu(e, n, t) {
        var r = t.window === t ? t.document : t.nodeType === 9 ? t : t.ownerDocument;
        yi || yt == null || yt !== Cr(r) || (r = yt,
        "selectionStart"in r && gi(r) ? r = {
            start: r.selectionStart,
            end: r.selectionEnd
        } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(),
        r = {
            anchorNode: r.anchorNode,
            anchorOffset: r.anchorOffset,
            focusNode: r.focusNode,
            focusOffset: r.focusOffset
        }),
        tr && nr(tr, r) || (tr = r,
        r = Qr(vi, "onSelect"),
        0 < r.length && (n = new si("onSelect","select",null,n,t),
        e.push({
            event: n,
            listeners: r
        }),
        n.target = yt)))
    }
    function Vr(e, n) {
        var t = {};
        return t[e.toLowerCase()] = n.toLowerCase(),
        t["Webkit" + e] = "webkit" + n,
        t["Moz" + e] = "moz" + n,
        t
    }
    var kt = {
        animationend: Vr("Animation", "AnimationEnd"),
        animationiteration: Vr("Animation", "AnimationIteration"),
        animationstart: Vr("Animation", "AnimationStart"),
        transitionend: Vr("Transition", "TransitionEnd")
    }
      , ki = {}
      , Yu = {};
    _ && (Yu = document.createElement("div").style,
    "AnimationEvent"in window || (delete kt.animationend.animation,
    delete kt.animationiteration.animation,
    delete kt.animationstart.animation),
    "TransitionEvent"in window || delete kt.transitionend.transition);
    function Wr(e) {
        if (ki[e])
            return ki[e];
        if (!kt[e])
            return e;
        var n = kt[e], t;
        for (t in n)
            if (n.hasOwnProperty(t) && t in Yu)
                return ki[e] = n[t];
        return e
    }
    var Xu = Wr("animationend")
      , qu = Wr("animationiteration")
      , Ju = Wr("animationstart")
      , Zu = Wr("transitionend")
      , es = new Map
      , ns = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    function Fn(e, n) {
        es.set(e, n),
        C(n, [e])
    }
    for (var wi = 0; wi < ns.length; wi++) {
        var Si = ns[wi]
          , yd = Si.toLowerCase()
          , kd = Si[0].toUpperCase() + Si.slice(1);
        Fn(yd, "on" + kd)
    }
    Fn(Xu, "onAnimationEnd"),
    Fn(qu, "onAnimationIteration"),
    Fn(Ju, "onAnimationStart"),
    Fn("dblclick", "onDoubleClick"),
    Fn("focusin", "onFocus"),
    Fn("focusout", "onBlur"),
    Fn(Zu, "onTransitionEnd"),
    B("onMouseEnter", ["mouseout", "mouseover"]),
    B("onMouseLeave", ["mouseout", "mouseover"]),
    B("onPointerEnter", ["pointerout", "pointerover"]),
    B("onPointerLeave", ["pointerout", "pointerover"]),
    C("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")),
    C("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),
    C("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    C("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")),
    C("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")),
    C("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var rr = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ")
      , wd = new Set("cancel close invalid load scroll toggle".split(" ").concat(rr));
    function ts(e, n, t) {
        var r = e.type || "unknown-event";
        e.currentTarget = t,
        yc(r, n, void 0, e),
        e.currentTarget = null
    }
    function rs(e, n) {
        n = (n & 4) !== 0;
        for (var t = 0; t < e.length; t++) {
            var r = e[t]
              , l = r.event;
            r = r.listeners;
            e: {
                var i = void 0;
                if (n)
                    for (var o = r.length - 1; 0 <= o; o--) {
                        var s = r[o]
                          , d = s.instance
                          , v = s.currentTarget;
                        if (s = s.listener,
                        d !== i && l.isPropagationStopped())
                            break e;
                        ts(l, s, v),
                        i = d
                    }
                else
                    for (o = 0; o < r.length; o++) {
                        if (s = r[o],
                        d = s.instance,
                        v = s.currentTarget,
                        s = s.listener,
                        d !== i && l.isPropagationStopped())
                            break e;
                        ts(l, s, v),
                        i = d
                    }
            }
        }
        if (jr)
            throw e = Jl,
            jr = !1,
            Jl = null,
            e
    }
    function fe(e, n) {
        var t = n[Pi];
        t === void 0 && (t = n[Pi] = new Set);
        var r = e + "__bubble";
        t.has(r) || (ls(n, e, 2, !1),
        t.add(r))
    }
    function xi(e, n, t) {
        var r = 0;
        n && (r |= 4),
        ls(t, e, r, n)
    }
    var Kr = "_reactListening" + Math.random().toString(36).slice(2);
    function lr(e) {
        if (!e[Kr]) {
            e[Kr] = !0,
            y.forEach(function(t) {
                t !== "selectionchange" && (wd.has(t) || xi(t, !1, e),
                xi(t, !0, e))
            });
            var n = e.nodeType === 9 ? e : e.ownerDocument;
            n === null || n[Kr] || (n[Kr] = !0,
            xi("selectionchange", !1, n))
        }
    }
    function ls(e, n, t, r) {
        switch (Tu(n)) {
        case 1:
            var l = zc;
            break;
        case 4:
            l = Dc;
            break;
        default:
            l = ii
        }
        t = l.bind(null, n, t, e),
        l = void 0,
        !ql || n !== "touchstart" && n !== "touchmove" && n !== "wheel" || (l = !0),
        r ? l !== void 0 ? e.addEventListener(n, t, {
            capture: !0,
            passive: l
        }) : e.addEventListener(n, t, !0) : l !== void 0 ? e.addEventListener(n, t, {
            passive: l
        }) : e.addEventListener(n, t, !1)
    }
    function Ni(e, n, t, r, l) {
        var i = r;
        if ((n & 1) === 0 && (n & 2) === 0 && r !== null)
            e: for (; ; ) {
                if (r === null)
                    return;
                var o = r.tag;
                if (o === 3 || o === 4) {
                    var s = r.stateNode.containerInfo;
                    if (s === l || s.nodeType === 8 && s.parentNode === l)
                        break;
                    if (o === 4)
                        for (o = r.return; o !== null; ) {
                            var d = o.tag;
                            if ((d === 3 || d === 4) && (d = o.stateNode.containerInfo,
                            d === l || d.nodeType === 8 && d.parentNode === l))
                                return;
                            o = o.return
                        }
                    for (; s !== null; ) {
                        if (o = et(s),
                        o === null)
                            return;
                        if (d = o.tag,
                        d === 5 || d === 6) {
                            r = i = o;
                            continue e
                        }
                        s = s.parentNode
                    }
                }
                r = r.return
            }
        au(function() {
            var v = i
              , x = bl(t)
              , N = [];
            e: {
                var k = es.get(e);
                if (k !== void 0) {
                    var j = si
                      , z = e;
                    switch (e) {
                    case "keypress":
                        if (Br(t) === 0)
                            break e;
                    case "keydown":
                    case "keyup":
                        j = Xc;
                        break;
                    case "focusin":
                        z = "focus",
                        j = di;
                        break;
                    case "focusout":
                        z = "blur",
                        j = di;
                        break;
                    case "beforeblur":
                    case "afterblur":
                        j = di;
                        break;
                    case "click":
                        if (t.button === 2)
                            break e;
                    case "auxclick":
                    case "dblclick":
                    case "mousedown":
                    case "mousemove":
                    case "mouseup":
                    case "mouseout":
                    case "mouseover":
                    case "contextmenu":
                        j = Lu;
                        break;
                    case "drag":
                    case "dragend":
                    case "dragenter":
                    case "dragexit":
                    case "dragleave":
                    case "dragover":
                    case "dragstart":
                    case "drop":
                        j = Fc;
                        break;
                    case "touchcancel":
                    case "touchend":
                    case "touchmove":
                    case "touchstart":
                        j = Zc;
                        break;
                    case Xu:
                    case qu:
                    case Ju:
                        j = Uc;
                        break;
                    case Zu:
                        j = nd;
                        break;
                    case "scroll":
                        j = Ic;
                        break;
                    case "wheel":
                        j = rd;
                        break;
                    case "copy":
                    case "cut":
                    case "paste":
                        j = Vc;
                        break;
                    case "gotpointercapture":
                    case "lostpointercapture":
                    case "pointercancel":
                    case "pointerdown":
                    case "pointermove":
                    case "pointerout":
                    case "pointerover":
                    case "pointerup":
                        j = Ou
                    }
                    var I = (n & 4) !== 0
                      , Se = !I && e === "scroll"
                      , m = I ? k !== null ? k + "Capture" : null : k;
                    I = [];
                    for (var f = v, g; f !== null; ) {
                        g = f;
                        var E = g.stateNode;
                        if (g.tag === 5 && E !== null && (g = E,
                        m !== null && (E = $t(f, m),
                        E != null && I.push(ir(f, E, g)))),
                        Se)
                            break;
                        f = f.return
                    }
                    0 < I.length && (k = new j(k,z,null,t,x),
                    N.push({
                        event: k,
                        listeners: I
                    }))
                }
            }
            if ((n & 7) === 0) {
                e: {
                    if (k = e === "mouseover" || e === "pointerover",
                    j = e === "mouseout" || e === "pointerout",
                    k && t !== Gl && (z = t.relatedTarget || t.fromElement) && (et(z) || z[Nn]))
                        break e;
                    if ((j || k) && (k = x.window === x ? x : (k = x.ownerDocument) ? k.defaultView || k.parentWindow : window,
                    j ? (z = t.relatedTarget || t.toElement,
                    j = v,
                    z = z ? et(z) : null,
                    z !== null && (Se = Zn(z),
                    z !== Se || z.tag !== 5 && z.tag !== 6) && (z = null)) : (j = null,
                    z = v),
                    j !== z)) {
                        if (I = Lu,
                        E = "onMouseLeave",
                        m = "onMouseEnter",
                        f = "mouse",
                        (e === "pointerout" || e === "pointerover") && (I = Ou,
                        E = "onPointerLeave",
                        m = "onPointerEnter",
                        f = "pointer"),
                        Se = j == null ? k : xt(j),
                        g = z == null ? k : xt(z),
                        k = new I(E,f + "leave",j,t,x),
                        k.target = Se,
                        k.relatedTarget = g,
                        E = null,
                        et(x) === v && (I = new I(m,f + "enter",z,t,x),
                        I.target = g,
                        I.relatedTarget = Se,
                        E = I),
                        Se = E,
                        j && z)
                            n: {
                                for (I = j,
                                m = z,
                                f = 0,
                                g = I; g; g = wt(g))
                                    f++;
                                for (g = 0,
                                E = m; E; E = wt(E))
                                    g++;
                                for (; 0 < f - g; )
                                    I = wt(I),
                                    f--;
                                for (; 0 < g - f; )
                                    m = wt(m),
                                    g--;
                                for (; f--; ) {
                                    if (I === m || m !== null && I === m.alternate)
                                        break n;
                                    I = wt(I),
                                    m = wt(m)
                                }
                                I = null
                            }
                        else
                            I = null;
                        j !== null && is(N, k, j, I, !1),
                        z !== null && Se !== null && is(N, Se, z, I, !0)
                    }
                }
                e: {
                    if (k = v ? xt(v) : window,
                    j = k.nodeName && k.nodeName.toLowerCase(),
                    j === "select" || j === "input" && k.type === "file")
                        var A = cd;
                    else if (Fu(k))
                        if ($u)
                            A = pd;
                        else {
                            A = fd;
                            var H = dd
                        }
                    else
                        (j = k.nodeName) && j.toLowerCase() === "input" && (k.type === "checkbox" || k.type === "radio") && (A = hd);
                    if (A && (A = A(e, v))) {
                        Bu(N, A, t, x);
                        break e
                    }
                    H && H(e, k, v),
                    e === "focusout" && (H = k._wrapperState) && H.controlled && k.type === "number" && Hl(k, "number", k.value)
                }
                switch (H = v ? xt(v) : window,
                e) {
                case "focusin":
                    (Fu(H) || H.contentEditable === "true") && (yt = H,
                    vi = v,
                    tr = null);
                    break;
                case "focusout":
                    tr = vi = yt = null;
                    break;
                case "mousedown":
                    yi = !0;
                    break;
                case "contextmenu":
                case "mouseup":
                case "dragend":
                    yi = !1,
                    bu(N, t, x);
                    break;
                case "selectionchange":
                    if (vd)
                        break;
                case "keydown":
                case "keyup":
                    bu(N, t, x)
                }
                var V;
                if (hi)
                    e: {
                        switch (e) {
                        case "compositionstart":
                            var b = "onCompositionStart";
                            break e;
                        case "compositionend":
                            b = "onCompositionEnd";
                            break e;
                        case "compositionupdate":
                            b = "onCompositionUpdate";
                            break e
                        }
                        b = void 0
                    }
                else
                    vt ? Iu(e, t) && (b = "onCompositionEnd") : e === "keydown" && t.keyCode === 229 && (b = "onCompositionStart");
                b && (Ru && t.locale !== "ko" && (vt || b !== "onCompositionStart" ? b === "onCompositionEnd" && vt && (V = ju()) : (An = x,
                ui = "value"in An ? An.value : An.textContent,
                vt = !0)),
                H = Qr(v, b),
                0 < H.length && (b = new Mu(b,e,null,t,x),
                N.push({
                    event: b,
                    listeners: H
                }),
                V ? b.data = V : (V = Au(t),
                V !== null && (b.data = V)))),
                (V = id ? od(e, t) : ud(e, t)) && (v = Qr(v, "onBeforeInput"),
                0 < v.length && (x = new Mu("onBeforeInput","beforeinput",null,t,x),
                N.push({
                    event: x,
                    listeners: v
                }),
                x.data = V))
            }
            rs(N, n)
        })
    }
    function ir(e, n, t) {
        return {
            instance: e,
            listener: n,
            currentTarget: t
        }
    }
    function Qr(e, n) {
        for (var t = n + "Capture", r = []; e !== null; ) {
            var l = e
              , i = l.stateNode;
            l.tag === 5 && i !== null && (l = i,
            i = $t(e, t),
            i != null && r.unshift(ir(e, i, l)),
            i = $t(e, n),
            i != null && r.push(ir(e, i, l))),
            e = e.return
        }
        return r
    }
    function wt(e) {
        if (e === null)
            return null;
        do
            e = e.return;
        while (e && e.tag !== 5);
        return e || null
    }
    function is(e, n, t, r, l) {
        for (var i = n._reactName, o = []; t !== null && t !== r; ) {
            var s = t
              , d = s.alternate
              , v = s.stateNode;
            if (d !== null && d === r)
                break;
            s.tag === 5 && v !== null && (s = v,
            l ? (d = $t(t, i),
            d != null && o.unshift(ir(t, d, s))) : l || (d = $t(t, i),
            d != null && o.push(ir(t, d, s)))),
            t = t.return
        }
        o.length !== 0 && e.push({
            event: n,
            listeners: o
        })
    }
    var Sd = /\r\n?/g
      , xd = /\u0000|\uFFFD/g;
    function os(e) {
        return (typeof e == "string" ? e : "" + e).replace(Sd, `
`).replace(xd, "")
    }
    function Gr(e, n, t) {
        if (n = os(n),
        os(e) !== n && t)
            throw Error(a(425))
    }
    function br() {}
    var Ei = null
      , Ci = null;
    function _i(e, n) {
        return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null
    }
    var Ti = typeof setTimeout == "function" ? setTimeout : void 0
      , Nd = typeof clearTimeout == "function" ? clearTimeout : void 0
      , us = typeof Promise == "function" ? Promise : void 0
      , Ed = typeof queueMicrotask == "function" ? queueMicrotask : typeof us < "u" ? function(e) {
        return us.resolve(null).then(e).catch(Cd)
    }
    : Ti;
    function Cd(e) {
        setTimeout(function() {
            throw e
        })
    }
    function ji(e, n) {
        var t = n
          , r = 0;
        do {
            var l = t.nextSibling;
            if (e.removeChild(t),
            l && l.nodeType === 8)
                if (t = l.data,
                t === "/$") {
                    if (r === 0) {
                        e.removeChild(l),
                        Yt(n);
                        return
                    }
                    r--
                } else
                    t !== "$" && t !== "$?" && t !== "$!" || r++;
            t = l
        } while (t);
        Yt(n)
    }
    function Bn(e) {
        for (; e != null; e = e.nextSibling) {
            var n = e.nodeType;
            if (n === 1 || n === 3)
                break;
            if (n === 8) {
                if (n = e.data,
                n === "$" || n === "$!" || n === "$?")
                    break;
                if (n === "/$")
                    return null
            }
        }
        return e
    }
    function ss(e) {
        e = e.previousSibling;
        for (var n = 0; e; ) {
            if (e.nodeType === 8) {
                var t = e.data;
                if (t === "$" || t === "$!" || t === "$?") {
                    if (n === 0)
                        return e;
                    n--
                } else
                    t === "/$" && n++
            }
            e = e.previousSibling
        }
        return null
    }
    var St = Math.random().toString(36).slice(2)
      , yn = "__reactFiber$" + St
      , or = "__reactProps$" + St
      , Nn = "__reactContainer$" + St
      , Pi = "__reactEvents$" + St
      , _d = "__reactListeners$" + St
      , Td = "__reactHandles$" + St;
    function et(e) {
        var n = e[yn];
        if (n)
            return n;
        for (var t = e.parentNode; t; ) {
            if (n = t[Nn] || t[yn]) {
                if (t = n.alternate,
                n.child !== null || t !== null && t.child !== null)
                    for (e = ss(e); e !== null; ) {
                        if (t = e[yn])
                            return t;
                        e = ss(e)
                    }
                return n
            }
            e = t,
            t = e.parentNode
        }
        return null
    }
    function ur(e) {
        return e = e[yn] || e[Nn],
        !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e
    }
    function xt(e) {
        if (e.tag === 5 || e.tag === 6)
            return e.stateNode;
        throw Error(a(33))
    }
    function Yr(e) {
        return e[or] || null
    }
    var Li = []
      , Nt = -1;
    function $n(e) {
        return {
            current: e
        }
    }
    function he(e) {
        0 > Nt || (e.current = Li[Nt],
        Li[Nt] = null,
        Nt--)
    }
    function de(e, n) {
        Nt++,
        Li[Nt] = e.current,
        e.current = n
    }
    var Un = {}
      , Oe = $n(Un)
      , Ue = $n(!1)
      , nt = Un;
    function Et(e, n) {
        var t = e.type.contextTypes;
        if (!t)
            return Un;
        var r = e.stateNode;
        if (r && r.__reactInternalMemoizedUnmaskedChildContext === n)
            return r.__reactInternalMemoizedMaskedChildContext;
        var l = {}, i;
        for (i in t)
            l[i] = n[i];
        return r && (e = e.stateNode,
        e.__reactInternalMemoizedUnmaskedChildContext = n,
        e.__reactInternalMemoizedMaskedChildContext = l),
        l
    }
    function He(e) {
        return e = e.childContextTypes,
        e != null
    }
    function Xr() {
        he(Ue),
        he(Oe)
    }
    function as(e, n, t) {
        if (Oe.current !== Un)
            throw Error(a(168));
        de(Oe, n),
        de(Ue, t)
    }
    function cs(e, n, t) {
        var r = e.stateNode;
        if (n = n.childContextTypes,
        typeof r.getChildContext != "function")
            return t;
        r = r.getChildContext();
        for (var l in r)
            if (!(l in n))
                throw Error(a(108, ce(e) || "Unknown", l));
        return R({}, t, r)
    }
    function qr(e) {
        return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Un,
        nt = Oe.current,
        de(Oe, e),
        de(Ue, Ue.current),
        !0
    }
    function ds(e, n, t) {
        var r = e.stateNode;
        if (!r)
            throw Error(a(169));
        t ? (e = cs(e, n, nt),
        r.__reactInternalMemoizedMergedChildContext = e,
        he(Ue),
        he(Oe),
        de(Oe, e)) : he(Ue),
        de(Ue, t)
    }
    var En = null
      , Jr = !1
      , Mi = !1;
    function fs(e) {
        En === null ? En = [e] : En.push(e)
    }
    function jd(e) {
        Jr = !0,
        fs(e)
    }
    function Hn() {
        if (!Mi && En !== null) {
            Mi = !0;
            var e = 0
              , n = se;
            try {
                var t = En;
                for (se = 1; e < t.length; e++) {
                    var r = t[e];
                    do
                        r = r(!0);
                    while (r !== null)
                }
                En = null,
                Jr = !1
            } catch (l) {
                throw En !== null && (En = En.slice(e + 1)),
                pu(Zl, Hn),
                l
            } finally {
                se = n,
                Mi = !1
            }
        }
        return null
    }
    var Ct = []
      , _t = 0
      , Zr = null
      , el = 0
      , Ze = []
      , en = 0
      , tt = null
      , Cn = 1
      , _n = "";
    function rt(e, n) {
        Ct[_t++] = el,
        Ct[_t++] = Zr,
        Zr = e,
        el = n
    }
    function hs(e, n, t) {
        Ze[en++] = Cn,
        Ze[en++] = _n,
        Ze[en++] = tt,
        tt = e;
        var r = Cn;
        e = _n;
        var l = 32 - sn(r) - 1;
        r &= ~(1 << l),
        t += 1;
        var i = 32 - sn(n) + l;
        if (30 < i) {
            var o = l - l % 5;
            i = (r & (1 << o) - 1).toString(32),
            r >>= o,
            l -= o,
            Cn = 1 << 32 - sn(n) + l | t << l | r,
            _n = i + e
        } else
            Cn = 1 << i | t << l | r,
            _n = e
    }
    function Oi(e) {
        e.return !== null && (rt(e, 1),
        hs(e, 1, 0))
    }
    function Ri(e) {
        for (; e === Zr; )
            Zr = Ct[--_t],
            Ct[_t] = null,
            el = Ct[--_t],
            Ct[_t] = null;
        for (; e === tt; )
            tt = Ze[--en],
            Ze[en] = null,
            _n = Ze[--en],
            Ze[en] = null,
            Cn = Ze[--en],
            Ze[en] = null
    }
    var Xe = null
      , qe = null
      , me = !1
      , cn = null;
    function ps(e, n) {
        var t = ln(5, null, null, 0);
        t.elementType = "DELETED",
        t.stateNode = n,
        t.return = e,
        n = e.deletions,
        n === null ? (e.deletions = [t],
        e.flags |= 16) : n.push(t)
    }
    function ms(e, n) {
        switch (e.tag) {
        case 5:
            var t = e.type;
            return n = n.nodeType !== 1 || t.toLowerCase() !== n.nodeName.toLowerCase() ? null : n,
            n !== null ? (e.stateNode = n,
            Xe = e,
            qe = Bn(n.firstChild),
            !0) : !1;
        case 6:
            return n = e.pendingProps === "" || n.nodeType !== 3 ? null : n,
            n !== null ? (e.stateNode = n,
            Xe = e,
            qe = null,
            !0) : !1;
        case 13:
            return n = n.nodeType !== 8 ? null : n,
            n !== null ? (t = tt !== null ? {
                id: Cn,
                overflow: _n
            } : null,
            e.memoizedState = {
                dehydrated: n,
                treeContext: t,
                retryLane: 1073741824
            },
            t = ln(18, null, null, 0),
            t.stateNode = n,
            t.return = e,
            e.child = t,
            Xe = e,
            qe = null,
            !0) : !1;
        default:
            return !1
        }
    }
    function zi(e) {
        return (e.mode & 1) !== 0 && (e.flags & 128) === 0
    }
    function Di(e) {
        if (me) {
            var n = qe;
            if (n) {
                var t = n;
                if (!ms(e, n)) {
                    if (zi(e))
                        throw Error(a(418));
                    n = Bn(t.nextSibling);
                    var r = Xe;
                    n && ms(e, n) ? ps(r, t) : (e.flags = e.flags & -4097 | 2,
                    me = !1,
                    Xe = e)
                }
            } else {
                if (zi(e))
                    throw Error(a(418));
                e.flags = e.flags & -4097 | 2,
                me = !1,
                Xe = e
            }
        }
    }
    function gs(e) {
        for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
            e = e.return;
        Xe = e
    }
    function nl(e) {
        if (e !== Xe)
            return !1;
        if (!me)
            return gs(e),
            me = !0,
            !1;
        var n;
        if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type,
        n = n !== "head" && n !== "body" && !_i(e.type, e.memoizedProps)),
        n && (n = qe)) {
            if (zi(e))
                throw vs(),
                Error(a(418));
            for (; n; )
                ps(e, n),
                n = Bn(n.nextSibling)
        }
        if (gs(e),
        e.tag === 13) {
            if (e = e.memoizedState,
            e = e !== null ? e.dehydrated : null,
            !e)
                throw Error(a(317));
            e: {
                for (e = e.nextSibling,
                n = 0; e; ) {
                    if (e.nodeType === 8) {
                        var t = e.data;
                        if (t === "/$") {
                            if (n === 0) {
                                qe = Bn(e.nextSibling);
                                break e
                            }
                            n--
                        } else
                            t !== "$" && t !== "$!" && t !== "$?" || n++
                    }
                    e = e.nextSibling
                }
                qe = null
            }
        } else
            qe = Xe ? Bn(e.stateNode.nextSibling) : null;
        return !0
    }
    function vs() {
        for (var e = qe; e; )
            e = Bn(e.nextSibling)
    }
    function Tt() {
        qe = Xe = null,
        me = !1
    }
    function Ii(e) {
        cn === null ? cn = [e] : cn.push(e)
    }
    var Pd = D.ReactCurrentBatchConfig;
    function sr(e, n, t) {
        if (e = t.ref,
        e !== null && typeof e != "function" && typeof e != "object") {
            if (t._owner) {
                if (t = t._owner,
                t) {
                    if (t.tag !== 1)
                        throw Error(a(309));
                    var r = t.stateNode
                }
                if (!r)
                    throw Error(a(147, e));
                var l = r
                  , i = "" + e;
                return n !== null && n.ref !== null && typeof n.ref == "function" && n.ref._stringRef === i ? n.ref : (n = function(o) {
                    var s = l.refs;
                    o === null ? delete s[i] : s[i] = o
                }
                ,
                n._stringRef = i,
                n)
            }
            if (typeof e != "string")
                throw Error(a(284));
            if (!t._owner)
                throw Error(a(290, e))
        }
        return e
    }
    function tl(e, n) {
        throw e = Object.prototype.toString.call(n),
        Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e))
    }
    function ys(e) {
        var n = e._init;
        return n(e._payload)
    }
    function ks(e) {
        function n(m, f) {
            if (e) {
                var g = m.deletions;
                g === null ? (m.deletions = [f],
                m.flags |= 16) : g.push(f)
            }
        }
        function t(m, f) {
            if (!e)
                return null;
            for (; f !== null; )
                n(m, f),
                f = f.sibling;
            return null
        }
        function r(m, f) {
            for (m = new Map; f !== null; )
                f.key !== null ? m.set(f.key, f) : m.set(f.index, f),
                f = f.sibling;
            return m
        }
        function l(m, f) {
            return m = Xn(m, f),
            m.index = 0,
            m.sibling = null,
            m
        }
        function i(m, f, g) {
            return m.index = g,
            e ? (g = m.alternate,
            g !== null ? (g = g.index,
            g < f ? (m.flags |= 2,
            f) : g) : (m.flags |= 2,
            f)) : (m.flags |= 1048576,
            f)
        }
        function o(m) {
            return e && m.alternate === null && (m.flags |= 2),
            m
        }
        function s(m, f, g, E) {
            return f === null || f.tag !== 6 ? (f = jo(g, m.mode, E),
            f.return = m,
            f) : (f = l(f, g),
            f.return = m,
            f)
        }
        function d(m, f, g, E) {
            var A = g.type;
            return A === Ee ? x(m, f, g.props.children, E, g.key) : f !== null && (f.elementType === A || typeof A == "object" && A !== null && A.$$typeof === $e && ys(A) === f.type) ? (E = l(f, g.props),
            E.ref = sr(m, f, g),
            E.return = m,
            E) : (E = _l(g.type, g.key, g.props, null, m.mode, E),
            E.ref = sr(m, f, g),
            E.return = m,
            E)
        }
        function v(m, f, g, E) {
            return f === null || f.tag !== 4 || f.stateNode.containerInfo !== g.containerInfo || f.stateNode.implementation !== g.implementation ? (f = Po(g, m.mode, E),
            f.return = m,
            f) : (f = l(f, g.children || []),
            f.return = m,
            f)
        }
        function x(m, f, g, E, A) {
            return f === null || f.tag !== 7 ? (f = dt(g, m.mode, E, A),
            f.return = m,
            f) : (f = l(f, g),
            f.return = m,
            f)
        }
        function N(m, f, g) {
            if (typeof f == "string" && f !== "" || typeof f == "number")
                return f = jo("" + f, m.mode, g),
                f.return = m,
                f;
            if (typeof f == "object" && f !== null) {
                switch (f.$$typeof) {
                case ae:
                    return g = _l(f.type, f.key, f.props, null, m.mode, g),
                    g.ref = sr(m, null, f),
                    g.return = m,
                    g;
                case ne:
                    return f = Po(f, m.mode, g),
                    f.return = m,
                    f;
                case $e:
                    var E = f._init;
                    return N(m, E(f._payload), g)
                }
                if (At(f) || Q(f))
                    return f = dt(f, m.mode, g, null),
                    f.return = m,
                    f;
                tl(m, f)
            }
            return null
        }
        function k(m, f, g, E) {
            var A = f !== null ? f.key : null;
            if (typeof g == "string" && g !== "" || typeof g == "number")
                return A !== null ? null : s(m, f, "" + g, E);
            if (typeof g == "object" && g !== null) {
                switch (g.$$typeof) {
                case ae:
                    return g.key === A ? d(m, f, g, E) : null;
                case ne:
                    return g.key === A ? v(m, f, g, E) : null;
                case $e:
                    return A = g._init,
                    k(m, f, A(g._payload), E)
                }
                if (At(g) || Q(g))
                    return A !== null ? null : x(m, f, g, E, null);
                tl(m, g)
            }
            return null
        }
        function j(m, f, g, E, A) {
            if (typeof E == "string" && E !== "" || typeof E == "number")
                return m = m.get(g) || null,
                s(f, m, "" + E, A);
            if (typeof E == "object" && E !== null) {
                switch (E.$$typeof) {
                case ae:
                    return m = m.get(E.key === null ? g : E.key) || null,
                    d(f, m, E, A);
                case ne:
                    return m = m.get(E.key === null ? g : E.key) || null,
                    v(f, m, E, A);
                case $e:
                    var H = E._init;
                    return j(m, f, g, H(E._payload), A)
                }
                if (At(E) || Q(E))
                    return m = m.get(g) || null,
                    x(f, m, E, A, null);
                tl(f, E)
            }
            return null
        }
        function z(m, f, g, E) {
            for (var A = null, H = null, V = f, b = f = 0, Pe = null; V !== null && b < g.length; b++) {
                V.index > b ? (Pe = V,
                V = null) : Pe = V.sibling;
                var oe = k(m, V, g[b], E);
                if (oe === null) {
                    V === null && (V = Pe);
                    break
                }
                e && V && oe.alternate === null && n(m, V),
                f = i(oe, f, b),
                H === null ? A = oe : H.sibling = oe,
                H = oe,
                V = Pe
            }
            if (b === g.length)
                return t(m, V),
                me && rt(m, b),
                A;
            if (V === null) {
                for (; b < g.length; b++)
                    V = N(m, g[b], E),
                    V !== null && (f = i(V, f, b),
                    H === null ? A = V : H.sibling = V,
                    H = V);
                return me && rt(m, b),
                A
            }
            for (V = r(m, V); b < g.length; b++)
                Pe = j(V, m, b, g[b], E),
                Pe !== null && (e && Pe.alternate !== null && V.delete(Pe.key === null ? b : Pe.key),
                f = i(Pe, f, b),
                H === null ? A = Pe : H.sibling = Pe,
                H = Pe);
            return e && V.forEach(function(qn) {
                return n(m, qn)
            }),
            me && rt(m, b),
            A
        }
        function I(m, f, g, E) {
            var A = Q(g);
            if (typeof A != "function")
                throw Error(a(150));
            if (g = A.call(g),
            g == null)
                throw Error(a(151));
            for (var H = A = null, V = f, b = f = 0, Pe = null, oe = g.next(); V !== null && !oe.done; b++,
            oe = g.next()) {
                V.index > b ? (Pe = V,
                V = null) : Pe = V.sibling;
                var qn = k(m, V, oe.value, E);
                if (qn === null) {
                    V === null && (V = Pe);
                    break
                }
                e && V && qn.alternate === null && n(m, V),
                f = i(qn, f, b),
                H === null ? A = qn : H.sibling = qn,
                H = qn,
                V = Pe
            }
            if (oe.done)
                return t(m, V),
                me && rt(m, b),
                A;
            if (V === null) {
                for (; !oe.done; b++,
                oe = g.next())
                    oe = N(m, oe.value, E),
                    oe !== null && (f = i(oe, f, b),
                    H === null ? A = oe : H.sibling = oe,
                    H = oe);
                return me && rt(m, b),
                A
            }
            for (V = r(m, V); !oe.done; b++,
            oe = g.next())
                oe = j(V, m, b, oe.value, E),
                oe !== null && (e && oe.alternate !== null && V.delete(oe.key === null ? b : oe.key),
                f = i(oe, f, b),
                H === null ? A = oe : H.sibling = oe,
                H = oe);
            return e && V.forEach(function(af) {
                return n(m, af)
            }),
            me && rt(m, b),
            A
        }
        function Se(m, f, g, E) {
            if (typeof g == "object" && g !== null && g.type === Ee && g.key === null && (g = g.props.children),
            typeof g == "object" && g !== null) {
                switch (g.$$typeof) {
                case ae:
                    e: {
                        for (var A = g.key, H = f; H !== null; ) {
                            if (H.key === A) {
                                if (A = g.type,
                                A === Ee) {
                                    if (H.tag === 7) {
                                        t(m, H.sibling),
                                        f = l(H, g.props.children),
                                        f.return = m,
                                        m = f;
                                        break e
                                    }
                                } else if (H.elementType === A || typeof A == "object" && A !== null && A.$$typeof === $e && ys(A) === H.type) {
                                    t(m, H.sibling),
                                    f = l(H, g.props),
                                    f.ref = sr(m, H, g),
                                    f.return = m,
                                    m = f;
                                    break e
                                }
                                t(m, H);
                                break
                            } else
                                n(m, H);
                            H = H.sibling
                        }
                        g.type === Ee ? (f = dt(g.props.children, m.mode, E, g.key),
                        f.return = m,
                        m = f) : (E = _l(g.type, g.key, g.props, null, m.mode, E),
                        E.ref = sr(m, f, g),
                        E.return = m,
                        m = E)
                    }
                    return o(m);
                case ne:
                    e: {
                        for (H = g.key; f !== null; ) {
                            if (f.key === H)
                                if (f.tag === 4 && f.stateNode.containerInfo === g.containerInfo && f.stateNode.implementation === g.implementation) {
                                    t(m, f.sibling),
                                    f = l(f, g.children || []),
                                    f.return = m,
                                    m = f;
                                    break e
                                } else {
                                    t(m, f);
                                    break
                                }
                            else
                                n(m, f);
                            f = f.sibling
                        }
                        f = Po(g, m.mode, E),
                        f.return = m,
                        m = f
                    }
                    return o(m);
                case $e:
                    return H = g._init,
                    Se(m, f, H(g._payload), E)
                }
                if (At(g))
                    return z(m, f, g, E);
                if (Q(g))
                    return I(m, f, g, E);
                tl(m, g)
            }
            return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g,
            f !== null && f.tag === 6 ? (t(m, f.sibling),
            f = l(f, g),
            f.return = m,
            m = f) : (t(m, f),
            f = jo(g, m.mode, E),
            f.return = m,
            m = f),
            o(m)) : t(m, f)
        }
        return Se
    }
    var jt = ks(!0)
      , ws = ks(!1)
      , rl = $n(null)
      , ll = null
      , Pt = null
      , Ai = null;
    function Fi() {
        Ai = Pt = ll = null
    }
    function Bi(e) {
        var n = rl.current;
        he(rl),
        e._currentValue = n
    }
    function $i(e, n, t) {
        for (; e !== null; ) {
            var r = e.alternate;
            if ((e.childLanes & n) !== n ? (e.childLanes |= n,
            r !== null && (r.childLanes |= n)) : r !== null && (r.childLanes & n) !== n && (r.childLanes |= n),
            e === t)
                break;
            e = e.return
        }
    }
    function Lt(e, n) {
        ll = e,
        Ai = Pt = null,
        e = e.dependencies,
        e !== null && e.firstContext !== null && ((e.lanes & n) !== 0 && (Ve = !0),
        e.firstContext = null)
    }
    function nn(e) {
        var n = e._currentValue;
        if (Ai !== e)
            if (e = {
                context: e,
                memoizedValue: n,
                next: null
            },
            Pt === null) {
                if (ll === null)
                    throw Error(a(308));
                Pt = e,
                ll.dependencies = {
                    lanes: 0,
                    firstContext: e
                }
            } else
                Pt = Pt.next = e;
        return n
    }
    var lt = null;
    function Ui(e) {
        lt === null ? lt = [e] : lt.push(e)
    }
    function Ss(e, n, t, r) {
        var l = n.interleaved;
        return l === null ? (t.next = t,
        Ui(n)) : (t.next = l.next,
        l.next = t),
        n.interleaved = t,
        Tn(e, r)
    }
    function Tn(e, n) {
        e.lanes |= n;
        var t = e.alternate;
        for (t !== null && (t.lanes |= n),
        t = e,
        e = e.return; e !== null; )
            e.childLanes |= n,
            t = e.alternate,
            t !== null && (t.childLanes |= n),
            t = e,
            e = e.return;
        return t.tag === 3 ? t.stateNode : null
    }
    var Vn = !1;
    function Hi(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                pending: null,
                interleaved: null,
                lanes: 0
            },
            effects: null
        }
    }
    function xs(e, n) {
        e = e.updateQueue,
        n.updateQueue === e && (n.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            effects: e.effects
        })
    }
    function jn(e, n) {
        return {
            eventTime: e,
            lane: n,
            tag: 0,
            payload: null,
            callback: null,
            next: null
        }
    }
    function Wn(e, n, t) {
        var r = e.updateQueue;
        if (r === null)
            return null;
        if (r = r.shared,
        (te & 2) !== 0) {
            var l = r.pending;
            return l === null ? n.next = n : (n.next = l.next,
            l.next = n),
            r.pending = n,
            Tn(e, t)
        }
        return l = r.interleaved,
        l === null ? (n.next = n,
        Ui(r)) : (n.next = l.next,
        l.next = n),
        r.interleaved = n,
        Tn(e, t)
    }
    function il(e, n, t) {
        if (n = n.updateQueue,
        n !== null && (n = n.shared,
        (t & 4194240) !== 0)) {
            var r = n.lanes;
            r &= e.pendingLanes,
            t |= r,
            n.lanes = t,
            ti(e, t)
        }
    }
    function Ns(e, n) {
        var t = e.updateQueue
          , r = e.alternate;
        if (r !== null && (r = r.updateQueue,
        t === r)) {
            var l = null
              , i = null;
            if (t = t.firstBaseUpdate,
            t !== null) {
                do {
                    var o = {
                        eventTime: t.eventTime,
                        lane: t.lane,
                        tag: t.tag,
                        payload: t.payload,
                        callback: t.callback,
                        next: null
                    };
                    i === null ? l = i = o : i = i.next = o,
                    t = t.next
                } while (t !== null);
                i === null ? l = i = n : i = i.next = n
            } else
                l = i = n;
            t = {
                baseState: r.baseState,
                firstBaseUpdate: l,
                lastBaseUpdate: i,
                shared: r.shared,
                effects: r.effects
            },
            e.updateQueue = t;
            return
        }
        e = t.lastBaseUpdate,
        e === null ? t.firstBaseUpdate = n : e.next = n,
        t.lastBaseUpdate = n
    }
    function ol(e, n, t, r) {
        var l = e.updateQueue;
        Vn = !1;
        var i = l.firstBaseUpdate
          , o = l.lastBaseUpdate
          , s = l.shared.pending;
        if (s !== null) {
            l.shared.pending = null;
            var d = s
              , v = d.next;
            d.next = null,
            o === null ? i = v : o.next = v,
            o = d;
            var x = e.alternate;
            x !== null && (x = x.updateQueue,
            s = x.lastBaseUpdate,
            s !== o && (s === null ? x.firstBaseUpdate = v : s.next = v,
            x.lastBaseUpdate = d))
        }
        if (i !== null) {
            var N = l.baseState;
            o = 0,
            x = v = d = null,
            s = i;
            do {
                var k = s.lane
                  , j = s.eventTime;
                if ((r & k) === k) {
                    x !== null && (x = x.next = {
                        eventTime: j,
                        lane: 0,
                        tag: s.tag,
                        payload: s.payload,
                        callback: s.callback,
                        next: null
                    });
                    e: {
                        var z = e
                          , I = s;
                        switch (k = n,
                        j = t,
                        I.tag) {
                        case 1:
                            if (z = I.payload,
                            typeof z == "function") {
                                N = z.call(j, N, k);
                                break e
                            }
                            N = z;
                            break e;
                        case 3:
                            z.flags = z.flags & -65537 | 128;
                        case 0:
                            if (z = I.payload,
                            k = typeof z == "function" ? z.call(j, N, k) : z,
                            k == null)
                                break e;
                            N = R({}, N, k);
                            break e;
                        case 2:
                            Vn = !0
                        }
                    }
                    s.callback !== null && s.lane !== 0 && (e.flags |= 64,
                    k = l.effects,
                    k === null ? l.effects = [s] : k.push(s))
                } else
                    j = {
                        eventTime: j,
                        lane: k,
                        tag: s.tag,
                        payload: s.payload,
                        callback: s.callback,
                        next: null
                    },
                    x === null ? (v = x = j,
                    d = N) : x = x.next = j,
                    o |= k;
                if (s = s.next,
                s === null) {
                    if (s = l.shared.pending,
                    s === null)
                        break;
                    k = s,
                    s = k.next,
                    k.next = null,
                    l.lastBaseUpdate = k,
                    l.shared.pending = null
                }
            } while (!0);
            if (x === null && (d = N),
            l.baseState = d,
            l.firstBaseUpdate = v,
            l.lastBaseUpdate = x,
            n = l.shared.interleaved,
            n !== null) {
                l = n;
                do
                    o |= l.lane,
                    l = l.next;
                while (l !== n)
            } else
                i === null && (l.shared.lanes = 0);
            ut |= o,
            e.lanes = o,
            e.memoizedState = N
        }
    }
    function Es(e, n, t) {
        if (e = n.effects,
        n.effects = null,
        e !== null)
            for (n = 0; n < e.length; n++) {
                var r = e[n]
                  , l = r.callback;
                if (l !== null) {
                    if (r.callback = null,
                    r = t,
                    typeof l != "function")
                        throw Error(a(191, l));
                    l.call(r)
                }
            }
    }
    var ar = {}
      , kn = $n(ar)
      , cr = $n(ar)
      , dr = $n(ar);
    function it(e) {
        if (e === ar)
            throw Error(a(174));
        return e
    }
    function Vi(e, n) {
        switch (de(dr, n),
        de(cr, e),
        de(kn, ar),
        e = n.nodeType,
        e) {
        case 9:
        case 11:
            n = (n = n.documentElement) ? n.namespaceURI : Wl(null, "");
            break;
        default:
            e = e === 8 ? n.parentNode : n,
            n = e.namespaceURI || null,
            e = e.tagName,
            n = Wl(n, e)
        }
        he(kn),
        de(kn, n)
    }
    function Mt() {
        he(kn),
        he(cr),
        he(dr)
    }
    function Cs(e) {
        it(dr.current);
        var n = it(kn.current)
          , t = Wl(n, e.type);
        n !== t && (de(cr, e),
        de(kn, t))
    }
    function Wi(e) {
        cr.current === e && (he(kn),
        he(cr))
    }
    var ge = $n(0);
    function ul(e) {
        for (var n = e; n !== null; ) {
            if (n.tag === 13) {
                var t = n.memoizedState;
                if (t !== null && (t = t.dehydrated,
                t === null || t.data === "$?" || t.data === "$!"))
                    return n
            } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
                if ((n.flags & 128) !== 0)
                    return n
            } else if (n.child !== null) {
                n.child.return = n,
                n = n.child;
                continue
            }
            if (n === e)
                break;
            for (; n.sibling === null; ) {
                if (n.return === null || n.return === e)
                    return null;
                n = n.return
            }
            n.sibling.return = n.return,
            n = n.sibling
        }
        return null
    }
    var Ki = [];
    function Qi() {
        for (var e = 0; e < Ki.length; e++)
            Ki[e]._workInProgressVersionPrimary = null;
        Ki.length = 0
    }
    var sl = D.ReactCurrentDispatcher
      , Gi = D.ReactCurrentBatchConfig
      , ot = 0
      , ve = null
      , Ce = null
      , Te = null
      , al = !1
      , fr = !1
      , hr = 0
      , Ld = 0;
    function Re() {
        throw Error(a(321))
    }
    function bi(e, n) {
        if (n === null)
            return !1;
        for (var t = 0; t < n.length && t < e.length; t++)
            if (!an(e[t], n[t]))
                return !1;
        return !0
    }
    function Yi(e, n, t, r, l, i) {
        if (ot = i,
        ve = n,
        n.memoizedState = null,
        n.updateQueue = null,
        n.lanes = 0,
        sl.current = e === null || e.memoizedState === null ? zd : Dd,
        e = t(r, l),
        fr) {
            i = 0;
            do {
                if (fr = !1,
                hr = 0,
                25 <= i)
                    throw Error(a(301));
                i += 1,
                Te = Ce = null,
                n.updateQueue = null,
                sl.current = Id,
                e = t(r, l)
            } while (fr)
        }
        if (sl.current = fl,
        n = Ce !== null && Ce.next !== null,
        ot = 0,
        Te = Ce = ve = null,
        al = !1,
        n)
            throw Error(a(300));
        return e
    }
    function Xi() {
        var e = hr !== 0;
        return hr = 0,
        e
    }
    function wn() {
        var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null
        };
        return Te === null ? ve.memoizedState = Te = e : Te = Te.next = e,
        Te
    }
    function tn() {
        if (Ce === null) {
            var e = ve.alternate;
            e = e !== null ? e.memoizedState : null
        } else
            e = Ce.next;
        var n = Te === null ? ve.memoizedState : Te.next;
        if (n !== null)
            Te = n,
            Ce = e;
        else {
            if (e === null)
                throw Error(a(310));
            Ce = e,
            e = {
                memoizedState: Ce.memoizedState,
                baseState: Ce.baseState,
                baseQueue: Ce.baseQueue,
                queue: Ce.queue,
                next: null
            },
            Te === null ? ve.memoizedState = Te = e : Te = Te.next = e
        }
        return Te
    }
    function pr(e, n) {
        return typeof n == "function" ? n(e) : n
    }
    function qi(e) {
        var n = tn()
          , t = n.queue;
        if (t === null)
            throw Error(a(311));
        t.lastRenderedReducer = e;
        var r = Ce
          , l = r.baseQueue
          , i = t.pending;
        if (i !== null) {
            if (l !== null) {
                var o = l.next;
                l.next = i.next,
                i.next = o
            }
            r.baseQueue = l = i,
            t.pending = null
        }
        if (l !== null) {
            i = l.next,
            r = r.baseState;
            var s = o = null
              , d = null
              , v = i;
            do {
                var x = v.lane;
                if ((ot & x) === x)
                    d !== null && (d = d.next = {
                        lane: 0,
                        action: v.action,
                        hasEagerState: v.hasEagerState,
                        eagerState: v.eagerState,
                        next: null
                    }),
                    r = v.hasEagerState ? v.eagerState : e(r, v.action);
                else {
                    var N = {
                        lane: x,
                        action: v.action,
                        hasEagerState: v.hasEagerState,
                        eagerState: v.eagerState,
                        next: null
                    };
                    d === null ? (s = d = N,
                    o = r) : d = d.next = N,
                    ve.lanes |= x,
                    ut |= x
                }
                v = v.next
            } while (v !== null && v !== i);
            d === null ? o = r : d.next = s,
            an(r, n.memoizedState) || (Ve = !0),
            n.memoizedState = r,
            n.baseState = o,
            n.baseQueue = d,
            t.lastRenderedState = r
        }
        if (e = t.interleaved,
        e !== null) {
            l = e;
            do
                i = l.lane,
                ve.lanes |= i,
                ut |= i,
                l = l.next;
            while (l !== e)
        } else
            l === null && (t.lanes = 0);
        return [n.memoizedState, t.dispatch]
    }
    function Ji(e) {
        var n = tn()
          , t = n.queue;
        if (t === null)
            throw Error(a(311));
        t.lastRenderedReducer = e;
        var r = t.dispatch
          , l = t.pending
          , i = n.memoizedState;
        if (l !== null) {
            t.pending = null;
            var o = l = l.next;
            do
                i = e(i, o.action),
                o = o.next;
            while (o !== l);
            an(i, n.memoizedState) || (Ve = !0),
            n.memoizedState = i,
            n.baseQueue === null && (n.baseState = i),
            t.lastRenderedState = i
        }
        return [i, r]
    }
    function _s() {}
    function Ts(e, n) {
        var t = ve
          , r = tn()
          , l = n()
          , i = !an(r.memoizedState, l);
        if (i && (r.memoizedState = l,
        Ve = !0),
        r = r.queue,
        Zi(Ls.bind(null, t, r, e), [e]),
        r.getSnapshot !== n || i || Te !== null && Te.memoizedState.tag & 1) {
            if (t.flags |= 2048,
            mr(9, Ps.bind(null, t, r, l, n), void 0, null),
            je === null)
                throw Error(a(349));
            (ot & 30) !== 0 || js(t, n, l)
        }
        return l
    }
    function js(e, n, t) {
        e.flags |= 16384,
        e = {
            getSnapshot: n,
            value: t
        },
        n = ve.updateQueue,
        n === null ? (n = {
            lastEffect: null,
            stores: null
        },
        ve.updateQueue = n,
        n.stores = [e]) : (t = n.stores,
        t === null ? n.stores = [e] : t.push(e))
    }
    function Ps(e, n, t, r) {
        n.value = t,
        n.getSnapshot = r,
        Ms(n) && Os(e)
    }
    function Ls(e, n, t) {
        return t(function() {
            Ms(n) && Os(e)
        })
    }
    function Ms(e) {
        var n = e.getSnapshot;
        e = e.value;
        try {
            var t = n();
            return !an(e, t)
        } catch {
            return !0
        }
    }
    function Os(e) {
        var n = Tn(e, 1);
        n !== null && pn(n, e, 1, -1)
    }
    function Rs(e) {
        var n = wn();
        return typeof e == "function" && (e = e()),
        n.memoizedState = n.baseState = e,
        e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: pr,
            lastRenderedState: e
        },
        n.queue = e,
        e = e.dispatch = Rd.bind(null, ve, e),
        [n.memoizedState, e]
    }
    function mr(e, n, t, r) {
        return e = {
            tag: e,
            create: n,
            destroy: t,
            deps: r,
            next: null
        },
        n = ve.updateQueue,
        n === null ? (n = {
            lastEffect: null,
            stores: null
        },
        ve.updateQueue = n,
        n.lastEffect = e.next = e) : (t = n.lastEffect,
        t === null ? n.lastEffect = e.next = e : (r = t.next,
        t.next = e,
        e.next = r,
        n.lastEffect = e)),
        e
    }
    function zs() {
        return tn().memoizedState
    }
    function cl(e, n, t, r) {
        var l = wn();
        ve.flags |= e,
        l.memoizedState = mr(1 | n, t, void 0, r === void 0 ? null : r)
    }
    function dl(e, n, t, r) {
        var l = tn();
        r = r === void 0 ? null : r;
        var i = void 0;
        if (Ce !== null) {
            var o = Ce.memoizedState;
            if (i = o.destroy,
            r !== null && bi(r, o.deps)) {
                l.memoizedState = mr(n, t, i, r);
                return
            }
        }
        ve.flags |= e,
        l.memoizedState = mr(1 | n, t, i, r)
    }
    function Ds(e, n) {
        return cl(8390656, 8, e, n)
    }
    function Zi(e, n) {
        return dl(2048, 8, e, n)
    }
    function Is(e, n) {
        return dl(4, 2, e, n)
    }
    function As(e, n) {
        return dl(4, 4, e, n)
    }
    function Fs(e, n) {
        if (typeof n == "function")
            return e = e(),
            n(e),
            function() {
                n(null)
            }
            ;
        if (n != null)
            return e = e(),
            n.current = e,
            function() {
                n.current = null
            }
    }
    function Bs(e, n, t) {
        return t = t != null ? t.concat([e]) : null,
        dl(4, 4, Fs.bind(null, n, e), t)
    }
    function eo() {}
    function $s(e, n) {
        var t = tn();
        n = n === void 0 ? null : n;
        var r = t.memoizedState;
        return r !== null && n !== null && bi(n, r[1]) ? r[0] : (t.memoizedState = [e, n],
        e)
    }
    function Us(e, n) {
        var t = tn();
        n = n === void 0 ? null : n;
        var r = t.memoizedState;
        return r !== null && n !== null && bi(n, r[1]) ? r[0] : (e = e(),
        t.memoizedState = [e, n],
        e)
    }
    function Hs(e, n, t) {
        return (ot & 21) === 0 ? (e.baseState && (e.baseState = !1,
        Ve = !0),
        e.memoizedState = t) : (an(t, n) || (t = yu(),
        ve.lanes |= t,
        ut |= t,
        e.baseState = !0),
        n)
    }
    function Md(e, n) {
        var t = se;
        se = t !== 0 && 4 > t ? t : 4,
        e(!0);
        var r = Gi.transition;
        Gi.transition = {};
        try {
            e(!1),
            n()
        } finally {
            se = t,
            Gi.transition = r
        }
    }
    function Vs() {
        return tn().memoizedState
    }
    function Od(e, n, t) {
        var r = bn(e);
        if (t = {
            lane: r,
            action: t,
            hasEagerState: !1,
            eagerState: null,
            next: null
        },
        Ws(e))
            Ks(n, t);
        else if (t = Ss(e, n, t, r),
        t !== null) {
            var l = Fe();
            pn(t, e, r, l),
            Qs(t, n, r)
        }
    }
    function Rd(e, n, t) {
        var r = bn(e)
          , l = {
            lane: r,
            action: t,
            hasEagerState: !1,
            eagerState: null,
            next: null
        };
        if (Ws(e))
            Ks(n, l);
        else {
            var i = e.alternate;
            if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = n.lastRenderedReducer,
            i !== null))
                try {
                    var o = n.lastRenderedState
                      , s = i(o, t);
                    if (l.hasEagerState = !0,
                    l.eagerState = s,
                    an(s, o)) {
                        var d = n.interleaved;
                        d === null ? (l.next = l,
                        Ui(n)) : (l.next = d.next,
                        d.next = l),
                        n.interleaved = l;
                        return
                    }
                } catch {} finally {}
            t = Ss(e, n, l, r),
            t !== null && (l = Fe(),
            pn(t, e, r, l),
            Qs(t, n, r))
        }
    }
    function Ws(e) {
        var n = e.alternate;
        return e === ve || n !== null && n === ve
    }
    function Ks(e, n) {
        fr = al = !0;
        var t = e.pending;
        t === null ? n.next = n : (n.next = t.next,
        t.next = n),
        e.pending = n
    }
    function Qs(e, n, t) {
        if ((t & 4194240) !== 0) {
            var r = n.lanes;
            r &= e.pendingLanes,
            t |= r,
            n.lanes = t,
            ti(e, t)
        }
    }
    var fl = {
        readContext: nn,
        useCallback: Re,
        useContext: Re,
        useEffect: Re,
        useImperativeHandle: Re,
        useInsertionEffect: Re,
        useLayoutEffect: Re,
        useMemo: Re,
        useReducer: Re,
        useRef: Re,
        useState: Re,
        useDebugValue: Re,
        useDeferredValue: Re,
        useTransition: Re,
        useMutableSource: Re,
        useSyncExternalStore: Re,
        useId: Re,
        unstable_isNewReconciler: !1
    }
      , zd = {
        readContext: nn,
        useCallback: function(e, n) {
            return wn().memoizedState = [e, n === void 0 ? null : n],
            e
        },
        useContext: nn,
        useEffect: Ds,
        useImperativeHandle: function(e, n, t) {
            return t = t != null ? t.concat([e]) : null,
            cl(4194308, 4, Fs.bind(null, n, e), t)
        },
        useLayoutEffect: function(e, n) {
            return cl(4194308, 4, e, n)
        },
        useInsertionEffect: function(e, n) {
            return cl(4, 2, e, n)
        },
        useMemo: function(e, n) {
            var t = wn();
            return n = n === void 0 ? null : n,
            e = e(),
            t.memoizedState = [e, n],
            e
        },
        useReducer: function(e, n, t) {
            var r = wn();
            return n = t !== void 0 ? t(n) : n,
            r.memoizedState = r.baseState = n,
            e = {
                pending: null,
                interleaved: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: e,
                lastRenderedState: n
            },
            r.queue = e,
            e = e.dispatch = Od.bind(null, ve, e),
            [r.memoizedState, e]
        },
        useRef: function(e) {
            var n = wn();
            return e = {
                current: e
            },
            n.memoizedState = e
        },
        useState: Rs,
        useDebugValue: eo,
        useDeferredValue: function(e) {
            return wn().memoizedState = e
        },
        useTransition: function() {
            var e = Rs(!1)
              , n = e[0];
            return e = Md.bind(null, e[1]),
            wn().memoizedState = e,
            [n, e]
        },
        useMutableSource: function() {},
        useSyncExternalStore: function(e, n, t) {
            var r = ve
              , l = wn();
            if (me) {
                if (t === void 0)
                    throw Error(a(407));
                t = t()
            } else {
                if (t = n(),
                je === null)
                    throw Error(a(349));
                (ot & 30) !== 0 || js(r, n, t)
            }
            l.memoizedState = t;
            var i = {
                value: t,
                getSnapshot: n
            };
            return l.queue = i,
            Ds(Ls.bind(null, r, i, e), [e]),
            r.flags |= 2048,
            mr(9, Ps.bind(null, r, i, t, n), void 0, null),
            t
        },
        useId: function() {
            var e = wn()
              , n = je.identifierPrefix;
            if (me) {
                var t = _n
                  , r = Cn;
                t = (r & ~(1 << 32 - sn(r) - 1)).toString(32) + t,
                n = ":" + n + "R" + t,
                t = hr++,
                0 < t && (n += "H" + t.toString(32)),
                n += ":"
            } else
                t = Ld++,
                n = ":" + n + "r" + t.toString(32) + ":";
            return e.memoizedState = n
        },
        unstable_isNewReconciler: !1
    }
      , Dd = {
        readContext: nn,
        useCallback: $s,
        useContext: nn,
        useEffect: Zi,
        useImperativeHandle: Bs,
        useInsertionEffect: Is,
        useLayoutEffect: As,
        useMemo: Us,
        useReducer: qi,
        useRef: zs,
        useState: function() {
            return qi(pr)
        },
        useDebugValue: eo,
        useDeferredValue: function(e) {
            var n = tn();
            return Hs(n, Ce.memoizedState, e)
        },
        useTransition: function() {
            var e = qi(pr)[0]
              , n = tn().memoizedState;
            return [e, n]
        },
        useMutableSource: _s,
        useSyncExternalStore: Ts,
        useId: Vs,
        unstable_isNewReconciler: !1
    }
      , Id = {
        readContext: nn,
        useCallback: $s,
        useContext: nn,
        useEffect: Zi,
        useImperativeHandle: Bs,
        useInsertionEffect: Is,
        useLayoutEffect: As,
        useMemo: Us,
        useReducer: Ji,
        useRef: zs,
        useState: function() {
            return Ji(pr)
        },
        useDebugValue: eo,
        useDeferredValue: function(e) {
            var n = tn();
            return Ce === null ? n.memoizedState = e : Hs(n, Ce.memoizedState, e)
        },
        useTransition: function() {
            var e = Ji(pr)[0]
              , n = tn().memoizedState;
            return [e, n]
        },
        useMutableSource: _s,
        useSyncExternalStore: Ts,
        useId: Vs,
        unstable_isNewReconciler: !1
    };
    function dn(e, n) {
        if (e && e.defaultProps) {
            n = R({}, n),
            e = e.defaultProps;
            for (var t in e)
                n[t] === void 0 && (n[t] = e[t]);
            return n
        }
        return n
    }
    function no(e, n, t, r) {
        n = e.memoizedState,
        t = t(r, n),
        t = t == null ? n : R({}, n, t),
        e.memoizedState = t,
        e.lanes === 0 && (e.updateQueue.baseState = t)
    }
    var hl = {
        isMounted: function(e) {
            return (e = e._reactInternals) ? Zn(e) === e : !1
        },
        enqueueSetState: function(e, n, t) {
            e = e._reactInternals;
            var r = Fe()
              , l = bn(e)
              , i = jn(r, l);
            i.payload = n,
            t != null && (i.callback = t),
            n = Wn(e, i, l),
            n !== null && (pn(n, e, l, r),
            il(n, e, l))
        },
        enqueueReplaceState: function(e, n, t) {
            e = e._reactInternals;
            var r = Fe()
              , l = bn(e)
              , i = jn(r, l);
            i.tag = 1,
            i.payload = n,
            t != null && (i.callback = t),
            n = Wn(e, i, l),
            n !== null && (pn(n, e, l, r),
            il(n, e, l))
        },
        enqueueForceUpdate: function(e, n) {
            e = e._reactInternals;
            var t = Fe()
              , r = bn(e)
              , l = jn(t, r);
            l.tag = 2,
            n != null && (l.callback = n),
            n = Wn(e, l, r),
            n !== null && (pn(n, e, r, t),
            il(n, e, r))
        }
    };
    function Gs(e, n, t, r, l, i, o) {
        return e = e.stateNode,
        typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : n.prototype && n.prototype.isPureReactComponent ? !nr(t, r) || !nr(l, i) : !0
    }
    function bs(e, n, t) {
        var r = !1
          , l = Un
          , i = n.contextType;
        return typeof i == "object" && i !== null ? i = nn(i) : (l = He(n) ? nt : Oe.current,
        r = n.contextTypes,
        i = (r = r != null) ? Et(e, l) : Un),
        n = new n(t,i),
        e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null,
        n.updater = hl,
        e.stateNode = n,
        n._reactInternals = e,
        r && (e = e.stateNode,
        e.__reactInternalMemoizedUnmaskedChildContext = l,
        e.__reactInternalMemoizedMaskedChildContext = i),
        n
    }
    function Ys(e, n, t, r) {
        e = n.state,
        typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(t, r),
        typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(t, r),
        n.state !== e && hl.enqueueReplaceState(n, n.state, null)
    }
    function to(e, n, t, r) {
        var l = e.stateNode;
        l.props = t,
        l.state = e.memoizedState,
        l.refs = {},
        Hi(e);
        var i = n.contextType;
        typeof i == "object" && i !== null ? l.context = nn(i) : (i = He(n) ? nt : Oe.current,
        l.context = Et(e, i)),
        l.state = e.memoizedState,
        i = n.getDerivedStateFromProps,
        typeof i == "function" && (no(e, n, i, t),
        l.state = e.memoizedState),
        typeof n.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (n = l.state,
        typeof l.componentWillMount == "function" && l.componentWillMount(),
        typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(),
        n !== l.state && hl.enqueueReplaceState(l, l.state, null),
        ol(e, t, l, r),
        l.state = e.memoizedState),
        typeof l.componentDidMount == "function" && (e.flags |= 4194308)
    }
    function Ot(e, n) {
        try {
            var t = ""
              , r = n;
            do
                t += le(r),
                r = r.return;
            while (r);
            var l = t
        } catch (i) {
            l = `
Error generating stack: ` + i.message + `
` + i.stack
        }
        return {
            value: e,
            source: n,
            stack: l,
            digest: null
        }
    }
    function ro(e, n, t) {
        return {
            value: e,
            source: null,
            stack: t ?? null,
            digest: n ?? null
        }
    }
    function lo(e, n) {
        try {
            console.error(n.value)
        } catch (t) {
            setTimeout(function() {
                throw t
            })
        }
    }
    var Ad = typeof WeakMap == "function" ? WeakMap : Map;
    function Xs(e, n, t) {
        t = jn(-1, t),
        t.tag = 3,
        t.payload = {
            element: null
        };
        var r = n.value;
        return t.callback = function() {
            wl || (wl = !0,
            wo = r),
            lo(e, n)
        }
        ,
        t
    }
    function qs(e, n, t) {
        t = jn(-1, t),
        t.tag = 3;
        var r = e.type.getDerivedStateFromError;
        if (typeof r == "function") {
            var l = n.value;
            t.payload = function() {
                return r(l)
            }
            ,
            t.callback = function() {
                lo(e, n)
            }
        }
        var i = e.stateNode;
        return i !== null && typeof i.componentDidCatch == "function" && (t.callback = function() {
            lo(e, n),
            typeof r != "function" && (Qn === null ? Qn = new Set([this]) : Qn.add(this));
            var o = n.stack;
            this.componentDidCatch(n.value, {
                componentStack: o !== null ? o : ""
            })
        }
        ),
        t
    }
    function Js(e, n, t) {
        var r = e.pingCache;
        if (r === null) {
            r = e.pingCache = new Ad;
            var l = new Set;
            r.set(n, l)
        } else
            l = r.get(n),
            l === void 0 && (l = new Set,
            r.set(n, l));
        l.has(t) || (l.add(t),
        e = qd.bind(null, e, n, t),
        n.then(e, e))
    }
    function Zs(e) {
        do {
            var n;
            if ((n = e.tag === 13) && (n = e.memoizedState,
            n = n !== null ? n.dehydrated !== null : !0),
            n)
                return e;
            e = e.return
        } while (e !== null);
        return null
    }
    function ea(e, n, t, r, l) {
        return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128,
        t.flags |= 131072,
        t.flags &= -52805,
        t.tag === 1 && (t.alternate === null ? t.tag = 17 : (n = jn(-1, 1),
        n.tag = 2,
        Wn(t, n, 1))),
        t.lanes |= 1),
        e) : (e.flags |= 65536,
        e.lanes = l,
        e)
    }
    var Fd = D.ReactCurrentOwner
      , Ve = !1;
    function Ae(e, n, t, r) {
        n.child = e === null ? ws(n, null, t, r) : jt(n, e.child, t, r)
    }
    function na(e, n, t, r, l) {
        t = t.render;
        var i = n.ref;
        return Lt(n, l),
        r = Yi(e, n, t, r, i, l),
        t = Xi(),
        e !== null && !Ve ? (n.updateQueue = e.updateQueue,
        n.flags &= -2053,
        e.lanes &= ~l,
        Pn(e, n, l)) : (me && t && Oi(n),
        n.flags |= 1,
        Ae(e, n, r, l),
        n.child)
    }
    function ta(e, n, t, r, l) {
        if (e === null) {
            var i = t.type;
            return typeof i == "function" && !To(i) && i.defaultProps === void 0 && t.compare === null && t.defaultProps === void 0 ? (n.tag = 15,
            n.type = i,
            ra(e, n, i, r, l)) : (e = _l(t.type, null, r, n, n.mode, l),
            e.ref = n.ref,
            e.return = n,
            n.child = e)
        }
        if (i = e.child,
        (e.lanes & l) === 0) {
            var o = i.memoizedProps;
            if (t = t.compare,
            t = t !== null ? t : nr,
            t(o, r) && e.ref === n.ref)
                return Pn(e, n, l)
        }
        return n.flags |= 1,
        e = Xn(i, r),
        e.ref = n.ref,
        e.return = n,
        n.child = e
    }
    function ra(e, n, t, r, l) {
        if (e !== null) {
            var i = e.memoizedProps;
            if (nr(i, r) && e.ref === n.ref)
                if (Ve = !1,
                n.pendingProps = r = i,
                (e.lanes & l) !== 0)
                    (e.flags & 131072) !== 0 && (Ve = !0);
                else
                    return n.lanes = e.lanes,
                    Pn(e, n, l)
        }
        return io(e, n, t, r, l)
    }
    function la(e, n, t) {
        var r = n.pendingProps
          , l = r.children
          , i = e !== null ? e.memoizedState : null;
        if (r.mode === "hidden")
            if ((n.mode & 1) === 0)
                n.memoizedState = {
                    baseLanes: 0,
                    cachePool: null,
                    transitions: null
                },
                de(zt, Je),
                Je |= t;
            else {
                if ((t & 1073741824) === 0)
                    return e = i !== null ? i.baseLanes | t : t,
                    n.lanes = n.childLanes = 1073741824,
                    n.memoizedState = {
                        baseLanes: e,
                        cachePool: null,
                        transitions: null
                    },
                    n.updateQueue = null,
                    de(zt, Je),
                    Je |= e,
                    null;
                n.memoizedState = {
                    baseLanes: 0,
                    cachePool: null,
                    transitions: null
                },
                r = i !== null ? i.baseLanes : t,
                de(zt, Je),
                Je |= r
            }
        else
            i !== null ? (r = i.baseLanes | t,
            n.memoizedState = null) : r = t,
            de(zt, Je),
            Je |= r;
        return Ae(e, n, l, t),
        n.child
    }
    function ia(e, n) {
        var t = n.ref;
        (e === null && t !== null || e !== null && e.ref !== t) && (n.flags |= 512,
        n.flags |= 2097152)
    }
    function io(e, n, t, r, l) {
        var i = He(t) ? nt : Oe.current;
        return i = Et(n, i),
        Lt(n, l),
        t = Yi(e, n, t, r, i, l),
        r = Xi(),
        e !== null && !Ve ? (n.updateQueue = e.updateQueue,
        n.flags &= -2053,
        e.lanes &= ~l,
        Pn(e, n, l)) : (me && r && Oi(n),
        n.flags |= 1,
        Ae(e, n, t, l),
        n.child)
    }
    function oa(e, n, t, r, l) {
        if (He(t)) {
            var i = !0;
            qr(n)
        } else
            i = !1;
        if (Lt(n, l),
        n.stateNode === null)
            ml(e, n),
            bs(n, t, r),
            to(n, t, r, l),
            r = !0;
        else if (e === null) {
            var o = n.stateNode
              , s = n.memoizedProps;
            o.props = s;
            var d = o.context
              , v = t.contextType;
            typeof v == "object" && v !== null ? v = nn(v) : (v = He(t) ? nt : Oe.current,
            v = Et(n, v));
            var x = t.getDerivedStateFromProps
              , N = typeof x == "function" || typeof o.getSnapshotBeforeUpdate == "function";
            N || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || d !== v) && Ys(n, o, r, v),
            Vn = !1;
            var k = n.memoizedState;
            o.state = k,
            ol(n, r, o, l),
            d = n.memoizedState,
            s !== r || k !== d || Ue.current || Vn ? (typeof x == "function" && (no(n, t, x, r),
            d = n.memoizedState),
            (s = Vn || Gs(n, t, s, r, k, d, v)) ? (N || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()),
            typeof o.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (n.flags |= 4194308),
            n.memoizedProps = r,
            n.memoizedState = d),
            o.props = r,
            o.state = d,
            o.context = v,
            r = s) : (typeof o.componentDidMount == "function" && (n.flags |= 4194308),
            r = !1)
        } else {
            o = n.stateNode,
            xs(e, n),
            s = n.memoizedProps,
            v = n.type === n.elementType ? s : dn(n.type, s),
            o.props = v,
            N = n.pendingProps,
            k = o.context,
            d = t.contextType,
            typeof d == "object" && d !== null ? d = nn(d) : (d = He(t) ? nt : Oe.current,
            d = Et(n, d));
            var j = t.getDerivedStateFromProps;
            (x = typeof j == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== N || k !== d) && Ys(n, o, r, d),
            Vn = !1,
            k = n.memoizedState,
            o.state = k,
            ol(n, r, o, l);
            var z = n.memoizedState;
            s !== N || k !== z || Ue.current || Vn ? (typeof j == "function" && (no(n, t, j, r),
            z = n.memoizedState),
            (v = Vn || Gs(n, t, v, r, k, z, d) || !1) ? (x || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, z, d),
            typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, z, d)),
            typeof o.componentDidUpdate == "function" && (n.flags |= 4),
            typeof o.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && k === e.memoizedState || (n.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && k === e.memoizedState || (n.flags |= 1024),
            n.memoizedProps = r,
            n.memoizedState = z),
            o.props = r,
            o.state = z,
            o.context = d,
            r = v) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && k === e.memoizedState || (n.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && k === e.memoizedState || (n.flags |= 1024),
            r = !1)
        }
        return oo(e, n, t, r, i, l)
    }
    function oo(e, n, t, r, l, i) {
        ia(e, n);
        var o = (n.flags & 128) !== 0;
        if (!r && !o)
            return l && ds(n, t, !1),
            Pn(e, n, i);
        r = n.stateNode,
        Fd.current = n;
        var s = o && typeof t.getDerivedStateFromError != "function" ? null : r.render();
        return n.flags |= 1,
        e !== null && o ? (n.child = jt(n, e.child, null, i),
        n.child = jt(n, null, s, i)) : Ae(e, n, s, i),
        n.memoizedState = r.state,
        l && ds(n, t, !0),
        n.child
    }
    function ua(e) {
        var n = e.stateNode;
        n.pendingContext ? as(e, n.pendingContext, n.pendingContext !== n.context) : n.context && as(e, n.context, !1),
        Vi(e, n.containerInfo)
    }
    function sa(e, n, t, r, l) {
        return Tt(),
        Ii(l),
        n.flags |= 256,
        Ae(e, n, t, r),
        n.child
    }
    var uo = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0
    };
    function so(e) {
        return {
            baseLanes: e,
            cachePool: null,
            transitions: null
        }
    }
    function aa(e, n, t) {
        var r = n.pendingProps, l = ge.current, i = !1, o = (n.flags & 128) !== 0, s;
        if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
        s ? (i = !0,
        n.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1),
        de(ge, l & 1),
        e === null)
            return Di(n),
            e = n.memoizedState,
            e !== null && (e = e.dehydrated,
            e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824,
            null) : (o = r.children,
            e = r.fallback,
            i ? (r = n.mode,
            i = n.child,
            o = {
                mode: "hidden",
                children: o
            },
            (r & 1) === 0 && i !== null ? (i.childLanes = 0,
            i.pendingProps = o) : i = Tl(o, r, 0, null),
            e = dt(e, r, t, null),
            i.return = n,
            e.return = n,
            i.sibling = e,
            n.child = i,
            n.child.memoizedState = so(t),
            n.memoizedState = uo,
            e) : ao(n, o));
        if (l = e.memoizedState,
        l !== null && (s = l.dehydrated,
        s !== null))
            return Bd(e, n, o, r, s, l, t);
        if (i) {
            i = r.fallback,
            o = n.mode,
            l = e.child,
            s = l.sibling;
            var d = {
                mode: "hidden",
                children: r.children
            };
            return (o & 1) === 0 && n.child !== l ? (r = n.child,
            r.childLanes = 0,
            r.pendingProps = d,
            n.deletions = null) : (r = Xn(l, d),
            r.subtreeFlags = l.subtreeFlags & 14680064),
            s !== null ? i = Xn(s, i) : (i = dt(i, o, t, null),
            i.flags |= 2),
            i.return = n,
            r.return = n,
            r.sibling = i,
            n.child = r,
            r = i,
            i = n.child,
            o = e.child.memoizedState,
            o = o === null ? so(t) : {
                baseLanes: o.baseLanes | t,
                cachePool: null,
                transitions: o.transitions
            },
            i.memoizedState = o,
            i.childLanes = e.childLanes & ~t,
            n.memoizedState = uo,
            r
        }
        return i = e.child,
        e = i.sibling,
        r = Xn(i, {
            mode: "visible",
            children: r.children
        }),
        (n.mode & 1) === 0 && (r.lanes = t),
        r.return = n,
        r.sibling = null,
        e !== null && (t = n.deletions,
        t === null ? (n.deletions = [e],
        n.flags |= 16) : t.push(e)),
        n.child = r,
        n.memoizedState = null,
        r
    }
    function ao(e, n) {
        return n = Tl({
            mode: "visible",
            children: n
        }, e.mode, 0, null),
        n.return = e,
        e.child = n
    }
    function pl(e, n, t, r) {
        return r !== null && Ii(r),
        jt(n, e.child, null, t),
        e = ao(n, n.pendingProps.children),
        e.flags |= 2,
        n.memoizedState = null,
        e
    }
    function Bd(e, n, t, r, l, i, o) {
        if (t)
            return n.flags & 256 ? (n.flags &= -257,
            r = ro(Error(a(422))),
            pl(e, n, o, r)) : n.memoizedState !== null ? (n.child = e.child,
            n.flags |= 128,
            null) : (i = r.fallback,
            l = n.mode,
            r = Tl({
                mode: "visible",
                children: r.children
            }, l, 0, null),
            i = dt(i, l, o, null),
            i.flags |= 2,
            r.return = n,
            i.return = n,
            r.sibling = i,
            n.child = r,
            (n.mode & 1) !== 0 && jt(n, e.child, null, o),
            n.child.memoizedState = so(o),
            n.memoizedState = uo,
            i);
        if ((n.mode & 1) === 0)
            return pl(e, n, o, null);
        if (l.data === "$!") {
            if (r = l.nextSibling && l.nextSibling.dataset,
            r)
                var s = r.dgst;
            return r = s,
            i = Error(a(419)),
            r = ro(i, r, void 0),
            pl(e, n, o, r)
        }
        if (s = (o & e.childLanes) !== 0,
        Ve || s) {
            if (r = je,
            r !== null) {
                switch (o & -o) {
                case 4:
                    l = 2;
                    break;
                case 16:
                    l = 8;
                    break;
                case 64:
                case 128:
                case 256:
                case 512:
                case 1024:
                case 2048:
                case 4096:
                case 8192:
                case 16384:
                case 32768:
                case 65536:
                case 131072:
                case 262144:
                case 524288:
                case 1048576:
                case 2097152:
                case 4194304:
                case 8388608:
                case 16777216:
                case 33554432:
                case 67108864:
                    l = 32;
                    break;
                case 536870912:
                    l = 268435456;
                    break;
                default:
                    l = 0
                }
                l = (l & (r.suspendedLanes | o)) !== 0 ? 0 : l,
                l !== 0 && l !== i.retryLane && (i.retryLane = l,
                Tn(e, l),
                pn(r, e, l, -1))
            }
            return _o(),
            r = ro(Error(a(421))),
            pl(e, n, o, r)
        }
        return l.data === "$?" ? (n.flags |= 128,
        n.child = e.child,
        n = Jd.bind(null, e),
        l._reactRetry = n,
        null) : (e = i.treeContext,
        qe = Bn(l.nextSibling),
        Xe = n,
        me = !0,
        cn = null,
        e !== null && (Ze[en++] = Cn,
        Ze[en++] = _n,
        Ze[en++] = tt,
        Cn = e.id,
        _n = e.overflow,
        tt = n),
        n = ao(n, r.children),
        n.flags |= 4096,
        n)
    }
    function ca(e, n, t) {
        e.lanes |= n;
        var r = e.alternate;
        r !== null && (r.lanes |= n),
        $i(e.return, n, t)
    }
    function co(e, n, t, r, l) {
        var i = e.memoizedState;
        i === null ? e.memoizedState = {
            isBackwards: n,
            rendering: null,
            renderingStartTime: 0,
            last: r,
            tail: t,
            tailMode: l
        } : (i.isBackwards = n,
        i.rendering = null,
        i.renderingStartTime = 0,
        i.last = r,
        i.tail = t,
        i.tailMode = l)
    }
    function da(e, n, t) {
        var r = n.pendingProps
          , l = r.revealOrder
          , i = r.tail;
        if (Ae(e, n, r.children, t),
        r = ge.current,
        (r & 2) !== 0)
            r = r & 1 | 2,
            n.flags |= 128;
        else {
            if (e !== null && (e.flags & 128) !== 0)
                e: for (e = n.child; e !== null; ) {
                    if (e.tag === 13)
                        e.memoizedState !== null && ca(e, t, n);
                    else if (e.tag === 19)
                        ca(e, t, n);
                    else if (e.child !== null) {
                        e.child.return = e,
                        e = e.child;
                        continue
                    }
                    if (e === n)
                        break e;
                    for (; e.sibling === null; ) {
                        if (e.return === null || e.return === n)
                            break e;
                        e = e.return
                    }
                    e.sibling.return = e.return,
                    e = e.sibling
                }
            r &= 1
        }
        if (de(ge, r),
        (n.mode & 1) === 0)
            n.memoizedState = null;
        else
            switch (l) {
            case "forwards":
                for (t = n.child,
                l = null; t !== null; )
                    e = t.alternate,
                    e !== null && ul(e) === null && (l = t),
                    t = t.sibling;
                t = l,
                t === null ? (l = n.child,
                n.child = null) : (l = t.sibling,
                t.sibling = null),
                co(n, !1, l, t, i);
                break;
            case "backwards":
                for (t = null,
                l = n.child,
                n.child = null; l !== null; ) {
                    if (e = l.alternate,
                    e !== null && ul(e) === null) {
                        n.child = l;
                        break
                    }
                    e = l.sibling,
                    l.sibling = t,
                    t = l,
                    l = e
                }
                co(n, !0, t, null, i);
                break;
            case "together":
                co(n, !1, null, null, void 0);
                break;
            default:
                n.memoizedState = null
            }
        return n.child
    }
    function ml(e, n) {
        (n.mode & 1) === 0 && e !== null && (e.alternate = null,
        n.alternate = null,
        n.flags |= 2)
    }
    function Pn(e, n, t) {
        if (e !== null && (n.dependencies = e.dependencies),
        ut |= n.lanes,
        (t & n.childLanes) === 0)
            return null;
        if (e !== null && n.child !== e.child)
            throw Error(a(153));
        if (n.child !== null) {
            for (e = n.child,
            t = Xn(e, e.pendingProps),
            n.child = t,
            t.return = n; e.sibling !== null; )
                e = e.sibling,
                t = t.sibling = Xn(e, e.pendingProps),
                t.return = n;
            t.sibling = null
        }
        return n.child
    }
    function $d(e, n, t) {
        switch (n.tag) {
        case 3:
            ua(n),
            Tt();
            break;
        case 5:
            Cs(n);
            break;
        case 1:
            He(n.type) && qr(n);
            break;
        case 4:
            Vi(n, n.stateNode.containerInfo);
            break;
        case 10:
            var r = n.type._context
              , l = n.memoizedProps.value;
            de(rl, r._currentValue),
            r._currentValue = l;
            break;
        case 13:
            if (r = n.memoizedState,
            r !== null)
                return r.dehydrated !== null ? (de(ge, ge.current & 1),
                n.flags |= 128,
                null) : (t & n.child.childLanes) !== 0 ? aa(e, n, t) : (de(ge, ge.current & 1),
                e = Pn(e, n, t),
                e !== null ? e.sibling : null);
            de(ge, ge.current & 1);
            break;
        case 19:
            if (r = (t & n.childLanes) !== 0,
            (e.flags & 128) !== 0) {
                if (r)
                    return da(e, n, t);
                n.flags |= 128
            }
            if (l = n.memoizedState,
            l !== null && (l.rendering = null,
            l.tail = null,
            l.lastEffect = null),
            de(ge, ge.current),
            r)
                break;
            return null;
        case 22:
        case 23:
            return n.lanes = 0,
            la(e, n, t)
        }
        return Pn(e, n, t)
    }
    var fa, fo, ha, pa;
    fa = function(e, n) {
        for (var t = n.child; t !== null; ) {
            if (t.tag === 5 || t.tag === 6)
                e.appendChild(t.stateNode);
            else if (t.tag !== 4 && t.child !== null) {
                t.child.return = t,
                t = t.child;
                continue
            }
            if (t === n)
                break;
            for (; t.sibling === null; ) {
                if (t.return === null || t.return === n)
                    return;
                t = t.return
            }
            t.sibling.return = t.return,
            t = t.sibling
        }
    }
    ,
    fo = function() {}
    ,
    ha = function(e, n, t, r) {
        var l = e.memoizedProps;
        if (l !== r) {
            e = n.stateNode,
            it(kn.current);
            var i = null;
            switch (t) {
            case "input":
                l = $l(e, l),
                r = $l(e, r),
                i = [];
                break;
            case "select":
                l = R({}, l, {
                    value: void 0
                }),
                r = R({}, r, {
                    value: void 0
                }),
                i = [];
                break;
            case "textarea":
                l = Vl(e, l),
                r = Vl(e, r),
                i = [];
                break;
            default:
                typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = br)
            }
            Kl(t, r);
            var o;
            t = null;
            for (v in l)
                if (!r.hasOwnProperty(v) && l.hasOwnProperty(v) && l[v] != null)
                    if (v === "style") {
                        var s = l[v];
                        for (o in s)
                            s.hasOwnProperty(o) && (t || (t = {}),
                            t[o] = "")
                    } else
                        v !== "dangerouslySetInnerHTML" && v !== "children" && v !== "suppressContentEditableWarning" && v !== "suppressHydrationWarning" && v !== "autoFocus" && (w.hasOwnProperty(v) ? i || (i = []) : (i = i || []).push(v, null));
            for (v in r) {
                var d = r[v];
                if (s = l != null ? l[v] : void 0,
                r.hasOwnProperty(v) && d !== s && (d != null || s != null))
                    if (v === "style")
                        if (s) {
                            for (o in s)
                                !s.hasOwnProperty(o) || d && d.hasOwnProperty(o) || (t || (t = {}),
                                t[o] = "");
                            for (o in d)
                                d.hasOwnProperty(o) && s[o] !== d[o] && (t || (t = {}),
                                t[o] = d[o])
                        } else
                            t || (i || (i = []),
                            i.push(v, t)),
                            t = d;
                    else
                        v === "dangerouslySetInnerHTML" ? (d = d ? d.__html : void 0,
                        s = s ? s.__html : void 0,
                        d != null && s !== d && (i = i || []).push(v, d)) : v === "children" ? typeof d != "string" && typeof d != "number" || (i = i || []).push(v, "" + d) : v !== "suppressContentEditableWarning" && v !== "suppressHydrationWarning" && (w.hasOwnProperty(v) ? (d != null && v === "onScroll" && fe("scroll", e),
                        i || s === d || (i = [])) : (i = i || []).push(v, d))
            }
            t && (i = i || []).push("style", t);
            var v = i;
            (n.updateQueue = v) && (n.flags |= 4)
        }
    }
    ,
    pa = function(e, n, t, r) {
        t !== r && (n.flags |= 4)
    }
    ;
    function gr(e, n) {
        if (!me)
            switch (e.tailMode) {
            case "hidden":
                n = e.tail;
                for (var t = null; n !== null; )
                    n.alternate !== null && (t = n),
                    n = n.sibling;
                t === null ? e.tail = null : t.sibling = null;
                break;
            case "collapsed":
                t = e.tail;
                for (var r = null; t !== null; )
                    t.alternate !== null && (r = t),
                    t = t.sibling;
                r === null ? n || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null
            }
    }
    function ze(e) {
        var n = e.alternate !== null && e.alternate.child === e.child
          , t = 0
          , r = 0;
        if (n)
            for (var l = e.child; l !== null; )
                t |= l.lanes | l.childLanes,
                r |= l.subtreeFlags & 14680064,
                r |= l.flags & 14680064,
                l.return = e,
                l = l.sibling;
        else
            for (l = e.child; l !== null; )
                t |= l.lanes | l.childLanes,
                r |= l.subtreeFlags,
                r |= l.flags,
                l.return = e,
                l = l.sibling;
        return e.subtreeFlags |= r,
        e.childLanes = t,
        n
    }
    function Ud(e, n, t) {
        var r = n.pendingProps;
        switch (Ri(n),
        n.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
            return ze(n),
            null;
        case 1:
            return He(n.type) && Xr(),
            ze(n),
            null;
        case 3:
            return r = n.stateNode,
            Mt(),
            he(Ue),
            he(Oe),
            Qi(),
            r.pendingContext && (r.context = r.pendingContext,
            r.pendingContext = null),
            (e === null || e.child === null) && (nl(n) ? n.flags |= 4 : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024,
            cn !== null && (No(cn),
            cn = null))),
            fo(e, n),
            ze(n),
            null;
        case 5:
            Wi(n);
            var l = it(dr.current);
            if (t = n.type,
            e !== null && n.stateNode != null)
                ha(e, n, t, r, l),
                e.ref !== n.ref && (n.flags |= 512,
                n.flags |= 2097152);
            else {
                if (!r) {
                    if (n.stateNode === null)
                        throw Error(a(166));
                    return ze(n),
                    null
                }
                if (e = it(kn.current),
                nl(n)) {
                    r = n.stateNode,
                    t = n.type;
                    var i = n.memoizedProps;
                    switch (r[yn] = n,
                    r[or] = i,
                    e = (n.mode & 1) !== 0,
                    t) {
                    case "dialog":
                        fe("cancel", r),
                        fe("close", r);
                        break;
                    case "iframe":
                    case "object":
                    case "embed":
                        fe("load", r);
                        break;
                    case "video":
                    case "audio":
                        for (l = 0; l < rr.length; l++)
                            fe(rr[l], r);
                        break;
                    case "source":
                        fe("error", r);
                        break;
                    case "img":
                    case "image":
                    case "link":
                        fe("error", r),
                        fe("load", r);
                        break;
                    case "details":
                        fe("toggle", r);
                        break;
                    case "input":
                        bo(r, i),
                        fe("invalid", r);
                        break;
                    case "select":
                        r._wrapperState = {
                            wasMultiple: !!i.multiple
                        },
                        fe("invalid", r);
                        break;
                    case "textarea":
                        qo(r, i),
                        fe("invalid", r)
                    }
                    Kl(t, i),
                    l = null;
                    for (var o in i)
                        if (i.hasOwnProperty(o)) {
                            var s = i[o];
                            o === "children" ? typeof s == "string" ? r.textContent !== s && (i.suppressHydrationWarning !== !0 && Gr(r.textContent, s, e),
                            l = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (i.suppressHydrationWarning !== !0 && Gr(r.textContent, s, e),
                            l = ["children", "" + s]) : w.hasOwnProperty(o) && s != null && o === "onScroll" && fe("scroll", r)
                        }
                    switch (t) {
                    case "input":
                        Er(r),
                        Xo(r, i, !0);
                        break;
                    case "textarea":
                        Er(r),
                        Zo(r);
                        break;
                    case "select":
                    case "option":
                        break;
                    default:
                        typeof i.onClick == "function" && (r.onclick = br)
                    }
                    r = l,
                    n.updateQueue = r,
                    r !== null && (n.flags |= 4)
                } else {
                    o = l.nodeType === 9 ? l : l.ownerDocument,
                    e === "http://www.w3.org/1999/xhtml" && (e = eu(t)),
                    e === "http://www.w3.org/1999/xhtml" ? t === "script" ? (e = o.createElement("div"),
                    e.innerHTML = "<script><\/script>",
                    e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(t, {
                        is: r.is
                    }) : (e = o.createElement(t),
                    t === "select" && (o = e,
                    r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, t),
                    e[yn] = n,
                    e[or] = r,
                    fa(e, n, !1, !1),
                    n.stateNode = e;
                    e: {
                        switch (o = Ql(t, r),
                        t) {
                        case "dialog":
                            fe("cancel", e),
                            fe("close", e),
                            l = r;
                            break;
                        case "iframe":
                        case "object":
                        case "embed":
                            fe("load", e),
                            l = r;
                            break;
                        case "video":
                        case "audio":
                            for (l = 0; l < rr.length; l++)
                                fe(rr[l], e);
                            l = r;
                            break;
                        case "source":
                            fe("error", e),
                            l = r;
                            break;
                        case "img":
                        case "image":
                        case "link":
                            fe("error", e),
                            fe("load", e),
                            l = r;
                            break;
                        case "details":
                            fe("toggle", e),
                            l = r;
                            break;
                        case "input":
                            bo(e, r),
                            l = $l(e, r),
                            fe("invalid", e);
                            break;
                        case "option":
                            l = r;
                            break;
                        case "select":
                            e._wrapperState = {
                                wasMultiple: !!r.multiple
                            },
                            l = R({}, r, {
                                value: void 0
                            }),
                            fe("invalid", e);
                            break;
                        case "textarea":
                            qo(e, r),
                            l = Vl(e, r),
                            fe("invalid", e);
                            break;
                        default:
                            l = r
                        }
                        Kl(t, l),
                        s = l;
                        for (i in s)
                            if (s.hasOwnProperty(i)) {
                                var d = s[i];
                                i === "style" ? ru(e, d) : i === "dangerouslySetInnerHTML" ? (d = d ? d.__html : void 0,
                                d != null && nu(e, d)) : i === "children" ? typeof d == "string" ? (t !== "textarea" || d !== "") && Ft(e, d) : typeof d == "number" && Ft(e, "" + d) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (w.hasOwnProperty(i) ? d != null && i === "onScroll" && fe("scroll", e) : d != null && re(e, i, d, o))
                            }
                        switch (t) {
                        case "input":
                            Er(e),
                            Xo(e, r, !1);
                            break;
                        case "textarea":
                            Er(e),
                            Zo(e);
                            break;
                        case "option":
                            r.value != null && e.setAttribute("value", "" + ue(r.value));
                            break;
                        case "select":
                            e.multiple = !!r.multiple,
                            i = r.value,
                            i != null ? ft(e, !!r.multiple, i, !1) : r.defaultValue != null && ft(e, !!r.multiple, r.defaultValue, !0);
                            break;
                        default:
                            typeof l.onClick == "function" && (e.onclick = br)
                        }
                        switch (t) {
                        case "button":
                        case "input":
                        case "select":
                        case "textarea":
                            r = !!r.autoFocus;
                            break e;
                        case "img":
                            r = !0;
                            break e;
                        default:
                            r = !1
                        }
                    }
                    r && (n.flags |= 4)
                }
                n.ref !== null && (n.flags |= 512,
                n.flags |= 2097152)
            }
            return ze(n),
            null;
        case 6:
            if (e && n.stateNode != null)
                pa(e, n, e.memoizedProps, r);
            else {
                if (typeof r != "string" && n.stateNode === null)
                    throw Error(a(166));
                if (t = it(dr.current),
                it(kn.current),
                nl(n)) {
                    if (r = n.stateNode,
                    t = n.memoizedProps,
                    r[yn] = n,
                    (i = r.nodeValue !== t) && (e = Xe,
                    e !== null))
                        switch (e.tag) {
                        case 3:
                            Gr(r.nodeValue, t, (e.mode & 1) !== 0);
                            break;
                        case 5:
                            e.memoizedProps.suppressHydrationWarning !== !0 && Gr(r.nodeValue, t, (e.mode & 1) !== 0)
                        }
                    i && (n.flags |= 4)
                } else
                    r = (t.nodeType === 9 ? t : t.ownerDocument).createTextNode(r),
                    r[yn] = n,
                    n.stateNode = r
            }
            return ze(n),
            null;
        case 13:
            if (he(ge),
            r = n.memoizedState,
            e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (me && qe !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0)
                    vs(),
                    Tt(),
                    n.flags |= 98560,
                    i = !1;
                else if (i = nl(n),
                r !== null && r.dehydrated !== null) {
                    if (e === null) {
                        if (!i)
                            throw Error(a(318));
                        if (i = n.memoizedState,
                        i = i !== null ? i.dehydrated : null,
                        !i)
                            throw Error(a(317));
                        i[yn] = n
                    } else
                        Tt(),
                        (n.flags & 128) === 0 && (n.memoizedState = null),
                        n.flags |= 4;
                    ze(n),
                    i = !1
                } else
                    cn !== null && (No(cn),
                    cn = null),
                    i = !0;
                if (!i)
                    return n.flags & 65536 ? n : null
            }
            return (n.flags & 128) !== 0 ? (n.lanes = t,
            n) : (r = r !== null,
            r !== (e !== null && e.memoizedState !== null) && r && (n.child.flags |= 8192,
            (n.mode & 1) !== 0 && (e === null || (ge.current & 1) !== 0 ? _e === 0 && (_e = 3) : _o())),
            n.updateQueue !== null && (n.flags |= 4),
            ze(n),
            null);
        case 4:
            return Mt(),
            fo(e, n),
            e === null && lr(n.stateNode.containerInfo),
            ze(n),
            null;
        case 10:
            return Bi(n.type._context),
            ze(n),
            null;
        case 17:
            return He(n.type) && Xr(),
            ze(n),
            null;
        case 19:
            if (he(ge),
            i = n.memoizedState,
            i === null)
                return ze(n),
                null;
            if (r = (n.flags & 128) !== 0,
            o = i.rendering,
            o === null)
                if (r)
                    gr(i, !1);
                else {
                    if (_e !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = n.child; e !== null; ) {
                            if (o = ul(e),
                            o !== null) {
                                for (n.flags |= 128,
                                gr(i, !1),
                                r = o.updateQueue,
                                r !== null && (n.updateQueue = r,
                                n.flags |= 4),
                                n.subtreeFlags = 0,
                                r = t,
                                t = n.child; t !== null; )
                                    i = t,
                                    e = r,
                                    i.flags &= 14680066,
                                    o = i.alternate,
                                    o === null ? (i.childLanes = 0,
                                    i.lanes = e,
                                    i.child = null,
                                    i.subtreeFlags = 0,
                                    i.memoizedProps = null,
                                    i.memoizedState = null,
                                    i.updateQueue = null,
                                    i.dependencies = null,
                                    i.stateNode = null) : (i.childLanes = o.childLanes,
                                    i.lanes = o.lanes,
                                    i.child = o.child,
                                    i.subtreeFlags = 0,
                                    i.deletions = null,
                                    i.memoizedProps = o.memoizedProps,
                                    i.memoizedState = o.memoizedState,
                                    i.updateQueue = o.updateQueue,
                                    i.type = o.type,
                                    e = o.dependencies,
                                    i.dependencies = e === null ? null : {
                                        lanes: e.lanes,
                                        firstContext: e.firstContext
                                    }),
                                    t = t.sibling;
                                return de(ge, ge.current & 1 | 2),
                                n.child
                            }
                            e = e.sibling
                        }
                    i.tail !== null && we() > Dt && (n.flags |= 128,
                    r = !0,
                    gr(i, !1),
                    n.lanes = 4194304)
                }
            else {
                if (!r)
                    if (e = ul(o),
                    e !== null) {
                        if (n.flags |= 128,
                        r = !0,
                        t = e.updateQueue,
                        t !== null && (n.updateQueue = t,
                        n.flags |= 4),
                        gr(i, !0),
                        i.tail === null && i.tailMode === "hidden" && !o.alternate && !me)
                            return ze(n),
                            null
                    } else
                        2 * we() - i.renderingStartTime > Dt && t !== 1073741824 && (n.flags |= 128,
                        r = !0,
                        gr(i, !1),
                        n.lanes = 4194304);
                i.isBackwards ? (o.sibling = n.child,
                n.child = o) : (t = i.last,
                t !== null ? t.sibling = o : n.child = o,
                i.last = o)
            }
            return i.tail !== null ? (n = i.tail,
            i.rendering = n,
            i.tail = n.sibling,
            i.renderingStartTime = we(),
            n.sibling = null,
            t = ge.current,
            de(ge, r ? t & 1 | 2 : t & 1),
            n) : (ze(n),
            null);
        case 22:
        case 23:
            return Co(),
            r = n.memoizedState !== null,
            e !== null && e.memoizedState !== null !== r && (n.flags |= 8192),
            r && (n.mode & 1) !== 0 ? (Je & 1073741824) !== 0 && (ze(n),
            n.subtreeFlags & 6 && (n.flags |= 8192)) : ze(n),
            null;
        case 24:
            return null;
        case 25:
            return null
        }
        throw Error(a(156, n.tag))
    }
    function Hd(e, n) {
        switch (Ri(n),
        n.tag) {
        case 1:
            return He(n.type) && Xr(),
            e = n.flags,
            e & 65536 ? (n.flags = e & -65537 | 128,
            n) : null;
        case 3:
            return Mt(),
            he(Ue),
            he(Oe),
            Qi(),
            e = n.flags,
            (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128,
            n) : null;
        case 5:
            return Wi(n),
            null;
        case 13:
            if (he(ge),
            e = n.memoizedState,
            e !== null && e.dehydrated !== null) {
                if (n.alternate === null)
                    throw Error(a(340));
                Tt()
            }
            return e = n.flags,
            e & 65536 ? (n.flags = e & -65537 | 128,
            n) : null;
        case 19:
            return he(ge),
            null;
        case 4:
            return Mt(),
            null;
        case 10:
            return Bi(n.type._context),
            null;
        case 22:
        case 23:
            return Co(),
            null;
        case 24:
            return null;
        default:
            return null
        }
    }
    var gl = !1
      , De = !1
      , Vd = typeof WeakSet == "function" ? WeakSet : Set
      , M = null;
    function Rt(e, n) {
        var t = e.ref;
        if (t !== null)
            if (typeof t == "function")
                try {
                    t(null)
                } catch (r) {
                    ke(e, n, r)
                }
            else
                t.current = null
    }
    function ho(e, n, t) {
        try {
            t()
        } catch (r) {
            ke(e, n, r)
        }
    }
    var ma = !1;
    function Wd(e, n) {
        if (Ei = Ir,
        e = Gu(),
        gi(e)) {
            if ("selectionStart"in e)
                var t = {
                    start: e.selectionStart,
                    end: e.selectionEnd
                };
            else
                e: {
                    t = (t = e.ownerDocument) && t.defaultView || window;
                    var r = t.getSelection && t.getSelection();
                    if (r && r.rangeCount !== 0) {
                        t = r.anchorNode;
                        var l = r.anchorOffset
                          , i = r.focusNode;
                        r = r.focusOffset;
                        try {
                            t.nodeType,
                            i.nodeType
                        } catch {
                            t = null;
                            break e
                        }
                        var o = 0
                          , s = -1
                          , d = -1
                          , v = 0
                          , x = 0
                          , N = e
                          , k = null;
                        n: for (; ; ) {
                            for (var j; N !== t || l !== 0 && N.nodeType !== 3 || (s = o + l),
                            N !== i || r !== 0 && N.nodeType !== 3 || (d = o + r),
                            N.nodeType === 3 && (o += N.nodeValue.length),
                            (j = N.firstChild) !== null; )
                                k = N,
                                N = j;
                            for (; ; ) {
                                if (N === e)
                                    break n;
                                if (k === t && ++v === l && (s = o),
                                k === i && ++x === r && (d = o),
                                (j = N.nextSibling) !== null)
                                    break;
                                N = k,
                                k = N.parentNode
                            }
                            N = j
                        }
                        t = s === -1 || d === -1 ? null : {
                            start: s,
                            end: d
                        }
                    } else
                        t = null
                }
            t = t || {
                start: 0,
                end: 0
            }
        } else
            t = null;
        for (Ci = {
            focusedElem: e,
            selectionRange: t
        },
        Ir = !1,
        M = n; M !== null; )
            if (n = M,
            e = n.child,
            (n.subtreeFlags & 1028) !== 0 && e !== null)
                e.return = n,
                M = e;
            else
                for (; M !== null; ) {
                    n = M;
                    try {
                        var z = n.alternate;
                        if ((n.flags & 1024) !== 0)
                            switch (n.tag) {
                            case 0:
                            case 11:
                            case 15:
                                break;
                            case 1:
                                if (z !== null) {
                                    var I = z.memoizedProps
                                      , Se = z.memoizedState
                                      , m = n.stateNode
                                      , f = m.getSnapshotBeforeUpdate(n.elementType === n.type ? I : dn(n.type, I), Se);
                                    m.__reactInternalSnapshotBeforeUpdate = f
                                }
                                break;
                            case 3:
                                var g = n.stateNode.containerInfo;
                                g.nodeType === 1 ? g.textContent = "" : g.nodeType === 9 && g.documentElement && g.removeChild(g.documentElement);
                                break;
                            case 5:
                            case 6:
                            case 4:
                            case 17:
                                break;
                            default:
                                throw Error(a(163))
                            }
                    } catch (E) {
                        ke(n, n.return, E)
                    }
                    if (e = n.sibling,
                    e !== null) {
                        e.return = n.return,
                        M = e;
                        break
                    }
                    M = n.return
                }
        return z = ma,
        ma = !1,
        z
    }
    function vr(e, n, t) {
        var r = n.updateQueue;
        if (r = r !== null ? r.lastEffect : null,
        r !== null) {
            var l = r = r.next;
            do {
                if ((l.tag & e) === e) {
                    var i = l.destroy;
                    l.destroy = void 0,
                    i !== void 0 && ho(n, t, i)
                }
                l = l.next
            } while (l !== r)
        }
    }
    function vl(e, n) {
        if (n = n.updateQueue,
        n = n !== null ? n.lastEffect : null,
        n !== null) {
            var t = n = n.next;
            do {
                if ((t.tag & e) === e) {
                    var r = t.create;
                    t.destroy = r()
                }
                t = t.next
            } while (t !== n)
        }
    }
    function po(e) {
        var n = e.ref;
        if (n !== null) {
            var t = e.stateNode;
            switch (e.tag) {
            case 5:
                e = t;
                break;
            default:
                e = t
            }
            typeof n == "function" ? n(e) : n.current = e
        }
    }
    function ga(e) {
        var n = e.alternate;
        n !== null && (e.alternate = null,
        ga(n)),
        e.child = null,
        e.deletions = null,
        e.sibling = null,
        e.tag === 5 && (n = e.stateNode,
        n !== null && (delete n[yn],
        delete n[or],
        delete n[Pi],
        delete n[_d],
        delete n[Td])),
        e.stateNode = null,
        e.return = null,
        e.dependencies = null,
        e.memoizedProps = null,
        e.memoizedState = null,
        e.pendingProps = null,
        e.stateNode = null,
        e.updateQueue = null
    }
    function va(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 4
    }
    function ya(e) {
        e: for (; ; ) {
            for (; e.sibling === null; ) {
                if (e.return === null || va(e.return))
                    return null;
                e = e.return
            }
            for (e.sibling.return = e.return,
            e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
                if (e.flags & 2 || e.child === null || e.tag === 4)
                    continue e;
                e.child.return = e,
                e = e.child
            }
            if (!(e.flags & 2))
                return e.stateNode
        }
    }
    function mo(e, n, t) {
        var r = e.tag;
        if (r === 5 || r === 6)
            e = e.stateNode,
            n ? t.nodeType === 8 ? t.parentNode.insertBefore(e, n) : t.insertBefore(e, n) : (t.nodeType === 8 ? (n = t.parentNode,
            n.insertBefore(e, t)) : (n = t,
            n.appendChild(e)),
            t = t._reactRootContainer,
            t != null || n.onclick !== null || (n.onclick = br));
        else if (r !== 4 && (e = e.child,
        e !== null))
            for (mo(e, n, t),
            e = e.sibling; e !== null; )
                mo(e, n, t),
                e = e.sibling
    }
    function go(e, n, t) {
        var r = e.tag;
        if (r === 5 || r === 6)
            e = e.stateNode,
            n ? t.insertBefore(e, n) : t.appendChild(e);
        else if (r !== 4 && (e = e.child,
        e !== null))
            for (go(e, n, t),
            e = e.sibling; e !== null; )
                go(e, n, t),
                e = e.sibling
    }
    var Le = null
      , fn = !1;
    function Kn(e, n, t) {
        for (t = t.child; t !== null; )
            ka(e, n, t),
            t = t.sibling
    }
    function ka(e, n, t) {
        if (vn && typeof vn.onCommitFiberUnmount == "function")
            try {
                vn.onCommitFiberUnmount(Lr, t)
            } catch {}
        switch (t.tag) {
        case 5:
            De || Rt(t, n);
        case 6:
            var r = Le
              , l = fn;
            Le = null,
            Kn(e, n, t),
            Le = r,
            fn = l,
            Le !== null && (fn ? (e = Le,
            t = t.stateNode,
            e.nodeType === 8 ? e.parentNode.removeChild(t) : e.removeChild(t)) : Le.removeChild(t.stateNode));
            break;
        case 18:
            Le !== null && (fn ? (e = Le,
            t = t.stateNode,
            e.nodeType === 8 ? ji(e.parentNode, t) : e.nodeType === 1 && ji(e, t),
            Yt(e)) : ji(Le, t.stateNode));
            break;
        case 4:
            r = Le,
            l = fn,
            Le = t.stateNode.containerInfo,
            fn = !0,
            Kn(e, n, t),
            Le = r,
            fn = l;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            if (!De && (r = t.updateQueue,
            r !== null && (r = r.lastEffect,
            r !== null))) {
                l = r = r.next;
                do {
                    var i = l
                      , o = i.destroy;
                    i = i.tag,
                    o !== void 0 && ((i & 2) !== 0 || (i & 4) !== 0) && ho(t, n, o),
                    l = l.next
                } while (l !== r)
            }
            Kn(e, n, t);
            break;
        case 1:
            if (!De && (Rt(t, n),
            r = t.stateNode,
            typeof r.componentWillUnmount == "function"))
                try {
                    r.props = t.memoizedProps,
                    r.state = t.memoizedState,
                    r.componentWillUnmount()
                } catch (s) {
                    ke(t, n, s)
                }
            Kn(e, n, t);
            break;
        case 21:
            Kn(e, n, t);
            break;
        case 22:
            t.mode & 1 ? (De = (r = De) || t.memoizedState !== null,
            Kn(e, n, t),
            De = r) : Kn(e, n, t);
            break;
        default:
            Kn(e, n, t)
        }
    }
    function wa(e) {
        var n = e.updateQueue;
        if (n !== null) {
            e.updateQueue = null;
            var t = e.stateNode;
            t === null && (t = e.stateNode = new Vd),
            n.forEach(function(r) {
                var l = Zd.bind(null, e, r);
                t.has(r) || (t.add(r),
                r.then(l, l))
            })
        }
    }
    function hn(e, n) {
        var t = n.deletions;
        if (t !== null)
            for (var r = 0; r < t.length; r++) {
                var l = t[r];
                try {
                    var i = e
                      , o = n
                      , s = o;
                    e: for (; s !== null; ) {
                        switch (s.tag) {
                        case 5:
                            Le = s.stateNode,
                            fn = !1;
                            break e;
                        case 3:
                            Le = s.stateNode.containerInfo,
                            fn = !0;
                            break e;
                        case 4:
                            Le = s.stateNode.containerInfo,
                            fn = !0;
                            break e
                        }
                        s = s.return
                    }
                    if (Le === null)
                        throw Error(a(160));
                    ka(i, o, l),
                    Le = null,
                    fn = !1;
                    var d = l.alternate;
                    d !== null && (d.return = null),
                    l.return = null
                } catch (v) {
                    ke(l, n, v)
                }
            }
        if (n.subtreeFlags & 12854)
            for (n = n.child; n !== null; )
                Sa(n, e),
                n = n.sibling
    }
    function Sa(e, n) {
        var t = e.alternate
          , r = e.flags;
        switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            if (hn(n, e),
            Sn(e),
            r & 4) {
                try {
                    vr(3, e, e.return),
                    vl(3, e)
                } catch (I) {
                    ke(e, e.return, I)
                }
                try {
                    vr(5, e, e.return)
                } catch (I) {
                    ke(e, e.return, I)
                }
            }
            break;
        case 1:
            hn(n, e),
            Sn(e),
            r & 512 && t !== null && Rt(t, t.return);
            break;
        case 5:
            if (hn(n, e),
            Sn(e),
            r & 512 && t !== null && Rt(t, t.return),
            e.flags & 32) {
                var l = e.stateNode;
                try {
                    Ft(l, "")
                } catch (I) {
                    ke(e, e.return, I)
                }
            }
            if (r & 4 && (l = e.stateNode,
            l != null)) {
                var i = e.memoizedProps
                  , o = t !== null ? t.memoizedProps : i
                  , s = e.type
                  , d = e.updateQueue;
                if (e.updateQueue = null,
                d !== null)
                    try {
                        s === "input" && i.type === "radio" && i.name != null && Yo(l, i),
                        Ql(s, o);
                        var v = Ql(s, i);
                        for (o = 0; o < d.length; o += 2) {
                            var x = d[o]
                              , N = d[o + 1];
                            x === "style" ? ru(l, N) : x === "dangerouslySetInnerHTML" ? nu(l, N) : x === "children" ? Ft(l, N) : re(l, x, N, v)
                        }
                        switch (s) {
                        case "input":
                            Ul(l, i);
                            break;
                        case "textarea":
                            Jo(l, i);
                            break;
                        case "select":
                            var k = l._wrapperState.wasMultiple;
                            l._wrapperState.wasMultiple = !!i.multiple;
                            var j = i.value;
                            j != null ? ft(l, !!i.multiple, j, !1) : k !== !!i.multiple && (i.defaultValue != null ? ft(l, !!i.multiple, i.defaultValue, !0) : ft(l, !!i.multiple, i.multiple ? [] : "", !1))
                        }
                        l[or] = i
                    } catch (I) {
                        ke(e, e.return, I)
                    }
            }
            break;
        case 6:
            if (hn(n, e),
            Sn(e),
            r & 4) {
                if (e.stateNode === null)
                    throw Error(a(162));
                l = e.stateNode,
                i = e.memoizedProps;
                try {
                    l.nodeValue = i
                } catch (I) {
                    ke(e, e.return, I)
                }
            }
            break;
        case 3:
            if (hn(n, e),
            Sn(e),
            r & 4 && t !== null && t.memoizedState.isDehydrated)
                try {
                    Yt(n.containerInfo)
                } catch (I) {
                    ke(e, e.return, I)
                }
            break;
        case 4:
            hn(n, e),
            Sn(e);
            break;
        case 13:
            hn(n, e),
            Sn(e),
            l = e.child,
            l.flags & 8192 && (i = l.memoizedState !== null,
            l.stateNode.isHidden = i,
            !i || l.alternate !== null && l.alternate.memoizedState !== null || (ko = we())),
            r & 4 && wa(e);
            break;
        case 22:
            if (x = t !== null && t.memoizedState !== null,
            e.mode & 1 ? (De = (v = De) || x,
            hn(n, e),
            De = v) : hn(n, e),
            Sn(e),
            r & 8192) {
                if (v = e.memoizedState !== null,
                (e.stateNode.isHidden = v) && !x && (e.mode & 1) !== 0)
                    for (M = e,
                    x = e.child; x !== null; ) {
                        for (N = M = x; M !== null; ) {
                            switch (k = M,
                            j = k.child,
                            k.tag) {
                            case 0:
                            case 11:
                            case 14:
                            case 15:
                                vr(4, k, k.return);
                                break;
                            case 1:
                                Rt(k, k.return);
                                var z = k.stateNode;
                                if (typeof z.componentWillUnmount == "function") {
                                    r = k,
                                    t = k.return;
                                    try {
                                        n = r,
                                        z.props = n.memoizedProps,
                                        z.state = n.memoizedState,
                                        z.componentWillUnmount()
                                    } catch (I) {
                                        ke(r, t, I)
                                    }
                                }
                                break;
                            case 5:
                                Rt(k, k.return);
                                break;
                            case 22:
                                if (k.memoizedState !== null) {
                                    Ea(N);
                                    continue
                                }
                            }
                            j !== null ? (j.return = k,
                            M = j) : Ea(N)
                        }
                        x = x.sibling
                    }
                e: for (x = null,
                N = e; ; ) {
                    if (N.tag === 5) {
                        if (x === null) {
                            x = N;
                            try {
                                l = N.stateNode,
                                v ? (i = l.style,
                                typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (s = N.stateNode,
                                d = N.memoizedProps.style,
                                o = d != null && d.hasOwnProperty("display") ? d.display : null,
                                s.style.display = tu("display", o))
                            } catch (I) {
                                ke(e, e.return, I)
                            }
                        }
                    } else if (N.tag === 6) {
                        if (x === null)
                            try {
                                N.stateNode.nodeValue = v ? "" : N.memoizedProps
                            } catch (I) {
                                ke(e, e.return, I)
                            }
                    } else if ((N.tag !== 22 && N.tag !== 23 || N.memoizedState === null || N === e) && N.child !== null) {
                        N.child.return = N,
                        N = N.child;
                        continue
                    }
                    if (N === e)
                        break e;
                    for (; N.sibling === null; ) {
                        if (N.return === null || N.return === e)
                            break e;
                        x === N && (x = null),
                        N = N.return
                    }
                    x === N && (x = null),
                    N.sibling.return = N.return,
                    N = N.sibling
                }
            }
            break;
        case 19:
            hn(n, e),
            Sn(e),
            r & 4 && wa(e);
            break;
        case 21:
            break;
        default:
            hn(n, e),
            Sn(e)
        }
    }
    function Sn(e) {
        var n = e.flags;
        if (n & 2) {
            try {
                e: {
                    for (var t = e.return; t !== null; ) {
                        if (va(t)) {
                            var r = t;
                            break e
                        }
                        t = t.return
                    }
                    throw Error(a(160))
                }
                switch (r.tag) {
                case 5:
                    var l = r.stateNode;
                    r.flags & 32 && (Ft(l, ""),
                    r.flags &= -33);
                    var i = ya(e);
                    go(e, i, l);
                    break;
                case 3:
                case 4:
                    var o = r.stateNode.containerInfo
                      , s = ya(e);
                    mo(e, s, o);
                    break;
                default:
                    throw Error(a(161))
                }
            } catch (d) {
                ke(e, e.return, d)
            }
            e.flags &= -3
        }
        n & 4096 && (e.flags &= -4097)
    }
    function Kd(e, n, t) {
        M = e,
        xa(e)
    }
    function xa(e, n, t) {
        for (var r = (e.mode & 1) !== 0; M !== null; ) {
            var l = M
              , i = l.child;
            if (l.tag === 22 && r) {
                var o = l.memoizedState !== null || gl;
                if (!o) {
                    var s = l.alternate
                      , d = s !== null && s.memoizedState !== null || De;
                    s = gl;
                    var v = De;
                    if (gl = o,
                    (De = d) && !v)
                        for (M = l; M !== null; )
                            o = M,
                            d = o.child,
                            o.tag === 22 && o.memoizedState !== null ? Ca(l) : d !== null ? (d.return = o,
                            M = d) : Ca(l);
                    for (; i !== null; )
                        M = i,
                        xa(i),
                        i = i.sibling;
                    M = l,
                    gl = s,
                    De = v
                }
                Na(e)
            } else
                (l.subtreeFlags & 8772) !== 0 && i !== null ? (i.return = l,
                M = i) : Na(e)
        }
    }
    function Na(e) {
        for (; M !== null; ) {
            var n = M;
            if ((n.flags & 8772) !== 0) {
                var t = n.alternate;
                try {
                    if ((n.flags & 8772) !== 0)
                        switch (n.tag) {
                        case 0:
                        case 11:
                        case 15:
                            De || vl(5, n);
                            break;
                        case 1:
                            var r = n.stateNode;
                            if (n.flags & 4 && !De)
                                if (t === null)
                                    r.componentDidMount();
                                else {
                                    var l = n.elementType === n.type ? t.memoizedProps : dn(n.type, t.memoizedProps);
                                    r.componentDidUpdate(l, t.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                                }
                            var i = n.updateQueue;
                            i !== null && Es(n, i, r);
                            break;
                        case 3:
                            var o = n.updateQueue;
                            if (o !== null) {
                                if (t = null,
                                n.child !== null)
                                    switch (n.child.tag) {
                                    case 5:
                                        t = n.child.stateNode;
                                        break;
                                    case 1:
                                        t = n.child.stateNode
                                    }
                                Es(n, o, t)
                            }
                            break;
                        case 5:
                            var s = n.stateNode;
                            if (t === null && n.flags & 4) {
                                t = s;
                                var d = n.memoizedProps;
                                switch (n.type) {
                                case "button":
                                case "input":
                                case "select":
                                case "textarea":
                                    d.autoFocus && t.focus();
                                    break;
                                case "img":
                                    d.src && (t.src = d.src)
                                }
                            }
                            break;
                        case 6:
                            break;
                        case 4:
                            break;
                        case 12:
                            break;
                        case 13:
                            if (n.memoizedState === null) {
                                var v = n.alternate;
                                if (v !== null) {
                                    var x = v.memoizedState;
                                    if (x !== null) {
                                        var N = x.dehydrated;
                                        N !== null && Yt(N)
                                    }
                                }
                            }
                            break;
                        case 19:
                        case 17:
                        case 21:
                        case 22:
                        case 23:
                        case 25:
                            break;
                        default:
                            throw Error(a(163))
                        }
                    De || n.flags & 512 && po(n)
                } catch (k) {
                    ke(n, n.return, k)
                }
            }
            if (n === e) {
                M = null;
                break
            }
            if (t = n.sibling,
            t !== null) {
                t.return = n.return,
                M = t;
                break
            }
            M = n.return
        }
    }
    function Ea(e) {
        for (; M !== null; ) {
            var n = M;
            if (n === e) {
                M = null;
                break
            }
            var t = n.sibling;
            if (t !== null) {
                t.return = n.return,
                M = t;
                break
            }
            M = n.return
        }
    }
    function Ca(e) {
        for (; M !== null; ) {
            var n = M;
            try {
                switch (n.tag) {
                case 0:
                case 11:
                case 15:
                    var t = n.return;
                    try {
                        vl(4, n)
                    } catch (d) {
                        ke(n, t, d)
                    }
                    break;
                case 1:
                    var r = n.stateNode;
                    if (typeof r.componentDidMount == "function") {
                        var l = n.return;
                        try {
                            r.componentDidMount()
                        } catch (d) {
                            ke(n, l, d)
                        }
                    }
                    var i = n.return;
                    try {
                        po(n)
                    } catch (d) {
                        ke(n, i, d)
                    }
                    break;
                case 5:
                    var o = n.return;
                    try {
                        po(n)
                    } catch (d) {
                        ke(n, o, d)
                    }
                }
            } catch (d) {
                ke(n, n.return, d)
            }
            if (n === e) {
                M = null;
                break
            }
            var s = n.sibling;
            if (s !== null) {
                s.return = n.return,
                M = s;
                break
            }
            M = n.return
        }
    }
    var Qd = Math.ceil
      , yl = D.ReactCurrentDispatcher
      , vo = D.ReactCurrentOwner
      , rn = D.ReactCurrentBatchConfig
      , te = 0
      , je = null
      , Ne = null
      , Me = 0
      , Je = 0
      , zt = $n(0)
      , _e = 0
      , yr = null
      , ut = 0
      , kl = 0
      , yo = 0
      , kr = null
      , We = null
      , ko = 0
      , Dt = 1 / 0
      , Ln = null
      , wl = !1
      , wo = null
      , Qn = null
      , Sl = !1
      , Gn = null
      , xl = 0
      , wr = 0
      , So = null
      , Nl = -1
      , El = 0;
    function Fe() {
        return (te & 6) !== 0 ? we() : Nl !== -1 ? Nl : Nl = we()
    }
    function bn(e) {
        return (e.mode & 1) === 0 ? 1 : (te & 2) !== 0 && Me !== 0 ? Me & -Me : Pd.transition !== null ? (El === 0 && (El = yu()),
        El) : (e = se,
        e !== 0 || (e = window.event,
        e = e === void 0 ? 16 : Tu(e.type)),
        e)
    }
    function pn(e, n, t, r) {
        if (50 < wr)
            throw wr = 0,
            So = null,
            Error(a(185));
        Wt(e, t, r),
        ((te & 2) === 0 || e !== je) && (e === je && ((te & 2) === 0 && (kl |= t),
        _e === 4 && Yn(e, Me)),
        Ke(e, r),
        t === 1 && te === 0 && (n.mode & 1) === 0 && (Dt = we() + 500,
        Jr && Hn()))
    }
    function Ke(e, n) {
        var t = e.callbackNode;
        Pc(e, n);
        var r = Rr(e, e === je ? Me : 0);
        if (r === 0)
            t !== null && mu(t),
            e.callbackNode = null,
            e.callbackPriority = 0;
        else if (n = r & -r,
        e.callbackPriority !== n) {
            if (t != null && mu(t),
            n === 1)
                e.tag === 0 ? jd(Ta.bind(null, e)) : fs(Ta.bind(null, e)),
                Ed(function() {
                    (te & 6) === 0 && Hn()
                }),
                t = null;
            else {
                switch (ku(r)) {
                case 1:
                    t = Zl;
                    break;
                case 4:
                    t = gu;
                    break;
                case 16:
                    t = Pr;
                    break;
                case 536870912:
                    t = vu;
                    break;
                default:
                    t = Pr
                }
                t = Da(t, _a.bind(null, e))
            }
            e.callbackPriority = n,
            e.callbackNode = t
        }
    }
    function _a(e, n) {
        if (Nl = -1,
        El = 0,
        (te & 6) !== 0)
            throw Error(a(327));
        var t = e.callbackNode;
        if (It() && e.callbackNode !== t)
            return null;
        var r = Rr(e, e === je ? Me : 0);
        if (r === 0)
            return null;
        if ((r & 30) !== 0 || (r & e.expiredLanes) !== 0 || n)
            n = Cl(e, r);
        else {
            n = r;
            var l = te;
            te |= 2;
            var i = Pa();
            (je !== e || Me !== n) && (Ln = null,
            Dt = we() + 500,
            at(e, n));
            do
                try {
                    Yd();
                    break
                } catch (s) {
                    ja(e, s)
                }
            while (!0);
            Fi(),
            yl.current = i,
            te = l,
            Ne !== null ? n = 0 : (je = null,
            Me = 0,
            n = _e)
        }
        if (n !== 0) {
            if (n === 2 && (l = ei(e),
            l !== 0 && (r = l,
            n = xo(e, l))),
            n === 1)
                throw t = yr,
                at(e, 0),
                Yn(e, r),
                Ke(e, we()),
                t;
            if (n === 6)
                Yn(e, r);
            else {
                if (l = e.current.alternate,
                (r & 30) === 0 && !Gd(l) && (n = Cl(e, r),
                n === 2 && (i = ei(e),
                i !== 0 && (r = i,
                n = xo(e, i))),
                n === 1))
                    throw t = yr,
                    at(e, 0),
                    Yn(e, r),
                    Ke(e, we()),
                    t;
                switch (e.finishedWork = l,
                e.finishedLanes = r,
                n) {
                case 0:
                case 1:
                    throw Error(a(345));
                case 2:
                    ct(e, We, Ln);
                    break;
                case 3:
                    if (Yn(e, r),
                    (r & 130023424) === r && (n = ko + 500 - we(),
                    10 < n)) {
                        if (Rr(e, 0) !== 0)
                            break;
                        if (l = e.suspendedLanes,
                        (l & r) !== r) {
                            Fe(),
                            e.pingedLanes |= e.suspendedLanes & l;
                            break
                        }
                        e.timeoutHandle = Ti(ct.bind(null, e, We, Ln), n);
                        break
                    }
                    ct(e, We, Ln);
                    break;
                case 4:
                    if (Yn(e, r),
                    (r & 4194240) === r)
                        break;
                    for (n = e.eventTimes,
                    l = -1; 0 < r; ) {
                        var o = 31 - sn(r);
                        i = 1 << o,
                        o = n[o],
                        o > l && (l = o),
                        r &= ~i
                    }
                    if (r = l,
                    r = we() - r,
                    r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Qd(r / 1960)) - r,
                    10 < r) {
                        e.timeoutHandle = Ti(ct.bind(null, e, We, Ln), r);
                        break
                    }
                    ct(e, We, Ln);
                    break;
                case 5:
                    ct(e, We, Ln);
                    break;
                default:
                    throw Error(a(329))
                }
            }
        }
        return Ke(e, we()),
        e.callbackNode === t ? _a.bind(null, e) : null
    }
    function xo(e, n) {
        var t = kr;
        return e.current.memoizedState.isDehydrated && (at(e, n).flags |= 256),
        e = Cl(e, n),
        e !== 2 && (n = We,
        We = t,
        n !== null && No(n)),
        e
    }
    function No(e) {
        We === null ? We = e : We.push.apply(We, e)
    }
    function Gd(e) {
        for (var n = e; ; ) {
            if (n.flags & 16384) {
                var t = n.updateQueue;
                if (t !== null && (t = t.stores,
                t !== null))
                    for (var r = 0; r < t.length; r++) {
                        var l = t[r]
                          , i = l.getSnapshot;
                        l = l.value;
                        try {
                            if (!an(i(), l))
                                return !1
                        } catch {
                            return !1
                        }
                    }
            }
            if (t = n.child,
            n.subtreeFlags & 16384 && t !== null)
                t.return = n,
                n = t;
            else {
                if (n === e)
                    break;
                for (; n.sibling === null; ) {
                    if (n.return === null || n.return === e)
                        return !0;
                    n = n.return
                }
                n.sibling.return = n.return,
                n = n.sibling
            }
        }
        return !0
    }
    function Yn(e, n) {
        for (n &= ~yo,
        n &= ~kl,
        e.suspendedLanes |= n,
        e.pingedLanes &= ~n,
        e = e.expirationTimes; 0 < n; ) {
            var t = 31 - sn(n)
              , r = 1 << t;
            e[t] = -1,
            n &= ~r
        }
    }
    function Ta(e) {
        if ((te & 6) !== 0)
            throw Error(a(327));
        It();
        var n = Rr(e, 0);
        if ((n & 1) === 0)
            return Ke(e, we()),
            null;
        var t = Cl(e, n);
        if (e.tag !== 0 && t === 2) {
            var r = ei(e);
            r !== 0 && (n = r,
            t = xo(e, r))
        }
        if (t === 1)
            throw t = yr,
            at(e, 0),
            Yn(e, n),
            Ke(e, we()),
            t;
        if (t === 6)
            throw Error(a(345));
        return e.finishedWork = e.current.alternate,
        e.finishedLanes = n,
        ct(e, We, Ln),
        Ke(e, we()),
        null
    }
    function Eo(e, n) {
        var t = te;
        te |= 1;
        try {
            return e(n)
        } finally {
            te = t,
            te === 0 && (Dt = we() + 500,
            Jr && Hn())
        }
    }
    function st(e) {
        Gn !== null && Gn.tag === 0 && (te & 6) === 0 && It();
        var n = te;
        te |= 1;
        var t = rn.transition
          , r = se;
        try {
            if (rn.transition = null,
            se = 1,
            e)
                return e()
        } finally {
            se = r,
            rn.transition = t,
            te = n,
            (te & 6) === 0 && Hn()
        }
    }
    function Co() {
        Je = zt.current,
        he(zt)
    }
    function at(e, n) {
        e.finishedWork = null,
        e.finishedLanes = 0;
        var t = e.timeoutHandle;
        if (t !== -1 && (e.timeoutHandle = -1,
        Nd(t)),
        Ne !== null)
            for (t = Ne.return; t !== null; ) {
                var r = t;
                switch (Ri(r),
                r.tag) {
                case 1:
                    r = r.type.childContextTypes,
                    r != null && Xr();
                    break;
                case 3:
                    Mt(),
                    he(Ue),
                    he(Oe),
                    Qi();
                    break;
                case 5:
                    Wi(r);
                    break;
                case 4:
                    Mt();
                    break;
                case 13:
                    he(ge);
                    break;
                case 19:
                    he(ge);
                    break;
                case 10:
                    Bi(r.type._context);
                    break;
                case 22:
                case 23:
                    Co()
                }
                t = t.return
            }
        if (je = e,
        Ne = e = Xn(e.current, null),
        Me = Je = n,
        _e = 0,
        yr = null,
        yo = kl = ut = 0,
        We = kr = null,
        lt !== null) {
            for (n = 0; n < lt.length; n++)
                if (t = lt[n],
                r = t.interleaved,
                r !== null) {
                    t.interleaved = null;
                    var l = r.next
                      , i = t.pending;
                    if (i !== null) {
                        var o = i.next;
                        i.next = l,
                        r.next = o
                    }
                    t.pending = r
                }
            lt = null
        }
        return e
    }
    function ja(e, n) {
        do {
            var t = Ne;
            try {
                if (Fi(),
                sl.current = fl,
                al) {
                    for (var r = ve.memoizedState; r !== null; ) {
                        var l = r.queue;
                        l !== null && (l.pending = null),
                        r = r.next
                    }
                    al = !1
                }
                if (ot = 0,
                Te = Ce = ve = null,
                fr = !1,
                hr = 0,
                vo.current = null,
                t === null || t.return === null) {
                    _e = 1,
                    yr = n,
                    Ne = null;
                    break
                }
                e: {
                    var i = e
                      , o = t.return
                      , s = t
                      , d = n;
                    if (n = Me,
                    s.flags |= 32768,
                    d !== null && typeof d == "object" && typeof d.then == "function") {
                        var v = d
                          , x = s
                          , N = x.tag;
                        if ((x.mode & 1) === 0 && (N === 0 || N === 11 || N === 15)) {
                            var k = x.alternate;
                            k ? (x.updateQueue = k.updateQueue,
                            x.memoizedState = k.memoizedState,
                            x.lanes = k.lanes) : (x.updateQueue = null,
                            x.memoizedState = null)
                        }
                        var j = Zs(o);
                        if (j !== null) {
                            j.flags &= -257,
                            ea(j, o, s, i, n),
                            j.mode & 1 && Js(i, v, n),
                            n = j,
                            d = v;
                            var z = n.updateQueue;
                            if (z === null) {
                                var I = new Set;
                                I.add(d),
                                n.updateQueue = I
                            } else
                                z.add(d);
                            break e
                        } else {
                            if ((n & 1) === 0) {
                                Js(i, v, n),
                                _o();
                                break e
                            }
                            d = Error(a(426))
                        }
                    } else if (me && s.mode & 1) {
                        var Se = Zs(o);
                        if (Se !== null) {
                            (Se.flags & 65536) === 0 && (Se.flags |= 256),
                            ea(Se, o, s, i, n),
                            Ii(Ot(d, s));
                            break e
                        }
                    }
                    i = d = Ot(d, s),
                    _e !== 4 && (_e = 2),
                    kr === null ? kr = [i] : kr.push(i),
                    i = o;
                    do {
                        switch (i.tag) {
                        case 3:
                            i.flags |= 65536,
                            n &= -n,
                            i.lanes |= n;
                            var m = Xs(i, d, n);
                            Ns(i, m);
                            break e;
                        case 1:
                            s = d;
                            var f = i.type
                              , g = i.stateNode;
                            if ((i.flags & 128) === 0 && (typeof f.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (Qn === null || !Qn.has(g)))) {
                                i.flags |= 65536,
                                n &= -n,
                                i.lanes |= n;
                                var E = qs(i, s, n);
                                Ns(i, E);
                                break e
                            }
                        }
                        i = i.return
                    } while (i !== null)
                }
                Ma(t)
            } catch (A) {
                n = A,
                Ne === t && t !== null && (Ne = t = t.return);
                continue
            }
            break
        } while (!0)
    }
    function Pa() {
        var e = yl.current;
        return yl.current = fl,
        e === null ? fl : e
    }
    function _o() {
        (_e === 0 || _e === 3 || _e === 2) && (_e = 4),
        je === null || (ut & 268435455) === 0 && (kl & 268435455) === 0 || Yn(je, Me)
    }
    function Cl(e, n) {
        var t = te;
        te |= 2;
        var r = Pa();
        (je !== e || Me !== n) && (Ln = null,
        at(e, n));
        do
            try {
                bd();
                break
            } catch (l) {
                ja(e, l)
            }
        while (!0);
        if (Fi(),
        te = t,
        yl.current = r,
        Ne !== null)
            throw Error(a(261));
        return je = null,
        Me = 0,
        _e
    }
    function bd() {
        for (; Ne !== null; )
            La(Ne)
    }
    function Yd() {
        for (; Ne !== null && !wc(); )
            La(Ne)
    }
    function La(e) {
        var n = za(e.alternate, e, Je);
        e.memoizedProps = e.pendingProps,
        n === null ? Ma(e) : Ne = n,
        vo.current = null
    }
    function Ma(e) {
        var n = e;
        do {
            var t = n.alternate;
            if (e = n.return,
            (n.flags & 32768) === 0) {
                if (t = Ud(t, n, Je),
                t !== null) {
                    Ne = t;
                    return
                }
            } else {
                if (t = Hd(t, n),
                t !== null) {
                    t.flags &= 32767,
                    Ne = t;
                    return
                }
                if (e !== null)
                    e.flags |= 32768,
                    e.subtreeFlags = 0,
                    e.deletions = null;
                else {
                    _e = 6,
                    Ne = null;
                    return
                }
            }
            if (n = n.sibling,
            n !== null) {
                Ne = n;
                return
            }
            Ne = n = e
        } while (n !== null);
        _e === 0 && (_e = 5)
    }
    function ct(e, n, t) {
        var r = se
          , l = rn.transition;
        try {
            rn.transition = null,
            se = 1,
            Xd(e, n, t, r)
        } finally {
            rn.transition = l,
            se = r
        }
        return null
    }
    function Xd(e, n, t, r) {
        do
            It();
        while (Gn !== null);
        if ((te & 6) !== 0)
            throw Error(a(327));
        t = e.finishedWork;
        var l = e.finishedLanes;
        if (t === null)
            return null;
        if (e.finishedWork = null,
        e.finishedLanes = 0,
        t === e.current)
            throw Error(a(177));
        e.callbackNode = null,
        e.callbackPriority = 0;
        var i = t.lanes | t.childLanes;
        if (Lc(e, i),
        e === je && (Ne = je = null,
        Me = 0),
        (t.subtreeFlags & 2064) === 0 && (t.flags & 2064) === 0 || Sl || (Sl = !0,
        Da(Pr, function() {
            return It(),
            null
        })),
        i = (t.flags & 15990) !== 0,
        (t.subtreeFlags & 15990) !== 0 || i) {
            i = rn.transition,
            rn.transition = null;
            var o = se;
            se = 1;
            var s = te;
            te |= 4,
            vo.current = null,
            Wd(e, t),
            Sa(t, e),
            gd(Ci),
            Ir = !!Ei,
            Ci = Ei = null,
            e.current = t,
            Kd(t),
            Sc(),
            te = s,
            se = o,
            rn.transition = i
        } else
            e.current = t;
        if (Sl && (Sl = !1,
        Gn = e,
        xl = l),
        i = e.pendingLanes,
        i === 0 && (Qn = null),
        Ec(t.stateNode),
        Ke(e, we()),
        n !== null)
            for (r = e.onRecoverableError,
            t = 0; t < n.length; t++)
                l = n[t],
                r(l.value, {
                    componentStack: l.stack,
                    digest: l.digest
                });
        if (wl)
            throw wl = !1,
            e = wo,
            wo = null,
            e;
        return (xl & 1) !== 0 && e.tag !== 0 && It(),
        i = e.pendingLanes,
        (i & 1) !== 0 ? e === So ? wr++ : (wr = 0,
        So = e) : wr = 0,
        Hn(),
        null
    }
    function It() {
        if (Gn !== null) {
            var e = ku(xl)
              , n = rn.transition
              , t = se;
            try {
                if (rn.transition = null,
                se = 16 > e ? 16 : e,
                Gn === null)
                    var r = !1;
                else {
                    if (e = Gn,
                    Gn = null,
                    xl = 0,
                    (te & 6) !== 0)
                        throw Error(a(331));
                    var l = te;
                    for (te |= 4,
                    M = e.current; M !== null; ) {
                        var i = M
                          , o = i.child;
                        if ((M.flags & 16) !== 0) {
                            var s = i.deletions;
                            if (s !== null) {
                                for (var d = 0; d < s.length; d++) {
                                    var v = s[d];
                                    for (M = v; M !== null; ) {
                                        var x = M;
                                        switch (x.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            vr(8, x, i)
                                        }
                                        var N = x.child;
                                        if (N !== null)
                                            N.return = x,
                                            M = N;
                                        else
                                            for (; M !== null; ) {
                                                x = M;
                                                var k = x.sibling
                                                  , j = x.return;
                                                if (ga(x),
                                                x === v) {
                                                    M = null;
                                                    break
                                                }
                                                if (k !== null) {
                                                    k.return = j,
                                                    M = k;
                                                    break
                                                }
                                                M = j
                                            }
                                    }
                                }
                                var z = i.alternate;
                                if (z !== null) {
                                    var I = z.child;
                                    if (I !== null) {
                                        z.child = null;
                                        do {
                                            var Se = I.sibling;
                                            I.sibling = null,
                                            I = Se
                                        } while (I !== null)
                                    }
                                }
                                M = i
                            }
                        }
                        if ((i.subtreeFlags & 2064) !== 0 && o !== null)
                            o.return = i,
                            M = o;
                        else
                            e: for (; M !== null; ) {
                                if (i = M,
                                (i.flags & 2048) !== 0)
                                    switch (i.tag) {
                                    case 0:
                                    case 11:
                                    case 15:
                                        vr(9, i, i.return)
                                    }
                                var m = i.sibling;
                                if (m !== null) {
                                    m.return = i.return,
                                    M = m;
                                    break e
                                }
                                M = i.return
                            }
                    }
                    var f = e.current;
                    for (M = f; M !== null; ) {
                        o = M;
                        var g = o.child;
                        if ((o.subtreeFlags & 2064) !== 0 && g !== null)
                            g.return = o,
                            M = g;
                        else
                            e: for (o = f; M !== null; ) {
                                if (s = M,
                                (s.flags & 2048) !== 0)
                                    try {
                                        switch (s.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            vl(9, s)
                                        }
                                    } catch (A) {
                                        ke(s, s.return, A)
                                    }
                                if (s === o) {
                                    M = null;
                                    break e
                                }
                                var E = s.sibling;
                                if (E !== null) {
                                    E.return = s.return,
                                    M = E;
                                    break e
                                }
                                M = s.return
                            }
                    }
                    if (te = l,
                    Hn(),
                    vn && typeof vn.onPostCommitFiberRoot == "function")
                        try {
                            vn.onPostCommitFiberRoot(Lr, e)
                        } catch {}
                    r = !0
                }
                return r
            } finally {
                se = t,
                rn.transition = n
            }
        }
        return !1
    }
    function Oa(e, n, t) {
        n = Ot(t, n),
        n = Xs(e, n, 1),
        e = Wn(e, n, 1),
        n = Fe(),
        e !== null && (Wt(e, 1, n),
        Ke(e, n))
    }
    function ke(e, n, t) {
        if (e.tag === 3)
            Oa(e, e, t);
        else
            for (; n !== null; ) {
                if (n.tag === 3) {
                    Oa(n, e, t);
                    break
                } else if (n.tag === 1) {
                    var r = n.stateNode;
                    if (typeof n.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Qn === null || !Qn.has(r))) {
                        e = Ot(t, e),
                        e = qs(n, e, 1),
                        n = Wn(n, e, 1),
                        e = Fe(),
                        n !== null && (Wt(n, 1, e),
                        Ke(n, e));
                        break
                    }
                }
                n = n.return
            }
    }
    function qd(e, n, t) {
        var r = e.pingCache;
        r !== null && r.delete(n),
        n = Fe(),
        e.pingedLanes |= e.suspendedLanes & t,
        je === e && (Me & t) === t && (_e === 4 || _e === 3 && (Me & 130023424) === Me && 500 > we() - ko ? at(e, 0) : yo |= t),
        Ke(e, n)
    }
    function Ra(e, n) {
        n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Or,
        Or <<= 1,
        (Or & 130023424) === 0 && (Or = 4194304)));
        var t = Fe();
        e = Tn(e, n),
        e !== null && (Wt(e, n, t),
        Ke(e, t))
    }
    function Jd(e) {
        var n = e.memoizedState
          , t = 0;
        n !== null && (t = n.retryLane),
        Ra(e, t)
    }
    function Zd(e, n) {
        var t = 0;
        switch (e.tag) {
        case 13:
            var r = e.stateNode
              , l = e.memoizedState;
            l !== null && (t = l.retryLane);
            break;
        case 19:
            r = e.stateNode;
            break;
        default:
            throw Error(a(314))
        }
        r !== null && r.delete(n),
        Ra(e, t)
    }
    var za;
    za = function(e, n, t) {
        if (e !== null)
            if (e.memoizedProps !== n.pendingProps || Ue.current)
                Ve = !0;
            else {
                if ((e.lanes & t) === 0 && (n.flags & 128) === 0)
                    return Ve = !1,
                    $d(e, n, t);
                Ve = (e.flags & 131072) !== 0
            }
        else
            Ve = !1,
            me && (n.flags & 1048576) !== 0 && hs(n, el, n.index);
        switch (n.lanes = 0,
        n.tag) {
        case 2:
            var r = n.type;
            ml(e, n),
            e = n.pendingProps;
            var l = Et(n, Oe.current);
            Lt(n, t),
            l = Yi(null, n, r, e, l, t);
            var i = Xi();
            return n.flags |= 1,
            typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (n.tag = 1,
            n.memoizedState = null,
            n.updateQueue = null,
            He(r) ? (i = !0,
            qr(n)) : i = !1,
            n.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null,
            Hi(n),
            l.updater = hl,
            n.stateNode = l,
            l._reactInternals = n,
            to(n, r, e, t),
            n = oo(null, n, r, !0, i, t)) : (n.tag = 0,
            me && i && Oi(n),
            Ae(null, n, l, t),
            n = n.child),
            n;
        case 16:
            r = n.elementType;
            e: {
                switch (ml(e, n),
                e = n.pendingProps,
                l = r._init,
                r = l(r._payload),
                n.type = r,
                l = n.tag = nf(r),
                e = dn(r, e),
                l) {
                case 0:
                    n = io(null, n, r, e, t);
                    break e;
                case 1:
                    n = oa(null, n, r, e, t);
                    break e;
                case 11:
                    n = na(null, n, r, e, t);
                    break e;
                case 14:
                    n = ta(null, n, r, dn(r.type, e), t);
                    break e
                }
                throw Error(a(306, r, ""))
            }
            return n;
        case 0:
            return r = n.type,
            l = n.pendingProps,
            l = n.elementType === r ? l : dn(r, l),
            io(e, n, r, l, t);
        case 1:
            return r = n.type,
            l = n.pendingProps,
            l = n.elementType === r ? l : dn(r, l),
            oa(e, n, r, l, t);
        case 3:
            e: {
                if (ua(n),
                e === null)
                    throw Error(a(387));
                r = n.pendingProps,
                i = n.memoizedState,
                l = i.element,
                xs(e, n),
                ol(n, r, null, t);
                var o = n.memoizedState;
                if (r = o.element,
                i.isDehydrated)
                    if (i = {
                        element: r,
                        isDehydrated: !1,
                        cache: o.cache,
                        pendingSuspenseBoundaries: o.pendingSuspenseBoundaries,
                        transitions: o.transitions
                    },
                    n.updateQueue.baseState = i,
                    n.memoizedState = i,
                    n.flags & 256) {
                        l = Ot(Error(a(423)), n),
                        n = sa(e, n, r, t, l);
                        break e
                    } else if (r !== l) {
                        l = Ot(Error(a(424)), n),
                        n = sa(e, n, r, t, l);
                        break e
                    } else
                        for (qe = Bn(n.stateNode.containerInfo.firstChild),
                        Xe = n,
                        me = !0,
                        cn = null,
                        t = ws(n, null, r, t),
                        n.child = t; t; )
                            t.flags = t.flags & -3 | 4096,
                            t = t.sibling;
                else {
                    if (Tt(),
                    r === l) {
                        n = Pn(e, n, t);
                        break e
                    }
                    Ae(e, n, r, t)
                }
                n = n.child
            }
            return n;
        case 5:
            return Cs(n),
            e === null && Di(n),
            r = n.type,
            l = n.pendingProps,
            i = e !== null ? e.memoizedProps : null,
            o = l.children,
            _i(r, l) ? o = null : i !== null && _i(r, i) && (n.flags |= 32),
            ia(e, n),
            Ae(e, n, o, t),
            n.child;
        case 6:
            return e === null && Di(n),
            null;
        case 13:
            return aa(e, n, t);
        case 4:
            return Vi(n, n.stateNode.containerInfo),
            r = n.pendingProps,
            e === null ? n.child = jt(n, null, r, t) : Ae(e, n, r, t),
            n.child;
        case 11:
            return r = n.type,
            l = n.pendingProps,
            l = n.elementType === r ? l : dn(r, l),
            na(e, n, r, l, t);
        case 7:
            return Ae(e, n, n.pendingProps, t),
            n.child;
        case 8:
            return Ae(e, n, n.pendingProps.children, t),
            n.child;
        case 12:
            return Ae(e, n, n.pendingProps.children, t),
            n.child;
        case 10:
            e: {
                if (r = n.type._context,
                l = n.pendingProps,
                i = n.memoizedProps,
                o = l.value,
                de(rl, r._currentValue),
                r._currentValue = o,
                i !== null)
                    if (an(i.value, o)) {
                        if (i.children === l.children && !Ue.current) {
                            n = Pn(e, n, t);
                            break e
                        }
                    } else
                        for (i = n.child,
                        i !== null && (i.return = n); i !== null; ) {
                            var s = i.dependencies;
                            if (s !== null) {
                                o = i.child;
                                for (var d = s.firstContext; d !== null; ) {
                                    if (d.context === r) {
                                        if (i.tag === 1) {
                                            d = jn(-1, t & -t),
                                            d.tag = 2;
                                            var v = i.updateQueue;
                                            if (v !== null) {
                                                v = v.shared;
                                                var x = v.pending;
                                                x === null ? d.next = d : (d.next = x.next,
                                                x.next = d),
                                                v.pending = d
                                            }
                                        }
                                        i.lanes |= t,
                                        d = i.alternate,
                                        d !== null && (d.lanes |= t),
                                        $i(i.return, t, n),
                                        s.lanes |= t;
                                        break
                                    }
                                    d = d.next
                                }
                            } else if (i.tag === 10)
                                o = i.type === n.type ? null : i.child;
                            else if (i.tag === 18) {
                                if (o = i.return,
                                o === null)
                                    throw Error(a(341));
                                o.lanes |= t,
                                s = o.alternate,
                                s !== null && (s.lanes |= t),
                                $i(o, t, n),
                                o = i.sibling
                            } else
                                o = i.child;
                            if (o !== null)
                                o.return = i;
                            else
                                for (o = i; o !== null; ) {
                                    if (o === n) {
                                        o = null;
                                        break
                                    }
                                    if (i = o.sibling,
                                    i !== null) {
                                        i.return = o.return,
                                        o = i;
                                        break
                                    }
                                    o = o.return
                                }
                            i = o
                        }
                Ae(e, n, l.children, t),
                n = n.child
            }
            return n;
        case 9:
            return l = n.type,
            r = n.pendingProps.children,
            Lt(n, t),
            l = nn(l),
            r = r(l),
            n.flags |= 1,
            Ae(e, n, r, t),
            n.child;
        case 14:
            return r = n.type,
            l = dn(r, n.pendingProps),
            l = dn(r.type, l),
            ta(e, n, r, l, t);
        case 15:
            return ra(e, n, n.type, n.pendingProps, t);
        case 17:
            return r = n.type,
            l = n.pendingProps,
            l = n.elementType === r ? l : dn(r, l),
            ml(e, n),
            n.tag = 1,
            He(r) ? (e = !0,
            qr(n)) : e = !1,
            Lt(n, t),
            bs(n, r, l),
            to(n, r, l, t),
            oo(null, n, r, !0, e, t);
        case 19:
            return da(e, n, t);
        case 22:
            return la(e, n, t)
        }
        throw Error(a(156, n.tag))
    }
    ;
    function Da(e, n) {
        return pu(e, n)
    }
    function ef(e, n, t, r) {
        this.tag = e,
        this.key = t,
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null,
        this.index = 0,
        this.ref = null,
        this.pendingProps = n,
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null,
        this.mode = r,
        this.subtreeFlags = this.flags = 0,
        this.deletions = null,
        this.childLanes = this.lanes = 0,
        this.alternate = null
    }
    function ln(e, n, t, r) {
        return new ef(e,n,t,r)
    }
    function To(e) {
        return e = e.prototype,
        !(!e || !e.isReactComponent)
    }
    function nf(e) {
        if (typeof e == "function")
            return To(e) ? 1 : 0;
        if (e != null) {
            if (e = e.$$typeof,
            e === mn)
                return 11;
            if (e === gn)
                return 14
        }
        return 2
    }
    function Xn(e, n) {
        var t = e.alternate;
        return t === null ? (t = ln(e.tag, n, e.key, e.mode),
        t.elementType = e.elementType,
        t.type = e.type,
        t.stateNode = e.stateNode,
        t.alternate = e,
        e.alternate = t) : (t.pendingProps = n,
        t.type = e.type,
        t.flags = 0,
        t.subtreeFlags = 0,
        t.deletions = null),
        t.flags = e.flags & 14680064,
        t.childLanes = e.childLanes,
        t.lanes = e.lanes,
        t.child = e.child,
        t.memoizedProps = e.memoizedProps,
        t.memoizedState = e.memoizedState,
        t.updateQueue = e.updateQueue,
        n = e.dependencies,
        t.dependencies = n === null ? null : {
            lanes: n.lanes,
            firstContext: n.firstContext
        },
        t.sibling = e.sibling,
        t.index = e.index,
        t.ref = e.ref,
        t
    }
    function _l(e, n, t, r, l, i) {
        var o = 2;
        if (r = e,
        typeof e == "function")
            To(e) && (o = 1);
        else if (typeof e == "string")
            o = 5;
        else
            e: switch (e) {
            case Ee:
                return dt(t.children, l, i, n);
            case Be:
                o = 8,
                l |= 8;
                break;
            case On:
                return e = ln(12, t, n, l | 2),
                e.elementType = On,
                e.lanes = i,
                e;
            case Ge:
                return e = ln(13, t, n, l),
                e.elementType = Ge,
                e.lanes = i,
                e;
            case un:
                return e = ln(19, t, n, l),
                e.elementType = un,
                e.lanes = i,
                e;
            case ye:
                return Tl(t, l, i, n);
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                    case xn:
                        o = 10;
                        break e;
                    case Jn:
                        o = 9;
                        break e;
                    case mn:
                        o = 11;
                        break e;
                    case gn:
                        o = 14;
                        break e;
                    case $e:
                        o = 16,
                        r = null;
                        break e
                    }
                throw Error(a(130, e == null ? e : typeof e, ""))
            }
        return n = ln(o, t, n, l),
        n.elementType = e,
        n.type = r,
        n.lanes = i,
        n
    }
    function dt(e, n, t, r) {
        return e = ln(7, e, r, n),
        e.lanes = t,
        e
    }
    function Tl(e, n, t, r) {
        return e = ln(22, e, r, n),
        e.elementType = ye,
        e.lanes = t,
        e.stateNode = {
            isHidden: !1
        },
        e
    }
    function jo(e, n, t) {
        return e = ln(6, e, null, n),
        e.lanes = t,
        e
    }
    function Po(e, n, t) {
        return n = ln(4, e.children !== null ? e.children : [], e.key, n),
        n.lanes = t,
        n.stateNode = {
            containerInfo: e.containerInfo,
            pendingChildren: null,
            implementation: e.implementation
        },
        n
    }
    function tf(e, n, t, r, l) {
        this.tag = n,
        this.containerInfo = e,
        this.finishedWork = this.pingCache = this.current = this.pendingChildren = null,
        this.timeoutHandle = -1,
        this.callbackNode = this.pendingContext = this.context = null,
        this.callbackPriority = 0,
        this.eventTimes = ni(0),
        this.expirationTimes = ni(-1),
        this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0,
        this.entanglements = ni(0),
        this.identifierPrefix = r,
        this.onRecoverableError = l,
        this.mutableSourceEagerHydrationData = null
    }
    function Lo(e, n, t, r, l, i, o, s, d) {
        return e = new tf(e,n,t,s,d),
        n === 1 ? (n = 1,
        i === !0 && (n |= 8)) : n = 0,
        i = ln(3, null, null, n),
        e.current = i,
        i.stateNode = e,
        i.memoizedState = {
            element: r,
            isDehydrated: t,
            cache: null,
            transitions: null,
            pendingSuspenseBoundaries: null
        },
        Hi(i),
        e
    }
    function rf(e, n, t) {
        var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return {
            $$typeof: ne,
            key: r == null ? null : "" + r,
            children: e,
            containerInfo: n,
            implementation: t
        }
    }
    function Ia(e) {
        if (!e)
            return Un;
        e = e._reactInternals;
        e: {
            if (Zn(e) !== e || e.tag !== 1)
                throw Error(a(170));
            var n = e;
            do {
                switch (n.tag) {
                case 3:
                    n = n.stateNode.context;
                    break e;
                case 1:
                    if (He(n.type)) {
                        n = n.stateNode.__reactInternalMemoizedMergedChildContext;
                        break e
                    }
                }
                n = n.return
            } while (n !== null);
            throw Error(a(171))
        }
        if (e.tag === 1) {
            var t = e.type;
            if (He(t))
                return cs(e, t, n)
        }
        return n
    }
    function Aa(e, n, t, r, l, i, o, s, d) {
        return e = Lo(t, r, !0, e, l, i, o, s, d),
        e.context = Ia(null),
        t = e.current,
        r = Fe(),
        l = bn(t),
        i = jn(r, l),
        i.callback = n ?? null,
        Wn(t, i, l),
        e.current.lanes = l,
        Wt(e, l, r),
        Ke(e, r),
        e
    }
    function jl(e, n, t, r) {
        var l = n.current
          , i = Fe()
          , o = bn(l);
        return t = Ia(t),
        n.context === null ? n.context = t : n.pendingContext = t,
        n = jn(i, o),
        n.payload = {
            element: e
        },
        r = r === void 0 ? null : r,
        r !== null && (n.callback = r),
        e = Wn(l, n, o),
        e !== null && (pn(e, l, o, i),
        il(e, l, o)),
        o
    }
    function Pl(e) {
        if (e = e.current,
        !e.child)
            return null;
        switch (e.child.tag) {
        case 5:
            return e.child.stateNode;
        default:
            return e.child.stateNode
        }
    }
    function Fa(e, n) {
        if (e = e.memoizedState,
        e !== null && e.dehydrated !== null) {
            var t = e.retryLane;
            e.retryLane = t !== 0 && t < n ? t : n
        }
    }
    function Mo(e, n) {
        Fa(e, n),
        (e = e.alternate) && Fa(e, n)
    }
    function lf() {
        return null
    }
    var Ba = typeof reportError == "function" ? reportError : function(e) {
        console.error(e)
    }
    ;
    function Oo(e) {
        this._internalRoot = e
    }
    Ll.prototype.render = Oo.prototype.render = function(e) {
        var n = this._internalRoot;
        if (n === null)
            throw Error(a(409));
        jl(e, n, null, null)
    }
    ,
    Ll.prototype.unmount = Oo.prototype.unmount = function() {
        var e = this._internalRoot;
        if (e !== null) {
            this._internalRoot = null;
            var n = e.containerInfo;
            st(function() {
                jl(null, e, null, null)
            }),
            n[Nn] = null
        }
    }
    ;
    function Ll(e) {
        this._internalRoot = e
    }
    Ll.prototype.unstable_scheduleHydration = function(e) {
        if (e) {
            var n = xu();
            e = {
                blockedOn: null,
                target: e,
                priority: n
            };
            for (var t = 0; t < In.length && n !== 0 && n < In[t].priority; t++)
                ;
            In.splice(t, 0, e),
            t === 0 && Cu(e)
        }
    }
    ;
    function Ro(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
    }
    function Ml(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
    }
    function $a() {}
    function of(e, n, t, r, l) {
        if (l) {
            if (typeof r == "function") {
                var i = r;
                r = function() {
                    var v = Pl(o);
                    i.call(v)
                }
            }
            var o = Aa(n, r, e, 0, null, !1, !1, "", $a);
            return e._reactRootContainer = o,
            e[Nn] = o.current,
            lr(e.nodeType === 8 ? e.parentNode : e),
            st(),
            o
        }
        for (; l = e.lastChild; )
            e.removeChild(l);
        if (typeof r == "function") {
            var s = r;
            r = function() {
                var v = Pl(d);
                s.call(v)
            }
        }
        var d = Lo(e, 0, !1, null, null, !1, !1, "", $a);
        return e._reactRootContainer = d,
        e[Nn] = d.current,
        lr(e.nodeType === 8 ? e.parentNode : e),
        st(function() {
            jl(n, d, t, r)
        }),
        d
    }
    function Ol(e, n, t, r, l) {
        var i = t._reactRootContainer;
        if (i) {
            var o = i;
            if (typeof l == "function") {
                var s = l;
                l = function() {
                    var d = Pl(o);
                    s.call(d)
                }
            }
            jl(n, o, e, l)
        } else
            o = of(t, n, e, l, r);
        return Pl(o)
    }
    wu = function(e) {
        switch (e.tag) {
        case 3:
            var n = e.stateNode;
            if (n.current.memoizedState.isDehydrated) {
                var t = Vt(n.pendingLanes);
                t !== 0 && (ti(n, t | 1),
                Ke(n, we()),
                (te & 6) === 0 && (Dt = we() + 500,
                Hn()))
            }
            break;
        case 13:
            st(function() {
                var r = Tn(e, 1);
                if (r !== null) {
                    var l = Fe();
                    pn(r, e, 1, l)
                }
            }),
            Mo(e, 1)
        }
    }
    ,
    ri = function(e) {
        if (e.tag === 13) {
            var n = Tn(e, 134217728);
            if (n !== null) {
                var t = Fe();
                pn(n, e, 134217728, t)
            }
            Mo(e, 134217728)
        }
    }
    ,
    Su = function(e) {
        if (e.tag === 13) {
            var n = bn(e)
              , t = Tn(e, n);
            if (t !== null) {
                var r = Fe();
                pn(t, e, n, r)
            }
            Mo(e, n)
        }
    }
    ,
    xu = function() {
        return se
    }
    ,
    Nu = function(e, n) {
        var t = se;
        try {
            return se = e,
            n()
        } finally {
            se = t
        }
    }
    ,
    Yl = function(e, n, t) {
        switch (n) {
        case "input":
            if (Ul(e, t),
            n = t.name,
            t.type === "radio" && n != null) {
                for (t = e; t.parentNode; )
                    t = t.parentNode;
                for (t = t.querySelectorAll("input[name=" + JSON.stringify("" + n) + '][type="radio"]'),
                n = 0; n < t.length; n++) {
                    var r = t[n];
                    if (r !== e && r.form === e.form) {
                        var l = Yr(r);
                        if (!l)
                            throw Error(a(90));
                        Go(r),
                        Ul(r, l)
                    }
                }
            }
            break;
        case "textarea":
            Jo(e, t);
            break;
        case "select":
            n = t.value,
            n != null && ft(e, !!t.multiple, n, !1)
        }
    }
    ,
    uu = Eo,
    su = st;
    var uf = {
        usingClientEntryPoint: !1,
        Events: [ur, xt, Yr, iu, ou, Eo]
    }
      , Sr = {
        findFiberByHostInstance: et,
        bundleType: 0,
        version: "18.3.1",
        rendererPackageName: "react-dom"
    }
      , sf = {
        bundleType: Sr.bundleType,
        version: Sr.version,
        rendererPackageName: Sr.rendererPackageName,
        rendererConfig: Sr.rendererConfig,
        overrideHookState: null,
        overrideHookStateDeletePath: null,
        overrideHookStateRenamePath: null,
        overrideProps: null,
        overridePropsDeletePath: null,
        overridePropsRenamePath: null,
        setErrorHandler: null,
        setSuspenseHandler: null,
        scheduleUpdate: null,
        currentDispatcherRef: D.ReactCurrentDispatcher,
        findHostInstanceByFiber: function(e) {
            return e = fu(e),
            e === null ? null : e.stateNode
        },
        findFiberByHostInstance: Sr.findFiberByHostInstance || lf,
        findHostInstancesForRefresh: null,
        scheduleRefresh: null,
        scheduleRoot: null,
        setRefreshHandler: null,
        getCurrentFiber: null,
        reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var Rl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!Rl.isDisabled && Rl.supportsFiber)
            try {
                Lr = Rl.inject(sf),
                vn = Rl
            } catch {}
    }
    return Qe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = uf,
    Qe.createPortal = function(e, n) {
        var t = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!Ro(n))
            throw Error(a(200));
        return rf(e, n, null, t)
    }
    ,
    Qe.createRoot = function(e, n) {
        if (!Ro(e))
            throw Error(a(299));
        var t = !1
          , r = ""
          , l = Ba;
        return n != null && (n.unstable_strictMode === !0 && (t = !0),
        n.identifierPrefix !== void 0 && (r = n.identifierPrefix),
        n.onRecoverableError !== void 0 && (l = n.onRecoverableError)),
        n = Lo(e, 1, !1, null, null, t, !1, r, l),
        e[Nn] = n.current,
        lr(e.nodeType === 8 ? e.parentNode : e),
        new Oo(n)
    }
    ,
    Qe.findDOMNode = function(e) {
        if (e == null)
            return null;
        if (e.nodeType === 1)
            return e;
        var n = e._reactInternals;
        if (n === void 0)
            throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","),
            Error(a(268, e)));
        return e = fu(n),
        e = e === null ? null : e.stateNode,
        e
    }
    ,
    Qe.flushSync = function(e) {
        return st(e)
    }
    ,
    Qe.hydrate = function(e, n, t) {
        if (!Ml(n))
            throw Error(a(200));
        return Ol(null, e, n, !0, t)
    }
    ,
    Qe.hydrateRoot = function(e, n, t) {
        if (!Ro(e))
            throw Error(a(405));
        var r = t != null && t.hydratedSources || null
          , l = !1
          , i = ""
          , o = Ba;
        if (t != null && (t.unstable_strictMode === !0 && (l = !0),
        t.identifierPrefix !== void 0 && (i = t.identifierPrefix),
        t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
        n = Aa(n, null, e, 1, t ?? null, l, !1, i, o),
        e[Nn] = n.current,
        lr(e),
        r)
            for (e = 0; e < r.length; e++)
                t = r[e],
                l = t._getVersion,
                l = l(t._source),
                n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [t, l] : n.mutableSourceEagerHydrationData.push(t, l);
        return new Ll(n)
    }
    ,
    Qe.render = function(e, n, t) {
        if (!Ml(n))
            throw Error(a(200));
        return Ol(null, e, n, !1, t)
    }
    ,
    Qe.unmountComponentAtNode = function(e) {
        if (!Ml(e))
            throw Error(a(40));
        return e._reactRootContainer ? (st(function() {
            Ol(null, null, e, !1, function() {
                e._reactRootContainer = null,
                e[Nn] = null
            })
        }),
        !0) : !1
    }
    ,
    Qe.unstable_batchedUpdates = Eo,
    Qe.unstable_renderSubtreeIntoContainer = function(e, n, t, r) {
        if (!Ml(t))
            throw Error(a(200));
        if (e == null || e._reactInternals === void 0)
            throw Error(a(38));
        return Ol(e, n, t, !1, r)
    }
    ,
    Qe.version = "18.3.1-next-f1338f8080-20240426",
    Qe
}
var ba;
function lc() {
    if (ba)
        return Io.exports;
    ba = 1;
    function u() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(u)
            } catch (h) {
                console.error(h)
            }
    }
    return u(),
    Io.exports = gf(),
    Io.exports
}
var Ya;
function vf() {
    if (Ya)
        return zl;
    Ya = 1;
    var u = lc();
    return zl.createRoot = u.createRoot,
    zl.hydrateRoot = u.hydrateRoot,
    zl
}
var yf = vf();
const kf = rc(yf)
  , on = {
    village: {
        id: "village",
        label: "Dân làng",
        color: "#22c55e"
    },
    werewolf: {
        id: "werewolf",
        label: "Sói",
        color: "#ef4444"
    },
    vampire: {
        id: "vampire",
        label: "Ma cà rồng",
        color: "#a855f7"
    },
    other: {
        id: "other",
        label: "Khác",
        color: "#eab308"
    }
}
  , Bo = {
    every: "Mỗi đêm",
    night1: "Chỉ đêm 1",
    night2: "Chỉ đêm 2",
    fromNight2: "Từ đêm 2"
}
  , wf = {
    lovers: {
        id: "lovers",
        requiresRole: "cupid",
        nightOrder: 1.5,
        name: "Cặp đôi",
        phase: "every",
        script: "Cặp đôi thức dậy và trao nhau thông tin."
    },
    cupidThirdTeam: {
        id: "cupidThirdTeam",
        requiresRole: "cupid",
        minPlayers: 13,
        nightOrder: 1.55,
        name: "Thần Tình Yêu — phe thứ 3",
        phase: "night1",
        playerCondition: "Hơn 12 người chơi",
        script: "Thần Tình Yêu thức dậy. Tôi sẽ cho bạn biết bạn có thuộc phe thứ 3 (phe Cặp đôi) hay không.",
        moderatorNote: "Chỉ áp dụng khi có hơn 12 người chơi, thực hiện ngay sau khi Cặp đôi đã thức dậy. Nếu Cupid ghép hai người thuộc hai phe đối lập (ví dụ Sói/Ma cà rồng với Dân làng), báo cho Cupid biết họ thuộc phe thứ 3. Nếu không, báo Cupid vẫn thuộc phe Dân làng."
    }
}
  , Sf = [{
    id: "lone_wolf",
    name: "Sói đơn độc",
    nameEn: "Lone Wolf",
    team: "werewolf",
    value: -4,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Bạn chỉ thắng nếu bạn là con sói cuối cùng sống sót.",
    script: "Sói đơn độc thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "halfblood",
    name: "Con Lai",
    nameEn: "Halfblood",
    team: "village",
    value: -1,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Khi bị tiên tri soi thì bạn là Sói.",
    script: "Con lai thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "mayor",
    name: "Thị Trưởng",
    nameEn: "Mayor",
    team: "village",
    value: 2,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Phiếu bầu của bạn tính là 2 phiếu.",
    script: "Thị Trưởng hãy thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "tough_guy",
    name: "Thanh Niên Cứng",
    nameEn: "Tough Guy",
    team: "village",
    value: 3,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Nếu sói cắn bạn, bạn sẽ không chết ngay và cầm cự đến đêm tiếp theo.",
    script: "Thanh niên cứng hãy thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "rusty_knight",
    name: "Hiệp sĩ Kiếm Rỉ",
    nameEn: "Rusty Knight",
    team: "village",
    value: 5,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Nếu bạn bị sói cắn chết, Ma Sói bị nhiễm bệnh từ vết thương của kiếm rỉ. Con Sói nằm ngay bên trái của bạn sẽ bị chết vào đêm hôm sau. Người giữ bài Hiệp sĩ kiếm rỉ không được tiết lộ danh tính cho người khác khi còn sống, nếu không lá bài sẽ mất tác dụng.",
    script: "Hiệp sĩ Kiếm Rỉ hãy thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "diseased",
    name: "Người Bệnh",
    nameEn: "Diseased",
    team: "village",
    value: 3,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Nếu bạn bị sói cắn chết, chúng sẽ lây bệnh và không thể giết ai vào đêm tiếp theo.",
    script: "Người Bệnh hãy thức dậy để tôi ghi nhận vai trò của bạn."
}, {
    id: "hoodlum",
    name: "Du Côn",
    nameEn: "Hoodlum",
    team: "other",
    value: 0,
    wakesAtNight: !0,
    nightOrder: 0,
    phase: "night1",
    ability: "Gây sự 2 người vào đêm đầu tiên. Bạn sẽ thắng nếu 2 người chơi ấy chết và bạn phải sống cho đến khi game kết thúc.",
    script: "Du Côn hãy thức dậy và chọn 2 người chơi để gây sự."
}, {
    id: "cupid",
    name: "Thần Tình Yêu",
    nameEn: "Cupid",
    team: "village",
    value: 3,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 1,
    phase: "night1",
    ability: "Trong đêm đầu tiên, chọn 2 người chơi trở thành một cặp đôi. Nếu một người chết, người còn lại cũng chết theo.",
    script: "Thần Tình Yêu hãy thức dậy, mở mắt và chỉ vào 2 người để kết thành một đôi tình nhân (có thể chỉ bản thân)."
}, {
    id: "guard",
    name: "Bảo Vệ",
    nameEn: "Guard",
    team: "village",
    value: 4,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 2,
    phase: "every",
    ability: "Mỗi đêm, bảo vệ cho 1 người chơi. Người đó sẽ không thể bị sói cắn chết trong đêm nay. Không được bảo vệ cùng 1 người 2 đêm liên tiếp.",
    script: "Bảo Vệ hãy thức dậy. Bạn muốn bảo vệ ai trong đêm nay?"
}, {
    id: "priest",
    name: "Mục sư",
    nameEn: "Priest",
    team: "village",
    value: 3,
    wakesAtNight: !0,
    nightOrder: 2,
    phase: "every",
    ability: "Vào ban đêm, chọn 1 người để ban phước (1 lần duy nhất). Người chơi ấy không thể chết vào ban đêm (trừ tự sát).",
    script: "Mục sư hãy thức dậy. Bạn muốn ban phước cho ai?"
}, {
    id: "werewolf",
    name: "Ma Sói",
    nameEn: "Werewolf",
    team: "werewolf",
    value: -6,
    max: 10,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 3,
    phase: "every",
    ability: "Mỗi đêm, cả bầy Sói cùng thống nhất chọn 1 người để ăn thịt. Nạn nhân sẽ chết vào đầu ngày hôm sau.",
    script: "Ma Sói hãy thức dậy, nhìn nhau và cùng chọn 1 người để ăn thịt đêm nay."
}, {
    id: "fruit_wolf",
    name: "Sói Ăn Chay",
    nameEn: "Fruit Wolf",
    team: "werewolf",
    value: -3,
    wakesAtNight: !0,
    nightOrder: 3.1,
    phase: "night1",
    ability: "Nếu bạn là con sói cuối cùng thì bạn sẽ không được ăn thịt.",
    script: "Sói Ăn Chay hãy thức dậy để các Ma Sói còn lại biết."
}, {
    id: "wolf_cub",
    name: "Sói Con",
    nameEn: "Wolf Cub",
    team: "werewolf",
    value: -8,
    wakesAtNight: !0,
    nightOrder: 3.2,
    phase: "night1",
    ability: "Nếu Sói Con bị giết, sói sẽ được ăn thịt 2 người chơi vào đêm tiếp theo.",
    script: "Sói Con giơ tay lên để các Ma Sói còn lại biết."
}, {
    id: "minion",
    name: "Kẻ phản bội",
    nameEn: "Minion",
    team: "werewolf",
    value: -6,
    wakesAtNight: !0,
    nightOrder: 3.2,
    phase: "night1",
    ability: "Phản bội thức dậy cùng Sói và biết Sói là ai. Tham gia cùng Sói để giết Dân làng. Tuy nhiên Tiên tri khi soi vào Phản bội thì vẫn ra dân làng.",
    script: "Kẻ phản bội giơ tay lên để các Ma Sói còn lại biết."
}, {
    id: "alpha_wolf",
    name: "Sói Đầu đàn",
    nameEn: "Alpha Wolf",
    team: "werewolf",
    value: -9,
    wakesAtNight: !0,
    nightOrder: 3.3,
    phase: "every",
    ability: "Sau khi bầy sói chọn mục tiêu. Bạn có thể biến con mồi trở thành sói thay vì ăn thịt nếu con mồi bị ăn thịt thành công (1 ván 1 lần duy nhất).",
    script: "Sói Đầu đàn hãy thức dậy. Bạn có muốn biến con mồi trở thành sói không?"
}, {
    id: "fang_face",
    name: "Nanh Sói",
    nameEn: "Fang Face",
    team: "werewolf",
    value: -5,
    wakesAtNight: !0,
    nightOrder: 3.4,
    phase: "every",
    ability: "Đên đầu tiên, Nanh sói cũng thức dậy cùng những Sói khác. Nanh sói sẽ tiếp tục ngủ vào các đêm tiếp theo, cho đến khi là con sói duy nhất.",
    script: "Nanh Sói hãy thức dậy để xem bạn là con sói cuối cùng hay không?"
}, {
    id: "vampire",
    name: "Ma Cà Rồng",
    nameEn: "Vampire",
    team: "vampire",
    value: -7,
    max: 6,
    wakesAtNight: !0,
    nightOrder: 4,
    phase: "every",
    ability: "Mỗi đêm, cả bầy Ma cà rồng cùng chọn 1 người để cắn. Nạn nhân chết vào cuối ngày hôm sau.",
    script: "Ma Cà Rồng hãy thức dậy, nhìn nhau và cùng chọn 1 người để cắn đêm nay."
}, {
    id: "witch",
    name: "Phù Thủy",
    nameEn: "Witch",
    team: "village",
    value: 5,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 5,
    phase: "every",
    ability: "Có 2 bình thuốc dùng một lần: 1 bình cứu và 1 bình độc.",
    script: "Phù Thủy hãy thức dậy. Đây là nạn nhân của Sói đêm nay. Bạn có muốn dùng bình cứu không? Bạn có muốn dùng bình độc với ai không?"
}, {
    id: "seer",
    name: "Tiên Tri",
    nameEn: "Seer",
    team: "village",
    value: 7,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 6,
    phase: "every",
    ability: "Mỗi đêm, chỉ vào 1 người để biết người đó có phải Sói hay không.",
    script: "Tiên Tri thức dậy và chỉ vào 1 người để biết người đó có phải Sói hay không."
}, {
    id: "aura_seer",
    name: "Tiên Tri Hào Quang",
    nameEn: "Aura Seer",
    team: "village",
    value: 3,
    wakesAtNight: !0,
    nightOrder: 6,
    phase: "every",
    ability: "Mỗi đêm, chỉ vào 1 người để biết người đó có chức năng đặc biệt hay không (không phải Dân làng, Ma Sói, Ma cà rồng).",
    script: "Tiên Tri Hào Quang hãy thức dậy và chỉ vào 1 người để biết người đó có chức năng đặc biệt hay không."
}, {
    id: "mystic_seeker",
    name: "Tiên Tri Bí Ẩn",
    nameEn: "Mystic Seeker",
    team: "village",
    value: 9,
    wakesAtNight: !0,
    nightOrder: 6,
    phase: "every",
    ability: "Mỗi đêm, chọn 1 người và biết chính xác chức năng cụ thể của họ.",
    script: "Tiên Tri Bí Ẩn hãy thức dậy và chỉ vào 1 người để biết chính xác chức năng cụ thể của họ."
}, {
    id: "apprentice_seer",
    name: "Tiên Tri Tập sự",
    nameEn: "Apprentice Seer",
    team: "village",
    value: 4,
    wakesAtNight: !0,
    nightOrder: 6.5,
    phase: "every",
    ability: "Nếu Tiên Tri chết, bạn sẽ trở thành Tiên Tri.",
    script: "Tiên Tri Tập sự hãy thức dậy để xem bạn có trở thành Tiên Tri hay không. Nếu bạn trở thành Tiên Tri, hãy chỉ vào 1 người để biết họ là Sói hay không."
}, {
    id: "sorceress",
    name: "Bà Đồng",
    nameEn: "Sorceress",
    team: "werewolf",
    value: -3,
    wakesAtNight: !0,
    nightOrder: 6.9,
    phase: "every",
    ability: "Mỗi đêm, thức dậy truy tìm Tiên Tri. Bạn thuộc phe sói nhưng Tiên Tri sẽ soi thành người.",
    script: "Bà Đồng hãy thức dậy để truy tìm Tiên Tri."
}, {
    id: "hunter",
    name: "Thợ Săn",
    nameEn: "Hunter",
    team: "village",
    value: 3,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 7,
    phase: "every",
    ability: "Khi bạn chết, bạn được phép giết một người chơi khác.",
    script: "Thợ Săn hãy thức dậy. Bạn muốn săn chết ai? Có thể không chọn ai."
}, {
    id: "huntress",
    name: "Nữ Thợ Săn",
    nameEn: "Huntress",
    team: "village",
    value: 3,
    wakesAtNight: !0,
    nightOrder: 7.1,
    phase: "every",
    ability: "Trong đêm, bạn được phép giết một người chơi khác (1 lần duy nhất).",
    script: "Nữ Thợ Săn hãy thức dậy. Bạn muốn bắn chết ai? Có thể không chọn ai."
}, {
    id: "investigator",
    name: "Thám Tử",
    nameEn: "Investigator",
    team: "village",
    value: 4,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "every",
    ability: "1 lần trong ván, chọn 1 người, bạn sẽ sẽ biết người chơi đó hoặc 2 người ngồi cạnh người đó có phải là sói hay không.",
    script: "Thám tử hãy thức dậy. Bạn có muốn điều tra ai? Có thể chưa chọn ai."
}, {
    id: "spellcaster",
    name: "Pháp sư",
    nameEn: "Spellcaster",
    team: "village",
    value: 1,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "every",
    ability: "Mỗi đêm chọn một người chơi để người đó không được phép nói vào ngày hôm sau.",
    script: "Pháp sư hãy thức dậy. Bạn có muốn làm phép cho ai? Có thể không chọn ai."
}, {
    id: "cursed",
    name: "Kẻ Bị Nguyền",
    nameEn: "Cursed",
    team: "village",
    value: -2,
    recommended: !0,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "every",
    ability: "Bạn thuộc phe dân làng nhưng nếu bạn bị sói cắn chết, bạn sẽ trở thành sói.",
    script: "Kẻ Bị Nguyền hãy thức dậy để xem bạn có trở thành sói hay không."
}, {
    id: "old_hag",
    name: "Mụ Già",
    nameEn: "Old Hag",
    team: "village",
    value: 1,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "every",
    ability: "Mỗi đêm, chọn một người chơi phải rời khỏi làng vào ngày hôm sau.",
    script: "Mụ Già hãy thức dậy. Bạn chọn ai rời khỏi làng vào ngày hôm sau? Có thể không chọn ai."
}, {
    id: "mentalist",
    name: "Nhà ngoại cảm",
    nameEn: "Mentalist ",
    team: "village",
    value: 4,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "every",
    ability: "Mỗi đêm, chọn ra 2 người chơi, bạn sẽ biết họ cùng phe với nhau hay không.",
    script: "Nhà ngoại cảm hãy thức dậy. Bạn chọn 2 người chơi để biết họ cùng phe với nhau hay không?"
}, {
    id: "gambler",
    name: "Con Bạc",
    nameEn: "Gambler",
    team: "village",
    value: 2,
    wakesAtNight: !0,
    nightOrder: 8,
    phase: "fromNight2",
    ability: "Mỗi đêm (trừ đêm đầu), chỉ 1 người chơi. Nếu người chơi đó là Sói thì họ chết. Nếu không, bạn chết.",
    script: "Con bạc hãy thức dậy, đêm nay bạn muốn chơi may rủi với ai?"
}, {
    id: "cult_leader",
    name: "Chủ Giáo Phái",
    nameEn: "Cult Leader",
    team: "other",
    value: 1,
    wakesAtNight: !0,
    nightOrder: 9,
    phase: "every",
    ability: "Mỗi đêm, chọn 1 người chơi tham gia vào giáo phái của bạn. Nếu tất cả người chơi còn sống đều trong giáo phái, bạn thắng.",
    script: "Chủ Giáo Phái hãy thức dậy. Bạn chọn 1 người chơi để tham gia vào giáo phái của bạn."
}, {
    id: "prince",
    name: "Hoàng Tử",
    nameEn: "Prince",
    team: "village",
    value: 2,
    wakesAtNight: !1,
    nightOrder: 999,
    phase: "every",
    ability: "Nếu bạn bị bình chọn để giết buổi sáng, bạn tiết lộ thân phận và được sống tiếp.",
    script: ""
}, {
    id: "tanner",
    name: "Chán Đời",
    nameEn: "Tanner",
    team: "other",
    value: -2,
    wakesAtNight: !1,
    nightOrder: 999,
    phase: "every",
    ability: "Bạn chỉ thắng khi bị giết trong buổi sáng.",
    script: ""
}, {
    id: "villager",
    name: "Dân Làng",
    nameEn: "Villager",
    team: "village",
    value: 1,
    max: 30,
    recommended: !0,
    wakesAtNight: !1,
    nightOrder: 999,
    phase: "every",
    ability: "Không có năng lực đặc biệt. Nhiệm vụ là tìm ra và treo cổ Sói/Ma cà rồng.",
    script: ""
}]
  , Ko = Sf.map(u => ({
    max: 1,
    recommended: !1,
    ...u
}))
  , xe = Object.fromEntries(Ko.map(u => [u.id, u]))
  , xf = new Set(Object.keys({
    "../../public/roles/alpha_wolf.webp": 0,
    "../../public/roles/apprentice_seer.webp": 0,
    "../../public/roles/aura_seer.webp": 0,
    "../../public/roles/cult_leader.webp": 0,
    "../../public/roles/cupid.webp": 0,
    "../../public/roles/cursed.webp": 0,
    "../../public/roles/diseased.webp": 0,
    "../../public/roles/fruit_wolf.webp": 0,
    "../../public/roles/gambler.webp": 0,
    "../../public/roles/guard.webp": 0,
    "../../public/roles/halfblood.webp": 0,
    "../../public/roles/hoodlum.webp": 0,
    "../../public/roles/hunter.webp": 0,
    "../../public/roles/huntress.webp": 0,
    "../../public/roles/investigator.webp": 0,
    "../../public/roles/lone_wolf.webp": 0,
    "../../public/roles/mayor.webp": 0,
    "../../public/roles/minion.webp": 0,
    "../../public/roles/mystic_seer.webp": 0,
    "../../public/roles/old_hag.webp": 0,
    "../../public/roles/priest.webp": 0,
    "../../public/roles/prince.webp": 0,
    "../../public/roles/seer.webp": 0,
    "../../public/roles/sorceress.webp": 0,
    "../../public/roles/spellcaster.webp": 0,
    "../../public/roles/tanner.webp": 0,
    "../../public/roles/tough_guy.webp": 0,
    "../../public/roles/vampire.webp": 0,
    "../../public/roles/villager.webp": 0,
    "../../public/roles/werewolf.webp": 0,
    "../../public/roles/witch.webp": 0,
    "../../public/roles/wolf_cub.webp": 0
}).map(u => u.slice(u.lastIndexOf("/") + 1, -5)));
function $o(u) {
    return xf.has(u) ? `/roles/${u}.webp` : null
}
function ic(u, h) {
    const a = xe[u];
    return a ? (h[u] || 0) < a.max : !1
}
function oc(u, h) {
    const a = xe[u];
    return !a || h <= 0 ? 0 : Math.min(h, a.max)
}
const Xa = new Map(Ko.map( (u, h) => [u.id, h]))
  , Nf = [{
    id: "all",
    label: "Tất cả"
}, {
    id: "village",
    label: on.village.label
}, {
    id: "werewolf",
    label: on.werewolf.label
}, {
    id: "vampire",
    label: on.vampire.label
}, {
    id: "other",
    label: on.other.label
}];
function Ef({value: u}) {
    const h = u > 0 ? "pos" : u < 0 ? "neg" : "zero";
    return c.jsx("span", {
        className: `value-badge ${h}`,
        title: "Điểm cân bằng",
        children: u > 0 ? `+${u}` : u
    })
}
function Cf({selected: u, onAdd: h}) {
    const [a,y] = ee.useState("all")
      , [w,C] = ee.useState("")
      , B = ee.useMemo( () => {
        const _ = w.trim().toLowerCase();
        return Ko.filter(P => {
            const U = a === "all" || P.team === a
              , O = !_ || P.name.toLowerCase().includes(_) || P.nameEn.toLowerCase().includes(_);
            return U && O
        }
        ).sort( (P, U) => !!U.recommended != !!P.recommended ? U.recommended ? 1 : -1 : Xa.get(P.id) - Xa.get(U.id))
    }
    , [a, w]);
    return c.jsxs("section", {
        className: "panel",
        children: [c.jsxs("div", {
            className: "panel-head",
            children: [c.jsx("h2", {
                children: "Thư viện vai trò"
            }), c.jsxs("span", {
                className: "muted",
                children: [B.length, " vai trò"]
            })]
        }), c.jsxs("div", {
            className: "toolbar",
            children: [c.jsx("input", {
                className: "search",
                type: "text",
                placeholder: "Tìm vai trò...",
                value: w,
                onChange: _ => C(_.target.value)
            }), c.jsx("div", {
                className: "filters",
                children: Nf.map(_ => c.jsx("button", {
                    className: `chip ${a === _.id ? "active" : ""}`,
                    onClick: () => y(_.id),
                    children: _.label
                }, _.id))
            })]
        }), c.jsx("div", {
            className: "role-grid",
            children: B.map(_ => {
                const P = on[_.team]
                  , U = u[_.id] || 0
                  , O = U >= _.max
                  , L = $o(_.id);
                return c.jsxs("article", {
                    className: `role-card${_.recommended ? " recommended" : ""}${L ? " has-img" : ""}`,
                    children: [L && c.jsx("img", {
                        src: L,
                        alt: "",
                        className: "role-card-img",
                        style: {
                            borderColor: P.color
                        }
                    }), c.jsxs("div", {
                        className: "role-card-top",
                        children: [c.jsxs("div", {
                            children: [c.jsx("h3", {
                                className: "role-name",
                                children: _.name
                            }), c.jsx("span", {
                                className: "role-en",
                                children: _.nameEn
                            })]
                        }), c.jsx(Ef, {
                            value: _.value
                        })]
                    }), c.jsxs("div", {
                        className: "role-tags",
                        children: [c.jsx("span", {
                            className: "team-tag",
                            style: {
                                "--team-color": P.color
                            },
                            children: P.label
                        }), _.recommended && c.jsx("span", {
                            className: "recommended-tag",
                            children: "Đề xuất"
                        }), _.wakesAtNight ? c.jsxs("span", {
                            className: "phase-tag",
                            children: ["Gọi: ", Bo[_.phase]]
                        }) : c.jsx("span", {
                            className: "phase-tag sleep",
                            children: "Không thức dậy"
                        }), _.max > 1 && c.jsxs("span", {
                            className: "limit-tag",
                            children: ["Tối đa ", _.max]
                        })]
                    }), c.jsx("p", {
                        className: "role-ability",
                        children: _.ability
                    }), c.jsxs("button", {
                        className: "add-btn",
                        disabled: O,
                        title: O ? `Đã đạt tối đa ${_.max}` : void 0,
                        onClick: () => h(_.id),
                        children: [O ? "Đã đủ" : "+ Thêm", U > 0 && c.jsx("span", {
                            className: "count-pill",
                            children: U
                        })]
                    })]
                }, _.id)
            }
            )
        })]
    })
}
const Il = 4
  , Al = 24
  , Mn = "werewolf"
  , Ie = "villager";
function _f(u) {
    var h;
    return (((h = xe[u]) == null ? void 0 : h.name) || "").includes("Sói")
}
function Tf(u) {
    return u[Ie] || 0
}
function jf(u) {
    return Object.entries(u).reduce( (h, [a,y]) => _f(a) ? h + y : h, 0)
}
function uc(u) {
    return Tf(u) >= jf(u)
}
const Qo = [{
    id: "seer",
    minPlayers: 0
}, {
    id: "guard",
    minPlayers: 7
}, {
    id: "witch",
    minPlayers: 8
}, {
    id: "hunter",
    minPlayers: 10
}, {
    id: "cupid",
    minPlayers: 12
}, {
    id: "cursed",
    minPlayers: 12
}]
  , Pf = [{
    from: Ie,
    to: "cursed"
}, {
    from: "cursed",
    to: Ie
}, {
    from: Ie,
    to: "witch"
}, {
    from: "witch",
    to: Ie
}, {
    from: Ie,
    to: "guard"
}, {
    from: "guard",
    to: Ie
}, {
    from: Ie,
    to: "hunter"
}, {
    from: "hunter",
    to: Ie
}, {
    from: Ie,
    to: Mn
}, {
    from: Mn,
    to: Ie
}];
function Lf(u) {
    return Qo.filter(h => u >= h.minPlayers).length
}
function Mf(u) {
    return Object.entries(u).reduce( (h, [a,y]) => {
        var w;
        return h + (((w = xe[a]) == null ? void 0 : w.value) || 0) * y
    }
    , 0)
}
function Of(u, {from: h, to: a}) {
    if ((u[h] || 0) <= 0 || h === Mn && u[h] <= 1)
        return !1;
    const y = xe[a];
    if (!y || (u[a] || 0) >= y.max)
        return !1;
    const w = sc(u, {
        from: h,
        to: a
    });
    return uc(w)
}
function sc(u, {from: h, to: a}) {
    const y = {
        ...u
    };
    return y[h] -= 1,
    y[h] <= 0 && delete y[h],
    y[a] = (y[a] || 0) + 1,
    y
}
function Rf(u) {
    let h = {
        ...u
    };
    for (; !uc(h); ) {
        if ((h[Mn] || 0) > 1) {
            h[Mn] -= 1,
            h[Mn] <= 0 && delete h[Mn],
            h[Ie] = (h[Ie] || 0) + 1;
            continue
        }
        const a = [...Qo].reverse().find(y => (h[y.id] || 0) > 0);
        if (!a)
            break;
        h[a.id] -= 1,
        h[a.id] <= 0 && delete h[a.id],
        h[Ie] = (h[Ie] || 0) + 1
    }
    return h
}
function zf(u) {
    var P, U;
    const h = Math.max(Il, Math.min(Al, Math.floor(u) || 0))
      , a = Lf(h);
    let y = {};
    const w = h - a
      , C = Math.max(1, Math.floor(w / 2))
      , B = Math.min(Math.max(1, Math.round(h / 3)), C, xe[Mn].max);
    y[Mn] = B;
    let _ = B;
    for (const O of Qo)
        if (!(h < O.minPlayers)) {
            if (_ >= h)
                break;
            y[O.id] = 1,
            _ += 1
        }
    _ < h && (y[Ie] = h - _);
    for (let O = 0; O < 12; O++) {
        const L = Mf(y);
        if (L >= -3 && L <= 3)
            break;
        let K = null
          , Z = Math.abs(L);
        for (const $ of Pf) {
            if (!Of(y, $))
                continue;
            const W = (((P = xe[$.to]) == null ? void 0 : P.value) || 0) - (((U = xe[$.from]) == null ? void 0 : U.value) || 0)
              , G = Math.abs(L + W);
            G < Z && (K = $,
            Z = G)
        }
        if (!K)
            break;
        y = sc(y, K)
    }
    return Rf(y)
}
const Dl = 20;
function Df({total: u}) {
    const a = (Math.max(-Dl, Math.min(Dl, u)) + Dl) / (2 * Dl) * 100;
    let y;
    return u > 3 ? y = {
        cls: "village",
        text: "Lợi cho Dân làng"
    } : u < -3 ? y = {
        cls: "werewolf",
        text: "Lợi cho Sói / Ma cà rồng"
    } : y = {
        cls: "balanced",
        text: "Cân bằng tốt"
    },
    c.jsxs("div", {
        className: "balance",
        children: [c.jsxs("div", {
            className: "balance-head",
            children: [c.jsx("span", {
                className: "muted",
                children: "Điểm cân bằng"
            }), c.jsx("span", {
                className: `balance-total ${y.cls}`,
                children: u > 0 ? `+${u}` : u
            })]
        }), c.jsxs("div", {
            className: "balance-track",
            children: [c.jsx("div", {
                className: "balance-center"
            }), c.jsx("div", {
                className: "balance-marker",
                style: {
                    left: `${a}%`
                },
                title: `Tổng: ${u}`
            })]
        }), c.jsxs("div", {
            className: "balance-legend",
            children: [c.jsx("span", {
                children: "Sói"
            }), c.jsx("span", {
                className: `verdict ${y.cls}`,
                children: y.text
            }), c.jsx("span", {
                children: "Dân làng"
            })]
        }), c.jsx("p", {
            className: "balance-hint",
            children: "Mục tiêu: tổng gần 0. Nhóm mới/lạ người nên để +1 đến +3; nhóm đã quen chơi nên để -1 đến -3 cho Sói có lợi thế."
        })]
    })
}
const Fl = ["other", "vampire", "werewolf", "village"];
function qa(u) {
    const h = Fl.indexOf(u);
    return h === -1 ? Fl.length : h
}
function If(u) {
    var a;
    const h = Object.fromEntries(Fl.map(y => [y, 0]));
    for (const [y,w] of u) {
        const C = (a = xe[y]) == null ? void 0 : a.team;
        C && C in h && (h[C] += w)
    }
    return h
}
function Af(u) {
    return [...u].sort( (h, a) => {
        var w, C;
        const y = qa((w = xe[h[0]]) == null ? void 0 : w.team) - qa((C = xe[a[0]]) == null ? void 0 : C.team);
        return y !== 0 ? y : xe[a[0]].value - xe[h[0]].value
    }
    )
}
function Ja({counts: u}) {
    const h = Fl.filter(a => u[a] > 0);
    return h.length === 0 ? null : c.jsx("div", {
        className: "setup-team-stats",
        children: h.map(a => {
            const y = on[a];
            return c.jsxs("span", {
                className: "team-tag small",
                style: {
                    "--team-color": y.color
                },
                children: [y.label, " ", u[a]]
            }, a)
        }
        )
    })
}
function Ff(u) {
    return u > 3 ? "village" : u < -3 ? "werewolf" : "balanced"
}
function Bf({selected: u, totalPlayers: h, totalValue: a, onInc: y, onDec: w, onRemove: C, onClear: B, onStart: _, onLoadSetup: P}) {
    const [U,O] = ee.useState(!1)
      , [L,K] = ee.useState("9")
      , Z = () => {
        const F = Number(L);
        if (!Number.isFinite(F) || F < Il || F > Al) {
            window.alert(`Nhập số người chơi từ ${Il} đến ${Al}.`);
            return
        }
        h > 0 && !window.confirm("Thay thế ván đấu hiện tại bằng setup gợi ý?") || P(zf(F))
    }
      , $ = Object.entries(u).filter( ([,F]) => F > 0)
      , W = Af($)
      , G = If($)
      , Y = a > 0 ? `+${a}` : String(a);
    return c.jsxs("section", {
        className: `panel setup${U ? " setup-expanded" : ""}`,
        "data-has-roles": $.length > 0 ? "true" : "false",
        children: [c.jsxs("button", {
            type: "button",
            className: "setup-dock-bar",
            onClick: () => O(F => !F),
            "aria-expanded": U,
            "aria-controls": "setup-sheet",
            children: [c.jsxs("div", {
                className: "setup-dock-info",
                children: [$.length > 0 && c.jsxs("div", {
                    className: "setup-dock-avatars",
                    "aria-hidden": "true",
                    children: [W.slice(0, 5).map( ([F,re]) => {
                        const D = xe[F]
                          , ae = on[D.team]
                          , ne = $o(F);
                        return c.jsxs("span", {
                            className: "setup-dock-avatar-wrap",
                            children: [ne ? c.jsx("img", {
                                src: ne,
                                alt: "",
                                className: "setup-dock-avatar",
                                style: {
                                    borderColor: ae.color
                                }
                            }) : c.jsx("span", {
                                className: "setup-dock-avatar setup-dock-avatar-fallback",
                                style: {
                                    background: ae.color
                                }
                            }), re > 1 && c.jsx("span", {
                                className: "setup-dock-avatar-count",
                                children: re
                            })]
                        }, F)
                    }
                    ), $.length > 5 && c.jsxs("span", {
                        className: "setup-dock-more",
                        children: ["+", $.length - 5]
                    })]
                }), c.jsx("strong", {
                    children: h
                }), c.jsx("span", {
                    children: "người chơi"
                }), $.length > 0 && c.jsx(Ja, {
                    counts: G
                })]
            }), c.jsx("span", {
                className: `setup-dock-balance ${Ff(a)}`,
                children: Y
            }), c.jsx("span", {
                className: "setup-dock-chevron",
                "aria-hidden": "true",
                children: U ? "▾" : "▴"
            })]
        }), c.jsxs("div", {
            id: "setup-sheet",
            className: "setup-sheet",
            children: [c.jsxs("div", {
                className: "panel-head",
                children: [c.jsx("h2", {
                    children: "Ván đấu"
                }), c.jsxs("span", {
                    className: "muted",
                    children: [h, " người chơi"]
                })]
            }), c.jsxs("div", {
                className: "suggest-row",
                children: [c.jsx("label", {
                    className: "suggest-label",
                    htmlFor: "suggest-count",
                    children: "Gợi ý setup"
                }), c.jsx("input", {
                    id: "suggest-count",
                    type: "number",
                    className: "suggest-input",
                    min: Il,
                    max: Al,
                    value: L,
                    onChange: F => K(F.target.value),
                    onKeyDown: F => {
                        F.key === "Enter" && Z()
                    }
                    ,
                    "aria-label": "Số người chơi cho setup gợi ý"
                }), c.jsx("span", {
                    className: "suggest-unit muted",
                    children: "người"
                }), c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small suggest-btn",
                    onClick: Z,
                    children: "Gợi ý"
                })]
            }), $.length > 0 && c.jsx(Ja, {
                counts: G
            }), c.jsx(Df, {
                total: a
            }), $.length === 0 ? c.jsx("p", {
                className: "empty",
                children: "Chưa có vai trò nào. Hãy thêm từ thư viện vai trò."
            }) : c.jsx("ul", {
                className: "selected-list",
                children: W.map( ([F,re]) => {
                    const D = xe[F]
                      , ae = on[D.team]
                      , ne = ic(F, u)
                      , Ee = $o(F);
                    return c.jsxs("li", {
                        className: "selected-item",
                        children: [Ee ? c.jsx("img", {
                            src: Ee,
                            alt: "",
                            className: "selected-role-img",
                            style: {
                                borderColor: ae.color
                            },
                            title: ae.label
                        }) : c.jsx("span", {
                            className: "team-dot",
                            style: {
                                background: ae.color
                            },
                            title: ae.label
                        }), c.jsxs("div", {
                            className: "selected-main",
                            children: [c.jsx("span", {
                                className: "selected-name",
                                children: D.name
                            }), c.jsx("span", {
                                className: `selected-value${D.value > 0 ? " pos" : D.value < 0 ? " neg" : " zero"}`,
                                children: D.value > 0 ? `+${D.value}` : D.value
                            })]
                        }), c.jsxs("div", {
                            className: "stepper",
                            children: [c.jsx("button", {
                                type: "button",
                                onClick: () => w(F),
                                "aria-label": `Giảm ${D.name}`,
                                children: "−"
                            }), c.jsxs("span", {
                                className: "stepper-count",
                                children: [re, D.max > 1 && c.jsxs("span", {
                                    className: "stepper-limit",
                                    children: ["/", D.max]
                                })]
                            }), c.jsx("button", {
                                type: "button",
                                onClick: () => y(F),
                                disabled: !ne,
                                "aria-label": `Tăng ${D.name}`,
                                title: ne ? void 0 : `Tối đa ${D.max}`,
                                children: "+"
                            })]
                        }), c.jsx("button", {
                            type: "button",
                            className: "remove-btn",
                            onClick: () => C(F),
                            "aria-label": `Xóa ${D.name}`,
                            children: "✕"
                        })]
                    }, F)
                }
                )
            })]
        }), c.jsxs("div", {
            className: "setup-actions",
            children: [c.jsxs("button", {
                type: "button",
                className: "start-btn",
                disabled: h === 0,
                onClick: _,
                children: ["Bắt đầu", h > 0 && c.jsxs("span", {
                    className: "start-btn-meta",
                    children: [h, " người"]
                })]
            }), c.jsx("button", {
                type: "button",
                className: "ghost-btn",
                disabled: $.length === 0,
                onClick: B,
                children: "Làm lại"
            })]
        })]
    })
}
const Bl = "masoi.matches"
  , ac = ["village", "werewolf", "vampire", "other"];
function $f() {
    return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
function Nr() {
    try {
        const u = localStorage.getItem(Bl);
        if (!u)
            return [];
        const h = JSON.parse(u);
        return Array.isArray(h) ? h : []
    } catch {
        return []
    }
}
function Uf(u) {
    return !u || typeof u != "object" ? {} : Object.fromEntries(Object.entries(u).filter( ([h,a]) => xe[h] && Number(a) > 0).map( ([h,a]) => [h, oc(h, Number(a))]).filter( ([,h]) => h > 0))
}
function cc(u) {
    if (!u)
        return "";
    try {
        return new Date(u).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    } catch {
        return ""
    }
}
function Hf({startedAt: u, totalPlayers: h, roles: a, notes: y={}, winner: w}) {
    const C = {
        id: $f(),
        playedAt: new Date().toISOString(),
        startedAt: u || null,
        totalPlayers: h,
        roles: {
            ...a
        },
        notes: {
            ...y
        },
        winner: w || null
    }
      , B = Nr();
    return B.unshift(C),
    localStorage.setItem(Bl, JSON.stringify(B)),
    C
}
function Vf(u) {
    const h = Nr().filter(a => a.id !== u);
    return localStorage.setItem(Bl, JSON.stringify(h)),
    h
}
function Wf(u, h) {
    const a = Nr().map(y => y.id === u ? {
        ...y,
        winner: h || null
    } : y);
    return localStorage.setItem(Bl, JSON.stringify(a)),
    a
}
const Za = [{
    id: "lang_huyet_nguyet",
    title: "Làng Huyết Nguyệt",
    paragraphs: ["Làng Huyết Nguyệt được dựng trên nền pháp trường cũ, nơi ba trăm năm trước dân làng đã thiêu một bầy sói biết nói tiếng người. Trước khi chết, con sói đầu đàn nguyền rằng đến đêm trăng đỏ, máu của nó sẽ thức dậy trong huyết quản những kẻ tưởng mình là người.", "Lời nguyền tưởng chỉ là chuyện dọa trẻ con cho đến sáng nay, khi người gác đình được tìm thấy dưới chân chuông, ngực bị xé mở nhưng cửa đình vẫn khóa từ bên trong. Trên nền tro có dấu chân người bước vào, rồi dấu chân sói bước ra. Trong sổ hộ tịch, tên của {n} người ngồi đây bị gạch bằng mực đỏ, như thể làng chỉ còn lại chừng ấy người đủ tỉnh táo để phán xét.", "Già làng đem ra những cổ vật cất dưới bàn thờ tổ: mắt kính của Tiên Tri để soi bóng sói trong linh hồn, bùa tro của Bảo Vệ để chặn một cửa tử, hai bình thuốc của Phù Thủy được nấu từ máu trăng, khẩu súng bạc của Thợ Săn, và sợi chỉ đỏ của Thần Tình Yêu vốn buộc sinh mạng hai người vào một lời thề. Không ai được chọn chức phận của mình; cổ vật tự tìm chủ khi đêm xuống.", "Từ đời tổ tiên, dân làng đã học được một điều cay đắng: ban đêm sói mạnh hơn mọi luật lệ, nhưng ban ngày chúng phải mang mặt người và chịu lời buộc tội của đám đông. Vì vậy hội đồng được lập lại. Mỗi bình minh, người sống phải tranh luận, nghi ngờ và treo lên một cái tên, trước khi trăng đỏ lấy thêm một mạng nữa."],
    hook: "Trăng đỏ trèo lên khỏi rặng tre. Các bạn nhận chức phận của mình, và đêm đầu tiên của Làng Huyết Nguyệt bắt đầu."
}, {
    id: "lang_suong_mu",
    title: "Làng Sương Mù Cuối Thung",
    paragraphs: ["Làng Sương Mù Cuối Thung nằm giữa bốn triền núi, nơi mặt trời chỉ ghé qua như một vị khách vội. Người làng tin dưới lớp sương có một con đường cổ dẫn đến hang của Thần Sói, và tổ tiên họ từng ký khế ước: đổi một phần linh hồn để được sống qua mùa đói.", "Khế ước bị lãng quên cho đến khi đoàn buôn cuối cùng quay về trong im lặng, không ai còn lưỡi để kể chuyện. Trên xe của họ có {n} chiếc mặt nạ gỗ khắc đúng mặt những người đang ngồi ở nhà hội, mặt sau mỗi chiếc đều ghi một chức phận: kẻ nhìn thấy sự thật, kẻ canh cửa, kẻ giữ thuốc, kẻ nổ phát súng cuối cùng, và những kẻ có móng vuốt dưới da.", "Đến chạng vạng, người gác cổng nhìn thấy một dân làng bước vào màn sương, rồi một con sói bước ra trong cùng chiếc áo khoác. Từ đó làng hiểu rằng sói không đến từ ngoài rừng; chúng đã ở trong làng từ lâu, chỉ chờ sương đủ dày để nhớ lại bản chất của mình.", "Những chức năng trong làng không phải phép màu ngẫu nhiên mà là phần còn lại của khế ước cổ. Tiên Tri nghe được lời thì thầm dưới sương, Bảo Vệ biết vẽ vòng muối trước cửa, Phù Thủy giữ công thức thuốc cứu và thuốc độc, Thợ Săn mang viên đạn bạc cuối cùng. Nhưng mỗi người chỉ biết phần của mình. Nếu nói ra quá sớm, sói sẽ biết nên cắn cổ ai trước."],
    hook: "Đèn dầu bị sương nuốt dần. Các bạn nhận chức phận của mình, và đêm đầu tiên bắt đầu trong tiếng chân ngoài hiên."
}, {
    id: "lang_treo_chuong",
    title: "Làng Treo Chuông Tang",
    paragraphs: ["Ở Làng Treo Chuông Tang, mỗi nhà treo một chiếc chuông trước cửa để báo người chết. Luật làng cấm rung chuông khi chưa thấy xác, vì người xưa tin tiếng chuông gọi hồn sói về từ rừng đen. Suốt bảy đêm qua, chuông tự ngân từ những căn nhà vẫn còn người sống.", "Sáng nay, dưới gốc đa giữa sân đình, dân làng đào được một hố chôn tập thể phủ đầy vải liệm mới. Trên từng mảnh vải có thêu tên của {n} người được triệu đến phiên phán xét. Trong hố còn có một tấm da sói khô, bên trong khâu đầy tóc người và móng tay người.", 'Tư tế già giải thích rằng đây là nghi thức "đổi da": sói chọn người, khoác lấy đời sống của họ, rồi ban ngày bước đi như hàng xóm, anh em, vợ chồng. Để chống lại chúng, tổ tiên lập ra Hội Chuông Tang gồm những người giữ chức phận bí mật: Tiên Tri nghe âm chuông biết ai có linh hồn méo lệch, Bảo Vệ buộc chuông câm trước cửa người sắp chết, Phù Thủy dùng tiếng chuông để cân mạng sống và mạng chết.', "Nhưng hội ấy đã tan rã nhiều đời, chỉ còn truyền thuyết. Đêm nay chuông gọi lại từng chức phận vào tay người đang sống. Ban ngày, dân làng phải tự mở phiên xử, vì khi mặt trời lên, sói không thể biến hình nhưng vẫn có thể nói dối. Mỗi lời buộc tội là một hồi chuông; mỗi phiếu treo cổ là một lần thử xem ai đang sợ ánh sáng."],
    hook: "Tiếng chuông tang thứ tám vang lên. Các bạn nhận chức phận, và ngôi làng bắt đầu tìm kẻ đang đội lốt người."
}, {
    id: "lang_lo_than",
    title: "Làng Lò Than Đen",
    paragraphs: ['Làng Lò Than Đen sống nhờ những đường hầm ăn sâu vào lòng núi. Hầm số bảy bị niêm phong từ đời cụ tổ, sau vụ sập hầm chôn sống một nhóm phu than và một con thú khổng lồ mà không ai dám gọi tên. Trên cửa hầm có khắc lời cảnh báo: "Đừng đào nơi bóng tối biết đói."', 'Mùa đông năm nay đến quá sớm, than cạn, và dân làng phá niêm phong. Bên trong không có xác người, chỉ có những vách đá bị móng vuốt rạch kín, một bộ da sói treo ngược còn ấm, và cuốn nhật ký của người thợ mỏ cuối cùng: "Nó không giết chúng tôi. Nó dạy vài người trong chúng tôi cách đói như nó."', "Từ lúc lên khỏi hầm, {n} người không còn ngủ yên. Có người nghe tiếng tim mình đập như tiếng chân chạy trên đá, có người thấy mắt hàng xóm phản sáng trong bóng tối. Thợ rèn trong làng nhận ra những dấu răng trên xác nạn nhân không thuộc về thú rừng, mà thuộc về hàm người đã bị kéo dài bởi lời nguyền.", "Để sống sót, dân làng mở lại kho di vật của những người từng xuống hầm rồi trở về: đèn soi linh hồn của Tiên Tri, áo choàng than của Bảo Vệ, thuốc đen của Phù Thủy, nỏ bạc của Thợ Săn, sách thánh của Mục sư. Những món ấy chọn người cầm chúng, nhưng quyền năng càng lớn càng khiến người đó trở thành mục tiêu. Bầy sói biết rằng nếu giết đúng người trong đêm, cả làng sẽ mù đi vào sáng hôm sau."],
    hook: "Cửa hầm bị gió đẩy kêu rền. Các bạn nhận chức phận, và bóng tối trong núi thức dậy."
}, {
    id: "lang_hoa_trang",
    title: "Làng Hoa Trắng Bên Mộ",
    paragraphs: ["Phía sau Làng Hoa Trắng là nghĩa địa cổ, nơi loài hoa không tên mọc quanh năm trên những nấm mộ không bia. Người làng tin hoa chỉ nở khi người chết còn điều chưa nói, và chỉ chuyển đỏ khi kẻ giết người vẫn đang đứng giữa đám tang.", 'Sáng nay, nghĩa địa trắng xóa như phủ tuyết. Trên mỗi nấm mộ mới nở một bông hoa có nhụy đỏ, số bông đúng bằng {n} người đang có mặt trong nhà thờ bỏ hoang. Dưới chân bàn thờ, cha xứ mất tích để lại lá thư: "Sói đã học cách quỳ gối cầu nguyện. Đừng tìm chúng ngoài rừng nữa."', "Cha xứ từng là người giữ bản phả hệ của làng. Trong thư, ông viết rằng mỗi dòng họ được giao một bổn phận để canh giữ nghĩa địa: nhà tiên kiến nhìn thấy linh hồn bị thú tính che phủ, nhà canh mộ biết đóng cửa tử trong một đêm, nhà bào chế giữ thuốc hồi sinh và thuốc kết liễu, nhà thợ săn truyền nhau viên đạn bạc, nhà tình nhân giữ lời thề rằng một cái chết có thể kéo theo một cái chết khác.", "Những chức phận ấy tồn tại vì sói không chỉ giết người; chúng phá ký ức của làng. Khi một người bị cắn, sáng hôm sau mọi bằng chứng bắt đầu mục nát, nhân chứng nghi ngờ chính mắt mình, và người chết chỉ còn nói qua hoa trắng. Vì vậy dân làng phải xử án khi mặt trời còn đủ cao, trước khi đêm xuống và sự thật bị chôn thêm một lớp đất."],
    hook: "Hương hoa ngọt đến nghẹt thở. Các bạn nhận chức phận, và nghĩa địa bắt đầu chờ tên kế tiếp."
}, {
    id: "lang_gieng_co",
    title: "Làng Giếng Cổ Không Đáy",
    paragraphs: ["Giếng cổ giữa làng bị lấp từ mười hai năm trước, sau đêm một đứa trẻ thả gàu xuống và kéo lên một bàn tay không có thân. Mùa mưa năm nay làm đất sụt xuống, để lộ miệng giếng đen ngòm như con mắt mở lại. Từ đáy giếng, người chết bắt đầu gọi tên người sống.", 'Ai trả lời tiếng gọi sẽ biến mất trước bình minh, chỉ để lại dấu chân trần vòng quanh giếng và mùi lông thú ẩm mốc. Đêm qua, thầy đồ của làng không trả lời, nhưng vẫn bị lôi đi. Trên tường nhà ông có dòng chữ cào bằng móng: "Sói không cần được mời vào nơi nó từng sinh ra."', 'Trong hầm sách của thầy đồ, dân làng tìm thấy ghi chép về một giáo phái từng thờ "con sói dưới giếng". Để chống lại nó, những người phản giáo phái đã chia nhau các chức phận: Tiên Tri nhìn xuống nước giếng để thấy bản dạng thật, Bảo Vệ đóng ấn lên cửa nhà, Phù Thủy giữ hai giọt nước giếng đã được thánh hóa, Thợ Săn canh miệng giếng bằng bạc, còn Kẻ Bị Nguyền mang trong máu lời cảnh báo rằng bất cứ ai cũng có thể bị biến đổi.', "Tên của {n} người vừa xuất hiện trên thành giếng, khắc từ bên trong đá. Điều đó nghĩa là mỗi người đã bị kéo vào nghi thức cũ, dù muốn hay không. Sói sẽ săn trong đêm vì bóng tối thuộc về chúng; dân làng sẽ phán xét ban ngày vì chỉ dưới ánh mặt trời lời nguyền mới buộc kẻ đội lốt người phải run sợ."],
    hook: "Từ đáy giếng vang lên một tiếng hú rất gần. Các bạn nhận chức phận, và không ai được phép trả lời tiếng gọi trong đêm."
}, {
    id: "lang_khach_la",
    title: "Làng Khách Lạ Sau Cổng",
    paragraphs: ["Làng Khách Lạ Sau Cổng có một luật cổ: khi bão đen kéo qua, phải mở cổng cho người trú nạn, vì tổ tiên họ từng được cứu như vậy. Nhưng bản ghi chép lâu đời nhất kể một chuyện khác: năm ấy dân làng mở cổng cho một đoàn lữ khách, và sáng hôm sau đoàn khách biến mất, còn vài người trong làng bắt đầu thèm thịt sống.", "Cơn bão đêm nay đưa {n} người vào nhà hội. Trưởng làng điểm danh đủ người, nhưng sổ khách lại tự ghi thêm một cái tên không ai đọc được. Cổng làng bị cào nát từ phía trong, nghĩa là thứ nguy hiểm không đứng ngoài xin vào; nó đã ở giữa mọi người trước khi then cửa được cài.", "Theo luật tiếp khách cổ, mỗi người trú bão phải nhận một dấu sáp từ hòm thánh tích. Dấu ấy không chỉ để ghi danh, mà để đánh thức chức phận bị chôn trong huyết thống: người thấy ác mộng thành Tiên Tri, người đứng chặn cửa thành Bảo Vệ, người biết cây độc thành Phù Thủy, người từng mất người thân thành Thợ Săn, người mang tình yêu bị nguyền thành Cupid hoặc Cặp đôi. Cả sói cũng nhận dấu, nhưng dấu của chúng nóng lên như than dưới da.", "Dân làng biết có sói vì nạn nhân đầu tiên không chết như người bị thú dữ tấn công. Xác vẫn ngồi ngay ngắn bên bàn, tay cầm bát súp, miệng còn mỉm cười với khách. Chỉ khi mặt trời rọi qua cửa sổ, bóng của cái xác trên tường mới hiện hình một con sói đang cúi ăn. Từ khoảnh khắc đó, không ai được rời làng; ban ngày phải tìm ra kẻ lạ, ban đêm phải sống sót qua cơn đói của nó."],
    hook: "Cổng làng đóng sập sau lưng. Các bạn nhận chức phận, và trong số những khuôn mặt quen thuộc có một thứ không thuộc về nơi này."
}];
function ec(u, h) {
    return u.replace(/\{n\}/g, String(h || "?"))
}
function nc(u) {
    const h = Za[Math.floor(Math.random() * Za.length)];
    return {
        id: h.id,
        title: h.title,
        paragraphs: h.paragraphs.map(a => ec(a, u)),
        hook: h.hook ? ec(h.hook, u) : null
    }
}
const Uo = "masoi.nightNotes"
  , Ho = "masoi.nightHidden";
function Kf() {
    try {
        const u = localStorage.getItem(Uo);
        if (!u)
            return {};
        const h = JSON.parse(u);
        return h && typeof h == "object" ? h : {}
    } catch {
        return {}
    }
}
function Qf() {
    try {
        const u = localStorage.getItem(Ho);
        if (!u)
            return new Set;
        const h = JSON.parse(u);
        return new Set(Array.isArray(h) ? h : [])
    } catch {
        return new Set
    }
}
function dc(u) {
    var h, a, y;
    if (u.kind === "close") {
        const w = ((h = u.role) == null ? void 0 : h.id) ?? `extra:${(a = u.extra) == null ? void 0 : a.id}`
          , C = (y = u.sub) != null && y.name ? `:sub:${u.sub.name}` : "";
        return `close:${w}${C}`
    }
    return u.kind === "sub" ? `sub:${u.role.id}:${u.sub.name}` : u.kind === "extra" ? `extra:${u.extra.id}` : `role:${u.role.id}`
}
function Vo(u) {
    return u.kind === "close" ? u.sub ? u.sub.phase : u.role ? u.role.phase : u.extra ? u.extra.phase : "every" : u.kind === "sub" ? u.sub.phase : u.kind === "extra" ? u.extra.phase : u.role.phase
}
function Gf(u) {
    if (u.kind === "close") {
        if (u.sub)
            return `sub:${u.role.id}:${u.sub.name}`;
        if (u.role)
            return `role:${u.role.id}`;
        if (u.extra)
            return `extra:${u.extra.id}`
    }
    return dc(u)
}
function bf(u) {
    return u.kind === "close" ? "Đóng mắt" : u.kind === "sub" ? u.sub.name : u.kind === "extra" ? u.extra.name : u.role.name
}
function Yf(u, h, a) {
    return !((h[u.requiresRole] || 0) <= 0 || u.minPlayers != null && a < u.minPlayers || u.maxPlayers != null && a > u.maxPlayers)
}
function Xf(u, h) {
    const a = Object.keys(u).filter(w => (u[w] || 0) > 0).map(w => xe[w]).filter(w => w.wakesAtNight).sort( (w, C) => w.nightOrder - C.nightOrder)
      , y = [];
    for (const w of a) {
        const C = w.nightOrder;
        y.push({
            sortKey: C,
            kind: "role",
            role: w
        }),
        w.scriptClose && y.push({
            sortKey: C + .01,
            kind: "close",
            role: w,
            script: w.scriptClose
        });
        for (const B of w.nightSubSteps ?? [])
            y.push({
                sortKey: C + .02,
                kind: "sub",
                role: w,
                sub: B
            }),
            B.scriptClose && y.push({
                sortKey: C + .03,
                kind: "close",
                role: w,
                sub: B,
                script: B.scriptClose
            })
    }
    for (const w of Object.values(wf))
        Yf(w, u, h) && (y.push({
            sortKey: w.nightOrder,
            kind: "extra",
            extra: w
        }),
        w.scriptClose && y.push({
            sortKey: w.nightOrder + .01,
            kind: "close",
            extra: w,
            script: w.scriptClose
        }));
    return y.sort( (w, C) => w.sortKey - C.sortKey),
    y
}
function qf(u) {
    if (u < 2)
        return null;
    const h = Array.from({
        length: u
    }, (a, y) => y + 1);
    for (let a = h.length - 1; a > 0; a--) {
        const y = Math.floor(Math.random() * (a + 1));
        [h[a],h[y]] = [h[y], h[a]]
    }
    return [h[0], h[1]].sort( (a, y) => a - y)
}
function Jf({step: u, index: h, note: a, onNoteChange: y, hidden: w, canToggle: C, onToggleVisibility: B, totalPlayers: _}) {
    var ae;
    const P = Vo(u)
      , U = bf(u);
    if (u.kind === "close")
        return w ? null : c.jsxs("li", {
            className: "step step-close",
            children: [c.jsx("span", {
                className: "step-no dim",
                children: h
            }), c.jsx("div", {
                className: "step-body",
                children: c.jsxs("p", {
                    className: "step-script",
                    children: ['"', u.script, '"']
                })
            })]
        });
    if (w && C)
        return c.jsx("li", {
            className: "step step-collapsed",
            children: c.jsxs("button", {
                type: "button",
                className: "step-reveal-btn",
                onClick: B,
                children: [c.jsx("span", {
                    className: "step-reveal-phase",
                    children: Bo[P]
                }), c.jsx("span", {
                    className: "step-reveal-name",
                    children: U
                }), c.jsx("span", {
                    className: "step-reveal-action",
                    children: "Hiện"
                })]
            })
        });
    const O = u.kind === "sub"
      , L = u.kind === "extra"
      , K = u.role
      , Z = u.sub
      , $ = u.extra
      , W = K ? on[K.team] : null
      , G = L ? $.name : O ? Z.name : K.name
      , Y = L ? $.script : O ? Z.script : K.script
      , F = L ? $.moderatorNote : O ? Z.moderatorNote : null
      , re = u.kind === "role" && (K == null ? void 0 : K.id) === "cupid"
      , D = L ? "Ghi chú cho bước này..." : `VD: ${G} — Minh, Lan...`;
    return c.jsxs("li", {
        className: `step ${O || L ? "step-sub" : ""}`,
        children: [c.jsx("span", {
            className: "step-no",
            children: h
        }), c.jsxs("div", {
            className: "step-body",
            children: [c.jsxs("div", {
                className: "step-title",
                children: [(O || L) && c.jsx("span", {
                    className: "sub-arrow",
                    children: "↳"
                }), c.jsx("span", {
                    className: "step-name",
                    children: G
                }), !O && !L && W && c.jsx("span", {
                    className: "team-tag small",
                    style: {
                        "--team-color": W.color
                    },
                    children: W.label
                }), O && Z.optional && c.jsx("span", {
                    className: "phase-tag small optional",
                    children: "Tùy chọn"
                }), c.jsx("span", {
                    className: "phase-tag small",
                    children: Bo[P]
                }), L && $.playerCondition && c.jsx("span", {
                    className: "phase-tag small condition",
                    children: $.playerCondition
                }), O && c.jsxs("span", {
                    className: "phase-tag small parent",
                    children: ["Sau ", K.name]
                }), L && c.jsxs("span", {
                    className: "phase-tag small parent",
                    children: ["Khi có ", (ae = xe[$.requiresRole]) == null ? void 0 : ae.name]
                }), C && c.jsx("button", {
                    type: "button",
                    className: "step-hide-btn",
                    onClick: B,
                    children: "Ẩn"
                })]
            }), Y && c.jsxs("p", {
                className: "step-script",
                children: ['"', Y, '"']
            }), re && c.jsxs("div", {
                className: "step-cupid-random",
                children: [c.jsxs("button", {
                    type: "button",
                    className: "ghost-btn small",
                    disabled: _ < 2,
                    onClick: () => {
                        const ne = qf(_);
                        ne && y(`Số ${ne[0]} và ${ne[1]}`)
                    }
                    ,
                    children: ["Chọn ngẫu nhiên 2 số (1–", _ || "?", ")"]
                }), _ < 2 && c.jsx("span", {
                    className: "step-cupid-random-hint",
                    children: "Cần ít nhất 2 người chơi"
                })]
            }), F && c.jsx("p", {
                className: "step-note",
                children: F
            }), c.jsxs("label", {
                className: "step-memo",
                children: [c.jsx("span", {
                    className: "step-memo-label",
                    children: "Ghi chú"
                }), c.jsx("input", {
                    type: "text",
                    className: "step-memo-input",
                    placeholder: D,
                    value: a,
                    onChange: ne => y(ne.target.value)
                })]
            })]
        })]
    })
}
function Zf({selected: u, totalPlayers: h, startedAt: a, onBack: y, onEndMatch: w}) {
    const [C,B] = ee.useState(Kf)
      , [_,P] = ee.useState(Qf)
      , [U,O] = ee.useState("")
      , [L,K] = ee.useState( () => nc(h))
      , Z = ee.useMemo( () => Xf(u, h), [u, h]);
    ee.useEffect( () => {
        localStorage.setItem(Uo, JSON.stringify(C))
    }
    , [C]),
    ee.useEffect( () => {
        localStorage.setItem(Ho, JSON.stringify([..._]))
    }
    , [_]);
    const $ = Y => {
        P(F => {
            const re = new Set(F);
            return re.has(Y) ? re.delete(Y) : re.add(Y),
            re
        }
        )
    }
      , W = (Y, F) => {
        B(re => {
            if (!F.trim()) {
                const D = {
                    ...re
                };
                return delete D[Y],
                D
            }
            return {
                ...re,
                [Y]: F
            }
        }
        )
    }
      , G = () => {
        if (!U) {
            window.alert("Hãy chọn phe thắng trước khi lưu.");
            return
        }
        window.confirm("Kết thúc trận và lưu vào lịch sử? Ghi chú ban đêm của ván này cũng sẽ được lưu.") && (Hf({
            startedAt: a,
            totalPlayers: h,
            roles: u,
            notes: C,
            winner: U
        }),
        localStorage.removeItem(Uo),
        localStorage.removeItem(Ho),
        B({}),
        P(new Set),
        w())
    }
    ;
    return c.jsxs("section", {
        className: "panel call-order",
        children: [c.jsxs("div", {
            className: "panel-head",
            children: [c.jsx("h2", {
                children: "Thứ tự gọi ban đêm"
            }), c.jsx("button", {
                className: "ghost-btn small",
                onClick: y,
                children: "Quay lại"
            })]
        }), c.jsxs("div", {
            className: "game-opening",
            children: [c.jsxs("div", {
                className: "game-opening-head",
                children: [c.jsx("span", {
                    className: "game-opening-label",
                    children: "Cốt truyện làng"
                }), c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: () => K(nc(h)),
                    children: "Câu chuyện khác"
                })]
            }), c.jsx("h3", {
                className: "game-opening-title",
                children: L.title
            }), c.jsxs("div", {
                className: "game-opening-body",
                children: [L.paragraphs.map( (Y, F) => c.jsx("p", {
                    children: Y
                }, F)), L.hook && c.jsx("p", {
                    className: "game-opening-hook",
                    children: c.jsx("em", {
                        children: L.hook
                    })
                })]
            }), c.jsx("p", {
                className: "game-opening-hint muted",
                children: "Đọc to cho cả bàn nghe trước khi chia vai — như mở đầu một phiên DnD."
            })]
        }), c.jsxs("p", {
            className: "call-intro",
            children: ["Đọc to: ", c.jsx("em", {
                children: '"Đã khuya rồi, mọi người hãy nhắm mắt lại và đi ngủ."'
            }), " ", "Sau đó gọi lần lượt các vai trò theo thứ tự dưới đây.", " ", "Bấm ", c.jsx("strong", {
                children: "Ẩn"
            }), " ở các bước không phải mỗi đêm khi sang đêm khác.", " ", "Dùng ô ", c.jsx("strong", {
                children: "Ghi chú"
            }), " để ghi tên người chơi hoặc nhắc việc cần làm.", h > 0 && c.jsxs(c.Fragment, {
                children: [" ", "Ván hiện tại: ", c.jsxs("strong", {
                    children: [h, " người chơi"]
                }), "."]
            })]
        }), Z.length === 0 ? c.jsx("p", {
            className: "empty",
            children: "Không có vai trò nào cần gọi ban đêm trong ván này."
        }) : c.jsx("ol", {
            className: "steps",
            children: ( () => {
                let Y = 0;
                return Z.map(F => {
                    const re = dc(F)
                      , D = Gf(F)
                      , ae = _.has(D)
                      , ne = F.kind !== "close" && Vo(F) !== "every" && Vo(F) !== "fromNight2";
                    if (F.kind === "close" && ae)
                        return null;
                    const Ee = ae && ne ? null : ++Y;
                    return c.jsx(Jf, {
                        step: F,
                        index: Ee,
                        note: C[re] || "",
                        onNoteChange: Be => W(re, Be),
                        hidden: ae,
                        canToggle: ne,
                        onToggleVisibility: () => $(D),
                        totalPlayers: h
                    }, re)
                }
                )
            }
            )()
        }), c.jsxs("p", {
            className: "call-outro",
            children: ["Khi xong, đọc to: ", c.jsx("em", {
                children: '"Trời sáng rồi, mọi người hãy thức dậy!"'
            })]
        }), c.jsxs("div", {
            className: "call-footer",
            children: [c.jsxs("div", {
                className: "winner-pick",
                children: [c.jsx("span", {
                    className: "winner-pick-label",
                    children: "Phe thắng"
                }), c.jsx("div", {
                    className: "winner-pick-options",
                    children: ac.map(Y => {
                        const F = on[Y];
                        return c.jsx("button", {
                            type: "button",
                            className: `winner-btn${U === Y ? " active" : ""}`,
                            style: {
                                "--team-color": F.color
                            },
                            onClick: () => O(Y),
                            children: F.label
                        }, Y)
                    }
                    )
                })]
            }), c.jsx("button", {
                type: "button",
                className: "end-match-btn",
                onClick: G,
                disabled: !U,
                children: "Kết thúc trận và lưu lại"
            })]
        })]
    })
}
var eh = lc();
function nh() {
    return c.jsx("svg", {
        className: "history-header-icon",
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": "true",
        children: c.jsx("path", {
            d: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        })
    })
}
function th({match: u, onLoad: h, onDelete: a, onChangeWinner: y}) {
    const [w,C] = ee.useState(!1)
      , B = u.winner ? on[u.winner] : null
      , _ = Object.entries(u.roles || {}).filter( ([,P]) => P > 0).map( ([P,U]) => {
        var L;
        const O = ((L = xe[P]) == null ? void 0 : L.name) || P;
        return U > 1 ? `${O} ×${U}` : O
    }
    ).join(", ");
    return c.jsxs("li", {
        className: "history-item",
        children: [c.jsxs("div", {
            className: "history-item-main",
            children: [c.jsxs("div", {
                className: "history-item-head",
                children: [c.jsx("time", {
                    className: "history-item-date",
                    children: cc(u.playedAt)
                }), c.jsxs("span", {
                    className: "history-item-players",
                    children: [u.totalPlayers, " người"]
                })]
            }), w ? c.jsxs("div", {
                className: "history-winner-edit",
                children: [ac.map(P => {
                    const U = on[P];
                    return c.jsx("button", {
                        type: "button",
                        className: `winner-btn small${u.winner === P ? " active" : ""}`,
                        style: {
                            "--team-color": U.color
                        },
                        onClick: () => {
                            y(u.id, P),
                            C(!1)
                        }
                        ,
                        children: U.label
                    }, P)
                }
                ), c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: () => C(!1),
                    children: "Hủy"
                })]
            }) : c.jsxs("button", {
                type: "button",
                className: "history-winner-btn",
                onClick: () => C(!0),
                title: "Bấm để đổi phe thắng",
                children: [B ? c.jsxs("span", {
                    className: "team-tag small history-winner",
                    style: {
                        "--team-color": B.color
                    },
                    children: [B.label, " thắng"]
                }) : c.jsx("span", {
                    className: "history-winner unknown",
                    children: "Chưa ghi phe thắng"
                }), c.jsx("span", {
                    className: "history-winner-edit-hint",
                    "aria-hidden": "true",
                    children: "✎"
                })]
            }), _ && c.jsx("p", {
                className: "history-item-roles muted",
                children: _
            })]
        }), c.jsxs("div", {
            className: "history-item-actions",
            children: [c.jsx("button", {
                type: "button",
                className: "ghost-btn small history-load-btn",
                onClick: () => h(u),
                children: "Dùng lại"
            }), c.jsx("button", {
                type: "button",
                className: "ghost-btn small danger history-delete-btn",
                onClick: () => a(u),
                children: "Xóa"
            })]
        })]
    })
}
function rh({hasCurrentSetup: u, onLoadSetup: h}) {
    const [a,y] = ee.useState(!1)
      , [w,C] = ee.useState( () => Nr())
      , B = w.length;
    ee.useEffect( () => {
        a && C(Nr())
    }
    , [a]),
    ee.useEffect( () => {
        if (!a)
            return;
        const O = L => {
            L.key === "Escape" && y(!1)
        }
        ;
        return document.body.style.overflow = "hidden",
        window.addEventListener("keydown", O),
        () => {
            document.body.style.overflow = "",
            window.removeEventListener("keydown", O)
        }
    }
    , [a]);
    const _ = O => {
        const L = Uf(O.roles);
        if (Object.keys(L).length === 0) {
            window.alert("Không thể tải ván này — vai trò không còn hợp lệ.");
            return
        }
        u && !window.confirm("Thay thế ván đấu hiện tại bằng ván từ lịch sử?") || (h(L),
        y(!1))
    }
      , P = O => {
        window.confirm(`Xóa ván ${cc(O.playedAt)} (${O.totalPlayers} người) khỏi lịch sử?`) && C(Vf(O.id))
    }
      , U = (O, L) => {
        C(Wf(O, L))
    }
    ;
    return c.jsxs("div", {
        className: `match-history${a ? " open" : ""}`,
        children: [c.jsxs("button", {
            type: "button",
            className: "history-header-btn",
            onClick: () => y(O => !O),
            "aria-expanded": a,
            "aria-controls": "match-history-panel",
            "aria-label": `Lịch sử ván, ${B} trận đã lưu`,
            children: [c.jsx(nh, {}), c.jsx("span", {
                className: "history-header-label",
                children: "Lịch sử"
            }), B > 0 && c.jsx("span", {
                className: "history-header-badge",
                children: B
            })]
        }), a && eh.createPortal(c.jsxs(c.Fragment, {
            children: [c.jsx("button", {
                type: "button",
                className: "history-backdrop",
                "aria-label": "Đóng lịch sử",
                onClick: () => y(!1)
            }), c.jsxs("div", {
                id: "match-history-panel",
                className: "history-panel",
                role: "dialog",
                "aria-label": "Lịch sử ván",
                children: [c.jsxs("div", {
                    className: "history-panel-head",
                    children: [c.jsx("h2", {
                        children: "Lịch sử ván"
                    }), c.jsx("button", {
                        type: "button",
                        className: "ghost-btn small history-close-btn",
                        onClick: () => y(!1),
                        children: "Đóng"
                    })]
                }), w.length === 0 ? c.jsx("p", {
                    className: "empty history-empty",
                    children: "Chưa có trận nào được lưu. Kết thúc ván để thêm vào lịch sử."
                }) : c.jsx("ul", {
                    className: "history-list",
                    children: w.map(O => c.jsx(th, {
                        match: O,
                        onLoad: _,
                        onDelete: P,
                        onChangeWinner: U
                    }, O.id))
                })]
            })]
        }), document.body)]
    })
}
const lh = [{
    label: "30s",
    seconds: 30
}, {
    label: "1p",
    seconds: 60
}, {
    label: "2p",
    seconds: 120
}, {
    label: "5p",
    seconds: 300
}]
  , ih = 6e3;
function oh() {
    try {
        const u = window.AudioContext || window.webkitAudioContext;
        if (!u)
            return;
        const h = new u;
        for (let a = 0; a < 3; a++) {
            const y = h.createOscillator()
              , w = h.createGain();
            y.type = "sine",
            y.frequency.value = 880;
            const C = h.currentTime + a * .45;
            w.gain.setValueAtTime(1e-4, C),
            w.gain.exponentialRampToValueAtTime(.4, C + .02),
            w.gain.exponentialRampToValueAtTime(1e-4, C + .35),
            y.connect(w),
            w.connect(h.destination),
            y.start(C),
            y.stop(C + .4)
        }
        setTimeout( () => h.close(), 2e3)
    } catch {}
}
function tc(u) {
    const h = Math.max(0, Math.ceil(u / 1e3))
      , a = Math.floor(h / 60)
      , y = h % 60;
    return `${a}:${String(y).padStart(2, "0")}`
}
function uh() {
    return c.jsx("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": "true",
        children: c.jsx("path", {
            d: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        })
    })
}
function sh() {
    const [u,h] = ee.useState(!1)
      , [a,y] = ee.useState(60)
      , [w,C] = ee.useState("")
      , [B,_] = ee.useState(60 * 1e3)
      , [P,U] = ee.useState(!1)
      , [O,L] = ee.useState(!1)
      , K = ee.useRef(null)
      , Z = ee.useRef(null);
    ee.useEffect( () => {
        if (!P)
            return;
        const D = () => {
            const ne = K.current - Date.now();
            ne <= 0 ? (_(0),
            U(!1),
            L(!0),
            oh(),
            clearTimeout(Z.current),
            Z.current = setTimeout( () => L(!1), ih)) : _(ne)
        }
          , ae = setInterval(D, 200);
        return D(),
        () => clearInterval(ae)
    }
    , [P]),
    ee.useEffect( () => () => clearTimeout(Z.current), []);
    const $ = D => {
        clearTimeout(Z.current),
        L(!1),
        y(D),
        K.current = Date.now() + D * 1e3,
        _(D * 1e3),
        U(!0)
    }
      , W = () => {
        _(Math.max(0, K.current - Date.now())),
        U(!1)
    }
      , G = () => {
        B <= 0 || (K.current = Date.now() + B,
        U(!0))
    }
      , Y = () => {
        clearTimeout(Z.current),
        L(!1),
        U(!1),
        _(a * 1e3)
    }
      , F = () => {
        const D = Number(w);
        if (!Number.isFinite(D) || D <= 0 || D > 60) {
            window.alert("Nhập số phút từ 1 đến 60.");
            return
        }
        $(Math.round(D * 60))
    }
      , re = P || B < a * 1e3;
    return c.jsxs("div", {
        className: `discussion-timer${u ? " open" : ""}${O ? " finished" : ""}`,
        children: [u && c.jsxs("div", {
            className: "timer-panel",
            role: "dialog",
            "aria-label": "Hẹn giờ",
            children: [c.jsx("div", {
                className: "timer-display",
                "aria-live": "polite",
                children: tc(B)
            }), c.jsx("div", {
                className: "timer-presets",
                children: lh.map(D => c.jsx("button", {
                    type: "button",
                    className: `ghost-btn small${a === D.seconds ? " active" : ""}`,
                    onClick: () => $(D.seconds),
                    children: D.label
                }, D.seconds))
            }), c.jsxs("div", {
                className: "timer-custom",
                children: [c.jsx("input", {
                    type: "number",
                    className: "timer-custom-input",
                    min: "1",
                    max: "60",
                    placeholder: "Phút",
                    value: w,
                    onChange: D => C(D.target.value),
                    onKeyDown: D => {
                        D.key === "Enter" && F()
                    }
                    ,
                    "aria-label": "Số phút tùy chọn"
                }), c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: F,
                    children: "Bắt đầu"
                })]
            }), c.jsxs("div", {
                className: "timer-controls",
                children: [P ? c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: W,
                    children: "Tạm dừng"
                }) : c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: G,
                    disabled: B <= 0 || !re,
                    children: "Tiếp tục"
                }), c.jsx("button", {
                    type: "button",
                    className: "ghost-btn small",
                    onClick: Y,
                    children: "Đặt lại"
                })]
            })]
        }), c.jsxs("button", {
            type: "button",
            className: "timer-toggle-btn",
            onClick: () => h(D => !D),
            "aria-expanded": u,
            "aria-label": "Hẹn giờ thảo luận",
            children: [c.jsx(uh, {}), (P || O) && c.jsx("span", {
                className: "timer-toggle-time",
                children: tc(B)
            })]
        })]
    })
}
const fc = "masoi.setup";
function ah() {
    try {
        const u = localStorage.getItem(fc);
        if (!u)
            return {};
        const h = JSON.parse(u);
        return Object.fromEntries(Object.entries(h).filter( ([a,y]) => xe[a] && Number(y) > 0).map( ([a,y]) => [a, oc(a, Number(y))]).filter( ([,a]) => a > 0))
    } catch {
        return {}
    }
}
function ch() {
    const [u,h] = ee.useState(ah)
      , [a,y] = ee.useState(!1)
      , [w,C] = ee.useState(null);
    ee.useEffect( () => {
        localStorage.setItem(fc, JSON.stringify(u))
    }
    , [u]);
    const B = $ => h(W => ic($, W) ? {
        ...W,
        [$]: (W[$] || 0) + 1
    } : W)
      , _ = B
      , P = $ => h(W => {
        const G = (W[$] || 0) - 1
          , Y = {
            ...W
        };
        return G <= 0 ? delete Y[$] : Y[$] = G,
        Y
    }
    )
      , U = $ => h(W => {
        const G = {
            ...W
        };
        return delete G[$],
        G
    }
    )
      , O = () => h({})
      , L = $ => h($)
      , K = ee.useMemo( () => Object.values(u).reduce( ($, W) => $ + W, 0), [u])
      , Z = ee.useMemo( () => Object.entries(u).reduce( ($, [W,G]) => {
        var Y;
        return $ + (((Y = xe[W]) == null ? void 0 : Y.value) || 0) * G
    }
    , 0), [u]);
    return c.jsxs("div", {
        className: "app",
        children: [c.jsxs("header", {
            className: "app-header",
            children: [c.jsxs("div", {
                className: "brand",
                children: [c.jsx("img", {
                    src: "/wolf.svg",
                    alt: "",
                    className: "brand-icon"
                }), c.jsxs("div", {
                    className: "brand-text",
                    children: [c.jsx("h1", {
                        children: "Quản Trò Ma Sói"
                    }), c.jsx("p", {
                        className: "muted",
                        children: "Công cụ sắp ván & gọi vai trò"
                    })]
                })]
            }), !a && c.jsx(rh, {
                hasCurrentSetup: K > 0,
                onLoadSetup: L
            })]
        }), a ? c.jsxs("main", {
            className: "app-main single",
            children: [c.jsx(Zf, {
                selected: u,
                totalPlayers: K,
                startedAt: w,
                onBack: () => {
                    y(!1),
                    C(null)
                }
                ,
                onEndMatch: () => {
                    y(!1),
                    C(null)
                }
            }), c.jsx(sh, {})]
        }) : c.jsxs("main", {
            className: "app-main",
            children: [c.jsx(Cf, {
                selected: u,
                onAdd: B
            }), c.jsx(Bf, {
                selected: u,
                totalPlayers: K,
                totalValue: Z,
                onInc: _,
                onDec: P,
                onRemove: U,
                onClear: O,
                onLoadSetup: L,
                onStart: () => {
                    C(new Date().toISOString()),
                    y(!0)
                }
            })]
        }), c.jsx("footer", {
            className: "app-footer muted",
            children: "Điểm cân bằng dựa trên giá trị nhân vật của Ultimate Werewolf."
        })]
    })
}
kf.createRoot(document.getElementById("root")).render(c.jsx(hf.StrictMode, {
    children: c.jsx(ch, {})
}));
