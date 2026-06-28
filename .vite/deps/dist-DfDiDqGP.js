import { i as __require, t as __commonJSMin } from "./chunk-Cf1989ZW.js";
//#region node_modules/jssha/dist/sha.js
var require_sha = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A JavaScript implementation of the SHA family of hashes - defined in FIPS PUB 180-4, FIPS PUB 202,
	* and SP 800-185 - as well as the corresponding HMAC implementation as defined in FIPS PUB 198-1.
	*
	* Copyright 2008-2020 Brian Turek, 1998-2009 Paul Johnston & Contributors
	* Distributed under the BSD License
	* See http://caligatio.github.com/jsSHA/ for more information
	*
	* Two ECMAScript polyfill functions carry the following license:
	*
	* Copyright (c) Microsoft Corporation. All rights reserved.
	* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
	* the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
	*
	* THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
	* INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	* MERCHANTABLITY OR NON-INFRINGEMENT.
	*
	* See the Apache Version 2.0 License for specific language governing permissions and limitations under the License.
	*/
	(function(n, r) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = r() : "function" == typeof define && define.amd ? define(r) : (n = "undefined" != typeof globalThis ? globalThis : n || self).jsSHA = r();
	})(exports, (function() {
		"use strict";
		var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		function r(n, r, t, e) {
			var i, o, u, f = r || [0], w = (t = t || 0) >>> 3, s = -1 === e ? 3 : 0;
			for (i = 0; i < n.length; i += 1) o = (u = i + w) >>> 2, f.length <= o && f.push(0), f[o] |= n[i] << 8 * (s + e * (u % 4));
			return {
				value: f,
				binLen: 8 * n.length + t
			};
		}
		function t(t, e, i) {
			switch (e) {
				case "UTF8":
				case "UTF16BE":
				case "UTF16LE": break;
				default: throw new Error("encoding must be UTF8, UTF16BE, or UTF16LE");
			}
			switch (t) {
				case "HEX": return function(n, r, t) {
					return function(n, r, t, e) {
						var i, o, u, f;
						if (0 != n.length % 2) throw new Error("String of HEX type must be in byte increments");
						var w = r || [0], s = (t = t || 0) >>> 3, a = -1 === e ? 3 : 0;
						for (i = 0; i < n.length; i += 2) {
							if (o = parseInt(n.substr(i, 2), 16), isNaN(o)) throw new Error("String of HEX type contains invalid characters");
							for (u = (f = (i >>> 1) + s) >>> 2; w.length <= u;) w.push(0);
							w[u] |= o << 8 * (a + e * (f % 4));
						}
						return {
							value: w,
							binLen: 4 * n.length + t
						};
					}(n, r, t, i);
				};
				case "TEXT": return function(n, r, t) {
					return function(n, r, t, e, i) {
						var o, u, f, w, s, a, h, c, v = 0, A = t || [0], E = (e = e || 0) >>> 3;
						if ("UTF8" === r) for (h = -1 === i ? 3 : 0, f = 0; f < n.length; f += 1) for (u = [], 128 > (o = n.charCodeAt(f)) ? u.push(o) : 2048 > o ? (u.push(192 | o >>> 6), u.push(128 | 63 & o)) : 55296 > o || 57344 <= o ? u.push(224 | o >>> 12, 128 | o >>> 6 & 63, 128 | 63 & o) : (f += 1, o = 65536 + ((1023 & o) << 10 | 1023 & n.charCodeAt(f)), u.push(240 | o >>> 18, 128 | o >>> 12 & 63, 128 | o >>> 6 & 63, 128 | 63 & o)), w = 0; w < u.length; w += 1) {
							for (s = (a = v + E) >>> 2; A.length <= s;) A.push(0);
							A[s] |= u[w] << 8 * (h + i * (a % 4)), v += 1;
						}
						else for (h = -1 === i ? 2 : 0, c = "UTF16LE" === r && 1 !== i || "UTF16LE" !== r && 1 === i, f = 0; f < n.length; f += 1) {
							for (o = n.charCodeAt(f), !0 === c && (o = (w = 255 & o) << 8 | o >>> 8), s = (a = v + E) >>> 2; A.length <= s;) A.push(0);
							A[s] |= o << 8 * (h + i * (a % 4)), v += 2;
						}
						return {
							value: A,
							binLen: 8 * v + e
						};
					}(n, e, r, t, i);
				};
				case "B64": return function(r, t, e) {
					return function(r, t, e, i) {
						var o, u, f, w, s, a, h = 0, c = t || [0], v = (e = e || 0) >>> 3, A = -1 === i ? 3 : 0, E = r.indexOf("=");
						if (-1 === r.search(/^[a-zA-Z0-9=+/]+$/)) throw new Error("Invalid character in base-64 string");
						if (r = r.replace(/=/g, ""), -1 !== E && E < r.length) throw new Error("Invalid '=' found in base-64 string");
						for (o = 0; o < r.length; o += 4) {
							for (w = r.substr(o, 4), f = 0, u = 0; u < w.length; u += 1) f |= n.indexOf(w.charAt(u)) << 18 - 6 * u;
							for (u = 0; u < w.length - 1; u += 1) {
								for (s = (a = h + v) >>> 2; c.length <= s;) c.push(0);
								c[s] |= (f >>> 16 - 8 * u & 255) << 8 * (A + i * (a % 4)), h += 1;
							}
						}
						return {
							value: c,
							binLen: 8 * h + e
						};
					}(r, t, e, i);
				};
				case "BYTES": return function(n, r, t) {
					return function(n, r, t, e) {
						var i, o, u, f, w = r || [0], s = (t = t || 0) >>> 3, a = -1 === e ? 3 : 0;
						for (o = 0; o < n.length; o += 1) i = n.charCodeAt(o), u = (f = o + s) >>> 2, w.length <= u && w.push(0), w[u] |= i << 8 * (a + e * (f % 4));
						return {
							value: w,
							binLen: 8 * n.length + t
						};
					}(n, r, t, i);
				};
				case "ARRAYBUFFER": return function(n, t, e) {
					return function(n, t, e, i) {
						return r(new Uint8Array(n), t, e, i);
					}(n, t, e, i);
				};
				case "UINT8ARRAY":
					try {
						new Uint8Array(0);
					} catch (n) {
						throw new Error("UINT8ARRAY not supported by this environment");
					}
					return function(n, t, e) {
						return r(n, t, e, i);
					};
				default: throw new Error("format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY");
			}
		}
		function e(r, t, e, i) {
			switch (r) {
				case "HEX": return function(n) {
					return function(n, r, t, e) {
						var i, o, u = "", f = r / 8, w = -1 === t ? 3 : 0;
						for (i = 0; i < f; i += 1) o = n[i >>> 2] >>> 8 * (w + t * (i % 4)), u += "0123456789abcdef".charAt(o >>> 4 & 15) + "0123456789abcdef".charAt(15 & o);
						return e.outputUpper ? u.toUpperCase() : u;
					}(n, t, e, i);
				};
				case "B64": return function(r) {
					return function(r, t, e, i) {
						var o, u, f, w, s, a = "", h = t / 8, c = -1 === e ? 3 : 0;
						for (o = 0; o < h; o += 3) for (w = o + 1 < h ? r[o + 1 >>> 2] : 0, s = o + 2 < h ? r[o + 2 >>> 2] : 0, f = (r[o >>> 2] >>> 8 * (c + e * (o % 4)) & 255) << 16 | (w >>> 8 * (c + e * ((o + 1) % 4)) & 255) << 8 | s >>> 8 * (c + e * ((o + 2) % 4)) & 255, u = 0; u < 4; u += 1) a += 8 * o + 6 * u <= t ? n.charAt(f >>> 6 * (3 - u) & 63) : i.b64Pad;
						return a;
					}(r, t, e, i);
				};
				case "BYTES": return function(n) {
					return function(n, r, t) {
						var e, i, o = "", u = r / 8, f = -1 === t ? 3 : 0;
						for (e = 0; e < u; e += 1) i = n[e >>> 2] >>> 8 * (f + t * (e % 4)) & 255, o += String.fromCharCode(i);
						return o;
					}(n, t, e);
				};
				case "ARRAYBUFFER": return function(n) {
					return function(n, r, t) {
						var e, i = r / 8, o = new ArrayBuffer(i), u = new Uint8Array(o), f = -1 === t ? 3 : 0;
						for (e = 0; e < i; e += 1) u[e] = n[e >>> 2] >>> 8 * (f + t * (e % 4)) & 255;
						return o;
					}(n, t, e);
				};
				case "UINT8ARRAY":
					try {
						new Uint8Array(0);
					} catch (n) {
						throw new Error("UINT8ARRAY not supported by this environment");
					}
					return function(n) {
						return function(n, r, t) {
							var e, i = r / 8, o = -1 === t ? 3 : 0, u = new Uint8Array(i);
							for (e = 0; e < i; e += 1) u[e] = n[e >>> 2] >>> 8 * (o + t * (e % 4)) & 255;
							return u;
						}(n, t, e);
					};
				default: throw new Error("format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY");
			}
		}
		var i = [
			1116352408,
			1899447441,
			3049323471,
			3921009573,
			961987163,
			1508970993,
			2453635748,
			2870763221,
			3624381080,
			310598401,
			607225278,
			1426881987,
			1925078388,
			2162078206,
			2614888103,
			3248222580,
			3835390401,
			4022224774,
			264347078,
			604807628,
			770255983,
			1249150122,
			1555081692,
			1996064986,
			2554220882,
			2821834349,
			2952996808,
			3210313671,
			3336571891,
			3584528711,
			113926993,
			338241895,
			666307205,
			773529912,
			1294757372,
			1396182291,
			1695183700,
			1986661051,
			2177026350,
			2456956037,
			2730485921,
			2820302411,
			3259730800,
			3345764771,
			3516065817,
			3600352804,
			4094571909,
			275423344,
			430227734,
			506948616,
			659060556,
			883997877,
			958139571,
			1322822218,
			1537002063,
			1747873779,
			1955562222,
			2024104815,
			2227730452,
			2361852424,
			2428436474,
			2756734187,
			3204031479,
			3329325298
		], o = [
			3238371032,
			914150663,
			812702999,
			4144912697,
			4290775857,
			1750603025,
			1694076839,
			3204075428
		], u = [
			1779033703,
			3144134277,
			1013904242,
			2773480762,
			1359893119,
			2600822924,
			528734635,
			1541459225
		], f = "Chosen SHA variant is not supported";
		function w(n, r) {
			var t, e, i = n.binLen >>> 3, o = r.binLen >>> 3, u = i << 3, f = 4 - i << 3;
			if (i % 4 != 0) {
				for (t = 0; t < o; t += 4) e = i + t >>> 2, n.value[e] |= r.value[t >>> 2] << u, n.value.push(0), n.value[e + 1] |= r.value[t >>> 2] >>> f;
				return (n.value.length << 2) - 4 >= o + i && n.value.pop(), {
					value: n.value,
					binLen: n.binLen + r.binLen
				};
			}
			return {
				value: n.value.concat(r.value),
				binLen: n.binLen + r.binLen
			};
		}
		function s(n) {
			var r = {
				outputUpper: !1,
				b64Pad: "=",
				outputLen: -1
			}, t = n || {}, e = "Output length must be a multiple of 8";
			if (r.outputUpper = t.outputUpper || !1, t.b64Pad && (r.b64Pad = t.b64Pad), t.outputLen) {
				if (t.outputLen % 8 != 0) throw new Error(e);
				r.outputLen = t.outputLen;
			} else if (t.shakeLen) {
				if (t.shakeLen % 8 != 0) throw new Error(e);
				r.outputLen = t.shakeLen;
			}
			if ("boolean" != typeof r.outputUpper) throw new Error("Invalid outputUpper formatting option");
			if ("string" != typeof r.b64Pad) throw new Error("Invalid b64Pad formatting option");
			return r;
		}
		function a(n, r, e, i) {
			var o = n + " must include a value and format";
			if (!r) {
				if (!i) throw new Error(o);
				return i;
			}
			if (void 0 === r.value || !r.format) throw new Error(o);
			return t(r.format, r.encoding || "UTF8", e)(r.value);
		}
		var h = function() {
			function n(n, r, t) {
				var e = t || {};
				if (this.t = r, this.i = e.encoding || "UTF8", this.numRounds = e.numRounds || 1, isNaN(this.numRounds) || this.numRounds !== parseInt(this.numRounds, 10) || 1 > this.numRounds) throw new Error("numRounds must a integer >= 1");
				this.o = n, this.u = [], this.s = 0, this.h = !1, this.v = 0, this.A = !1, this.l = [], this.H = [];
			}
			return n.prototype.update = function(n) {
				var r, t = 0, e = this.S >>> 5, i = this.p(n, this.u, this.s), o = i.binLen, u = i.value, f = o >>> 5;
				for (r = 0; r < f; r += e) t + this.S <= o && (this.m = this.R(u.slice(r, r + e), this.m), t += this.S);
				this.v += t, this.u = u.slice(t >>> 5), this.s = o % this.S, this.h = !0;
			}, n.prototype.getHash = function(n, r) {
				var t, i, o = this.U, u = s(r);
				if (this.T) {
					if (-1 === u.outputLen) throw new Error("Output length must be specified in options");
					o = u.outputLen;
				}
				var f = e(n, o, this.C, u);
				if (this.A && this.F) return f(this.F(u));
				for (i = this.K(this.u.slice(), this.s, this.v, this.B(this.m), o), t = 1; t < this.numRounds; t += 1) this.T && o % 32 != 0 && (i[i.length - 1] &= 16777215 >>> 24 - o % 32), i = this.K(i, o, 0, this.L(this.o), o);
				return f(i);
			}, n.prototype.setHMACKey = function(n, r, e) {
				if (!this.g) throw new Error("Variant does not support HMAC");
				if (this.h) throw new Error("Cannot set MAC key after calling update");
				var i = t(r, (e || {}).encoding || "UTF8", this.C);
				this.k(i(n));
			}, n.prototype.k = function(n) {
				var r, t = this.S >>> 3, e = t / 4 - 1;
				if (1 !== this.numRounds) throw new Error("Cannot set numRounds with MAC");
				if (this.A) throw new Error("MAC key already set");
				for (t < n.binLen / 8 && (n.value = this.K(n.value, n.binLen, 0, this.L(this.o), this.U)); n.value.length <= e;) n.value.push(0);
				for (r = 0; r <= e; r += 1) this.l[r] = 909522486 ^ n.value[r], this.H[r] = 1549556828 ^ n.value[r];
				this.m = this.R(this.l, this.m), this.v = this.S, this.A = !0;
			}, n.prototype.getHMAC = function(n, r) {
				var t = s(r);
				return e(n, this.U, this.C, t)(this.Y());
			}, n.prototype.Y = function() {
				var n;
				if (!this.A) throw new Error("Cannot call getHMAC without first setting MAC key");
				var r = this.K(this.u.slice(), this.s, this.v, this.B(this.m), this.U);
				return n = this.R(this.H, this.L(this.o)), n = this.K(r, this.U, this.S, n, this.U);
			}, n;
		}(), c = function(n, r) {
			return (c = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
				n.__proto__ = r;
			} || function(n, r) {
				for (var t in r) Object.prototype.hasOwnProperty.call(r, t) && (n[t] = r[t]);
			})(n, r);
		};
		function v(n, r) {
			function t() {
				this.constructor = n;
			}
			c(n, r), n.prototype = null === r ? Object.create(r) : (t.prototype = r.prototype, new t());
		}
		function A(n, r) {
			return n << r | n >>> 32 - r;
		}
		function E(n, r) {
			return n >>> r | n << 32 - r;
		}
		function l(n, r) {
			return n >>> r;
		}
		function b(n, r, t) {
			return n ^ r ^ t;
		}
		function H(n, r, t) {
			return n & r ^ ~n & t;
		}
		function d(n, r, t) {
			return n & r ^ n & t ^ r & t;
		}
		function S(n) {
			return E(n, 2) ^ E(n, 13) ^ E(n, 22);
		}
		function p(n, r) {
			var t = (65535 & n) + (65535 & r);
			return (65535 & (n >>> 16) + (r >>> 16) + (t >>> 16)) << 16 | 65535 & t;
		}
		function m(n, r, t, e) {
			var i = (65535 & n) + (65535 & r) + (65535 & t) + (65535 & e);
			return (65535 & (n >>> 16) + (r >>> 16) + (t >>> 16) + (e >>> 16) + (i >>> 16)) << 16 | 65535 & i;
		}
		function y(n, r, t, e, i) {
			var o = (65535 & n) + (65535 & r) + (65535 & t) + (65535 & e) + (65535 & i);
			return (65535 & (n >>> 16) + (r >>> 16) + (t >>> 16) + (e >>> 16) + (i >>> 16) + (o >>> 16)) << 16 | 65535 & o;
		}
		function R(n) {
			return E(n, 7) ^ E(n, 18) ^ l(n, 3);
		}
		function U(n) {
			return E(n, 6) ^ E(n, 11) ^ E(n, 25);
		}
		function T(n) {
			return [
				1732584193,
				4023233417,
				2562383102,
				271733878,
				3285377520
			];
		}
		function C(n, r) {
			var t, e, i, o, u, f, w, s = [];
			for (t = r[0], e = r[1], i = r[2], o = r[3], u = r[4], w = 0; w < 80; w += 1) s[w] = w < 16 ? n[w] : A(s[w - 3] ^ s[w - 8] ^ s[w - 14] ^ s[w - 16], 1), f = w < 20 ? y(A(t, 5), H(e, i, o), u, 1518500249, s[w]) : w < 40 ? y(A(t, 5), b(e, i, o), u, 1859775393, s[w]) : w < 60 ? y(A(t, 5), d(e, i, o), u, 2400959708, s[w]) : y(A(t, 5), b(e, i, o), u, 3395469782, s[w]), u = o, o = i, i = A(e, 30), e = t, t = f;
			return r[0] = p(t, r[0]), r[1] = p(e, r[1]), r[2] = p(i, r[2]), r[3] = p(o, r[3]), r[4] = p(u, r[4]), r;
		}
		function F(n, r, t, e) {
			for (var i, o = 15 + (r + 65 >>> 9 << 4), u = r + t; n.length <= o;) n.push(0);
			for (n[r >>> 5] |= 128 << 24 - r % 32, n[o] = 4294967295 & u, n[o - 1] = u / 4294967296 | 0, i = 0; i < n.length; i += 16) e = C(n.slice(i, i + 16), e);
			return e;
		}
		var K = function(n) {
			function r(r, e, i) {
				var o = this;
				if ("SHA-1" !== r) throw new Error(f);
				var u = i || {};
				return (o = n.call(this, r, e, i) || this).g = !0, o.F = o.Y, o.C = -1, o.p = t(o.t, o.i, o.C), o.R = C, o.B = function(n) {
					return n.slice();
				}, o.L = T, o.K = F, o.m = [
					1732584193,
					4023233417,
					2562383102,
					271733878,
					3285377520
				], o.S = 512, o.U = 160, o.T = !1, u.hmacKey && o.k(a("hmacKey", u.hmacKey, o.C)), o;
			}
			return v(r, n), r;
		}(h);
		function B(n) {
			return "SHA-224" == n ? o.slice() : u.slice();
		}
		function L(n, r) {
			var t, e, o, u, f, w, s, a, h, c, v, A, b = [];
			for (t = r[0], e = r[1], o = r[2], u = r[3], f = r[4], w = r[5], s = r[6], a = r[7], v = 0; v < 64; v += 1) b[v] = v < 16 ? n[v] : m(E(A = b[v - 2], 17) ^ E(A, 19) ^ l(A, 10), b[v - 7], R(b[v - 15]), b[v - 16]), h = y(a, U(f), H(f, w, s), i[v], b[v]), c = p(S(t), d(t, e, o)), a = s, s = w, w = f, f = p(u, h), u = o, o = e, e = t, t = p(h, c);
			return r[0] = p(t, r[0]), r[1] = p(e, r[1]), r[2] = p(o, r[2]), r[3] = p(u, r[3]), r[4] = p(f, r[4]), r[5] = p(w, r[5]), r[6] = p(s, r[6]), r[7] = p(a, r[7]), r;
		}
		var g = function(n) {
			function r(r, e, i) {
				var o = this;
				if ("SHA-224" !== r && "SHA-256" !== r) throw new Error(f);
				var u = i || {};
				return (o = n.call(this, r, e, i) || this).F = o.Y, o.g = !0, o.C = -1, o.p = t(o.t, o.i, o.C), o.R = L, o.B = function(n) {
					return n.slice();
				}, o.L = B, o.K = function(n, t, e, i) {
					return function(n, r, t, e, i) {
						for (var o, u = 15 + (r + 65 >>> 9 << 4), f = r + t; n.length <= u;) n.push(0);
						for (n[r >>> 5] |= 128 << 24 - r % 32, n[u] = 4294967295 & f, n[u - 1] = f / 4294967296 | 0, o = 0; o < n.length; o += 16) e = L(n.slice(o, o + 16), e);
						return "SHA-224" === i ? [
							e[0],
							e[1],
							e[2],
							e[3],
							e[4],
							e[5],
							e[6]
						] : e;
					}(n, t, e, i, r);
				}, o.m = B(r), o.S = 512, o.U = "SHA-224" === r ? 224 : 256, o.T = !1, u.hmacKey && o.k(a("hmacKey", u.hmacKey, o.C)), o;
			}
			return v(r, n), r;
		}(h), k = function(n, r) {
			this.N = n, this.I = r;
		};
		function Y(n, r) {
			var t;
			return r > 32 ? (t = 64 - r, new k(n.I << r | n.N >>> t, n.N << r | n.I >>> t)) : 0 !== r ? (t = 32 - r, new k(n.N << r | n.I >>> t, n.I << r | n.N >>> t)) : n;
		}
		function N(n, r) {
			var t;
			return r < 32 ? (t = 32 - r, new k(n.N >>> r | n.I << t, n.I >>> r | n.N << t)) : (t = 64 - r, new k(n.I >>> r | n.N << t, n.N >>> r | n.I << t));
		}
		function I(n, r) {
			return new k(n.N >>> r, n.I >>> r | n.N << 32 - r);
		}
		function M(n, r, t) {
			return new k(n.N & r.N ^ ~n.N & t.N, n.I & r.I ^ ~n.I & t.I);
		}
		function X(n, r, t) {
			return new k(n.N & r.N ^ n.N & t.N ^ r.N & t.N, n.I & r.I ^ n.I & t.I ^ r.I & t.I);
		}
		function z(n) {
			var r = N(n, 28), t = N(n, 34), e = N(n, 39);
			return new k(r.N ^ t.N ^ e.N, r.I ^ t.I ^ e.I);
		}
		function O(n, r) {
			var t = (65535 & n.I) + (65535 & r.I), e;
			var i = (65535 & (e = (n.I >>> 16) + (r.I >>> 16) + (t >>> 16))) << 16 | 65535 & t;
			return t = (65535 & n.N) + (65535 & r.N) + (e >>> 16), e = (n.N >>> 16) + (r.N >>> 16) + (t >>> 16), new k((65535 & e) << 16 | 65535 & t, i);
		}
		function j(n, r, t, e) {
			var i = (65535 & n.I) + (65535 & r.I) + (65535 & t.I) + (65535 & e.I), o;
			var u = (65535 & (o = (n.I >>> 16) + (r.I >>> 16) + (t.I >>> 16) + (e.I >>> 16) + (i >>> 16))) << 16 | 65535 & i;
			return i = (65535 & n.N) + (65535 & r.N) + (65535 & t.N) + (65535 & e.N) + (o >>> 16), o = (n.N >>> 16) + (r.N >>> 16) + (t.N >>> 16) + (e.N >>> 16) + (i >>> 16), new k((65535 & o) << 16 | 65535 & i, u);
		}
		function _(n, r, t, e, i) {
			var o = (65535 & n.I) + (65535 & r.I) + (65535 & t.I) + (65535 & e.I) + (65535 & i.I), u;
			var f = (65535 & (u = (n.I >>> 16) + (r.I >>> 16) + (t.I >>> 16) + (e.I >>> 16) + (i.I >>> 16) + (o >>> 16))) << 16 | 65535 & o;
			return o = (65535 & n.N) + (65535 & r.N) + (65535 & t.N) + (65535 & e.N) + (65535 & i.N) + (u >>> 16), u = (n.N >>> 16) + (r.N >>> 16) + (t.N >>> 16) + (e.N >>> 16) + (i.N >>> 16) + (o >>> 16), new k((65535 & u) << 16 | 65535 & o, f);
		}
		function P(n, r) {
			return new k(n.N ^ r.N, n.I ^ r.I);
		}
		function x(n) {
			var r = N(n, 1), t = N(n, 8), e = I(n, 7);
			return new k(r.N ^ t.N ^ e.N, r.I ^ t.I ^ e.I);
		}
		function V(n) {
			var r = N(n, 14), t = N(n, 18), e = N(n, 41);
			return new k(r.N ^ t.N ^ e.N, r.I ^ t.I ^ e.I);
		}
		var Z = [
			new k(i[0], 3609767458),
			new k(i[1], 602891725),
			new k(i[2], 3964484399),
			new k(i[3], 2173295548),
			new k(i[4], 4081628472),
			new k(i[5], 3053834265),
			new k(i[6], 2937671579),
			new k(i[7], 3664609560),
			new k(i[8], 2734883394),
			new k(i[9], 1164996542),
			new k(i[10], 1323610764),
			new k(i[11], 3590304994),
			new k(i[12], 4068182383),
			new k(i[13], 991336113),
			new k(i[14], 633803317),
			new k(i[15], 3479774868),
			new k(i[16], 2666613458),
			new k(i[17], 944711139),
			new k(i[18], 2341262773),
			new k(i[19], 2007800933),
			new k(i[20], 1495990901),
			new k(i[21], 1856431235),
			new k(i[22], 3175218132),
			new k(i[23], 2198950837),
			new k(i[24], 3999719339),
			new k(i[25], 766784016),
			new k(i[26], 2566594879),
			new k(i[27], 3203337956),
			new k(i[28], 1034457026),
			new k(i[29], 2466948901),
			new k(i[30], 3758326383),
			new k(i[31], 168717936),
			new k(i[32], 1188179964),
			new k(i[33], 1546045734),
			new k(i[34], 1522805485),
			new k(i[35], 2643833823),
			new k(i[36], 2343527390),
			new k(i[37], 1014477480),
			new k(i[38], 1206759142),
			new k(i[39], 344077627),
			new k(i[40], 1290863460),
			new k(i[41], 3158454273),
			new k(i[42], 3505952657),
			new k(i[43], 106217008),
			new k(i[44], 3606008344),
			new k(i[45], 1432725776),
			new k(i[46], 1467031594),
			new k(i[47], 851169720),
			new k(i[48], 3100823752),
			new k(i[49], 1363258195),
			new k(i[50], 3750685593),
			new k(i[51], 3785050280),
			new k(i[52], 3318307427),
			new k(i[53], 3812723403),
			new k(i[54], 2003034995),
			new k(i[55], 3602036899),
			new k(i[56], 1575990012),
			new k(i[57], 1125592928),
			new k(i[58], 2716904306),
			new k(i[59], 442776044),
			new k(i[60], 593698344),
			new k(i[61], 3733110249),
			new k(i[62], 2999351573),
			new k(i[63], 3815920427),
			new k(3391569614, 3928383900),
			new k(3515267271, 566280711),
			new k(3940187606, 3454069534),
			new k(4118630271, 4000239992),
			new k(116418474, 1914138554),
			new k(174292421, 2731055270),
			new k(289380356, 3203993006),
			new k(460393269, 320620315),
			new k(685471733, 587496836),
			new k(852142971, 1086792851),
			new k(1017036298, 365543100),
			new k(1126000580, 2618297676),
			new k(1288033470, 3409855158),
			new k(1501505948, 4234509866),
			new k(1607167915, 987167468),
			new k(1816402316, 1246189591)
		];
		function q(n) {
			return "SHA-384" === n ? [
				new k(3418070365, o[0]),
				new k(1654270250, o[1]),
				new k(2438529370, o[2]),
				new k(355462360, o[3]),
				new k(1731405415, o[4]),
				new k(41048885895, o[5]),
				new k(3675008525, o[6]),
				new k(1203062813, o[7])
			] : [
				new k(u[0], 4089235720),
				new k(u[1], 2227873595),
				new k(u[2], 4271175723),
				new k(u[3], 1595750129),
				new k(u[4], 2917565137),
				new k(u[5], 725511199),
				new k(u[6], 4215389547),
				new k(u[7], 327033209)
			];
		}
		function D(n, r) {
			var t, e, i, o, u, f, w, s, a, h, c, v, A, E, l, b, H = [];
			for (t = r[0], e = r[1], i = r[2], o = r[3], u = r[4], f = r[5], w = r[6], s = r[7], c = 0; c < 80; c += 1) c < 16 ? (v = 2 * c, H[c] = new k(n[v], n[v + 1])) : H[c] = j((A = H[c - 2], E = void 0, l = void 0, b = void 0, E = N(A, 19), l = N(A, 61), b = I(A, 6), new k(E.N ^ l.N ^ b.N, E.I ^ l.I ^ b.I)), H[c - 7], x(H[c - 15]), H[c - 16]), a = _(s, V(u), M(u, f, w), Z[c], H[c]), h = O(z(t), X(t, e, i)), s = w, w = f, f = u, u = O(o, a), o = i, i = e, e = t, t = O(a, h);
			return r[0] = O(t, r[0]), r[1] = O(e, r[1]), r[2] = O(i, r[2]), r[3] = O(o, r[3]), r[4] = O(u, r[4]), r[5] = O(f, r[5]), r[6] = O(w, r[6]), r[7] = O(s, r[7]), r;
		}
		var G = function(n) {
			function r(r, e, i) {
				var o = this;
				if ("SHA-384" !== r && "SHA-512" !== r) throw new Error(f);
				var u = i || {};
				return (o = n.call(this, r, e, i) || this).F = o.Y, o.g = !0, o.C = -1, o.p = t(o.t, o.i, o.C), o.R = D, o.B = function(n) {
					return n.slice();
				}, o.L = q, o.K = function(n, t, e, i) {
					return function(n, r, t, e, i) {
						for (var o, u = 31 + (r + 129 >>> 10 << 5), f = r + t; n.length <= u;) n.push(0);
						for (n[r >>> 5] |= 128 << 24 - r % 32, n[u] = 4294967295 & f, n[u - 1] = f / 4294967296 | 0, o = 0; o < n.length; o += 32) e = D(n.slice(o, o + 32), e);
						return "SHA-384" === i ? [
							(e = e)[0].N,
							e[0].I,
							e[1].N,
							e[1].I,
							e[2].N,
							e[2].I,
							e[3].N,
							e[3].I,
							e[4].N,
							e[4].I,
							e[5].N,
							e[5].I
						] : [
							e[0].N,
							e[0].I,
							e[1].N,
							e[1].I,
							e[2].N,
							e[2].I,
							e[3].N,
							e[3].I,
							e[4].N,
							e[4].I,
							e[5].N,
							e[5].I,
							e[6].N,
							e[6].I,
							e[7].N,
							e[7].I
						];
					}(n, t, e, i, r);
				}, o.m = q(r), o.S = 1024, o.U = "SHA-384" === r ? 384 : 512, o.T = !1, u.hmacKey && o.k(a("hmacKey", u.hmacKey, o.C)), o;
			}
			return v(r, n), r;
		}(h), J = [
			new k(0, 1),
			new k(0, 32898),
			new k(2147483648, 32906),
			new k(2147483648, 2147516416),
			new k(0, 32907),
			new k(0, 2147483649),
			new k(2147483648, 2147516545),
			new k(2147483648, 32777),
			new k(0, 138),
			new k(0, 136),
			new k(0, 2147516425),
			new k(0, 2147483658),
			new k(0, 2147516555),
			new k(2147483648, 139),
			new k(2147483648, 32905),
			new k(2147483648, 32771),
			new k(2147483648, 32770),
			new k(2147483648, 128),
			new k(0, 32778),
			new k(2147483648, 2147483658),
			new k(2147483648, 2147516545),
			new k(2147483648, 32896),
			new k(0, 2147483649),
			new k(2147483648, 2147516424)
		], Q = [
			[
				0,
				36,
				3,
				41,
				18
			],
			[
				1,
				44,
				10,
				45,
				2
			],
			[
				62,
				6,
				43,
				15,
				61
			],
			[
				28,
				55,
				25,
				21,
				56
			],
			[
				27,
				20,
				39,
				8,
				14
			]
		];
		function W(n) {
			var r, t = [];
			for (r = 0; r < 5; r += 1) t[r] = [
				new k(0, 0),
				new k(0, 0),
				new k(0, 0),
				new k(0, 0),
				new k(0, 0)
			];
			return t;
		}
		function $(n) {
			var r, t = [];
			for (r = 0; r < 5; r += 1) t[r] = n[r].slice();
			return t;
		}
		function nn(n, r) {
			var t, e, i, o, u, f, w, s, a, h = [], c = [];
			if (null !== n) for (e = 0; e < n.length; e += 2) r[(e >>> 1) % 5][(e >>> 1) / 5 | 0] = P(r[(e >>> 1) % 5][(e >>> 1) / 5 | 0], new k(n[e + 1], n[e]));
			for (t = 0; t < 24; t += 1) {
				for (o = W(), e = 0; e < 5; e += 1) h[e] = (u = r[e][0], f = r[e][1], w = r[e][2], s = r[e][3], a = r[e][4], new k(u.N ^ f.N ^ w.N ^ s.N ^ a.N, u.I ^ f.I ^ w.I ^ s.I ^ a.I));
				for (e = 0; e < 5; e += 1) c[e] = P(h[(e + 4) % 5], Y(h[(e + 1) % 5], 1));
				for (e = 0; e < 5; e += 1) for (i = 0; i < 5; i += 1) r[e][i] = P(r[e][i], c[e]);
				for (e = 0; e < 5; e += 1) for (i = 0; i < 5; i += 1) o[i][(2 * e + 3 * i) % 5] = Y(r[e][i], Q[e][i]);
				for (e = 0; e < 5; e += 1) for (i = 0; i < 5; i += 1) r[e][i] = P(o[e][i], new k(~o[(e + 1) % 5][i].N & o[(e + 2) % 5][i].N, ~o[(e + 1) % 5][i].I & o[(e + 2) % 5][i].I));
				r[0][0] = P(r[0][0], J[t]);
			}
			return r;
		}
		function rn(n) {
			var r, t, e = 0, i = [0, 0], o = [4294967295 & n, n / 4294967296 & 2097151];
			for (r = 6; r >= 0; r--) 0 === (t = o[r >> 2] >>> 8 * r & 255) && 0 === e || (i[e + 1 >> 2] |= t << 8 * (e + 1), e += 1);
			return e = 0 !== e ? e : 1, i[0] |= e, {
				value: e + 1 > 4 ? i : [i[0]],
				binLen: 8 + 8 * e
			};
		}
		function tn(n) {
			return w(rn(n.binLen), n);
		}
		function en(n, r) {
			var t, e = rn(r), i = r >>> 2, o = (i - (e = w(e, n)).value.length % i) % i;
			for (t = 0; t < o; t++) e.value.push(0);
			return e.value;
		}
		var on = function(n) {
			function r(r, e, i) {
				var o = this, u = 6, w = 0, s = i || {};
				if (1 !== (o = n.call(this, r, e, i) || this).numRounds) {
					if (s.kmacKey || s.hmacKey) throw new Error("Cannot set numRounds with MAC");
					if ("CSHAKE128" === o.o || "CSHAKE256" === o.o) throw new Error("Cannot set numRounds for CSHAKE variants");
				}
				switch (o.C = 1, o.p = t(o.t, o.i, o.C), o.R = nn, o.B = $, o.L = W, o.m = W(), o.T = !1, r) {
					case "SHA3-224":
						o.S = w = 1152, o.U = 224, o.g = !0, o.F = o.Y;
						break;
					case "SHA3-256":
						o.S = w = 1088, o.U = 256, o.g = !0, o.F = o.Y;
						break;
					case "SHA3-384":
						o.S = w = 832, o.U = 384, o.g = !0, o.F = o.Y;
						break;
					case "SHA3-512":
						o.S = w = 576, o.U = 512, o.g = !0, o.F = o.Y;
						break;
					case "SHAKE128":
						u = 31, o.S = w = 1344, o.U = -1, o.T = !0, o.g = !1, o.F = null;
						break;
					case "SHAKE256":
						u = 31, o.S = w = 1088, o.U = -1, o.T = !0, o.g = !1, o.F = null;
						break;
					case "KMAC128":
						u = 4, o.S = w = 1344, o.M(i), o.U = -1, o.T = !0, o.g = !1, o.F = o.X;
						break;
					case "KMAC256":
						u = 4, o.S = w = 1088, o.M(i), o.U = -1, o.T = !0, o.g = !1, o.F = o.X;
						break;
					case "CSHAKE128":
						o.S = w = 1344, u = o.O(i), o.U = -1, o.T = !0, o.g = !1, o.F = null;
						break;
					case "CSHAKE256":
						o.S = w = 1088, u = o.O(i), o.U = -1, o.T = !0, o.g = !1, o.F = null;
						break;
					default: throw new Error(f);
				}
				return o.K = function(n, r, t, e, i) {
					return function(n, r, t, e, i, o, u) {
						var f, w, s = 0, a = [], h = i >>> 5, c = r >>> 5;
						for (f = 0; f < c && r >= i; f += h) e = nn(n.slice(f, f + h), e), r -= i;
						for (n = n.slice(f), r %= i; n.length < h;) n.push(0);
						for (n[(f = r >>> 3) >> 2] ^= o << f % 4 * 8, n[h - 1] ^= 2147483648, e = nn(n, e); 32 * a.length < u && (w = e[s % 5][s / 5 | 0], a.push(w.I), !(32 * a.length >= u));) a.push(w.N), 0 == 64 * (s += 1) % i && (nn(null, e), s = 0);
						return a;
					}(n, r, 0, e, w, u, i);
				}, s.hmacKey && o.k(a("hmacKey", s.hmacKey, o.C)), o;
			}
			return v(r, n), r.prototype.O = function(n, r) {
				var t = function(n) {
					var r = n || {};
					return {
						funcName: a("funcName", r.funcName, 1, {
							value: [],
							binLen: 0
						}),
						customization: a("Customization", r.customization, 1, {
							value: [],
							binLen: 0
						})
					};
				}(n || {});
				r && (t.funcName = r);
				var e = w(tn(t.funcName), tn(t.customization));
				if (0 !== t.customization.binLen || 0 !== t.funcName.binLen) {
					for (var i = en(e, this.S >>> 3), o = 0; o < i.length; o += this.S >>> 5) this.m = this.R(i.slice(o, o + (this.S >>> 5)), this.m), this.v += this.S;
					return 4;
				}
				return 31;
			}, r.prototype.M = function(n) {
				var r = function(n) {
					var r = n || {};
					return {
						kmacKey: a("kmacKey", r.kmacKey, 1),
						funcName: {
							value: [1128353099],
							binLen: 32
						},
						customization: a("Customization", r.customization, 1, {
							value: [],
							binLen: 0
						})
					};
				}(n || {});
				this.O(n, r.funcName);
				for (var t = en(tn(r.kmacKey), this.S >>> 3), e = 0; e < t.length; e += this.S >>> 5) this.m = this.R(t.slice(e, e + (this.S >>> 5)), this.m), this.v += this.S;
				this.A = !0;
			}, r.prototype.X = function(n) {
				var r = w({
					value: this.u.slice(),
					binLen: this.s
				}, function(n) {
					var r, t, e = 0, i = [0, 0], o = [4294967295 & n, n / 4294967296 & 2097151];
					for (r = 6; r >= 0; r--) 0 == (t = o[r >> 2] >>> 8 * r & 255) && 0 === e || (i[e >> 2] |= t << 8 * e, e += 1);
					return i[(e = 0 !== e ? e : 1) >> 2] |= e << 8 * e, {
						value: e + 1 > 4 ? i : [i[0]],
						binLen: 8 + 8 * e
					};
				}(n.outputLen));
				return this.K(r.value, r.binLen, this.v, this.B(this.m), n.outputLen);
			}, r;
		}(h);
		return function() {
			function n(n, r, t) {
				if ("SHA-1" == n) this.j = new K(n, r, t);
				else if ("SHA-224" == n || "SHA-256" == n) this.j = new g(n, r, t);
				else if ("SHA-384" == n || "SHA-512" == n) this.j = new G(n, r, t);
				else {
					if ("SHA3-224" != n && "SHA3-256" != n && "SHA3-384" != n && "SHA3-512" != n && "SHAKE128" != n && "SHAKE256" != n && "CSHAKE128" != n && "CSHAKE256" != n && "KMAC128" != n && "KMAC256" != n) throw new Error(f);
					this.j = new on(n, r, t);
				}
			}
			return n.prototype.update = function(n) {
				this.j.update(n);
			}, n.prototype.getHash = function(n, r) {
				return this.j.getHash(n, r);
			}, n.prototype.setHMACKey = function(n, r, t) {
				this.j.setHMACKey(n, r, t);
			}, n.prototype.getHMAC = function(n, r) {
				return this.j.getHMAC(n, r);
			}, n;
		}();
	}));
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser/getSecureRandom.js
var require_getSecureRandom$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSecureRandomWords = exports.getSecureRandomBytes = void 0;
	function getSecureRandomBytes(size) {
		return Buffer.from(window.crypto.getRandomValues(new Uint8Array(size)));
	}
	exports.getSecureRandomBytes = getSecureRandomBytes;
	function getSecureRandomWords(size) {
		return window.crypto.getRandomValues(new Uint16Array(size));
	}
	exports.getSecureRandomWords = getSecureRandomWords;
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser/hmac_sha512.js
var require_hmac_sha512$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac_sha512 = void 0;
	async function hmac_sha512(key, data) {
		let keyBuffer = typeof key === "string" ? Buffer.from(key, "utf-8") : key;
		let dataBuffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
		const hmacAlgo = {
			name: "HMAC",
			hash: "SHA-512"
		};
		const hmacKey = await window.crypto.subtle.importKey("raw", keyBuffer, hmacAlgo, false, ["sign"]);
		return Buffer.from(await crypto.subtle.sign(hmacAlgo, hmacKey, dataBuffer));
	}
	exports.hmac_sha512 = hmac_sha512;
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser/pbkdf2_sha512.js
var require_pbkdf2_sha512$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pbkdf2_sha512 = void 0;
	async function pbkdf2_sha512(key, salt, iterations, keyLen) {
		const keyBuffer = typeof key === "string" ? Buffer.from(key, "utf-8") : key;
		const saltBuffer = typeof salt === "string" ? Buffer.from(salt, "utf-8") : salt;
		const pbkdf2_key = await window.crypto.subtle.importKey("raw", keyBuffer, { name: "PBKDF2" }, false, ["deriveBits"]);
		const derivedBits = await window.crypto.subtle.deriveBits({
			name: "PBKDF2",
			hash: "SHA-512",
			salt: saltBuffer,
			iterations
		}, pbkdf2_key, keyLen * 8);
		return Buffer.from(derivedBits);
	}
	exports.pbkdf2_sha512 = pbkdf2_sha512;
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser/sha256.js
var require_sha256$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha256 = void 0;
	async function sha256(source) {
		if (typeof source === "string") return Buffer.from(await crypto.subtle.digest("SHA-256", Buffer.from(source, "utf-8")));
		return Buffer.from(await crypto.subtle.digest("SHA-256", source));
	}
	exports.sha256 = sha256;
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser/sha512.js
var require_sha512$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512 = void 0;
	async function sha512(source) {
		if (typeof source === "string") return Buffer.from(await crypto.subtle.digest("SHA-512", Buffer.from(source, "utf-8")));
		return Buffer.from(await crypto.subtle.digest("SHA-512", source));
	}
	exports.sha512 = sha512;
}));
//#endregion
//#region node_modules/@ton/crypto-primitives/dist/browser.js
var require_browser = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512 = exports.sha256 = exports.pbkdf2_sha512 = exports.hmac_sha512 = exports.getSecureRandomWords = exports.getSecureRandomBytes = void 0;
	var getSecureRandom_1 = require_getSecureRandom$1();
	Object.defineProperty(exports, "getSecureRandomBytes", {
		enumerable: true,
		get: function() {
			return getSecureRandom_1.getSecureRandomBytes;
		}
	});
	Object.defineProperty(exports, "getSecureRandomWords", {
		enumerable: true,
		get: function() {
			return getSecureRandom_1.getSecureRandomWords;
		}
	});
	var hmac_sha512_1 = require_hmac_sha512$1();
	Object.defineProperty(exports, "hmac_sha512", {
		enumerable: true,
		get: function() {
			return hmac_sha512_1.hmac_sha512;
		}
	});
	var pbkdf2_sha512_1 = require_pbkdf2_sha512$1();
	Object.defineProperty(exports, "pbkdf2_sha512", {
		enumerable: true,
		get: function() {
			return pbkdf2_sha512_1.pbkdf2_sha512;
		}
	});
	var sha256_1 = require_sha256$1();
	Object.defineProperty(exports, "sha256", {
		enumerable: true,
		get: function() {
			return sha256_1.sha256;
		}
	});
	var sha512_1 = require_sha512$1();
	Object.defineProperty(exports, "sha512", {
		enumerable: true,
		get: function() {
			return sha512_1.sha512;
		}
	});
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/sha256.js
var require_sha256 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha256 = exports.sha256_fallback = exports.sha256_sync = void 0;
	var jssha_1 = __importDefault(require_sha());
	var crypto_primitives_1 = require_browser();
	function sha256_sync(source) {
		let src;
		if (typeof source === "string") src = Buffer.from(source, "utf-8").toString("hex");
		else src = source.toString("hex");
		let hasher = new jssha_1.default("SHA-256", "HEX");
		hasher.update(src);
		let res = hasher.getHash("HEX");
		return Buffer.from(res, "hex");
	}
	exports.sha256_sync = sha256_sync;
	async function sha256_fallback(source) {
		return sha256_sync(source);
	}
	exports.sha256_fallback = sha256_fallback;
	function sha256(source) {
		return (0, crypto_primitives_1.sha256)(source);
	}
	exports.sha256 = sha256;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/sha512.js
var require_sha512 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512 = exports.sha512_fallback = exports.sha512_sync = void 0;
	var jssha_1 = __importDefault(require_sha());
	var crypto_primitives_1 = require_browser();
	function sha512_sync(source) {
		let src;
		if (typeof source === "string") src = Buffer.from(source, "utf-8").toString("hex");
		else src = source.toString("hex");
		let hasher = new jssha_1.default("SHA-512", "HEX");
		hasher.update(src);
		let res = hasher.getHash("HEX");
		return Buffer.from(res, "hex");
	}
	exports.sha512_sync = sha512_sync;
	async function sha512_fallback(source) {
		return sha512_sync(source);
	}
	exports.sha512_fallback = sha512_fallback;
	async function sha512(source) {
		return (0, crypto_primitives_1.sha512)(source);
	}
	exports.sha512 = sha512;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/pbkdf2_sha512.js
var require_pbkdf2_sha512 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pbkdf2_sha512 = void 0;
	var crypto_primitives_1 = require_browser();
	function pbkdf2_sha512(key, salt, iterations, keyLen) {
		return (0, crypto_primitives_1.pbkdf2_sha512)(key, salt, iterations, keyLen);
	}
	exports.pbkdf2_sha512 = pbkdf2_sha512;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/hmac_sha512.js
var require_hmac_sha512 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac_sha512 = exports.hmac_sha512_fallback = void 0;
	var jssha_1 = __importDefault(require_sha());
	var crypto_primitives_1 = require_browser();
	async function hmac_sha512_fallback(key, data) {
		let keyBuffer = typeof key === "string" ? Buffer.from(key, "utf-8") : key;
		let dataBuffer = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
		const shaObj = new jssha_1.default("SHA-512", "HEX", { hmacKey: {
			value: keyBuffer.toString("hex"),
			format: "HEX"
		} });
		shaObj.update(dataBuffer.toString("hex"));
		const hmac = shaObj.getHash("HEX");
		return Buffer.from(hmac, "hex");
	}
	exports.hmac_sha512_fallback = hmac_sha512_fallback;
	function hmac_sha512(key, data) {
		return (0, crypto_primitives_1.hmac_sha512)(key, data);
	}
	exports.hmac_sha512 = hmac_sha512;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/getSecureRandom.js
var require_getSecureRandom = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSecureRandomNumber = exports.getSecureRandomWords = exports.getSecureRandomBytes = void 0;
	var crypto_primitives_1 = require_browser();
	async function getSecureRandomBytes(size) {
		return (0, crypto_primitives_1.getSecureRandomBytes)(size);
	}
	exports.getSecureRandomBytes = getSecureRandomBytes;
	async function getSecureRandomWords(size) {
		return getSecureRandomWords(size);
	}
	exports.getSecureRandomWords = getSecureRandomWords;
	async function getSecureRandomNumber(min, max) {
		let range = max - min;
		var bitsNeeded = Math.ceil(Math.log2(range));
		if (bitsNeeded > 53) throw new Error("Range is too large");
		var bytesNeeded = Math.ceil(bitsNeeded / 8);
		var mask = Math.pow(2, bitsNeeded) - 1;
		while (true) {
			let res = await getSecureRandomBytes(bitsNeeded);
			let power = (bytesNeeded - 1) * 8;
			let numberValue = 0;
			for (var i = 0; i < bytesNeeded; i++) {
				numberValue += res[i] * Math.pow(2, power);
				power -= 8;
			}
			numberValue = numberValue & mask;
			if (numberValue >= range) continue;
			return min + numberValue;
		}
	}
	exports.getSecureRandomNumber = getSecureRandomNumber;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/passwords/wordlist.js
var require_wordlist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wordlist = void 0;
	exports.wordlist = [
		"abacus",
		"abdomen",
		"abdominal",
		"abide",
		"abiding",
		"ability",
		"ablaze",
		"able",
		"abnormal",
		"abrasion",
		"abrasive",
		"abreast",
		"abridge",
		"abroad",
		"abruptly",
		"absence",
		"absentee",
		"absently",
		"absinthe",
		"absolute",
		"absolve",
		"abstain",
		"abstract",
		"absurd",
		"accent",
		"acclaim",
		"acclimate",
		"accompany",
		"account",
		"accuracy",
		"accurate",
		"accustom",
		"acetone",
		"achiness",
		"aching",
		"acid",
		"acorn",
		"acquaint",
		"acquire",
		"acre",
		"acrobat",
		"acronym",
		"acting",
		"action",
		"activate",
		"activator",
		"active",
		"activism",
		"activist",
		"activity",
		"actress",
		"acts",
		"acutely",
		"acuteness",
		"aeration",
		"aerobics",
		"aerosol",
		"aerospace",
		"afar",
		"affair",
		"affected",
		"affecting",
		"affection",
		"affidavit",
		"affiliate",
		"affirm",
		"affix",
		"afflicted",
		"affluent",
		"afford",
		"affront",
		"aflame",
		"afloat",
		"aflutter",
		"afoot",
		"afraid",
		"afterglow",
		"afterlife",
		"aftermath",
		"aftermost",
		"afternoon",
		"aged",
		"ageless",
		"agency",
		"agenda",
		"agent",
		"aggregate",
		"aghast",
		"agile",
		"agility",
		"aging",
		"agnostic",
		"agonize",
		"agonizing",
		"agony",
		"agreeable",
		"agreeably",
		"agreed",
		"agreeing",
		"agreement",
		"aground",
		"ahead",
		"ahoy",
		"aide",
		"aids",
		"aim",
		"ajar",
		"alabaster",
		"alarm",
		"albatross",
		"album",
		"alfalfa",
		"algebra",
		"algorithm",
		"alias",
		"alibi",
		"alienable",
		"alienate",
		"aliens",
		"alike",
		"alive",
		"alkaline",
		"alkalize",
		"almanac",
		"almighty",
		"almost",
		"aloe",
		"aloft",
		"aloha",
		"alone",
		"alongside",
		"aloof",
		"alphabet",
		"alright",
		"although",
		"altitude",
		"alto",
		"aluminum",
		"alumni",
		"always",
		"amaretto",
		"amaze",
		"amazingly",
		"amber",
		"ambiance",
		"ambiguity",
		"ambiguous",
		"ambition",
		"ambitious",
		"ambulance",
		"ambush",
		"amendable",
		"amendment",
		"amends",
		"amenity",
		"amiable",
		"amicably",
		"amid",
		"amigo",
		"amino",
		"amiss",
		"ammonia",
		"ammonium",
		"amnesty",
		"amniotic",
		"among",
		"amount",
		"amperage",
		"ample",
		"amplifier",
		"amplify",
		"amply",
		"amuck",
		"amulet",
		"amusable",
		"amused",
		"amusement",
		"amuser",
		"amusing",
		"anaconda",
		"anaerobic",
		"anagram",
		"anatomist",
		"anatomy",
		"anchor",
		"anchovy",
		"ancient",
		"android",
		"anemia",
		"anemic",
		"aneurism",
		"anew",
		"angelfish",
		"angelic",
		"anger",
		"angled",
		"angler",
		"angles",
		"angling",
		"angrily",
		"angriness",
		"anguished",
		"angular",
		"animal",
		"animate",
		"animating",
		"animation",
		"animator",
		"anime",
		"animosity",
		"ankle",
		"annex",
		"annotate",
		"announcer",
		"annoying",
		"annually",
		"annuity",
		"anointer",
		"another",
		"answering",
		"antacid",
		"antarctic",
		"anteater",
		"antelope",
		"antennae",
		"anthem",
		"anthill",
		"anthology",
		"antibody",
		"antics",
		"antidote",
		"antihero",
		"antiquely",
		"antiques",
		"antiquity",
		"antirust",
		"antitoxic",
		"antitrust",
		"antiviral",
		"antivirus",
		"antler",
		"antonym",
		"antsy",
		"anvil",
		"anybody",
		"anyhow",
		"anymore",
		"anyone",
		"anyplace",
		"anything",
		"anytime",
		"anyway",
		"anywhere",
		"aorta",
		"apache",
		"apostle",
		"appealing",
		"appear",
		"appease",
		"appeasing",
		"appendage",
		"appendix",
		"appetite",
		"appetizer",
		"applaud",
		"applause",
		"apple",
		"appliance",
		"applicant",
		"applied",
		"apply",
		"appointee",
		"appraisal",
		"appraiser",
		"apprehend",
		"approach",
		"approval",
		"approve",
		"apricot",
		"april",
		"apron",
		"aptitude",
		"aptly",
		"aqua",
		"aqueduct",
		"arbitrary",
		"arbitrate",
		"ardently",
		"area",
		"arena",
		"arguable",
		"arguably",
		"argue",
		"arise",
		"armadillo",
		"armband",
		"armchair",
		"armed",
		"armful",
		"armhole",
		"arming",
		"armless",
		"armoire",
		"armored",
		"armory",
		"armrest",
		"army",
		"aroma",
		"arose",
		"around",
		"arousal",
		"arrange",
		"array",
		"arrest",
		"arrival",
		"arrive",
		"arrogance",
		"arrogant",
		"arson",
		"art",
		"ascend",
		"ascension",
		"ascent",
		"ascertain",
		"ashamed",
		"ashen",
		"ashes",
		"ashy",
		"aside",
		"askew",
		"asleep",
		"asparagus",
		"aspect",
		"aspirate",
		"aspire",
		"aspirin",
		"astonish",
		"astound",
		"astride",
		"astrology",
		"astronaut",
		"astronomy",
		"astute",
		"atlantic",
		"atlas",
		"atom",
		"atonable",
		"atop",
		"atrium",
		"atrocious",
		"atrophy",
		"attach",
		"attain",
		"attempt",
		"attendant",
		"attendee",
		"attention",
		"attentive",
		"attest",
		"attic",
		"attire",
		"attitude",
		"attractor",
		"attribute",
		"atypical",
		"auction",
		"audacious",
		"audacity",
		"audible",
		"audibly",
		"audience",
		"audio",
		"audition",
		"augmented",
		"august",
		"authentic",
		"author",
		"autism",
		"autistic",
		"autograph",
		"automaker",
		"automated",
		"automatic",
		"autopilot",
		"available",
		"avalanche",
		"avatar",
		"avenge",
		"avenging",
		"avenue",
		"average",
		"aversion",
		"avert",
		"aviation",
		"aviator",
		"avid",
		"avoid",
		"await",
		"awaken",
		"award",
		"aware",
		"awhile",
		"awkward",
		"awning",
		"awoke",
		"awry",
		"axis",
		"babble",
		"babbling",
		"babied",
		"baboon",
		"backache",
		"backboard",
		"backboned",
		"backdrop",
		"backed",
		"backer",
		"backfield",
		"backfire",
		"backhand",
		"backing",
		"backlands",
		"backlash",
		"backless",
		"backlight",
		"backlit",
		"backlog",
		"backpack",
		"backpedal",
		"backrest",
		"backroom",
		"backshift",
		"backside",
		"backslid",
		"backspace",
		"backspin",
		"backstab",
		"backstage",
		"backtalk",
		"backtrack",
		"backup",
		"backward",
		"backwash",
		"backwater",
		"backyard",
		"bacon",
		"bacteria",
		"bacterium",
		"badass",
		"badge",
		"badland",
		"badly",
		"badness",
		"baffle",
		"baffling",
		"bagel",
		"bagful",
		"baggage",
		"bagged",
		"baggie",
		"bagginess",
		"bagging",
		"baggy",
		"bagpipe",
		"baguette",
		"baked",
		"bakery",
		"bakeshop",
		"baking",
		"balance",
		"balancing",
		"balcony",
		"balmy",
		"balsamic",
		"bamboo",
		"banana",
		"banish",
		"banister",
		"banjo",
		"bankable",
		"bankbook",
		"banked",
		"banker",
		"banking",
		"banknote",
		"bankroll",
		"banner",
		"bannister",
		"banshee",
		"banter",
		"barbecue",
		"barbed",
		"barbell",
		"barber",
		"barcode",
		"barge",
		"bargraph",
		"barista",
		"baritone",
		"barley",
		"barmaid",
		"barman",
		"barn",
		"barometer",
		"barrack",
		"barracuda",
		"barrel",
		"barrette",
		"barricade",
		"barrier",
		"barstool",
		"bartender",
		"barterer",
		"bash",
		"basically",
		"basics",
		"basil",
		"basin",
		"basis",
		"basket",
		"batboy",
		"batch",
		"bath",
		"baton",
		"bats",
		"battalion",
		"battered",
		"battering",
		"battery",
		"batting",
		"battle",
		"bauble",
		"bazooka",
		"blabber",
		"bladder",
		"blade",
		"blah",
		"blame",
		"blaming",
		"blanching",
		"blandness",
		"blank",
		"blaspheme",
		"blasphemy",
		"blast",
		"blatancy",
		"blatantly",
		"blazer",
		"blazing",
		"bleach",
		"bleak",
		"bleep",
		"blemish",
		"blend",
		"bless",
		"blighted",
		"blimp",
		"bling",
		"blinked",
		"blinker",
		"blinking",
		"blinks",
		"blip",
		"blissful",
		"blitz",
		"blizzard",
		"bloated",
		"bloating",
		"blob",
		"blog",
		"bloomers",
		"blooming",
		"blooper",
		"blot",
		"blouse",
		"blubber",
		"bluff",
		"bluish",
		"blunderer",
		"blunt",
		"blurb",
		"blurred",
		"blurry",
		"blurt",
		"blush",
		"blustery",
		"boaster",
		"boastful",
		"boasting",
		"boat",
		"bobbed",
		"bobbing",
		"bobble",
		"bobcat",
		"bobsled",
		"bobtail",
		"bodacious",
		"body",
		"bogged",
		"boggle",
		"bogus",
		"boil",
		"bok",
		"bolster",
		"bolt",
		"bonanza",
		"bonded",
		"bonding",
		"bondless",
		"boned",
		"bonehead",
		"boneless",
		"bonelike",
		"boney",
		"bonfire",
		"bonnet",
		"bonsai",
		"bonus",
		"bony",
		"boogeyman",
		"boogieman",
		"book",
		"boondocks",
		"booted",
		"booth",
		"bootie",
		"booting",
		"bootlace",
		"bootleg",
		"boots",
		"boozy",
		"borax",
		"boring",
		"borough",
		"borrower",
		"borrowing",
		"boss",
		"botanical",
		"botanist",
		"botany",
		"botch",
		"both",
		"bottle",
		"bottling",
		"bottom",
		"bounce",
		"bouncing",
		"bouncy",
		"bounding",
		"boundless",
		"bountiful",
		"bovine",
		"boxcar",
		"boxer",
		"boxing",
		"boxlike",
		"boxy",
		"breach",
		"breath",
		"breeches",
		"breeching",
		"breeder",
		"breeding",
		"breeze",
		"breezy",
		"brethren",
		"brewery",
		"brewing",
		"briar",
		"bribe",
		"brick",
		"bride",
		"bridged",
		"brigade",
		"bright",
		"brilliant",
		"brim",
		"bring",
		"brink",
		"brisket",
		"briskly",
		"briskness",
		"bristle",
		"brittle",
		"broadband",
		"broadcast",
		"broaden",
		"broadly",
		"broadness",
		"broadside",
		"broadways",
		"broiler",
		"broiling",
		"broken",
		"broker",
		"bronchial",
		"bronco",
		"bronze",
		"bronzing",
		"brook",
		"broom",
		"brought",
		"browbeat",
		"brownnose",
		"browse",
		"browsing",
		"bruising",
		"brunch",
		"brunette",
		"brunt",
		"brush",
		"brussels",
		"brute",
		"brutishly",
		"bubble",
		"bubbling",
		"bubbly",
		"buccaneer",
		"bucked",
		"bucket",
		"buckle",
		"buckshot",
		"buckskin",
		"bucktooth",
		"buckwheat",
		"buddhism",
		"buddhist",
		"budding",
		"buddy",
		"budget",
		"buffalo",
		"buffed",
		"buffer",
		"buffing",
		"buffoon",
		"buggy",
		"bulb",
		"bulge",
		"bulginess",
		"bulgur",
		"bulk",
		"bulldog",
		"bulldozer",
		"bullfight",
		"bullfrog",
		"bullhorn",
		"bullion",
		"bullish",
		"bullpen",
		"bullring",
		"bullseye",
		"bullwhip",
		"bully",
		"bunch",
		"bundle",
		"bungee",
		"bunion",
		"bunkbed",
		"bunkhouse",
		"bunkmate",
		"bunny",
		"bunt",
		"busboy",
		"bush",
		"busily",
		"busload",
		"bust",
		"busybody",
		"buzz",
		"cabana",
		"cabbage",
		"cabbie",
		"cabdriver",
		"cable",
		"caboose",
		"cache",
		"cackle",
		"cacti",
		"cactus",
		"caddie",
		"caddy",
		"cadet",
		"cadillac",
		"cadmium",
		"cage",
		"cahoots",
		"cake",
		"calamari",
		"calamity",
		"calcium",
		"calculate",
		"calculus",
		"caliber",
		"calibrate",
		"calm",
		"caloric",
		"calorie",
		"calzone",
		"camcorder",
		"cameo",
		"camera",
		"camisole",
		"camper",
		"campfire",
		"camping",
		"campsite",
		"campus",
		"canal",
		"canary",
		"cancel",
		"candied",
		"candle",
		"candy",
		"cane",
		"canine",
		"canister",
		"cannabis",
		"canned",
		"canning",
		"cannon",
		"cannot",
		"canola",
		"canon",
		"canopener",
		"canopy",
		"canteen",
		"canyon",
		"capable",
		"capably",
		"capacity",
		"cape",
		"capillary",
		"capital",
		"capitol",
		"capped",
		"capricorn",
		"capsize",
		"capsule",
		"caption",
		"captivate",
		"captive",
		"captivity",
		"capture",
		"caramel",
		"carat",
		"caravan",
		"carbon",
		"cardboard",
		"carded",
		"cardiac",
		"cardigan",
		"cardinal",
		"cardstock",
		"carefully",
		"caregiver",
		"careless",
		"caress",
		"caretaker",
		"cargo",
		"caring",
		"carless",
		"carload",
		"carmaker",
		"carnage",
		"carnation",
		"carnival",
		"carnivore",
		"carol",
		"carpenter",
		"carpentry",
		"carpool",
		"carport",
		"carried",
		"carrot",
		"carrousel",
		"carry",
		"cartel",
		"cartload",
		"carton",
		"cartoon",
		"cartridge",
		"cartwheel",
		"carve",
		"carving",
		"carwash",
		"cascade",
		"case",
		"cash",
		"casing",
		"casino",
		"casket",
		"cassette",
		"casually",
		"casualty",
		"catacomb",
		"catalog",
		"catalyst",
		"catalyze",
		"catapult",
		"cataract",
		"catatonic",
		"catcall",
		"catchable",
		"catcher",
		"catching",
		"catchy",
		"caterer",
		"catering",
		"catfight",
		"catfish",
		"cathedral",
		"cathouse",
		"catlike",
		"catnap",
		"catnip",
		"catsup",
		"cattail",
		"cattishly",
		"cattle",
		"catty",
		"catwalk",
		"caucasian",
		"caucus",
		"causal",
		"causation",
		"cause",
		"causing",
		"cauterize",
		"caution",
		"cautious",
		"cavalier",
		"cavalry",
		"caviar",
		"cavity",
		"cedar",
		"celery",
		"celestial",
		"celibacy",
		"celibate",
		"celtic",
		"cement",
		"census",
		"ceramics",
		"ceremony",
		"certainly",
		"certainty",
		"certified",
		"certify",
		"cesarean",
		"cesspool",
		"chafe",
		"chaffing",
		"chain",
		"chair",
		"chalice",
		"challenge",
		"chamber",
		"chamomile",
		"champion",
		"chance",
		"change",
		"channel",
		"chant",
		"chaos",
		"chaperone",
		"chaplain",
		"chapped",
		"chaps",
		"chapter",
		"character",
		"charbroil",
		"charcoal",
		"charger",
		"charging",
		"chariot",
		"charity",
		"charm",
		"charred",
		"charter",
		"charting",
		"chase",
		"chasing",
		"chaste",
		"chastise",
		"chastity",
		"chatroom",
		"chatter",
		"chatting",
		"chatty",
		"cheating",
		"cheddar",
		"cheek",
		"cheer",
		"cheese",
		"cheesy",
		"chef",
		"chemicals",
		"chemist",
		"chemo",
		"cherisher",
		"cherub",
		"chess",
		"chest",
		"chevron",
		"chevy",
		"chewable",
		"chewer",
		"chewing",
		"chewy",
		"chief",
		"chihuahua",
		"childcare",
		"childhood",
		"childish",
		"childless",
		"childlike",
		"chili",
		"chill",
		"chimp",
		"chip",
		"chirping",
		"chirpy",
		"chitchat",
		"chivalry",
		"chive",
		"chloride",
		"chlorine",
		"choice",
		"chokehold",
		"choking",
		"chomp",
		"chooser",
		"choosing",
		"choosy",
		"chop",
		"chosen",
		"chowder",
		"chowtime",
		"chrome",
		"chubby",
		"chuck",
		"chug",
		"chummy",
		"chump",
		"chunk",
		"churn",
		"chute",
		"cider",
		"cilantro",
		"cinch",
		"cinema",
		"cinnamon",
		"circle",
		"circling",
		"circular",
		"circulate",
		"circus",
		"citable",
		"citadel",
		"citation",
		"citizen",
		"citric",
		"citrus",
		"city",
		"civic",
		"civil",
		"clad",
		"claim",
		"clambake",
		"clammy",
		"clamor",
		"clamp",
		"clamshell",
		"clang",
		"clanking",
		"clapped",
		"clapper",
		"clapping",
		"clarify",
		"clarinet",
		"clarity",
		"clash",
		"clasp",
		"class",
		"clatter",
		"clause",
		"clavicle",
		"claw",
		"clay",
		"clean",
		"clear",
		"cleat",
		"cleaver",
		"cleft",
		"clench",
		"clergyman",
		"clerical",
		"clerk",
		"clever",
		"clicker",
		"client",
		"climate",
		"climatic",
		"cling",
		"clinic",
		"clinking",
		"clip",
		"clique",
		"cloak",
		"clobber",
		"clock",
		"clone",
		"cloning",
		"closable",
		"closure",
		"clothes",
		"clothing",
		"cloud",
		"clover",
		"clubbed",
		"clubbing",
		"clubhouse",
		"clump",
		"clumsily",
		"clumsy",
		"clunky",
		"clustered",
		"clutch",
		"clutter",
		"coach",
		"coagulant",
		"coastal",
		"coaster",
		"coasting",
		"coastland",
		"coastline",
		"coat",
		"coauthor",
		"cobalt",
		"cobbler",
		"cobweb",
		"cocoa",
		"coconut",
		"cod",
		"coeditor",
		"coerce",
		"coexist",
		"coffee",
		"cofounder",
		"cognition",
		"cognitive",
		"cogwheel",
		"coherence",
		"coherent",
		"cohesive",
		"coil",
		"coke",
		"cola",
		"cold",
		"coleslaw",
		"coliseum",
		"collage",
		"collapse",
		"collar",
		"collected",
		"collector",
		"collide",
		"collie",
		"collision",
		"colonial",
		"colonist",
		"colonize",
		"colony",
		"colossal",
		"colt",
		"coma",
		"come",
		"comfort",
		"comfy",
		"comic",
		"coming",
		"comma",
		"commence",
		"commend",
		"comment",
		"commerce",
		"commode",
		"commodity",
		"commodore",
		"common",
		"commotion",
		"commute",
		"commuting",
		"compacted",
		"compacter",
		"compactly",
		"compactor",
		"companion",
		"company",
		"compare",
		"compel",
		"compile",
		"comply",
		"component",
		"composed",
		"composer",
		"composite",
		"compost",
		"composure",
		"compound",
		"compress",
		"comprised",
		"computer",
		"computing",
		"comrade",
		"concave",
		"conceal",
		"conceded",
		"concept",
		"concerned",
		"concert",
		"conch",
		"concierge",
		"concise",
		"conclude",
		"concrete",
		"concur",
		"condense",
		"condiment",
		"condition",
		"condone",
		"conducive",
		"conductor",
		"conduit",
		"cone",
		"confess",
		"confetti",
		"confidant",
		"confident",
		"confider",
		"confiding",
		"configure",
		"confined",
		"confining",
		"confirm",
		"conflict",
		"conform",
		"confound",
		"confront",
		"confused",
		"confusing",
		"confusion",
		"congenial",
		"congested",
		"congrats",
		"congress",
		"conical",
		"conjoined",
		"conjure",
		"conjuror",
		"connected",
		"connector",
		"consensus",
		"consent",
		"console",
		"consoling",
		"consonant",
		"constable",
		"constant",
		"constrain",
		"constrict",
		"construct",
		"consult",
		"consumer",
		"consuming",
		"contact",
		"container",
		"contempt",
		"contend",
		"contented",
		"contently",
		"contents",
		"contest",
		"context",
		"contort",
		"contour",
		"contrite",
		"control",
		"contusion",
		"convene",
		"convent",
		"copartner",
		"cope",
		"copied",
		"copier",
		"copilot",
		"coping",
		"copious",
		"copper",
		"copy",
		"coral",
		"cork",
		"cornball",
		"cornbread",
		"corncob",
		"cornea",
		"corned",
		"corner",
		"cornfield",
		"cornflake",
		"cornhusk",
		"cornmeal",
		"cornstalk",
		"corny",
		"coronary",
		"coroner",
		"corporal",
		"corporate",
		"corral",
		"correct",
		"corridor",
		"corrode",
		"corroding",
		"corrosive",
		"corsage",
		"corset",
		"cortex",
		"cosigner",
		"cosmetics",
		"cosmic",
		"cosmos",
		"cosponsor",
		"cost",
		"cottage",
		"cotton",
		"couch",
		"cough",
		"could",
		"countable",
		"countdown",
		"counting",
		"countless",
		"country",
		"county",
		"courier",
		"covenant",
		"cover",
		"coveted",
		"coveting",
		"coyness",
		"cozily",
		"coziness",
		"cozy",
		"crabbing",
		"crabgrass",
		"crablike",
		"crabmeat",
		"cradle",
		"cradling",
		"crafter",
		"craftily",
		"craftsman",
		"craftwork",
		"crafty",
		"cramp",
		"cranberry",
		"crane",
		"cranial",
		"cranium",
		"crank",
		"crate",
		"crave",
		"craving",
		"crawfish",
		"crawlers",
		"crawling",
		"crayfish",
		"crayon",
		"crazed",
		"crazily",
		"craziness",
		"crazy",
		"creamed",
		"creamer",
		"creamlike",
		"crease",
		"creasing",
		"creatable",
		"create",
		"creation",
		"creative",
		"creature",
		"credible",
		"credibly",
		"credit",
		"creed",
		"creme",
		"creole",
		"crepe",
		"crept",
		"crescent",
		"crested",
		"cresting",
		"crestless",
		"crevice",
		"crewless",
		"crewman",
		"crewmate",
		"crib",
		"cricket",
		"cried",
		"crier",
		"crimp",
		"crimson",
		"cringe",
		"cringing",
		"crinkle",
		"crinkly",
		"crisped",
		"crisping",
		"crisply",
		"crispness",
		"crispy",
		"criteria",
		"critter",
		"croak",
		"crock",
		"crook",
		"croon",
		"crop",
		"cross",
		"crouch",
		"crouton",
		"crowbar",
		"crowd",
		"crown",
		"crucial",
		"crudely",
		"crudeness",
		"cruelly",
		"cruelness",
		"cruelty",
		"crumb",
		"crummiest",
		"crummy",
		"crumpet",
		"crumpled",
		"cruncher",
		"crunching",
		"crunchy",
		"crusader",
		"crushable",
		"crushed",
		"crusher",
		"crushing",
		"crust",
		"crux",
		"crying",
		"cryptic",
		"crystal",
		"cubbyhole",
		"cube",
		"cubical",
		"cubicle",
		"cucumber",
		"cuddle",
		"cuddly",
		"cufflink",
		"culinary",
		"culminate",
		"culpable",
		"culprit",
		"cultivate",
		"cultural",
		"culture",
		"cupbearer",
		"cupcake",
		"cupid",
		"cupped",
		"cupping",
		"curable",
		"curator",
		"curdle",
		"cure",
		"curfew",
		"curing",
		"curled",
		"curler",
		"curliness",
		"curling",
		"curly",
		"curry",
		"curse",
		"cursive",
		"cursor",
		"curtain",
		"curtly",
		"curtsy",
		"curvature",
		"curve",
		"curvy",
		"cushy",
		"cusp",
		"cussed",
		"custard",
		"custodian",
		"custody",
		"customary",
		"customer",
		"customize",
		"customs",
		"cut",
		"cycle",
		"cyclic",
		"cycling",
		"cyclist",
		"cylinder",
		"cymbal",
		"cytoplasm",
		"cytoplast",
		"dab",
		"dad",
		"daffodil",
		"dagger",
		"daily",
		"daintily",
		"dainty",
		"dairy",
		"daisy",
		"dallying",
		"dance",
		"dancing",
		"dandelion",
		"dander",
		"dandruff",
		"dandy",
		"danger",
		"dangle",
		"dangling",
		"daredevil",
		"dares",
		"daringly",
		"darkened",
		"darkening",
		"darkish",
		"darkness",
		"darkroom",
		"darling",
		"darn",
		"dart",
		"darwinism",
		"dash",
		"dastardly",
		"data",
		"datebook",
		"dating",
		"daughter",
		"daunting",
		"dawdler",
		"dawn",
		"daybed",
		"daybreak",
		"daycare",
		"daydream",
		"daylight",
		"daylong",
		"dayroom",
		"daytime",
		"dazzler",
		"dazzling",
		"deacon",
		"deafening",
		"deafness",
		"dealer",
		"dealing",
		"dealmaker",
		"dealt",
		"dean",
		"debatable",
		"debate",
		"debating",
		"debit",
		"debrief",
		"debtless",
		"debtor",
		"debug",
		"debunk",
		"decade",
		"decaf",
		"decal",
		"decathlon",
		"decay",
		"deceased",
		"deceit",
		"deceiver",
		"deceiving",
		"december",
		"decency",
		"decent",
		"deception",
		"deceptive",
		"decibel",
		"decidable",
		"decimal",
		"decimeter",
		"decipher",
		"deck",
		"declared",
		"decline",
		"decode",
		"decompose",
		"decorated",
		"decorator",
		"decoy",
		"decrease",
		"decree",
		"dedicate",
		"dedicator",
		"deduce",
		"deduct",
		"deed",
		"deem",
		"deepen",
		"deeply",
		"deepness",
		"deface",
		"defacing",
		"defame",
		"default",
		"defeat",
		"defection",
		"defective",
		"defendant",
		"defender",
		"defense",
		"defensive",
		"deferral",
		"deferred",
		"defiance",
		"defiant",
		"defile",
		"defiling",
		"define",
		"definite",
		"deflate",
		"deflation",
		"deflator",
		"deflected",
		"deflector",
		"defog",
		"deforest",
		"defraud",
		"defrost",
		"deftly",
		"defuse",
		"defy",
		"degraded",
		"degrading",
		"degrease",
		"degree",
		"dehydrate",
		"deity",
		"dejected",
		"delay",
		"delegate",
		"delegator",
		"delete",
		"deletion",
		"delicacy",
		"delicate",
		"delicious",
		"delighted",
		"delirious",
		"delirium",
		"deliverer",
		"delivery",
		"delouse",
		"delta",
		"deluge",
		"delusion",
		"deluxe",
		"demanding",
		"demeaning",
		"demeanor",
		"demise",
		"democracy",
		"democrat",
		"demote",
		"demotion",
		"demystify",
		"denatured",
		"deniable",
		"denial",
		"denim",
		"denote",
		"dense",
		"density",
		"dental",
		"dentist",
		"denture",
		"deny",
		"deodorant",
		"deodorize",
		"departed",
		"departure",
		"depict",
		"deplete",
		"depletion",
		"deplored",
		"deploy",
		"deport",
		"depose",
		"depraved",
		"depravity",
		"deprecate",
		"depress",
		"deprive",
		"depth",
		"deputize",
		"deputy",
		"derail",
		"deranged",
		"derby",
		"derived",
		"desecrate",
		"deserve",
		"deserving",
		"designate",
		"designed",
		"designer",
		"designing",
		"deskbound",
		"desktop",
		"deskwork",
		"desolate",
		"despair",
		"despise",
		"despite",
		"destiny",
		"destitute",
		"destruct",
		"detached",
		"detail",
		"detection",
		"detective",
		"detector",
		"detention",
		"detergent",
		"detest",
		"detonate",
		"detonator",
		"detoxify",
		"detract",
		"deuce",
		"devalue",
		"deviancy",
		"deviant",
		"deviate",
		"deviation",
		"deviator",
		"device",
		"devious",
		"devotedly",
		"devotee",
		"devotion",
		"devourer",
		"devouring",
		"devoutly",
		"dexterity",
		"dexterous",
		"diabetes",
		"diabetic",
		"diabolic",
		"diagnoses",
		"diagnosis",
		"diagram",
		"dial",
		"diameter",
		"diaper",
		"diaphragm",
		"diary",
		"dice",
		"dicing",
		"dictate",
		"dictation",
		"dictator",
		"difficult",
		"diffused",
		"diffuser",
		"diffusion",
		"diffusive",
		"dig",
		"dilation",
		"diligence",
		"diligent",
		"dill",
		"dilute",
		"dime",
		"diminish",
		"dimly",
		"dimmed",
		"dimmer",
		"dimness",
		"dimple",
		"diner",
		"dingbat",
		"dinghy",
		"dinginess",
		"dingo",
		"dingy",
		"dining",
		"dinner",
		"diocese",
		"dioxide",
		"diploma",
		"dipped",
		"dipper",
		"dipping",
		"directed",
		"direction",
		"directive",
		"directly",
		"directory",
		"direness",
		"dirtiness",
		"disabled",
		"disagree",
		"disallow",
		"disarm",
		"disarray",
		"disaster",
		"disband",
		"disbelief",
		"disburse",
		"discard",
		"discern",
		"discharge",
		"disclose",
		"discolor",
		"discount",
		"discourse",
		"discover",
		"discuss",
		"disdain",
		"disengage",
		"disfigure",
		"disgrace",
		"dish",
		"disinfect",
		"disjoin",
		"disk",
		"dislike",
		"disliking",
		"dislocate",
		"dislodge",
		"disloyal",
		"dismantle",
		"dismay",
		"dismiss",
		"dismount",
		"disobey",
		"disorder",
		"disown",
		"disparate",
		"disparity",
		"dispatch",
		"dispense",
		"dispersal",
		"dispersed",
		"disperser",
		"displace",
		"display",
		"displease",
		"disposal",
		"dispose",
		"disprove",
		"dispute",
		"disregard",
		"disrupt",
		"dissuade",
		"distance",
		"distant",
		"distaste",
		"distill",
		"distinct",
		"distort",
		"distract",
		"distress",
		"district",
		"distrust",
		"ditch",
		"ditto",
		"ditzy",
		"dividable",
		"divided",
		"dividend",
		"dividers",
		"dividing",
		"divinely",
		"diving",
		"divinity",
		"divisible",
		"divisibly",
		"division",
		"divisive",
		"divorcee",
		"dizziness",
		"dizzy",
		"doable",
		"docile",
		"dock",
		"doctrine",
		"document",
		"dodge",
		"dodgy",
		"doily",
		"doing",
		"dole",
		"dollar",
		"dollhouse",
		"dollop",
		"dolly",
		"dolphin",
		"domain",
		"domelike",
		"domestic",
		"dominion",
		"dominoes",
		"donated",
		"donation",
		"donator",
		"donor",
		"donut",
		"doodle",
		"doorbell",
		"doorframe",
		"doorknob",
		"doorman",
		"doormat",
		"doornail",
		"doorpost",
		"doorstep",
		"doorstop",
		"doorway",
		"doozy",
		"dork",
		"dormitory",
		"dorsal",
		"dosage",
		"dose",
		"dotted",
		"doubling",
		"douche",
		"dove",
		"down",
		"dowry",
		"doze",
		"drab",
		"dragging",
		"dragonfly",
		"dragonish",
		"dragster",
		"drainable",
		"drainage",
		"drained",
		"drainer",
		"drainpipe",
		"dramatic",
		"dramatize",
		"drank",
		"drapery",
		"drastic",
		"draw",
		"dreaded",
		"dreadful",
		"dreadlock",
		"dreamboat",
		"dreamily",
		"dreamland",
		"dreamless",
		"dreamlike",
		"dreamt",
		"dreamy",
		"drearily",
		"dreary",
		"drench",
		"dress",
		"drew",
		"dribble",
		"dried",
		"drier",
		"drift",
		"driller",
		"drilling",
		"drinkable",
		"drinking",
		"dripping",
		"drippy",
		"drivable",
		"driven",
		"driver",
		"driveway",
		"driving",
		"drizzle",
		"drizzly",
		"drone",
		"drool",
		"droop",
		"drop-down",
		"dropbox",
		"dropkick",
		"droplet",
		"dropout",
		"dropper",
		"drove",
		"drown",
		"drowsily",
		"drudge",
		"drum",
		"dry",
		"dubbed",
		"dubiously",
		"duchess",
		"duckbill",
		"ducking",
		"duckling",
		"ducktail",
		"ducky",
		"duct",
		"dude",
		"duffel",
		"dugout",
		"duh",
		"duke",
		"duller",
		"dullness",
		"duly",
		"dumping",
		"dumpling",
		"dumpster",
		"duo",
		"dupe",
		"duplex",
		"duplicate",
		"duplicity",
		"durable",
		"durably",
		"duration",
		"duress",
		"during",
		"dusk",
		"dust",
		"dutiful",
		"duty",
		"duvet",
		"dwarf",
		"dweeb",
		"dwelled",
		"dweller",
		"dwelling",
		"dwindle",
		"dwindling",
		"dynamic",
		"dynamite",
		"dynasty",
		"dyslexia",
		"dyslexic",
		"each",
		"eagle",
		"earache",
		"eardrum",
		"earflap",
		"earful",
		"earlobe",
		"early",
		"earmark",
		"earmuff",
		"earphone",
		"earpiece",
		"earplugs",
		"earring",
		"earshot",
		"earthen",
		"earthlike",
		"earthling",
		"earthly",
		"earthworm",
		"earthy",
		"earwig",
		"easeful",
		"easel",
		"easiest",
		"easily",
		"easiness",
		"easing",
		"eastbound",
		"eastcoast",
		"easter",
		"eastward",
		"eatable",
		"eaten",
		"eatery",
		"eating",
		"eats",
		"ebay",
		"ebony",
		"ebook",
		"ecard",
		"eccentric",
		"echo",
		"eclair",
		"eclipse",
		"ecologist",
		"ecology",
		"economic",
		"economist",
		"economy",
		"ecosphere",
		"ecosystem",
		"edge",
		"edginess",
		"edging",
		"edgy",
		"edition",
		"editor",
		"educated",
		"education",
		"educator",
		"eel",
		"effective",
		"effects",
		"efficient",
		"effort",
		"eggbeater",
		"egging",
		"eggnog",
		"eggplant",
		"eggshell",
		"egomaniac",
		"egotism",
		"egotistic",
		"either",
		"eject",
		"elaborate",
		"elastic",
		"elated",
		"elbow",
		"eldercare",
		"elderly",
		"eldest",
		"electable",
		"election",
		"elective",
		"elephant",
		"elevate",
		"elevating",
		"elevation",
		"elevator",
		"eleven",
		"elf",
		"eligible",
		"eligibly",
		"eliminate",
		"elite",
		"elitism",
		"elixir",
		"elk",
		"ellipse",
		"elliptic",
		"elm",
		"elongated",
		"elope",
		"eloquence",
		"eloquent",
		"elsewhere",
		"elude",
		"elusive",
		"elves",
		"email",
		"embargo",
		"embark",
		"embassy",
		"embattled",
		"embellish",
		"ember",
		"embezzle",
		"emblaze",
		"emblem",
		"embody",
		"embolism",
		"emboss",
		"embroider",
		"emcee",
		"emerald",
		"emergency",
		"emission",
		"emit",
		"emote",
		"emoticon",
		"emotion",
		"empathic",
		"empathy",
		"emperor",
		"emphases",
		"emphasis",
		"emphasize",
		"emphatic",
		"empirical",
		"employed",
		"employee",
		"employer",
		"emporium",
		"empower",
		"emptier",
		"emptiness",
		"empty",
		"emu",
		"enable",
		"enactment",
		"enamel",
		"enchanted",
		"enchilada",
		"encircle",
		"enclose",
		"enclosure",
		"encode",
		"encore",
		"encounter",
		"encourage",
		"encroach",
		"encrust",
		"encrypt",
		"endanger",
		"endeared",
		"endearing",
		"ended",
		"ending",
		"endless",
		"endnote",
		"endocrine",
		"endorphin",
		"endorse",
		"endowment",
		"endpoint",
		"endurable",
		"endurance",
		"enduring",
		"energetic",
		"energize",
		"energy",
		"enforced",
		"enforcer",
		"engaged",
		"engaging",
		"engine",
		"engorge",
		"engraved",
		"engraver",
		"engraving",
		"engross",
		"engulf",
		"enhance",
		"enigmatic",
		"enjoyable",
		"enjoyably",
		"enjoyer",
		"enjoying",
		"enjoyment",
		"enlarged",
		"enlarging",
		"enlighten",
		"enlisted",
		"enquirer",
		"enrage",
		"enrich",
		"enroll",
		"enslave",
		"ensnare",
		"ensure",
		"entail",
		"entangled",
		"entering",
		"entertain",
		"enticing",
		"entire",
		"entitle",
		"entity",
		"entomb",
		"entourage",
		"entrap",
		"entree",
		"entrench",
		"entrust",
		"entryway",
		"entwine",
		"enunciate",
		"envelope",
		"enviable",
		"enviably",
		"envious",
		"envision",
		"envoy",
		"envy",
		"enzyme",
		"epic",
		"epidemic",
		"epidermal",
		"epidermis",
		"epidural",
		"epilepsy",
		"epileptic",
		"epilogue",
		"epiphany",
		"episode",
		"equal",
		"equate",
		"equation",
		"equator",
		"equinox",
		"equipment",
		"equity",
		"equivocal",
		"eradicate",
		"erasable",
		"erased",
		"eraser",
		"erasure",
		"ergonomic",
		"errand",
		"errant",
		"erratic",
		"error",
		"erupt",
		"escalate",
		"escalator",
		"escapable",
		"escapade",
		"escapist",
		"escargot",
		"eskimo",
		"esophagus",
		"espionage",
		"espresso",
		"esquire",
		"essay",
		"essence",
		"essential",
		"establish",
		"estate",
		"esteemed",
		"estimate",
		"estimator",
		"estranged",
		"estrogen",
		"etching",
		"eternal",
		"eternity",
		"ethanol",
		"ether",
		"ethically",
		"ethics",
		"euphemism",
		"evacuate",
		"evacuee",
		"evade",
		"evaluate",
		"evaluator",
		"evaporate",
		"evasion",
		"evasive",
		"even",
		"everglade",
		"evergreen",
		"everybody",
		"everyday",
		"everyone",
		"evict",
		"evidence",
		"evident",
		"evil",
		"evoke",
		"evolution",
		"evolve",
		"exact",
		"exalted",
		"example",
		"excavate",
		"excavator",
		"exceeding",
		"exception",
		"excess",
		"exchange",
		"excitable",
		"exciting",
		"exclaim",
		"exclude",
		"excluding",
		"exclusion",
		"exclusive",
		"excretion",
		"excretory",
		"excursion",
		"excusable",
		"excusably",
		"excuse",
		"exemplary",
		"exemplify",
		"exemption",
		"exerciser",
		"exert",
		"exes",
		"exfoliate",
		"exhale",
		"exhaust",
		"exhume",
		"exile",
		"existing",
		"exit",
		"exodus",
		"exonerate",
		"exorcism",
		"exorcist",
		"expand",
		"expanse",
		"expansion",
		"expansive",
		"expectant",
		"expedited",
		"expediter",
		"expel",
		"expend",
		"expenses",
		"expensive",
		"expert",
		"expire",
		"expiring",
		"explain",
		"expletive",
		"explicit",
		"explode",
		"exploit",
		"explore",
		"exploring",
		"exponent",
		"exporter",
		"exposable",
		"expose",
		"exposure",
		"express",
		"expulsion",
		"exquisite",
		"extended",
		"extending",
		"extent",
		"extenuate",
		"exterior",
		"external",
		"extinct",
		"extortion",
		"extradite",
		"extras",
		"extrovert",
		"extrude",
		"extruding",
		"exuberant",
		"fable",
		"fabric",
		"fabulous",
		"facebook",
		"facecloth",
		"facedown",
		"faceless",
		"facelift",
		"faceplate",
		"faceted",
		"facial",
		"facility",
		"facing",
		"facsimile",
		"faction",
		"factoid",
		"factor",
		"factsheet",
		"factual",
		"faculty",
		"fade",
		"fading",
		"failing",
		"falcon",
		"fall",
		"false",
		"falsify",
		"fame",
		"familiar",
		"family",
		"famine",
		"famished",
		"fanatic",
		"fancied",
		"fanciness",
		"fancy",
		"fanfare",
		"fang",
		"fanning",
		"fantasize",
		"fantastic",
		"fantasy",
		"fascism",
		"fastball",
		"faster",
		"fasting",
		"fastness",
		"faucet",
		"favorable",
		"favorably",
		"favored",
		"favoring",
		"favorite",
		"fax",
		"feast",
		"federal",
		"fedora",
		"feeble",
		"feed",
		"feel",
		"feisty",
		"feline",
		"felt-tip",
		"feminine",
		"feminism",
		"feminist",
		"feminize",
		"femur",
		"fence",
		"fencing",
		"fender",
		"ferment",
		"fernlike",
		"ferocious",
		"ferocity",
		"ferret",
		"ferris",
		"ferry",
		"fervor",
		"fester",
		"festival",
		"festive",
		"festivity",
		"fetal",
		"fetch",
		"fever",
		"fiber",
		"fiction",
		"fiddle",
		"fiddling",
		"fidelity",
		"fidgeting",
		"fidgety",
		"fifteen",
		"fifth",
		"fiftieth",
		"fifty",
		"figment",
		"figure",
		"figurine",
		"filing",
		"filled",
		"filler",
		"filling",
		"film",
		"filter",
		"filth",
		"filtrate",
		"finale",
		"finalist",
		"finalize",
		"finally",
		"finance",
		"financial",
		"finch",
		"fineness",
		"finer",
		"finicky",
		"finished",
		"finisher",
		"finishing",
		"finite",
		"finless",
		"finlike",
		"fiscally",
		"fit",
		"five",
		"flaccid",
		"flagman",
		"flagpole",
		"flagship",
		"flagstick",
		"flagstone",
		"flail",
		"flakily",
		"flaky",
		"flame",
		"flammable",
		"flanked",
		"flanking",
		"flannels",
		"flap",
		"flaring",
		"flashback",
		"flashbulb",
		"flashcard",
		"flashily",
		"flashing",
		"flashy",
		"flask",
		"flatbed",
		"flatfoot",
		"flatly",
		"flatness",
		"flatten",
		"flattered",
		"flatterer",
		"flattery",
		"flattop",
		"flatware",
		"flatworm",
		"flavored",
		"flavorful",
		"flavoring",
		"flaxseed",
		"fled",
		"fleshed",
		"fleshy",
		"flick",
		"flier",
		"flight",
		"flinch",
		"fling",
		"flint",
		"flip",
		"flirt",
		"float",
		"flock",
		"flogging",
		"flop",
		"floral",
		"florist",
		"floss",
		"flounder",
		"flyable",
		"flyaway",
		"flyer",
		"flying",
		"flyover",
		"flypaper",
		"foam",
		"foe",
		"fog",
		"foil",
		"folic",
		"folk",
		"follicle",
		"follow",
		"fondling",
		"fondly",
		"fondness",
		"fondue",
		"font",
		"food",
		"fool",
		"footage",
		"football",
		"footbath",
		"footboard",
		"footer",
		"footgear",
		"foothill",
		"foothold",
		"footing",
		"footless",
		"footman",
		"footnote",
		"footpad",
		"footpath",
		"footprint",
		"footrest",
		"footsie",
		"footsore",
		"footwear",
		"footwork",
		"fossil",
		"foster",
		"founder",
		"founding",
		"fountain",
		"fox",
		"foyer",
		"fraction",
		"fracture",
		"fragile",
		"fragility",
		"fragment",
		"fragrance",
		"fragrant",
		"frail",
		"frame",
		"framing",
		"frantic",
		"fraternal",
		"frayed",
		"fraying",
		"frays",
		"freckled",
		"freckles",
		"freebase",
		"freebee",
		"freebie",
		"freedom",
		"freefall",
		"freehand",
		"freeing",
		"freeload",
		"freely",
		"freemason",
		"freeness",
		"freestyle",
		"freeware",
		"freeway",
		"freewill",
		"freezable",
		"freezing",
		"freight",
		"french",
		"frenzied",
		"frenzy",
		"frequency",
		"frequent",
		"fresh",
		"fretful",
		"fretted",
		"friction",
		"friday",
		"fridge",
		"fried",
		"friend",
		"frighten",
		"frightful",
		"frigidity",
		"frigidly",
		"frill",
		"fringe",
		"frisbee",
		"frisk",
		"fritter",
		"frivolous",
		"frolic",
		"from",
		"front",
		"frostbite",
		"frosted",
		"frostily",
		"frosting",
		"frostlike",
		"frosty",
		"froth",
		"frown",
		"frozen",
		"fructose",
		"frugality",
		"frugally",
		"fruit",
		"frustrate",
		"frying",
		"gab",
		"gaffe",
		"gag",
		"gainfully",
		"gaining",
		"gains",
		"gala",
		"gallantly",
		"galleria",
		"gallery",
		"galley",
		"gallon",
		"gallows",
		"gallstone",
		"galore",
		"galvanize",
		"gambling",
		"game",
		"gaming",
		"gamma",
		"gander",
		"gangly",
		"gangrene",
		"gangway",
		"gap",
		"garage",
		"garbage",
		"garden",
		"gargle",
		"garland",
		"garlic",
		"garment",
		"garnet",
		"garnish",
		"garter",
		"gas",
		"gatherer",
		"gathering",
		"gating",
		"gauging",
		"gauntlet",
		"gauze",
		"gave",
		"gawk",
		"gazing",
		"gear",
		"gecko",
		"geek",
		"geiger",
		"gem",
		"gender",
		"generic",
		"generous",
		"genetics",
		"genre",
		"gentile",
		"gentleman",
		"gently",
		"gents",
		"geography",
		"geologic",
		"geologist",
		"geology",
		"geometric",
		"geometry",
		"geranium",
		"gerbil",
		"geriatric",
		"germicide",
		"germinate",
		"germless",
		"germproof",
		"gestate",
		"gestation",
		"gesture",
		"getaway",
		"getting",
		"getup",
		"giant",
		"gibberish",
		"giblet",
		"giddily",
		"giddiness",
		"giddy",
		"gift",
		"gigabyte",
		"gigahertz",
		"gigantic",
		"giggle",
		"giggling",
		"giggly",
		"gigolo",
		"gilled",
		"gills",
		"gimmick",
		"girdle",
		"giveaway",
		"given",
		"giver",
		"giving",
		"gizmo",
		"gizzard",
		"glacial",
		"glacier",
		"glade",
		"gladiator",
		"gladly",
		"glamorous",
		"glamour",
		"glance",
		"glancing",
		"glandular",
		"glare",
		"glaring",
		"glass",
		"glaucoma",
		"glazing",
		"gleaming",
		"gleeful",
		"glider",
		"gliding",
		"glimmer",
		"glimpse",
		"glisten",
		"glitch",
		"glitter",
		"glitzy",
		"gloater",
		"gloating",
		"gloomily",
		"gloomy",
		"glorified",
		"glorifier",
		"glorify",
		"glorious",
		"glory",
		"gloss",
		"glove",
		"glowing",
		"glowworm",
		"glucose",
		"glue",
		"gluten",
		"glutinous",
		"glutton",
		"gnarly",
		"gnat",
		"goal",
		"goatskin",
		"goes",
		"goggles",
		"going",
		"goldfish",
		"goldmine",
		"goldsmith",
		"golf",
		"goliath",
		"gonad",
		"gondola",
		"gone",
		"gong",
		"good",
		"gooey",
		"goofball",
		"goofiness",
		"goofy",
		"google",
		"goon",
		"gopher",
		"gore",
		"gorged",
		"gorgeous",
		"gory",
		"gosling",
		"gossip",
		"gothic",
		"gotten",
		"gout",
		"gown",
		"grab",
		"graceful",
		"graceless",
		"gracious",
		"gradation",
		"graded",
		"grader",
		"gradient",
		"grading",
		"gradually",
		"graduate",
		"graffiti",
		"grafted",
		"grafting",
		"grain",
		"granddad",
		"grandkid",
		"grandly",
		"grandma",
		"grandpa",
		"grandson",
		"granite",
		"granny",
		"granola",
		"grant",
		"granular",
		"grape",
		"graph",
		"grapple",
		"grappling",
		"grasp",
		"grass",
		"gratified",
		"gratify",
		"grating",
		"gratitude",
		"gratuity",
		"gravel",
		"graveness",
		"graves",
		"graveyard",
		"gravitate",
		"gravity",
		"gravy",
		"gray",
		"grazing",
		"greasily",
		"greedily",
		"greedless",
		"greedy",
		"green",
		"greeter",
		"greeting",
		"grew",
		"greyhound",
		"grid",
		"grief",
		"grievance",
		"grieving",
		"grievous",
		"grill",
		"grimace",
		"grimacing",
		"grime",
		"griminess",
		"grimy",
		"grinch",
		"grinning",
		"grip",
		"gristle",
		"grit",
		"groggily",
		"groggy",
		"groin",
		"groom",
		"groove",
		"grooving",
		"groovy",
		"grope",
		"ground",
		"grouped",
		"grout",
		"grove",
		"grower",
		"growing",
		"growl",
		"grub",
		"grudge",
		"grudging",
		"grueling",
		"gruffly",
		"grumble",
		"grumbling",
		"grumbly",
		"grumpily",
		"grunge",
		"grunt",
		"guacamole",
		"guidable",
		"guidance",
		"guide",
		"guiding",
		"guileless",
		"guise",
		"gulf",
		"gullible",
		"gully",
		"gulp",
		"gumball",
		"gumdrop",
		"gumminess",
		"gumming",
		"gummy",
		"gurgle",
		"gurgling",
		"guru",
		"gush",
		"gusto",
		"gusty",
		"gutless",
		"guts",
		"gutter",
		"guy",
		"guzzler",
		"gyration",
		"habitable",
		"habitant",
		"habitat",
		"habitual",
		"hacked",
		"hacker",
		"hacking",
		"hacksaw",
		"had",
		"haggler",
		"haiku",
		"half",
		"halogen",
		"halt",
		"halved",
		"halves",
		"hamburger",
		"hamlet",
		"hammock",
		"hamper",
		"hamster",
		"hamstring",
		"handbag",
		"handball",
		"handbook",
		"handbrake",
		"handcart",
		"handclap",
		"handclasp",
		"handcraft",
		"handcuff",
		"handed",
		"handful",
		"handgrip",
		"handgun",
		"handheld",
		"handiness",
		"handiwork",
		"handlebar",
		"handled",
		"handler",
		"handling",
		"handmade",
		"handoff",
		"handpick",
		"handprint",
		"handrail",
		"handsaw",
		"handset",
		"handsfree",
		"handshake",
		"handstand",
		"handwash",
		"handwork",
		"handwoven",
		"handwrite",
		"handyman",
		"hangnail",
		"hangout",
		"hangover",
		"hangup",
		"hankering",
		"hankie",
		"hanky",
		"haphazard",
		"happening",
		"happier",
		"happiest",
		"happily",
		"happiness",
		"happy",
		"harbor",
		"hardcopy",
		"hardcore",
		"hardcover",
		"harddisk",
		"hardened",
		"hardener",
		"hardening",
		"hardhat",
		"hardhead",
		"hardiness",
		"hardly",
		"hardness",
		"hardship",
		"hardware",
		"hardwired",
		"hardwood",
		"hardy",
		"harmful",
		"harmless",
		"harmonica",
		"harmonics",
		"harmonize",
		"harmony",
		"harness",
		"harpist",
		"harsh",
		"harvest",
		"hash",
		"hassle",
		"haste",
		"hastily",
		"hastiness",
		"hasty",
		"hatbox",
		"hatchback",
		"hatchery",
		"hatchet",
		"hatching",
		"hatchling",
		"hate",
		"hatless",
		"hatred",
		"haunt",
		"haven",
		"hazard",
		"hazelnut",
		"hazily",
		"haziness",
		"hazing",
		"hazy",
		"headache",
		"headband",
		"headboard",
		"headcount",
		"headdress",
		"headed",
		"header",
		"headfirst",
		"headgear",
		"heading",
		"headlamp",
		"headless",
		"headlock",
		"headphone",
		"headpiece",
		"headrest",
		"headroom",
		"headscarf",
		"headset",
		"headsman",
		"headstand",
		"headstone",
		"headway",
		"headwear",
		"heap",
		"heat",
		"heave",
		"heavily",
		"heaviness",
		"heaving",
		"hedge",
		"hedging",
		"heftiness",
		"hefty",
		"helium",
		"helmet",
		"helper",
		"helpful",
		"helping",
		"helpless",
		"helpline",
		"hemlock",
		"hemstitch",
		"hence",
		"henchman",
		"henna",
		"herald",
		"herbal",
		"herbicide",
		"herbs",
		"heritage",
		"hermit",
		"heroics",
		"heroism",
		"herring",
		"herself",
		"hertz",
		"hesitancy",
		"hesitant",
		"hesitate",
		"hexagon",
		"hexagram",
		"hubcap",
		"huddle",
		"huddling",
		"huff",
		"hug",
		"hula",
		"hulk",
		"hull",
		"human",
		"humble",
		"humbling",
		"humbly",
		"humid",
		"humiliate",
		"humility",
		"humming",
		"hummus",
		"humongous",
		"humorist",
		"humorless",
		"humorous",
		"humpback",
		"humped",
		"humvee",
		"hunchback",
		"hundredth",
		"hunger",
		"hungrily",
		"hungry",
		"hunk",
		"hunter",
		"hunting",
		"huntress",
		"huntsman",
		"hurdle",
		"hurled",
		"hurler",
		"hurling",
		"hurray",
		"hurricane",
		"hurried",
		"hurry",
		"hurt",
		"husband",
		"hush",
		"husked",
		"huskiness",
		"hut",
		"hybrid",
		"hydrant",
		"hydrated",
		"hydration",
		"hydrogen",
		"hydroxide",
		"hyperlink",
		"hypertext",
		"hyphen",
		"hypnoses",
		"hypnosis",
		"hypnotic",
		"hypnotism",
		"hypnotist",
		"hypnotize",
		"hypocrisy",
		"hypocrite",
		"ibuprofen",
		"ice",
		"iciness",
		"icing",
		"icky",
		"icon",
		"icy",
		"idealism",
		"idealist",
		"idealize",
		"ideally",
		"idealness",
		"identical",
		"identify",
		"identity",
		"ideology",
		"idiocy",
		"idiom",
		"idly",
		"igloo",
		"ignition",
		"ignore",
		"iguana",
		"illicitly",
		"illusion",
		"illusive",
		"image",
		"imaginary",
		"imagines",
		"imaging",
		"imbecile",
		"imitate",
		"imitation",
		"immature",
		"immerse",
		"immersion",
		"imminent",
		"immobile",
		"immodest",
		"immorally",
		"immortal",
		"immovable",
		"immovably",
		"immunity",
		"immunize",
		"impaired",
		"impale",
		"impart",
		"impatient",
		"impeach",
		"impeding",
		"impending",
		"imperfect",
		"imperial",
		"impish",
		"implant",
		"implement",
		"implicate",
		"implicit",
		"implode",
		"implosion",
		"implosive",
		"imply",
		"impolite",
		"important",
		"importer",
		"impose",
		"imposing",
		"impotence",
		"impotency",
		"impotent",
		"impound",
		"imprecise",
		"imprint",
		"imprison",
		"impromptu",
		"improper",
		"improve",
		"improving",
		"improvise",
		"imprudent",
		"impulse",
		"impulsive",
		"impure",
		"impurity",
		"iodine",
		"iodize",
		"ion",
		"ipad",
		"iphone",
		"ipod",
		"irate",
		"irk",
		"iron",
		"irregular",
		"irrigate",
		"irritable",
		"irritably",
		"irritant",
		"irritate",
		"islamic",
		"islamist",
		"isolated",
		"isolating",
		"isolation",
		"isotope",
		"issue",
		"issuing",
		"italicize",
		"italics",
		"item",
		"itinerary",
		"itunes",
		"ivory",
		"ivy",
		"jab",
		"jackal",
		"jacket",
		"jackknife",
		"jackpot",
		"jailbird",
		"jailbreak",
		"jailer",
		"jailhouse",
		"jalapeno",
		"jam",
		"janitor",
		"january",
		"jargon",
		"jarring",
		"jasmine",
		"jaundice",
		"jaunt",
		"java",
		"jawed",
		"jawless",
		"jawline",
		"jaws",
		"jaybird",
		"jaywalker",
		"jazz",
		"jeep",
		"jeeringly",
		"jellied",
		"jelly",
		"jersey",
		"jester",
		"jet",
		"jiffy",
		"jigsaw",
		"jimmy",
		"jingle",
		"jingling",
		"jinx",
		"jitters",
		"jittery",
		"job",
		"jockey",
		"jockstrap",
		"jogger",
		"jogging",
		"john",
		"joining",
		"jokester",
		"jokingly",
		"jolliness",
		"jolly",
		"jolt",
		"jot",
		"jovial",
		"joyfully",
		"joylessly",
		"joyous",
		"joyride",
		"joystick",
		"jubilance",
		"jubilant",
		"judge",
		"judgingly",
		"judicial",
		"judiciary",
		"judo",
		"juggle",
		"juggling",
		"jugular",
		"juice",
		"juiciness",
		"juicy",
		"jujitsu",
		"jukebox",
		"july",
		"jumble",
		"jumbo",
		"jump",
		"junction",
		"juncture",
		"june",
		"junior",
		"juniper",
		"junkie",
		"junkman",
		"junkyard",
		"jurist",
		"juror",
		"jury",
		"justice",
		"justifier",
		"justify",
		"justly",
		"justness",
		"juvenile",
		"kabob",
		"kangaroo",
		"karaoke",
		"karate",
		"karma",
		"kebab",
		"keenly",
		"keenness",
		"keep",
		"keg",
		"kelp",
		"kennel",
		"kept",
		"kerchief",
		"kerosene",
		"kettle",
		"kick",
		"kiln",
		"kilobyte",
		"kilogram",
		"kilometer",
		"kilowatt",
		"kilt",
		"kimono",
		"kindle",
		"kindling",
		"kindly",
		"kindness",
		"kindred",
		"kinetic",
		"kinfolk",
		"king",
		"kinship",
		"kinsman",
		"kinswoman",
		"kissable",
		"kisser",
		"kissing",
		"kitchen",
		"kite",
		"kitten",
		"kitty",
		"kiwi",
		"kleenex",
		"knapsack",
		"knee",
		"knelt",
		"knickers",
		"knoll",
		"koala",
		"kooky",
		"kosher",
		"krypton",
		"kudos",
		"kung",
		"labored",
		"laborer",
		"laboring",
		"laborious",
		"labrador",
		"ladder",
		"ladies",
		"ladle",
		"ladybug",
		"ladylike",
		"lagged",
		"lagging",
		"lagoon",
		"lair",
		"lake",
		"lance",
		"landed",
		"landfall",
		"landfill",
		"landing",
		"landlady",
		"landless",
		"landline",
		"landlord",
		"landmark",
		"landmass",
		"landmine",
		"landowner",
		"landscape",
		"landside",
		"landslide",
		"language",
		"lankiness",
		"lanky",
		"lantern",
		"lapdog",
		"lapel",
		"lapped",
		"lapping",
		"laptop",
		"lard",
		"large",
		"lark",
		"lash",
		"lasso",
		"last",
		"latch",
		"late",
		"lather",
		"latitude",
		"latrine",
		"latter",
		"latticed",
		"launch",
		"launder",
		"laundry",
		"laurel",
		"lavender",
		"lavish",
		"laxative",
		"lazily",
		"laziness",
		"lazy",
		"lecturer",
		"left",
		"legacy",
		"legal",
		"legend",
		"legged",
		"leggings",
		"legible",
		"legibly",
		"legislate",
		"lego",
		"legroom",
		"legume",
		"legwarmer",
		"legwork",
		"lemon",
		"lend",
		"length",
		"lens",
		"lent",
		"leotard",
		"lesser",
		"letdown",
		"lethargic",
		"lethargy",
		"letter",
		"lettuce",
		"level",
		"leverage",
		"levers",
		"levitate",
		"levitator",
		"liability",
		"liable",
		"liberty",
		"librarian",
		"library",
		"licking",
		"licorice",
		"lid",
		"life",
		"lifter",
		"lifting",
		"liftoff",
		"ligament",
		"likely",
		"likeness",
		"likewise",
		"liking",
		"lilac",
		"lilly",
		"lily",
		"limb",
		"limeade",
		"limelight",
		"limes",
		"limit",
		"limping",
		"limpness",
		"line",
		"lingo",
		"linguini",
		"linguist",
		"lining",
		"linked",
		"linoleum",
		"linseed",
		"lint",
		"lion",
		"lip",
		"liquefy",
		"liqueur",
		"liquid",
		"lisp",
		"list",
		"litigate",
		"litigator",
		"litmus",
		"litter",
		"little",
		"livable",
		"lived",
		"lively",
		"liver",
		"livestock",
		"lividly",
		"living",
		"lizard",
		"lubricant",
		"lubricate",
		"lucid",
		"luckily",
		"luckiness",
		"luckless",
		"lucrative",
		"ludicrous",
		"lugged",
		"lukewarm",
		"lullaby",
		"lumber",
		"luminance",
		"luminous",
		"lumpiness",
		"lumping",
		"lumpish",
		"lunacy",
		"lunar",
		"lunchbox",
		"luncheon",
		"lunchroom",
		"lunchtime",
		"lung",
		"lurch",
		"lure",
		"luridness",
		"lurk",
		"lushly",
		"lushness",
		"luster",
		"lustfully",
		"lustily",
		"lustiness",
		"lustrous",
		"lusty",
		"luxurious",
		"luxury",
		"lying",
		"lyrically",
		"lyricism",
		"lyricist",
		"lyrics",
		"macarena",
		"macaroni",
		"macaw",
		"mace",
		"machine",
		"machinist",
		"magazine",
		"magenta",
		"maggot",
		"magical",
		"magician",
		"magma",
		"magnesium",
		"magnetic",
		"magnetism",
		"magnetize",
		"magnifier",
		"magnify",
		"magnitude",
		"magnolia",
		"mahogany",
		"maimed",
		"majestic",
		"majesty",
		"majorette",
		"majority",
		"makeover",
		"maker",
		"makeshift",
		"making",
		"malformed",
		"malt",
		"mama",
		"mammal",
		"mammary",
		"mammogram",
		"manager",
		"managing",
		"manatee",
		"mandarin",
		"mandate",
		"mandatory",
		"mandolin",
		"manger",
		"mangle",
		"mango",
		"mangy",
		"manhandle",
		"manhole",
		"manhood",
		"manhunt",
		"manicotti",
		"manicure",
		"manifesto",
		"manila",
		"mankind",
		"manlike",
		"manliness",
		"manly",
		"manmade",
		"manned",
		"mannish",
		"manor",
		"manpower",
		"mantis",
		"mantra",
		"manual",
		"many",
		"map",
		"marathon",
		"marauding",
		"marbled",
		"marbles",
		"marbling",
		"march",
		"mardi",
		"margarine",
		"margarita",
		"margin",
		"marigold",
		"marina",
		"marine",
		"marital",
		"maritime",
		"marlin",
		"marmalade",
		"maroon",
		"married",
		"marrow",
		"marry",
		"marshland",
		"marshy",
		"marsupial",
		"marvelous",
		"marxism",
		"mascot",
		"masculine",
		"mashed",
		"mashing",
		"massager",
		"masses",
		"massive",
		"mastiff",
		"matador",
		"matchbook",
		"matchbox",
		"matcher",
		"matching",
		"matchless",
		"material",
		"maternal",
		"maternity",
		"math",
		"mating",
		"matriarch",
		"matrimony",
		"matrix",
		"matron",
		"matted",
		"matter",
		"maturely",
		"maturing",
		"maturity",
		"mauve",
		"maverick",
		"maximize",
		"maximum",
		"maybe",
		"mayday",
		"mayflower",
		"moaner",
		"moaning",
		"mobile",
		"mobility",
		"mobilize",
		"mobster",
		"mocha",
		"mocker",
		"mockup",
		"modified",
		"modify",
		"modular",
		"modulator",
		"module",
		"moisten",
		"moistness",
		"moisture",
		"molar",
		"molasses",
		"mold",
		"molecular",
		"molecule",
		"molehill",
		"mollusk",
		"mom",
		"monastery",
		"monday",
		"monetary",
		"monetize",
		"moneybags",
		"moneyless",
		"moneywise",
		"mongoose",
		"mongrel",
		"monitor",
		"monkhood",
		"monogamy",
		"monogram",
		"monologue",
		"monopoly",
		"monorail",
		"monotone",
		"monotype",
		"monoxide",
		"monsieur",
		"monsoon",
		"monstrous",
		"monthly",
		"monument",
		"moocher",
		"moodiness",
		"moody",
		"mooing",
		"moonbeam",
		"mooned",
		"moonlight",
		"moonlike",
		"moonlit",
		"moonrise",
		"moonscape",
		"moonshine",
		"moonstone",
		"moonwalk",
		"mop",
		"morale",
		"morality",
		"morally",
		"morbidity",
		"morbidly",
		"morphine",
		"morphing",
		"morse",
		"mortality",
		"mortally",
		"mortician",
		"mortified",
		"mortify",
		"mortuary",
		"mosaic",
		"mossy",
		"most",
		"mothball",
		"mothproof",
		"motion",
		"motivate",
		"motivator",
		"motive",
		"motocross",
		"motor",
		"motto",
		"mountable",
		"mountain",
		"mounted",
		"mounting",
		"mourner",
		"mournful",
		"mouse",
		"mousiness",
		"moustache",
		"mousy",
		"mouth",
		"movable",
		"move",
		"movie",
		"moving",
		"mower",
		"mowing",
		"much",
		"muck",
		"mud",
		"mug",
		"mulberry",
		"mulch",
		"mule",
		"mulled",
		"mullets",
		"multiple",
		"multiply",
		"multitask",
		"multitude",
		"mumble",
		"mumbling",
		"mumbo",
		"mummified",
		"mummify",
		"mummy",
		"mumps",
		"munchkin",
		"mundane",
		"municipal",
		"muppet",
		"mural",
		"murkiness",
		"murky",
		"murmuring",
		"muscular",
		"museum",
		"mushily",
		"mushiness",
		"mushroom",
		"mushy",
		"music",
		"musket",
		"muskiness",
		"musky",
		"mustang",
		"mustard",
		"muster",
		"mustiness",
		"musty",
		"mutable",
		"mutate",
		"mutation",
		"mute",
		"mutilated",
		"mutilator",
		"mutiny",
		"mutt",
		"mutual",
		"muzzle",
		"myself",
		"myspace",
		"mystified",
		"mystify",
		"myth",
		"nacho",
		"nag",
		"nail",
		"name",
		"naming",
		"nanny",
		"nanometer",
		"nape",
		"napkin",
		"napped",
		"napping",
		"nappy",
		"narrow",
		"nastily",
		"nastiness",
		"national",
		"native",
		"nativity",
		"natural",
		"nature",
		"naturist",
		"nautical",
		"navigate",
		"navigator",
		"navy",
		"nearby",
		"nearest",
		"nearly",
		"nearness",
		"neatly",
		"neatness",
		"nebula",
		"nebulizer",
		"nectar",
		"negate",
		"negation",
		"negative",
		"neglector",
		"negligee",
		"negligent",
		"negotiate",
		"nemeses",
		"nemesis",
		"neon",
		"nephew",
		"nerd",
		"nervous",
		"nervy",
		"nest",
		"net",
		"neurology",
		"neuron",
		"neurosis",
		"neurotic",
		"neuter",
		"neutron",
		"never",
		"next",
		"nibble",
		"nickname",
		"nicotine",
		"niece",
		"nifty",
		"nimble",
		"nimbly",
		"nineteen",
		"ninetieth",
		"ninja",
		"nintendo",
		"ninth",
		"nuclear",
		"nuclei",
		"nucleus",
		"nugget",
		"nullify",
		"number",
		"numbing",
		"numbly",
		"numbness",
		"numeral",
		"numerate",
		"numerator",
		"numeric",
		"numerous",
		"nuptials",
		"nursery",
		"nursing",
		"nurture",
		"nutcase",
		"nutlike",
		"nutmeg",
		"nutrient",
		"nutshell",
		"nuttiness",
		"nutty",
		"nuzzle",
		"nylon",
		"oaf",
		"oak",
		"oasis",
		"oat",
		"obedience",
		"obedient",
		"obituary",
		"object",
		"obligate",
		"obliged",
		"oblivion",
		"oblivious",
		"oblong",
		"obnoxious",
		"oboe",
		"obscure",
		"obscurity",
		"observant",
		"observer",
		"observing",
		"obsessed",
		"obsession",
		"obsessive",
		"obsolete",
		"obstacle",
		"obstinate",
		"obstruct",
		"obtain",
		"obtrusive",
		"obtuse",
		"obvious",
		"occultist",
		"occupancy",
		"occupant",
		"occupier",
		"occupy",
		"ocean",
		"ocelot",
		"octagon",
		"octane",
		"october",
		"octopus",
		"ogle",
		"oil",
		"oink",
		"ointment",
		"okay",
		"old",
		"olive",
		"olympics",
		"omega",
		"omen",
		"ominous",
		"omission",
		"omit",
		"omnivore",
		"onboard",
		"oncoming",
		"ongoing",
		"onion",
		"online",
		"onlooker",
		"only",
		"onscreen",
		"onset",
		"onshore",
		"onslaught",
		"onstage",
		"onto",
		"onward",
		"onyx",
		"oops",
		"ooze",
		"oozy",
		"opacity",
		"opal",
		"open",
		"operable",
		"operate",
		"operating",
		"operation",
		"operative",
		"operator",
		"opium",
		"opossum",
		"opponent",
		"oppose",
		"opposing",
		"opposite",
		"oppressed",
		"oppressor",
		"opt",
		"opulently",
		"osmosis",
		"other",
		"otter",
		"ouch",
		"ought",
		"ounce",
		"outage",
		"outback",
		"outbid",
		"outboard",
		"outbound",
		"outbreak",
		"outburst",
		"outcast",
		"outclass",
		"outcome",
		"outdated",
		"outdoors",
		"outer",
		"outfield",
		"outfit",
		"outflank",
		"outgoing",
		"outgrow",
		"outhouse",
		"outing",
		"outlast",
		"outlet",
		"outline",
		"outlook",
		"outlying",
		"outmatch",
		"outmost",
		"outnumber",
		"outplayed",
		"outpost",
		"outpour",
		"output",
		"outrage",
		"outrank",
		"outreach",
		"outright",
		"outscore",
		"outsell",
		"outshine",
		"outshoot",
		"outsider",
		"outskirts",
		"outsmart",
		"outsource",
		"outspoken",
		"outtakes",
		"outthink",
		"outward",
		"outweigh",
		"outwit",
		"oval",
		"ovary",
		"oven",
		"overact",
		"overall",
		"overarch",
		"overbid",
		"overbill",
		"overbite",
		"overblown",
		"overboard",
		"overbook",
		"overbuilt",
		"overcast",
		"overcoat",
		"overcome",
		"overcook",
		"overcrowd",
		"overdraft",
		"overdrawn",
		"overdress",
		"overdrive",
		"overdue",
		"overeager",
		"overeater",
		"overexert",
		"overfed",
		"overfeed",
		"overfill",
		"overflow",
		"overfull",
		"overgrown",
		"overhand",
		"overhang",
		"overhaul",
		"overhead",
		"overhear",
		"overheat",
		"overhung",
		"overjoyed",
		"overkill",
		"overlabor",
		"overlaid",
		"overlap",
		"overlay",
		"overload",
		"overlook",
		"overlord",
		"overlying",
		"overnight",
		"overpass",
		"overpay",
		"overplant",
		"overplay",
		"overpower",
		"overprice",
		"overrate",
		"overreach",
		"overreact",
		"override",
		"overripe",
		"overrule",
		"overrun",
		"overshoot",
		"overshot",
		"oversight",
		"oversized",
		"oversleep",
		"oversold",
		"overspend",
		"overstate",
		"overstay",
		"overstep",
		"overstock",
		"overstuff",
		"oversweet",
		"overtake",
		"overthrow",
		"overtime",
		"overtly",
		"overtone",
		"overture",
		"overturn",
		"overuse",
		"overvalue",
		"overview",
		"overwrite",
		"owl",
		"oxford",
		"oxidant",
		"oxidation",
		"oxidize",
		"oxidizing",
		"oxygen",
		"oxymoron",
		"oyster",
		"ozone",
		"paced",
		"pacemaker",
		"pacific",
		"pacifier",
		"pacifism",
		"pacifist",
		"pacify",
		"padded",
		"padding",
		"paddle",
		"paddling",
		"padlock",
		"pagan",
		"pager",
		"paging",
		"pajamas",
		"palace",
		"palatable",
		"palm",
		"palpable",
		"palpitate",
		"paltry",
		"pampered",
		"pamperer",
		"pampers",
		"pamphlet",
		"panama",
		"pancake",
		"pancreas",
		"panda",
		"pandemic",
		"pang",
		"panhandle",
		"panic",
		"panning",
		"panorama",
		"panoramic",
		"panther",
		"pantomime",
		"pantry",
		"pants",
		"pantyhose",
		"paparazzi",
		"papaya",
		"paper",
		"paprika",
		"papyrus",
		"parabola",
		"parachute",
		"parade",
		"paradox",
		"paragraph",
		"parakeet",
		"paralegal",
		"paralyses",
		"paralysis",
		"paralyze",
		"paramedic",
		"parameter",
		"paramount",
		"parasail",
		"parasite",
		"parasitic",
		"parcel",
		"parched",
		"parchment",
		"pardon",
		"parish",
		"parka",
		"parking",
		"parkway",
		"parlor",
		"parmesan",
		"parole",
		"parrot",
		"parsley",
		"parsnip",
		"partake",
		"parted",
		"parting",
		"partition",
		"partly",
		"partner",
		"partridge",
		"party",
		"passable",
		"passably",
		"passage",
		"passcode",
		"passenger",
		"passerby",
		"passing",
		"passion",
		"passive",
		"passivism",
		"passover",
		"passport",
		"password",
		"pasta",
		"pasted",
		"pastel",
		"pastime",
		"pastor",
		"pastrami",
		"pasture",
		"pasty",
		"patchwork",
		"patchy",
		"paternal",
		"paternity",
		"path",
		"patience",
		"patient",
		"patio",
		"patriarch",
		"patriot",
		"patrol",
		"patronage",
		"patronize",
		"pauper",
		"pavement",
		"paver",
		"pavestone",
		"pavilion",
		"paving",
		"pawing",
		"payable",
		"payback",
		"paycheck",
		"payday",
		"payee",
		"payer",
		"paying",
		"payment",
		"payphone",
		"payroll",
		"pebble",
		"pebbly",
		"pecan",
		"pectin",
		"peculiar",
		"peddling",
		"pediatric",
		"pedicure",
		"pedigree",
		"pedometer",
		"pegboard",
		"pelican",
		"pellet",
		"pelt",
		"pelvis",
		"penalize",
		"penalty",
		"pencil",
		"pendant",
		"pending",
		"penholder",
		"penknife",
		"pennant",
		"penniless",
		"penny",
		"penpal",
		"pension",
		"pentagon",
		"pentagram",
		"pep",
		"perceive",
		"percent",
		"perch",
		"percolate",
		"perennial",
		"perfected",
		"perfectly",
		"perfume",
		"periscope",
		"perish",
		"perjurer",
		"perjury",
		"perkiness",
		"perky",
		"perm",
		"peroxide",
		"perpetual",
		"perplexed",
		"persecute",
		"persevere",
		"persuaded",
		"persuader",
		"pesky",
		"peso",
		"pessimism",
		"pessimist",
		"pester",
		"pesticide",
		"petal",
		"petite",
		"petition",
		"petri",
		"petroleum",
		"petted",
		"petticoat",
		"pettiness",
		"petty",
		"petunia",
		"phantom",
		"phobia",
		"phoenix",
		"phonebook",
		"phoney",
		"phonics",
		"phoniness",
		"phony",
		"phosphate",
		"photo",
		"phrase",
		"phrasing",
		"placard",
		"placate",
		"placidly",
		"plank",
		"planner",
		"plant",
		"plasma",
		"plaster",
		"plastic",
		"plated",
		"platform",
		"plating",
		"platinum",
		"platonic",
		"platter",
		"platypus",
		"plausible",
		"plausibly",
		"playable",
		"playback",
		"player",
		"playful",
		"playgroup",
		"playhouse",
		"playing",
		"playlist",
		"playmaker",
		"playmate",
		"playoff",
		"playpen",
		"playroom",
		"playset",
		"plaything",
		"playtime",
		"plaza",
		"pleading",
		"pleat",
		"pledge",
		"plentiful",
		"plenty",
		"plethora",
		"plexiglas",
		"pliable",
		"plod",
		"plop",
		"plot",
		"plow",
		"ploy",
		"pluck",
		"plug",
		"plunder",
		"plunging",
		"plural",
		"plus",
		"plutonium",
		"plywood",
		"poach",
		"pod",
		"poem",
		"poet",
		"pogo",
		"pointed",
		"pointer",
		"pointing",
		"pointless",
		"pointy",
		"poise",
		"poison",
		"poker",
		"poking",
		"polar",
		"police",
		"policy",
		"polio",
		"polish",
		"politely",
		"polka",
		"polo",
		"polyester",
		"polygon",
		"polygraph",
		"polymer",
		"poncho",
		"pond",
		"pony",
		"popcorn",
		"pope",
		"poplar",
		"popper",
		"poppy",
		"popsicle",
		"populace",
		"popular",
		"populate",
		"porcupine",
		"pork",
		"porous",
		"porridge",
		"portable",
		"portal",
		"portfolio",
		"porthole",
		"portion",
		"portly",
		"portside",
		"poser",
		"posh",
		"posing",
		"possible",
		"possibly",
		"possum",
		"postage",
		"postal",
		"postbox",
		"postcard",
		"posted",
		"poster",
		"posting",
		"postnasal",
		"posture",
		"postwar",
		"pouch",
		"pounce",
		"pouncing",
		"pound",
		"pouring",
		"pout",
		"powdered",
		"powdering",
		"powdery",
		"power",
		"powwow",
		"pox",
		"praising",
		"prance",
		"prancing",
		"pranker",
		"prankish",
		"prankster",
		"prayer",
		"praying",
		"preacher",
		"preaching",
		"preachy",
		"preamble",
		"precinct",
		"precise",
		"precision",
		"precook",
		"precut",
		"predator",
		"predefine",
		"predict",
		"preface",
		"prefix",
		"preflight",
		"preformed",
		"pregame",
		"pregnancy",
		"pregnant",
		"preheated",
		"prelaunch",
		"prelaw",
		"prelude",
		"premiere",
		"premises",
		"premium",
		"prenatal",
		"preoccupy",
		"preorder",
		"prepaid",
		"prepay",
		"preplan",
		"preppy",
		"preschool",
		"prescribe",
		"preseason",
		"preset",
		"preshow",
		"president",
		"presoak",
		"press",
		"presume",
		"presuming",
		"preteen",
		"pretended",
		"pretender",
		"pretense",
		"pretext",
		"pretty",
		"pretzel",
		"prevail",
		"prevalent",
		"prevent",
		"preview",
		"previous",
		"prewar",
		"prewashed",
		"prideful",
		"pried",
		"primal",
		"primarily",
		"primary",
		"primate",
		"primer",
		"primp",
		"princess",
		"print",
		"prior",
		"prism",
		"prison",
		"prissy",
		"pristine",
		"privacy",
		"private",
		"privatize",
		"prize",
		"proactive",
		"probable",
		"probably",
		"probation",
		"probe",
		"probing",
		"probiotic",
		"problem",
		"procedure",
		"process",
		"proclaim",
		"procreate",
		"procurer",
		"prodigal",
		"prodigy",
		"produce",
		"product",
		"profane",
		"profanity",
		"professed",
		"professor",
		"profile",
		"profound",
		"profusely",
		"progeny",
		"prognosis",
		"program",
		"progress",
		"projector",
		"prologue",
		"prolonged",
		"promenade",
		"prominent",
		"promoter",
		"promotion",
		"prompter",
		"promptly",
		"prone",
		"prong",
		"pronounce",
		"pronto",
		"proofing",
		"proofread",
		"proofs",
		"propeller",
		"properly",
		"property",
		"proponent",
		"proposal",
		"propose",
		"props",
		"prorate",
		"protector",
		"protegee",
		"proton",
		"prototype",
		"protozoan",
		"protract",
		"protrude",
		"proud",
		"provable",
		"proved",
		"proven",
		"provided",
		"provider",
		"providing",
		"province",
		"proving",
		"provoke",
		"provoking",
		"provolone",
		"prowess",
		"prowler",
		"prowling",
		"proximity",
		"proxy",
		"prozac",
		"prude",
		"prudishly",
		"prune",
		"pruning",
		"pry",
		"psychic",
		"public",
		"publisher",
		"pucker",
		"pueblo",
		"pug",
		"pull",
		"pulmonary",
		"pulp",
		"pulsate",
		"pulse",
		"pulverize",
		"puma",
		"pumice",
		"pummel",
		"punch",
		"punctual",
		"punctuate",
		"punctured",
		"pungent",
		"punisher",
		"punk",
		"pupil",
		"puppet",
		"puppy",
		"purchase",
		"pureblood",
		"purebred",
		"purely",
		"pureness",
		"purgatory",
		"purge",
		"purging",
		"purifier",
		"purify",
		"purist",
		"puritan",
		"purity",
		"purple",
		"purplish",
		"purposely",
		"purr",
		"purse",
		"pursuable",
		"pursuant",
		"pursuit",
		"purveyor",
		"pushcart",
		"pushchair",
		"pusher",
		"pushiness",
		"pushing",
		"pushover",
		"pushpin",
		"pushup",
		"pushy",
		"putdown",
		"putt",
		"puzzle",
		"puzzling",
		"pyramid",
		"pyromania",
		"python",
		"quack",
		"quadrant",
		"quail",
		"quaintly",
		"quake",
		"quaking",
		"qualified",
		"qualifier",
		"qualify",
		"quality",
		"qualm",
		"quantum",
		"quarrel",
		"quarry",
		"quartered",
		"quarterly",
		"quarters",
		"quartet",
		"quench",
		"query",
		"quicken",
		"quickly",
		"quickness",
		"quicksand",
		"quickstep",
		"quiet",
		"quill",
		"quilt",
		"quintet",
		"quintuple",
		"quirk",
		"quit",
		"quiver",
		"quizzical",
		"quotable",
		"quotation",
		"quote",
		"rabid",
		"race",
		"racing",
		"racism",
		"rack",
		"racoon",
		"radar",
		"radial",
		"radiance",
		"radiantly",
		"radiated",
		"radiation",
		"radiator",
		"radio",
		"radish",
		"raffle",
		"raft",
		"rage",
		"ragged",
		"raging",
		"ragweed",
		"raider",
		"railcar",
		"railing",
		"railroad",
		"railway",
		"raisin",
		"rake",
		"raking",
		"rally",
		"ramble",
		"rambling",
		"ramp",
		"ramrod",
		"ranch",
		"rancidity",
		"random",
		"ranged",
		"ranger",
		"ranging",
		"ranked",
		"ranking",
		"ransack",
		"ranting",
		"rants",
		"rare",
		"rarity",
		"rascal",
		"rash",
		"rasping",
		"ravage",
		"raven",
		"ravine",
		"raving",
		"ravioli",
		"ravishing",
		"reabsorb",
		"reach",
		"reacquire",
		"reaction",
		"reactive",
		"reactor",
		"reaffirm",
		"ream",
		"reanalyze",
		"reappear",
		"reapply",
		"reappoint",
		"reapprove",
		"rearrange",
		"rearview",
		"reason",
		"reassign",
		"reassure",
		"reattach",
		"reawake",
		"rebalance",
		"rebate",
		"rebel",
		"rebirth",
		"reboot",
		"reborn",
		"rebound",
		"rebuff",
		"rebuild",
		"rebuilt",
		"reburial",
		"rebuttal",
		"recall",
		"recant",
		"recapture",
		"recast",
		"recede",
		"recent",
		"recess",
		"recharger",
		"recipient",
		"recital",
		"recite",
		"reckless",
		"reclaim",
		"recliner",
		"reclining",
		"recluse",
		"reclusive",
		"recognize",
		"recoil",
		"recollect",
		"recolor",
		"reconcile",
		"reconfirm",
		"reconvene",
		"recopy",
		"record",
		"recount",
		"recoup",
		"recovery",
		"recreate",
		"rectal",
		"rectangle",
		"rectified",
		"rectify",
		"recycled",
		"recycler",
		"recycling",
		"reemerge",
		"reenact",
		"reenter",
		"reentry",
		"reexamine",
		"referable",
		"referee",
		"reference",
		"refill",
		"refinance",
		"refined",
		"refinery",
		"refining",
		"refinish",
		"reflected",
		"reflector",
		"reflex",
		"reflux",
		"refocus",
		"refold",
		"reforest",
		"reformat",
		"reformed",
		"reformer",
		"reformist",
		"refract",
		"refrain",
		"refreeze",
		"refresh",
		"refried",
		"refueling",
		"refund",
		"refurbish",
		"refurnish",
		"refusal",
		"refuse",
		"refusing",
		"refutable",
		"refute",
		"regain",
		"regalia",
		"regally",
		"reggae",
		"regime",
		"region",
		"register",
		"registrar",
		"registry",
		"regress",
		"regretful",
		"regroup",
		"regular",
		"regulate",
		"regulator",
		"rehab",
		"reheat",
		"rehire",
		"rehydrate",
		"reimburse",
		"reissue",
		"reiterate",
		"rejoice",
		"rejoicing",
		"rejoin",
		"rekindle",
		"relapse",
		"relapsing",
		"relatable",
		"related",
		"relation",
		"relative",
		"relax",
		"relay",
		"relearn",
		"release",
		"relenting",
		"reliable",
		"reliably",
		"reliance",
		"reliant",
		"relic",
		"relieve",
		"relieving",
		"relight",
		"relish",
		"relive",
		"reload",
		"relocate",
		"relock",
		"reluctant",
		"rely",
		"remake",
		"remark",
		"remarry",
		"rematch",
		"remedial",
		"remedy",
		"remember",
		"reminder",
		"remindful",
		"remission",
		"remix",
		"remnant",
		"remodeler",
		"remold",
		"remorse",
		"remote",
		"removable",
		"removal",
		"removed",
		"remover",
		"removing",
		"rename",
		"renderer",
		"rendering",
		"rendition",
		"renegade",
		"renewable",
		"renewably",
		"renewal",
		"renewed",
		"renounce",
		"renovate",
		"renovator",
		"rentable",
		"rental",
		"rented",
		"renter",
		"reoccupy",
		"reoccur",
		"reopen",
		"reorder",
		"repackage",
		"repacking",
		"repaint",
		"repair",
		"repave",
		"repaying",
		"repayment",
		"repeal",
		"repeated",
		"repeater",
		"repent",
		"rephrase",
		"replace",
		"replay",
		"replica",
		"reply",
		"reporter",
		"repose",
		"repossess",
		"repost",
		"repressed",
		"reprimand",
		"reprint",
		"reprise",
		"reproach",
		"reprocess",
		"reproduce",
		"reprogram",
		"reps",
		"reptile",
		"reptilian",
		"repugnant",
		"repulsion",
		"repulsive",
		"repurpose",
		"reputable",
		"reputably",
		"request",
		"require",
		"requisite",
		"reroute",
		"rerun",
		"resale",
		"resample",
		"rescuer",
		"reseal",
		"research",
		"reselect",
		"reseller",
		"resemble",
		"resend",
		"resent",
		"reset",
		"reshape",
		"reshoot",
		"reshuffle",
		"residence",
		"residency",
		"resident",
		"residual",
		"residue",
		"resigned",
		"resilient",
		"resistant",
		"resisting",
		"resize",
		"resolute",
		"resolved",
		"resonant",
		"resonate",
		"resort",
		"resource",
		"respect",
		"resubmit",
		"result",
		"resume",
		"resupply",
		"resurface",
		"resurrect",
		"retail",
		"retainer",
		"retaining",
		"retake",
		"retaliate",
		"retention",
		"rethink",
		"retinal",
		"retired",
		"retiree",
		"retiring",
		"retold",
		"retool",
		"retorted",
		"retouch",
		"retrace",
		"retract",
		"retrain",
		"retread",
		"retreat",
		"retrial",
		"retrieval",
		"retriever",
		"retry",
		"return",
		"retying",
		"retype",
		"reunion",
		"reunite",
		"reusable",
		"reuse",
		"reveal",
		"reveler",
		"revenge",
		"revenue",
		"reverb",
		"revered",
		"reverence",
		"reverend",
		"reversal",
		"reverse",
		"reversing",
		"reversion",
		"revert",
		"revisable",
		"revise",
		"revision",
		"revisit",
		"revivable",
		"revival",
		"reviver",
		"reviving",
		"revocable",
		"revoke",
		"revolt",
		"revolver",
		"revolving",
		"reward",
		"rewash",
		"rewind",
		"rewire",
		"reword",
		"rework",
		"rewrap",
		"rewrite",
		"rhyme",
		"ribbon",
		"ribcage",
		"rice",
		"riches",
		"richly",
		"richness",
		"rickety",
		"ricotta",
		"riddance",
		"ridden",
		"ride",
		"riding",
		"rifling",
		"rift",
		"rigging",
		"rigid",
		"rigor",
		"rimless",
		"rimmed",
		"rind",
		"rink",
		"rinse",
		"rinsing",
		"riot",
		"ripcord",
		"ripeness",
		"ripening",
		"ripping",
		"ripple",
		"rippling",
		"riptide",
		"rise",
		"rising",
		"risk",
		"risotto",
		"ritalin",
		"ritzy",
		"rival",
		"riverbank",
		"riverbed",
		"riverboat",
		"riverside",
		"riveter",
		"riveting",
		"roamer",
		"roaming",
		"roast",
		"robbing",
		"robe",
		"robin",
		"robotics",
		"robust",
		"rockband",
		"rocker",
		"rocket",
		"rockfish",
		"rockiness",
		"rocking",
		"rocklike",
		"rockslide",
		"rockstar",
		"rocky",
		"rogue",
		"roman",
		"romp",
		"rope",
		"roping",
		"roster",
		"rosy",
		"rotten",
		"rotting",
		"rotunda",
		"roulette",
		"rounding",
		"roundish",
		"roundness",
		"roundup",
		"roundworm",
		"routine",
		"routing",
		"rover",
		"roving",
		"royal",
		"rubbed",
		"rubber",
		"rubbing",
		"rubble",
		"rubdown",
		"ruby",
		"ruckus",
		"rudder",
		"rug",
		"ruined",
		"rule",
		"rumble",
		"rumbling",
		"rummage",
		"rumor",
		"runaround",
		"rundown",
		"runner",
		"running",
		"runny",
		"runt",
		"runway",
		"rupture",
		"rural",
		"ruse",
		"rush",
		"rust",
		"rut",
		"sabbath",
		"sabotage",
		"sacrament",
		"sacred",
		"sacrifice",
		"sadden",
		"saddlebag",
		"saddled",
		"saddling",
		"sadly",
		"sadness",
		"safari",
		"safeguard",
		"safehouse",
		"safely",
		"safeness",
		"saffron",
		"saga",
		"sage",
		"sagging",
		"saggy",
		"said",
		"saint",
		"sake",
		"salad",
		"salami",
		"salaried",
		"salary",
		"saline",
		"salon",
		"saloon",
		"salsa",
		"salt",
		"salutary",
		"salute",
		"salvage",
		"salvaging",
		"salvation",
		"same",
		"sample",
		"sampling",
		"sanction",
		"sanctity",
		"sanctuary",
		"sandal",
		"sandbag",
		"sandbank",
		"sandbar",
		"sandblast",
		"sandbox",
		"sanded",
		"sandfish",
		"sanding",
		"sandlot",
		"sandpaper",
		"sandpit",
		"sandstone",
		"sandstorm",
		"sandworm",
		"sandy",
		"sanitary",
		"sanitizer",
		"sank",
		"santa",
		"sapling",
		"sappiness",
		"sappy",
		"sarcasm",
		"sarcastic",
		"sardine",
		"sash",
		"sasquatch",
		"sassy",
		"satchel",
		"satiable",
		"satin",
		"satirical",
		"satisfied",
		"satisfy",
		"saturate",
		"saturday",
		"sauciness",
		"saucy",
		"sauna",
		"savage",
		"savanna",
		"saved",
		"savings",
		"savior",
		"savor",
		"saxophone",
		"say",
		"scabbed",
		"scabby",
		"scalded",
		"scalding",
		"scale",
		"scaling",
		"scallion",
		"scallop",
		"scalping",
		"scam",
		"scandal",
		"scanner",
		"scanning",
		"scant",
		"scapegoat",
		"scarce",
		"scarcity",
		"scarecrow",
		"scared",
		"scarf",
		"scarily",
		"scariness",
		"scarring",
		"scary",
		"scavenger",
		"scenic",
		"schedule",
		"schematic",
		"scheme",
		"scheming",
		"schilling",
		"schnapps",
		"scholar",
		"science",
		"scientist",
		"scion",
		"scoff",
		"scolding",
		"scone",
		"scoop",
		"scooter",
		"scope",
		"scorch",
		"scorebook",
		"scorecard",
		"scored",
		"scoreless",
		"scorer",
		"scoring",
		"scorn",
		"scorpion",
		"scotch",
		"scoundrel",
		"scoured",
		"scouring",
		"scouting",
		"scouts",
		"scowling",
		"scrabble",
		"scraggly",
		"scrambled",
		"scrambler",
		"scrap",
		"scratch",
		"scrawny",
		"screen",
		"scribble",
		"scribe",
		"scribing",
		"scrimmage",
		"script",
		"scroll",
		"scrooge",
		"scrounger",
		"scrubbed",
		"scrubber",
		"scruffy",
		"scrunch",
		"scrutiny",
		"scuba",
		"scuff",
		"sculptor",
		"sculpture",
		"scurvy",
		"scuttle",
		"secluded",
		"secluding",
		"seclusion",
		"second",
		"secrecy",
		"secret",
		"sectional",
		"sector",
		"secular",
		"securely",
		"security",
		"sedan",
		"sedate",
		"sedation",
		"sedative",
		"sediment",
		"seduce",
		"seducing",
		"segment",
		"seismic",
		"seizing",
		"seldom",
		"selected",
		"selection",
		"selective",
		"selector",
		"self",
		"seltzer",
		"semantic",
		"semester",
		"semicolon",
		"semifinal",
		"seminar",
		"semisoft",
		"semisweet",
		"senate",
		"senator",
		"send",
		"senior",
		"senorita",
		"sensation",
		"sensitive",
		"sensitize",
		"sensually",
		"sensuous",
		"sepia",
		"september",
		"septic",
		"septum",
		"sequel",
		"sequence",
		"sequester",
		"series",
		"sermon",
		"serotonin",
		"serpent",
		"serrated",
		"serve",
		"service",
		"serving",
		"sesame",
		"sessions",
		"setback",
		"setting",
		"settle",
		"settling",
		"setup",
		"sevenfold",
		"seventeen",
		"seventh",
		"seventy",
		"severity",
		"shabby",
		"shack",
		"shaded",
		"shadily",
		"shadiness",
		"shading",
		"shadow",
		"shady",
		"shaft",
		"shakable",
		"shakily",
		"shakiness",
		"shaking",
		"shaky",
		"shale",
		"shallot",
		"shallow",
		"shame",
		"shampoo",
		"shamrock",
		"shank",
		"shanty",
		"shape",
		"shaping",
		"share",
		"sharpener",
		"sharper",
		"sharpie",
		"sharply",
		"sharpness",
		"shawl",
		"sheath",
		"shed",
		"sheep",
		"sheet",
		"shelf",
		"shell",
		"shelter",
		"shelve",
		"shelving",
		"sherry",
		"shield",
		"shifter",
		"shifting",
		"shiftless",
		"shifty",
		"shimmer",
		"shimmy",
		"shindig",
		"shine",
		"shingle",
		"shininess",
		"shining",
		"shiny",
		"ship",
		"shirt",
		"shivering",
		"shock",
		"shone",
		"shoplift",
		"shopper",
		"shopping",
		"shoptalk",
		"shore",
		"shortage",
		"shortcake",
		"shortcut",
		"shorten",
		"shorter",
		"shorthand",
		"shortlist",
		"shortly",
		"shortness",
		"shorts",
		"shortwave",
		"shorty",
		"shout",
		"shove",
		"showbiz",
		"showcase",
		"showdown",
		"shower",
		"showgirl",
		"showing",
		"showman",
		"shown",
		"showoff",
		"showpiece",
		"showplace",
		"showroom",
		"showy",
		"shrank",
		"shrapnel",
		"shredder",
		"shredding",
		"shrewdly",
		"shriek",
		"shrill",
		"shrimp",
		"shrine",
		"shrink",
		"shrivel",
		"shrouded",
		"shrubbery",
		"shrubs",
		"shrug",
		"shrunk",
		"shucking",
		"shudder",
		"shuffle",
		"shuffling",
		"shun",
		"shush",
		"shut",
		"shy",
		"siamese",
		"siberian",
		"sibling",
		"siding",
		"sierra",
		"siesta",
		"sift",
		"sighing",
		"silenced",
		"silencer",
		"silent",
		"silica",
		"silicon",
		"silk",
		"silliness",
		"silly",
		"silo",
		"silt",
		"silver",
		"similarly",
		"simile",
		"simmering",
		"simple",
		"simplify",
		"simply",
		"sincere",
		"sincerity",
		"singer",
		"singing",
		"single",
		"singular",
		"sinister",
		"sinless",
		"sinner",
		"sinuous",
		"sip",
		"siren",
		"sister",
		"sitcom",
		"sitter",
		"sitting",
		"situated",
		"situation",
		"sixfold",
		"sixteen",
		"sixth",
		"sixties",
		"sixtieth",
		"sixtyfold",
		"sizable",
		"sizably",
		"size",
		"sizing",
		"sizzle",
		"sizzling",
		"skater",
		"skating",
		"skedaddle",
		"skeletal",
		"skeleton",
		"skeptic",
		"sketch",
		"skewed",
		"skewer",
		"skid",
		"skied",
		"skier",
		"skies",
		"skiing",
		"skilled",
		"skillet",
		"skillful",
		"skimmed",
		"skimmer",
		"skimming",
		"skimpily",
		"skincare",
		"skinhead",
		"skinless",
		"skinning",
		"skinny",
		"skintight",
		"skipper",
		"skipping",
		"skirmish",
		"skirt",
		"skittle",
		"skydiver",
		"skylight",
		"skyline",
		"skype",
		"skyrocket",
		"skyward",
		"slab",
		"slacked",
		"slacker",
		"slacking",
		"slackness",
		"slacks",
		"slain",
		"slam",
		"slander",
		"slang",
		"slapping",
		"slapstick",
		"slashed",
		"slashing",
		"slate",
		"slather",
		"slaw",
		"sled",
		"sleek",
		"sleep",
		"sleet",
		"sleeve",
		"slept",
		"sliceable",
		"sliced",
		"slicer",
		"slicing",
		"slick",
		"slider",
		"slideshow",
		"sliding",
		"slighted",
		"slighting",
		"slightly",
		"slimness",
		"slimy",
		"slinging",
		"slingshot",
		"slinky",
		"slip",
		"slit",
		"sliver",
		"slobbery",
		"slogan",
		"sloped",
		"sloping",
		"sloppily",
		"sloppy",
		"slot",
		"slouching",
		"slouchy",
		"sludge",
		"slug",
		"slum",
		"slurp",
		"slush",
		"sly",
		"small",
		"smartly",
		"smartness",
		"smasher",
		"smashing",
		"smashup",
		"smell",
		"smelting",
		"smile",
		"smilingly",
		"smirk",
		"smite",
		"smith",
		"smitten",
		"smock",
		"smog",
		"smoked",
		"smokeless",
		"smokiness",
		"smoking",
		"smoky",
		"smolder",
		"smooth",
		"smother",
		"smudge",
		"smudgy",
		"smuggler",
		"smuggling",
		"smugly",
		"smugness",
		"snack",
		"snagged",
		"snaking",
		"snap",
		"snare",
		"snarl",
		"snazzy",
		"sneak",
		"sneer",
		"sneeze",
		"sneezing",
		"snide",
		"sniff",
		"snippet",
		"snipping",
		"snitch",
		"snooper",
		"snooze",
		"snore",
		"snoring",
		"snorkel",
		"snort",
		"snout",
		"snowbird",
		"snowboard",
		"snowbound",
		"snowcap",
		"snowdrift",
		"snowdrop",
		"snowfall",
		"snowfield",
		"snowflake",
		"snowiness",
		"snowless",
		"snowman",
		"snowplow",
		"snowshoe",
		"snowstorm",
		"snowsuit",
		"snowy",
		"snub",
		"snuff",
		"snuggle",
		"snugly",
		"snugness",
		"speak",
		"spearfish",
		"spearhead",
		"spearman",
		"spearmint",
		"species",
		"specimen",
		"specked",
		"speckled",
		"specks",
		"spectacle",
		"spectator",
		"spectrum",
		"speculate",
		"speech",
		"speed",
		"spellbind",
		"speller",
		"spelling",
		"spendable",
		"spender",
		"spending",
		"spent",
		"spew",
		"sphere",
		"spherical",
		"sphinx",
		"spider",
		"spied",
		"spiffy",
		"spill",
		"spilt",
		"spinach",
		"spinal",
		"spindle",
		"spinner",
		"spinning",
		"spinout",
		"spinster",
		"spiny",
		"spiral",
		"spirited",
		"spiritism",
		"spirits",
		"spiritual",
		"splashed",
		"splashing",
		"splashy",
		"splatter",
		"spleen",
		"splendid",
		"splendor",
		"splice",
		"splicing",
		"splinter",
		"splotchy",
		"splurge",
		"spoilage",
		"spoiled",
		"spoiler",
		"spoiling",
		"spoils",
		"spoken",
		"spokesman",
		"sponge",
		"spongy",
		"sponsor",
		"spoof",
		"spookily",
		"spooky",
		"spool",
		"spoon",
		"spore",
		"sporting",
		"sports",
		"sporty",
		"spotless",
		"spotlight",
		"spotted",
		"spotter",
		"spotting",
		"spotty",
		"spousal",
		"spouse",
		"spout",
		"sprain",
		"sprang",
		"sprawl",
		"spray",
		"spree",
		"sprig",
		"spring",
		"sprinkled",
		"sprinkler",
		"sprint",
		"sprite",
		"sprout",
		"spruce",
		"sprung",
		"spry",
		"spud",
		"spur",
		"sputter",
		"spyglass",
		"squabble",
		"squad",
		"squall",
		"squander",
		"squash",
		"squatted",
		"squatter",
		"squatting",
		"squeak",
		"squealer",
		"squealing",
		"squeamish",
		"squeegee",
		"squeeze",
		"squeezing",
		"squid",
		"squiggle",
		"squiggly",
		"squint",
		"squire",
		"squirt",
		"squishier",
		"squishy",
		"stability",
		"stabilize",
		"stable",
		"stack",
		"stadium",
		"staff",
		"stage",
		"staging",
		"stagnant",
		"stagnate",
		"stainable",
		"stained",
		"staining",
		"stainless",
		"stalemate",
		"staleness",
		"stalling",
		"stallion",
		"stamina",
		"stammer",
		"stamp",
		"stand",
		"stank",
		"staple",
		"stapling",
		"starboard",
		"starch",
		"stardom",
		"stardust",
		"starfish",
		"stargazer",
		"staring",
		"stark",
		"starless",
		"starlet",
		"starlight",
		"starlit",
		"starring",
		"starry",
		"starship",
		"starter",
		"starting",
		"startle",
		"startling",
		"startup",
		"starved",
		"starving",
		"stash",
		"state",
		"static",
		"statistic",
		"statue",
		"stature",
		"status",
		"statute",
		"statutory",
		"staunch",
		"stays",
		"steadfast",
		"steadier",
		"steadily",
		"steadying",
		"steam",
		"steed",
		"steep",
		"steerable",
		"steering",
		"steersman",
		"stegosaur",
		"stellar",
		"stem",
		"stench",
		"stencil",
		"step",
		"stereo",
		"sterile",
		"sterility",
		"sterilize",
		"sterling",
		"sternness",
		"sternum",
		"stew",
		"stick",
		"stiffen",
		"stiffly",
		"stiffness",
		"stifle",
		"stifling",
		"stillness",
		"stilt",
		"stimulant",
		"stimulate",
		"stimuli",
		"stimulus",
		"stinger",
		"stingily",
		"stinging",
		"stingray",
		"stingy",
		"stinking",
		"stinky",
		"stipend",
		"stipulate",
		"stir",
		"stitch",
		"stock",
		"stoic",
		"stoke",
		"stole",
		"stomp",
		"stonewall",
		"stoneware",
		"stonework",
		"stoning",
		"stony",
		"stood",
		"stooge",
		"stool",
		"stoop",
		"stoplight",
		"stoppable",
		"stoppage",
		"stopped",
		"stopper",
		"stopping",
		"stopwatch",
		"storable",
		"storage",
		"storeroom",
		"storewide",
		"storm",
		"stout",
		"stove",
		"stowaway",
		"stowing",
		"straddle",
		"straggler",
		"strained",
		"strainer",
		"straining",
		"strangely",
		"stranger",
		"strangle",
		"strategic",
		"strategy",
		"stratus",
		"straw",
		"stray",
		"streak",
		"stream",
		"street",
		"strength",
		"strenuous",
		"strep",
		"stress",
		"stretch",
		"strewn",
		"stricken",
		"strict",
		"stride",
		"strife",
		"strike",
		"striking",
		"strive",
		"striving",
		"strobe",
		"strode",
		"stroller",
		"strongbox",
		"strongly",
		"strongman",
		"struck",
		"structure",
		"strudel",
		"struggle",
		"strum",
		"strung",
		"strut",
		"stubbed",
		"stubble",
		"stubbly",
		"stubborn",
		"stucco",
		"stuck",
		"student",
		"studied",
		"studio",
		"study",
		"stuffed",
		"stuffing",
		"stuffy",
		"stumble",
		"stumbling",
		"stump",
		"stung",
		"stunned",
		"stunner",
		"stunning",
		"stunt",
		"stupor",
		"sturdily",
		"sturdy",
		"styling",
		"stylishly",
		"stylist",
		"stylized",
		"stylus",
		"suave",
		"subarctic",
		"subatomic",
		"subdivide",
		"subdued",
		"subduing",
		"subfloor",
		"subgroup",
		"subheader",
		"subject",
		"sublease",
		"sublet",
		"sublevel",
		"sublime",
		"submarine",
		"submerge",
		"submersed",
		"submitter",
		"subpanel",
		"subpar",
		"subplot",
		"subprime",
		"subscribe",
		"subscript",
		"subsector",
		"subside",
		"subsiding",
		"subsidize",
		"subsidy",
		"subsoil",
		"subsonic",
		"substance",
		"subsystem",
		"subtext",
		"subtitle",
		"subtly",
		"subtotal",
		"subtract",
		"subtype",
		"suburb",
		"subway",
		"subwoofer",
		"subzero",
		"succulent",
		"such",
		"suction",
		"sudden",
		"sudoku",
		"suds",
		"sufferer",
		"suffering",
		"suffice",
		"suffix",
		"suffocate",
		"suffrage",
		"sugar",
		"suggest",
		"suing",
		"suitable",
		"suitably",
		"suitcase",
		"suitor",
		"sulfate",
		"sulfide",
		"sulfite",
		"sulfur",
		"sulk",
		"sullen",
		"sulphate",
		"sulphuric",
		"sultry",
		"superbowl",
		"superglue",
		"superhero",
		"superior",
		"superjet",
		"superman",
		"supermom",
		"supernova",
		"supervise",
		"supper",
		"supplier",
		"supply",
		"support",
		"supremacy",
		"supreme",
		"surcharge",
		"surely",
		"sureness",
		"surface",
		"surfacing",
		"surfboard",
		"surfer",
		"surgery",
		"surgical",
		"surging",
		"surname",
		"surpass",
		"surplus",
		"surprise",
		"surreal",
		"surrender",
		"surrogate",
		"surround",
		"survey",
		"survival",
		"survive",
		"surviving",
		"survivor",
		"sushi",
		"suspect",
		"suspend",
		"suspense",
		"sustained",
		"sustainer",
		"swab",
		"swaddling",
		"swagger",
		"swampland",
		"swan",
		"swapping",
		"swarm",
		"sway",
		"swear",
		"sweat",
		"sweep",
		"swell",
		"swept",
		"swerve",
		"swifter",
		"swiftly",
		"swiftness",
		"swimmable",
		"swimmer",
		"swimming",
		"swimsuit",
		"swimwear",
		"swinger",
		"swinging",
		"swipe",
		"swirl",
		"switch",
		"swivel",
		"swizzle",
		"swooned",
		"swoop",
		"swoosh",
		"swore",
		"sworn",
		"swung",
		"sycamore",
		"sympathy",
		"symphonic",
		"symphony",
		"symptom",
		"synapse",
		"syndrome",
		"synergy",
		"synopses",
		"synopsis",
		"synthesis",
		"synthetic",
		"syrup",
		"system",
		"t-shirt",
		"tabasco",
		"tabby",
		"tableful",
		"tables",
		"tablet",
		"tableware",
		"tabloid",
		"tackiness",
		"tacking",
		"tackle",
		"tackling",
		"tacky",
		"taco",
		"tactful",
		"tactical",
		"tactics",
		"tactile",
		"tactless",
		"tadpole",
		"taekwondo",
		"tag",
		"tainted",
		"take",
		"taking",
		"talcum",
		"talisman",
		"tall",
		"talon",
		"tamale",
		"tameness",
		"tamer",
		"tamper",
		"tank",
		"tanned",
		"tannery",
		"tanning",
		"tantrum",
		"tapeless",
		"tapered",
		"tapering",
		"tapestry",
		"tapioca",
		"tapping",
		"taps",
		"tarantula",
		"target",
		"tarmac",
		"tarnish",
		"tarot",
		"tartar",
		"tartly",
		"tartness",
		"task",
		"tassel",
		"taste",
		"tastiness",
		"tasting",
		"tasty",
		"tattered",
		"tattle",
		"tattling",
		"tattoo",
		"taunt",
		"tavern",
		"thank",
		"that",
		"thaw",
		"theater",
		"theatrics",
		"thee",
		"theft",
		"theme",
		"theology",
		"theorize",
		"thermal",
		"thermos",
		"thesaurus",
		"these",
		"thesis",
		"thespian",
		"thicken",
		"thicket",
		"thickness",
		"thieving",
		"thievish",
		"thigh",
		"thimble",
		"thing",
		"think",
		"thinly",
		"thinner",
		"thinness",
		"thinning",
		"thirstily",
		"thirsting",
		"thirsty",
		"thirteen",
		"thirty",
		"thong",
		"thorn",
		"those",
		"thousand",
		"thrash",
		"thread",
		"threaten",
		"threefold",
		"thrift",
		"thrill",
		"thrive",
		"thriving",
		"throat",
		"throbbing",
		"throng",
		"throttle",
		"throwaway",
		"throwback",
		"thrower",
		"throwing",
		"thud",
		"thumb",
		"thumping",
		"thursday",
		"thus",
		"thwarting",
		"thyself",
		"tiara",
		"tibia",
		"tidal",
		"tidbit",
		"tidiness",
		"tidings",
		"tidy",
		"tiger",
		"tighten",
		"tightly",
		"tightness",
		"tightrope",
		"tightwad",
		"tigress",
		"tile",
		"tiling",
		"till",
		"tilt",
		"timid",
		"timing",
		"timothy",
		"tinderbox",
		"tinfoil",
		"tingle",
		"tingling",
		"tingly",
		"tinker",
		"tinkling",
		"tinsel",
		"tinsmith",
		"tint",
		"tinwork",
		"tiny",
		"tipoff",
		"tipped",
		"tipper",
		"tipping",
		"tiptoeing",
		"tiptop",
		"tiring",
		"tissue",
		"trace",
		"tracing",
		"track",
		"traction",
		"tractor",
		"trade",
		"trading",
		"tradition",
		"traffic",
		"tragedy",
		"trailing",
		"trailside",
		"train",
		"traitor",
		"trance",
		"tranquil",
		"transfer",
		"transform",
		"translate",
		"transpire",
		"transport",
		"transpose",
		"trapdoor",
		"trapeze",
		"trapezoid",
		"trapped",
		"trapper",
		"trapping",
		"traps",
		"trash",
		"travel",
		"traverse",
		"travesty",
		"tray",
		"treachery",
		"treading",
		"treadmill",
		"treason",
		"treat",
		"treble",
		"tree",
		"trekker",
		"tremble",
		"trembling",
		"tremor",
		"trench",
		"trend",
		"trespass",
		"triage",
		"trial",
		"triangle",
		"tribesman",
		"tribunal",
		"tribune",
		"tributary",
		"tribute",
		"triceps",
		"trickery",
		"trickily",
		"tricking",
		"trickle",
		"trickster",
		"tricky",
		"tricolor",
		"tricycle",
		"trident",
		"tried",
		"trifle",
		"trifocals",
		"trillion",
		"trilogy",
		"trimester",
		"trimmer",
		"trimming",
		"trimness",
		"trinity",
		"trio",
		"tripod",
		"tripping",
		"triumph",
		"trivial",
		"trodden",
		"trolling",
		"trombone",
		"trophy",
		"tropical",
		"tropics",
		"trouble",
		"troubling",
		"trough",
		"trousers",
		"trout",
		"trowel",
		"truce",
		"truck",
		"truffle",
		"trump",
		"trunks",
		"trustable",
		"trustee",
		"trustful",
		"trusting",
		"trustless",
		"truth",
		"try",
		"tubby",
		"tubeless",
		"tubular",
		"tucking",
		"tuesday",
		"tug",
		"tuition",
		"tulip",
		"tumble",
		"tumbling",
		"tummy",
		"turban",
		"turbine",
		"turbofan",
		"turbojet",
		"turbulent",
		"turf",
		"turkey",
		"turmoil",
		"turret",
		"turtle",
		"tusk",
		"tutor",
		"tutu",
		"tux",
		"tweak",
		"tweed",
		"tweet",
		"tweezers",
		"twelve",
		"twentieth",
		"twenty",
		"twerp",
		"twice",
		"twiddle",
		"twiddling",
		"twig",
		"twilight",
		"twine",
		"twins",
		"twirl",
		"twistable",
		"twisted",
		"twister",
		"twisting",
		"twisty",
		"twitch",
		"twitter",
		"tycoon",
		"tying",
		"tyke",
		"udder",
		"ultimate",
		"ultimatum",
		"ultra",
		"umbilical",
		"umbrella",
		"umpire",
		"unabashed",
		"unable",
		"unadorned",
		"unadvised",
		"unafraid",
		"unaired",
		"unaligned",
		"unaltered",
		"unarmored",
		"unashamed",
		"unaudited",
		"unawake",
		"unaware",
		"unbaked",
		"unbalance",
		"unbeaten",
		"unbend",
		"unbent",
		"unbiased",
		"unbitten",
		"unblended",
		"unblessed",
		"unblock",
		"unbolted",
		"unbounded",
		"unboxed",
		"unbraided",
		"unbridle",
		"unbroken",
		"unbuckled",
		"unbundle",
		"unburned",
		"unbutton",
		"uncanny",
		"uncapped",
		"uncaring",
		"uncertain",
		"unchain",
		"unchanged",
		"uncharted",
		"uncheck",
		"uncivil",
		"unclad",
		"unclaimed",
		"unclamped",
		"unclasp",
		"uncle",
		"unclip",
		"uncloak",
		"unclog",
		"unclothed",
		"uncoated",
		"uncoiled",
		"uncolored",
		"uncombed",
		"uncommon",
		"uncooked",
		"uncork",
		"uncorrupt",
		"uncounted",
		"uncouple",
		"uncouth",
		"uncover",
		"uncross",
		"uncrown",
		"uncrushed",
		"uncured",
		"uncurious",
		"uncurled",
		"uncut",
		"undamaged",
		"undated",
		"undaunted",
		"undead",
		"undecided",
		"undefined",
		"underage",
		"underarm",
		"undercoat",
		"undercook",
		"undercut",
		"underdog",
		"underdone",
		"underfed",
		"underfeed",
		"underfoot",
		"undergo",
		"undergrad",
		"underhand",
		"underline",
		"underling",
		"undermine",
		"undermost",
		"underpaid",
		"underpass",
		"underpay",
		"underrate",
		"undertake",
		"undertone",
		"undertook",
		"undertow",
		"underuse",
		"underwear",
		"underwent",
		"underwire",
		"undesired",
		"undiluted",
		"undivided",
		"undocked",
		"undoing",
		"undone",
		"undrafted",
		"undress",
		"undrilled",
		"undusted",
		"undying",
		"unearned",
		"unearth",
		"unease",
		"uneasily",
		"uneasy",
		"uneatable",
		"uneaten",
		"unedited",
		"unelected",
		"unending",
		"unengaged",
		"unenvied",
		"unequal",
		"unethical",
		"uneven",
		"unexpired",
		"unexposed",
		"unfailing",
		"unfair",
		"unfasten",
		"unfazed",
		"unfeeling",
		"unfiled",
		"unfilled",
		"unfitted",
		"unfitting",
		"unfixable",
		"unfixed",
		"unflawed",
		"unfocused",
		"unfold",
		"unfounded",
		"unframed",
		"unfreeze",
		"unfrosted",
		"unfrozen",
		"unfunded",
		"unglazed",
		"ungloved",
		"unglue",
		"ungodly",
		"ungraded",
		"ungreased",
		"unguarded",
		"unguided",
		"unhappily",
		"unhappy",
		"unharmed",
		"unhealthy",
		"unheard",
		"unhearing",
		"unheated",
		"unhelpful",
		"unhidden",
		"unhinge",
		"unhitched",
		"unholy",
		"unhook",
		"unicorn",
		"unicycle",
		"unified",
		"unifier",
		"uniformed",
		"uniformly",
		"unify",
		"unimpeded",
		"uninjured",
		"uninstall",
		"uninsured",
		"uninvited",
		"union",
		"uniquely",
		"unisexual",
		"unison",
		"unissued",
		"unit",
		"universal",
		"universe",
		"unjustly",
		"unkempt",
		"unkind",
		"unknotted",
		"unknowing",
		"unknown",
		"unlaced",
		"unlatch",
		"unlawful",
		"unleaded",
		"unlearned",
		"unleash",
		"unless",
		"unleveled",
		"unlighted",
		"unlikable",
		"unlimited",
		"unlined",
		"unlinked",
		"unlisted",
		"unlit",
		"unlivable",
		"unloaded",
		"unloader",
		"unlocked",
		"unlocking",
		"unlovable",
		"unloved",
		"unlovely",
		"unloving",
		"unluckily",
		"unlucky",
		"unmade",
		"unmanaged",
		"unmanned",
		"unmapped",
		"unmarked",
		"unmasked",
		"unmasking",
		"unmatched",
		"unmindful",
		"unmixable",
		"unmixed",
		"unmolded",
		"unmoral",
		"unmovable",
		"unmoved",
		"unmoving",
		"unnamable",
		"unnamed",
		"unnatural",
		"unneeded",
		"unnerve",
		"unnerving",
		"unnoticed",
		"unopened",
		"unopposed",
		"unpack",
		"unpadded",
		"unpaid",
		"unpainted",
		"unpaired",
		"unpaved",
		"unpeeled",
		"unpicked",
		"unpiloted",
		"unpinned",
		"unplanned",
		"unplanted",
		"unpleased",
		"unpledged",
		"unplowed",
		"unplug",
		"unpopular",
		"unproven",
		"unquote",
		"unranked",
		"unrated",
		"unraveled",
		"unreached",
		"unread",
		"unreal",
		"unreeling",
		"unrefined",
		"unrelated",
		"unrented",
		"unrest",
		"unretired",
		"unrevised",
		"unrigged",
		"unripe",
		"unrivaled",
		"unroasted",
		"unrobed",
		"unroll",
		"unruffled",
		"unruly",
		"unrushed",
		"unsaddle",
		"unsafe",
		"unsaid",
		"unsalted",
		"unsaved",
		"unsavory",
		"unscathed",
		"unscented",
		"unscrew",
		"unsealed",
		"unseated",
		"unsecured",
		"unseeing",
		"unseemly",
		"unseen",
		"unselect",
		"unselfish",
		"unsent",
		"unsettled",
		"unshackle",
		"unshaken",
		"unshaved",
		"unshaven",
		"unsheathe",
		"unshipped",
		"unsightly",
		"unsigned",
		"unskilled",
		"unsliced",
		"unsmooth",
		"unsnap",
		"unsocial",
		"unsoiled",
		"unsold",
		"unsolved",
		"unsorted",
		"unspoiled",
		"unspoken",
		"unstable",
		"unstaffed",
		"unstamped",
		"unsteady",
		"unsterile",
		"unstirred",
		"unstitch",
		"unstopped",
		"unstuck",
		"unstuffed",
		"unstylish",
		"unsubtle",
		"unsubtly",
		"unsuited",
		"unsure",
		"unsworn",
		"untagged",
		"untainted",
		"untaken",
		"untamed",
		"untangled",
		"untapped",
		"untaxed",
		"unthawed",
		"unthread",
		"untidy",
		"untie",
		"until",
		"untimed",
		"untimely",
		"untitled",
		"untoasted",
		"untold",
		"untouched",
		"untracked",
		"untrained",
		"untreated",
		"untried",
		"untrimmed",
		"untrue",
		"untruth",
		"unturned",
		"untwist",
		"untying",
		"unusable",
		"unused",
		"unusual",
		"unvalued",
		"unvaried",
		"unvarying",
		"unveiled",
		"unveiling",
		"unvented",
		"unviable",
		"unvisited",
		"unvocal",
		"unwanted",
		"unwarlike",
		"unwary",
		"unwashed",
		"unwatched",
		"unweave",
		"unwed",
		"unwelcome",
		"unwell",
		"unwieldy",
		"unwilling",
		"unwind",
		"unwired",
		"unwitting",
		"unwomanly",
		"unworldly",
		"unworn",
		"unworried",
		"unworthy",
		"unwound",
		"unwoven",
		"unwrapped",
		"unwritten",
		"unzip",
		"upbeat",
		"upchuck",
		"upcoming",
		"upcountry",
		"update",
		"upfront",
		"upgrade",
		"upheaval",
		"upheld",
		"uphill",
		"uphold",
		"uplifted",
		"uplifting",
		"upload",
		"upon",
		"upper",
		"upright",
		"uprising",
		"upriver",
		"uproar",
		"uproot",
		"upscale",
		"upside",
		"upstage",
		"upstairs",
		"upstart",
		"upstate",
		"upstream",
		"upstroke",
		"upswing",
		"uptake",
		"uptight",
		"uptown",
		"upturned",
		"upward",
		"upwind",
		"uranium",
		"urban",
		"urchin",
		"urethane",
		"urgency",
		"urgent",
		"urging",
		"urologist",
		"urology",
		"usable",
		"usage",
		"useable",
		"used",
		"uselessly",
		"user",
		"usher",
		"usual",
		"utensil",
		"utility",
		"utilize",
		"utmost",
		"utopia",
		"utter",
		"vacancy",
		"vacant",
		"vacate",
		"vacation",
		"vagabond",
		"vagrancy",
		"vagrantly",
		"vaguely",
		"vagueness",
		"valiant",
		"valid",
		"valium",
		"valley",
		"valuables",
		"value",
		"vanilla",
		"vanish",
		"vanity",
		"vanquish",
		"vantage",
		"vaporizer",
		"variable",
		"variably",
		"varied",
		"variety",
		"various",
		"varmint",
		"varnish",
		"varsity",
		"varying",
		"vascular",
		"vaseline",
		"vastly",
		"vastness",
		"veal",
		"vegan",
		"veggie",
		"vehicular",
		"velcro",
		"velocity",
		"velvet",
		"vendetta",
		"vending",
		"vendor",
		"veneering",
		"vengeful",
		"venomous",
		"ventricle",
		"venture",
		"venue",
		"venus",
		"verbalize",
		"verbally",
		"verbose",
		"verdict",
		"verify",
		"verse",
		"version",
		"versus",
		"vertebrae",
		"vertical",
		"vertigo",
		"very",
		"vessel",
		"vest",
		"veteran",
		"veto",
		"vexingly",
		"viability",
		"viable",
		"vibes",
		"vice",
		"vicinity",
		"victory",
		"video",
		"viewable",
		"viewer",
		"viewing",
		"viewless",
		"viewpoint",
		"vigorous",
		"village",
		"villain",
		"vindicate",
		"vineyard",
		"vintage",
		"violate",
		"violation",
		"violator",
		"violet",
		"violin",
		"viper",
		"viral",
		"virtual",
		"virtuous",
		"virus",
		"visa",
		"viscosity",
		"viscous",
		"viselike",
		"visible",
		"visibly",
		"vision",
		"visiting",
		"visitor",
		"visor",
		"vista",
		"vitality",
		"vitalize",
		"vitally",
		"vitamins",
		"vivacious",
		"vividly",
		"vividness",
		"vixen",
		"vocalist",
		"vocalize",
		"vocally",
		"vocation",
		"voice",
		"voicing",
		"void",
		"volatile",
		"volley",
		"voltage",
		"volumes",
		"voter",
		"voting",
		"voucher",
		"vowed",
		"vowel",
		"voyage",
		"wackiness",
		"wad",
		"wafer",
		"waffle",
		"waged",
		"wager",
		"wages",
		"waggle",
		"wagon",
		"wake",
		"waking",
		"walk",
		"walmart",
		"walnut",
		"walrus",
		"waltz",
		"wand",
		"wannabe",
		"wanted",
		"wanting",
		"wasabi",
		"washable",
		"washbasin",
		"washboard",
		"washbowl",
		"washcloth",
		"washday",
		"washed",
		"washer",
		"washhouse",
		"washing",
		"washout",
		"washroom",
		"washstand",
		"washtub",
		"wasp",
		"wasting",
		"watch",
		"water",
		"waviness",
		"waving",
		"wavy",
		"whacking",
		"whacky",
		"wham",
		"wharf",
		"wheat",
		"whenever",
		"whiff",
		"whimsical",
		"whinny",
		"whiny",
		"whisking",
		"whoever",
		"whole",
		"whomever",
		"whoopee",
		"whooping",
		"whoops",
		"why",
		"wick",
		"widely",
		"widen",
		"widget",
		"widow",
		"width",
		"wieldable",
		"wielder",
		"wife",
		"wifi",
		"wikipedia",
		"wildcard",
		"wildcat",
		"wilder",
		"wildfire",
		"wildfowl",
		"wildland",
		"wildlife",
		"wildly",
		"wildness",
		"willed",
		"willfully",
		"willing",
		"willow",
		"willpower",
		"wilt",
		"wimp",
		"wince",
		"wincing",
		"wind",
		"wing",
		"winking",
		"winner",
		"winnings",
		"winter",
		"wipe",
		"wired",
		"wireless",
		"wiring",
		"wiry",
		"wisdom",
		"wise",
		"wish",
		"wisplike",
		"wispy",
		"wistful",
		"wizard",
		"wobble",
		"wobbling",
		"wobbly",
		"wok",
		"wolf",
		"wolverine",
		"womanhood",
		"womankind",
		"womanless",
		"womanlike",
		"womanly",
		"womb",
		"woof",
		"wooing",
		"wool",
		"woozy",
		"word",
		"work",
		"worried",
		"worrier",
		"worrisome",
		"worry",
		"worsening",
		"worshiper",
		"worst",
		"wound",
		"woven",
		"wow",
		"wrangle",
		"wrath",
		"wreath",
		"wreckage",
		"wrecker",
		"wrecking",
		"wrench",
		"wriggle",
		"wriggly",
		"wrinkle",
		"wrinkly",
		"wrist",
		"writing",
		"written",
		"wrongdoer",
		"wronged",
		"wrongful",
		"wrongly",
		"wrongness",
		"wrought",
		"xbox",
		"xerox",
		"yahoo",
		"yam",
		"yanking",
		"yapping",
		"yard",
		"yarn",
		"yeah",
		"yearbook",
		"yearling",
		"yearly",
		"yearning",
		"yeast",
		"yelling",
		"yelp",
		"yen",
		"yesterday",
		"yiddish",
		"yield",
		"yin",
		"yippee",
		"yo-yo",
		"yodel",
		"yoga",
		"yogurt",
		"yonder",
		"yoyo",
		"yummy",
		"zap",
		"zealous",
		"zebra",
		"zen",
		"zeppelin",
		"zero",
		"zestfully",
		"zesty",
		"zigzagged",
		"zipfile",
		"zipping",
		"zippy",
		"zips",
		"zit",
		"zodiac",
		"zombie",
		"zone",
		"zoning",
		"zookeeper",
		"zoologist",
		"zoology",
		"zoom"
	];
}));
//#endregion
//#region node_modules/@ton/crypto/dist/passwords/newSecureWords.js
var require_newSecureWords = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.newSecureWords = void 0;
	var getSecureRandom_1 = require_getSecureRandom();
	var wordlist_1 = require_wordlist$1();
	async function newSecureWords(size = 6) {
		let words = [];
		for (let i = 0; i < size; i++) words.push(wordlist_1.wordlist[await (0, getSecureRandom_1.getSecureRandomNumber)(0, wordlist_1.wordlist.length)]);
		return words;
	}
	exports.newSecureWords = newSecureWords;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/passwords/newSecurePassphrase.js
var require_newSecurePassphrase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.newSecurePassphrase = void 0;
	var __1 = require_dist();
	async function newSecurePassphrase(size = 6) {
		return (await (0, __1.newSecureWords)(size)).join("-");
	}
	exports.newSecurePassphrase = newSecurePassphrase;
}));
//#endregion
//#region browser-external:crypto
var require_browser_external_crypto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Object.create(new Proxy({}, { get(_, key) {
		if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") console.warn(`Module "crypto" has been externalized for browser compatibility. Cannot access "crypto.${key}" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
	} }));
}));
//#endregion
//#region node_modules/tweetnacl/nacl-fast.js
var require_nacl_fast = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(nacl) {
		"use strict";
		var gf = function(init) {
			var i, r = new Float64Array(16);
			if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
			return r;
		};
		var randombytes = function() {
			throw new Error("no PRNG");
		};
		var _0 = new Uint8Array(16);
		var _9 = new Uint8Array(32);
		_9[0] = 9;
		var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([
			30883,
			4953,
			19914,
			30187,
			55467,
			16705,
			2637,
			112,
			59544,
			30585,
			16505,
			36039,
			65139,
			11119,
			27886,
			20995
		]), D2 = gf([
			61785,
			9906,
			39828,
			60374,
			45398,
			33411,
			5274,
			224,
			53552,
			61171,
			33010,
			6542,
			64743,
			22239,
			55772,
			9222
		]), X = gf([
			54554,
			36645,
			11616,
			51542,
			42930,
			38181,
			51040,
			26924,
			56412,
			64982,
			57905,
			49316,
			21502,
			52590,
			14035,
			8553
		]), Y = gf([
			26200,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214,
			26214
		]), I = gf([
			41136,
			18958,
			6951,
			50414,
			58488,
			44335,
			6150,
			12099,
			55207,
			15867,
			153,
			11085,
			57099,
			20417,
			9344,
			11139
		]);
		function ts64(x, i, h, l) {
			x[i] = h >> 24 & 255;
			x[i + 1] = h >> 16 & 255;
			x[i + 2] = h >> 8 & 255;
			x[i + 3] = h & 255;
			x[i + 4] = l >> 24 & 255;
			x[i + 5] = l >> 16 & 255;
			x[i + 6] = l >> 8 & 255;
			x[i + 7] = l & 255;
		}
		function vn(x, xi, y, yi, n) {
			var i, d = 0;
			for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
			return (1 & d - 1 >>> 8) - 1;
		}
		function crypto_verify_16(x, xi, y, yi) {
			return vn(x, xi, y, yi, 16);
		}
		function crypto_verify_32(x, xi, y, yi) {
			return vn(x, xi, y, yi, 32);
		}
		function core_salsa20(o, p, k, c) {
			var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
			var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
			for (var i = 0; i < 20; i += 2) {
				u = x0 + x12 | 0;
				x4 ^= u << 7 | u >>> 25;
				u = x4 + x0 | 0;
				x8 ^= u << 9 | u >>> 23;
				u = x8 + x4 | 0;
				x12 ^= u << 13 | u >>> 19;
				u = x12 + x8 | 0;
				x0 ^= u << 18 | u >>> 14;
				u = x5 + x1 | 0;
				x9 ^= u << 7 | u >>> 25;
				u = x9 + x5 | 0;
				x13 ^= u << 9 | u >>> 23;
				u = x13 + x9 | 0;
				x1 ^= u << 13 | u >>> 19;
				u = x1 + x13 | 0;
				x5 ^= u << 18 | u >>> 14;
				u = x10 + x6 | 0;
				x14 ^= u << 7 | u >>> 25;
				u = x14 + x10 | 0;
				x2 ^= u << 9 | u >>> 23;
				u = x2 + x14 | 0;
				x6 ^= u << 13 | u >>> 19;
				u = x6 + x2 | 0;
				x10 ^= u << 18 | u >>> 14;
				u = x15 + x11 | 0;
				x3 ^= u << 7 | u >>> 25;
				u = x3 + x15 | 0;
				x7 ^= u << 9 | u >>> 23;
				u = x7 + x3 | 0;
				x11 ^= u << 13 | u >>> 19;
				u = x11 + x7 | 0;
				x15 ^= u << 18 | u >>> 14;
				u = x0 + x3 | 0;
				x1 ^= u << 7 | u >>> 25;
				u = x1 + x0 | 0;
				x2 ^= u << 9 | u >>> 23;
				u = x2 + x1 | 0;
				x3 ^= u << 13 | u >>> 19;
				u = x3 + x2 | 0;
				x0 ^= u << 18 | u >>> 14;
				u = x5 + x4 | 0;
				x6 ^= u << 7 | u >>> 25;
				u = x6 + x5 | 0;
				x7 ^= u << 9 | u >>> 23;
				u = x7 + x6 | 0;
				x4 ^= u << 13 | u >>> 19;
				u = x4 + x7 | 0;
				x5 ^= u << 18 | u >>> 14;
				u = x10 + x9 | 0;
				x11 ^= u << 7 | u >>> 25;
				u = x11 + x10 | 0;
				x8 ^= u << 9 | u >>> 23;
				u = x8 + x11 | 0;
				x9 ^= u << 13 | u >>> 19;
				u = x9 + x8 | 0;
				x10 ^= u << 18 | u >>> 14;
				u = x15 + x14 | 0;
				x12 ^= u << 7 | u >>> 25;
				u = x12 + x15 | 0;
				x13 ^= u << 9 | u >>> 23;
				u = x13 + x12 | 0;
				x14 ^= u << 13 | u >>> 19;
				u = x14 + x13 | 0;
				x15 ^= u << 18 | u >>> 14;
			}
			x0 = x0 + j0 | 0;
			x1 = x1 + j1 | 0;
			x2 = x2 + j2 | 0;
			x3 = x3 + j3 | 0;
			x4 = x4 + j4 | 0;
			x5 = x5 + j5 | 0;
			x6 = x6 + j6 | 0;
			x7 = x7 + j7 | 0;
			x8 = x8 + j8 | 0;
			x9 = x9 + j9 | 0;
			x10 = x10 + j10 | 0;
			x11 = x11 + j11 | 0;
			x12 = x12 + j12 | 0;
			x13 = x13 + j13 | 0;
			x14 = x14 + j14 | 0;
			x15 = x15 + j15 | 0;
			o[0] = x0 >>> 0 & 255;
			o[1] = x0 >>> 8 & 255;
			o[2] = x0 >>> 16 & 255;
			o[3] = x0 >>> 24 & 255;
			o[4] = x1 >>> 0 & 255;
			o[5] = x1 >>> 8 & 255;
			o[6] = x1 >>> 16 & 255;
			o[7] = x1 >>> 24 & 255;
			o[8] = x2 >>> 0 & 255;
			o[9] = x2 >>> 8 & 255;
			o[10] = x2 >>> 16 & 255;
			o[11] = x2 >>> 24 & 255;
			o[12] = x3 >>> 0 & 255;
			o[13] = x3 >>> 8 & 255;
			o[14] = x3 >>> 16 & 255;
			o[15] = x3 >>> 24 & 255;
			o[16] = x4 >>> 0 & 255;
			o[17] = x4 >>> 8 & 255;
			o[18] = x4 >>> 16 & 255;
			o[19] = x4 >>> 24 & 255;
			o[20] = x5 >>> 0 & 255;
			o[21] = x5 >>> 8 & 255;
			o[22] = x5 >>> 16 & 255;
			o[23] = x5 >>> 24 & 255;
			o[24] = x6 >>> 0 & 255;
			o[25] = x6 >>> 8 & 255;
			o[26] = x6 >>> 16 & 255;
			o[27] = x6 >>> 24 & 255;
			o[28] = x7 >>> 0 & 255;
			o[29] = x7 >>> 8 & 255;
			o[30] = x7 >>> 16 & 255;
			o[31] = x7 >>> 24 & 255;
			o[32] = x8 >>> 0 & 255;
			o[33] = x8 >>> 8 & 255;
			o[34] = x8 >>> 16 & 255;
			o[35] = x8 >>> 24 & 255;
			o[36] = x9 >>> 0 & 255;
			o[37] = x9 >>> 8 & 255;
			o[38] = x9 >>> 16 & 255;
			o[39] = x9 >>> 24 & 255;
			o[40] = x10 >>> 0 & 255;
			o[41] = x10 >>> 8 & 255;
			o[42] = x10 >>> 16 & 255;
			o[43] = x10 >>> 24 & 255;
			o[44] = x11 >>> 0 & 255;
			o[45] = x11 >>> 8 & 255;
			o[46] = x11 >>> 16 & 255;
			o[47] = x11 >>> 24 & 255;
			o[48] = x12 >>> 0 & 255;
			o[49] = x12 >>> 8 & 255;
			o[50] = x12 >>> 16 & 255;
			o[51] = x12 >>> 24 & 255;
			o[52] = x13 >>> 0 & 255;
			o[53] = x13 >>> 8 & 255;
			o[54] = x13 >>> 16 & 255;
			o[55] = x13 >>> 24 & 255;
			o[56] = x14 >>> 0 & 255;
			o[57] = x14 >>> 8 & 255;
			o[58] = x14 >>> 16 & 255;
			o[59] = x14 >>> 24 & 255;
			o[60] = x15 >>> 0 & 255;
			o[61] = x15 >>> 8 & 255;
			o[62] = x15 >>> 16 & 255;
			o[63] = x15 >>> 24 & 255;
		}
		function core_hsalsa20(o, p, k, c) {
			var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
			var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
			for (var i = 0; i < 20; i += 2) {
				u = x0 + x12 | 0;
				x4 ^= u << 7 | u >>> 25;
				u = x4 + x0 | 0;
				x8 ^= u << 9 | u >>> 23;
				u = x8 + x4 | 0;
				x12 ^= u << 13 | u >>> 19;
				u = x12 + x8 | 0;
				x0 ^= u << 18 | u >>> 14;
				u = x5 + x1 | 0;
				x9 ^= u << 7 | u >>> 25;
				u = x9 + x5 | 0;
				x13 ^= u << 9 | u >>> 23;
				u = x13 + x9 | 0;
				x1 ^= u << 13 | u >>> 19;
				u = x1 + x13 | 0;
				x5 ^= u << 18 | u >>> 14;
				u = x10 + x6 | 0;
				x14 ^= u << 7 | u >>> 25;
				u = x14 + x10 | 0;
				x2 ^= u << 9 | u >>> 23;
				u = x2 + x14 | 0;
				x6 ^= u << 13 | u >>> 19;
				u = x6 + x2 | 0;
				x10 ^= u << 18 | u >>> 14;
				u = x15 + x11 | 0;
				x3 ^= u << 7 | u >>> 25;
				u = x3 + x15 | 0;
				x7 ^= u << 9 | u >>> 23;
				u = x7 + x3 | 0;
				x11 ^= u << 13 | u >>> 19;
				u = x11 + x7 | 0;
				x15 ^= u << 18 | u >>> 14;
				u = x0 + x3 | 0;
				x1 ^= u << 7 | u >>> 25;
				u = x1 + x0 | 0;
				x2 ^= u << 9 | u >>> 23;
				u = x2 + x1 | 0;
				x3 ^= u << 13 | u >>> 19;
				u = x3 + x2 | 0;
				x0 ^= u << 18 | u >>> 14;
				u = x5 + x4 | 0;
				x6 ^= u << 7 | u >>> 25;
				u = x6 + x5 | 0;
				x7 ^= u << 9 | u >>> 23;
				u = x7 + x6 | 0;
				x4 ^= u << 13 | u >>> 19;
				u = x4 + x7 | 0;
				x5 ^= u << 18 | u >>> 14;
				u = x10 + x9 | 0;
				x11 ^= u << 7 | u >>> 25;
				u = x11 + x10 | 0;
				x8 ^= u << 9 | u >>> 23;
				u = x8 + x11 | 0;
				x9 ^= u << 13 | u >>> 19;
				u = x9 + x8 | 0;
				x10 ^= u << 18 | u >>> 14;
				u = x15 + x14 | 0;
				x12 ^= u << 7 | u >>> 25;
				u = x12 + x15 | 0;
				x13 ^= u << 9 | u >>> 23;
				u = x13 + x12 | 0;
				x14 ^= u << 13 | u >>> 19;
				u = x14 + x13 | 0;
				x15 ^= u << 18 | u >>> 14;
			}
			o[0] = x0 >>> 0 & 255;
			o[1] = x0 >>> 8 & 255;
			o[2] = x0 >>> 16 & 255;
			o[3] = x0 >>> 24 & 255;
			o[4] = x5 >>> 0 & 255;
			o[5] = x5 >>> 8 & 255;
			o[6] = x5 >>> 16 & 255;
			o[7] = x5 >>> 24 & 255;
			o[8] = x10 >>> 0 & 255;
			o[9] = x10 >>> 8 & 255;
			o[10] = x10 >>> 16 & 255;
			o[11] = x10 >>> 24 & 255;
			o[12] = x15 >>> 0 & 255;
			o[13] = x15 >>> 8 & 255;
			o[14] = x15 >>> 16 & 255;
			o[15] = x15 >>> 24 & 255;
			o[16] = x6 >>> 0 & 255;
			o[17] = x6 >>> 8 & 255;
			o[18] = x6 >>> 16 & 255;
			o[19] = x6 >>> 24 & 255;
			o[20] = x7 >>> 0 & 255;
			o[21] = x7 >>> 8 & 255;
			o[22] = x7 >>> 16 & 255;
			o[23] = x7 >>> 24 & 255;
			o[24] = x8 >>> 0 & 255;
			o[25] = x8 >>> 8 & 255;
			o[26] = x8 >>> 16 & 255;
			o[27] = x8 >>> 24 & 255;
			o[28] = x9 >>> 0 & 255;
			o[29] = x9 >>> 8 & 255;
			o[30] = x9 >>> 16 & 255;
			o[31] = x9 >>> 24 & 255;
		}
		function crypto_core_salsa20(out, inp, k, c) {
			core_salsa20(out, inp, k, c);
		}
		function crypto_core_hsalsa20(out, inp, k, c) {
			core_hsalsa20(out, inp, k, c);
		}
		var sigma = new Uint8Array([
			101,
			120,
			112,
			97,
			110,
			100,
			32,
			51,
			50,
			45,
			98,
			121,
			116,
			101,
			32,
			107
		]);
		function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
			var z = new Uint8Array(16), x = new Uint8Array(64);
			var u, i;
			for (i = 0; i < 16; i++) z[i] = 0;
			for (i = 0; i < 8; i++) z[i] = n[i];
			while (b >= 64) {
				crypto_core_salsa20(x, z, k, sigma);
				for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
				u = 1;
				for (i = 8; i < 16; i++) {
					u = u + (z[i] & 255) | 0;
					z[i] = u & 255;
					u >>>= 8;
				}
				b -= 64;
				cpos += 64;
				mpos += 64;
			}
			if (b > 0) {
				crypto_core_salsa20(x, z, k, sigma);
				for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
			}
			return 0;
		}
		function crypto_stream_salsa20(c, cpos, b, n, k) {
			var z = new Uint8Array(16), x = new Uint8Array(64);
			var u, i;
			for (i = 0; i < 16; i++) z[i] = 0;
			for (i = 0; i < 8; i++) z[i] = n[i];
			while (b >= 64) {
				crypto_core_salsa20(x, z, k, sigma);
				for (i = 0; i < 64; i++) c[cpos + i] = x[i];
				u = 1;
				for (i = 8; i < 16; i++) {
					u = u + (z[i] & 255) | 0;
					z[i] = u & 255;
					u >>>= 8;
				}
				b -= 64;
				cpos += 64;
			}
			if (b > 0) {
				crypto_core_salsa20(x, z, k, sigma);
				for (i = 0; i < b; i++) c[cpos + i] = x[i];
			}
			return 0;
		}
		function crypto_stream(c, cpos, d, n, k) {
			var s = new Uint8Array(32);
			crypto_core_hsalsa20(s, n, k, sigma);
			var sn = new Uint8Array(8);
			for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
			return crypto_stream_salsa20(c, cpos, d, sn, s);
		}
		function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
			var s = new Uint8Array(32);
			crypto_core_hsalsa20(s, n, k, sigma);
			var sn = new Uint8Array(8);
			for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
			return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
		}
		var poly1305 = function(key) {
			this.buffer = new Uint8Array(16);
			this.r = new Uint16Array(10);
			this.h = new Uint16Array(10);
			this.pad = new Uint16Array(8);
			this.leftover = 0;
			this.fin = 0;
			var t0 = key[0] & 255 | (key[1] & 255) << 8, t1, t2, t3, t4, t5, t6, t7;
			this.r[0] = t0 & 8191;
			t1 = key[2] & 255 | (key[3] & 255) << 8;
			this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
			t2 = key[4] & 255 | (key[5] & 255) << 8;
			this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
			t3 = key[6] & 255 | (key[7] & 255) << 8;
			this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
			t4 = key[8] & 255 | (key[9] & 255) << 8;
			this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
			this.r[5] = t4 >>> 1 & 8190;
			t5 = key[10] & 255 | (key[11] & 255) << 8;
			this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
			t6 = key[12] & 255 | (key[13] & 255) << 8;
			this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
			t7 = key[14] & 255 | (key[15] & 255) << 8;
			this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
			this.r[9] = t7 >>> 5 & 127;
			this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
			this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
			this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
			this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
			this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
			this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
			this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
			this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
		};
		poly1305.prototype.blocks = function(m, mpos, bytes) {
			var hibit = this.fin ? 0 : 2048;
			var t0, t1, t2, t3, t4, t5, t6, t7, c;
			var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
			var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
			var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
			while (bytes >= 16) {
				t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
				h0 += t0 & 8191;
				t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
				h1 += (t0 >>> 13 | t1 << 3) & 8191;
				t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
				h2 += (t1 >>> 10 | t2 << 6) & 8191;
				t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
				h3 += (t2 >>> 7 | t3 << 9) & 8191;
				t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
				h4 += (t3 >>> 4 | t4 << 12) & 8191;
				h5 += t4 >>> 1 & 8191;
				t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
				h6 += (t4 >>> 14 | t5 << 2) & 8191;
				t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
				h7 += (t5 >>> 11 | t6 << 5) & 8191;
				t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
				h8 += (t6 >>> 8 | t7 << 8) & 8191;
				h9 += t7 >>> 5 | hibit;
				c = 0;
				d0 = c;
				d0 += h0 * r0;
				d0 += h1 * (5 * r9);
				d0 += h2 * (5 * r8);
				d0 += h3 * (5 * r7);
				d0 += h4 * (5 * r6);
				c = d0 >>> 13;
				d0 &= 8191;
				d0 += h5 * (5 * r5);
				d0 += h6 * (5 * r4);
				d0 += h7 * (5 * r3);
				d0 += h8 * (5 * r2);
				d0 += h9 * (5 * r1);
				c += d0 >>> 13;
				d0 &= 8191;
				d1 = c;
				d1 += h0 * r1;
				d1 += h1 * r0;
				d1 += h2 * (5 * r9);
				d1 += h3 * (5 * r8);
				d1 += h4 * (5 * r7);
				c = d1 >>> 13;
				d1 &= 8191;
				d1 += h5 * (5 * r6);
				d1 += h6 * (5 * r5);
				d1 += h7 * (5 * r4);
				d1 += h8 * (5 * r3);
				d1 += h9 * (5 * r2);
				c += d1 >>> 13;
				d1 &= 8191;
				d2 = c;
				d2 += h0 * r2;
				d2 += h1 * r1;
				d2 += h2 * r0;
				d2 += h3 * (5 * r9);
				d2 += h4 * (5 * r8);
				c = d2 >>> 13;
				d2 &= 8191;
				d2 += h5 * (5 * r7);
				d2 += h6 * (5 * r6);
				d2 += h7 * (5 * r5);
				d2 += h8 * (5 * r4);
				d2 += h9 * (5 * r3);
				c += d2 >>> 13;
				d2 &= 8191;
				d3 = c;
				d3 += h0 * r3;
				d3 += h1 * r2;
				d3 += h2 * r1;
				d3 += h3 * r0;
				d3 += h4 * (5 * r9);
				c = d3 >>> 13;
				d3 &= 8191;
				d3 += h5 * (5 * r8);
				d3 += h6 * (5 * r7);
				d3 += h7 * (5 * r6);
				d3 += h8 * (5 * r5);
				d3 += h9 * (5 * r4);
				c += d3 >>> 13;
				d3 &= 8191;
				d4 = c;
				d4 += h0 * r4;
				d4 += h1 * r3;
				d4 += h2 * r2;
				d4 += h3 * r1;
				d4 += h4 * r0;
				c = d4 >>> 13;
				d4 &= 8191;
				d4 += h5 * (5 * r9);
				d4 += h6 * (5 * r8);
				d4 += h7 * (5 * r7);
				d4 += h8 * (5 * r6);
				d4 += h9 * (5 * r5);
				c += d4 >>> 13;
				d4 &= 8191;
				d5 = c;
				d5 += h0 * r5;
				d5 += h1 * r4;
				d5 += h2 * r3;
				d5 += h3 * r2;
				d5 += h4 * r1;
				c = d5 >>> 13;
				d5 &= 8191;
				d5 += h5 * r0;
				d5 += h6 * (5 * r9);
				d5 += h7 * (5 * r8);
				d5 += h8 * (5 * r7);
				d5 += h9 * (5 * r6);
				c += d5 >>> 13;
				d5 &= 8191;
				d6 = c;
				d6 += h0 * r6;
				d6 += h1 * r5;
				d6 += h2 * r4;
				d6 += h3 * r3;
				d6 += h4 * r2;
				c = d6 >>> 13;
				d6 &= 8191;
				d6 += h5 * r1;
				d6 += h6 * r0;
				d6 += h7 * (5 * r9);
				d6 += h8 * (5 * r8);
				d6 += h9 * (5 * r7);
				c += d6 >>> 13;
				d6 &= 8191;
				d7 = c;
				d7 += h0 * r7;
				d7 += h1 * r6;
				d7 += h2 * r5;
				d7 += h3 * r4;
				d7 += h4 * r3;
				c = d7 >>> 13;
				d7 &= 8191;
				d7 += h5 * r2;
				d7 += h6 * r1;
				d7 += h7 * r0;
				d7 += h8 * (5 * r9);
				d7 += h9 * (5 * r8);
				c += d7 >>> 13;
				d7 &= 8191;
				d8 = c;
				d8 += h0 * r8;
				d8 += h1 * r7;
				d8 += h2 * r6;
				d8 += h3 * r5;
				d8 += h4 * r4;
				c = d8 >>> 13;
				d8 &= 8191;
				d8 += h5 * r3;
				d8 += h6 * r2;
				d8 += h7 * r1;
				d8 += h8 * r0;
				d8 += h9 * (5 * r9);
				c += d8 >>> 13;
				d8 &= 8191;
				d9 = c;
				d9 += h0 * r9;
				d9 += h1 * r8;
				d9 += h2 * r7;
				d9 += h3 * r6;
				d9 += h4 * r5;
				c = d9 >>> 13;
				d9 &= 8191;
				d9 += h5 * r4;
				d9 += h6 * r3;
				d9 += h7 * r2;
				d9 += h8 * r1;
				d9 += h9 * r0;
				c += d9 >>> 13;
				d9 &= 8191;
				c = (c << 2) + c | 0;
				c = c + d0 | 0;
				d0 = c & 8191;
				c = c >>> 13;
				d1 += c;
				h0 = d0;
				h1 = d1;
				h2 = d2;
				h3 = d3;
				h4 = d4;
				h5 = d5;
				h6 = d6;
				h7 = d7;
				h8 = d8;
				h9 = d9;
				mpos += 16;
				bytes -= 16;
			}
			this.h[0] = h0;
			this.h[1] = h1;
			this.h[2] = h2;
			this.h[3] = h3;
			this.h[4] = h4;
			this.h[5] = h5;
			this.h[6] = h6;
			this.h[7] = h7;
			this.h[8] = h8;
			this.h[9] = h9;
		};
		poly1305.prototype.finish = function(mac, macpos) {
			var g = new Uint16Array(10);
			var c, mask, f, i;
			if (this.leftover) {
				i = this.leftover;
				this.buffer[i++] = 1;
				for (; i < 16; i++) this.buffer[i] = 0;
				this.fin = 1;
				this.blocks(this.buffer, 0, 16);
			}
			c = this.h[1] >>> 13;
			this.h[1] &= 8191;
			for (i = 2; i < 10; i++) {
				this.h[i] += c;
				c = this.h[i] >>> 13;
				this.h[i] &= 8191;
			}
			this.h[0] += c * 5;
			c = this.h[0] >>> 13;
			this.h[0] &= 8191;
			this.h[1] += c;
			c = this.h[1] >>> 13;
			this.h[1] &= 8191;
			this.h[2] += c;
			g[0] = this.h[0] + 5;
			c = g[0] >>> 13;
			g[0] &= 8191;
			for (i = 1; i < 10; i++) {
				g[i] = this.h[i] + c;
				c = g[i] >>> 13;
				g[i] &= 8191;
			}
			g[9] -= 8192;
			mask = (c ^ 1) - 1;
			for (i = 0; i < 10; i++) g[i] &= mask;
			mask = ~mask;
			for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
			this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
			this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
			this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
			this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
			this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
			this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
			this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
			this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
			f = this.h[0] + this.pad[0];
			this.h[0] = f & 65535;
			for (i = 1; i < 8; i++) {
				f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
				this.h[i] = f & 65535;
			}
			mac[macpos + 0] = this.h[0] >>> 0 & 255;
			mac[macpos + 1] = this.h[0] >>> 8 & 255;
			mac[macpos + 2] = this.h[1] >>> 0 & 255;
			mac[macpos + 3] = this.h[1] >>> 8 & 255;
			mac[macpos + 4] = this.h[2] >>> 0 & 255;
			mac[macpos + 5] = this.h[2] >>> 8 & 255;
			mac[macpos + 6] = this.h[3] >>> 0 & 255;
			mac[macpos + 7] = this.h[3] >>> 8 & 255;
			mac[macpos + 8] = this.h[4] >>> 0 & 255;
			mac[macpos + 9] = this.h[4] >>> 8 & 255;
			mac[macpos + 10] = this.h[5] >>> 0 & 255;
			mac[macpos + 11] = this.h[5] >>> 8 & 255;
			mac[macpos + 12] = this.h[6] >>> 0 & 255;
			mac[macpos + 13] = this.h[6] >>> 8 & 255;
			mac[macpos + 14] = this.h[7] >>> 0 & 255;
			mac[macpos + 15] = this.h[7] >>> 8 & 255;
		};
		poly1305.prototype.update = function(m, mpos, bytes) {
			var i, want;
			if (this.leftover) {
				want = 16 - this.leftover;
				if (want > bytes) want = bytes;
				for (i = 0; i < want; i++) this.buffer[this.leftover + i] = m[mpos + i];
				bytes -= want;
				mpos += want;
				this.leftover += want;
				if (this.leftover < 16) return;
				this.blocks(this.buffer, 0, 16);
				this.leftover = 0;
			}
			if (bytes >= 16) {
				want = bytes - bytes % 16;
				this.blocks(m, mpos, want);
				mpos += want;
				bytes -= want;
			}
			if (bytes) {
				for (i = 0; i < bytes; i++) this.buffer[this.leftover + i] = m[mpos + i];
				this.leftover += bytes;
			}
		};
		function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
			var s = new poly1305(k);
			s.update(m, mpos, n);
			s.finish(out, outpos);
			return 0;
		}
		function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
			var x = new Uint8Array(16);
			crypto_onetimeauth(x, 0, m, mpos, n, k);
			return crypto_verify_16(h, hpos, x, 0);
		}
		function crypto_secretbox(c, m, d, n, k) {
			var i;
			if (d < 32) return -1;
			crypto_stream_xor(c, 0, m, 0, d, n, k);
			crypto_onetimeauth(c, 16, c, 32, d - 32, c);
			for (i = 0; i < 16; i++) c[i] = 0;
			return 0;
		}
		function crypto_secretbox_open(m, c, d, n, k) {
			var i;
			var x = new Uint8Array(32);
			if (d < 32) return -1;
			crypto_stream(x, 0, 32, n, k);
			if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
			crypto_stream_xor(m, 0, c, 0, d, n, k);
			for (i = 0; i < 32; i++) m[i] = 0;
			return 0;
		}
		function set25519(r, a) {
			var i;
			for (i = 0; i < 16; i++) r[i] = a[i] | 0;
		}
		function car25519(o) {
			var i, v, c = 1;
			for (i = 0; i < 16; i++) {
				v = o[i] + c + 65535;
				c = Math.floor(v / 65536);
				o[i] = v - c * 65536;
			}
			o[0] += c - 1 + 37 * (c - 1);
		}
		function sel25519(p, q, b) {
			var t, c = ~(b - 1);
			for (var i = 0; i < 16; i++) {
				t = c & (p[i] ^ q[i]);
				p[i] ^= t;
				q[i] ^= t;
			}
		}
		function pack25519(o, n) {
			var i, j, b;
			var m = gf(), t = gf();
			for (i = 0; i < 16; i++) t[i] = n[i];
			car25519(t);
			car25519(t);
			car25519(t);
			for (j = 0; j < 2; j++) {
				m[0] = t[0] - 65517;
				for (i = 1; i < 15; i++) {
					m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
					m[i - 1] &= 65535;
				}
				m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
				b = m[15] >> 16 & 1;
				m[14] &= 65535;
				sel25519(t, m, 1 - b);
			}
			for (i = 0; i < 16; i++) {
				o[2 * i] = t[i] & 255;
				o[2 * i + 1] = t[i] >> 8;
			}
		}
		function neq25519(a, b) {
			var c = new Uint8Array(32), d = new Uint8Array(32);
			pack25519(c, a);
			pack25519(d, b);
			return crypto_verify_32(c, 0, d, 0);
		}
		function par25519(a) {
			var d = new Uint8Array(32);
			pack25519(d, a);
			return d[0] & 1;
		}
		function unpack25519(o, n) {
			var i;
			for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
			o[15] &= 32767;
		}
		function A(o, a, b) {
			for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
		}
		function Z(o, a, b) {
			for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
		}
		function M(o, a, b) {
			var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
			v = a[0];
			t0 += v * b0;
			t1 += v * b1;
			t2 += v * b2;
			t3 += v * b3;
			t4 += v * b4;
			t5 += v * b5;
			t6 += v * b6;
			t7 += v * b7;
			t8 += v * b8;
			t9 += v * b9;
			t10 += v * b10;
			t11 += v * b11;
			t12 += v * b12;
			t13 += v * b13;
			t14 += v * b14;
			t15 += v * b15;
			v = a[1];
			t1 += v * b0;
			t2 += v * b1;
			t3 += v * b2;
			t4 += v * b3;
			t5 += v * b4;
			t6 += v * b5;
			t7 += v * b6;
			t8 += v * b7;
			t9 += v * b8;
			t10 += v * b9;
			t11 += v * b10;
			t12 += v * b11;
			t13 += v * b12;
			t14 += v * b13;
			t15 += v * b14;
			t16 += v * b15;
			v = a[2];
			t2 += v * b0;
			t3 += v * b1;
			t4 += v * b2;
			t5 += v * b3;
			t6 += v * b4;
			t7 += v * b5;
			t8 += v * b6;
			t9 += v * b7;
			t10 += v * b8;
			t11 += v * b9;
			t12 += v * b10;
			t13 += v * b11;
			t14 += v * b12;
			t15 += v * b13;
			t16 += v * b14;
			t17 += v * b15;
			v = a[3];
			t3 += v * b0;
			t4 += v * b1;
			t5 += v * b2;
			t6 += v * b3;
			t7 += v * b4;
			t8 += v * b5;
			t9 += v * b6;
			t10 += v * b7;
			t11 += v * b8;
			t12 += v * b9;
			t13 += v * b10;
			t14 += v * b11;
			t15 += v * b12;
			t16 += v * b13;
			t17 += v * b14;
			t18 += v * b15;
			v = a[4];
			t4 += v * b0;
			t5 += v * b1;
			t6 += v * b2;
			t7 += v * b3;
			t8 += v * b4;
			t9 += v * b5;
			t10 += v * b6;
			t11 += v * b7;
			t12 += v * b8;
			t13 += v * b9;
			t14 += v * b10;
			t15 += v * b11;
			t16 += v * b12;
			t17 += v * b13;
			t18 += v * b14;
			t19 += v * b15;
			v = a[5];
			t5 += v * b0;
			t6 += v * b1;
			t7 += v * b2;
			t8 += v * b3;
			t9 += v * b4;
			t10 += v * b5;
			t11 += v * b6;
			t12 += v * b7;
			t13 += v * b8;
			t14 += v * b9;
			t15 += v * b10;
			t16 += v * b11;
			t17 += v * b12;
			t18 += v * b13;
			t19 += v * b14;
			t20 += v * b15;
			v = a[6];
			t6 += v * b0;
			t7 += v * b1;
			t8 += v * b2;
			t9 += v * b3;
			t10 += v * b4;
			t11 += v * b5;
			t12 += v * b6;
			t13 += v * b7;
			t14 += v * b8;
			t15 += v * b9;
			t16 += v * b10;
			t17 += v * b11;
			t18 += v * b12;
			t19 += v * b13;
			t20 += v * b14;
			t21 += v * b15;
			v = a[7];
			t7 += v * b0;
			t8 += v * b1;
			t9 += v * b2;
			t10 += v * b3;
			t11 += v * b4;
			t12 += v * b5;
			t13 += v * b6;
			t14 += v * b7;
			t15 += v * b8;
			t16 += v * b9;
			t17 += v * b10;
			t18 += v * b11;
			t19 += v * b12;
			t20 += v * b13;
			t21 += v * b14;
			t22 += v * b15;
			v = a[8];
			t8 += v * b0;
			t9 += v * b1;
			t10 += v * b2;
			t11 += v * b3;
			t12 += v * b4;
			t13 += v * b5;
			t14 += v * b6;
			t15 += v * b7;
			t16 += v * b8;
			t17 += v * b9;
			t18 += v * b10;
			t19 += v * b11;
			t20 += v * b12;
			t21 += v * b13;
			t22 += v * b14;
			t23 += v * b15;
			v = a[9];
			t9 += v * b0;
			t10 += v * b1;
			t11 += v * b2;
			t12 += v * b3;
			t13 += v * b4;
			t14 += v * b5;
			t15 += v * b6;
			t16 += v * b7;
			t17 += v * b8;
			t18 += v * b9;
			t19 += v * b10;
			t20 += v * b11;
			t21 += v * b12;
			t22 += v * b13;
			t23 += v * b14;
			t24 += v * b15;
			v = a[10];
			t10 += v * b0;
			t11 += v * b1;
			t12 += v * b2;
			t13 += v * b3;
			t14 += v * b4;
			t15 += v * b5;
			t16 += v * b6;
			t17 += v * b7;
			t18 += v * b8;
			t19 += v * b9;
			t20 += v * b10;
			t21 += v * b11;
			t22 += v * b12;
			t23 += v * b13;
			t24 += v * b14;
			t25 += v * b15;
			v = a[11];
			t11 += v * b0;
			t12 += v * b1;
			t13 += v * b2;
			t14 += v * b3;
			t15 += v * b4;
			t16 += v * b5;
			t17 += v * b6;
			t18 += v * b7;
			t19 += v * b8;
			t20 += v * b9;
			t21 += v * b10;
			t22 += v * b11;
			t23 += v * b12;
			t24 += v * b13;
			t25 += v * b14;
			t26 += v * b15;
			v = a[12];
			t12 += v * b0;
			t13 += v * b1;
			t14 += v * b2;
			t15 += v * b3;
			t16 += v * b4;
			t17 += v * b5;
			t18 += v * b6;
			t19 += v * b7;
			t20 += v * b8;
			t21 += v * b9;
			t22 += v * b10;
			t23 += v * b11;
			t24 += v * b12;
			t25 += v * b13;
			t26 += v * b14;
			t27 += v * b15;
			v = a[13];
			t13 += v * b0;
			t14 += v * b1;
			t15 += v * b2;
			t16 += v * b3;
			t17 += v * b4;
			t18 += v * b5;
			t19 += v * b6;
			t20 += v * b7;
			t21 += v * b8;
			t22 += v * b9;
			t23 += v * b10;
			t24 += v * b11;
			t25 += v * b12;
			t26 += v * b13;
			t27 += v * b14;
			t28 += v * b15;
			v = a[14];
			t14 += v * b0;
			t15 += v * b1;
			t16 += v * b2;
			t17 += v * b3;
			t18 += v * b4;
			t19 += v * b5;
			t20 += v * b6;
			t21 += v * b7;
			t22 += v * b8;
			t23 += v * b9;
			t24 += v * b10;
			t25 += v * b11;
			t26 += v * b12;
			t27 += v * b13;
			t28 += v * b14;
			t29 += v * b15;
			v = a[15];
			t15 += v * b0;
			t16 += v * b1;
			t17 += v * b2;
			t18 += v * b3;
			t19 += v * b4;
			t20 += v * b5;
			t21 += v * b6;
			t22 += v * b7;
			t23 += v * b8;
			t24 += v * b9;
			t25 += v * b10;
			t26 += v * b11;
			t27 += v * b12;
			t28 += v * b13;
			t29 += v * b14;
			t30 += v * b15;
			t0 += 38 * t16;
			t1 += 38 * t17;
			t2 += 38 * t18;
			t3 += 38 * t19;
			t4 += 38 * t20;
			t5 += 38 * t21;
			t6 += 38 * t22;
			t7 += 38 * t23;
			t8 += 38 * t24;
			t9 += 38 * t25;
			t10 += 38 * t26;
			t11 += 38 * t27;
			t12 += 38 * t28;
			t13 += 38 * t29;
			t14 += 38 * t30;
			c = 1;
			v = t0 + c + 65535;
			c = Math.floor(v / 65536);
			t0 = v - c * 65536;
			v = t1 + c + 65535;
			c = Math.floor(v / 65536);
			t1 = v - c * 65536;
			v = t2 + c + 65535;
			c = Math.floor(v / 65536);
			t2 = v - c * 65536;
			v = t3 + c + 65535;
			c = Math.floor(v / 65536);
			t3 = v - c * 65536;
			v = t4 + c + 65535;
			c = Math.floor(v / 65536);
			t4 = v - c * 65536;
			v = t5 + c + 65535;
			c = Math.floor(v / 65536);
			t5 = v - c * 65536;
			v = t6 + c + 65535;
			c = Math.floor(v / 65536);
			t6 = v - c * 65536;
			v = t7 + c + 65535;
			c = Math.floor(v / 65536);
			t7 = v - c * 65536;
			v = t8 + c + 65535;
			c = Math.floor(v / 65536);
			t8 = v - c * 65536;
			v = t9 + c + 65535;
			c = Math.floor(v / 65536);
			t9 = v - c * 65536;
			v = t10 + c + 65535;
			c = Math.floor(v / 65536);
			t10 = v - c * 65536;
			v = t11 + c + 65535;
			c = Math.floor(v / 65536);
			t11 = v - c * 65536;
			v = t12 + c + 65535;
			c = Math.floor(v / 65536);
			t12 = v - c * 65536;
			v = t13 + c + 65535;
			c = Math.floor(v / 65536);
			t13 = v - c * 65536;
			v = t14 + c + 65535;
			c = Math.floor(v / 65536);
			t14 = v - c * 65536;
			v = t15 + c + 65535;
			c = Math.floor(v / 65536);
			t15 = v - c * 65536;
			t0 += c - 1 + 37 * (c - 1);
			c = 1;
			v = t0 + c + 65535;
			c = Math.floor(v / 65536);
			t0 = v - c * 65536;
			v = t1 + c + 65535;
			c = Math.floor(v / 65536);
			t1 = v - c * 65536;
			v = t2 + c + 65535;
			c = Math.floor(v / 65536);
			t2 = v - c * 65536;
			v = t3 + c + 65535;
			c = Math.floor(v / 65536);
			t3 = v - c * 65536;
			v = t4 + c + 65535;
			c = Math.floor(v / 65536);
			t4 = v - c * 65536;
			v = t5 + c + 65535;
			c = Math.floor(v / 65536);
			t5 = v - c * 65536;
			v = t6 + c + 65535;
			c = Math.floor(v / 65536);
			t6 = v - c * 65536;
			v = t7 + c + 65535;
			c = Math.floor(v / 65536);
			t7 = v - c * 65536;
			v = t8 + c + 65535;
			c = Math.floor(v / 65536);
			t8 = v - c * 65536;
			v = t9 + c + 65535;
			c = Math.floor(v / 65536);
			t9 = v - c * 65536;
			v = t10 + c + 65535;
			c = Math.floor(v / 65536);
			t10 = v - c * 65536;
			v = t11 + c + 65535;
			c = Math.floor(v / 65536);
			t11 = v - c * 65536;
			v = t12 + c + 65535;
			c = Math.floor(v / 65536);
			t12 = v - c * 65536;
			v = t13 + c + 65535;
			c = Math.floor(v / 65536);
			t13 = v - c * 65536;
			v = t14 + c + 65535;
			c = Math.floor(v / 65536);
			t14 = v - c * 65536;
			v = t15 + c + 65535;
			c = Math.floor(v / 65536);
			t15 = v - c * 65536;
			t0 += c - 1 + 37 * (c - 1);
			o[0] = t0;
			o[1] = t1;
			o[2] = t2;
			o[3] = t3;
			o[4] = t4;
			o[5] = t5;
			o[6] = t6;
			o[7] = t7;
			o[8] = t8;
			o[9] = t9;
			o[10] = t10;
			o[11] = t11;
			o[12] = t12;
			o[13] = t13;
			o[14] = t14;
			o[15] = t15;
		}
		function S(o, a) {
			M(o, a, a);
		}
		function inv25519(o, i) {
			var c = gf();
			var a;
			for (a = 0; a < 16; a++) c[a] = i[a];
			for (a = 253; a >= 0; a--) {
				S(c, c);
				if (a !== 2 && a !== 4) M(c, c, i);
			}
			for (a = 0; a < 16; a++) o[a] = c[a];
		}
		function pow2523(o, i) {
			var c = gf();
			var a;
			for (a = 0; a < 16; a++) c[a] = i[a];
			for (a = 250; a >= 0; a--) {
				S(c, c);
				if (a !== 1) M(c, c, i);
			}
			for (a = 0; a < 16; a++) o[a] = c[a];
		}
		function crypto_scalarmult(q, n, p) {
			var z = new Uint8Array(32);
			var x = new Float64Array(80), r, i;
			var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
			for (i = 0; i < 31; i++) z[i] = n[i];
			z[31] = n[31] & 127 | 64;
			z[0] &= 248;
			unpack25519(x, p);
			for (i = 0; i < 16; i++) {
				b[i] = x[i];
				d[i] = a[i] = c[i] = 0;
			}
			a[0] = d[0] = 1;
			for (i = 254; i >= 0; --i) {
				r = z[i >>> 3] >>> (i & 7) & 1;
				sel25519(a, b, r);
				sel25519(c, d, r);
				A(e, a, c);
				Z(a, a, c);
				A(c, b, d);
				Z(b, b, d);
				S(d, e);
				S(f, a);
				M(a, c, a);
				M(c, b, e);
				A(e, a, c);
				Z(a, a, c);
				S(b, a);
				Z(c, d, f);
				M(a, c, _121665);
				A(a, a, d);
				M(c, c, a);
				M(a, d, f);
				M(d, b, x);
				S(b, e);
				sel25519(a, b, r);
				sel25519(c, d, r);
			}
			for (i = 0; i < 16; i++) {
				x[i + 16] = a[i];
				x[i + 32] = c[i];
				x[i + 48] = b[i];
				x[i + 64] = d[i];
			}
			var x32 = x.subarray(32);
			var x16 = x.subarray(16);
			inv25519(x32, x32);
			M(x16, x16, x32);
			pack25519(q, x16);
			return 0;
		}
		function crypto_scalarmult_base(q, n) {
			return crypto_scalarmult(q, n, _9);
		}
		function crypto_box_keypair(y, x) {
			randombytes(x, 32);
			return crypto_scalarmult_base(y, x);
		}
		function crypto_box_beforenm(k, y, x) {
			var s = new Uint8Array(32);
			crypto_scalarmult(s, x, y);
			return crypto_core_hsalsa20(k, _0, s, sigma);
		}
		var crypto_box_afternm = crypto_secretbox;
		var crypto_box_open_afternm = crypto_secretbox_open;
		function crypto_box(c, m, d, n, y, x) {
			var k = new Uint8Array(32);
			crypto_box_beforenm(k, y, x);
			return crypto_box_afternm(c, m, d, n, k);
		}
		function crypto_box_open(m, c, d, n, y, x) {
			var k = new Uint8Array(32);
			crypto_box_beforenm(k, y, x);
			return crypto_box_open_afternm(m, c, d, n, k);
		}
		var K = [
			1116352408,
			3609767458,
			1899447441,
			602891725,
			3049323471,
			3964484399,
			3921009573,
			2173295548,
			961987163,
			4081628472,
			1508970993,
			3053834265,
			2453635748,
			2937671579,
			2870763221,
			3664609560,
			3624381080,
			2734883394,
			310598401,
			1164996542,
			607225278,
			1323610764,
			1426881987,
			3590304994,
			1925078388,
			4068182383,
			2162078206,
			991336113,
			2614888103,
			633803317,
			3248222580,
			3479774868,
			3835390401,
			2666613458,
			4022224774,
			944711139,
			264347078,
			2341262773,
			604807628,
			2007800933,
			770255983,
			1495990901,
			1249150122,
			1856431235,
			1555081692,
			3175218132,
			1996064986,
			2198950837,
			2554220882,
			3999719339,
			2821834349,
			766784016,
			2952996808,
			2566594879,
			3210313671,
			3203337956,
			3336571891,
			1034457026,
			3584528711,
			2466948901,
			113926993,
			3758326383,
			338241895,
			168717936,
			666307205,
			1188179964,
			773529912,
			1546045734,
			1294757372,
			1522805485,
			1396182291,
			2643833823,
			1695183700,
			2343527390,
			1986661051,
			1014477480,
			2177026350,
			1206759142,
			2456956037,
			344077627,
			2730485921,
			1290863460,
			2820302411,
			3158454273,
			3259730800,
			3505952657,
			3345764771,
			106217008,
			3516065817,
			3606008344,
			3600352804,
			1432725776,
			4094571909,
			1467031594,
			275423344,
			851169720,
			430227734,
			3100823752,
			506948616,
			1363258195,
			659060556,
			3750685593,
			883997877,
			3785050280,
			958139571,
			3318307427,
			1322822218,
			3812723403,
			1537002063,
			2003034995,
			1747873779,
			3602036899,
			1955562222,
			1575990012,
			2024104815,
			1125592928,
			2227730452,
			2716904306,
			2361852424,
			442776044,
			2428436474,
			593698344,
			2756734187,
			3733110249,
			3204031479,
			2999351573,
			3329325298,
			3815920427,
			3391569614,
			3928383900,
			3515267271,
			566280711,
			3940187606,
			3454069534,
			4118630271,
			4000239992,
			116418474,
			1914138554,
			174292421,
			2731055270,
			289380356,
			3203993006,
			460393269,
			320620315,
			685471733,
			587496836,
			852142971,
			1086792851,
			1017036298,
			365543100,
			1126000580,
			2618297676,
			1288033470,
			3409855158,
			1501505948,
			4234509866,
			1607167915,
			987167468,
			1816402316,
			1246189591
		];
		function crypto_hashblocks_hl(hh, hl, m, n) {
			var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
			var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
			var pos = 0;
			while (n >= 128) {
				for (i = 0; i < 16; i++) {
					j = 8 * i + pos;
					wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
					wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
				}
				for (i = 0; i < 80; i++) {
					bh0 = ah0;
					bh1 = ah1;
					bh2 = ah2;
					bh3 = ah3;
					bh4 = ah4;
					bh5 = ah5;
					bh6 = ah6;
					bh7 = ah7;
					bl0 = al0;
					bl1 = al1;
					bl2 = al2;
					bl3 = al3;
					bl4 = al4;
					bl5 = al5;
					bl6 = al6;
					bl7 = al7;
					h = ah7;
					l = al7;
					a = l & 65535;
					b = l >>> 16;
					c = h & 65535;
					d = h >>> 16;
					h = (ah4 >>> 14 | al4 << 18) ^ (ah4 >>> 18 | al4 << 14) ^ (al4 >>> 9 | ah4 << 23);
					l = (al4 >>> 14 | ah4 << 18) ^ (al4 >>> 18 | ah4 << 14) ^ (ah4 >>> 9 | al4 << 23);
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					h = ah4 & ah5 ^ ~ah4 & ah6;
					l = al4 & al5 ^ ~al4 & al6;
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					h = K[i * 2];
					l = K[i * 2 + 1];
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					h = wh[i % 16];
					l = wl[i % 16];
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					b += a >>> 16;
					c += b >>> 16;
					d += c >>> 16;
					th = c & 65535 | d << 16;
					tl = a & 65535 | b << 16;
					h = th;
					l = tl;
					a = l & 65535;
					b = l >>> 16;
					c = h & 65535;
					d = h >>> 16;
					h = (ah0 >>> 28 | al0 << 4) ^ (al0 >>> 2 | ah0 << 30) ^ (al0 >>> 7 | ah0 << 25);
					l = (al0 >>> 28 | ah0 << 4) ^ (ah0 >>> 2 | al0 << 30) ^ (ah0 >>> 7 | al0 << 25);
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
					l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					b += a >>> 16;
					c += b >>> 16;
					d += c >>> 16;
					bh7 = c & 65535 | d << 16;
					bl7 = a & 65535 | b << 16;
					h = bh3;
					l = bl3;
					a = l & 65535;
					b = l >>> 16;
					c = h & 65535;
					d = h >>> 16;
					h = th;
					l = tl;
					a += l & 65535;
					b += l >>> 16;
					c += h & 65535;
					d += h >>> 16;
					b += a >>> 16;
					c += b >>> 16;
					d += c >>> 16;
					bh3 = c & 65535 | d << 16;
					bl3 = a & 65535 | b << 16;
					ah1 = bh0;
					ah2 = bh1;
					ah3 = bh2;
					ah4 = bh3;
					ah5 = bh4;
					ah6 = bh5;
					ah7 = bh6;
					ah0 = bh7;
					al1 = bl0;
					al2 = bl1;
					al3 = bl2;
					al4 = bl3;
					al5 = bl4;
					al6 = bl5;
					al7 = bl6;
					al0 = bl7;
					if (i % 16 === 15) for (j = 0; j < 16; j++) {
						h = wh[j];
						l = wl[j];
						a = l & 65535;
						b = l >>> 16;
						c = h & 65535;
						d = h >>> 16;
						h = wh[(j + 9) % 16];
						l = wl[(j + 9) % 16];
						a += l & 65535;
						b += l >>> 16;
						c += h & 65535;
						d += h >>> 16;
						th = wh[(j + 1) % 16];
						tl = wl[(j + 1) % 16];
						h = (th >>> 1 | tl << 31) ^ (th >>> 8 | tl << 24) ^ th >>> 7;
						l = (tl >>> 1 | th << 31) ^ (tl >>> 8 | th << 24) ^ (tl >>> 7 | th << 25);
						a += l & 65535;
						b += l >>> 16;
						c += h & 65535;
						d += h >>> 16;
						th = wh[(j + 14) % 16];
						tl = wl[(j + 14) % 16];
						h = (th >>> 19 | tl << 13) ^ (tl >>> 29 | th << 3) ^ th >>> 6;
						l = (tl >>> 19 | th << 13) ^ (th >>> 29 | tl << 3) ^ (tl >>> 6 | th << 26);
						a += l & 65535;
						b += l >>> 16;
						c += h & 65535;
						d += h >>> 16;
						b += a >>> 16;
						c += b >>> 16;
						d += c >>> 16;
						wh[j] = c & 65535 | d << 16;
						wl[j] = a & 65535 | b << 16;
					}
				}
				h = ah0;
				l = al0;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[0];
				l = hl[0];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[0] = ah0 = c & 65535 | d << 16;
				hl[0] = al0 = a & 65535 | b << 16;
				h = ah1;
				l = al1;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[1];
				l = hl[1];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[1] = ah1 = c & 65535 | d << 16;
				hl[1] = al1 = a & 65535 | b << 16;
				h = ah2;
				l = al2;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[2];
				l = hl[2];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[2] = ah2 = c & 65535 | d << 16;
				hl[2] = al2 = a & 65535 | b << 16;
				h = ah3;
				l = al3;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[3];
				l = hl[3];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[3] = ah3 = c & 65535 | d << 16;
				hl[3] = al3 = a & 65535 | b << 16;
				h = ah4;
				l = al4;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[4];
				l = hl[4];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[4] = ah4 = c & 65535 | d << 16;
				hl[4] = al4 = a & 65535 | b << 16;
				h = ah5;
				l = al5;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[5];
				l = hl[5];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[5] = ah5 = c & 65535 | d << 16;
				hl[5] = al5 = a & 65535 | b << 16;
				h = ah6;
				l = al6;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[6];
				l = hl[6];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[6] = ah6 = c & 65535 | d << 16;
				hl[6] = al6 = a & 65535 | b << 16;
				h = ah7;
				l = al7;
				a = l & 65535;
				b = l >>> 16;
				c = h & 65535;
				d = h >>> 16;
				h = hh[7];
				l = hl[7];
				a += l & 65535;
				b += l >>> 16;
				c += h & 65535;
				d += h >>> 16;
				b += a >>> 16;
				c += b >>> 16;
				d += c >>> 16;
				hh[7] = ah7 = c & 65535 | d << 16;
				hl[7] = al7 = a & 65535 | b << 16;
				pos += 128;
				n -= 128;
			}
			return n;
		}
		function crypto_hash(out, m, n) {
			var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
			hh[0] = 1779033703;
			hh[1] = 3144134277;
			hh[2] = 1013904242;
			hh[3] = 2773480762;
			hh[4] = 1359893119;
			hh[5] = 2600822924;
			hh[6] = 528734635;
			hh[7] = 1541459225;
			hl[0] = 4089235720;
			hl[1] = 2227873595;
			hl[2] = 4271175723;
			hl[3] = 1595750129;
			hl[4] = 2917565137;
			hl[5] = 725511199;
			hl[6] = 4215389547;
			hl[7] = 327033209;
			crypto_hashblocks_hl(hh, hl, m, n);
			n %= 128;
			for (i = 0; i < n; i++) x[i] = m[b - n + i];
			x[n] = 128;
			n = 256 - 128 * (n < 112 ? 1 : 0);
			x[n - 9] = 0;
			ts64(x, n - 8, b / 536870912 | 0, b << 3);
			crypto_hashblocks_hl(hh, hl, x, n);
			for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
			return 0;
		}
		function add(p, q) {
			var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
			Z(a, p[1], p[0]);
			Z(t, q[1], q[0]);
			M(a, a, t);
			A(b, p[0], p[1]);
			A(t, q[0], q[1]);
			M(b, b, t);
			M(c, p[3], q[3]);
			M(c, c, D2);
			M(d, p[2], q[2]);
			A(d, d, d);
			Z(e, b, a);
			Z(f, d, c);
			A(g, d, c);
			A(h, b, a);
			M(p[0], e, f);
			M(p[1], h, g);
			M(p[2], g, f);
			M(p[3], e, h);
		}
		function cswap(p, q, b) {
			var i;
			for (i = 0; i < 4; i++) sel25519(p[i], q[i], b);
		}
		function pack(r, p) {
			var tx = gf(), ty = gf(), zi = gf();
			inv25519(zi, p[2]);
			M(tx, p[0], zi);
			M(ty, p[1], zi);
			pack25519(r, ty);
			r[31] ^= par25519(tx) << 7;
		}
		function scalarmult(p, q, s) {
			var b, i;
			set25519(p[0], gf0);
			set25519(p[1], gf1);
			set25519(p[2], gf1);
			set25519(p[3], gf0);
			for (i = 255; i >= 0; --i) {
				b = s[i / 8 | 0] >> (i & 7) & 1;
				cswap(p, q, b);
				add(q, p);
				add(p, p);
				cswap(p, q, b);
			}
		}
		function scalarbase(p, s) {
			var q = [
				gf(),
				gf(),
				gf(),
				gf()
			];
			set25519(q[0], X);
			set25519(q[1], Y);
			set25519(q[2], gf1);
			M(q[3], X, Y);
			scalarmult(p, q, s);
		}
		function crypto_sign_keypair(pk, sk, seeded) {
			var d = new Uint8Array(64);
			var p = [
				gf(),
				gf(),
				gf(),
				gf()
			];
			var i;
			if (!seeded) randombytes(sk, 32);
			crypto_hash(d, sk, 32);
			d[0] &= 248;
			d[31] &= 127;
			d[31] |= 64;
			scalarbase(p, d);
			pack(pk, p);
			for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
			return 0;
		}
		var L = new Float64Array([
			237,
			211,
			245,
			92,
			26,
			99,
			18,
			88,
			214,
			156,
			247,
			162,
			222,
			249,
			222,
			20,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			16
		]);
		function modL(r, x) {
			var carry, i, j, k;
			for (i = 63; i >= 32; --i) {
				carry = 0;
				for (j = i - 32, k = i - 12; j < k; ++j) {
					x[j] += carry - 16 * x[i] * L[j - (i - 32)];
					carry = Math.floor((x[j] + 128) / 256);
					x[j] -= carry * 256;
				}
				x[j] += carry;
				x[i] = 0;
			}
			carry = 0;
			for (j = 0; j < 32; j++) {
				x[j] += carry - (x[31] >> 4) * L[j];
				carry = x[j] >> 8;
				x[j] &= 255;
			}
			for (j = 0; j < 32; j++) x[j] -= carry * L[j];
			for (i = 0; i < 32; i++) {
				x[i + 1] += x[i] >> 8;
				r[i] = x[i] & 255;
			}
		}
		function reduce(r) {
			var x = new Float64Array(64), i;
			for (i = 0; i < 64; i++) x[i] = r[i];
			for (i = 0; i < 64; i++) r[i] = 0;
			modL(r, x);
		}
		function crypto_sign(sm, m, n, sk) {
			var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
			var i, j, x = new Float64Array(64);
			var p = [
				gf(),
				gf(),
				gf(),
				gf()
			];
			crypto_hash(d, sk, 32);
			d[0] &= 248;
			d[31] &= 127;
			d[31] |= 64;
			var smlen = n + 64;
			for (i = 0; i < n; i++) sm[64 + i] = m[i];
			for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
			crypto_hash(r, sm.subarray(32), n + 32);
			reduce(r);
			scalarbase(p, r);
			pack(sm, p);
			for (i = 32; i < 64; i++) sm[i] = sk[i];
			crypto_hash(h, sm, n + 64);
			reduce(h);
			for (i = 0; i < 64; i++) x[i] = 0;
			for (i = 0; i < 32; i++) x[i] = r[i];
			for (i = 0; i < 32; i++) for (j = 0; j < 32; j++) x[i + j] += h[i] * d[j];
			modL(sm.subarray(32), x);
			return smlen;
		}
		function unpackneg(r, p) {
			var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
			set25519(r[2], gf1);
			unpack25519(r[1], p);
			S(num, r[1]);
			M(den, num, D);
			Z(num, num, r[2]);
			A(den, r[2], den);
			S(den2, den);
			S(den4, den2);
			M(den6, den4, den2);
			M(t, den6, num);
			M(t, t, den);
			pow2523(t, t);
			M(t, t, num);
			M(t, t, den);
			M(t, t, den);
			M(r[0], t, den);
			S(chk, r[0]);
			M(chk, chk, den);
			if (neq25519(chk, num)) M(r[0], r[0], I);
			S(chk, r[0]);
			M(chk, chk, den);
			if (neq25519(chk, num)) return -1;
			if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
			M(r[3], r[0], r[1]);
			return 0;
		}
		function crypto_sign_open(m, sm, n, pk) {
			var i;
			var t = new Uint8Array(32), h = new Uint8Array(64);
			var p = [
				gf(),
				gf(),
				gf(),
				gf()
			], q = [
				gf(),
				gf(),
				gf(),
				gf()
			];
			if (n < 64) return -1;
			if (unpackneg(q, pk)) return -1;
			for (i = 0; i < n; i++) m[i] = sm[i];
			for (i = 0; i < 32; i++) m[i + 32] = pk[i];
			crypto_hash(h, m, n);
			reduce(h);
			scalarmult(p, q, h);
			scalarbase(q, sm.subarray(32));
			add(p, q);
			pack(t, p);
			n -= 64;
			if (crypto_verify_32(sm, 0, t, 0)) {
				for (i = 0; i < n; i++) m[i] = 0;
				return -1;
			}
			for (i = 0; i < n; i++) m[i] = sm[i + 64];
			return n;
		}
		var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
		nacl.lowlevel = {
			crypto_core_hsalsa20,
			crypto_stream_xor,
			crypto_stream,
			crypto_stream_salsa20_xor,
			crypto_stream_salsa20,
			crypto_onetimeauth,
			crypto_onetimeauth_verify,
			crypto_verify_16,
			crypto_verify_32,
			crypto_secretbox,
			crypto_secretbox_open,
			crypto_scalarmult,
			crypto_scalarmult_base,
			crypto_box_beforenm,
			crypto_box_afternm,
			crypto_box,
			crypto_box_open,
			crypto_box_keypair,
			crypto_hash,
			crypto_sign,
			crypto_sign_keypair,
			crypto_sign_open,
			crypto_secretbox_KEYBYTES,
			crypto_secretbox_NONCEBYTES,
			crypto_secretbox_ZEROBYTES,
			crypto_secretbox_BOXZEROBYTES,
			crypto_scalarmult_BYTES,
			crypto_scalarmult_SCALARBYTES,
			crypto_box_PUBLICKEYBYTES,
			crypto_box_SECRETKEYBYTES,
			crypto_box_BEFORENMBYTES,
			crypto_box_NONCEBYTES,
			crypto_box_ZEROBYTES,
			crypto_box_BOXZEROBYTES,
			crypto_sign_BYTES,
			crypto_sign_PUBLICKEYBYTES,
			crypto_sign_SECRETKEYBYTES,
			crypto_sign_SEEDBYTES,
			crypto_hash_BYTES,
			gf,
			D,
			L,
			pack25519,
			unpack25519,
			M,
			A,
			S,
			Z,
			pow2523,
			add,
			set25519,
			modL,
			scalarmult,
			scalarbase
		};
		function checkLengths(k, n) {
			if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
			if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
		}
		function checkBoxLengths(pk, sk) {
			if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
			if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
		}
		function checkArrayTypes() {
			for (var i = 0; i < arguments.length; i++) if (!(arguments[i] instanceof Uint8Array)) throw new TypeError("unexpected type, use Uint8Array");
		}
		function cleanup(arr) {
			for (var i = 0; i < arr.length; i++) arr[i] = 0;
		}
		nacl.randomBytes = function(n) {
			var b = new Uint8Array(n);
			randombytes(b, n);
			return b;
		};
		nacl.secretbox = function(msg, nonce, key) {
			checkArrayTypes(msg, nonce, key);
			checkLengths(key, nonce);
			var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
			var c = new Uint8Array(m.length);
			for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
			crypto_secretbox(c, m, m.length, nonce, key);
			return c.subarray(crypto_secretbox_BOXZEROBYTES);
		};
		nacl.secretbox.open = function(box, nonce, key) {
			checkArrayTypes(box, nonce, key);
			checkLengths(key, nonce);
			var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
			var m = new Uint8Array(c.length);
			for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
			if (c.length < 32) return null;
			if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
			return m.subarray(crypto_secretbox_ZEROBYTES);
		};
		nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
		nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
		nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
		nacl.scalarMult = function(n, p) {
			checkArrayTypes(n, p);
			if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
			if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
			var q = new Uint8Array(crypto_scalarmult_BYTES);
			crypto_scalarmult(q, n, p);
			return q;
		};
		nacl.scalarMult.base = function(n) {
			checkArrayTypes(n);
			if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
			var q = new Uint8Array(crypto_scalarmult_BYTES);
			crypto_scalarmult_base(q, n);
			return q;
		};
		nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
		nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
		nacl.box = function(msg, nonce, publicKey, secretKey) {
			var k = nacl.box.before(publicKey, secretKey);
			return nacl.secretbox(msg, nonce, k);
		};
		nacl.box.before = function(publicKey, secretKey) {
			checkArrayTypes(publicKey, secretKey);
			checkBoxLengths(publicKey, secretKey);
			var k = new Uint8Array(crypto_box_BEFORENMBYTES);
			crypto_box_beforenm(k, publicKey, secretKey);
			return k;
		};
		nacl.box.after = nacl.secretbox;
		nacl.box.open = function(msg, nonce, publicKey, secretKey) {
			var k = nacl.box.before(publicKey, secretKey);
			return nacl.secretbox.open(msg, nonce, k);
		};
		nacl.box.open.after = nacl.secretbox.open;
		nacl.box.keyPair = function() {
			var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
			var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
			crypto_box_keypair(pk, sk);
			return {
				publicKey: pk,
				secretKey: sk
			};
		};
		nacl.box.keyPair.fromSecretKey = function(secretKey) {
			checkArrayTypes(secretKey);
			if (secretKey.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
			var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
			crypto_scalarmult_base(pk, secretKey);
			return {
				publicKey: pk,
				secretKey: new Uint8Array(secretKey)
			};
		};
		nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
		nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
		nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
		nacl.box.nonceLength = crypto_box_NONCEBYTES;
		nacl.box.overheadLength = nacl.secretbox.overheadLength;
		nacl.sign = function(msg, secretKey) {
			checkArrayTypes(msg, secretKey);
			if (secretKey.length !== crypto_sign_SECRETKEYBYTES) throw new Error("bad secret key size");
			var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
			crypto_sign(signedMsg, msg, msg.length, secretKey);
			return signedMsg;
		};
		nacl.sign.open = function(signedMsg, publicKey) {
			checkArrayTypes(signedMsg, publicKey);
			if (publicKey.length !== crypto_sign_PUBLICKEYBYTES) throw new Error("bad public key size");
			var tmp = new Uint8Array(signedMsg.length);
			var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
			if (mlen < 0) return null;
			var m = new Uint8Array(mlen);
			for (var i = 0; i < m.length; i++) m[i] = tmp[i];
			return m;
		};
		nacl.sign.detached = function(msg, secretKey) {
			var signedMsg = nacl.sign(msg, secretKey);
			var sig = new Uint8Array(crypto_sign_BYTES);
			for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
			return sig;
		};
		nacl.sign.detached.verify = function(msg, sig, publicKey) {
			checkArrayTypes(msg, sig, publicKey);
			if (sig.length !== crypto_sign_BYTES) throw new Error("bad signature size");
			if (publicKey.length !== crypto_sign_PUBLICKEYBYTES) throw new Error("bad public key size");
			var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
			var m = new Uint8Array(crypto_sign_BYTES + msg.length);
			var i;
			for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
			for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
			return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
		};
		nacl.sign.keyPair = function() {
			var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
			var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
			crypto_sign_keypair(pk, sk);
			return {
				publicKey: pk,
				secretKey: sk
			};
		};
		nacl.sign.keyPair.fromSecretKey = function(secretKey) {
			checkArrayTypes(secretKey);
			if (secretKey.length !== crypto_sign_SECRETKEYBYTES) throw new Error("bad secret key size");
			var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
			for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
			return {
				publicKey: pk,
				secretKey: new Uint8Array(secretKey)
			};
		};
		nacl.sign.keyPair.fromSeed = function(seed) {
			checkArrayTypes(seed);
			if (seed.length !== crypto_sign_SEEDBYTES) throw new Error("bad seed size");
			var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
			var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
			for (var i = 0; i < 32; i++) sk[i] = seed[i];
			crypto_sign_keypair(pk, sk, true);
			return {
				publicKey: pk,
				secretKey: sk
			};
		};
		nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
		nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
		nacl.sign.seedLength = crypto_sign_SEEDBYTES;
		nacl.sign.signatureLength = crypto_sign_BYTES;
		nacl.hash = function(msg) {
			checkArrayTypes(msg);
			var h = new Uint8Array(crypto_hash_BYTES);
			crypto_hash(h, msg, msg.length);
			return h;
		};
		nacl.hash.hashLength = crypto_hash_BYTES;
		nacl.verify = function(x, y) {
			checkArrayTypes(x, y);
			if (x.length === 0 || y.length === 0) return false;
			if (x.length !== y.length) return false;
			return vn(x, 0, y, 0, x.length) === 0 ? true : false;
		};
		nacl.setPRNG = function(fn) {
			randombytes = fn;
		};
		(function() {
			var crypto = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
			if (crypto && crypto.getRandomValues) {
				var QUOTA = 65536;
				nacl.setPRNG(function(x, n) {
					var i, v = new Uint8Array(n);
					for (i = 0; i < n; i += QUOTA) crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
					for (i = 0; i < n; i++) x[i] = v[i];
					cleanup(v);
				});
			} else if (typeof __require !== "undefined") {
				crypto = require_browser_external_crypto();
				if (crypto && crypto.randomBytes) nacl.setPRNG(function(x, n) {
					var i, v = crypto.randomBytes(n);
					for (i = 0; i < n; i++) x[i] = v[i];
					cleanup(v);
				});
			}
		})();
	})(typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {});
}));
//#endregion
//#region node_modules/@ton/crypto/dist/utils/binary.js
var require_binary = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bitsToBytes = exports.bytesToBits = exports.lpad = void 0;
	function lpad(str, padString, length) {
		while (str.length < length) str = padString + str;
		return str;
	}
	exports.lpad = lpad;
	function bytesToBits(bytes) {
		let res = "";
		for (let i = 0; i < bytes.length; i++) {
			let x = bytes.at(i);
			res += lpad(x.toString(2), "0", 8);
		}
		return res;
	}
	exports.bytesToBits = bytesToBits;
	function bitsToBytes(src) {
		if (src.length % 8 !== 0) throw Error("Uneven bits");
		let res = [];
		while (src.length > 0) {
			res.push(parseInt(src.slice(0, 8), 2));
			src = src.slice(8);
		}
		return Buffer.from(res);
	}
	exports.bitsToBytes = bitsToBytes;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/mnemonic/wordlist.js
var require_wordlist = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wordlist = void 0;
	exports.wordlist = [
		"abandon",
		"ability",
		"able",
		"about",
		"above",
		"absent",
		"absorb",
		"abstract",
		"absurd",
		"abuse",
		"access",
		"accident",
		"account",
		"accuse",
		"achieve",
		"acid",
		"acoustic",
		"acquire",
		"across",
		"act",
		"action",
		"actor",
		"actress",
		"actual",
		"adapt",
		"add",
		"addict",
		"address",
		"adjust",
		"admit",
		"adult",
		"advance",
		"advice",
		"aerobic",
		"affair",
		"afford",
		"afraid",
		"again",
		"age",
		"agent",
		"agree",
		"ahead",
		"aim",
		"air",
		"airport",
		"aisle",
		"alarm",
		"album",
		"alcohol",
		"alert",
		"alien",
		"all",
		"alley",
		"allow",
		"almost",
		"alone",
		"alpha",
		"already",
		"also",
		"alter",
		"always",
		"amateur",
		"amazing",
		"among",
		"amount",
		"amused",
		"analyst",
		"anchor",
		"ancient",
		"anger",
		"angle",
		"angry",
		"animal",
		"ankle",
		"announce",
		"annual",
		"another",
		"answer",
		"antenna",
		"antique",
		"anxiety",
		"any",
		"apart",
		"apology",
		"appear",
		"apple",
		"approve",
		"april",
		"arch",
		"arctic",
		"area",
		"arena",
		"argue",
		"arm",
		"armed",
		"armor",
		"army",
		"around",
		"arrange",
		"arrest",
		"arrive",
		"arrow",
		"art",
		"artefact",
		"artist",
		"artwork",
		"ask",
		"aspect",
		"assault",
		"asset",
		"assist",
		"assume",
		"asthma",
		"athlete",
		"atom",
		"attack",
		"attend",
		"attitude",
		"attract",
		"auction",
		"audit",
		"august",
		"aunt",
		"author",
		"auto",
		"autumn",
		"average",
		"avocado",
		"avoid",
		"awake",
		"aware",
		"away",
		"awesome",
		"awful",
		"awkward",
		"axis",
		"baby",
		"bachelor",
		"bacon",
		"badge",
		"bag",
		"balance",
		"balcony",
		"ball",
		"bamboo",
		"banana",
		"banner",
		"bar",
		"barely",
		"bargain",
		"barrel",
		"base",
		"basic",
		"basket",
		"battle",
		"beach",
		"bean",
		"beauty",
		"because",
		"become",
		"beef",
		"before",
		"begin",
		"behave",
		"behind",
		"believe",
		"below",
		"belt",
		"bench",
		"benefit",
		"best",
		"betray",
		"better",
		"between",
		"beyond",
		"bicycle",
		"bid",
		"bike",
		"bind",
		"biology",
		"bird",
		"birth",
		"bitter",
		"black",
		"blade",
		"blame",
		"blanket",
		"blast",
		"bleak",
		"bless",
		"blind",
		"blood",
		"blossom",
		"blouse",
		"blue",
		"blur",
		"blush",
		"board",
		"boat",
		"body",
		"boil",
		"bomb",
		"bone",
		"bonus",
		"book",
		"boost",
		"border",
		"boring",
		"borrow",
		"boss",
		"bottom",
		"bounce",
		"box",
		"boy",
		"bracket",
		"brain",
		"brand",
		"brass",
		"brave",
		"bread",
		"breeze",
		"brick",
		"bridge",
		"brief",
		"bright",
		"bring",
		"brisk",
		"broccoli",
		"broken",
		"bronze",
		"broom",
		"brother",
		"brown",
		"brush",
		"bubble",
		"buddy",
		"budget",
		"buffalo",
		"build",
		"bulb",
		"bulk",
		"bullet",
		"bundle",
		"bunker",
		"burden",
		"burger",
		"burst",
		"bus",
		"business",
		"busy",
		"butter",
		"buyer",
		"buzz",
		"cabbage",
		"cabin",
		"cable",
		"cactus",
		"cage",
		"cake",
		"call",
		"calm",
		"camera",
		"camp",
		"can",
		"canal",
		"cancel",
		"candy",
		"cannon",
		"canoe",
		"canvas",
		"canyon",
		"capable",
		"capital",
		"captain",
		"car",
		"carbon",
		"card",
		"cargo",
		"carpet",
		"carry",
		"cart",
		"case",
		"cash",
		"casino",
		"castle",
		"casual",
		"cat",
		"catalog",
		"catch",
		"category",
		"cattle",
		"caught",
		"cause",
		"caution",
		"cave",
		"ceiling",
		"celery",
		"cement",
		"census",
		"century",
		"cereal",
		"certain",
		"chair",
		"chalk",
		"champion",
		"change",
		"chaos",
		"chapter",
		"charge",
		"chase",
		"chat",
		"cheap",
		"check",
		"cheese",
		"chef",
		"cherry",
		"chest",
		"chicken",
		"chief",
		"child",
		"chimney",
		"choice",
		"choose",
		"chronic",
		"chuckle",
		"chunk",
		"churn",
		"cigar",
		"cinnamon",
		"circle",
		"citizen",
		"city",
		"civil",
		"claim",
		"clap",
		"clarify",
		"claw",
		"clay",
		"clean",
		"clerk",
		"clever",
		"click",
		"client",
		"cliff",
		"climb",
		"clinic",
		"clip",
		"clock",
		"clog",
		"close",
		"cloth",
		"cloud",
		"clown",
		"club",
		"clump",
		"cluster",
		"clutch",
		"coach",
		"coast",
		"coconut",
		"code",
		"coffee",
		"coil",
		"coin",
		"collect",
		"color",
		"column",
		"combine",
		"come",
		"comfort",
		"comic",
		"common",
		"company",
		"concert",
		"conduct",
		"confirm",
		"congress",
		"connect",
		"consider",
		"control",
		"convince",
		"cook",
		"cool",
		"copper",
		"copy",
		"coral",
		"core",
		"corn",
		"correct",
		"cost",
		"cotton",
		"couch",
		"country",
		"couple",
		"course",
		"cousin",
		"cover",
		"coyote",
		"crack",
		"cradle",
		"craft",
		"cram",
		"crane",
		"crash",
		"crater",
		"crawl",
		"crazy",
		"cream",
		"credit",
		"creek",
		"crew",
		"cricket",
		"crime",
		"crisp",
		"critic",
		"crop",
		"cross",
		"crouch",
		"crowd",
		"crucial",
		"cruel",
		"cruise",
		"crumble",
		"crunch",
		"crush",
		"cry",
		"crystal",
		"cube",
		"culture",
		"cup",
		"cupboard",
		"curious",
		"current",
		"curtain",
		"curve",
		"cushion",
		"custom",
		"cute",
		"cycle",
		"dad",
		"damage",
		"damp",
		"dance",
		"danger",
		"daring",
		"dash",
		"daughter",
		"dawn",
		"day",
		"deal",
		"debate",
		"debris",
		"decade",
		"december",
		"decide",
		"decline",
		"decorate",
		"decrease",
		"deer",
		"defense",
		"define",
		"defy",
		"degree",
		"delay",
		"deliver",
		"demand",
		"demise",
		"denial",
		"dentist",
		"deny",
		"depart",
		"depend",
		"deposit",
		"depth",
		"deputy",
		"derive",
		"describe",
		"desert",
		"design",
		"desk",
		"despair",
		"destroy",
		"detail",
		"detect",
		"develop",
		"device",
		"devote",
		"diagram",
		"dial",
		"diamond",
		"diary",
		"dice",
		"diesel",
		"diet",
		"differ",
		"digital",
		"dignity",
		"dilemma",
		"dinner",
		"dinosaur",
		"direct",
		"dirt",
		"disagree",
		"discover",
		"disease",
		"dish",
		"dismiss",
		"disorder",
		"display",
		"distance",
		"divert",
		"divide",
		"divorce",
		"dizzy",
		"doctor",
		"document",
		"dog",
		"doll",
		"dolphin",
		"domain",
		"donate",
		"donkey",
		"donor",
		"door",
		"dose",
		"double",
		"dove",
		"draft",
		"dragon",
		"drama",
		"drastic",
		"draw",
		"dream",
		"dress",
		"drift",
		"drill",
		"drink",
		"drip",
		"drive",
		"drop",
		"drum",
		"dry",
		"duck",
		"dumb",
		"dune",
		"during",
		"dust",
		"dutch",
		"duty",
		"dwarf",
		"dynamic",
		"eager",
		"eagle",
		"early",
		"earn",
		"earth",
		"easily",
		"east",
		"easy",
		"echo",
		"ecology",
		"economy",
		"edge",
		"edit",
		"educate",
		"effort",
		"egg",
		"eight",
		"either",
		"elbow",
		"elder",
		"electric",
		"elegant",
		"element",
		"elephant",
		"elevator",
		"elite",
		"else",
		"embark",
		"embody",
		"embrace",
		"emerge",
		"emotion",
		"employ",
		"empower",
		"empty",
		"enable",
		"enact",
		"end",
		"endless",
		"endorse",
		"enemy",
		"energy",
		"enforce",
		"engage",
		"engine",
		"enhance",
		"enjoy",
		"enlist",
		"enough",
		"enrich",
		"enroll",
		"ensure",
		"enter",
		"entire",
		"entry",
		"envelope",
		"episode",
		"equal",
		"equip",
		"era",
		"erase",
		"erode",
		"erosion",
		"error",
		"erupt",
		"escape",
		"essay",
		"essence",
		"estate",
		"eternal",
		"ethics",
		"evidence",
		"evil",
		"evoke",
		"evolve",
		"exact",
		"example",
		"excess",
		"exchange",
		"excite",
		"exclude",
		"excuse",
		"execute",
		"exercise",
		"exhaust",
		"exhibit",
		"exile",
		"exist",
		"exit",
		"exotic",
		"expand",
		"expect",
		"expire",
		"explain",
		"expose",
		"express",
		"extend",
		"extra",
		"eye",
		"eyebrow",
		"fabric",
		"face",
		"faculty",
		"fade",
		"faint",
		"faith",
		"fall",
		"false",
		"fame",
		"family",
		"famous",
		"fan",
		"fancy",
		"fantasy",
		"farm",
		"fashion",
		"fat",
		"fatal",
		"father",
		"fatigue",
		"fault",
		"favorite",
		"feature",
		"february",
		"federal",
		"fee",
		"feed",
		"feel",
		"female",
		"fence",
		"festival",
		"fetch",
		"fever",
		"few",
		"fiber",
		"fiction",
		"field",
		"figure",
		"file",
		"film",
		"filter",
		"final",
		"find",
		"fine",
		"finger",
		"finish",
		"fire",
		"firm",
		"first",
		"fiscal",
		"fish",
		"fit",
		"fitness",
		"fix",
		"flag",
		"flame",
		"flash",
		"flat",
		"flavor",
		"flee",
		"flight",
		"flip",
		"float",
		"flock",
		"floor",
		"flower",
		"fluid",
		"flush",
		"fly",
		"foam",
		"focus",
		"fog",
		"foil",
		"fold",
		"follow",
		"food",
		"foot",
		"force",
		"forest",
		"forget",
		"fork",
		"fortune",
		"forum",
		"forward",
		"fossil",
		"foster",
		"found",
		"fox",
		"fragile",
		"frame",
		"frequent",
		"fresh",
		"friend",
		"fringe",
		"frog",
		"front",
		"frost",
		"frown",
		"frozen",
		"fruit",
		"fuel",
		"fun",
		"funny",
		"furnace",
		"fury",
		"future",
		"gadget",
		"gain",
		"galaxy",
		"gallery",
		"game",
		"gap",
		"garage",
		"garbage",
		"garden",
		"garlic",
		"garment",
		"gas",
		"gasp",
		"gate",
		"gather",
		"gauge",
		"gaze",
		"general",
		"genius",
		"genre",
		"gentle",
		"genuine",
		"gesture",
		"ghost",
		"giant",
		"gift",
		"giggle",
		"ginger",
		"giraffe",
		"girl",
		"give",
		"glad",
		"glance",
		"glare",
		"glass",
		"glide",
		"glimpse",
		"globe",
		"gloom",
		"glory",
		"glove",
		"glow",
		"glue",
		"goat",
		"goddess",
		"gold",
		"good",
		"goose",
		"gorilla",
		"gospel",
		"gossip",
		"govern",
		"gown",
		"grab",
		"grace",
		"grain",
		"grant",
		"grape",
		"grass",
		"gravity",
		"great",
		"green",
		"grid",
		"grief",
		"grit",
		"grocery",
		"group",
		"grow",
		"grunt",
		"guard",
		"guess",
		"guide",
		"guilt",
		"guitar",
		"gun",
		"gym",
		"habit",
		"hair",
		"half",
		"hammer",
		"hamster",
		"hand",
		"happy",
		"harbor",
		"hard",
		"harsh",
		"harvest",
		"hat",
		"have",
		"hawk",
		"hazard",
		"head",
		"health",
		"heart",
		"heavy",
		"hedgehog",
		"height",
		"hello",
		"helmet",
		"help",
		"hen",
		"hero",
		"hidden",
		"high",
		"hill",
		"hint",
		"hip",
		"hire",
		"history",
		"hobby",
		"hockey",
		"hold",
		"hole",
		"holiday",
		"hollow",
		"home",
		"honey",
		"hood",
		"hope",
		"horn",
		"horror",
		"horse",
		"hospital",
		"host",
		"hotel",
		"hour",
		"hover",
		"hub",
		"huge",
		"human",
		"humble",
		"humor",
		"hundred",
		"hungry",
		"hunt",
		"hurdle",
		"hurry",
		"hurt",
		"husband",
		"hybrid",
		"ice",
		"icon",
		"idea",
		"identify",
		"idle",
		"ignore",
		"ill",
		"illegal",
		"illness",
		"image",
		"imitate",
		"immense",
		"immune",
		"impact",
		"impose",
		"improve",
		"impulse",
		"inch",
		"include",
		"income",
		"increase",
		"index",
		"indicate",
		"indoor",
		"industry",
		"infant",
		"inflict",
		"inform",
		"inhale",
		"inherit",
		"initial",
		"inject",
		"injury",
		"inmate",
		"inner",
		"innocent",
		"input",
		"inquiry",
		"insane",
		"insect",
		"inside",
		"inspire",
		"install",
		"intact",
		"interest",
		"into",
		"invest",
		"invite",
		"involve",
		"iron",
		"island",
		"isolate",
		"issue",
		"item",
		"ivory",
		"jacket",
		"jaguar",
		"jar",
		"jazz",
		"jealous",
		"jeans",
		"jelly",
		"jewel",
		"job",
		"join",
		"joke",
		"journey",
		"joy",
		"judge",
		"juice",
		"jump",
		"jungle",
		"junior",
		"junk",
		"just",
		"kangaroo",
		"keen",
		"keep",
		"ketchup",
		"key",
		"kick",
		"kid",
		"kidney",
		"kind",
		"kingdom",
		"kiss",
		"kit",
		"kitchen",
		"kite",
		"kitten",
		"kiwi",
		"knee",
		"knife",
		"knock",
		"know",
		"lab",
		"label",
		"labor",
		"ladder",
		"lady",
		"lake",
		"lamp",
		"language",
		"laptop",
		"large",
		"later",
		"latin",
		"laugh",
		"laundry",
		"lava",
		"law",
		"lawn",
		"lawsuit",
		"layer",
		"lazy",
		"leader",
		"leaf",
		"learn",
		"leave",
		"lecture",
		"left",
		"leg",
		"legal",
		"legend",
		"leisure",
		"lemon",
		"lend",
		"length",
		"lens",
		"leopard",
		"lesson",
		"letter",
		"level",
		"liar",
		"liberty",
		"library",
		"license",
		"life",
		"lift",
		"light",
		"like",
		"limb",
		"limit",
		"link",
		"lion",
		"liquid",
		"list",
		"little",
		"live",
		"lizard",
		"load",
		"loan",
		"lobster",
		"local",
		"lock",
		"logic",
		"lonely",
		"long",
		"loop",
		"lottery",
		"loud",
		"lounge",
		"love",
		"loyal",
		"lucky",
		"luggage",
		"lumber",
		"lunar",
		"lunch",
		"luxury",
		"lyrics",
		"machine",
		"mad",
		"magic",
		"magnet",
		"maid",
		"mail",
		"main",
		"major",
		"make",
		"mammal",
		"man",
		"manage",
		"mandate",
		"mango",
		"mansion",
		"manual",
		"maple",
		"marble",
		"march",
		"margin",
		"marine",
		"market",
		"marriage",
		"mask",
		"mass",
		"master",
		"match",
		"material",
		"math",
		"matrix",
		"matter",
		"maximum",
		"maze",
		"meadow",
		"mean",
		"measure",
		"meat",
		"mechanic",
		"medal",
		"media",
		"melody",
		"melt",
		"member",
		"memory",
		"mention",
		"menu",
		"mercy",
		"merge",
		"merit",
		"merry",
		"mesh",
		"message",
		"metal",
		"method",
		"middle",
		"midnight",
		"milk",
		"million",
		"mimic",
		"mind",
		"minimum",
		"minor",
		"minute",
		"miracle",
		"mirror",
		"misery",
		"miss",
		"mistake",
		"mix",
		"mixed",
		"mixture",
		"mobile",
		"model",
		"modify",
		"mom",
		"moment",
		"monitor",
		"monkey",
		"monster",
		"month",
		"moon",
		"moral",
		"more",
		"morning",
		"mosquito",
		"mother",
		"motion",
		"motor",
		"mountain",
		"mouse",
		"move",
		"movie",
		"much",
		"muffin",
		"mule",
		"multiply",
		"muscle",
		"museum",
		"mushroom",
		"music",
		"must",
		"mutual",
		"myself",
		"mystery",
		"myth",
		"naive",
		"name",
		"napkin",
		"narrow",
		"nasty",
		"nation",
		"nature",
		"near",
		"neck",
		"need",
		"negative",
		"neglect",
		"neither",
		"nephew",
		"nerve",
		"nest",
		"net",
		"network",
		"neutral",
		"never",
		"news",
		"next",
		"nice",
		"night",
		"noble",
		"noise",
		"nominee",
		"noodle",
		"normal",
		"north",
		"nose",
		"notable",
		"note",
		"nothing",
		"notice",
		"novel",
		"now",
		"nuclear",
		"number",
		"nurse",
		"nut",
		"oak",
		"obey",
		"object",
		"oblige",
		"obscure",
		"observe",
		"obtain",
		"obvious",
		"occur",
		"ocean",
		"october",
		"odor",
		"off",
		"offer",
		"office",
		"often",
		"oil",
		"okay",
		"old",
		"olive",
		"olympic",
		"omit",
		"once",
		"one",
		"onion",
		"online",
		"only",
		"open",
		"opera",
		"opinion",
		"oppose",
		"option",
		"orange",
		"orbit",
		"orchard",
		"order",
		"ordinary",
		"organ",
		"orient",
		"original",
		"orphan",
		"ostrich",
		"other",
		"outdoor",
		"outer",
		"output",
		"outside",
		"oval",
		"oven",
		"over",
		"own",
		"owner",
		"oxygen",
		"oyster",
		"ozone",
		"pact",
		"paddle",
		"page",
		"pair",
		"palace",
		"palm",
		"panda",
		"panel",
		"panic",
		"panther",
		"paper",
		"parade",
		"parent",
		"park",
		"parrot",
		"party",
		"pass",
		"patch",
		"path",
		"patient",
		"patrol",
		"pattern",
		"pause",
		"pave",
		"payment",
		"peace",
		"peanut",
		"pear",
		"peasant",
		"pelican",
		"pen",
		"penalty",
		"pencil",
		"people",
		"pepper",
		"perfect",
		"permit",
		"person",
		"pet",
		"phone",
		"photo",
		"phrase",
		"physical",
		"piano",
		"picnic",
		"picture",
		"piece",
		"pig",
		"pigeon",
		"pill",
		"pilot",
		"pink",
		"pioneer",
		"pipe",
		"pistol",
		"pitch",
		"pizza",
		"place",
		"planet",
		"plastic",
		"plate",
		"play",
		"please",
		"pledge",
		"pluck",
		"plug",
		"plunge",
		"poem",
		"poet",
		"point",
		"polar",
		"pole",
		"police",
		"pond",
		"pony",
		"pool",
		"popular",
		"portion",
		"position",
		"possible",
		"post",
		"potato",
		"pottery",
		"poverty",
		"powder",
		"power",
		"practice",
		"praise",
		"predict",
		"prefer",
		"prepare",
		"present",
		"pretty",
		"prevent",
		"price",
		"pride",
		"primary",
		"print",
		"priority",
		"prison",
		"private",
		"prize",
		"problem",
		"process",
		"produce",
		"profit",
		"program",
		"project",
		"promote",
		"proof",
		"property",
		"prosper",
		"protect",
		"proud",
		"provide",
		"public",
		"pudding",
		"pull",
		"pulp",
		"pulse",
		"pumpkin",
		"punch",
		"pupil",
		"puppy",
		"purchase",
		"purity",
		"purpose",
		"purse",
		"push",
		"put",
		"puzzle",
		"pyramid",
		"quality",
		"quantum",
		"quarter",
		"question",
		"quick",
		"quit",
		"quiz",
		"quote",
		"rabbit",
		"raccoon",
		"race",
		"rack",
		"radar",
		"radio",
		"rail",
		"rain",
		"raise",
		"rally",
		"ramp",
		"ranch",
		"random",
		"range",
		"rapid",
		"rare",
		"rate",
		"rather",
		"raven",
		"raw",
		"razor",
		"ready",
		"real",
		"reason",
		"rebel",
		"rebuild",
		"recall",
		"receive",
		"recipe",
		"record",
		"recycle",
		"reduce",
		"reflect",
		"reform",
		"refuse",
		"region",
		"regret",
		"regular",
		"reject",
		"relax",
		"release",
		"relief",
		"rely",
		"remain",
		"remember",
		"remind",
		"remove",
		"render",
		"renew",
		"rent",
		"reopen",
		"repair",
		"repeat",
		"replace",
		"report",
		"require",
		"rescue",
		"resemble",
		"resist",
		"resource",
		"response",
		"result",
		"retire",
		"retreat",
		"return",
		"reunion",
		"reveal",
		"review",
		"reward",
		"rhythm",
		"rib",
		"ribbon",
		"rice",
		"rich",
		"ride",
		"ridge",
		"rifle",
		"right",
		"rigid",
		"ring",
		"riot",
		"ripple",
		"risk",
		"ritual",
		"rival",
		"river",
		"road",
		"roast",
		"robot",
		"robust",
		"rocket",
		"romance",
		"roof",
		"rookie",
		"room",
		"rose",
		"rotate",
		"rough",
		"round",
		"route",
		"royal",
		"rubber",
		"rude",
		"rug",
		"rule",
		"run",
		"runway",
		"rural",
		"sad",
		"saddle",
		"sadness",
		"safe",
		"sail",
		"salad",
		"salmon",
		"salon",
		"salt",
		"salute",
		"same",
		"sample",
		"sand",
		"satisfy",
		"satoshi",
		"sauce",
		"sausage",
		"save",
		"say",
		"scale",
		"scan",
		"scare",
		"scatter",
		"scene",
		"scheme",
		"school",
		"science",
		"scissors",
		"scorpion",
		"scout",
		"scrap",
		"screen",
		"script",
		"scrub",
		"sea",
		"search",
		"season",
		"seat",
		"second",
		"secret",
		"section",
		"security",
		"seed",
		"seek",
		"segment",
		"select",
		"sell",
		"seminar",
		"senior",
		"sense",
		"sentence",
		"series",
		"service",
		"session",
		"settle",
		"setup",
		"seven",
		"shadow",
		"shaft",
		"shallow",
		"share",
		"shed",
		"shell",
		"sheriff",
		"shield",
		"shift",
		"shine",
		"ship",
		"shiver",
		"shock",
		"shoe",
		"shoot",
		"shop",
		"short",
		"shoulder",
		"shove",
		"shrimp",
		"shrug",
		"shuffle",
		"shy",
		"sibling",
		"sick",
		"side",
		"siege",
		"sight",
		"sign",
		"silent",
		"silk",
		"silly",
		"silver",
		"similar",
		"simple",
		"since",
		"sing",
		"siren",
		"sister",
		"situate",
		"six",
		"size",
		"skate",
		"sketch",
		"ski",
		"skill",
		"skin",
		"skirt",
		"skull",
		"slab",
		"slam",
		"sleep",
		"slender",
		"slice",
		"slide",
		"slight",
		"slim",
		"slogan",
		"slot",
		"slow",
		"slush",
		"small",
		"smart",
		"smile",
		"smoke",
		"smooth",
		"snack",
		"snake",
		"snap",
		"sniff",
		"snow",
		"soap",
		"soccer",
		"social",
		"sock",
		"soda",
		"soft",
		"solar",
		"soldier",
		"solid",
		"solution",
		"solve",
		"someone",
		"song",
		"soon",
		"sorry",
		"sort",
		"soul",
		"sound",
		"soup",
		"source",
		"south",
		"space",
		"spare",
		"spatial",
		"spawn",
		"speak",
		"special",
		"speed",
		"spell",
		"spend",
		"sphere",
		"spice",
		"spider",
		"spike",
		"spin",
		"spirit",
		"split",
		"spoil",
		"sponsor",
		"spoon",
		"sport",
		"spot",
		"spray",
		"spread",
		"spring",
		"spy",
		"square",
		"squeeze",
		"squirrel",
		"stable",
		"stadium",
		"staff",
		"stage",
		"stairs",
		"stamp",
		"stand",
		"start",
		"state",
		"stay",
		"steak",
		"steel",
		"stem",
		"step",
		"stereo",
		"stick",
		"still",
		"sting",
		"stock",
		"stomach",
		"stone",
		"stool",
		"story",
		"stove",
		"strategy",
		"street",
		"strike",
		"strong",
		"struggle",
		"student",
		"stuff",
		"stumble",
		"style",
		"subject",
		"submit",
		"subway",
		"success",
		"such",
		"sudden",
		"suffer",
		"sugar",
		"suggest",
		"suit",
		"summer",
		"sun",
		"sunny",
		"sunset",
		"super",
		"supply",
		"supreme",
		"sure",
		"surface",
		"surge",
		"surprise",
		"surround",
		"survey",
		"suspect",
		"sustain",
		"swallow",
		"swamp",
		"swap",
		"swarm",
		"swear",
		"sweet",
		"swift",
		"swim",
		"swing",
		"switch",
		"sword",
		"symbol",
		"symptom",
		"syrup",
		"system",
		"table",
		"tackle",
		"tag",
		"tail",
		"talent",
		"talk",
		"tank",
		"tape",
		"target",
		"task",
		"taste",
		"tattoo",
		"taxi",
		"teach",
		"team",
		"tell",
		"ten",
		"tenant",
		"tennis",
		"tent",
		"term",
		"test",
		"text",
		"thank",
		"that",
		"theme",
		"then",
		"theory",
		"there",
		"they",
		"thing",
		"this",
		"thought",
		"three",
		"thrive",
		"throw",
		"thumb",
		"thunder",
		"ticket",
		"tide",
		"tiger",
		"tilt",
		"timber",
		"time",
		"tiny",
		"tip",
		"tired",
		"tissue",
		"title",
		"toast",
		"tobacco",
		"today",
		"toddler",
		"toe",
		"together",
		"toilet",
		"token",
		"tomato",
		"tomorrow",
		"tone",
		"tongue",
		"tonight",
		"tool",
		"tooth",
		"top",
		"topic",
		"topple",
		"torch",
		"tornado",
		"tortoise",
		"toss",
		"total",
		"tourist",
		"toward",
		"tower",
		"town",
		"toy",
		"track",
		"trade",
		"traffic",
		"tragic",
		"train",
		"transfer",
		"trap",
		"trash",
		"travel",
		"tray",
		"treat",
		"tree",
		"trend",
		"trial",
		"tribe",
		"trick",
		"trigger",
		"trim",
		"trip",
		"trophy",
		"trouble",
		"truck",
		"true",
		"truly",
		"trumpet",
		"trust",
		"truth",
		"try",
		"tube",
		"tuition",
		"tumble",
		"tuna",
		"tunnel",
		"turkey",
		"turn",
		"turtle",
		"twelve",
		"twenty",
		"twice",
		"twin",
		"twist",
		"two",
		"type",
		"typical",
		"ugly",
		"umbrella",
		"unable",
		"unaware",
		"uncle",
		"uncover",
		"under",
		"undo",
		"unfair",
		"unfold",
		"unhappy",
		"uniform",
		"unique",
		"unit",
		"universe",
		"unknown",
		"unlock",
		"until",
		"unusual",
		"unveil",
		"update",
		"upgrade",
		"uphold",
		"upon",
		"upper",
		"upset",
		"urban",
		"urge",
		"usage",
		"use",
		"used",
		"useful",
		"useless",
		"usual",
		"utility",
		"vacant",
		"vacuum",
		"vague",
		"valid",
		"valley",
		"valve",
		"van",
		"vanish",
		"vapor",
		"various",
		"vast",
		"vault",
		"vehicle",
		"velvet",
		"vendor",
		"venture",
		"venue",
		"verb",
		"verify",
		"version",
		"very",
		"vessel",
		"veteran",
		"viable",
		"vibrant",
		"vicious",
		"victory",
		"video",
		"view",
		"village",
		"vintage",
		"violin",
		"virtual",
		"virus",
		"visa",
		"visit",
		"visual",
		"vital",
		"vivid",
		"vocal",
		"voice",
		"void",
		"volcano",
		"volume",
		"vote",
		"voyage",
		"wage",
		"wagon",
		"wait",
		"walk",
		"wall",
		"walnut",
		"want",
		"warfare",
		"warm",
		"warrior",
		"wash",
		"wasp",
		"waste",
		"water",
		"wave",
		"way",
		"wealth",
		"weapon",
		"wear",
		"weasel",
		"weather",
		"web",
		"wedding",
		"weekend",
		"weird",
		"welcome",
		"west",
		"wet",
		"whale",
		"what",
		"wheat",
		"wheel",
		"when",
		"where",
		"whip",
		"whisper",
		"wide",
		"width",
		"wife",
		"wild",
		"will",
		"win",
		"window",
		"wine",
		"wing",
		"wink",
		"winner",
		"winter",
		"wire",
		"wisdom",
		"wise",
		"wish",
		"witness",
		"wolf",
		"woman",
		"wonder",
		"wood",
		"wool",
		"word",
		"work",
		"world",
		"worry",
		"worth",
		"wrap",
		"wreck",
		"wrestle",
		"wrist",
		"write",
		"wrong",
		"yard",
		"year",
		"yellow",
		"you",
		"young",
		"youth",
		"zebra",
		"zero",
		"zone",
		"zoo"
	];
}));
//#endregion
//#region node_modules/@ton/crypto/dist/mnemonic/mnemonic.js
var require_mnemonic = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mnemonicFromRandomSeed = exports.mnemonicIndexesToBytes = exports.bytesToMnemonics = exports.bytesToMnemonicIndexes = exports.mnemonicNew = exports.mnemonicValidate = exports.mnemonicToHDSeed = exports.mnemonicToWalletKey = exports.mnemonicToPrivateKey = exports.mnemonicToSeed = exports.mnemonicToEntropy = void 0;
	var tweetnacl_1 = __importDefault(require_nacl_fast());
	var getSecureRandom_1 = require_getSecureRandom();
	var hmac_sha512_1 = require_hmac_sha512();
	var pbkdf2_sha512_1 = require_pbkdf2_sha512();
	var binary_1 = require_binary();
	var wordlist_1 = require_wordlist();
	var PBKDF_ITERATIONS = 1e5;
	async function isPasswordNeeded(mnemonicArray) {
		const passlessEntropy = await mnemonicToEntropy(mnemonicArray);
		return await isPasswordSeed(passlessEntropy) && !await isBasicSeed(passlessEntropy);
	}
	function normalizeMnemonic(src) {
		return src.map((v) => v.toLowerCase().trim());
	}
	async function isBasicSeed(entropy) {
		return (await (0, pbkdf2_sha512_1.pbkdf2_sha512)(entropy, "TON seed version", Math.max(1, Math.floor(PBKDF_ITERATIONS / 256)), 64))[0] == 0;
	}
	async function isPasswordSeed(entropy) {
		return (await (0, pbkdf2_sha512_1.pbkdf2_sha512)(entropy, "TON fast seed version", 1, 64))[0] == 1;
	}
	async function mnemonicToEntropy(mnemonicArray, password) {
		return await (0, hmac_sha512_1.hmac_sha512)(mnemonicArray.join(" "), password && password.length > 0 ? password : "");
	}
	exports.mnemonicToEntropy = mnemonicToEntropy;
	async function mnemonicToSeed(mnemonicArray, seed, password) {
		const entropy = await mnemonicToEntropy(mnemonicArray, password);
		return await (0, pbkdf2_sha512_1.pbkdf2_sha512)(entropy, seed, PBKDF_ITERATIONS, 64);
	}
	exports.mnemonicToSeed = mnemonicToSeed;
	/**
	* Extract private key from mnemonic
	* @param mnemonicArray mnemonic array
	* @param password mnemonic password
	* @returns Key Pair
	*/
	async function mnemonicToPrivateKey(mnemonicArray, password) {
		mnemonicArray = normalizeMnemonic(mnemonicArray);
		const seed = await mnemonicToSeed(mnemonicArray, "TON default seed", password);
		let keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(seed.slice(0, 32));
		return {
			publicKey: Buffer.from(keyPair.publicKey),
			secretKey: Buffer.from(keyPair.secretKey)
		};
	}
	exports.mnemonicToPrivateKey = mnemonicToPrivateKey;
	/**
	* Convert mnemonic to wallet key pair
	* @param mnemonicArray mnemonic array
	* @param password mnemonic password
	* @returns Key Pair
	*/
	async function mnemonicToWalletKey(mnemonicArray, password) {
		let seedSecret = (await mnemonicToPrivateKey(mnemonicArray, password)).secretKey.slice(0, 32);
		const keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(seedSecret);
		return {
			publicKey: Buffer.from(keyPair.publicKey),
			secretKey: Buffer.from(keyPair.secretKey)
		};
	}
	exports.mnemonicToWalletKey = mnemonicToWalletKey;
	/**
	* Convert mnemonics to HD seed
	* @param mnemonicArray mnemonic array
	* @param password mnemonic password
	* @returns 64 byte seed
	*/
	async function mnemonicToHDSeed(mnemonicArray, password) {
		mnemonicArray = normalizeMnemonic(mnemonicArray);
		return await mnemonicToSeed(mnemonicArray, "TON HD Keys seed", password);
	}
	exports.mnemonicToHDSeed = mnemonicToHDSeed;
	/**
	* Validate Mnemonic
	* @param mnemonicArray mnemonic array
	* @param password mnemonic password
	* @returns true for valid mnemonic
	*/
	async function mnemonicValidate(mnemonicArray, password) {
		mnemonicArray = normalizeMnemonic(mnemonicArray);
		for (let word of mnemonicArray) if (wordlist_1.wordlist.indexOf(word) < 0) return false;
		if (password && password.length > 0) {
			if (!await isPasswordNeeded(mnemonicArray)) return false;
		}
		return await isBasicSeed(await mnemonicToEntropy(mnemonicArray, password));
	}
	exports.mnemonicValidate = mnemonicValidate;
	/**
	* Generate new Mnemonic
	* @param wordsCount number of words to generate
	* @param password mnemonic password
	* @returns
	*/
	async function mnemonicNew(wordsCount = 24, password) {
		let mnemonicArray = [];
		while (true) {
			mnemonicArray = [];
			for (let i = 0; i < wordsCount; i++) {
				let ind = await (0, getSecureRandom_1.getSecureRandomNumber)(0, wordlist_1.wordlist.length);
				mnemonicArray.push(wordlist_1.wordlist[ind]);
			}
			if (password && password.length > 0) {
				if (!await isPasswordNeeded(mnemonicArray)) continue;
			}
			if (!await isBasicSeed(await mnemonicToEntropy(mnemonicArray, password))) continue;
			break;
		}
		return mnemonicArray;
	}
	exports.mnemonicNew = mnemonicNew;
	/**
	* Converts bytes to mnemonics array (could be invalid for TON)
	* @param src source buffer
	* @param wordsCount number of words
	*/
	function bytesToMnemonicIndexes(src, wordsCount) {
		let bits = (0, binary_1.bytesToBits)(src);
		let indexes = [];
		for (let i = 0; i < wordsCount; i++) {
			let sl = bits.slice(i * 11, i * 11 + 11);
			indexes.push(parseInt(sl, 2));
		}
		return indexes;
	}
	exports.bytesToMnemonicIndexes = bytesToMnemonicIndexes;
	function bytesToMnemonics(src, wordsCount) {
		let mnemonics = bytesToMnemonicIndexes(src, wordsCount);
		let res = [];
		for (let m of mnemonics) res.push(wordlist_1.wordlist[m]);
		return res;
	}
	exports.bytesToMnemonics = bytesToMnemonics;
	/**
	* Converts mnemonics indexes to buffer with zero padding in the end
	* @param src source indexes
	* @returns Buffer
	*/
	function mnemonicIndexesToBytes(src) {
		let res = "";
		for (let s of src) {
			if (!Number.isSafeInteger(s)) throw Error("Invalid input");
			if (s < 0 || s >= 2028) throw Error("Invalid input");
			res += (0, binary_1.lpad)(s.toString(2), "0", 11);
		}
		while (res.length % 8 !== 0) res = res + "0";
		return (0, binary_1.bitsToBytes)(res);
	}
	exports.mnemonicIndexesToBytes = mnemonicIndexesToBytes;
	/**
	* Generates deterministically mnemonics
	* @param seed
	* @param wordsCount
	* @param password
	*/
	async function mnemonicFromRandomSeed(seed, wordsCount = 24, password) {
		const bytesLength = Math.ceil(wordsCount * 11 / 8);
		let currentSeed = seed;
		while (true) {
			let entropy = await (0, pbkdf2_sha512_1.pbkdf2_sha512)(currentSeed, "TON mnemonic seed", Math.max(1, Math.floor(PBKDF_ITERATIONS / 256)), bytesLength);
			let mnemonics = bytesToMnemonics(entropy, wordsCount);
			if (await mnemonicValidate(mnemonics, password)) return mnemonics;
			currentSeed = entropy;
		}
	}
	exports.mnemonicFromRandomSeed = mnemonicFromRandomSeed;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/primitives/nacl.js
var require_nacl = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openBox = exports.sealBox = exports.signVerify = exports.sign = exports.keyPairFromSeed = exports.keyPairFromSecretKey = void 0;
	var tweetnacl_1 = __importDefault(require_nacl_fast());
	function keyPairFromSecretKey(secretKey) {
		let res = tweetnacl_1.default.sign.keyPair.fromSecretKey(new Uint8Array(secretKey));
		return {
			publicKey: Buffer.from(res.publicKey),
			secretKey: Buffer.from(res.secretKey)
		};
	}
	exports.keyPairFromSecretKey = keyPairFromSecretKey;
	function keyPairFromSeed(secretKey) {
		let res = tweetnacl_1.default.sign.keyPair.fromSeed(new Uint8Array(secretKey));
		return {
			publicKey: Buffer.from(res.publicKey),
			secretKey: Buffer.from(res.secretKey)
		};
	}
	exports.keyPairFromSeed = keyPairFromSeed;
	function sign(data, secretKey) {
		return Buffer.from(tweetnacl_1.default.sign.detached(new Uint8Array(data), new Uint8Array(secretKey)));
	}
	exports.sign = sign;
	function signVerify(data, signature, publicKey) {
		return tweetnacl_1.default.sign.detached.verify(new Uint8Array(data), new Uint8Array(signature), new Uint8Array(publicKey));
	}
	exports.signVerify = signVerify;
	function sealBox(data, nonce, key) {
		return Buffer.from(tweetnacl_1.default.secretbox(data, nonce, key));
	}
	exports.sealBox = sealBox;
	function openBox(data, nonce, key) {
		let res = tweetnacl_1.default.secretbox.open(data, nonce, key);
		if (!res) return null;
		return Buffer.from(res);
	}
	exports.openBox = openBox;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/hd/ed25519.js
var require_ed25519 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deriveEd25519Path = exports.deriveED25519HardenedKey = exports.getED25519MasterKeyFromSeed = void 0;
	var hmac_sha512_1 = require_hmac_sha512();
	var ED25519_CURVE = "ed25519 seed";
	var HARDENED_OFFSET = 2147483648;
	async function getED25519MasterKeyFromSeed(seed) {
		const I = await (0, hmac_sha512_1.hmac_sha512)(ED25519_CURVE, seed);
		return {
			key: I.slice(0, 32),
			chainCode: I.slice(32)
		};
	}
	exports.getED25519MasterKeyFromSeed = getED25519MasterKeyFromSeed;
	async function deriveED25519HardenedKey(parent, index) {
		if (index >= HARDENED_OFFSET) throw Error("Key index must be less than offset");
		const indexBuffer = Buffer.alloc(4);
		indexBuffer.writeUInt32BE(index + HARDENED_OFFSET, 0);
		const data = Buffer.concat([
			Buffer.alloc(1, 0),
			parent.key,
			indexBuffer
		]);
		const I = await (0, hmac_sha512_1.hmac_sha512)(parent.chainCode, data);
		return {
			key: I.slice(0, 32),
			chainCode: I.slice(32)
		};
	}
	exports.deriveED25519HardenedKey = deriveED25519HardenedKey;
	async function deriveEd25519Path(seed, path) {
		let state = await getED25519MasterKeyFromSeed(seed);
		let remaining = [...path];
		while (remaining.length > 0) {
			let index = remaining[0];
			remaining = remaining.slice(1);
			state = await deriveED25519HardenedKey(state, index);
		}
		return state.key;
	}
	exports.deriveEd25519Path = deriveEd25519Path;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/hd/symmetric.js
var require_symmetric = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deriveSymmetricPath = exports.deriveSymmetricHardenedKey = exports.getSymmetricMasterKeyFromSeed = void 0;
	var hmac_sha512_1 = require_hmac_sha512();
	var SYMMETRIC_SEED = "Symmetric key seed";
	async function getSymmetricMasterKeyFromSeed(seed) {
		const I = await (0, hmac_sha512_1.hmac_sha512)(SYMMETRIC_SEED, seed);
		return {
			key: I.slice(32),
			chainCode: I.slice(0, 32)
		};
	}
	exports.getSymmetricMasterKeyFromSeed = getSymmetricMasterKeyFromSeed;
	async function deriveSymmetricHardenedKey(parent, offset) {
		const data = Buffer.concat([Buffer.alloc(1, 0), Buffer.from(offset)]);
		const I = await (0, hmac_sha512_1.hmac_sha512)(parent.chainCode, data);
		return {
			key: I.slice(32),
			chainCode: I.slice(0, 32)
		};
	}
	exports.deriveSymmetricHardenedKey = deriveSymmetricHardenedKey;
	async function deriveSymmetricPath(seed, path) {
		let state = await getSymmetricMasterKeyFromSeed(seed);
		let remaining = [...path];
		while (remaining.length > 0) {
			let index = remaining[0];
			remaining = remaining.slice(1);
			state = await deriveSymmetricHardenedKey(state, index);
		}
		return state.key;
	}
	exports.deriveSymmetricPath = deriveSymmetricPath;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/hd/mnemonics.js
var require_mnemonics = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deriveMnemonicsPath = exports.deriveMnemonicHardenedKey = exports.getMnemonicsMasterKeyFromSeed = void 0;
	var mnemonic_1 = require_mnemonic();
	var hmac_sha512_1 = require_hmac_sha512();
	var HARDENED_OFFSET = 2147483648;
	var MNEMONICS_SEED = "TON Mnemonics HD seed";
	async function getMnemonicsMasterKeyFromSeed(seed) {
		const I = await (0, hmac_sha512_1.hmac_sha512)(MNEMONICS_SEED, seed);
		return {
			key: I.slice(0, 32),
			chainCode: I.slice(32)
		};
	}
	exports.getMnemonicsMasterKeyFromSeed = getMnemonicsMasterKeyFromSeed;
	async function deriveMnemonicHardenedKey(parent, index) {
		if (index >= HARDENED_OFFSET) throw Error("Key index must be less than offset");
		const indexBuffer = Buffer.alloc(4);
		indexBuffer.writeUInt32BE(index + HARDENED_OFFSET, 0);
		const data = Buffer.concat([
			Buffer.alloc(1, 0),
			parent.key,
			indexBuffer
		]);
		const I = await (0, hmac_sha512_1.hmac_sha512)(parent.chainCode, data);
		return {
			key: I.slice(0, 32),
			chainCode: I.slice(32)
		};
	}
	exports.deriveMnemonicHardenedKey = deriveMnemonicHardenedKey;
	async function deriveMnemonicsPath(seed, path, wordsCount = 24, password) {
		let state = await getMnemonicsMasterKeyFromSeed(seed);
		let remaining = [...path];
		while (remaining.length > 0) {
			let index = remaining[0];
			remaining = remaining.slice(1);
			state = await deriveMnemonicHardenedKey(state, index);
		}
		return await (0, mnemonic_1.mnemonicFromRandomSeed)(state.key, wordsCount, password);
	}
	exports.deriveMnemonicsPath = deriveMnemonicsPath;
}));
//#endregion
//#region node_modules/@ton/crypto/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMnemonicsMasterKeyFromSeed = exports.deriveMnemonicHardenedKey = exports.deriveMnemonicsPath = exports.deriveSymmetricPath = exports.deriveSymmetricHardenedKey = exports.getSymmetricMasterKeyFromSeed = exports.deriveEd25519Path = exports.deriveED25519HardenedKey = exports.getED25519MasterKeyFromSeed = exports.signVerify = exports.sign = exports.keyPairFromSecretKey = exports.keyPairFromSeed = exports.openBox = exports.sealBox = exports.mnemonicWordList = exports.mnemonicToHDSeed = exports.mnemonicToSeed = exports.mnemonicToWalletKey = exports.mnemonicToPrivateKey = exports.mnemonicValidate = exports.mnemonicNew = exports.newSecurePassphrase = exports.newSecureWords = exports.getSecureRandomNumber = exports.getSecureRandomWords = exports.getSecureRandomBytes = exports.hmac_sha512 = exports.pbkdf2_sha512 = exports.sha512_sync = exports.sha512 = exports.sha256_sync = exports.sha256 = void 0;
	var sha256_1 = require_sha256();
	Object.defineProperty(exports, "sha256", {
		enumerable: true,
		get: function() {
			return sha256_1.sha256;
		}
	});
	Object.defineProperty(exports, "sha256_sync", {
		enumerable: true,
		get: function() {
			return sha256_1.sha256_sync;
		}
	});
	var sha512_1 = require_sha512();
	Object.defineProperty(exports, "sha512", {
		enumerable: true,
		get: function() {
			return sha512_1.sha512;
		}
	});
	Object.defineProperty(exports, "sha512_sync", {
		enumerable: true,
		get: function() {
			return sha512_1.sha512_sync;
		}
	});
	var pbkdf2_sha512_1 = require_pbkdf2_sha512();
	Object.defineProperty(exports, "pbkdf2_sha512", {
		enumerable: true,
		get: function() {
			return pbkdf2_sha512_1.pbkdf2_sha512;
		}
	});
	var hmac_sha512_1 = require_hmac_sha512();
	Object.defineProperty(exports, "hmac_sha512", {
		enumerable: true,
		get: function() {
			return hmac_sha512_1.hmac_sha512;
		}
	});
	var getSecureRandom_1 = require_getSecureRandom();
	Object.defineProperty(exports, "getSecureRandomBytes", {
		enumerable: true,
		get: function() {
			return getSecureRandom_1.getSecureRandomBytes;
		}
	});
	Object.defineProperty(exports, "getSecureRandomWords", {
		enumerable: true,
		get: function() {
			return getSecureRandom_1.getSecureRandomWords;
		}
	});
	Object.defineProperty(exports, "getSecureRandomNumber", {
		enumerable: true,
		get: function() {
			return getSecureRandom_1.getSecureRandomNumber;
		}
	});
	var newSecureWords_1 = require_newSecureWords();
	Object.defineProperty(exports, "newSecureWords", {
		enumerable: true,
		get: function() {
			return newSecureWords_1.newSecureWords;
		}
	});
	var newSecurePassphrase_1 = require_newSecurePassphrase();
	Object.defineProperty(exports, "newSecurePassphrase", {
		enumerable: true,
		get: function() {
			return newSecurePassphrase_1.newSecurePassphrase;
		}
	});
	var mnemonic_1 = require_mnemonic();
	Object.defineProperty(exports, "mnemonicNew", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicNew;
		}
	});
	Object.defineProperty(exports, "mnemonicValidate", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicValidate;
		}
	});
	Object.defineProperty(exports, "mnemonicToPrivateKey", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicToPrivateKey;
		}
	});
	Object.defineProperty(exports, "mnemonicToWalletKey", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicToWalletKey;
		}
	});
	Object.defineProperty(exports, "mnemonicToSeed", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicToSeed;
		}
	});
	Object.defineProperty(exports, "mnemonicToHDSeed", {
		enumerable: true,
		get: function() {
			return mnemonic_1.mnemonicToHDSeed;
		}
	});
	var wordlist_1 = require_wordlist();
	Object.defineProperty(exports, "mnemonicWordList", {
		enumerable: true,
		get: function() {
			return wordlist_1.wordlist;
		}
	});
	var nacl_1 = require_nacl();
	Object.defineProperty(exports, "sealBox", {
		enumerable: true,
		get: function() {
			return nacl_1.sealBox;
		}
	});
	Object.defineProperty(exports, "openBox", {
		enumerable: true,
		get: function() {
			return nacl_1.openBox;
		}
	});
	var nacl_2 = require_nacl();
	Object.defineProperty(exports, "keyPairFromSeed", {
		enumerable: true,
		get: function() {
			return nacl_2.keyPairFromSeed;
		}
	});
	Object.defineProperty(exports, "keyPairFromSecretKey", {
		enumerable: true,
		get: function() {
			return nacl_2.keyPairFromSecretKey;
		}
	});
	Object.defineProperty(exports, "sign", {
		enumerable: true,
		get: function() {
			return nacl_2.sign;
		}
	});
	Object.defineProperty(exports, "signVerify", {
		enumerable: true,
		get: function() {
			return nacl_2.signVerify;
		}
	});
	var ed25519_1 = require_ed25519();
	Object.defineProperty(exports, "getED25519MasterKeyFromSeed", {
		enumerable: true,
		get: function() {
			return ed25519_1.getED25519MasterKeyFromSeed;
		}
	});
	Object.defineProperty(exports, "deriveED25519HardenedKey", {
		enumerable: true,
		get: function() {
			return ed25519_1.deriveED25519HardenedKey;
		}
	});
	Object.defineProperty(exports, "deriveEd25519Path", {
		enumerable: true,
		get: function() {
			return ed25519_1.deriveEd25519Path;
		}
	});
	var symmetric_1 = require_symmetric();
	Object.defineProperty(exports, "getSymmetricMasterKeyFromSeed", {
		enumerable: true,
		get: function() {
			return symmetric_1.getSymmetricMasterKeyFromSeed;
		}
	});
	Object.defineProperty(exports, "deriveSymmetricHardenedKey", {
		enumerable: true,
		get: function() {
			return symmetric_1.deriveSymmetricHardenedKey;
		}
	});
	Object.defineProperty(exports, "deriveSymmetricPath", {
		enumerable: true,
		get: function() {
			return symmetric_1.deriveSymmetricPath;
		}
	});
	var mnemonics_1 = require_mnemonics();
	Object.defineProperty(exports, "deriveMnemonicsPath", {
		enumerable: true,
		get: function() {
			return mnemonics_1.deriveMnemonicsPath;
		}
	});
	Object.defineProperty(exports, "deriveMnemonicHardenedKey", {
		enumerable: true,
		get: function() {
			return mnemonics_1.deriveMnemonicHardenedKey;
		}
	});
	Object.defineProperty(exports, "getMnemonicsMasterKeyFromSeed", {
		enumerable: true,
		get: function() {
			return mnemonics_1.getMnemonicsMasterKeyFromSeed;
		}
	});
}));
//#endregion
export { require_dist as t };

//# sourceMappingURL=dist-DfDiDqGP.js.map