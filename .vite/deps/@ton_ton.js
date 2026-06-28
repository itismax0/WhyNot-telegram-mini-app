import { t as __commonJSMin } from "./chunk-Cf1989ZW.js";
import { t as require_dist$2 } from "./dist-DfDiDqGP.js";
//#region node_modules/@ton/core/dist/inspect.js
var require_inspect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.inspectSymbol = void 0;
	exports.inspectSymbol = Symbol.for("nodejs.util.inspect.custom");
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/crc16.js
var require_crc16 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crc16 = void 0;
	function crc16(data) {
		const poly = 4129;
		let reg = 0;
		const message = Buffer.alloc(data.length + 2);
		message.set(data);
		for (let byte of message) {
			let mask = 128;
			while (mask > 0) {
				reg <<= 1;
				if (byte & mask) reg += 1;
				mask >>= 1;
				if (reg > 65535) {
					reg &= 65535;
					reg ^= poly;
				}
			}
		}
		return Buffer.from([Math.floor(reg / 256), reg % 256]);
	}
	exports.crc16 = crc16;
}));
//#endregion
//#region node_modules/@ton/core/dist/address/Address.js
var require_Address = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.address = exports.Address = void 0;
	var inspect_1 = require_inspect();
	var crc16_1 = require_crc16();
	var bounceable_tag = 17;
	var non_bounceable_tag = 81;
	var test_flag = 128;
	function parseFriendlyAddress(src) {
		if (typeof src === "string" && !Address.isFriendly(src)) throw new Error("Unknown address type");
		const data = Buffer.isBuffer(src) ? src : Buffer.from(src, "base64");
		if (data.length !== 36) throw new Error("Unknown address type: byte length is not equal to 36");
		const addr = data.subarray(0, 34);
		const crc = data.subarray(34, 36);
		const calcedCrc = (0, crc16_1.crc16)(addr);
		if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) throw new Error("Invalid checksum: " + src);
		let tag = addr[0];
		let isTestOnly = false;
		let isBounceable = false;
		if (tag & test_flag) {
			isTestOnly = true;
			tag = tag ^ test_flag;
		}
		if (tag !== bounceable_tag && tag !== non_bounceable_tag) throw "Unknown address tag";
		isBounceable = tag === bounceable_tag;
		let workchain = null;
		if (addr[1] === 255) workchain = -1;
		else workchain = addr[1];
		const hashPart = addr.subarray(2, 34);
		return {
			isTestOnly,
			isBounceable,
			workchain,
			hashPart
		};
	}
	var Address = class Address {
		static isAddress(src) {
			return src instanceof Address;
		}
		static isFriendly(source) {
			if (source.length !== 48) return false;
			if (!/^[A-Za-z0-9+/_-]+$/.test(source)) return false;
			return true;
		}
		static isRaw(source) {
			if (source.indexOf(":") === -1) return false;
			let [wc, hash] = source.split(":");
			if (!Number.isInteger(parseFloat(wc))) return false;
			if (!/[a-f0-9]+/.test(hash.toLowerCase())) return false;
			if (hash.length !== 64) return false;
			return true;
		}
		static normalize(source) {
			if (typeof source === "string") return Address.parse(source).toString();
			else return source.toString();
		}
		static parse(source) {
			if (Address.isFriendly(source)) return this.parseFriendly(source).address;
			else if (Address.isRaw(source)) return this.parseRaw(source);
			else throw new Error("Unknown address type: " + source);
		}
		static parseRaw(source) {
			return new Address(parseInt(source.split(":")[0]), Buffer.from(source.split(":")[1], "hex"));
		}
		static parseFriendly(source) {
			if (Buffer.isBuffer(source)) {
				let r = parseFriendlyAddress(source);
				return {
					isBounceable: r.isBounceable,
					isTestOnly: r.isTestOnly,
					address: new Address(r.workchain, r.hashPart)
				};
			} else {
				let r = parseFriendlyAddress(source.replace(/\-/g, "+").replace(/_/g, "/"));
				return {
					isBounceable: r.isBounceable,
					isTestOnly: r.isTestOnly,
					address: new Address(r.workchain, r.hashPart)
				};
			}
		}
		constructor(workChain, hash) {
			this.toRawString = () => {
				return this.workChain + ":" + this.hash.toString("hex");
			};
			this.toRaw = () => {
				const addressWithChecksum = Buffer.alloc(36);
				addressWithChecksum.set(this.hash);
				addressWithChecksum.set([
					this.workChain,
					this.workChain,
					this.workChain,
					this.workChain
				], 32);
				return addressWithChecksum;
			};
			this.toStringBuffer = (args) => {
				let testOnly = args && args.testOnly !== void 0 ? args.testOnly : false;
				let tag = (args && args.bounceable !== void 0 ? args.bounceable : true) ? bounceable_tag : non_bounceable_tag;
				if (testOnly) tag |= test_flag;
				const addr = Buffer.alloc(34);
				addr[0] = tag;
				addr[1] = this.workChain;
				addr.set(this.hash, 2);
				const addressWithChecksum = Buffer.alloc(36);
				addressWithChecksum.set(addr);
				addressWithChecksum.set((0, crc16_1.crc16)(addr), 34);
				return addressWithChecksum;
			};
			this.toString = (args) => {
				let urlSafe = args && args.urlSafe !== void 0 ? args.urlSafe : true;
				let buffer = this.toStringBuffer(args);
				if (urlSafe) return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
				else return buffer.toString("base64");
			};
			this[_a] = () => this.toString();
			if (hash.length !== 32) throw new Error("Invalid address hash length: " + hash.length);
			this.workChain = workChain;
			this.hash = hash;
			Object.freeze(this);
		}
		equals(src) {
			if (src.workChain !== this.workChain) return false;
			return src.hash.equals(this.hash);
		}
	};
	exports.Address = Address;
	_a = inspect_1.inspectSymbol;
	function address(src) {
		return Address.parse(src);
	}
	exports.address = address;
}));
//#endregion
//#region node_modules/@ton/core/dist/address/ExternalAddress.js
var require_ExternalAddress = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExternalAddress = void 0;
	var inspect_1 = require_inspect();
	exports.ExternalAddress = class ExternalAddress {
		static isAddress(src) {
			return src instanceof ExternalAddress;
		}
		constructor(value, bits) {
			this[_a] = () => this.toString();
			this.value = value;
			this.bits = bits;
		}
		toString() {
			return `External<${this.bits}:${this.value}>`;
		}
	};
	_a = inspect_1.inspectSymbol;
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/base32.js
var require_base32 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.base32Decode = exports.base32Encode = void 0;
	var alphabet = "abcdefghijklmnopqrstuvwxyz234567";
	function base32Encode(buffer) {
		const length = buffer.byteLength;
		let bits = 0;
		let value = 0;
		let output = "";
		for (let i = 0; i < length; i++) {
			value = value << 8 | buffer[i];
			bits += 8;
			while (bits >= 5) {
				output += alphabet[value >>> bits - 5 & 31];
				bits -= 5;
			}
		}
		if (bits > 0) output += alphabet[value << 5 - bits & 31];
		return output;
	}
	exports.base32Encode = base32Encode;
	function readChar(alphabet, char) {
		const idx = alphabet.indexOf(char);
		if (idx === -1) throw new Error("Invalid character found: " + char);
		return idx;
	}
	function base32Decode(input) {
		let cleanedInput;
		cleanedInput = input.toLowerCase();
		const { length } = cleanedInput;
		let bits = 0;
		let value = 0;
		let index = 0;
		const output = Buffer.alloc(length * 5 / 8 | 0);
		for (let i = 0; i < length; i++) {
			value = value << 5 | readChar(alphabet, cleanedInput[i]);
			bits += 5;
			if (bits >= 8) {
				output[index++] = value >>> bits - 8 & 255;
				bits -= 8;
			}
		}
		return output;
	}
	exports.base32Decode = base32Decode;
}));
//#endregion
//#region node_modules/@ton/core/dist/address/ADNLAddress.js
var require_ADNLAddress = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ADNLAddress = void 0;
	var inspect_1 = require_inspect();
	var base32_1 = require_base32();
	var crc16_1 = require_crc16();
	exports.ADNLAddress = class ADNLAddress {
		static parseFriendly(src) {
			if (src.length !== 55) throw Error("Invalid address");
			src = "f" + src;
			let decoded = (0, base32_1.base32Decode)(src);
			if (decoded[0] !== 45) throw Error("Invalid address");
			let gotHash = decoded.slice(33);
			if (!(0, crc16_1.crc16)(decoded.slice(0, 33)).equals(gotHash)) throw Error("Invalid address");
			return new ADNLAddress(decoded.slice(1, 33));
		}
		static parseRaw(src) {
			return new ADNLAddress(Buffer.from(src, "base64"));
		}
		constructor(address) {
			this.toRaw = () => {
				return this.address.toString("hex").toUpperCase();
			};
			this.toString = () => {
				let data = Buffer.concat([Buffer.from([45]), this.address]);
				let hash = (0, crc16_1.crc16)(data);
				data = Buffer.concat([data, hash]);
				return (0, base32_1.base32Encode)(data).slice(1);
			};
			this[_a] = () => this.toString();
			if (address.length !== 32) throw Error("Invalid address");
			this.address = address;
		}
		equals(b) {
			return this.address.equals(b.address);
		}
	};
	_a = inspect_1.inspectSymbol;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/utils/paddedBits.js
var require_paddedBits = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.paddedBufferToBits = exports.bitsToPaddedBuffer = void 0;
	var BitBuilder_1 = require_BitBuilder();
	var BitString_1 = require_BitString();
	function bitsToPaddedBuffer(bits) {
		let builder = new BitBuilder_1.BitBuilder(Math.ceil(bits.length / 8) * 8);
		builder.writeBits(bits);
		let padding = Math.ceil(bits.length / 8) * 8 - bits.length;
		for (let i = 0; i < padding; i++) if (i === 0) builder.writeBit(1);
		else builder.writeBit(0);
		return builder.buffer();
	}
	exports.bitsToPaddedBuffer = bitsToPaddedBuffer;
	function paddedBufferToBits(buff) {
		let bitLen = 0;
		for (let i = buff.length - 1; i >= 0; i--) if (buff[i] !== 0) {
			const testByte = buff[i];
			let bitPos = testByte & -testByte;
			if ((bitPos & 1) == 0) bitPos = Math.log2(bitPos) + 1;
			if (i > 0) bitLen = i << 3;
			bitLen += 8 - bitPos;
			break;
		}
		return new BitString_1.BitString(buff, 0, bitLen);
	}
	exports.paddedBufferToBits = paddedBufferToBits;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/BitString.js
var require_BitString = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BitString = void 0;
	var paddedBits_1 = require_paddedBits();
	var inspect_1 = require_inspect();
	/**
	* BitString is a class that represents a bitstring in a buffer with a specified offset and length
	*/
	var BitString = class BitString {
		/**
		* Checks if supplied object is BitString
		* @param src is unknow object
		* @returns true if object is BitString and false otherwise
		**/
		static isBitString(src) {
			return src instanceof BitString;
		}
		/**
		* Constructing BitString from a buffer
		* @param data data that contains the bitstring data. NOTE: We are expecting this buffer to be NOT modified
		* @param offset offset in bits from the start of the buffer
		* @param length length of the bitstring in bits
		*/
		constructor(data, offset, length) {
			this[_a] = () => this.toString();
			if (length < 0) throw new Error(`Length ${length} is out of bounds`);
			this._length = length;
			this._data = data;
			this._offset = offset;
		}
		/**
		* Returns the length of the bitstring
		*/
		get length() {
			return this._length;
		}
		/**
		* Returns the bit at the specified index
		* @param index index of the bit
		* @throws Error if index is out of bounds
		* @returns true if the bit is set, false otherwise
		*/
		at(index) {
			if (index >= this._length) throw new Error(`Index ${index} > ${this._length} is out of bounds`);
			if (index < 0) throw new Error(`Index ${index} < 0 is out of bounds`);
			let byteIndex = this._offset + index >> 3;
			let bitIndex = 7 - (this._offset + index) % 8;
			return (this._data[byteIndex] & 1 << bitIndex) !== 0;
		}
		/**
		* Get a substring of the bitstring
		* @param offset
		* @param length
		* @returns
		*/
		substring(offset, length) {
			if (offset > this._length) throw new Error(`Offset(${offset}) > ${this._length} is out of bounds`);
			if (offset < 0) throw new Error(`Offset(${offset}) < 0 is out of bounds`);
			if (length === 0) return BitString.EMPTY;
			if (offset + length > this._length) throw new Error(`Offset ${offset} + Length ${length} > ${this._length} is out of bounds`);
			return new BitString(this._data, this._offset + offset, length);
		}
		/**
		* Try to get a buffer from the bitstring without allocations
		* @param offset offset in bits
		* @param length length in bits
		* @returns buffer if the bitstring is aligned to bytes, null otherwise
		*/
		subbuffer(offset, length) {
			if (offset > this._length) throw new Error(`Offset ${offset} is out of bounds`);
			if (offset < 0) throw new Error(`Offset ${offset} is out of bounds`);
			if (offset + length > this._length) throw new Error(`Offset + Length = ${offset + length} is out of bounds`);
			if (length % 8 !== 0) return null;
			if ((this._offset + offset) % 8 !== 0) return null;
			let start = this._offset + offset >> 3;
			let end = start + (length >> 3);
			return this._data.subarray(start, end);
		}
		/**
		* Checks for equality
		* @param b other bitstring
		* @returns true if the bitstrings are equal, false otherwise
		*/
		equals(b) {
			if (this._length !== b._length) return false;
			for (let i = 0; i < this._length; i++) if (this.at(i) !== b.at(i)) return false;
			return true;
		}
		/**
		* Format to canonical string
		* @returns formatted bits as a string
		*/
		toString() {
			const padded = (0, paddedBits_1.bitsToPaddedBuffer)(this);
			if (this._length % 4 === 0) {
				const s = padded.subarray(0, Math.ceil(this._length / 8)).toString("hex").toUpperCase();
				if (this._length % 8 === 0) return s;
				else return s.substring(0, s.length - 1);
			} else {
				const hex = padded.toString("hex").toUpperCase();
				if (this._length % 8 <= 4) return hex.substring(0, hex.length - 1) + "_";
				else return hex + "_";
			}
		}
	};
	exports.BitString = BitString;
	_a = inspect_1.inspectSymbol;
	BitString.EMPTY = new BitString(Buffer.alloc(0), 0, 0);
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/BitBuilder.js
var require_BitBuilder = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BitBuilder = void 0;
	var Address_1 = require_Address();
	var ExternalAddress_1 = require_ExternalAddress();
	var BitString_1 = require_BitString();
	/**
	* Class for building bit strings
	*/
	var BitBuilder = class {
		constructor(size = 1023) {
			this._buffer = Buffer.alloc(Math.ceil(size / 8));
			this._length = 0;
		}
		/**
		* Current number of bits written
		*/
		get length() {
			return this._length;
		}
		/**
		* Write a single bit
		* @param value bit to write, true or positive number for 1, false or zero or negative for 0
		*/
		writeBit(value) {
			let n = this._length;
			if (n > this._buffer.length * 8) throw new Error("BitBuilder overflow");
			if (typeof value === "boolean" && value === true || typeof value === "number" && value > 0) this._buffer[n / 8 | 0] |= 1 << 7 - n % 8;
			this._length++;
		}
		/**
		* Copy bits from BitString
		* @param src source bits
		*/
		writeBits(src) {
			for (let i = 0; i < src.length; i++) this.writeBit(src.at(i));
		}
		/**
		* Write bits from buffer
		* @param src source buffer
		*/
		writeBuffer(src) {
			if (this._length % 8 === 0) {
				if (this._length + src.length * 8 > this._buffer.length * 8) throw new Error("BitBuilder overflow");
				src.copy(this._buffer, this._length / 8);
				this._length += src.length * 8;
			} else for (let i = 0; i < src.length; i++) this.writeUint(src[i], 8);
		}
		/**
		* Write uint value
		* @param value value as bigint or number
		* @param bits number of bits to write
		*/
		writeUint(value, bits) {
			if (bits < 0 || !Number.isSafeInteger(bits)) throw Error(`invalid bit length. Got ${bits}`);
			const v = BigInt(value);
			if (bits === 0) if (v !== 0n) throw Error(`value is not zero for ${bits} bits. Got ${value}`);
			else return;
			const vBits = 1n << BigInt(bits);
			if (v < 0 || v >= vBits) throw Error(`bitLength is too small for a value ${value}. Got ${bits}`);
			if (this._length + bits > this._buffer.length * 8) throw new Error("BitBuilder overflow");
			const tillByte = 8 - this._length % 8;
			if (tillByte > 0) {
				const bidx = Math.floor(this._length / 8);
				if (bits < tillByte) {
					const wb = Number(v);
					this._buffer[bidx] |= wb << tillByte - bits;
					this._length += bits;
				} else {
					const wb = Number(v >> BigInt(bits - tillByte));
					this._buffer[bidx] |= wb;
					this._length += tillByte;
				}
			}
			bits -= tillByte;
			while (bits > 0) if (bits >= 8) {
				this._buffer[this._length / 8] = Number(v >> BigInt(bits - 8) & 255n);
				this._length += 8;
				bits -= 8;
			} else {
				this._buffer[this._length / 8] = Number(v << BigInt(8 - bits) & 255n);
				this._length += bits;
				bits = 0;
			}
		}
		/**
		* Write int value
		* @param value value as bigint or number
		* @param bits number of bits to write
		*/
		writeInt(value, bits) {
			let v = BigInt(value);
			if (bits < 0 || !Number.isSafeInteger(bits)) throw Error(`invalid bit length. Got ${bits}`);
			if (bits === 0) if (v !== 0n) throw Error(`value is not zero for ${bits} bits. Got ${value}`);
			else return;
			if (bits === 1) if (v !== -1n && v !== 0n) throw Error(`value is not zero or -1 for ${bits} bits. Got ${value}`);
			else {
				this.writeBit(v === -1n);
				return;
			}
			let vBits = 1n << BigInt(bits) - 1n;
			if (v < -vBits || v >= vBits) throw Error(`value is out of range for ${bits} bits. Got ${value}`);
			if (v < 0) {
				this.writeBit(true);
				v = vBits + v;
			} else this.writeBit(false);
			this.writeUint(v, bits - 1);
		}
		/**
		* Write var uint value, used for serializing coins
		* @param value value to write as bigint or number
		* @param bits header bits to write size
		*/
		writeVarUint(value, bits) {
			let v = BigInt(value);
			if (bits < 0 || !Number.isSafeInteger(bits)) throw Error(`invalid bit length. Got ${bits}`);
			if (v < 0) throw Error(`value is negative. Got ${value}`);
			if (v === 0n) {
				this.writeUint(0, bits);
				return;
			}
			const sizeBytes = Math.ceil(v.toString(2).length / 8);
			const sizeBits = sizeBytes * 8;
			this.writeUint(sizeBytes, bits);
			this.writeUint(v, sizeBits);
		}
		/**
		* Write var int value, used for serializing coins
		* @param value value to write as bigint or number
		* @param bits header bits to write size
		*/
		writeVarInt(value, bits) {
			let v = BigInt(value);
			if (bits < 0 || !Number.isSafeInteger(bits)) throw Error(`invalid bit length. Got ${bits}`);
			if (v === 0n) {
				this.writeUint(0, bits);
				return;
			}
			let v2 = v > 0 ? v : -v;
			const sizeBytes = Math.ceil((v2.toString(2).length + 1) / 8);
			const sizeBits = sizeBytes * 8;
			this.writeUint(sizeBytes, bits);
			this.writeInt(v, sizeBits);
		}
		/**
		* Write coins in var uint format
		* @param amount amount to write
		*/
		writeCoins(amount) {
			this.writeVarUint(amount, 4);
		}
		/**
		* Write address
		* @param address write address or address external
		*/
		writeAddress(address) {
			if (address === null || address === void 0) {
				this.writeUint(0, 2);
				return;
			}
			if (Address_1.Address.isAddress(address)) {
				this.writeUint(2, 2);
				this.writeUint(0, 1);
				this.writeInt(address.workChain, 8);
				this.writeBuffer(address.hash);
				return;
			}
			if (ExternalAddress_1.ExternalAddress.isAddress(address)) {
				this.writeUint(1, 2);
				this.writeUint(address.bits, 9);
				this.writeUint(address.value, address.bits);
				return;
			}
			throw Error(`Invalid address. Got ${address}`);
		}
		/**
		* Build BitString
		* @returns result bit string
		*/
		build() {
			return new BitString_1.BitString(this._buffer, 0, this._length);
		}
		/**
		* Build into Buffer
		* @returns result buffer
		*/
		buffer() {
			if (this._length % 8 !== 0) throw new Error("BitBuilder buffer is not byte aligned");
			return this._buffer.subarray(0, this._length / 8);
		}
	};
	exports.BitBuilder = BitBuilder;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/CellType.js
var require_CellType = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CellType = void 0;
	var CellType;
	(function(CellType) {
		CellType[CellType["Ordinary"] = -1] = "Ordinary";
		CellType[CellType["PrunedBranch"] = 1] = "PrunedBranch";
		CellType[CellType["Library"] = 2] = "Library";
		CellType[CellType["MerkleProof"] = 3] = "MerkleProof";
		CellType[CellType["MerkleUpdate"] = 4] = "MerkleUpdate";
	})(CellType || (exports.CellType = CellType = {}));
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/utils/readUnaryLength.js
var require_readUnaryLength = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.readUnaryLength = void 0;
	function readUnaryLength(slice) {
		let res = 0;
		while (slice.loadBit()) res++;
		return res;
	}
	exports.readUnaryLength = readUnaryLength;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/BitReader.js
var require_BitReader = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BitReader = void 0;
	var Address_1 = require_Address();
	var ExternalAddress_1 = require_ExternalAddress();
	exports.BitReader = class BitReader {
		constructor(bits, offset = 0) {
			this._checkpoints = [];
			this._bits = bits;
			this._offset = offset;
		}
		/**
		* Offset in source bit string
		*/
		get offset() {
			return this._offset;
		}
		/**
		* Number of bits remaining
		*/
		get remaining() {
			return this._bits.length - this._offset;
		}
		/**
		* Skip bits
		* @param bits number of bits to skip
		*/
		skip(bits) {
			if (bits < 0 || this._offset + bits > this._bits.length) throw new Error(`Index ${this._offset + bits} is out of bounds`);
			this._offset += bits;
		}
		/**
		* Reset to the beginning or latest checkpoint
		*/
		reset() {
			if (this._checkpoints.length > 0) this._offset = this._checkpoints.pop();
			else this._offset = 0;
		}
		/**
		* Save checkpoint
		*/
		save() {
			this._checkpoints.push(this._offset);
		}
		/**
		* Load a single bit
		* @returns true if the bit is set, false otherwise
		*/
		loadBit() {
			let r = this._bits.at(this._offset);
			this._offset++;
			return r;
		}
		/**
		* Preload bit
		* @returns true if the bit is set, false otherwise
		*/
		preloadBit() {
			return this._bits.at(this._offset);
		}
		/**
		* Load bit string
		* @param bits number of bits to read
		* @returns new bitstring
		*/
		loadBits(bits) {
			let r = this._bits.substring(this._offset, bits);
			this._offset += bits;
			return r;
		}
		/**
		* Preload bit string
		* @param bits number of bits to read
		* @returns new bitstring
		*/
		preloadBits(bits) {
			return this._bits.substring(this._offset, bits);
		}
		/**
		* Load buffer
		* @param bytes number of bytes
		* @returns new buffer
		*/
		loadBuffer(bytes) {
			let buf = this._preloadBuffer(bytes, this._offset);
			this._offset += bytes * 8;
			return buf;
		}
		/**
		* Preload buffer
		* @param bytes number of bytes
		* @returns new buffer
		*/
		preloadBuffer(bytes) {
			return this._preloadBuffer(bytes, this._offset);
		}
		/**
		* Load uint value
		* @param bits uint bits
		* @returns read value as number
		*/
		loadUint(bits) {
			return this._toSafeInteger(this.loadUintBig(bits), "loadUintBig");
		}
		/**
		* Load uint value as bigint
		* @param bits uint bits
		* @returns read value as bigint
		*/
		loadUintBig(bits) {
			let loaded = this.preloadUintBig(bits);
			this._offset += bits;
			return loaded;
		}
		/**
		* Preload uint value
		* @param bits uint bits
		* @returns read value as number
		*/
		preloadUint(bits) {
			return this._toSafeInteger(this._preloadUint(bits, this._offset), "preloadUintBig");
		}
		/**
		* Preload uint value as bigint
		* @param bits uint bits
		* @returns read value as bigint
		*/
		preloadUintBig(bits) {
			return this._preloadUint(bits, this._offset);
		}
		/**
		* Load int value
		* @param bits int bits
		* @returns read value as bigint
		*/
		loadInt(bits) {
			let res = this._preloadInt(bits, this._offset);
			this._offset += bits;
			return this._toSafeInteger(res, "loadUintBig");
		}
		/**
		* Load int value as bigint
		* @param bits int bits
		* @returns read value as bigint
		*/
		loadIntBig(bits) {
			let res = this._preloadInt(bits, this._offset);
			this._offset += bits;
			return res;
		}
		/**
		* Preload int value
		* @param bits int bits
		* @returns read value as bigint
		*/
		preloadInt(bits) {
			return this._toSafeInteger(this._preloadInt(bits, this._offset), "preloadIntBig");
		}
		/**
		* Preload int value
		* @param bits int bits
		* @returns read value as bigint
		*/
		preloadIntBig(bits) {
			return this._preloadInt(bits, this._offset);
		}
		/**
		* Load varuint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		loadVarUint(bits) {
			let size = Number(this.loadUint(bits));
			return this._toSafeInteger(this.loadUintBig(size * 8), "loadVarUintBig");
		}
		/**
		* Load varuint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		loadVarUintBig(bits) {
			let size = Number(this.loadUint(bits));
			return this.loadUintBig(size * 8);
		}
		/**
		* Preload varuint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		preloadVarUint(bits) {
			let size = Number(this._preloadUint(bits, this._offset));
			return this._toSafeInteger(this._preloadUint(size * 8, this._offset + bits), "preloadVarUintBig");
		}
		/**
		* Preload varuint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		preloadVarUintBig(bits) {
			let size = Number(this._preloadUint(bits, this._offset));
			return this._preloadUint(size * 8, this._offset + bits);
		}
		/**
		* Load varint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		loadVarInt(bits) {
			let size = Number(this.loadUint(bits));
			return this._toSafeInteger(this.loadIntBig(size * 8), "loadVarIntBig");
		}
		/**
		* Load varint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		loadVarIntBig(bits) {
			let size = Number(this.loadUint(bits));
			return this.loadIntBig(size * 8);
		}
		/**
		* Preload varint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		preloadVarInt(bits) {
			let size = Number(this._preloadUint(bits, this._offset));
			return this._toSafeInteger(this._preloadInt(size * 8, this._offset + bits), "preloadVarIntBig");
		}
		/**
		* Preload varint value
		* @param bits number of bits to read the size
		* @returns read value as bigint
		*/
		preloadVarIntBig(bits) {
			let size = Number(this._preloadUint(bits, this._offset));
			return this._preloadInt(size * 8, this._offset + bits);
		}
		/**
		* Load coins value
		* @returns read value as bigint
		*/
		loadCoins() {
			return this.loadVarUintBig(4);
		}
		/**
		* Preload coins value
		* @returns read value as bigint
		*/
		preloadCoins() {
			return this.preloadVarUintBig(4);
		}
		/**
		* Load Address
		* @returns Address
		*/
		loadAddress() {
			let type = Number(this._preloadUint(2, this._offset));
			if (type === 2) return this._loadInternalAddress();
			else throw new Error("Invalid address: " + type);
		}
		/**
		* Load internal address
		* @returns Address or null
		*/
		loadMaybeAddress() {
			let type = Number(this._preloadUint(2, this._offset));
			if (type === 0) {
				this._offset += 2;
				return null;
			} else if (type === 2) return this._loadInternalAddress();
			else throw new Error("Invalid address");
		}
		/**
		* Load external address
		* @returns ExternalAddress
		*/
		loadExternalAddress() {
			if (Number(this._preloadUint(2, this._offset)) === 1) return this._loadExternalAddress();
			else throw new Error("Invalid address");
		}
		/**
		* Load external address
		* @returns ExternalAddress or null
		*/
		loadMaybeExternalAddress() {
			let type = Number(this._preloadUint(2, this._offset));
			if (type === 0) {
				this._offset += 2;
				return null;
			} else if (type === 1) return this._loadExternalAddress();
			else throw new Error("Invalid address");
		}
		/**
		* Read address of any type
		* @returns Address or ExternalAddress or null
		*/
		loadAddressAny() {
			let type = Number(this._preloadUint(2, this._offset));
			if (type === 0) {
				this._offset += 2;
				return null;
			} else if (type === 2) return this._loadInternalAddress();
			else if (type === 1) return this._loadExternalAddress();
			else if (type === 3) throw Error("Unsupported");
			else throw Error("Unreachable");
		}
		/**
		* Load bit string that was padded to make it byte alligned. Used in BOC serialization
		* @param bits number of bytes to read
		*/
		loadPaddedBits(bits) {
			if (bits % 8 !== 0) throw new Error("Invalid number of bits");
			let length = bits;
			while (true) if (this._bits.at(this._offset + length - 1)) {
				length--;
				break;
			} else length--;
			let r = this._bits.substring(this._offset, length);
			this._offset += bits;
			return r;
		}
		/**
		* Clone BitReader
		*/
		clone() {
			return new BitReader(this._bits, this._offset);
		}
		/**
		* Preload int from specific offset
		* @param bits bits to preload
		* @param offset offset to start from
		* @returns read value as bigint
		*/
		_preloadInt(bits, offset) {
			if (bits == 0) return 0n;
			let sign = this._bits.at(offset);
			let res = 0n;
			for (let i = 0; i < bits - 1; i++) if (this._bits.at(offset + 1 + i)) res += 1n << BigInt(bits - i - 1 - 1);
			if (sign) res = res - (1n << BigInt(bits - 1));
			return res;
		}
		/**
		* Preload uint from specific offset
		* @param bits bits to preload
		* @param offset offset to start from
		* @returns read value as bigint
		*/
		_preloadUint(bits, offset) {
			if (bits == 0) return 0n;
			let res = 0n;
			for (let i = 0; i < bits; i++) if (this._bits.at(offset + i)) res += 1n << BigInt(bits - i - 1);
			return res;
		}
		_preloadBuffer(bytes, offset) {
			let fastBuffer = this._bits.subbuffer(offset, bytes * 8);
			if (fastBuffer) return fastBuffer;
			let buf = Buffer.alloc(bytes);
			for (let i = 0; i < bytes; i++) buf[i] = Number(this._preloadUint(8, offset + i * 8));
			return buf;
		}
		_loadInternalAddress() {
			if (Number(this._preloadUint(2, this._offset)) !== 2) throw Error("Invalid address");
			let rewrite_pfx = void 0;
			let rewrite_depth = void 0;
			if (this._preloadUint(1, this._offset + 2) !== 0n) {
				rewrite_depth = Number(this._preloadUint(5, this._offset + 3));
				rewrite_pfx = this._preloadUint(rewrite_depth, this._offset + 8);
				this._offset += 5 + rewrite_depth;
			}
			let wc = Number(this._preloadInt(8, this._offset + 3));
			let hash = this._preloadBuffer(32, this._offset + 11);
			if (rewrite_depth !== void 0 && rewrite_pfx !== void 0) {
				let pfx = Number(rewrite_pfx);
				let byteIndex = 0;
				let bitIndex = 0;
				let bitsRemaining = rewrite_depth;
				while (bitsRemaining > 0) {
					let bitsInThisByte = Math.min(8 - bitIndex, bitsRemaining);
					let mask = (1 << bitsInThisByte) - 1 << 8 - bitIndex - bitsInThisByte;
					let bits = (pfx >> bitsRemaining - bitsInThisByte & (1 << bitsInThisByte) - 1) << 8 - bitIndex - bitsInThisByte;
					hash[byteIndex] = hash[byteIndex] & ~mask | bits;
					bitsRemaining -= bitsInThisByte;
					bitIndex += bitsInThisByte;
					if (bitIndex === 8) {
						byteIndex++;
						bitIndex = 0;
					}
				}
			}
			this._offset += 267;
			return new Address_1.Address(wc, hash);
		}
		_loadExternalAddress() {
			if (Number(this._preloadUint(2, this._offset)) !== 1) throw Error("Invalid address");
			let bits = Number(this._preloadUint(9, this._offset + 2));
			let value = this._preloadUint(bits, this._offset + 11);
			this._offset += 11 + bits;
			return new ExternalAddress_1.ExternalAddress(value, bits);
		}
		_toSafeInteger(src, alt) {
			if (BigInt(Number.MAX_SAFE_INTEGER) < src || src < BigInt(Number.MIN_SAFE_INTEGER)) throw new TypeError(`${src} is out of safe integer range. Use ${alt} instead`);
			return Number(src);
		}
	};
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/exoticMerkleProof.js
var require_exoticMerkleProof = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.convertToMerkleProof = exports.exoticMerkleProof = void 0;
	var BitReader_1 = require_BitReader();
	var Builder_1 = require_Builder();
	function exoticMerkleProof(bits, refs) {
		const reader = new BitReader_1.BitReader(bits);
		if (bits.length !== 280) throw new Error(`Merkle Proof cell must have exactly (8 + 256 + 16) bits, got "${bits.length}"`);
		if (refs.length !== 1) throw new Error(`Merkle Proof cell must have exactly 1 ref, got "${refs.length}"`);
		let type = reader.loadUint(8);
		if (type !== 3) throw new Error(`Merkle Proof cell must have type 3, got "${type}"`);
		const proofHash = reader.loadBuffer(32);
		const proofDepth = reader.loadUint(16);
		const refHash = refs[0].hash(0);
		const refDepth = refs[0].depth(0);
		if (proofDepth !== refDepth) throw new Error(`Merkle Proof cell ref depth must be exactly "${proofDepth}", got "${refDepth}"`);
		if (!proofHash.equals(refHash)) throw new Error(`Merkle Proof cell ref hash must be exactly "${proofHash.toString("hex")}", got "${refHash.toString("hex")}"`);
		return {
			proofDepth,
			proofHash
		};
	}
	exports.exoticMerkleProof = exoticMerkleProof;
	function convertToMerkleProof(c) {
		return (0, Builder_1.beginCell)().storeUint(3, 8).storeBuffer(c.hash(0)).storeUint(c.depth(0), 16).storeRef(c).endCell({ exotic: true });
	}
	exports.convertToMerkleProof = convertToMerkleProof;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/generateMerkleProof.js
var require_generateMerkleProof = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateMerkleProof = exports.generateMerkleProofDirect = void 0;
	var Builder_1 = require_Builder();
	var readUnaryLength_1 = require_readUnaryLength();
	var exoticMerkleProof_1 = require_exoticMerkleProof();
	function convertToPrunedBranch(c) {
		return (0, Builder_1.beginCell)().storeUint(1, 8).storeUint(1, 8).storeBuffer(c.hash(0)).storeUint(c.depth(0), 16).endCell({ exotic: true });
	}
	function doGenerateMerkleProof(prefix, slice, n, keys) {
		const originalCell = slice.asCell();
		if (keys.length == 0) return convertToPrunedBranch(originalCell);
		let lb0 = slice.loadBit() ? 1 : 0;
		let prefixLength = 0;
		let pp = prefix;
		if (lb0 === 0) {
			prefixLength = (0, readUnaryLength_1.readUnaryLength)(slice);
			for (let i = 0; i < prefixLength; i++) pp += slice.loadBit() ? "1" : "0";
		} else if ((slice.loadBit() ? 1 : 0) === 0) {
			prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
			for (let i = 0; i < prefixLength; i++) pp += slice.loadBit() ? "1" : "0";
		} else {
			let bit = slice.loadBit() ? "1" : "0";
			prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
			for (let i = 0; i < prefixLength; i++) pp += bit;
		}
		if (n - prefixLength === 0) return originalCell;
		else {
			let sl = originalCell.beginParse();
			let left = sl.loadRef();
			let right = sl.loadRef();
			if (!left.isExotic) {
				const leftKeys = keys.filter((key) => {
					return pp + "0" === key.slice(0, pp.length + 1);
				});
				left = doGenerateMerkleProof(pp + "0", left.beginParse(), n - prefixLength - 1, leftKeys);
			}
			if (!right.isExotic) {
				const rightKeys = keys.filter((key) => {
					return pp + "1" === key.slice(0, pp.length + 1);
				});
				right = doGenerateMerkleProof(pp + "1", right.beginParse(), n - prefixLength - 1, rightKeys);
			}
			return (0, Builder_1.beginCell)().storeSlice(sl).storeRef(left).storeRef(right).endCell();
		}
	}
	function generateMerkleProofDirect(dict, keys, keyObject) {
		keys.forEach((key) => {
			if (!dict.has(key)) throw new Error(`Trying to generate merkle proof for a missing key "${key}"`);
		});
		return doGenerateMerkleProof("", (0, Builder_1.beginCell)().storeDictDirect(dict).asSlice(), keyObject.bits, keys.map((key) => keyObject.serialize(key).toString(2).padStart(keyObject.bits, "0")));
	}
	exports.generateMerkleProofDirect = generateMerkleProofDirect;
	function generateMerkleProof(dict, keys, keyObject) {
		return (0, exoticMerkleProof_1.convertToMerkleProof)(generateMerkleProofDirect(dict, keys, keyObject));
	}
	exports.generateMerkleProof = generateMerkleProof;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/generateMerkleUpdate.js
var require_generateMerkleUpdate = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateMerkleUpdate = void 0;
	var Builder_1 = require_Builder();
	var generateMerkleProof_1 = require_generateMerkleProof();
	function convertToMerkleUpdate(c1, c2) {
		return (0, Builder_1.beginCell)().storeUint(4, 8).storeBuffer(c1.hash(0)).storeBuffer(c2.hash(0)).storeUint(c1.depth(0), 16).storeUint(c2.depth(0), 16).storeRef(c1).storeRef(c2).endCell({ exotic: true });
	}
	function generateMerkleUpdate(dict, key, keyObject, newValue) {
		const oldProof = (0, generateMerkleProof_1.generateMerkleProof)(dict, [key], keyObject).refs[0];
		dict.set(key, newValue);
		const newProof = (0, generateMerkleProof_1.generateMerkleProof)(dict, [key], keyObject).refs[0];
		return convertToMerkleUpdate(oldProof, newProof);
	}
	exports.generateMerkleUpdate = generateMerkleUpdate;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/parseDict.js
var require_parseDict = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseDict = void 0;
	function readUnaryLength(slice) {
		let res = 0;
		while (slice.loadBit()) res++;
		return res;
	}
	function doParse(prefix, slice, n, res, extractor) {
		let lb0 = slice.loadBit() ? 1 : 0;
		let prefixLength = 0;
		let pp = prefix;
		if (lb0 === 0) {
			prefixLength = readUnaryLength(slice);
			for (let i = 0; i < prefixLength; i++) pp += slice.loadBit() ? "1" : "0";
		} else if ((slice.loadBit() ? 1 : 0) === 0) {
			prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
			for (let i = 0; i < prefixLength; i++) pp += slice.loadBit() ? "1" : "0";
		} else {
			let bit = slice.loadBit() ? "1" : "0";
			prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
			for (let i = 0; i < prefixLength; i++) pp += bit;
		}
		if (n - prefixLength === 0) res.set(BigInt("0b" + pp), extractor(slice));
		else {
			let left = slice.loadRef();
			let right = slice.loadRef();
			if (!left.isExotic) doParse(pp + "0", left.beginParse(), n - prefixLength - 1, res, extractor);
			if (!right.isExotic) doParse(pp + "1", right.beginParse(), n - prefixLength - 1, res, extractor);
		}
	}
	function parseDict(sc, keySize, extractor) {
		let res = /* @__PURE__ */ new Map();
		if (sc) doParse("", sc, keySize, res, extractor);
		return res;
	}
	exports.parseDict = parseDict;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/utils/findCommonPrefix.js
var require_findCommonPrefix = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.findCommonPrefix = void 0;
	function findCommonPrefix(src, startPos = 0) {
		if (src.length === 0) return "";
		let r = src[0].slice(startPos);
		for (let i = 1; i < src.length; i++) {
			const s = src[i];
			while (s.indexOf(r, startPos) !== startPos) {
				r = r.substring(0, r.length - 1);
				if (r === "") return r;
			}
		}
		return r;
	}
	exports.findCommonPrefix = findCommonPrefix;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/serializeDict.js
var require_serializeDict = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.serializeDict = exports.detectLabelType = exports.writeLabelSame = exports.writeLabelLong = exports.writeLabelShort = exports.buildTree = void 0;
	var Builder_1 = require_Builder();
	var findCommonPrefix_1 = require_findCommonPrefix();
	function pad(src, size) {
		while (src.length < size) src = "0" + src;
		return src;
	}
	function forkMap(src, prefixLen) {
		if (src.size === 0) throw Error("Internal inconsistency");
		let left = /* @__PURE__ */ new Map();
		let right = /* @__PURE__ */ new Map();
		for (let [k, d] of src.entries()) if (k[prefixLen] === "0") left.set(k, d);
		else right.set(k, d);
		if (left.size === 0) throw Error("Internal inconsistency. Left emtpy.");
		if (right.size === 0) throw Error("Internal inconsistency. Right emtpy.");
		return {
			left,
			right
		};
	}
	function buildNode(src, prefixLen) {
		if (src.size === 0) throw Error("Internal inconsistency");
		if (src.size === 1) return {
			type: "leaf",
			value: Array.from(src.values())[0]
		};
		let { left, right } = forkMap(src, prefixLen);
		return {
			type: "fork",
			left: buildEdge(left, prefixLen + 1),
			right: buildEdge(right, prefixLen + 1)
		};
	}
	function buildEdge(src, prefixLen = 0) {
		if (src.size === 0) throw Error("Internal inconsistency");
		const label = (0, findCommonPrefix_1.findCommonPrefix)(Array.from(src.keys()), prefixLen);
		return {
			label,
			node: buildNode(src, label.length + prefixLen)
		};
	}
	function buildTree(src, keyLength) {
		let converted = /* @__PURE__ */ new Map();
		for (let k of Array.from(src.keys())) {
			const padded = pad(k.toString(2), keyLength);
			converted.set(padded, src.get(k));
		}
		return buildEdge(converted);
	}
	exports.buildTree = buildTree;
	function writeLabelShort(src, to) {
		to.storeBit(0);
		for (let i = 0; i < src.length; i++) to.storeBit(1);
		to.storeBit(0);
		if (src.length > 0) to.storeUint(BigInt("0b" + src), src.length);
		return to;
	}
	exports.writeLabelShort = writeLabelShort;
	function labelShortLength(src) {
		return 1 + src.length + 1 + src.length;
	}
	function writeLabelLong(src, keyLength, to) {
		to.storeBit(1);
		to.storeBit(0);
		let length = Math.ceil(Math.log2(keyLength + 1));
		to.storeUint(src.length, length);
		if (src.length > 0) to.storeUint(BigInt("0b" + src), src.length);
		return to;
	}
	exports.writeLabelLong = writeLabelLong;
	function labelLongLength(src, keyLength) {
		return 2 + Math.ceil(Math.log2(keyLength + 1)) + src.length;
	}
	function writeLabelSame(value, length, keyLength, to) {
		to.storeBit(1);
		to.storeBit(1);
		to.storeBit(value);
		let lenLen = Math.ceil(Math.log2(keyLength + 1));
		to.storeUint(length, lenLen);
	}
	exports.writeLabelSame = writeLabelSame;
	function labelSameLength(keyLength) {
		return 3 + Math.ceil(Math.log2(keyLength + 1));
	}
	function isSame(src) {
		if (src.length === 0 || src.length === 1) return true;
		for (let i = 1; i < src.length; i++) if (src[i] !== src[0]) return false;
		return true;
	}
	function detectLabelType(src, keyLength) {
		let kind = "short";
		let kindLength = labelShortLength(src);
		let longLength = labelLongLength(src, keyLength);
		if (longLength < kindLength) {
			kindLength = longLength;
			kind = "long";
		}
		if (isSame(src)) {
			let sameLength = labelSameLength(keyLength);
			if (sameLength < kindLength) {
				kindLength = sameLength;
				kind = "same";
			}
		}
		return kind;
	}
	exports.detectLabelType = detectLabelType;
	function writeLabel(src, keyLength, to) {
		let type = detectLabelType(src, keyLength);
		if (type === "short") writeLabelShort(src, to);
		else if (type === "long") writeLabelLong(src, keyLength, to);
		else if (type === "same") writeLabelSame(src[0] === "1", src.length, keyLength, to);
	}
	function writeNode(src, keyLength, serializer, to) {
		if (src.type === "leaf") serializer(src.value, to);
		if (src.type === "fork") {
			const leftCell = (0, Builder_1.beginCell)();
			const rightCell = (0, Builder_1.beginCell)();
			writeEdge(src.left, keyLength - 1, serializer, leftCell);
			writeEdge(src.right, keyLength - 1, serializer, rightCell);
			to.storeRef(leftCell);
			to.storeRef(rightCell);
		}
	}
	function writeEdge(src, keyLength, serializer, to) {
		writeLabel(src.label, keyLength, to);
		writeNode(src.node, keyLength - src.label.length, serializer, to);
	}
	function serializeDict(src, keyLength, serializer, to) {
		writeEdge(buildTree(src, keyLength), keyLength, serializer, to);
	}
	exports.serializeDict = serializeDict;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/utils/internalKeySerializer.js
var require_internalKeySerializer = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deserializeInternalKey = exports.serializeInternalKey = void 0;
	var Address_1 = require_Address();
	var BitString_1 = require_BitString();
	var paddedBits_1 = require_paddedBits();
	function serializeInternalKey(value) {
		if (typeof value === "number") {
			if (!Number.isSafeInteger(value)) throw Error("Invalid key type: not a safe integer: " + value);
			return "n:" + value.toString(10);
		} else if (typeof value === "bigint") return "b:" + value.toString(10);
		else if (Address_1.Address.isAddress(value)) return "a:" + value.toString();
		else if (Buffer.isBuffer(value)) return "f:" + value.toString("hex");
		else if (BitString_1.BitString.isBitString(value)) return "B:" + value.toString();
		else throw Error("Invalid key type");
	}
	exports.serializeInternalKey = serializeInternalKey;
	function deserializeInternalKey(value) {
		let k = value.slice(0, 2);
		let v = value.slice(2);
		if (k === "n:") return parseInt(v, 10);
		else if (k === "b:") return BigInt(v);
		else if (k === "a:") return Address_1.Address.parse(v);
		else if (k === "f:") return Buffer.from(v, "hex");
		else if (k === "B:") {
			const lastDash = v.slice(-1) == "_";
			if (lastDash || v.length % 2 != 0) {
				let charLen = lastDash ? v.length - 1 : v.length;
				const padded = v.substr(0, charLen) + "0";
				if (!lastDash && (charLen & 1) !== 0) return new BitString_1.BitString(Buffer.from(padded, "hex"), 0, charLen << 2);
				else return (0, paddedBits_1.paddedBufferToBits)(Buffer.from(padded, "hex"));
			} else return new BitString_1.BitString(Buffer.from(v, "hex"), 0, v.length << 2);
		}
		throw Error("Invalid key type: " + k);
	}
	exports.deserializeInternalKey = deserializeInternalKey;
}));
//#endregion
//#region node_modules/@ton/core/dist/dict/Dictionary.js
var require_Dictionary = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Dictionary = void 0;
	var Address_1 = require_Address();
	var Builder_1 = require_Builder();
	var Cell_1 = require_Cell();
	var BitString_1 = require_BitString();
	var generateMerkleProof_1 = require_generateMerkleProof();
	var generateMerkleUpdate_1 = require_generateMerkleUpdate();
	var parseDict_1 = require_parseDict();
	var serializeDict_1 = require_serializeDict();
	var internalKeySerializer_1 = require_internalKeySerializer();
	var Dictionary = class Dictionary {
		/**
		* Create an empty map
		* @param key key type
		* @param value value type
		* @returns Dictionary<K, V>
		*/
		static empty(key, value) {
			if (key && value) return new Dictionary(/* @__PURE__ */ new Map(), key, value);
			else return new Dictionary(/* @__PURE__ */ new Map(), null, null);
		}
		/**
		* Load dictionary from slice
		* @param key key description
		* @param value value description
		* @param sc slice
		* @returns Dictionary<K, V>
		*/
		static load(key, value, sc) {
			let slice;
			if (sc instanceof Cell_1.Cell) {
				if (sc.isExotic) return Dictionary.empty(key, value);
				slice = sc.beginParse();
			} else slice = sc;
			let cell = slice.loadMaybeRef();
			if (cell && !cell.isExotic) return Dictionary.loadDirect(key, value, cell.beginParse());
			else return Dictionary.empty(key, value);
		}
		/**
		* Low level method for rare dictionaries from system contracts.
		* Loads dictionary from slice directly without going to the ref.
		*
		* @param key key description
		* @param value value description
		* @param sc slice
		* @returns Dictionary<K, V>
		*/
		static loadDirect(key, value, sc) {
			if (!sc) return Dictionary.empty(key, value);
			let slice;
			if (sc instanceof Cell_1.Cell) slice = sc.beginParse();
			else slice = sc;
			let values = (0, parseDict_1.parseDict)(slice, key.bits, value.parse);
			let prepare = /* @__PURE__ */ new Map();
			for (let [k, v] of values) prepare.set((0, internalKeySerializer_1.serializeInternalKey)(key.parse(k)), v);
			return new Dictionary(prepare, key, value);
		}
		constructor(values, key, value) {
			this._key = key;
			this._value = value;
			this._map = values;
		}
		get size() {
			return this._map.size;
		}
		get(key) {
			return this._map.get((0, internalKeySerializer_1.serializeInternalKey)(key));
		}
		has(key) {
			return this._map.has((0, internalKeySerializer_1.serializeInternalKey)(key));
		}
		set(key, value) {
			this._map.set((0, internalKeySerializer_1.serializeInternalKey)(key), value);
			return this;
		}
		delete(key) {
			const k = (0, internalKeySerializer_1.serializeInternalKey)(key);
			return this._map.delete(k);
		}
		clear() {
			this._map.clear();
		}
		*[Symbol.iterator]() {
			for (const [k, v] of this._map) yield [(0, internalKeySerializer_1.deserializeInternalKey)(k), v];
		}
		keys() {
			return Array.from(this._map.keys()).map((v) => (0, internalKeySerializer_1.deserializeInternalKey)(v));
		}
		values() {
			return Array.from(this._map.values());
		}
		store(builder, key, value) {
			if (this._map.size === 0) builder.storeBit(0);
			else {
				let resolvedKey = this._key;
				if (key !== null && key !== void 0) resolvedKey = key;
				let resolvedValue = this._value;
				if (value !== null && value !== void 0) resolvedValue = value;
				if (!resolvedKey) throw Error("Key serializer is not defined");
				if (!resolvedValue) throw Error("Value serializer is not defined");
				let prepared = /* @__PURE__ */ new Map();
				for (const [k, v] of this._map) prepared.set(resolvedKey.serialize((0, internalKeySerializer_1.deserializeInternalKey)(k)), v);
				builder.storeBit(1);
				let dd = (0, Builder_1.beginCell)();
				(0, serializeDict_1.serializeDict)(prepared, resolvedKey.bits, resolvedValue.serialize, dd);
				builder.storeRef(dd.endCell());
			}
		}
		storeDirect(builder, key, value) {
			if (this._map.size === 0) throw Error("Cannot store empty dictionary directly");
			let resolvedKey = this._key;
			if (key !== null && key !== void 0) resolvedKey = key;
			let resolvedValue = this._value;
			if (value !== null && value !== void 0) resolvedValue = value;
			if (!resolvedKey) throw Error("Key serializer is not defined");
			if (!resolvedValue) throw Error("Value serializer is not defined");
			let prepared = /* @__PURE__ */ new Map();
			for (const [k, v] of this._map) prepared.set(resolvedKey.serialize((0, internalKeySerializer_1.deserializeInternalKey)(k)), v);
			(0, serializeDict_1.serializeDict)(prepared, resolvedKey.bits, resolvedValue.serialize, builder);
		}
		/**
		* Generate merkle proof for multiple keys in the dictionary
		* @param keys an array of the keys
		* @returns generated merkle proof cell
		*/
		generateMerkleProof(keys) {
			return (0, generateMerkleProof_1.generateMerkleProof)(this, keys, this._key);
		}
		/**
		* Low level method for generating pruned dictionary directly.
		* The result can be used as a part of a bigger merkle proof
		* @param keys an array of the keys
		* @returns cell that contains the pruned dictionary
		*/
		generateMerkleProofDirect(keys) {
			return (0, generateMerkleProof_1.generateMerkleProofDirect)(this, keys, this._key);
		}
		generateMerkleUpdate(key, newValue) {
			return (0, generateMerkleUpdate_1.generateMerkleUpdate)(this, key, this._key, newValue);
		}
	};
	exports.Dictionary = Dictionary;
	Dictionary.Keys = {
		/**
		* Standard address key
		* @returns DictionaryKey<Address>
		*/
		Address: () => {
			return createAddressKey();
		},
		/**
		* Create standard big integer key
		* @param bits number of bits
		* @returns DictionaryKey<bigint>
		*/
		BigInt: (bits) => {
			return createBigIntKey(bits);
		},
		/**
		* Create integer key
		* @param bits bits of integer
		* @returns DictionaryKey<number>
		*/
		Int: (bits) => {
			return createIntKey(bits);
		},
		/**
		* Create standard unsigned big integer key
		* @param bits number of bits
		* @returns DictionaryKey<bigint>
		*/
		BigUint: (bits) => {
			return createBigUintKey(bits);
		},
		/**
		* Create standard unsigned integer key
		* @param bits number of bits
		* @returns DictionaryKey<number>
		*/
		Uint: (bits) => {
			return createUintKey(bits);
		},
		/**
		* Create standard buffer key
		* @param bytes number of bytes of a buffer
		* @returns DictionaryKey<Buffer>
		*/
		Buffer: (bytes) => {
			return createBufferKey(bytes);
		},
		/**
		* Create BitString key
		* @param bits key length
		* @returns DictionaryKey<BitString>
		* Point is that Buffer has to be 8 bit aligned,
		* while key is TVM dictionary doesn't have to be
		* aligned at all.
		*/
		BitString: (bits) => {
			return createBitStringKey(bits);
		}
	};
	Dictionary.Values = {
		/**
		* Create standard integer value
		* @returns DictionaryValue<bigint>
		*/
		BigInt: (bits) => {
			return createBigIntValue(bits);
		},
		/**
		* Create standard integer value
		* @returns DictionaryValue<number>
		*/
		Int: (bits) => {
			return createIntValue(bits);
		},
		/**
		* Create big var int
		* @param bits number of header bits
		* @returns DictionaryValue<bigint>
		*/
		BigVarInt: (bits) => {
			return createBigVarIntValue(bits);
		},
		/**
		* Create standard unsigned integer value
		* @param bits number of bits
		* @returns DictionaryValue<bigint>
		*/
		BigUint: (bits) => {
			return createBigUintValue(bits);
		},
		/**
		* Create standard unsigned integer value
		* @param bits number of bits
		* @returns DictionaryValue<bigint>
		*/
		Uint: (bits) => {
			return createUintValue(bits);
		},
		/**
		* Create big var int
		* @param bits number of header bits
		* @returns DictionaryValue<bigint>
		*/
		BigVarUint: (bits) => {
			return createBigVarUintValue(bits);
		},
		/**
		* Create standard boolean value
		* @returns DictionaryValue<boolean>
		*/
		Bool: () => {
			return createBooleanValue();
		},
		/**
		* Create standard address value
		* @returns DictionaryValue<Address>
		*/
		Address: () => {
			return createAddressValue();
		},
		/**
		* Create standard cell value
		* @returns DictionaryValue<Cell>
		*/
		Cell: () => {
			return createCellValue();
		},
		/**
		* Create Builder value
		* @param bytes number of bytes of a buffer
		* @returns DictionaryValue<Builder>
		*/
		Buffer: (bytes) => {
			return createBufferValue(bytes);
		},
		/**
		* Create BitString value
		* @param bits bit length
		* @returns DictionaryValue<BitString>
		* Point is that Buffer is not applicable
		* when length is not 8 bit alligned.
		*/
		BitString: (bits) => {
			return createBitStringValue(bits);
		},
		/**
		* Create dictionary value
		* @param key
		* @param value
		*/
		Dictionary: (key, value) => {
			return createDictionaryValue(key, value);
		}
	};
	function createAddressKey() {
		return {
			bits: 267,
			serialize: (src) => {
				if (!Address_1.Address.isAddress(src)) throw Error("Key is not an address");
				return (0, Builder_1.beginCell)().storeAddress(src).endCell().beginParse().preloadUintBig(267);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, 267).endCell().beginParse().loadAddress();
			}
		};
	}
	function createBigIntKey(bits) {
		return {
			bits,
			serialize: (src) => {
				if (typeof src !== "bigint") throw Error("Key is not a bigint");
				return (0, Builder_1.beginCell)().storeInt(src, bits).endCell().beginParse().loadUintBig(bits);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadIntBig(bits);
			}
		};
	}
	function createIntKey(bits) {
		return {
			bits,
			serialize: (src) => {
				if (typeof src !== "number") throw Error("Key is not a number");
				if (!Number.isSafeInteger(src)) throw Error("Key is not a safe integer: " + src);
				return (0, Builder_1.beginCell)().storeInt(src, bits).endCell().beginParse().loadUintBig(bits);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadInt(bits);
			}
		};
	}
	function createBigUintKey(bits) {
		return {
			bits,
			serialize: (src) => {
				if (typeof src !== "bigint") throw Error("Key is not a bigint");
				if (src < 0) throw Error("Key is negative: " + src);
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
			}
		};
	}
	function createUintKey(bits) {
		return {
			bits,
			serialize: (src) => {
				if (typeof src !== "number") throw Error("Key is not a number");
				if (!Number.isSafeInteger(src)) throw Error("Key is not a safe integer: " + src);
				if (src < 0) throw Error("Key is negative: " + src);
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
			},
			parse: (src) => {
				return Number((0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUint(bits));
			}
		};
	}
	function createBufferKey(bytes) {
		return {
			bits: bytes * 8,
			serialize: (src) => {
				if (!Buffer.isBuffer(src)) throw Error("Key is not a buffer");
				return (0, Builder_1.beginCell)().storeBuffer(src).endCell().beginParse().loadUintBig(bytes * 8);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, bytes * 8).endCell().beginParse().loadBuffer(bytes);
			}
		};
	}
	function createBitStringKey(bits) {
		return {
			bits,
			serialize: (src) => {
				if (!BitString_1.BitString.isBitString(src)) throw Error("Key is not a BitString");
				return (0, Builder_1.beginCell)().storeBits(src).endCell().beginParse().loadUintBig(bits);
			},
			parse: (src) => {
				return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadBits(bits);
			}
		};
	}
	function createIntValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeInt(src, bits);
			},
			parse: (src) => {
				let value = src.loadInt(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createBigIntValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeInt(src, bits);
			},
			parse: (src) => {
				let value = src.loadIntBig(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createBigVarIntValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeVarInt(src, bits);
			},
			parse: (src) => {
				let value = src.loadVarIntBig(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createBigVarUintValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeVarUint(src, bits);
			},
			parse: (src) => {
				let value = src.loadVarUintBig(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createUintValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeUint(src, bits);
			},
			parse: (src) => {
				let value = src.loadUint(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createBigUintValue(bits) {
		return {
			serialize: (src, buidler) => {
				buidler.storeUint(src, bits);
			},
			parse: (src) => {
				let value = src.loadUintBig(bits);
				src.endParse();
				return value;
			}
		};
	}
	function createBooleanValue() {
		return {
			serialize: (src, buidler) => {
				buidler.storeBit(src);
			},
			parse: (src) => {
				let value = src.loadBit();
				src.endParse();
				return value;
			}
		};
	}
	function createAddressValue() {
		return {
			serialize: (src, buidler) => {
				buidler.storeAddress(src);
			},
			parse: (src) => {
				let addr = src.loadAddress();
				src.endParse();
				return addr;
			}
		};
	}
	function createCellValue() {
		return {
			serialize: (src, buidler) => {
				buidler.storeRef(src);
			},
			parse: (src) => {
				let value = src.loadRef();
				src.endParse();
				return value;
			}
		};
	}
	function createDictionaryValue(key, value) {
		return {
			serialize: (src, buidler) => {
				src.store(buidler);
			},
			parse: (src) => {
				let dict = Dictionary.load(key, value, src);
				src.endParse();
				return dict;
			}
		};
	}
	function createBufferValue(size) {
		return {
			serialize: (src, buidler) => {
				if (src.length !== size) throw Error("Invalid buffer size");
				buidler.storeBuffer(src);
			},
			parse: (src) => {
				let value = src.loadBuffer(size);
				src.endParse();
				return value;
			}
		};
	}
	function createBitStringValue(bits) {
		return {
			serialize: (src, builder) => {
				if (src.length !== bits) throw Error("Invalid BitString size");
				builder.storeBits(src);
			},
			parse: (src) => {
				let value = src.loadBits(bits);
				src.endParse();
				return value;
			}
		};
	}
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/utils/strings.js
var require_strings = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.writeString = exports.stringToCell = exports.readString = void 0;
	var Builder_1 = require_Builder();
	function readBuffer(slice) {
		if (slice.remainingBits % 8 !== 0) throw new Error(`Invalid string length: ${slice.remainingBits}`);
		if (slice.remainingRefs !== 0 && slice.remainingRefs !== 1) throw new Error(`invalid number of refs: ${slice.remainingRefs}`);
		let res;
		if (slice.remainingBits === 0) res = Buffer.alloc(0);
		else res = slice.loadBuffer(slice.remainingBits / 8);
		if (slice.remainingRefs === 1) res = Buffer.concat([res, readBuffer(slice.loadRef().beginParse())]);
		return res;
	}
	function readString(slice) {
		return readBuffer(slice).toString();
	}
	exports.readString = readString;
	function writeBuffer(src, builder) {
		if (src.length > 0) {
			let bytes = Math.floor(builder.availableBits / 8);
			if (src.length > bytes) {
				let a = src.subarray(0, bytes);
				let t = src.subarray(bytes);
				builder = builder.storeBuffer(a);
				let bb = (0, Builder_1.beginCell)();
				writeBuffer(t, bb);
				builder = builder.storeRef(bb.endCell());
			} else builder = builder.storeBuffer(src);
		}
	}
	function stringToCell(src) {
		let builder = (0, Builder_1.beginCell)();
		writeBuffer(Buffer.from(src), builder);
		return builder.endCell();
	}
	exports.stringToCell = stringToCell;
	function writeString(src, builder) {
		writeBuffer(Buffer.from(src), builder);
	}
	exports.writeString = writeString;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/Slice.js
var require_Slice = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Slice = void 0;
	var inspect_1 = require_inspect();
	var Dictionary_1 = require_Dictionary();
	var Builder_1 = require_Builder();
	var strings_1 = require_strings();
	exports.Slice = class Slice {
		constructor(reader, refs) {
			this[_a] = () => this.toString();
			this._reader = reader.clone();
			this._refs = [...refs];
			this._refsOffset = 0;
		}
		/**
		* Get remaining bits
		*/
		get remainingBits() {
			return this._reader.remaining;
		}
		/**
		* Get offset bits
		*/
		get offsetBits() {
			return this._reader.offset;
		}
		/**
		* Get remaining refs
		*/
		get remainingRefs() {
			return this._refs.length - this._refsOffset;
		}
		/**
		* Get offset refs
		*/
		get offsetRefs() {
			return this._refsOffset;
		}
		/**
		* Skip bits
		* @param bits
		*/
		skip(bits) {
			this._reader.skip(bits);
			return this;
		}
		/**
		* Load a single bit
		* @returns true or false depending on the bit value
		*/
		loadBit() {
			return this._reader.loadBit();
		}
		/**
		* Preload a signle bit
		* @returns true or false depending on the bit value
		*/
		preloadBit() {
			return this._reader.preloadBit();
		}
		/**
		* Load a boolean
		* @returns true or false depending on the bit value
		*/
		loadBoolean() {
			return this.loadBit();
		}
		/**
		* Load maybe boolean
		* @returns true or false depending on the bit value or null
		*/
		loadMaybeBoolean() {
			if (this.loadBit()) return this.loadBoolean();
			else return null;
		}
		/**
		* Load bits as a new BitString
		* @param bits number of bits to read
		* @returns new BitString
		*/
		loadBits(bits) {
			return this._reader.loadBits(bits);
		}
		/**
		* Preload bits as a new BitString
		* @param bits number of bits to read
		* @returns new BitString
		*/
		preloadBits(bits) {
			return this._reader.preloadBits(bits);
		}
		/**
		* Load uint
		* @param bits number of bits to read
		* @returns uint value
		*/
		loadUint(bits) {
			return this._reader.loadUint(bits);
		}
		/**
		* Load uint
		* @param bits number of bits to read
		* @returns uint value
		*/
		loadUintBig(bits) {
			return this._reader.loadUintBig(bits);
		}
		/**
		* Preload uint
		* @param bits number of bits to read
		* @returns uint value
		*/
		preloadUint(bits) {
			return this._reader.preloadUint(bits);
		}
		/**
		* Preload uint
		* @param bits number of bits to read
		* @returns uint value
		*/
		preloadUintBig(bits) {
			return this._reader.preloadUintBig(bits);
		}
		/**
		* Load maybe uint
		* @param bits number of bits to read
		* @returns uint value or null
		*/
		loadMaybeUint(bits) {
			if (this.loadBit()) return this.loadUint(bits);
			else return null;
		}
		/**
		* Load maybe uint
		* @param bits number of bits to read
		* @returns uint value or null
		*/
		loadMaybeUintBig(bits) {
			if (this.loadBit()) return this.loadUintBig(bits);
			else return null;
		}
		/**
		* Load int
		* @param bits number of bits to read
		* @returns int value
		*/
		loadInt(bits) {
			return this._reader.loadInt(bits);
		}
		/**
		* Load int
		* @param bits number of bits to read
		* @returns int value
		*/
		loadIntBig(bits) {
			return this._reader.loadIntBig(bits);
		}
		/**
		* Preload int
		* @param bits number of bits to read
		* @returns int value
		*/
		preloadInt(bits) {
			return this._reader.preloadInt(bits);
		}
		/**
		* Preload int
		* @param bits number of bits to read
		* @returns int value
		*/
		preloadIntBig(bits) {
			return this._reader.preloadIntBig(bits);
		}
		/**
		* Load maybe uint
		* @param bits number of bits to read
		* @returns uint value or null
		*/
		loadMaybeInt(bits) {
			if (this.loadBit()) return this.loadInt(bits);
			else return null;
		}
		/**
		* Load maybe uint
		* @param bits number of bits to read
		* @returns uint value or null
		*/
		loadMaybeIntBig(bits) {
			if (this.loadBit()) return this.loadIntBig(bits);
			else return null;
		}
		/**
		* Load varuint
		* @param bits number of bits to read in header
		* @returns varuint value
		*/
		loadVarUint(bits) {
			return this._reader.loadVarUint(bits);
		}
		/**
		* Load varuint
		* @param bits number of bits to read in header
		* @returns varuint value
		*/
		loadVarUintBig(bits) {
			return this._reader.loadVarUintBig(bits);
		}
		/**
		* Preload varuint
		* @param bits number of bits to read in header
		* @returns varuint value
		*/
		preloadVarUint(bits) {
			return this._reader.preloadVarUint(bits);
		}
		/**
		* Preload varuint
		* @param bits number of bits to read in header
		* @returns varuint value
		*/
		preloadVarUintBig(bits) {
			return this._reader.preloadVarUintBig(bits);
		}
		/**
		* Load varint
		* @param bits number of bits to read in header
		* @returns varint value
		*/
		loadVarInt(bits) {
			return this._reader.loadVarInt(bits);
		}
		/**
		* Load varint
		* @param bits number of bits to read in header
		* @returns varint value
		*/
		loadVarIntBig(bits) {
			return this._reader.loadVarIntBig(bits);
		}
		/**
		* Preload varint
		* @param bits number of bits to read in header
		* @returns varint value
		*/
		preloadVarInt(bits) {
			return this._reader.preloadVarInt(bits);
		}
		/**
		* Preload varint
		* @param bits number of bits to read in header
		* @returns varint value
		*/
		preloadVarIntBig(bits) {
			return this._reader.preloadVarIntBig(bits);
		}
		/**
		* Load coins
		* @returns coins value
		*/
		loadCoins() {
			return this._reader.loadCoins();
		}
		/**
		* Preload coins
		* @returns coins value
		*/
		preloadCoins() {
			return this._reader.preloadCoins();
		}
		/**
		* Load maybe coins
		* @returns coins value or null
		*/
		loadMaybeCoins() {
			if (this._reader.loadBit()) return this._reader.loadCoins();
			else return null;
		}
		/**
		* Load internal Address
		* @returns Address
		*/
		loadAddress() {
			return this._reader.loadAddress();
		}
		/**
		* Load optional internal Address
		* @returns Address or null
		*/
		loadMaybeAddress() {
			return this._reader.loadMaybeAddress();
		}
		/**
		* Load external address
		* @returns ExternalAddress
		*/
		loadExternalAddress() {
			return this._reader.loadExternalAddress();
		}
		/**
		* Load optional external address
		* @returns ExternalAddress or null
		*/
		loadMaybeExternalAddress() {
			return this._reader.loadMaybeExternalAddress();
		}
		/**
		* Load address
		* @returns Address, ExternalAddress or null
		*/
		loadAddressAny() {
			return this._reader.loadAddressAny();
		}
		/**
		* Load reference
		* @returns Cell
		*/
		loadRef() {
			if (this._refsOffset >= this._refs.length) throw new Error("No more references");
			return this._refs[this._refsOffset++];
		}
		/**
		* Preload reference
		* @returns Cell
		*/
		preloadRef() {
			if (this._refsOffset >= this._refs.length) throw new Error("No more references");
			return this._refs[this._refsOffset];
		}
		/**
		* Load optional reference
		* @returns Cell or null
		*/
		loadMaybeRef() {
			if (this.loadBit()) return this.loadRef();
			else return null;
		}
		/**
		* Preload optional reference
		* @returns Cell or null
		*/
		preloadMaybeRef() {
			if (this.preloadBit()) return this.preloadRef();
			else return null;
		}
		/**
		* Load byte buffer
		* @param bytes number of bytes to load
		* @returns Buffer
		*/
		loadBuffer(bytes) {
			return this._reader.loadBuffer(bytes);
		}
		/**
		* Load byte buffer
		* @param bytes number of bytes to load
		* @returns Buffer
		*/
		preloadBuffer(bytes) {
			return this._reader.preloadBuffer(bytes);
		}
		/**
		* Load string tail
		*/
		loadStringTail() {
			return (0, strings_1.readString)(this);
		}
		/**
		* Load maybe string tail
		* @returns string or null
		*/
		loadMaybeStringTail() {
			if (this.loadBit()) return (0, strings_1.readString)(this);
			else return null;
		}
		/**
		* Load string tail from ref
		* @returns string
		*/
		loadStringRefTail() {
			return (0, strings_1.readString)(this.loadRef().beginParse());
		}
		/**
		* Load maybe string tail from ref
		* @returns string or null
		*/
		loadMaybeStringRefTail() {
			const ref = this.loadMaybeRef();
			if (ref) return (0, strings_1.readString)(ref.beginParse());
			else return null;
		}
		/**
		* Loads dictionary
		* @param key key description
		* @param value value description
		* @returns Dictionary<K, V>
		*/
		loadDict(key, value) {
			return Dictionary_1.Dictionary.load(key, value, this);
		}
		/**
		* Loads dictionary directly from current slice
		* @param key key description
		* @param value value description
		* @returns Dictionary<K, V>
		*/
		loadDictDirect(key, value) {
			return Dictionary_1.Dictionary.loadDirect(key, value, this);
		}
		/**
		* Checks if slice is empty
		*/
		endParse() {
			if (this.remainingBits > 0 || this.remainingRefs > 0) throw new Error("Slice is not empty");
		}
		/**
		* Convert slice to cell
		*/
		asCell() {
			return (0, Builder_1.beginCell)().storeSlice(this).endCell();
		}
		/**
		*
		* @returns
		*/
		asBuilder() {
			return (0, Builder_1.beginCell)().storeSlice(this);
		}
		/**
		* Clone slice
		* @returns cloned slice
		*/
		clone(fromStart = false) {
			if (fromStart) {
				let reader = this._reader.clone();
				reader.reset();
				return new Slice(reader, this._refs);
			} else {
				let res = new Slice(this._reader, this._refs);
				res._refsOffset = this._refsOffset;
				return res;
			}
		}
		/**
		* Print slice as string by converting it to cell
		* @returns string
		*/
		toString() {
			return this.asCell().toString();
		}
	};
	_a = inspect_1.inspectSymbol;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/exoticLibrary.js
var require_exoticLibrary = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.exoticLibrary = void 0;
	var BitReader_1 = require_BitReader();
	function exoticLibrary(bits, refs) {
		const reader = new BitReader_1.BitReader(bits);
		if (bits.length !== 264) throw new Error(`Library cell must have exactly (8 + 256) bits, got "${bits.length}"`);
		let type = reader.loadUint(8);
		if (type !== 2) throw new Error(`Library cell must have type 2, got "${type}"`);
		return {};
	}
	exports.exoticLibrary = exoticLibrary;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/exoticMerkleUpdate.js
var require_exoticMerkleUpdate = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.exoticMerkleUpdate = void 0;
	var BitReader_1 = require_BitReader();
	function exoticMerkleUpdate(bits, refs) {
		const reader = new BitReader_1.BitReader(bits);
		if (bits.length !== 552) throw new Error(`Merkle Update cell must have exactly (8 + (2 * (256 + 16))) bits, got "${bits.length}"`);
		if (refs.length !== 2) throw new Error(`Merkle Update cell must have exactly 2 refs, got "${refs.length}"`);
		let type = reader.loadUint(8);
		if (type !== 4) throw new Error(`Merkle Update cell type must be exactly 4, got "${type}"`);
		const proofHash1 = reader.loadBuffer(32);
		const proofHash2 = reader.loadBuffer(32);
		const proofDepth1 = reader.loadUint(16);
		const proofDepth2 = reader.loadUint(16);
		if (proofDepth1 !== refs[0].depth(0)) throw new Error(`Merkle Update cell ref depth must be exactly "${proofDepth1}", got "${refs[0].depth(0)}"`);
		if (!proofHash1.equals(refs[0].hash(0))) throw new Error(`Merkle Update cell ref hash must be exactly "${proofHash1.toString("hex")}", got "${refs[0].hash(0).toString("hex")}"`);
		if (proofDepth2 !== refs[1].depth(0)) throw new Error(`Merkle Update cell ref depth must be exactly "${proofDepth2}", got "${refs[1].depth(0)}"`);
		if (!proofHash2.equals(refs[1].hash(0))) throw new Error(`Merkle Update cell ref hash must be exactly "${proofHash2.toString("hex")}", got "${refs[1].hash(0).toString("hex")}"`);
		return {
			proofDepth1,
			proofDepth2,
			proofHash1,
			proofHash2
		};
	}
	exports.exoticMerkleUpdate = exoticMerkleUpdate;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/LevelMask.js
var require_LevelMask = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LevelMask = void 0;
	exports.LevelMask = class LevelMask {
		constructor(mask = 0) {
			this._mask = 0;
			this._mask = mask;
			this._hashIndex = countSetBits(this._mask);
			this._hashCount = this._hashIndex + 1;
		}
		get value() {
			return this._mask;
		}
		get level() {
			return 32 - Math.clz32(this._mask);
		}
		get hashIndex() {
			return this._hashIndex;
		}
		get hashCount() {
			return this._hashCount;
		}
		apply(level) {
			return new LevelMask(this._mask & (1 << level) - 1);
		}
		isSignificant(level) {
			return level === 0 || (this._mask >> level - 1) % 2 !== 0;
		}
	};
	function countSetBits(n) {
		n = n - (n >> 1 & 1431655765);
		n = (n & 858993459) + (n >> 2 & 858993459);
		return (n + (n >> 4) & 252645135) * 16843009 >> 24;
	}
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/exoticPruned.js
var require_exoticPruned = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.exoticPruned = void 0;
	var BitReader_1 = require_BitReader();
	var LevelMask_1 = require_LevelMask();
	function exoticPruned(bits, refs) {
		let reader = new BitReader_1.BitReader(bits);
		let type = reader.loadUint(8);
		if (type !== 1) throw new Error(`Pruned branch cell must have type 1, got "${type}"`);
		if (refs.length !== 0) throw new Error(`Pruned Branch cell can't has refs, got "${refs.length}"`);
		let mask;
		if (bits.length === 280) mask = new LevelMask_1.LevelMask(1);
		else {
			mask = new LevelMask_1.LevelMask(reader.loadUint(8));
			if (mask.level < 1 || mask.level > 3) throw new Error(`Pruned Branch cell level must be >= 1 and <= 3, got "${mask.level}/${mask.value}"`);
			const size = 16 + mask.apply(mask.level - 1).hashCount * 272;
			if (bits.length !== size) throw new Error(`Pruned branch cell must have exactly ${size} bits, got "${bits.length}"`);
		}
		let pruned = [];
		let hashes = [];
		let depths = [];
		for (let i = 0; i < mask.level; i++) hashes.push(reader.loadBuffer(32));
		for (let i = 0; i < mask.level; i++) depths.push(reader.loadUint(16));
		for (let i = 0; i < mask.level; i++) pruned.push({
			depth: depths[i],
			hash: hashes[i]
		});
		return {
			mask: mask.value,
			pruned
		};
	}
	exports.exoticPruned = exoticPruned;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/resolveExotic.js
var require_resolveExotic = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.resolveExotic = void 0;
	var BitReader_1 = require_BitReader();
	var CellType_1 = require_CellType();
	var exoticLibrary_1 = require_exoticLibrary();
	var exoticMerkleProof_1 = require_exoticMerkleProof();
	var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
	var exoticPruned_1 = require_exoticPruned();
	var LevelMask_1 = require_LevelMask();
	function resolvePruned(bits, refs) {
		let pruned = (0, exoticPruned_1.exoticPruned)(bits, refs);
		let depths = [];
		let hashes = [];
		let mask = new LevelMask_1.LevelMask(pruned.mask);
		for (let i = 0; i < pruned.pruned.length; i++) {
			depths.push(pruned.pruned[i].depth);
			hashes.push(pruned.pruned[i].hash);
		}
		return {
			type: CellType_1.CellType.PrunedBranch,
			depths,
			hashes,
			mask
		};
	}
	function resolveLibrary(bits, refs) {
		(0, exoticLibrary_1.exoticLibrary)(bits, refs);
		let depths = [];
		let hashes = [];
		let mask = new LevelMask_1.LevelMask();
		return {
			type: CellType_1.CellType.Library,
			depths,
			hashes,
			mask
		};
	}
	function resolveMerkleProof(bits, refs) {
		(0, exoticMerkleProof_1.exoticMerkleProof)(bits, refs);
		let depths = [];
		let hashes = [];
		let mask = new LevelMask_1.LevelMask(refs[0].level() >> 1);
		return {
			type: CellType_1.CellType.MerkleProof,
			depths,
			hashes,
			mask
		};
	}
	function resolveMerkleUpdate(bits, refs) {
		(0, exoticMerkleUpdate_1.exoticMerkleUpdate)(bits, refs);
		let depths = [];
		let hashes = [];
		let mask = new LevelMask_1.LevelMask((refs[0].level() | refs[1].level()) >> 1);
		return {
			type: CellType_1.CellType.MerkleUpdate,
			depths,
			hashes,
			mask
		};
	}
	function resolveExotic(bits, refs) {
		let type = new BitReader_1.BitReader(bits).preloadUint(8);
		if (type === 1) return resolvePruned(bits, refs);
		if (type === 2) return resolveLibrary(bits, refs);
		if (type === 3) return resolveMerkleProof(bits, refs);
		if (type === 4) return resolveMerkleUpdate(bits, refs);
		throw Error("Invalid exotic cell type: " + type);
	}
	exports.resolveExotic = resolveExotic;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/descriptor.js
var require_descriptor = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getRepr = exports.getBitsDescriptor = exports.getRefsDescriptor = void 0;
	var CellType_1 = require_CellType();
	var paddedBits_1 = require_paddedBits();
	function getRefsDescriptor(refs, levelMask, type) {
		return refs.length + (type !== CellType_1.CellType.Ordinary ? 1 : 0) * 8 + levelMask * 32;
	}
	exports.getRefsDescriptor = getRefsDescriptor;
	function getBitsDescriptor(bits) {
		let len = bits.length;
		return Math.ceil(len / 8) + Math.floor(len / 8);
	}
	exports.getBitsDescriptor = getBitsDescriptor;
	function getRepr(originalBits, bits, refs, level, levelMask, type) {
		const bitsLen = Math.ceil(bits.length / 8);
		const repr = Buffer.alloc(2 + bitsLen + 34 * refs.length);
		let reprCursor = 0;
		repr[reprCursor++] = getRefsDescriptor(refs, levelMask, type);
		repr[reprCursor++] = getBitsDescriptor(originalBits);
		(0, paddedBits_1.bitsToPaddedBuffer)(bits).copy(repr, reprCursor);
		reprCursor += bitsLen;
		for (const c of refs) {
			let childDepth;
			if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) childDepth = c.depth(level + 1);
			else childDepth = c.depth(level);
			repr[reprCursor++] = Math.floor(childDepth / 256);
			repr[reprCursor++] = childDepth % 256;
		}
		for (const c of refs) {
			let childHash;
			if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) childHash = c.hash(level + 1);
			else childHash = c.hash(level);
			childHash.copy(repr, reprCursor);
			reprCursor += 32;
		}
		return repr;
	}
	exports.getRepr = getRepr;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/wonderCalculator.js
var require_wonderCalculator = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wonderCalculator = void 0;
	var BitString_1 = require_BitString();
	var CellType_1 = require_CellType();
	var LevelMask_1 = require_LevelMask();
	var exoticPruned_1 = require_exoticPruned();
	var exoticMerkleProof_1 = require_exoticMerkleProof();
	var descriptor_1 = require_descriptor();
	var crypto_1 = require_dist$2();
	var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
	var exoticLibrary_1 = require_exoticLibrary();
	function wonderCalculator(type, bits, refs) {
		let levelMask;
		let pruned = null;
		if (type === CellType_1.CellType.Ordinary) {
			let mask = 0;
			for (let r of refs) mask = mask | r.mask.value;
			levelMask = new LevelMask_1.LevelMask(mask);
		} else if (type === CellType_1.CellType.PrunedBranch) {
			pruned = (0, exoticPruned_1.exoticPruned)(bits, refs);
			levelMask = new LevelMask_1.LevelMask(pruned.mask);
		} else if (type === CellType_1.CellType.MerkleProof) {
			(0, exoticMerkleProof_1.exoticMerkleProof)(bits, refs);
			levelMask = new LevelMask_1.LevelMask(refs[0].mask.value >> 1);
		} else if (type === CellType_1.CellType.MerkleUpdate) {
			(0, exoticMerkleUpdate_1.exoticMerkleUpdate)(bits, refs);
			levelMask = new LevelMask_1.LevelMask((refs[0].mask.value | refs[1].mask.value) >> 1);
		} else if (type === CellType_1.CellType.Library) {
			(0, exoticLibrary_1.exoticLibrary)(bits, refs);
			levelMask = new LevelMask_1.LevelMask();
		} else throw new Error("Unsupported exotic type");
		let depths = [];
		let hashes = [];
		let hashCount = type === CellType_1.CellType.PrunedBranch ? 1 : levelMask.hashCount;
		let hashIOffset = levelMask.hashCount - hashCount;
		for (let levelI = 0, hashI = 0; levelI <= levelMask.level; levelI++) {
			if (!levelMask.isSignificant(levelI)) continue;
			if (hashI < hashIOffset) {
				hashI++;
				continue;
			}
			let currentBits;
			if (hashI === hashIOffset) {
				if (!(levelI === 0 || type === CellType_1.CellType.PrunedBranch)) throw Error("Invalid");
				currentBits = bits;
			} else {
				if (!(levelI !== 0 && type !== CellType_1.CellType.PrunedBranch)) throw Error("Invalid: " + levelI + ", " + type);
				currentBits = new BitString_1.BitString(hashes[hashI - hashIOffset - 1], 0, 256);
			}
			let currentDepth = 0;
			for (let c of refs) {
				let childDepth;
				if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) childDepth = c.depth(levelI + 1);
				else childDepth = c.depth(levelI);
				currentDepth = Math.max(currentDepth, childDepth);
			}
			if (refs.length > 0) currentDepth++;
			let repr = (0, descriptor_1.getRepr)(bits, currentBits, refs, levelI, levelMask.apply(levelI).value, type);
			let hash = (0, crypto_1.sha256_sync)(repr);
			let destI = hashI - hashIOffset;
			depths[destI] = currentDepth;
			hashes[destI] = hash;
			hashI++;
		}
		let resolvedHashes = [];
		let resolvedDepths = [];
		if (pruned) for (let i = 0; i < 4; i++) {
			const { hashIndex } = levelMask.apply(i);
			const { hashIndex: thisHashIndex } = levelMask;
			if (hashIndex !== thisHashIndex) {
				resolvedHashes.push(pruned.pruned[hashIndex].hash);
				resolvedDepths.push(pruned.pruned[hashIndex].depth);
			} else {
				resolvedHashes.push(hashes[0]);
				resolvedDepths.push(depths[0]);
			}
		}
		else for (let i = 0; i < 4; i++) {
			resolvedHashes.push(hashes[levelMask.apply(i).hashIndex]);
			resolvedDepths.push(depths[levelMask.apply(i).hashIndex]);
		}
		return {
			mask: levelMask,
			hashes: resolvedHashes,
			depths: resolvedDepths
		};
	}
	exports.wonderCalculator = wonderCalculator;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/utils/topologicalSort.js
var require_topologicalSort = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.topologicalSort = void 0;
	function topologicalSort(src) {
		let pending = [src];
		let allCells = /* @__PURE__ */ new Map();
		let notPermCells = /* @__PURE__ */ new Set();
		let sorted = [];
		while (pending.length > 0) {
			const cells = [...pending];
			pending = [];
			for (let cell of cells) {
				const hash = cell.hash().toString("hex");
				if (allCells.has(hash)) continue;
				notPermCells.add(hash);
				allCells.set(hash, {
					cell,
					refs: cell.refs.map((v) => v.hash().toString("hex"))
				});
				for (let r of cell.refs) pending.push(r);
			}
		}
		let tempMark = /* @__PURE__ */ new Set();
		function visit(hash) {
			if (!notPermCells.has(hash)) return;
			if (tempMark.has(hash)) throw Error("Not a DAG");
			tempMark.add(hash);
			let refs = allCells.get(hash).refs;
			for (let ci = refs.length - 1; ci >= 0; ci--) visit(refs[ci]);
			sorted.push(hash);
			tempMark.delete(hash);
			notPermCells.delete(hash);
		}
		while (notPermCells.size > 0) {
			const id = Array.from(notPermCells)[0];
			visit(id);
		}
		let indexes = /* @__PURE__ */ new Map();
		for (let i = 0; i < sorted.length; i++) indexes.set(sorted[sorted.length - i - 1], i);
		let result = [];
		for (let i = sorted.length - 1; i >= 0; i--) {
			let ent = sorted[i];
			const rrr = allCells.get(ent);
			result.push({
				cell: rrr.cell,
				refs: rrr.refs.map((v) => indexes.get(v))
			});
		}
		return result;
	}
	exports.topologicalSort = topologicalSort;
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/bitsForNumber.js
var require_bitsForNumber = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bitsForNumber = void 0;
	function bitsForNumber(src, mode) {
		let v = BigInt(src);
		if (mode === "int") {
			if (v === 0n || v === -1n) return 1;
			return (v > 0 ? v : -v).toString(2).length + 1;
		} else if (mode === "uint") {
			if (v < 0) throw Error(`value is negative. Got ${src}`);
			return v.toString(2).length;
		} else throw Error(`invalid mode. Got ${mode}`);
	}
	exports.bitsForNumber = bitsForNumber;
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/crc32c.js
var require_crc32c = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crc32c = void 0;
	var POLY = 2197175160;
	function crc32c(source) {
		let crc = -1;
		for (let n = 0; n < source.length; n++) {
			crc ^= source[n];
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
			crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
		}
		crc = crc ^ 4294967295;
		let res = Buffer.alloc(4);
		res.writeInt32LE(crc);
		return res;
	}
	exports.crc32c = crc32c;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/cell/serialization.js
var require_serialization = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.serializeBoc = exports.deserializeBoc = exports.parseBoc = void 0;
	var BitReader_1 = require_BitReader();
	var BitString_1 = require_BitString();
	var Cell_1 = require_Cell();
	var topologicalSort_1 = require_topologicalSort();
	var bitsForNumber_1 = require_bitsForNumber();
	var BitBuilder_1 = require_BitBuilder();
	var descriptor_1 = require_descriptor();
	var paddedBits_1 = require_paddedBits();
	var crc32c_1 = require_crc32c();
	function getHashesCount(levelMask) {
		return getHashesCountFromMask(levelMask & 7);
	}
	function getHashesCountFromMask(mask) {
		let n = 0;
		for (let i = 0; i < 3; i++) {
			n += mask & 1;
			mask = mask >> 1;
		}
		return n + 1;
	}
	function readCell(reader, sizeBytes) {
		const d1 = reader.loadUint(8);
		const refsCount = d1 % 8;
		const exotic = !!(d1 & 8);
		const d2 = reader.loadUint(8);
		const dataBytesize = Math.ceil(d2 / 2);
		const paddingAdded = !!(d2 % 2);
		const levelMask = d1 >> 5;
		const hasHashes = (d1 & 16) != 0;
		const hashesSize = hasHashes ? getHashesCount(levelMask) * 32 : 0;
		const depthSize = hasHashes ? getHashesCount(levelMask) * 2 : 0;
		reader.skip(hashesSize * 8);
		reader.skip(depthSize * 8);
		let bits = BitString_1.BitString.EMPTY;
		if (dataBytesize > 0) if (paddingAdded) bits = reader.loadPaddedBits(dataBytesize * 8);
		else bits = reader.loadBits(dataBytesize * 8);
		let refs = [];
		for (let i = 0; i < refsCount; i++) refs.push(reader.loadUint(sizeBytes * 8));
		return {
			bits,
			refs,
			exotic
		};
	}
	function calcCellSize(cell, sizeBytes) {
		return 2 + Math.ceil(cell.bits.length / 8) + cell.refs.length * sizeBytes;
	}
	function parseBoc(src) {
		let reader = new BitReader_1.BitReader(new BitString_1.BitString(src, 0, src.length * 8));
		let magic = reader.loadUint(32);
		if (magic === 1761568243) {
			let size = reader.loadUint(8);
			let offBytes = reader.loadUint(8);
			let cells = reader.loadUint(size * 8);
			let roots = reader.loadUint(size * 8);
			let absent = reader.loadUint(size * 8);
			let totalCellSize = reader.loadUint(offBytes * 8);
			return {
				size,
				offBytes,
				cells,
				roots,
				absent,
				totalCellSize,
				index: reader.loadBuffer(cells * offBytes),
				cellData: reader.loadBuffer(totalCellSize),
				root: [0]
			};
		} else if (magic === 2898503464) {
			let size = reader.loadUint(8);
			let offBytes = reader.loadUint(8);
			let cells = reader.loadUint(size * 8);
			let roots = reader.loadUint(size * 8);
			let absent = reader.loadUint(size * 8);
			let totalCellSize = reader.loadUint(offBytes * 8);
			let index = reader.loadBuffer(cells * offBytes);
			let cellData = reader.loadBuffer(totalCellSize);
			let crc32 = reader.loadBuffer(4);
			if (!(0, crc32c_1.crc32c)(src.subarray(0, src.length - 4)).equals(crc32)) throw Error("Invalid CRC32C");
			return {
				size,
				offBytes,
				cells,
				roots,
				absent,
				totalCellSize,
				index,
				cellData,
				root: [0]
			};
		} else if (magic === 3052313714) {
			let hasIdx = reader.loadUint(1);
			let hasCrc32c = reader.loadUint(1);
			reader.loadUint(1);
			reader.loadUint(2);
			let size = reader.loadUint(3);
			let offBytes = reader.loadUint(8);
			let cells = reader.loadUint(size * 8);
			let roots = reader.loadUint(size * 8);
			let absent = reader.loadUint(size * 8);
			let totalCellSize = reader.loadUint(offBytes * 8);
			let root = [];
			for (let i = 0; i < roots; i++) root.push(reader.loadUint(size * 8));
			let index = null;
			if (hasIdx) index = reader.loadBuffer(cells * offBytes);
			let cellData = reader.loadBuffer(totalCellSize);
			if (hasCrc32c) {
				let crc32 = reader.loadBuffer(4);
				if (!(0, crc32c_1.crc32c)(src.subarray(0, src.length - 4)).equals(crc32)) throw Error("Invalid CRC32C");
			}
			return {
				size,
				offBytes,
				cells,
				roots,
				absent,
				totalCellSize,
				index,
				cellData,
				root
			};
		} else throw Error("Invalid magic");
	}
	exports.parseBoc = parseBoc;
	function deserializeBoc(src) {
		let boc = parseBoc(src);
		let reader = new BitReader_1.BitReader(new BitString_1.BitString(boc.cellData, 0, boc.cellData.length * 8));
		let cells = [];
		for (let i = 0; i < boc.cells; i++) {
			let cll = readCell(reader, boc.size);
			cells.push({
				...cll,
				result: null
			});
		}
		for (let i = cells.length - 1; i >= 0; i--) {
			if (cells[i].result) throw Error("Impossible");
			let refs = [];
			for (let r of cells[i].refs) {
				if (!cells[r].result) throw Error("Invalid BOC file");
				refs.push(cells[r].result);
			}
			cells[i].result = new Cell_1.Cell({
				bits: cells[i].bits,
				refs,
				exotic: cells[i].exotic
			});
		}
		let roots = [];
		for (let i = 0; i < boc.root.length; i++) roots.push(cells[boc.root[i]].result);
		return roots;
	}
	exports.deserializeBoc = deserializeBoc;
	function writeCellToBuilder(cell, refs, sizeBytes, to) {
		let d1 = (0, descriptor_1.getRefsDescriptor)(cell.refs, cell.mask.value, cell.type);
		let d2 = (0, descriptor_1.getBitsDescriptor)(cell.bits);
		to.writeUint(d1, 8);
		to.writeUint(d2, 8);
		to.writeBuffer((0, paddedBits_1.bitsToPaddedBuffer)(cell.bits));
		for (let r of refs) to.writeUint(r, sizeBytes * 8);
	}
	function serializeBoc(root, opts) {
		let allCells = (0, topologicalSort_1.topologicalSort)(root);
		let cellsNum = allCells.length;
		let has_idx = opts.idx;
		let has_crc32c = opts.crc32;
		let has_cache_bits = false;
		let flags = 0;
		let sizeBytes = Math.max(Math.ceil((0, bitsForNumber_1.bitsForNumber)(cellsNum, "uint") / 8), 1);
		let totalCellSize = 0;
		let index = [];
		for (let c of allCells) {
			let sz = calcCellSize(c.cell, sizeBytes);
			totalCellSize += sz;
			index.push(totalCellSize);
		}
		let offsetBytes = Math.max(Math.ceil((0, bitsForNumber_1.bitsForNumber)(totalCellSize, "uint") / 8), 1);
		let totalSize = (6 + 3 * sizeBytes + offsetBytes + 1 * sizeBytes + (has_idx ? cellsNum * offsetBytes : 0) + totalCellSize + (has_crc32c ? 4 : 0)) * 8;
		let builder = new BitBuilder_1.BitBuilder(totalSize);
		builder.writeUint(3052313714, 32);
		builder.writeBit(has_idx);
		builder.writeBit(has_crc32c);
		builder.writeBit(has_cache_bits);
		builder.writeUint(flags, 2);
		builder.writeUint(sizeBytes, 3);
		builder.writeUint(offsetBytes, 8);
		builder.writeUint(cellsNum, sizeBytes * 8);
		builder.writeUint(1, sizeBytes * 8);
		builder.writeUint(0, sizeBytes * 8);
		builder.writeUint(totalCellSize, offsetBytes * 8);
		builder.writeUint(0, sizeBytes * 8);
		if (has_idx) for (let i = 0; i < cellsNum; i++) builder.writeUint(index[i], offsetBytes * 8);
		for (let i = 0; i < cellsNum; i++) writeCellToBuilder(allCells[i].cell, allCells[i].refs, sizeBytes, builder);
		if (has_crc32c) {
			let crc32 = (0, crc32c_1.crc32c)(builder.buffer());
			builder.writeBuffer(crc32);
		}
		let res = builder.buffer();
		if (res.length !== totalSize / 8) throw Error("Internal error");
		return res;
	}
	exports.serializeBoc = serializeBoc;
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/Cell.js
var require_Cell = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Cell = void 0;
	var inspect_1 = require_inspect();
	var BitString_1 = require_BitString();
	var CellType_1 = require_CellType();
	var Slice_1 = require_Slice();
	var resolveExotic_1 = require_resolveExotic();
	var wonderCalculator_1 = require_wonderCalculator();
	var serialization_1 = require_serialization();
	var BitReader_1 = require_BitReader();
	var Builder_1 = require_Builder();
	/**
	* Cell as described in TVM spec
	*/
	var Cell = class Cell {
		/**
		* Deserialize cells from BOC
		* @param src source buffer
		* @returns array of cells
		*/
		static fromBoc(src) {
			return (0, serialization_1.deserializeBoc)(src);
		}
		/**
		* Helper function that deserializes a single cell from BOC in base64
		* @param src source string
		*/
		static fromBase64(src) {
			let parsed = Cell.fromBoc(Buffer.from(src, "base64"));
			if (parsed.length !== 1) throw new Error("Deserialized more than one cell");
			return parsed[0];
		}
		/**
		* Helper function that deserializes a single cell from BOC in hex
		* @param src source string
		*/
		static fromHex(src) {
			let parsed = Cell.fromBoc(Buffer.from(src, "hex"));
			if (parsed.length !== 1) throw new Error("Deserialized more than one cell");
			return parsed[0];
		}
		constructor(opts) {
			this._hashes = [];
			this._depths = [];
			/**
			* Beging cell parsing
			* @returns a new slice
			*/
			this.beginParse = (allowExotic = false) => {
				if (this.isExotic && !allowExotic) throw new Error("Exotic cells cannot be parsed");
				return new Slice_1.Slice(new BitReader_1.BitReader(this.bits), this.refs);
			};
			/**
			* Get cell hash
			* @param level level
			* @returns cell hash
			*/
			this.hash = (level = 3) => {
				return this._hashes[Math.min(this._hashes.length - 1, level)];
			};
			/**
			* Get cell depth
			* @param level level
			* @returns cell depth
			*/
			this.depth = (level = 3) => {
				return this._depths[Math.min(this._depths.length - 1, level)];
			};
			/**
			* Get cell level
			* @returns cell level
			*/
			this.level = () => {
				return this.mask.level;
			};
			/**
			* Checks cell to be equal to another cell
			* @param other other cell
			* @returns true if cells are equal
			*/
			this.equals = (other) => {
				return this.hash().equals(other.hash());
			};
			this[_a] = () => this.toString();
			let bits = BitString_1.BitString.EMPTY;
			if (opts && opts.bits) bits = opts.bits;
			let refs = [];
			if (opts && opts.refs) refs = [...opts.refs];
			let hashes;
			let depths;
			let mask;
			let type = CellType_1.CellType.Ordinary;
			if (opts && opts.exotic) {
				let resolved = (0, resolveExotic_1.resolveExotic)(bits, refs);
				let wonders = (0, wonderCalculator_1.wonderCalculator)(resolved.type, bits, refs);
				mask = wonders.mask;
				depths = wonders.depths;
				hashes = wonders.hashes;
				type = resolved.type;
			} else {
				if (refs.length > 4) throw new Error("Invalid number of references");
				if (bits.length > 1023) throw new Error(`Bits overflow: ${bits.length} > 1023`);
				let wonders = (0, wonderCalculator_1.wonderCalculator)(CellType_1.CellType.Ordinary, bits, refs);
				mask = wonders.mask;
				depths = wonders.depths;
				hashes = wonders.hashes;
				type = CellType_1.CellType.Ordinary;
			}
			this.type = type;
			this.bits = bits;
			this.refs = refs;
			this.mask = mask;
			this._depths = depths;
			this._hashes = hashes;
			Object.freeze(this);
			Object.freeze(this.refs);
			Object.freeze(this.bits);
			Object.freeze(this.mask);
			Object.freeze(this._depths);
			Object.freeze(this._hashes);
		}
		/**
		* Check if cell is exotic
		*/
		get isExotic() {
			return this.type !== CellType_1.CellType.Ordinary;
		}
		/**
		* Serializes cell to BOC
		* @param opts options
		*/
		toBoc(opts) {
			let idx = opts && opts.idx !== null && opts.idx !== void 0 ? opts.idx : false;
			let crc32 = opts && opts.crc32 !== null && opts.crc32 !== void 0 ? opts.crc32 : true;
			return (0, serialization_1.serializeBoc)(this, {
				idx,
				crc32
			});
		}
		/**
		* Format cell to string
		* @param indent indentation
		* @returns string representation
		*/
		toString(indent) {
			let id = indent || "";
			let t = "x";
			if (this.isExotic) {
				if (this.type === CellType_1.CellType.MerkleProof) t = "p";
				else if (this.type === CellType_1.CellType.MerkleUpdate) t = "u";
				else if (this.type === CellType_1.CellType.PrunedBranch) t = "p";
			}
			let s = id + (this.isExotic ? t : "x") + "{" + this.bits.toString() + "}";
			for (let k in this.refs) {
				const i = this.refs[k];
				s += "\n" + i.toString(id + " ");
			}
			return s;
		}
		/**
		* Covnert cell to slice
		* @returns slice
		*/
		asSlice() {
			return this.beginParse();
		}
		/**
		* Convert cell to a builder that has this cell stored
		* @returns builder
		*/
		asBuilder() {
			return (0, Builder_1.beginCell)().storeSlice(this.asSlice());
		}
	};
	exports.Cell = Cell;
	_a = inspect_1.inspectSymbol;
	Cell.EMPTY = new Cell();
}));
//#endregion
//#region node_modules/@ton/core/dist/boc/Builder.js
var require_Builder = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Builder = exports.beginCell = void 0;
	var BitBuilder_1 = require_BitBuilder();
	var Cell_1 = require_Cell();
	var strings_1 = require_strings();
	/**
	* Start building a cell
	* @returns a new builder
	*/
	function beginCell() {
		return new Builder();
	}
	exports.beginCell = beginCell;
	/**
	* Builder for Cells
	*/
	var Builder = class Builder {
		constructor() {
			this._bits = new BitBuilder_1.BitBuilder();
			this._refs = [];
		}
		/**
		* Bits written so far
		*/
		get bits() {
			return this._bits.length;
		}
		/**
		* References written so far
		*/
		get refs() {
			return this._refs.length;
		}
		/**
		* Available bits
		*/
		get availableBits() {
			return 1023 - this.bits;
		}
		/**
		* Available references
		*/
		get availableRefs() {
			return 4 - this.refs;
		}
		/**
		* Write a single bit
		* @param value bit to write, true or positive number for 1, false or zero or negative for 0
		* @returns this builder
		*/
		storeBit(value) {
			this._bits.writeBit(value);
			return this;
		}
		/**
		* Write bits from BitString
		* @param src source bits
		* @returns this builder
		*/
		storeBits(src) {
			this._bits.writeBits(src);
			return this;
		}
		/**
		* Store Buffer
		* @param src source buffer
		* @param bytes optional number of bytes to write
		* @returns this builder
		*/
		storeBuffer(src, bytes) {
			if (bytes !== void 0 && bytes !== null) {
				if (src.length !== bytes) throw Error(`Buffer length ${src.length} is not equal to ${bytes}`);
			}
			this._bits.writeBuffer(src);
			return this;
		}
		/**
		* Store Maybe Buffer
		* @param src source buffer or null
		* @param bytes optional number of bytes to write
		* @returns this builder
		*/
		storeMaybeBuffer(src, bytes) {
			if (src !== null) {
				this.storeBit(1);
				this.storeBuffer(src, bytes);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store uint value
		* @param value value as bigint or number
		* @param bits number of bits to write
		* @returns this builder
		*/
		storeUint(value, bits) {
			this._bits.writeUint(value, bits);
			return this;
		}
		/**
		* Store maybe uint value
		* @param value value as bigint or number, null or undefined
		* @param bits number of bits to write
		* @returns this builder
		*/
		storeMaybeUint(value, bits) {
			if (value !== null && value !== void 0) {
				this.storeBit(1);
				this.storeUint(value, bits);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store int value
		* @param value value as bigint or number
		* @param bits number of bits to write
		* @returns this builder
		*/
		storeInt(value, bits) {
			this._bits.writeInt(value, bits);
			return this;
		}
		/**
		* Store maybe int value
		* @param value value as bigint or number, null or undefined
		* @param bits number of bits to write
		* @returns this builder
		*/
		storeMaybeInt(value, bits) {
			if (value !== null && value !== void 0) {
				this.storeBit(1);
				this.storeInt(value, bits);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store varuint value
		* @param value value as bigint or number
		* @param bits number of bits to write to header
		* @returns this builder
		*/
		storeVarUint(value, bits) {
			this._bits.writeVarUint(value, bits);
			return this;
		}
		/**
		* Store maybe varuint value
		* @param value value as bigint or number, null or undefined
		* @param bits number of bits to write to header
		* @returns this builder
		*/
		storeMaybeVarUint(value, bits) {
			if (value !== null && value !== void 0) {
				this.storeBit(1);
				this.storeVarUint(value, bits);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store varint value
		* @param value value as bigint or number
		* @param bits number of bits to write to header
		* @returns this builder
		*/
		storeVarInt(value, bits) {
			this._bits.writeVarInt(value, bits);
			return this;
		}
		/**
		* Store maybe varint value
		* @param value value as bigint or number, null or undefined
		* @param bits number of bits to write to header
		* @returns this builder
		*/
		storeMaybeVarInt(value, bits) {
			if (value !== null && value !== void 0) {
				this.storeBit(1);
				this.storeVarInt(value, bits);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store coins value
		* @param amount amount of coins
		* @returns this builder
		*/
		storeCoins(amount) {
			this._bits.writeCoins(amount);
			return this;
		}
		/**
		* Store maybe coins value
		* @param amount amount of coins, null or undefined
		* @returns this builder
		*/
		storeMaybeCoins(amount) {
			if (amount !== null && amount !== void 0) {
				this.storeBit(1);
				this.storeCoins(amount);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store address
		* @param address address to store
		* @returns this builder
		*/
		storeAddress(address) {
			this._bits.writeAddress(address);
			return this;
		}
		/**
		* Store reference
		* @param cell cell or builder to store
		* @returns this builder
		*/
		storeRef(cell) {
			if (this._refs.length >= 4) throw new Error("Too many references");
			if (cell instanceof Cell_1.Cell) this._refs.push(cell);
			else if (cell instanceof Builder) this._refs.push(cell.endCell());
			else throw new Error("Invalid argument");
			return this;
		}
		/**
		* Store reference if not null
		* @param cell cell or builder to store
		* @returns this builder
		*/
		storeMaybeRef(cell) {
			if (cell) {
				this.storeBit(1);
				this.storeRef(cell);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store slice it in this builder
		* @param src source slice
		*/
		storeSlice(src) {
			let c = src.clone();
			if (c.remainingBits > 0) this.storeBits(c.loadBits(c.remainingBits));
			while (c.remainingRefs > 0) this.storeRef(c.loadRef());
			return this;
		}
		/**
		* Store slice in this builder if not null
		* @param src source slice
		*/
		storeMaybeSlice(src) {
			if (src) {
				this.storeBit(1);
				this.storeSlice(src);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store builder
		* @param src builder to store
		* @returns this builder
		*/
		storeBuilder(src) {
			return this.storeSlice(src.endCell().beginParse());
		}
		/**
		* Store builder if not null
		* @param src builder to store
		* @returns this builder
		*/
		storeMaybeBuilder(src) {
			if (src) {
				this.storeBit(1);
				this.storeBuilder(src);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store writer or builder
		* @param writer writer or builder to store
		* @returns this builder
		*/
		storeWritable(writer) {
			if (typeof writer === "object") writer.writeTo(this);
			else writer(this);
			return this;
		}
		/**
		* Store writer or builder if not null
		* @param writer writer or builder to store
		* @returns this builder
		*/
		storeMaybeWritable(writer) {
			if (writer) {
				this.storeBit(1);
				this.storeWritable(writer);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store object in this builder
		* @param writer Writable or writer functuin
		*/
		store(writer) {
			this.storeWritable(writer);
			return this;
		}
		/**
		* Store string tail
		* @param src source string
		* @returns this builder
		*/
		storeStringTail(src) {
			(0, strings_1.writeString)(src, this);
			return this;
		}
		/**
		* Store string tail
		* @param src source string
		* @returns this builder
		*/
		storeMaybeStringTail(src) {
			if (src !== null && src !== void 0) {
				this.storeBit(1);
				(0, strings_1.writeString)(src, this);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store string tail in ref
		* @param src source string
		* @returns this builder
		*/
		storeStringRefTail(src) {
			this.storeRef(beginCell().storeStringTail(src));
			return this;
		}
		/**
		* Store maybe string tail in ref
		* @param src source string
		* @returns this builder
		*/
		storeMaybeStringRefTail(src) {
			if (src !== null && src !== void 0) {
				this.storeBit(1);
				this.storeStringRefTail(src);
			} else this.storeBit(0);
			return this;
		}
		/**
		* Store dictionary in this builder
		* @param dict dictionary to store
		* @param key key description
		* @param value value description
		* @returns this builder
		*/
		storeDict(dict, key, value) {
			if (dict) dict.store(this, key, value);
			else this.storeBit(0);
			return this;
		}
		/**
		* Store dictionary in this builder directly
		* @param dict dictionary to store
		* @param key key description
		* @param value value description
		* @returns this builder
		*/
		storeDictDirect(dict, key, value) {
			dict.storeDirect(this, key, value);
			return this;
		}
		/**
		* Complete cell
		* @param opts options
		* @returns cell
		*/
		endCell(opts) {
			return new Cell_1.Cell({
				bits: this._bits.build(),
				refs: this._refs,
				exotic: opts?.exotic
			});
		}
		/**
		* Convert to cell
		* @returns cell
		*/
		asCell() {
			return this.endCell();
		}
		/**
		* Convert to slice
		* @returns slice
		*/
		asSlice() {
			return this.endCell().beginParse();
		}
	};
	exports.Builder = Builder;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/SimpleLibrary.js
var require_SimpleLibrary = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SimpleLibraryValue = exports.storeSimpleLibrary = exports.loadSimpleLibrary = void 0;
	function loadSimpleLibrary(slice) {
		return {
			public: slice.loadBit(),
			root: slice.loadRef()
		};
	}
	exports.loadSimpleLibrary = loadSimpleLibrary;
	function storeSimpleLibrary(src) {
		return (builder) => {
			builder.storeBit(src.public);
			builder.storeRef(src.root);
		};
	}
	exports.storeSimpleLibrary = storeSimpleLibrary;
	exports.SimpleLibraryValue = {
		serialize(src, builder) {
			storeSimpleLibrary(src)(builder);
		},
		parse(src) {
			return loadSimpleLibrary(src);
		}
	};
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TickTock.js
var require_TickTock = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTickTock = exports.loadTickTock = void 0;
	function loadTickTock(slice) {
		return {
			tick: slice.loadBit(),
			tock: slice.loadBit()
		};
	}
	exports.loadTickTock = loadTickTock;
	function storeTickTock(src) {
		return (builder) => {
			builder.storeBit(src.tick);
			builder.storeBit(src.tock);
		};
	}
	exports.storeTickTock = storeTickTock;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/StateInit.js
var require_StateInit = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeStateInit = exports.loadStateInit = void 0;
	var Dictionary_1 = require_Dictionary();
	var SimpleLibrary_1 = require_SimpleLibrary();
	var TickTock_1 = require_TickTock();
	function loadStateInit(slice) {
		let splitDepth;
		if (slice.loadBit()) splitDepth = slice.loadUint(5);
		let special;
		if (slice.loadBit()) special = (0, TickTock_1.loadTickTock)(slice);
		let code = slice.loadMaybeRef();
		let data = slice.loadMaybeRef();
		let libraries = slice.loadDict(Dictionary_1.Dictionary.Keys.BigUint(256), SimpleLibrary_1.SimpleLibraryValue);
		if (libraries.size === 0) libraries = void 0;
		return {
			splitDepth,
			special,
			code,
			data,
			libraries
		};
	}
	exports.loadStateInit = loadStateInit;
	function storeStateInit(src) {
		return (builder) => {
			if (src.splitDepth !== null && src.splitDepth !== void 0) {
				builder.storeBit(true);
				builder.storeUint(src.splitDepth, 5);
			} else builder.storeBit(false);
			if (src.special !== null && src.special !== void 0) {
				builder.storeBit(true);
				builder.store((0, TickTock_1.storeTickTock)(src.special));
			} else builder.storeBit(false);
			builder.storeMaybeRef(src.code);
			builder.storeMaybeRef(src.data);
			builder.storeDict(src.libraries);
		};
	}
	exports.storeStateInit = storeStateInit;
}));
//#endregion
//#region node_modules/@ton/core/dist/address/contractAddress.js
var require_contractAddress = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.contractAddress = void 0;
	var Builder_1 = require_Builder();
	var StateInit_1 = require_StateInit();
	var Address_1 = require_Address();
	function contractAddress(workchain, init) {
		let hash = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(init)).endCell().hash();
		return new Address_1.Address(workchain, hash);
	}
	exports.contractAddress = contractAddress;
}));
//#endregion
//#region node_modules/@ton/core/dist/tuple/tuple.js
var require_tuple = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseTuple = exports.serializeTuple = exports.parseTupleItem = exports.serializeTupleItem = void 0;
	var Builder_1 = require_Builder();
	var INT64_MIN = BigInt("-9223372036854775808");
	var INT64_MAX = BigInt("9223372036854775807");
	function serializeTupleItem(src, builder) {
		if (src.type === "null") builder.storeUint(0, 8);
		else if (src.type === "int") if (src.value <= INT64_MAX && src.value >= INT64_MIN) {
			builder.storeUint(1, 8);
			builder.storeInt(src.value, 64);
		} else {
			builder.storeUint(256, 15);
			builder.storeInt(src.value, 257);
		}
		else if (src.type === "nan") builder.storeInt(767, 16);
		else if (src.type === "cell") {
			builder.storeUint(3, 8);
			builder.storeRef(src.cell);
		} else if (src.type === "slice") {
			builder.storeUint(4, 8);
			builder.storeUint(0, 10);
			builder.storeUint(src.cell.bits.length, 10);
			builder.storeUint(0, 3);
			builder.storeUint(src.cell.refs.length, 3);
			builder.storeRef(src.cell);
		} else if (src.type === "builder") {
			builder.storeUint(5, 8);
			builder.storeRef(src.cell);
		} else if (src.type === "tuple") {
			let head = null;
			let tail = null;
			for (let i = 0; i < src.items.length; i++) {
				let s = head;
				head = tail;
				tail = s;
				if (i > 1) head = (0, Builder_1.beginCell)().storeRef(tail).storeRef(head).endCell();
				let bc = (0, Builder_1.beginCell)();
				serializeTupleItem(src.items[i], bc);
				tail = bc.endCell();
			}
			builder.storeUint(7, 8);
			builder.storeUint(src.items.length, 16);
			if (head) builder.storeRef(head);
			if (tail) builder.storeRef(tail);
		} else throw Error("Invalid value");
	}
	exports.serializeTupleItem = serializeTupleItem;
	function parseTupleItem(cs) {
		let kind = cs.loadUint(8);
		if (kind === 0) return { type: "null" };
		else if (kind === 1) return {
			type: "int",
			value: cs.loadIntBig(64)
		};
		else if (kind === 2) if (cs.loadUint(7) === 0) return {
			type: "int",
			value: cs.loadIntBig(257)
		};
		else {
			cs.loadBit();
			return { type: "nan" };
		}
		else if (kind === 3) return {
			type: "cell",
			cell: cs.loadRef()
		};
		else if (kind === 4) {
			let startBits = cs.loadUint(10);
			let endBits = cs.loadUint(10);
			let startRefs = cs.loadUint(3);
			let endRefs = cs.loadUint(3);
			let rs = cs.loadRef().beginParse();
			rs.skip(startBits);
			let dt = rs.loadBits(endBits - startBits);
			let builder = (0, Builder_1.beginCell)().storeBits(dt);
			if (startRefs < endRefs) {
				for (let i = 0; i < startRefs; i++) rs.loadRef();
				for (let i = 0; i < endRefs - startRefs; i++) builder.storeRef(rs.loadRef());
			}
			return {
				type: "slice",
				cell: builder.endCell()
			};
		} else if (kind === 5) return {
			type: "builder",
			cell: cs.loadRef()
		};
		else if (kind === 7) {
			let length = cs.loadUint(16);
			let items = [];
			if (length > 1) {
				let head = cs.loadRef().beginParse();
				let tail = cs.loadRef().beginParse();
				items.unshift(parseTupleItem(tail));
				for (let i = 0; i < length - 2; i++) {
					let ohead = head;
					head = ohead.loadRef().beginParse();
					tail = ohead.loadRef().beginParse();
					items.unshift(parseTupleItem(tail));
				}
				items.unshift(parseTupleItem(head));
			} else if (length === 1) items.push(parseTupleItem(cs.loadRef().beginParse()));
			return {
				type: "tuple",
				items
			};
		} else throw Error("Unsupported stack item");
	}
	exports.parseTupleItem = parseTupleItem;
	function serializeTupleTail(src, builder) {
		if (src.length > 0) {
			let tail = (0, Builder_1.beginCell)();
			serializeTupleTail(src.slice(0, src.length - 1), tail);
			builder.storeRef(tail.endCell());
			serializeTupleItem(src[src.length - 1], builder);
		}
	}
	function serializeTuple(src) {
		let builder = (0, Builder_1.beginCell)();
		builder.storeUint(src.length, 24);
		serializeTupleTail([...src], builder);
		return builder.endCell();
	}
	exports.serializeTuple = serializeTuple;
	function parseTuple(src) {
		let res = [];
		let cs = src.beginParse();
		let size = cs.loadUint(24);
		for (let i = 0; i < size; i++) {
			let next = cs.loadRef();
			res.unshift(parseTupleItem(cs));
			cs = next.beginParse();
		}
		return res;
	}
	exports.parseTuple = parseTuple;
}));
//#endregion
//#region node_modules/@ton/core/dist/tuple/reader.js
var require_reader = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TupleReader = void 0;
	exports.TupleReader = class TupleReader {
		constructor(items) {
			this.items = [...items];
		}
		get remaining() {
			return this.items.length;
		}
		peek() {
			if (this.items.length === 0) throw Error("EOF");
			return this.items[0];
		}
		pop() {
			if (this.items.length === 0) throw Error("EOF");
			let res = this.items[0];
			this.items.splice(0, 1);
			return res;
		}
		skip(num = 1) {
			for (let i = 0; i < num; i++) this.pop();
			return this;
		}
		readBigNumber() {
			let popped = this.pop();
			if (popped.type !== "int") throw Error("Not a number");
			return popped.value;
		}
		readBigNumberOpt() {
			let popped = this.pop();
			if (popped.type === "null") return null;
			if (popped.type !== "int") throw Error("Not a number");
			return popped.value;
		}
		readNumber() {
			return Number(this.readBigNumber());
		}
		readNumberOpt() {
			let r = this.readBigNumberOpt();
			if (r !== null) return Number(r);
			else return null;
		}
		readBoolean() {
			return this.readNumber() === 0 ? false : true;
		}
		readBooleanOpt() {
			let res = this.readNumberOpt();
			if (res !== null) return res === 0 ? false : true;
			else return null;
		}
		readAddress() {
			let r = this.readCell().beginParse().loadAddress();
			if (r !== null) return r;
			else throw Error("Not an address");
		}
		readAddressOpt() {
			let r = this.readCellOpt();
			if (r !== null) return r.beginParse().loadMaybeAddress();
			else return null;
		}
		readCell() {
			let popped = this.pop();
			if (popped.type !== "cell" && popped.type !== "slice" && popped.type !== "builder") throw Error("Not a cell: " + popped.type);
			return popped.cell;
		}
		readCellOpt() {
			let popped = this.pop();
			if (popped.type === "null") return null;
			if (popped.type !== "cell" && popped.type !== "slice" && popped.type !== "builder") throw Error("Not a cell");
			return popped.cell;
		}
		readTuple() {
			let popped = this.pop();
			if (popped.type !== "tuple") throw Error("Not a tuple");
			return new TupleReader(popped.items);
		}
		readTupleOpt() {
			let popped = this.pop();
			if (popped.type === "null") return null;
			if (popped.type !== "tuple") throw Error("Not a tuple");
			return new TupleReader(popped.items);
		}
		static readLispList(reader) {
			const result = [];
			let tail = reader;
			while (tail !== null) {
				var head = tail.pop();
				if (tail.items.length === 0 || tail.items[0].type !== "tuple" && tail.items[0].type !== "null") throw Error("Lisp list consists only from (any, tuple) elements and ends with null");
				tail = tail.readTupleOpt();
				result.push(head);
			}
			return result;
		}
		readLispListDirect() {
			if (this.items.length === 1 && this.items[0].type === "null") return [];
			return TupleReader.readLispList(this);
		}
		readLispList() {
			return TupleReader.readLispList(this.readTupleOpt());
		}
		readBuffer() {
			let s = this.readCell().beginParse();
			if (s.remainingRefs !== 0) throw Error("Not a buffer");
			if (s.remainingBits % 8 !== 0) throw Error("Not a buffer");
			return s.loadBuffer(s.remainingBits / 8);
		}
		readBufferOpt() {
			let r = this.readCellOpt();
			if (r !== null) {
				let s = r.beginParse();
				if (s.remainingRefs !== 0 || s.remainingBits % 8 !== 0) throw Error("Not a buffer");
				return s.loadBuffer(s.remainingBits / 8);
			} else return null;
		}
		readString() {
			return this.readCell().beginParse().loadStringTail();
		}
		readStringOpt() {
			let r = this.readCellOpt();
			if (r !== null) return r.beginParse().loadStringTail();
			else return null;
		}
	};
}));
//#endregion
//#region node_modules/@ton/core/dist/tuple/builder.js
var require_builder = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TupleBuilder = void 0;
	var Builder_1 = require_Builder();
	var Cell_1 = require_Cell();
	var Slice_1 = require_Slice();
	var TupleBuilder = class {
		constructor() {
			this._tuple = [];
		}
		writeNumber(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "int",
				value: BigInt(v)
			});
		}
		writeBoolean(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "int",
				value: v ? -1n : 0n
			});
		}
		writeBuffer(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "slice",
				cell: (0, Builder_1.beginCell)().storeBuffer(v).endCell()
			});
		}
		writeString(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "slice",
				cell: (0, Builder_1.beginCell)().storeStringTail(v).endCell()
			});
		}
		writeCell(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else if (v instanceof Cell_1.Cell) this._tuple.push({
				type: "cell",
				cell: v
			});
			else if (v instanceof Slice_1.Slice) this._tuple.push({
				type: "cell",
				cell: v.asCell()
			});
		}
		writeSlice(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else if (v instanceof Cell_1.Cell) this._tuple.push({
				type: "slice",
				cell: v
			});
			else if (v instanceof Slice_1.Slice) this._tuple.push({
				type: "slice",
				cell: v.asCell()
			});
		}
		writeBuilder(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else if (v instanceof Cell_1.Cell) this._tuple.push({
				type: "builder",
				cell: v
			});
			else if (v instanceof Slice_1.Slice) this._tuple.push({
				type: "builder",
				cell: v.asCell()
			});
		}
		writeTuple(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "tuple",
				items: v
			});
		}
		writeAddress(v) {
			if (v === null || v === void 0) this._tuple.push({ type: "null" });
			else this._tuple.push({
				type: "slice",
				cell: (0, Builder_1.beginCell)().storeAddress(v).endCell()
			});
		}
		build() {
			return [...this._tuple];
		}
	};
	exports.TupleBuilder = TupleBuilder;
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/convert.js
var require_convert = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromNano = exports.toNano = void 0;
	function toNano(src) {
		if (typeof src === "bigint") return src * 1000000000n;
		else {
			if (typeof src === "number") {
				if (!Number.isFinite(src)) throw Error("Invalid number");
				if (Math.log10(src) <= 6) src = src.toLocaleString("en", {
					minimumFractionDigits: 9,
					useGrouping: false
				});
				else if (src - Math.trunc(src) === 0) src = src.toLocaleString("en", {
					maximumFractionDigits: 0,
					useGrouping: false
				});
				else throw Error("Not enough precision for a number value. Use string value instead");
			}
			let neg = false;
			while (src.startsWith("-")) {
				neg = !neg;
				src = src.slice(1);
			}
			if (src === ".") throw Error("Invalid number");
			let parts = src.split(".");
			if (parts.length > 2) throw Error("Invalid number");
			let whole = parts[0];
			let frac = parts[1];
			if (!whole) whole = "0";
			if (!frac) frac = "0";
			if (frac.length > 9) throw Error("Invalid number");
			while (frac.length < 9) frac += "0";
			let r = BigInt(whole) * 1000000000n + BigInt(frac);
			if (neg) r = -r;
			return r;
		}
	}
	exports.toNano = toNano;
	function fromNano(src) {
		let v = BigInt(src);
		let neg = false;
		if (v < 0) {
			neg = true;
			v = -v;
		}
		let facStr = (v % 1000000000n).toString();
		while (facStr.length < 9) facStr = "0" + facStr;
		facStr = facStr.match(/^([0-9]*[1-9]|0)(0*)/)[1];
		let value = `${(v / 1000000000n).toString()}${facStr === "0" ? "" : `.${facStr}`}`;
		if (neg) value = "-" + value;
		return value;
	}
	exports.fromNano = fromNano;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ExtraCurrency.js
var require_ExtraCurrency = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.packExtraCurrencyCell = exports.packExtraCurrencyDict = exports.storeExtraCurrency = exports.loadMaybeExtraCurrency = exports.loadExtraCurrency = void 0;
	var Builder_1 = require_Builder();
	var Dictionary_1 = require_Dictionary();
	function loadExtraCurrency(data) {
		let ecDict = data instanceof Dictionary_1.Dictionary ? data : Dictionary_1.Dictionary.loadDirect(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(5), data);
		let ecMap = {};
		for (let [k, v] of ecDict) ecMap[k] = v;
		return ecMap;
	}
	exports.loadExtraCurrency = loadExtraCurrency;
	function loadMaybeExtraCurrency(data) {
		const ecData = data.loadMaybeRef();
		return ecData === null ? ecData : loadExtraCurrency(ecData);
	}
	exports.loadMaybeExtraCurrency = loadMaybeExtraCurrency;
	function storeExtraCurrency(extracurrency) {
		return (builder) => {
			builder.storeDict(packExtraCurrencyDict(extracurrency));
		};
	}
	exports.storeExtraCurrency = storeExtraCurrency;
	function packExtraCurrencyDict(extracurrency) {
		const resEc = Dictionary_1.Dictionary.empty(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(5));
		Object.entries(extracurrency).map(([k, v]) => resEc.set(Number(k), v));
		return resEc;
	}
	exports.packExtraCurrencyDict = packExtraCurrencyDict;
	function packExtraCurrencyCell(extracurrency) {
		return (0, Builder_1.beginCell)().storeDictDirect(packExtraCurrencyDict(extracurrency)).endCell();
	}
	exports.packExtraCurrencyCell = packExtraCurrencyCell;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/_helpers.js
var require__helpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.comment = exports.external = exports.internal = void 0;
	var Address_1 = require_Address();
	var Cell_1 = require_Cell();
	var Builder_1 = require_Builder();
	var convert_1 = require_convert();
	var ExtraCurrency_1 = require_ExtraCurrency();
	function internal(src) {
		let bounce = true;
		if (src.bounce !== null && src.bounce !== void 0) bounce = src.bounce;
		let to;
		if (typeof src.to === "string") to = Address_1.Address.parse(src.to);
		else if (Address_1.Address.isAddress(src.to)) to = src.to;
		else throw new Error(`Invalid address ${src.to}`);
		let value;
		if (typeof src.value === "string") value = (0, convert_1.toNano)(src.value);
		else value = src.value;
		let other;
		if (src.extracurrency) other = (0, ExtraCurrency_1.packExtraCurrencyDict)(src.extracurrency);
		let body = Cell_1.Cell.EMPTY;
		if (typeof src.body === "string") body = (0, Builder_1.beginCell)().storeUint(0, 32).storeStringTail(src.body).endCell();
		else if (src.body) body = src.body;
		return {
			info: {
				type: "internal",
				dest: to,
				value: {
					coins: value,
					other
				},
				bounce,
				ihrDisabled: true,
				bounced: false,
				ihrFee: 0n,
				forwardFee: 0n,
				createdAt: 0,
				createdLt: 0n
			},
			init: src.init ?? void 0,
			body
		};
	}
	exports.internal = internal;
	function external(src) {
		let to;
		if (typeof src.to === "string") to = Address_1.Address.parse(src.to);
		else if (Address_1.Address.isAddress(src.to)) to = src.to;
		else throw new Error(`Invalid address ${src.to}`);
		return {
			info: {
				type: "external-in",
				dest: to,
				importFee: 0n
			},
			init: src.init ?? void 0,
			body: src.body || Cell_1.Cell.EMPTY
		};
	}
	exports.external = external;
	function comment(src) {
		return (0, Builder_1.beginCell)().storeUint(0, 32).storeStringTail(src).endCell();
	}
	exports.comment = comment;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/AccountState.js
var require_AccountState = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeAccountState = exports.loadAccountState = void 0;
	var StateInit_1 = require_StateInit();
	function loadAccountState(cs) {
		if (cs.loadBit()) return {
			type: "active",
			state: (0, StateInit_1.loadStateInit)(cs)
		};
		else if (cs.loadBit()) return {
			type: "frozen",
			stateHash: cs.loadUintBig(256)
		};
		else return { type: "uninit" };
	}
	exports.loadAccountState = loadAccountState;
	function storeAccountState(src) {
		return (builder) => {
			if (src.type === "active") {
				builder.storeBit(true);
				builder.store((0, StateInit_1.storeStateInit)(src.state));
			} else if (src.type === "frozen") {
				builder.storeBit(false);
				builder.storeBit(true);
				builder.storeUint(src.stateHash, 256);
			} else if (src.type === "uninit") {
				builder.storeBit(false);
				builder.storeBit(false);
			}
		};
	}
	exports.storeAccountState = storeAccountState;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/CurrencyCollection.js
var require_CurrencyCollection = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeCurrencyCollection = exports.loadCurrencyCollection = void 0;
	var Dictionary_1 = require_Dictionary();
	function loadCurrencyCollection(slice) {
		const coins = slice.loadCoins();
		const other = slice.loadDict(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(5));
		if (other.size === 0) return { coins };
		else return {
			other,
			coins
		};
	}
	exports.loadCurrencyCollection = loadCurrencyCollection;
	function storeCurrencyCollection(collection) {
		return (builder) => {
			builder.storeCoins(collection.coins);
			if (collection.other) builder.storeDict(collection.other);
			else builder.storeBit(0);
		};
	}
	exports.storeCurrencyCollection = storeCurrencyCollection;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/AccountStorage.js
var require_AccountStorage = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeAccountStorage = exports.loadAccountStorage = void 0;
	var AccountState_1 = require_AccountState();
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadAccountStorage(slice) {
		return {
			lastTransLt: slice.loadUintBig(64),
			balance: (0, CurrencyCollection_1.loadCurrencyCollection)(slice),
			state: (0, AccountState_1.loadAccountState)(slice)
		};
	}
	exports.loadAccountStorage = loadAccountStorage;
	function storeAccountStorage(src) {
		return (builder) => {
			builder.storeUint(src.lastTransLt, 64);
			builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.balance));
			builder.store((0, AccountState_1.storeAccountState)(src.state));
		};
	}
	exports.storeAccountStorage = storeAccountStorage;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/StorageExtraInfo.js
var require_StorageExtraInfo = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeStorageExtraInfo = exports.loadStorageExtraInfo = void 0;
	function loadStorageExtraInfo(slice) {
		let header = slice.loadUint(3);
		if (header === 0) return null;
		if (header === 1) return { dictHash: slice.loadUintBig(256) };
		throw new Error(`Invalid storage extra info header: ${header}`);
	}
	exports.loadStorageExtraInfo = loadStorageExtraInfo;
	function storeStorageExtraInfo(src) {
		return (builder) => {
			if (src === null || typeof src === "undefined") builder.storeUint(0, 3);
			else {
				builder.storeUint(1, 3);
				builder.storeUint(src.dictHash, 256);
			}
		};
	}
	exports.storeStorageExtraInfo = storeStorageExtraInfo;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/StorageUsed.js
var require_StorageUsed = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeStorageUsed = exports.loadStorageUsed = void 0;
	function loadStorageUsed(cs) {
		return {
			cells: cs.loadVarUintBig(3),
			bits: cs.loadVarUintBig(3)
		};
	}
	exports.loadStorageUsed = loadStorageUsed;
	function storeStorageUsed(src) {
		return (builder) => {
			builder.storeVarUint(src.cells, 3);
			builder.storeVarUint(src.bits, 3);
		};
	}
	exports.storeStorageUsed = storeStorageUsed;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/StorageInfo.js
var require_StorageInfo = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeStorageInfo = exports.loadStorageInfo = void 0;
	var StorageExtraInfo_1 = require_StorageExtraInfo();
	var StorageUsed_1 = require_StorageUsed();
	function loadStorageInfo(slice) {
		return {
			used: (0, StorageUsed_1.loadStorageUsed)(slice),
			storageExtra: (0, StorageExtraInfo_1.loadStorageExtraInfo)(slice),
			lastPaid: slice.loadUint(32),
			duePayment: slice.loadMaybeCoins()
		};
	}
	exports.loadStorageInfo = loadStorageInfo;
	function storeStorageInfo(src) {
		return (builder) => {
			builder.store((0, StorageUsed_1.storeStorageUsed)(src.used));
			builder.store((0, StorageExtraInfo_1.storeStorageExtraInfo)(src.storageExtra));
			builder.storeUint(src.lastPaid, 32);
			builder.storeMaybeCoins(src.duePayment);
		};
	}
	exports.storeStorageInfo = storeStorageInfo;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/Account.js
var require_Account = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeAccount = exports.loadAccount = void 0;
	var AccountStorage_1 = require_AccountStorage();
	var StorageInfo_1 = require_StorageInfo();
	function loadAccount(slice) {
		return {
			addr: slice.loadAddress(),
			storageStats: (0, StorageInfo_1.loadStorageInfo)(slice),
			storage: (0, AccountStorage_1.loadAccountStorage)(slice)
		};
	}
	exports.loadAccount = loadAccount;
	function storeAccount(src) {
		return (builder) => {
			builder.storeAddress(src.addr);
			builder.store((0, StorageInfo_1.storeStorageInfo)(src.storageStats));
			builder.store((0, AccountStorage_1.storeAccountStorage)(src.storage));
		};
	}
	exports.storeAccount = storeAccount;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/AccountStatus.js
var require_AccountStatus = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeAccountStatus = exports.loadAccountStatus = void 0;
	/**
	* Load account state from slice
	* @param slice
	* @returns AccountState
	*/
	function loadAccountStatus(slice) {
		const status = slice.loadUint(2);
		if (status === 0) return "uninitialized";
		if (status === 1) return "frozen";
		if (status === 2) return "active";
		if (status === 3) return "non-existing";
		throw Error("Invalid data");
	}
	exports.loadAccountStatus = loadAccountStatus;
	/**
	* Store account state to builder
	* @param src account state
	* @returns builder transformer
	*/
	function storeAccountStatus(src) {
		return (builder) => {
			if (src === "uninitialized") builder.storeUint(0, 2);
			else if (src === "frozen") builder.storeUint(1, 2);
			else if (src === "active") builder.storeUint(2, 2);
			else if (src === "non-existing") builder.storeUint(3, 2);
			else throw Error("Invalid data");
			return builder;
		};
	}
	exports.storeAccountStatus = storeAccountStatus;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/AccountStatusChange.js
var require_AccountStatusChange = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeAccountStatusChange = exports.loadAccountStatusChange = void 0;
	function loadAccountStatusChange(slice) {
		if (!slice.loadBit()) return "unchanged";
		if (slice.loadBit()) return "deleted";
		else return "frozen";
	}
	exports.loadAccountStatusChange = loadAccountStatusChange;
	function storeAccountStatusChange(src) {
		return (builder) => {
			if (src == "unchanged") builder.storeBit(0);
			else if (src === "frozen") {
				builder.storeBit(1);
				builder.storeBit(0);
			} else if (src === "deleted") {
				builder.storeBit(1);
				builder.storeBit(1);
			} else throw Error("Invalid account status change");
		};
	}
	exports.storeAccountStatusChange = storeAccountStatusChange;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/CommonMessageInfoRelaxed.js
var require_CommonMessageInfoRelaxed = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeCommonMessageInfoRelaxed = exports.loadCommonMessageInfoRelaxed = void 0;
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadCommonMessageInfoRelaxed(slice) {
		if (!slice.loadBit()) return {
			type: "internal",
			ihrDisabled: slice.loadBit(),
			bounce: slice.loadBit(),
			bounced: slice.loadBit(),
			src: slice.loadMaybeAddress(),
			dest: slice.loadAddress(),
			value: (0, CurrencyCollection_1.loadCurrencyCollection)(slice),
			ihrFee: slice.loadCoins(),
			forwardFee: slice.loadCoins(),
			createdLt: slice.loadUintBig(64),
			createdAt: slice.loadUint(32)
		};
		if (!slice.loadBit()) throw Error("External In message is not possible for CommonMessageInfoRelaxed");
		return {
			type: "external-out",
			src: slice.loadMaybeAddress(),
			dest: slice.loadMaybeExternalAddress(),
			createdLt: slice.loadUintBig(64),
			createdAt: slice.loadUint(32)
		};
	}
	exports.loadCommonMessageInfoRelaxed = loadCommonMessageInfoRelaxed;
	function storeCommonMessageInfoRelaxed(source) {
		return (builder) => {
			if (source.type === "internal") {
				builder.storeBit(0);
				builder.storeBit(source.ihrDisabled);
				builder.storeBit(source.bounce);
				builder.storeBit(source.bounced);
				builder.storeAddress(source.src);
				builder.storeAddress(source.dest);
				builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(source.value));
				builder.storeCoins(source.ihrFee);
				builder.storeCoins(source.forwardFee);
				builder.storeUint(source.createdLt, 64);
				builder.storeUint(source.createdAt, 32);
			} else if (source.type === "external-out") {
				builder.storeBit(1);
				builder.storeBit(1);
				builder.storeAddress(source.src);
				builder.storeAddress(source.dest);
				builder.storeUint(source.createdLt, 64);
				builder.storeUint(source.createdAt, 32);
			} else throw new Error("Unknown CommonMessageInfo type");
		};
	}
	exports.storeCommonMessageInfoRelaxed = storeCommonMessageInfoRelaxed;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/MessageRelaxed.js
var require_MessageRelaxed = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeMessageRelaxed = exports.loadMessageRelaxed = void 0;
	var Builder_1 = require_Builder();
	var CommonMessageInfoRelaxed_1 = require_CommonMessageInfoRelaxed();
	var StateInit_1 = require_StateInit();
	function loadMessageRelaxed(slice) {
		const info = (0, CommonMessageInfoRelaxed_1.loadCommonMessageInfoRelaxed)(slice);
		let init = null;
		if (slice.loadBit()) if (!slice.loadBit()) init = (0, StateInit_1.loadStateInit)(slice);
		else init = (0, StateInit_1.loadStateInit)(slice.loadRef().beginParse());
		const body = slice.loadBit() ? slice.loadRef() : slice.asCell();
		return {
			info,
			init,
			body
		};
	}
	exports.loadMessageRelaxed = loadMessageRelaxed;
	function storeMessageRelaxed(message, opts) {
		return (builder) => {
			builder.store((0, CommonMessageInfoRelaxed_1.storeCommonMessageInfoRelaxed)(message.info));
			if (message.init) {
				builder.storeBit(true);
				let initCell = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(message.init));
				let needRef = false;
				if (opts && opts.forceRef) needRef = true;
				else if (builder.availableBits - 2 >= initCell.bits) needRef = false;
				else needRef = true;
				if (needRef) {
					builder.storeBit(true);
					builder.storeRef(initCell);
				} else {
					builder.storeBit(false);
					builder.storeBuilder(initCell);
				}
			} else builder.storeBit(false);
			let needRef = false;
			if (opts && opts.forceRef) needRef = true;
			else if (builder.availableBits - 1 >= message.body.bits.length && builder.refs + message.body.refs.length <= 4 && !message.body.isExotic) needRef = false;
			else needRef = true;
			if (needRef) {
				builder.storeBit(true);
				builder.storeRef(message.body);
			} else {
				builder.storeBit(false);
				builder.storeBuilder(message.body.asBuilder());
			}
		};
	}
	exports.storeMessageRelaxed = storeMessageRelaxed;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/LibRef.js
var require_LibRef = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeLibRef = exports.loadLibRef = void 0;
	function loadLibRef(slice) {
		if (slice.loadUint(1) === 0) return {
			type: "hash",
			libHash: slice.loadBuffer(32)
		};
		else return {
			type: "ref",
			library: slice.loadRef()
		};
	}
	exports.loadLibRef = loadLibRef;
	function storeLibRef(src) {
		return (builder) => {
			if (src.type === "hash") {
				builder.storeUint(0, 1);
				builder.storeBuffer(src.libHash);
			} else {
				builder.storeUint(1, 1);
				builder.storeRef(src.library);
			}
		};
	}
	exports.storeLibRef = storeLibRef;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/OutList.js
var require_OutList = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loadOutList = exports.storeOutList = exports.loadOutAction = exports.storeOutAction = void 0;
	var MessageRelaxed_1 = require_MessageRelaxed();
	var Builder_1 = require_Builder();
	var CurrencyCollection_1 = require_CurrencyCollection();
	var LibRef_1 = require_LibRef();
	function storeOutAction(action) {
		switch (action.type) {
			case "sendMsg": return storeOutActionSendMsg(action);
			case "setCode": return storeOutActionSetCode(action);
			case "reserve": return storeOutActionReserve(action);
			case "changeLibrary": return storeOutActionChangeLibrary(action);
			default: throw new Error(`Unknown action type ${action.type}`);
		}
	}
	exports.storeOutAction = storeOutAction;
	var outActionSendMsgTag = 247711853;
	function storeOutActionSendMsg(action) {
		return (builder) => {
			builder.storeUint(outActionSendMsgTag, 32).storeUint(action.mode, 8).storeRef((0, Builder_1.beginCell)().store((0, MessageRelaxed_1.storeMessageRelaxed)(action.outMsg)).endCell());
		};
	}
	var outActionSetCodeTag = 2907562126;
	function storeOutActionSetCode(action) {
		return (builder) => {
			builder.storeUint(outActionSetCodeTag, 32).storeRef(action.newCode);
		};
	}
	var outActionReserveTag = 921090057;
	function storeOutActionReserve(action) {
		return (builder) => {
			builder.storeUint(outActionReserveTag, 32).storeUint(action.mode, 8).store((0, CurrencyCollection_1.storeCurrencyCollection)(action.currency));
		};
	}
	var outActionChangeLibraryTag = 653925844;
	function storeOutActionChangeLibrary(action) {
		return (builder) => {
			builder.storeUint(outActionChangeLibraryTag, 32).storeUint(action.mode, 7).store((0, LibRef_1.storeLibRef)(action.libRef));
		};
	}
	function loadOutAction(slice) {
		const tag = slice.loadUint(32);
		if (tag === outActionSendMsgTag) return {
			type: "sendMsg",
			mode: slice.loadUint(8),
			outMsg: (0, MessageRelaxed_1.loadMessageRelaxed)(slice.loadRef().beginParse())
		};
		if (tag === outActionSetCodeTag) return {
			type: "setCode",
			newCode: slice.loadRef()
		};
		if (tag === outActionReserveTag) return {
			type: "reserve",
			mode: slice.loadUint(8),
			currency: (0, CurrencyCollection_1.loadCurrencyCollection)(slice)
		};
		if (tag === outActionChangeLibraryTag) return {
			type: "changeLibrary",
			mode: slice.loadUint(7),
			libRef: (0, LibRef_1.loadLibRef)(slice)
		};
		throw new Error(`Unknown out action tag 0x${tag.toString(16)}`);
	}
	exports.loadOutAction = loadOutAction;
	function storeOutList(actions) {
		const cell = actions.reduce((cell, action) => (0, Builder_1.beginCell)().storeRef(cell).store(storeOutAction(action)).endCell(), (0, Builder_1.beginCell)().endCell());
		return (builder) => {
			builder.storeSlice(cell.beginParse());
		};
	}
	exports.storeOutList = storeOutList;
	function loadOutList(slice) {
		const actions = [];
		while (slice.remainingRefs) {
			const nextCell = slice.loadRef();
			actions.push(loadOutAction(slice));
			slice = nextCell.beginParse();
		}
		return actions.reverse();
	}
	exports.loadOutList = loadOutList;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/CommonMessageInfo.js
var require_CommonMessageInfo = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeCommonMessageInfo = exports.loadCommonMessageInfo = void 0;
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadCommonMessageInfo(slice) {
		if (!slice.loadBit()) return {
			type: "internal",
			ihrDisabled: slice.loadBit(),
			bounce: slice.loadBit(),
			bounced: slice.loadBit(),
			src: slice.loadAddress(),
			dest: slice.loadAddress(),
			value: (0, CurrencyCollection_1.loadCurrencyCollection)(slice),
			ihrFee: slice.loadCoins(),
			forwardFee: slice.loadCoins(),
			createdLt: slice.loadUintBig(64),
			createdAt: slice.loadUint(32)
		};
		if (!slice.loadBit()) return {
			type: "external-in",
			src: slice.loadMaybeExternalAddress(),
			dest: slice.loadAddress(),
			importFee: slice.loadCoins()
		};
		return {
			type: "external-out",
			src: slice.loadAddress(),
			dest: slice.loadMaybeExternalAddress(),
			createdLt: slice.loadUintBig(64),
			createdAt: slice.loadUint(32)
		};
	}
	exports.loadCommonMessageInfo = loadCommonMessageInfo;
	function storeCommonMessageInfo(source) {
		return (builder) => {
			if (source.type === "internal") {
				builder.storeBit(0);
				builder.storeBit(source.ihrDisabled);
				builder.storeBit(source.bounce);
				builder.storeBit(source.bounced);
				builder.storeAddress(source.src);
				builder.storeAddress(source.dest);
				builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(source.value));
				builder.storeCoins(source.ihrFee);
				builder.storeCoins(source.forwardFee);
				builder.storeUint(source.createdLt, 64);
				builder.storeUint(source.createdAt, 32);
			} else if (source.type === "external-in") {
				builder.storeBit(1);
				builder.storeBit(0);
				builder.storeAddress(source.src);
				builder.storeAddress(source.dest);
				builder.storeCoins(source.importFee);
			} else if (source.type === "external-out") {
				builder.storeBit(1);
				builder.storeBit(1);
				builder.storeAddress(source.src);
				builder.storeAddress(source.dest);
				builder.storeUint(source.createdLt, 64);
				builder.storeUint(source.createdAt, 32);
			} else throw new Error("Unknown CommonMessageInfo type");
		};
	}
	exports.storeCommonMessageInfo = storeCommonMessageInfo;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ComputeSkipReason.js
var require_ComputeSkipReason = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeComputeSkipReason = exports.loadComputeSkipReason = void 0;
	function loadComputeSkipReason(slice) {
		let reason = slice.loadUint(2);
		if (reason === 0) return "no-state";
		else if (reason === 1) return "bad-state";
		else if (reason === 2) return "no-gas";
		throw new Error(`Unknown ComputeSkipReason: ${reason}`);
	}
	exports.loadComputeSkipReason = loadComputeSkipReason;
	function storeComputeSkipReason(src) {
		return (builder) => {
			if (src === "no-state") builder.storeUint(0, 2);
			else if (src === "bad-state") builder.storeUint(1, 2);
			else if (src === "no-gas") builder.storeUint(2, 2);
			else throw new Error(`Unknown ComputeSkipReason: ${src}`);
		};
	}
	exports.storeComputeSkipReason = storeComputeSkipReason;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/DepthBalanceInfo.js
var require_DepthBalanceInfo = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeDepthBalanceInfo = exports.loadDepthBalanceInfo = void 0;
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadDepthBalanceInfo(slice) {
		return {
			splitDepth: slice.loadUint(5),
			balance: (0, CurrencyCollection_1.loadCurrencyCollection)(slice)
		};
	}
	exports.loadDepthBalanceInfo = loadDepthBalanceInfo;
	function storeDepthBalanceInfo(src) {
		return (builder) => {
			builder.storeUint(src.splitDepth, 5);
			builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.balance));
		};
	}
	exports.storeDepthBalanceInfo = storeDepthBalanceInfo;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/HashUpdate.js
var require_HashUpdate = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeHashUpdate = exports.loadHashUpdate = void 0;
	function loadHashUpdate(slice) {
		if (slice.loadUint(8) !== 114) throw Error("Invalid data");
		return {
			oldHash: slice.loadBuffer(32),
			newHash: slice.loadBuffer(32)
		};
	}
	exports.loadHashUpdate = loadHashUpdate;
	function storeHashUpdate(src) {
		return (builder) => {
			builder.storeUint(114, 8);
			builder.storeBuffer(src.oldHash);
			builder.storeBuffer(src.newHash);
		};
	}
	exports.storeHashUpdate = storeHashUpdate;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/MasterchainStateExtra.js
var require_MasterchainStateExtra = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loadMasterchainStateExtra = void 0;
	var Dictionary_1 = require_Dictionary();
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadMasterchainStateExtra(cs) {
		if (cs.loadUint(16) !== 52262) throw Error("Invalid data");
		if (cs.loadBit()) cs.loadRef();
		let configAddress = cs.loadUintBig(256);
		return {
			config: Dictionary_1.Dictionary.load(Dictionary_1.Dictionary.Keys.Int(32), Dictionary_1.Dictionary.Values.Cell(), cs),
			configAddress,
			globalBalance: (0, CurrencyCollection_1.loadCurrencyCollection)(cs)
		};
	}
	exports.loadMasterchainStateExtra = loadMasterchainStateExtra;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/Message.js
var require_Message = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MessageValue = exports.storeMessage = exports.loadMessage = void 0;
	var Builder_1 = require_Builder();
	var CommonMessageInfo_1 = require_CommonMessageInfo();
	var StateInit_1 = require_StateInit();
	function loadMessage(slice) {
		const info = (0, CommonMessageInfo_1.loadCommonMessageInfo)(slice);
		let init = null;
		if (slice.loadBit()) if (!slice.loadBit()) init = (0, StateInit_1.loadStateInit)(slice);
		else init = (0, StateInit_1.loadStateInit)(slice.loadRef().beginParse());
		const body = slice.loadBit() ? slice.loadRef() : slice.asCell();
		return {
			info,
			init,
			body
		};
	}
	exports.loadMessage = loadMessage;
	function storeMessage(message, opts) {
		return (builder) => {
			builder.store((0, CommonMessageInfo_1.storeCommonMessageInfo)(message.info));
			if (message.init) {
				builder.storeBit(true);
				let initCell = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(message.init));
				let needRef = false;
				if (opts && opts.forceRef) needRef = true;
				else needRef = builder.availableBits - 2 < initCell.bits + message.body.bits.length;
				if (needRef) {
					builder.storeBit(true);
					builder.storeRef(initCell);
				} else {
					builder.storeBit(false);
					builder.storeBuilder(initCell);
				}
			} else builder.storeBit(false);
			let needRef = false;
			if (opts && opts.forceRef) needRef = true;
			else needRef = builder.availableBits - 1 < message.body.bits.length || builder.refs + message.body.refs.length > 4;
			if (needRef) {
				builder.storeBit(true);
				builder.storeRef(message.body);
			} else {
				builder.storeBit(false);
				builder.storeBuilder(message.body.asBuilder());
			}
		};
	}
	exports.storeMessage = storeMessage;
	exports.MessageValue = {
		serialize(src, builder) {
			builder.storeRef((0, Builder_1.beginCell)().store(storeMessage(src)));
		},
		parse(slice) {
			return loadMessage(slice.loadRef().beginParse());
		}
	};
}));
//#endregion
//#region node_modules/@ton/core/dist/types/SendMode.js
var require_SendMode = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SendMode = void 0;
	var SendMode;
	(function(SendMode) {
		SendMode[SendMode["CARRY_ALL_REMAINING_BALANCE"] = 128] = "CARRY_ALL_REMAINING_BALANCE";
		SendMode[SendMode["CARRY_ALL_REMAINING_INCOMING_VALUE"] = 64] = "CARRY_ALL_REMAINING_INCOMING_VALUE";
		SendMode[SendMode["DESTROY_ACCOUNT_IF_ZERO"] = 32] = "DESTROY_ACCOUNT_IF_ZERO";
		SendMode[SendMode["PAY_GAS_SEPARATELY"] = 1] = "PAY_GAS_SEPARATELY";
		SendMode[SendMode["IGNORE_ERRORS"] = 2] = "IGNORE_ERRORS";
		SendMode[SendMode["NONE"] = 0] = "NONE";
	})(SendMode || (exports.SendMode = SendMode = {}));
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ReserveMode.js
var require_ReserveMode = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReserveMode = void 0;
	var ReserveMode;
	(function(ReserveMode) {
		ReserveMode[ReserveMode["THIS_AMOUNT"] = 0] = "THIS_AMOUNT";
		ReserveMode[ReserveMode["LEAVE_THIS_AMOUNT"] = 1] = "LEAVE_THIS_AMOUNT";
		ReserveMode[ReserveMode["AT_MOST_THIS_AMOUNT"] = 2] = "AT_MOST_THIS_AMOUNT";
		ReserveMode[ReserveMode["LEAVE_MAX_THIS_AMOUNT"] = 3] = "LEAVE_MAX_THIS_AMOUNT";
		ReserveMode[ReserveMode["BEFORE_BALANCE_PLUS_THIS_AMOUNT"] = 4] = "BEFORE_BALANCE_PLUS_THIS_AMOUNT";
		ReserveMode[ReserveMode["LEAVE_BBALANCE_PLUS_THIS_AMOUNT"] = 5] = "LEAVE_BBALANCE_PLUS_THIS_AMOUNT";
		ReserveMode[ReserveMode["BEFORE_BALANCE_MINUS_THIS_AMOUNT"] = 12] = "BEFORE_BALANCE_MINUS_THIS_AMOUNT";
		ReserveMode[ReserveMode["LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT"] = 13] = "LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT";
	})(ReserveMode || (exports.ReserveMode = ReserveMode = {}));
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ShardAccount.js
var require_ShardAccount = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeShardAccount = exports.loadShardAccount = void 0;
	var Builder_1 = require_Builder();
	var Account_1 = require_Account();
	function loadShardAccount(slice) {
		let accountRef = slice.loadRef();
		let account = void 0;
		if (!accountRef.isExotic) {
			let accountSlice = accountRef.beginParse();
			if (accountSlice.loadBit()) account = (0, Account_1.loadAccount)(accountSlice);
		}
		return {
			account,
			lastTransactionHash: slice.loadUintBig(256),
			lastTransactionLt: slice.loadUintBig(64)
		};
	}
	exports.loadShardAccount = loadShardAccount;
	function storeShardAccount(src) {
		return (builder) => {
			if (src.account) builder.storeRef((0, Builder_1.beginCell)().storeBit(true).store((0, Account_1.storeAccount)(src.account)));
			else builder.storeRef((0, Builder_1.beginCell)().storeBit(false));
			builder.storeUint(src.lastTransactionHash, 256);
			builder.storeUint(src.lastTransactionLt, 64);
		};
	}
	exports.storeShardAccount = storeShardAccount;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ShardAccounts.js
var require_ShardAccounts = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeShardAccounts = exports.loadShardAccounts = exports.ShardAccountRefValue = void 0;
	var Dictionary_1 = require_Dictionary();
	var DepthBalanceInfo_1 = require_DepthBalanceInfo();
	var ShardAccount_1 = require_ShardAccount();
	exports.ShardAccountRefValue = {
		parse: (cs) => {
			return {
				depthBalanceInfo: (0, DepthBalanceInfo_1.loadDepthBalanceInfo)(cs),
				shardAccount: (0, ShardAccount_1.loadShardAccount)(cs)
			};
		},
		serialize(src, builder) {
			builder.store((0, DepthBalanceInfo_1.storeDepthBalanceInfo)(src.depthBalanceInfo));
			builder.store((0, ShardAccount_1.storeShardAccount)(src.shardAccount));
		}
	};
	function loadShardAccounts(cs) {
		return Dictionary_1.Dictionary.load(Dictionary_1.Dictionary.Keys.BigUint(256), exports.ShardAccountRefValue, cs);
	}
	exports.loadShardAccounts = loadShardAccounts;
	function storeShardAccounts(src) {
		return (Builder) => {
			Builder.storeDict(src);
		};
	}
	exports.storeShardAccounts = storeShardAccounts;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ShardIdent.js
var require_ShardIdent = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeShardIdent = exports.loadShardIdent = void 0;
	function loadShardIdent(slice) {
		if (slice.loadUint(2) !== 0) throw Error("Invalid data");
		return {
			shardPrefixBits: slice.loadUint(6),
			workchainId: slice.loadInt(32),
			shardPrefix: slice.loadUintBig(64)
		};
	}
	exports.loadShardIdent = loadShardIdent;
	function storeShardIdent(src) {
		return (builder) => {
			builder.storeUint(0, 2);
			builder.storeUint(src.shardPrefixBits, 6);
			builder.storeInt(src.workchainId, 32);
			builder.storeUint(src.shardPrefix, 64);
		};
	}
	exports.storeShardIdent = storeShardIdent;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/ShardStateUnsplit.js
var require_ShardStateUnsplit = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loadShardStateUnsplit = void 0;
	var MasterchainStateExtra_1 = require_MasterchainStateExtra();
	var ShardAccounts_1 = require_ShardAccounts();
	var ShardIdent_1 = require_ShardIdent();
	function loadShardStateUnsplit(cs) {
		if (cs.loadUint(32) !== 2418257890) throw Error("Invalid data");
		let globalId = cs.loadInt(32);
		let shardId = (0, ShardIdent_1.loadShardIdent)(cs);
		let seqno = cs.loadUint(32);
		let vertSeqNo = cs.loadUint(32);
		let genUtime = cs.loadUint(32);
		let genLt = cs.loadUintBig(64);
		let minRefMcSeqno = cs.loadUint(32);
		cs.loadRef();
		let beforeSplit = cs.loadBit();
		let shardAccountsRef = cs.loadRef();
		let accounts = void 0;
		if (!shardAccountsRef.isExotic) accounts = (0, ShardAccounts_1.loadShardAccounts)(shardAccountsRef.beginParse());
		cs.loadRef();
		let mcStateExtra = cs.loadBit();
		let extras = null;
		if (mcStateExtra) {
			let cell = cs.loadRef();
			if (!cell.isExotic) extras = (0, MasterchainStateExtra_1.loadMasterchainStateExtra)(cell.beginParse());
		}
		return {
			globalId,
			shardId,
			seqno,
			vertSeqNo,
			genUtime,
			genLt,
			minRefMcSeqno,
			beforeSplit,
			accounts,
			extras
		};
	}
	exports.loadShardStateUnsplit = loadShardStateUnsplit;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/SignatureDomain.js
var require_SignatureDomain = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.signatureDomainEmptyTag = exports.signatureDomainL2Tag = void 0;
	exports.signatureDomainL2Tag = 1907576545;
	exports.signatureDomainEmptyTag = 236803867;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/SplitMergeInfo.js
var require_SplitMergeInfo = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeSplitMergeInfo = exports.loadSplitMergeInfo = void 0;
	function loadSplitMergeInfo(slice) {
		return {
			currentShardPrefixLength: slice.loadUint(6),
			accountSplitDepth: slice.loadUint(6),
			thisAddress: slice.loadUintBig(256),
			siblingAddress: slice.loadUintBig(256)
		};
	}
	exports.loadSplitMergeInfo = loadSplitMergeInfo;
	function storeSplitMergeInfo(src) {
		return (builder) => {
			builder.storeUint(src.currentShardPrefixLength, 6);
			builder.storeUint(src.accountSplitDepth, 6);
			builder.storeUint(src.thisAddress, 256);
			builder.storeUint(src.siblingAddress, 256);
		};
	}
	exports.storeSplitMergeInfo = storeSplitMergeInfo;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionActionPhase.js
var require_TransactionActionPhase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionActionPhase = exports.loadTransactionActionPhase = void 0;
	var AccountStatusChange_1 = require_AccountStatusChange();
	var StorageUsed_1 = require_StorageUsed();
	function loadTransactionActionPhase(slice) {
		return {
			success: slice.loadBit(),
			valid: slice.loadBit(),
			noFunds: slice.loadBit(),
			statusChange: (0, AccountStatusChange_1.loadAccountStatusChange)(slice),
			totalFwdFees: slice.loadBit() ? slice.loadCoins() : void 0,
			totalActionFees: slice.loadBit() ? slice.loadCoins() : void 0,
			resultCode: slice.loadInt(32),
			resultArg: slice.loadBit() ? slice.loadInt(32) : void 0,
			totalActions: slice.loadUint(16),
			specActions: slice.loadUint(16),
			skippedActions: slice.loadUint(16),
			messagesCreated: slice.loadUint(16),
			actionListHash: slice.loadUintBig(256),
			totalMessageSize: (0, StorageUsed_1.loadStorageUsed)(slice)
		};
	}
	exports.loadTransactionActionPhase = loadTransactionActionPhase;
	function storeTransactionActionPhase(src) {
		return (builder) => {
			builder.storeBit(src.success);
			builder.storeBit(src.valid);
			builder.storeBit(src.noFunds);
			builder.store((0, AccountStatusChange_1.storeAccountStatusChange)(src.statusChange));
			builder.storeMaybeCoins(src.totalFwdFees);
			builder.storeMaybeCoins(src.totalActionFees);
			builder.storeInt(src.resultCode, 32);
			builder.storeMaybeInt(src.resultArg, 32);
			builder.storeUint(src.totalActions, 16);
			builder.storeUint(src.specActions, 16);
			builder.storeUint(src.skippedActions, 16);
			builder.storeUint(src.messagesCreated, 16);
			builder.storeUint(src.actionListHash, 256);
			builder.store((0, StorageUsed_1.storeStorageUsed)(src.totalMessageSize));
		};
	}
	exports.storeTransactionActionPhase = storeTransactionActionPhase;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionBouncePhase.js
var require_TransactionBouncePhase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionBouncePhase = exports.loadTransactionBouncePhase = void 0;
	var StorageUsed_1 = require_StorageUsed();
	function loadTransactionBouncePhase(slice) {
		if (slice.loadBit()) return {
			type: "ok",
			messageSize: (0, StorageUsed_1.loadStorageUsed)(slice),
			messageFees: slice.loadCoins(),
			forwardFees: slice.loadCoins()
		};
		if (slice.loadBit()) return {
			type: "no-funds",
			messageSize: (0, StorageUsed_1.loadStorageUsed)(slice),
			requiredForwardFees: slice.loadCoins()
		};
		return { type: "negative-funds" };
	}
	exports.loadTransactionBouncePhase = loadTransactionBouncePhase;
	function storeTransactionBouncePhase(src) {
		return (builder) => {
			if (src.type === "ok") {
				builder.storeBit(true);
				builder.store((0, StorageUsed_1.storeStorageUsed)(src.messageSize));
				builder.storeCoins(src.messageFees);
				builder.storeCoins(src.forwardFees);
			} else if (src.type === "negative-funds") {
				builder.storeBit(false);
				builder.storeBit(false);
			} else if (src.type === "no-funds") {
				builder.storeBit(false);
				builder.storeBit(true);
				builder.store((0, StorageUsed_1.storeStorageUsed)(src.messageSize));
				builder.storeCoins(src.requiredForwardFees);
			} else throw new Error("Invalid TransactionBouncePhase type");
		};
	}
	exports.storeTransactionBouncePhase = storeTransactionBouncePhase;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionComputePhase.js
var require_TransactionComputePhase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionComputePhase = exports.loadTransactionComputePhase = void 0;
	var Builder_1 = require_Builder();
	var ComputeSkipReason_1 = require_ComputeSkipReason();
	function loadTransactionComputePhase(slice) {
		if (!slice.loadBit()) return {
			type: "skipped",
			reason: (0, ComputeSkipReason_1.loadComputeSkipReason)(slice)
		};
		let success = slice.loadBit();
		let messageStateUsed = slice.loadBit();
		let accountActivated = slice.loadBit();
		let gasFees = slice.loadCoins();
		const vmState = slice.loadRef().beginParse();
		return {
			type: "vm",
			success,
			messageStateUsed,
			accountActivated,
			gasFees,
			gasUsed: vmState.loadVarUintBig(3),
			gasLimit: vmState.loadVarUintBig(3),
			gasCredit: vmState.loadBit() ? vmState.loadVarUintBig(2) : void 0,
			mode: vmState.loadUint(8),
			exitCode: vmState.loadInt(32),
			exitArg: vmState.loadBit() ? vmState.loadInt(32) : void 0,
			vmSteps: vmState.loadUint(32),
			vmInitStateHash: vmState.loadUintBig(256),
			vmFinalStateHash: vmState.loadUintBig(256)
		};
	}
	exports.loadTransactionComputePhase = loadTransactionComputePhase;
	function storeTransactionComputePhase(src) {
		return (builder) => {
			if (src.type === "skipped") {
				builder.storeBit(0);
				builder.store((0, ComputeSkipReason_1.storeComputeSkipReason)(src.reason));
				return;
			}
			builder.storeBit(1);
			builder.storeBit(src.success);
			builder.storeBit(src.messageStateUsed);
			builder.storeBit(src.accountActivated);
			builder.storeCoins(src.gasFees);
			builder.storeRef((0, Builder_1.beginCell)().storeVarUint(src.gasUsed, 3).storeVarUint(src.gasLimit, 3).store((b) => src.gasCredit !== void 0 && src.gasCredit !== null ? b.storeBit(1).storeVarUint(src.gasCredit, 2) : b.storeBit(0)).storeUint(src.mode, 8).storeInt(src.exitCode, 32).store((b) => src.exitArg !== void 0 && src.exitArg !== null ? b.storeBit(1).storeInt(src.exitArg, 32) : b.storeBit(0)).storeUint(src.vmSteps, 32).storeUint(src.vmInitStateHash, 256).storeUint(src.vmFinalStateHash, 256).endCell());
		};
	}
	exports.storeTransactionComputePhase = storeTransactionComputePhase;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionCreditPhase.js
var require_TransactionCreditPhase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionCreditPhase = exports.loadTransactionCreditPhase = void 0;
	var CurrencyCollection_1 = require_CurrencyCollection();
	function loadTransactionCreditPhase(slice) {
		return {
			dueFeesColelcted: slice.loadBit() ? slice.loadCoins() : void 0,
			credit: (0, CurrencyCollection_1.loadCurrencyCollection)(slice)
		};
	}
	exports.loadTransactionCreditPhase = loadTransactionCreditPhase;
	function storeTransactionCreditPhase(src) {
		return (builder) => {
			if (src.dueFeesColelcted === null || src.dueFeesColelcted === void 0) builder.storeBit(false);
			else {
				builder.storeBit(true);
				builder.storeCoins(src.dueFeesColelcted);
			}
			builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.credit));
		};
	}
	exports.storeTransactionCreditPhase = storeTransactionCreditPhase;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionStoragePhase.js
var require_TransactionStoragePhase = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionsStoragePhase = exports.loadTransactionStoragePhase = void 0;
	var AccountStatusChange_1 = require_AccountStatusChange();
	function loadTransactionStoragePhase(slice) {
		const storageFeesCollected = slice.loadCoins();
		let storageFeesDue = void 0;
		if (slice.loadBit()) storageFeesDue = slice.loadCoins();
		const statusChange = (0, AccountStatusChange_1.loadAccountStatusChange)(slice);
		return {
			storageFeesCollected,
			storageFeesDue,
			statusChange
		};
	}
	exports.loadTransactionStoragePhase = loadTransactionStoragePhase;
	function storeTransactionsStoragePhase(src) {
		return (builder) => {
			builder.storeCoins(src.storageFeesCollected);
			if (src.storageFeesDue === null || src.storageFeesDue === void 0) builder.storeBit(false);
			else {
				builder.storeBit(true);
				builder.storeCoins(src.storageFeesDue);
			}
			builder.store((0, AccountStatusChange_1.storeAccountStatusChange)(src.statusChange));
		};
	}
	exports.storeTransactionsStoragePhase = storeTransactionsStoragePhase;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/TransactionDescription.js
var require_TransactionDescription = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransactionDescription = exports.loadTransactionDescription = void 0;
	var Builder_1 = require_Builder();
	var SplitMergeInfo_1 = require_SplitMergeInfo();
	var Transaction_1 = require_Transaction();
	var TransactionActionPhase_1 = require_TransactionActionPhase();
	var TransactionBouncePhase_1 = require_TransactionBouncePhase();
	var TransactionComputePhase_1 = require_TransactionComputePhase();
	var TransactionCreditPhase_1 = require_TransactionCreditPhase();
	var TransactionStoragePhase_1 = require_TransactionStoragePhase();
	function loadTransactionDescription(slice) {
		let type = slice.loadUint(4);
		if (type === 0) {
			const creditFirst = slice.loadBit();
			let storagePhase = void 0;
			if (slice.loadBit()) storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
			let creditPhase = void 0;
			if (slice.loadBit()) creditPhase = (0, TransactionCreditPhase_1.loadTransactionCreditPhase)(slice);
			let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
			let actionPhase = void 0;
			if (slice.loadBit()) actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
			let aborted = slice.loadBit();
			let bouncePhase = void 0;
			if (slice.loadBit()) bouncePhase = (0, TransactionBouncePhase_1.loadTransactionBouncePhase)(slice);
			const destroyed = slice.loadBit();
			return {
				type: "generic",
				creditFirst,
				storagePhase,
				creditPhase,
				computePhase,
				actionPhase,
				bouncePhase,
				aborted,
				destroyed
			};
		}
		if (type === 1) return {
			type: "storage",
			storagePhase: (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice)
		};
		if (type === 2 || type === 3) {
			const isTock = type === 3;
			let storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
			let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
			let actionPhase = void 0;
			if (slice.loadBit()) actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
			const aborted = slice.loadBit();
			const destroyed = slice.loadBit();
			return {
				type: "tick-tock",
				isTock,
				storagePhase,
				computePhase,
				actionPhase,
				aborted,
				destroyed
			};
		}
		if (type === 4) {
			let splitInfo = (0, SplitMergeInfo_1.loadSplitMergeInfo)(slice);
			let storagePhase = void 0;
			if (slice.loadBit()) storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
			let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
			let actionPhase = void 0;
			if (slice.loadBit()) actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
			const aborted = slice.loadBit();
			const destroyed = slice.loadBit();
			return {
				type: "split-prepare",
				splitInfo,
				storagePhase,
				computePhase,
				actionPhase,
				aborted,
				destroyed
			};
		}
		if (type === 5) return {
			type: "split-install",
			splitInfo: (0, SplitMergeInfo_1.loadSplitMergeInfo)(slice),
			prepareTransaction: (0, Transaction_1.loadTransaction)(slice.loadRef().beginParse()),
			installed: slice.loadBit()
		};
		throw Error(`Unsupported transaction description type ${type}`);
	}
	exports.loadTransactionDescription = loadTransactionDescription;
	function storeTransactionDescription(src) {
		return (builder) => {
			if (src.type === "generic") {
				builder.storeUint(0, 4);
				builder.storeBit(src.creditFirst);
				if (src.storagePhase) {
					builder.storeBit(true);
					builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
				} else builder.storeBit(false);
				if (src.creditPhase) {
					builder.storeBit(true);
					builder.store((0, TransactionCreditPhase_1.storeTransactionCreditPhase)(src.creditPhase));
				} else builder.storeBit(false);
				builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
				if (src.actionPhase) {
					builder.storeBit(true);
					builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase)));
				} else builder.storeBit(false);
				builder.storeBit(src.aborted);
				if (src.bouncePhase) {
					builder.storeBit(true);
					builder.store((0, TransactionBouncePhase_1.storeTransactionBouncePhase)(src.bouncePhase));
				} else builder.storeBit(false);
				builder.storeBit(src.destroyed);
			} else if (src.type === "storage") {
				builder.storeUint(1, 4);
				builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
			} else if (src.type === "tick-tock") {
				builder.storeUint(src.isTock ? 3 : 2, 4);
				builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
				builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
				if (src.actionPhase) {
					builder.storeBit(true);
					builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase)));
				} else builder.storeBit(false);
				builder.storeBit(src.aborted);
				builder.storeBit(src.destroyed);
			} else if (src.type === "split-prepare") {
				builder.storeUint(4, 4);
				builder.store((0, SplitMergeInfo_1.storeSplitMergeInfo)(src.splitInfo));
				if (src.storagePhase) {
					builder.storeBit(true);
					builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
				} else builder.storeBit(false);
				builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
				if (src.actionPhase) {
					builder.storeBit(true);
					builder.store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase));
				} else builder.storeBit(false);
				builder.storeBit(src.aborted);
				builder.storeBit(src.destroyed);
			} else if (src.type === "split-install") {
				builder.storeUint(5, 4);
				builder.store((0, SplitMergeInfo_1.storeSplitMergeInfo)(src.splitInfo));
				builder.storeRef((0, Builder_1.beginCell)().store((0, Transaction_1.storeTransaction)(src.prepareTransaction)));
				builder.storeBit(src.installed);
			} else throw Error(`Unsupported transaction description type ${src.type}`);
		};
	}
	exports.storeTransactionDescription = storeTransactionDescription;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/Transaction.js
var require_Transaction = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeTransaction = exports.loadTransaction = void 0;
	var Builder_1 = require_Builder();
	var Dictionary_1 = require_Dictionary();
	var AccountStatus_1 = require_AccountStatus();
	var CurrencyCollection_1 = require_CurrencyCollection();
	var HashUpdate_1 = require_HashUpdate();
	var Message_1 = require_Message();
	var TransactionDescription_1 = require_TransactionDescription();
	function loadTransaction(slice) {
		let raw = slice.asCell();
		if (slice.loadUint(4) !== 7) throw Error("Invalid data");
		let address = slice.loadUintBig(256);
		let lt = slice.loadUintBig(64);
		let prevTransactionHash = slice.loadUintBig(256);
		let prevTransactionLt = slice.loadUintBig(64);
		let now = slice.loadUint(32);
		let outMessagesCount = slice.loadUint(15);
		let oldStatus = (0, AccountStatus_1.loadAccountStatus)(slice);
		let endStatus = (0, AccountStatus_1.loadAccountStatus)(slice);
		let msgSlice = slice.loadRef().beginParse();
		let inMessage = msgSlice.loadBit() ? (0, Message_1.loadMessage)(msgSlice.loadRef().beginParse()) : void 0;
		let outMessages = msgSlice.loadDict(Dictionary_1.Dictionary.Keys.Uint(15), Message_1.MessageValue);
		msgSlice.endParse();
		return {
			address,
			lt,
			prevTransactionHash,
			prevTransactionLt,
			now,
			outMessagesCount,
			oldStatus,
			endStatus,
			inMessage,
			outMessages,
			totalFees: (0, CurrencyCollection_1.loadCurrencyCollection)(slice),
			stateUpdate: (0, HashUpdate_1.loadHashUpdate)(slice.loadRef().beginParse()),
			description: (0, TransactionDescription_1.loadTransactionDescription)(slice.loadRef().beginParse()),
			raw,
			hash: () => raw.hash()
		};
	}
	exports.loadTransaction = loadTransaction;
	function storeTransaction(src) {
		return (builder) => {
			builder.storeUint(7, 4);
			builder.storeUint(src.address, 256);
			builder.storeUint(src.lt, 64);
			builder.storeUint(src.prevTransactionHash, 256);
			builder.storeUint(src.prevTransactionLt, 64);
			builder.storeUint(src.now, 32);
			builder.storeUint(src.outMessagesCount, 15);
			builder.store((0, AccountStatus_1.storeAccountStatus)(src.oldStatus));
			builder.store((0, AccountStatus_1.storeAccountStatus)(src.endStatus));
			let msgBuilder = (0, Builder_1.beginCell)();
			if (src.inMessage) {
				msgBuilder.storeBit(true);
				msgBuilder.storeRef((0, Builder_1.beginCell)().store((0, Message_1.storeMessage)(src.inMessage)));
			} else msgBuilder.storeBit(false);
			msgBuilder.storeDict(src.outMessages);
			builder.storeRef(msgBuilder);
			builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.totalFees));
			builder.storeRef((0, Builder_1.beginCell)().store((0, HashUpdate_1.storeHashUpdate)(src.stateUpdate)));
			builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionDescription_1.storeTransactionDescription)(src.description)));
		};
	}
	exports.storeTransaction = storeTransaction;
}));
//#endregion
//#region node_modules/@ton/core/dist/types/_export.js
var require__export = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.signatureDomainEmptyTag = exports.loadShardStateUnsplit = exports.storeShardIdent = exports.loadShardIdent = exports.storeShardAccounts = exports.loadShardAccounts = exports.ShardAccountRefValue = exports.storeShardAccount = exports.loadShardAccount = exports.ReserveMode = exports.SendMode = exports.storeMessageRelaxed = exports.loadMessageRelaxed = exports.storeMessage = exports.loadMessage = exports.loadMasterchainStateExtra = exports.storeHashUpdate = exports.loadHashUpdate = exports.storeExtraCurrency = exports.loadMaybeExtraCurrency = exports.loadExtraCurrency = exports.packExtraCurrencyDict = exports.packExtraCurrencyCell = exports.storeDepthBalanceInfo = exports.loadDepthBalanceInfo = exports.storeCurrencyCollection = exports.loadCurrencyCollection = exports.storeComputeSkipReason = exports.loadComputeSkipReason = exports.storeCommonMessageInfoRelaxed = exports.loadCommonMessageInfoRelaxed = exports.storeCommonMessageInfo = exports.loadCommonMessageInfo = exports.storeOutList = exports.loadOutList = exports.storeOutAction = exports.loadOutAction = exports.storeAccountStorage = exports.loadAccountStorage = exports.storeAccountStatusChange = exports.loadAccountStatusChange = exports.storeAccountStatus = exports.loadAccountStatus = exports.storeAccountState = exports.loadAccountState = exports.storeAccount = exports.loadAccount = exports.comment = exports.external = exports.internal = void 0;
	exports.storeTransactionsStoragePhase = exports.loadTransactionStoragePhase = exports.storeTransactionDescription = exports.loadTransactionDescription = exports.storeTransactionCreditPhase = exports.loadTransactionCreditPhase = exports.storeTransactionComputePhase = exports.loadTransactionComputePhase = exports.storeTransactionBouncePhase = exports.loadTransactionBouncePhase = exports.storeTransactionActionPhase = exports.loadTransactionActionPhase = exports.storeTransaction = exports.loadTransaction = exports.storeTickTock = exports.loadTickTock = exports.storeStorageUsed = exports.loadStorageUsed = exports.storeStorageInfo = exports.loadStorageInfo = exports.storeStateInit = exports.loadStateInit = exports.storeSplitMergeInfo = exports.loadSplitMergeInfo = exports.storeLibRef = exports.loadLibRef = exports.storeSimpleLibrary = exports.loadSimpleLibrary = exports.signatureDomainL2Tag = void 0;
	var _helpers_1 = require__helpers();
	Object.defineProperty(exports, "internal", {
		enumerable: true,
		get: function() {
			return _helpers_1.internal;
		}
	});
	Object.defineProperty(exports, "external", {
		enumerable: true,
		get: function() {
			return _helpers_1.external;
		}
	});
	Object.defineProperty(exports, "comment", {
		enumerable: true,
		get: function() {
			return _helpers_1.comment;
		}
	});
	var Account_1 = require_Account();
	Object.defineProperty(exports, "loadAccount", {
		enumerable: true,
		get: function() {
			return Account_1.loadAccount;
		}
	});
	Object.defineProperty(exports, "storeAccount", {
		enumerable: true,
		get: function() {
			return Account_1.storeAccount;
		}
	});
	var AccountState_1 = require_AccountState();
	Object.defineProperty(exports, "loadAccountState", {
		enumerable: true,
		get: function() {
			return AccountState_1.loadAccountState;
		}
	});
	Object.defineProperty(exports, "storeAccountState", {
		enumerable: true,
		get: function() {
			return AccountState_1.storeAccountState;
		}
	});
	var AccountStatus_1 = require_AccountStatus();
	Object.defineProperty(exports, "loadAccountStatus", {
		enumerable: true,
		get: function() {
			return AccountStatus_1.loadAccountStatus;
		}
	});
	Object.defineProperty(exports, "storeAccountStatus", {
		enumerable: true,
		get: function() {
			return AccountStatus_1.storeAccountStatus;
		}
	});
	var AccountStatusChange_1 = require_AccountStatusChange();
	Object.defineProperty(exports, "loadAccountStatusChange", {
		enumerable: true,
		get: function() {
			return AccountStatusChange_1.loadAccountStatusChange;
		}
	});
	Object.defineProperty(exports, "storeAccountStatusChange", {
		enumerable: true,
		get: function() {
			return AccountStatusChange_1.storeAccountStatusChange;
		}
	});
	var AccountStorage_1 = require_AccountStorage();
	Object.defineProperty(exports, "loadAccountStorage", {
		enumerable: true,
		get: function() {
			return AccountStorage_1.loadAccountStorage;
		}
	});
	Object.defineProperty(exports, "storeAccountStorage", {
		enumerable: true,
		get: function() {
			return AccountStorage_1.storeAccountStorage;
		}
	});
	var OutList_1 = require_OutList();
	Object.defineProperty(exports, "loadOutAction", {
		enumerable: true,
		get: function() {
			return OutList_1.loadOutAction;
		}
	});
	Object.defineProperty(exports, "storeOutAction", {
		enumerable: true,
		get: function() {
			return OutList_1.storeOutAction;
		}
	});
	Object.defineProperty(exports, "loadOutList", {
		enumerable: true,
		get: function() {
			return OutList_1.loadOutList;
		}
	});
	Object.defineProperty(exports, "storeOutList", {
		enumerable: true,
		get: function() {
			return OutList_1.storeOutList;
		}
	});
	var CommonMessageInfo_1 = require_CommonMessageInfo();
	Object.defineProperty(exports, "loadCommonMessageInfo", {
		enumerable: true,
		get: function() {
			return CommonMessageInfo_1.loadCommonMessageInfo;
		}
	});
	Object.defineProperty(exports, "storeCommonMessageInfo", {
		enumerable: true,
		get: function() {
			return CommonMessageInfo_1.storeCommonMessageInfo;
		}
	});
	var CommonMessageInfoRelaxed_1 = require_CommonMessageInfoRelaxed();
	Object.defineProperty(exports, "loadCommonMessageInfoRelaxed", {
		enumerable: true,
		get: function() {
			return CommonMessageInfoRelaxed_1.loadCommonMessageInfoRelaxed;
		}
	});
	Object.defineProperty(exports, "storeCommonMessageInfoRelaxed", {
		enumerable: true,
		get: function() {
			return CommonMessageInfoRelaxed_1.storeCommonMessageInfoRelaxed;
		}
	});
	var ComputeSkipReason_1 = require_ComputeSkipReason();
	Object.defineProperty(exports, "loadComputeSkipReason", {
		enumerable: true,
		get: function() {
			return ComputeSkipReason_1.loadComputeSkipReason;
		}
	});
	Object.defineProperty(exports, "storeComputeSkipReason", {
		enumerable: true,
		get: function() {
			return ComputeSkipReason_1.storeComputeSkipReason;
		}
	});
	var CurrencyCollection_1 = require_CurrencyCollection();
	Object.defineProperty(exports, "loadCurrencyCollection", {
		enumerable: true,
		get: function() {
			return CurrencyCollection_1.loadCurrencyCollection;
		}
	});
	Object.defineProperty(exports, "storeCurrencyCollection", {
		enumerable: true,
		get: function() {
			return CurrencyCollection_1.storeCurrencyCollection;
		}
	});
	var DepthBalanceInfo_1 = require_DepthBalanceInfo();
	Object.defineProperty(exports, "loadDepthBalanceInfo", {
		enumerable: true,
		get: function() {
			return DepthBalanceInfo_1.loadDepthBalanceInfo;
		}
	});
	Object.defineProperty(exports, "storeDepthBalanceInfo", {
		enumerable: true,
		get: function() {
			return DepthBalanceInfo_1.storeDepthBalanceInfo;
		}
	});
	var ExtraCurrency_1 = require_ExtraCurrency();
	Object.defineProperty(exports, "packExtraCurrencyCell", {
		enumerable: true,
		get: function() {
			return ExtraCurrency_1.packExtraCurrencyCell;
		}
	});
	Object.defineProperty(exports, "packExtraCurrencyDict", {
		enumerable: true,
		get: function() {
			return ExtraCurrency_1.packExtraCurrencyDict;
		}
	});
	Object.defineProperty(exports, "loadExtraCurrency", {
		enumerable: true,
		get: function() {
			return ExtraCurrency_1.loadExtraCurrency;
		}
	});
	Object.defineProperty(exports, "loadMaybeExtraCurrency", {
		enumerable: true,
		get: function() {
			return ExtraCurrency_1.loadMaybeExtraCurrency;
		}
	});
	Object.defineProperty(exports, "storeExtraCurrency", {
		enumerable: true,
		get: function() {
			return ExtraCurrency_1.storeExtraCurrency;
		}
	});
	var HashUpdate_1 = require_HashUpdate();
	Object.defineProperty(exports, "loadHashUpdate", {
		enumerable: true,
		get: function() {
			return HashUpdate_1.loadHashUpdate;
		}
	});
	Object.defineProperty(exports, "storeHashUpdate", {
		enumerable: true,
		get: function() {
			return HashUpdate_1.storeHashUpdate;
		}
	});
	var MasterchainStateExtra_1 = require_MasterchainStateExtra();
	Object.defineProperty(exports, "loadMasterchainStateExtra", {
		enumerable: true,
		get: function() {
			return MasterchainStateExtra_1.loadMasterchainStateExtra;
		}
	});
	var Message_1 = require_Message();
	Object.defineProperty(exports, "loadMessage", {
		enumerable: true,
		get: function() {
			return Message_1.loadMessage;
		}
	});
	Object.defineProperty(exports, "storeMessage", {
		enumerable: true,
		get: function() {
			return Message_1.storeMessage;
		}
	});
	var MessageRelaxed_1 = require_MessageRelaxed();
	Object.defineProperty(exports, "loadMessageRelaxed", {
		enumerable: true,
		get: function() {
			return MessageRelaxed_1.loadMessageRelaxed;
		}
	});
	Object.defineProperty(exports, "storeMessageRelaxed", {
		enumerable: true,
		get: function() {
			return MessageRelaxed_1.storeMessageRelaxed;
		}
	});
	var SendMode_1 = require_SendMode();
	Object.defineProperty(exports, "SendMode", {
		enumerable: true,
		get: function() {
			return SendMode_1.SendMode;
		}
	});
	var ReserveMode_1 = require_ReserveMode();
	Object.defineProperty(exports, "ReserveMode", {
		enumerable: true,
		get: function() {
			return ReserveMode_1.ReserveMode;
		}
	});
	var ShardAccount_1 = require_ShardAccount();
	Object.defineProperty(exports, "loadShardAccount", {
		enumerable: true,
		get: function() {
			return ShardAccount_1.loadShardAccount;
		}
	});
	Object.defineProperty(exports, "storeShardAccount", {
		enumerable: true,
		get: function() {
			return ShardAccount_1.storeShardAccount;
		}
	});
	var ShardAccounts_1 = require_ShardAccounts();
	Object.defineProperty(exports, "ShardAccountRefValue", {
		enumerable: true,
		get: function() {
			return ShardAccounts_1.ShardAccountRefValue;
		}
	});
	Object.defineProperty(exports, "loadShardAccounts", {
		enumerable: true,
		get: function() {
			return ShardAccounts_1.loadShardAccounts;
		}
	});
	Object.defineProperty(exports, "storeShardAccounts", {
		enumerable: true,
		get: function() {
			return ShardAccounts_1.storeShardAccounts;
		}
	});
	var ShardIdent_1 = require_ShardIdent();
	Object.defineProperty(exports, "loadShardIdent", {
		enumerable: true,
		get: function() {
			return ShardIdent_1.loadShardIdent;
		}
	});
	Object.defineProperty(exports, "storeShardIdent", {
		enumerable: true,
		get: function() {
			return ShardIdent_1.storeShardIdent;
		}
	});
	var ShardStateUnsplit_1 = require_ShardStateUnsplit();
	Object.defineProperty(exports, "loadShardStateUnsplit", {
		enumerable: true,
		get: function() {
			return ShardStateUnsplit_1.loadShardStateUnsplit;
		}
	});
	var SignatureDomain_1 = require_SignatureDomain();
	Object.defineProperty(exports, "signatureDomainEmptyTag", {
		enumerable: true,
		get: function() {
			return SignatureDomain_1.signatureDomainEmptyTag;
		}
	});
	Object.defineProperty(exports, "signatureDomainL2Tag", {
		enumerable: true,
		get: function() {
			return SignatureDomain_1.signatureDomainL2Tag;
		}
	});
	var SimpleLibrary_1 = require_SimpleLibrary();
	Object.defineProperty(exports, "loadSimpleLibrary", {
		enumerable: true,
		get: function() {
			return SimpleLibrary_1.loadSimpleLibrary;
		}
	});
	Object.defineProperty(exports, "storeSimpleLibrary", {
		enumerable: true,
		get: function() {
			return SimpleLibrary_1.storeSimpleLibrary;
		}
	});
	var LibRef_1 = require_LibRef();
	Object.defineProperty(exports, "loadLibRef", {
		enumerable: true,
		get: function() {
			return LibRef_1.loadLibRef;
		}
	});
	Object.defineProperty(exports, "storeLibRef", {
		enumerable: true,
		get: function() {
			return LibRef_1.storeLibRef;
		}
	});
	var SplitMergeInfo_1 = require_SplitMergeInfo();
	Object.defineProperty(exports, "loadSplitMergeInfo", {
		enumerable: true,
		get: function() {
			return SplitMergeInfo_1.loadSplitMergeInfo;
		}
	});
	Object.defineProperty(exports, "storeSplitMergeInfo", {
		enumerable: true,
		get: function() {
			return SplitMergeInfo_1.storeSplitMergeInfo;
		}
	});
	var StateInit_1 = require_StateInit();
	Object.defineProperty(exports, "loadStateInit", {
		enumerable: true,
		get: function() {
			return StateInit_1.loadStateInit;
		}
	});
	Object.defineProperty(exports, "storeStateInit", {
		enumerable: true,
		get: function() {
			return StateInit_1.storeStateInit;
		}
	});
	var StorageInfo_1 = require_StorageInfo();
	Object.defineProperty(exports, "loadStorageInfo", {
		enumerable: true,
		get: function() {
			return StorageInfo_1.loadStorageInfo;
		}
	});
	Object.defineProperty(exports, "storeStorageInfo", {
		enumerable: true,
		get: function() {
			return StorageInfo_1.storeStorageInfo;
		}
	});
	var StorageUsed_1 = require_StorageUsed();
	Object.defineProperty(exports, "loadStorageUsed", {
		enumerable: true,
		get: function() {
			return StorageUsed_1.loadStorageUsed;
		}
	});
	Object.defineProperty(exports, "storeStorageUsed", {
		enumerable: true,
		get: function() {
			return StorageUsed_1.storeStorageUsed;
		}
	});
	var TickTock_1 = require_TickTock();
	Object.defineProperty(exports, "loadTickTock", {
		enumerable: true,
		get: function() {
			return TickTock_1.loadTickTock;
		}
	});
	Object.defineProperty(exports, "storeTickTock", {
		enumerable: true,
		get: function() {
			return TickTock_1.storeTickTock;
		}
	});
	var Transaction_1 = require_Transaction();
	Object.defineProperty(exports, "loadTransaction", {
		enumerable: true,
		get: function() {
			return Transaction_1.loadTransaction;
		}
	});
	Object.defineProperty(exports, "storeTransaction", {
		enumerable: true,
		get: function() {
			return Transaction_1.storeTransaction;
		}
	});
	var TransactionActionPhase_1 = require_TransactionActionPhase();
	Object.defineProperty(exports, "loadTransactionActionPhase", {
		enumerable: true,
		get: function() {
			return TransactionActionPhase_1.loadTransactionActionPhase;
		}
	});
	Object.defineProperty(exports, "storeTransactionActionPhase", {
		enumerable: true,
		get: function() {
			return TransactionActionPhase_1.storeTransactionActionPhase;
		}
	});
	var TransactionBouncePhase_1 = require_TransactionBouncePhase();
	Object.defineProperty(exports, "loadTransactionBouncePhase", {
		enumerable: true,
		get: function() {
			return TransactionBouncePhase_1.loadTransactionBouncePhase;
		}
	});
	Object.defineProperty(exports, "storeTransactionBouncePhase", {
		enumerable: true,
		get: function() {
			return TransactionBouncePhase_1.storeTransactionBouncePhase;
		}
	});
	var TransactionComputePhase_1 = require_TransactionComputePhase();
	Object.defineProperty(exports, "loadTransactionComputePhase", {
		enumerable: true,
		get: function() {
			return TransactionComputePhase_1.loadTransactionComputePhase;
		}
	});
	Object.defineProperty(exports, "storeTransactionComputePhase", {
		enumerable: true,
		get: function() {
			return TransactionComputePhase_1.storeTransactionComputePhase;
		}
	});
	var TransactionCreditPhase_1 = require_TransactionCreditPhase();
	Object.defineProperty(exports, "loadTransactionCreditPhase", {
		enumerable: true,
		get: function() {
			return TransactionCreditPhase_1.loadTransactionCreditPhase;
		}
	});
	Object.defineProperty(exports, "storeTransactionCreditPhase", {
		enumerable: true,
		get: function() {
			return TransactionCreditPhase_1.storeTransactionCreditPhase;
		}
	});
	var TransactionDescription_1 = require_TransactionDescription();
	Object.defineProperty(exports, "loadTransactionDescription", {
		enumerable: true,
		get: function() {
			return TransactionDescription_1.loadTransactionDescription;
		}
	});
	Object.defineProperty(exports, "storeTransactionDescription", {
		enumerable: true,
		get: function() {
			return TransactionDescription_1.storeTransactionDescription;
		}
	});
	var TransactionStoragePhase_1 = require_TransactionStoragePhase();
	Object.defineProperty(exports, "loadTransactionStoragePhase", {
		enumerable: true,
		get: function() {
			return TransactionStoragePhase_1.loadTransactionStoragePhase;
		}
	});
	Object.defineProperty(exports, "storeTransactionsStoragePhase", {
		enumerable: true,
		get: function() {
			return TransactionStoragePhase_1.storeTransactionsStoragePhase;
		}
	});
}));
//#endregion
//#region node_modules/@ton/core/dist/contract/openContract.js
var require_openContract = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openContract = void 0;
	var Address_1 = require_Address();
	var Cell_1 = require_Cell();
	function openContract(src, factory) {
		let address;
		let init = null;
		if (!Address_1.Address.isAddress(src.address)) throw Error("Invalid address");
		address = src.address;
		if (src.init) {
			if (!(src.init.code instanceof Cell_1.Cell)) throw Error("Invalid init.code");
			if (!(src.init.data instanceof Cell_1.Cell)) throw Error("Invalid init.data");
			init = src.init;
		}
		let executor = factory({
			address,
			init
		});
		return new Proxy(src, { get(target, prop) {
			const value = target[prop];
			if (typeof prop === "string" && (prop.startsWith("get") || prop.startsWith("send") || prop.startsWith("is"))) {
				if (typeof value === "function") return (...args) => value.apply(target, [executor, ...args]);
			}
			return value;
		} });
	}
	exports.openContract = openContract;
}));
//#endregion
//#region node_modules/@ton/core/dist/contract/ComputeError.js
var require_ComputeError = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ComputeError = void 0;
	exports.ComputeError = class ComputeError extends Error {
		constructor(message, exitCode, opts) {
			super(message);
			this.exitCode = exitCode;
			this.debugLogs = opts && opts.debugLogs ? opts.debugLogs : null;
			this.logs = opts && opts.logs ? opts.logs : null;
			Object.setPrototypeOf(this, ComputeError.prototype);
		}
	};
}));
//#endregion
//#region node_modules/@ton/core/dist/utils/getMethodId.js
var require_getMethodId = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMethodId = void 0;
	var TABLE = new Int16Array([
		0,
		4129,
		8258,
		12387,
		16516,
		20645,
		24774,
		28903,
		33032,
		37161,
		41290,
		45419,
		49548,
		53677,
		57806,
		61935,
		4657,
		528,
		12915,
		8786,
		21173,
		17044,
		29431,
		25302,
		37689,
		33560,
		45947,
		41818,
		54205,
		50076,
		62463,
		58334,
		9314,
		13379,
		1056,
		5121,
		25830,
		29895,
		17572,
		21637,
		42346,
		46411,
		34088,
		38153,
		58862,
		62927,
		50604,
		54669,
		13907,
		9842,
		5649,
		1584,
		30423,
		26358,
		22165,
		18100,
		46939,
		42874,
		38681,
		34616,
		63455,
		59390,
		55197,
		51132,
		18628,
		22757,
		26758,
		30887,
		2112,
		6241,
		10242,
		14371,
		51660,
		55789,
		59790,
		63919,
		35144,
		39273,
		43274,
		47403,
		23285,
		19156,
		31415,
		27286,
		6769,
		2640,
		14899,
		10770,
		56317,
		52188,
		64447,
		60318,
		39801,
		35672,
		47931,
		43802,
		27814,
		31879,
		19684,
		23749,
		11298,
		15363,
		3168,
		7233,
		60846,
		64911,
		52716,
		56781,
		44330,
		48395,
		36200,
		40265,
		32407,
		28342,
		24277,
		20212,
		15891,
		11826,
		7761,
		3696,
		65439,
		61374,
		57309,
		53244,
		48923,
		44858,
		40793,
		36728,
		37256,
		33193,
		45514,
		41451,
		53516,
		49453,
		61774,
		57711,
		4224,
		161,
		12482,
		8419,
		20484,
		16421,
		28742,
		24679,
		33721,
		37784,
		41979,
		46042,
		49981,
		54044,
		58239,
		62302,
		689,
		4752,
		8947,
		13010,
		16949,
		21012,
		25207,
		29270,
		46570,
		42443,
		38312,
		34185,
		62830,
		58703,
		54572,
		50445,
		13538,
		9411,
		5280,
		1153,
		29798,
		25671,
		21540,
		17413,
		42971,
		47098,
		34713,
		38840,
		59231,
		63358,
		50973,
		55100,
		9939,
		14066,
		1681,
		5808,
		26199,
		30326,
		17941,
		22068,
		55628,
		51565,
		63758,
		59695,
		39368,
		35305,
		47498,
		43435,
		22596,
		18533,
		30726,
		26663,
		6336,
		2273,
		14466,
		10403,
		52093,
		56156,
		60223,
		64286,
		35833,
		39896,
		43963,
		48026,
		19061,
		23124,
		27191,
		31254,
		2801,
		6864,
		10931,
		14994,
		64814,
		60687,
		56684,
		52557,
		48554,
		44427,
		40424,
		36297,
		31782,
		27655,
		23652,
		19525,
		15522,
		11395,
		7392,
		3265,
		61215,
		65342,
		53085,
		57212,
		44955,
		49082,
		36825,
		40952,
		28183,
		32310,
		20053,
		24180,
		11923,
		16050,
		3793,
		7920
	]);
	function crc16(data) {
		if (!(data instanceof Buffer)) data = Buffer.from(data);
		let crc = 0;
		for (let index = 0; index < data.length; index++) {
			const byte = data[index];
			crc = (TABLE[(crc >> 8 ^ byte) & 255] ^ crc << 8) & 65535;
		}
		return crc;
	}
	function getMethodId(name) {
		return crc16(name) & 65535 | 65536;
	}
	exports.getMethodId = getMethodId;
}));
//#endregion
//#region node_modules/@ton/core/dist/crypto/safeSign.js
var require_safeSign = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.safeSignVerify = exports.safeSign = void 0;
	var crypto_1 = require_dist$2();
	var MIN_SEED_LENGTH = 8;
	var MAX_SEED_LENGTH = 64;
	function createSafeSignHash(cell, seed) {
		let seedData = Buffer.from(seed);
		if (seedData.length > MAX_SEED_LENGTH) throw Error("Seed can	 be longer than 64 bytes");
		if (seedData.length < MIN_SEED_LENGTH) throw Error("Seed must be at least 8 bytes");
		return (0, crypto_1.sha256_sync)(Buffer.concat([
			Buffer.from([255, 255]),
			seedData,
			cell.hash()
		]));
	}
	function safeSign(cell, secretKey, seed = "ton-safe-sign-magic") {
		return (0, crypto_1.sign)(createSafeSignHash(cell, seed), secretKey);
	}
	exports.safeSign = safeSign;
	function safeSignVerify(cell, signature, publicKey, seed = "ton-safe-sign-magic") {
		return (0, crypto_1.signVerify)(createSafeSignHash(cell, seed), signature, publicKey);
	}
	exports.safeSignVerify = safeSignVerify;
}));
//#endregion
//#region node_modules/@ton/core/dist/crypto/domainSignature.js
var require_domainSignature = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.domainSignVerify = exports.domainSign = exports.domainDataToSign = exports.signatureDomainPrefix = exports.signatureDomainHash = void 0;
	var crypto_1 = require_dist$2();
	var SignatureDomain_1 = require_SignatureDomain();
	function signatureDomainHash(domain) {
		switch (domain.type) {
			case "empty":
				const tl = Buffer.alloc(4);
				tl.writeInt32LE(SignatureDomain_1.signatureDomainEmptyTag);
				return (0, crypto_1.sha256_sync)(tl);
			case "l2": {
				const tl = Buffer.alloc(8);
				tl.writeInt32LE(SignatureDomain_1.signatureDomainL2Tag);
				tl.writeInt32LE(domain.globalId, 4);
				return (0, crypto_1.sha256_sync)(tl);
			}
			default: throw new Error(`Unknown SignatureDomain type ${domain.type}`);
		}
	}
	exports.signatureDomainHash = signatureDomainHash;
	var signatureDomainEmptyHash = signatureDomainHash({ type: "empty" });
	function signatureDomainPrefix(domainOrHash) {
		const domainHash = Buffer.isBuffer(domainOrHash) ? domainOrHash : signatureDomainHash(domainOrHash);
		if (domainHash.length !== 32) throw new Error("Invalid signature domain hash length");
		if (domainHash.equals(signatureDomainEmptyHash)) return null;
		return domainHash;
	}
	exports.signatureDomainPrefix = signatureDomainPrefix;
	function domainDataToSign(data, domain) {
		const prefix = signatureDomainPrefix(domain);
		return prefix ? Buffer.concat([prefix, data]) : data;
	}
	exports.domainDataToSign = domainDataToSign;
	function domainSign({ data, secretKey, domain = { type: "empty" } }) {
		const dataToSign = domainDataToSign(data, domain);
		return (0, crypto_1.sign)(dataToSign, secretKey);
	}
	exports.domainSign = domainSign;
	function domainSignVerify({ data, signature, publicKey, domain = { type: "empty" } }) {
		const dataToSign = domainDataToSign(data, domain);
		return (0, crypto_1.signVerify)(dataToSign, signature, publicKey);
	}
	exports.domainSignVerify = domainSignVerify;
}));
//#endregion
//#region node_modules/@ton/core/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$14) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$14, p)) __createBinding(exports$14, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.domainDataToSign = exports.domainSignVerify = exports.domainSign = exports.signatureDomainPrefix = exports.signatureDomainHash = exports.safeSignVerify = exports.safeSign = exports.getMethodId = exports.base32Encode = exports.base32Decode = exports.crc32c = exports.crc16 = exports.fromNano = exports.toNano = exports.ComputeError = exports.openContract = exports.TupleBuilder = exports.TupleReader = exports.serializeTupleItem = exports.parseTupleItem = exports.serializeTuple = exports.parseTuple = exports.generateMerkleUpdate = exports.generateMerkleProofDirect = exports.generateMerkleProof = exports.exoticPruned = exports.exoticMerkleUpdate = exports.convertToMerkleProof = exports.exoticMerkleProof = exports.Dictionary = exports.Cell = exports.CellType = exports.Slice = exports.beginCell = exports.Builder = exports.BitBuilder = exports.BitReader = exports.BitString = exports.contractAddress = exports.ADNLAddress = exports.ExternalAddress = exports.address = exports.Address = void 0;
	var Address_1 = require_Address();
	Object.defineProperty(exports, "Address", {
		enumerable: true,
		get: function() {
			return Address_1.Address;
		}
	});
	Object.defineProperty(exports, "address", {
		enumerable: true,
		get: function() {
			return Address_1.address;
		}
	});
	var ExternalAddress_1 = require_ExternalAddress();
	Object.defineProperty(exports, "ExternalAddress", {
		enumerable: true,
		get: function() {
			return ExternalAddress_1.ExternalAddress;
		}
	});
	var ADNLAddress_1 = require_ADNLAddress();
	Object.defineProperty(exports, "ADNLAddress", {
		enumerable: true,
		get: function() {
			return ADNLAddress_1.ADNLAddress;
		}
	});
	var contractAddress_1 = require_contractAddress();
	Object.defineProperty(exports, "contractAddress", {
		enumerable: true,
		get: function() {
			return contractAddress_1.contractAddress;
		}
	});
	var BitString_1 = require_BitString();
	Object.defineProperty(exports, "BitString", {
		enumerable: true,
		get: function() {
			return BitString_1.BitString;
		}
	});
	var BitReader_1 = require_BitReader();
	Object.defineProperty(exports, "BitReader", {
		enumerable: true,
		get: function() {
			return BitReader_1.BitReader;
		}
	});
	var BitBuilder_1 = require_BitBuilder();
	Object.defineProperty(exports, "BitBuilder", {
		enumerable: true,
		get: function() {
			return BitBuilder_1.BitBuilder;
		}
	});
	var Builder_1 = require_Builder();
	Object.defineProperty(exports, "Builder", {
		enumerable: true,
		get: function() {
			return Builder_1.Builder;
		}
	});
	Object.defineProperty(exports, "beginCell", {
		enumerable: true,
		get: function() {
			return Builder_1.beginCell;
		}
	});
	var Slice_1 = require_Slice();
	Object.defineProperty(exports, "Slice", {
		enumerable: true,
		get: function() {
			return Slice_1.Slice;
		}
	});
	var CellType_1 = require_CellType();
	Object.defineProperty(exports, "CellType", {
		enumerable: true,
		get: function() {
			return CellType_1.CellType;
		}
	});
	var Cell_1 = require_Cell();
	Object.defineProperty(exports, "Cell", {
		enumerable: true,
		get: function() {
			return Cell_1.Cell;
		}
	});
	var Dictionary_1 = require_Dictionary();
	Object.defineProperty(exports, "Dictionary", {
		enumerable: true,
		get: function() {
			return Dictionary_1.Dictionary;
		}
	});
	var exoticMerkleProof_1 = require_exoticMerkleProof();
	Object.defineProperty(exports, "exoticMerkleProof", {
		enumerable: true,
		get: function() {
			return exoticMerkleProof_1.exoticMerkleProof;
		}
	});
	Object.defineProperty(exports, "convertToMerkleProof", {
		enumerable: true,
		get: function() {
			return exoticMerkleProof_1.convertToMerkleProof;
		}
	});
	var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
	Object.defineProperty(exports, "exoticMerkleUpdate", {
		enumerable: true,
		get: function() {
			return exoticMerkleUpdate_1.exoticMerkleUpdate;
		}
	});
	var exoticPruned_1 = require_exoticPruned();
	Object.defineProperty(exports, "exoticPruned", {
		enumerable: true,
		get: function() {
			return exoticPruned_1.exoticPruned;
		}
	});
	var generateMerkleProof_1 = require_generateMerkleProof();
	Object.defineProperty(exports, "generateMerkleProof", {
		enumerable: true,
		get: function() {
			return generateMerkleProof_1.generateMerkleProof;
		}
	});
	Object.defineProperty(exports, "generateMerkleProofDirect", {
		enumerable: true,
		get: function() {
			return generateMerkleProof_1.generateMerkleProofDirect;
		}
	});
	var generateMerkleUpdate_1 = require_generateMerkleUpdate();
	Object.defineProperty(exports, "generateMerkleUpdate", {
		enumerable: true,
		get: function() {
			return generateMerkleUpdate_1.generateMerkleUpdate;
		}
	});
	var tuple_1 = require_tuple();
	Object.defineProperty(exports, "parseTuple", {
		enumerable: true,
		get: function() {
			return tuple_1.parseTuple;
		}
	});
	Object.defineProperty(exports, "serializeTuple", {
		enumerable: true,
		get: function() {
			return tuple_1.serializeTuple;
		}
	});
	Object.defineProperty(exports, "parseTupleItem", {
		enumerable: true,
		get: function() {
			return tuple_1.parseTupleItem;
		}
	});
	Object.defineProperty(exports, "serializeTupleItem", {
		enumerable: true,
		get: function() {
			return tuple_1.serializeTupleItem;
		}
	});
	var reader_1 = require_reader();
	Object.defineProperty(exports, "TupleReader", {
		enumerable: true,
		get: function() {
			return reader_1.TupleReader;
		}
	});
	var builder_1 = require_builder();
	Object.defineProperty(exports, "TupleBuilder", {
		enumerable: true,
		get: function() {
			return builder_1.TupleBuilder;
		}
	});
	__exportStar(require__export(), exports);
	var openContract_1 = require_openContract();
	Object.defineProperty(exports, "openContract", {
		enumerable: true,
		get: function() {
			return openContract_1.openContract;
		}
	});
	var ComputeError_1 = require_ComputeError();
	Object.defineProperty(exports, "ComputeError", {
		enumerable: true,
		get: function() {
			return ComputeError_1.ComputeError;
		}
	});
	var convert_1 = require_convert();
	Object.defineProperty(exports, "toNano", {
		enumerable: true,
		get: function() {
			return convert_1.toNano;
		}
	});
	Object.defineProperty(exports, "fromNano", {
		enumerable: true,
		get: function() {
			return convert_1.fromNano;
		}
	});
	var crc16_1 = require_crc16();
	Object.defineProperty(exports, "crc16", {
		enumerable: true,
		get: function() {
			return crc16_1.crc16;
		}
	});
	var crc32c_1 = require_crc32c();
	Object.defineProperty(exports, "crc32c", {
		enumerable: true,
		get: function() {
			return crc32c_1.crc32c;
		}
	});
	var base32_1 = require_base32();
	Object.defineProperty(exports, "base32Decode", {
		enumerable: true,
		get: function() {
			return base32_1.base32Decode;
		}
	});
	Object.defineProperty(exports, "base32Encode", {
		enumerable: true,
		get: function() {
			return base32_1.base32Encode;
		}
	});
	var getMethodId_1 = require_getMethodId();
	Object.defineProperty(exports, "getMethodId", {
		enumerable: true,
		get: function() {
			return getMethodId_1.getMethodId;
		}
	});
	var safeSign_1 = require_safeSign();
	Object.defineProperty(exports, "safeSign", {
		enumerable: true,
		get: function() {
			return safeSign_1.safeSign;
		}
	});
	Object.defineProperty(exports, "safeSignVerify", {
		enumerable: true,
		get: function() {
			return safeSign_1.safeSignVerify;
		}
	});
	var domainSignature_1 = require_domainSignature();
	Object.defineProperty(exports, "signatureDomainHash", {
		enumerable: true,
		get: function() {
			return domainSignature_1.signatureDomainHash;
		}
	});
	Object.defineProperty(exports, "signatureDomainPrefix", {
		enumerable: true,
		get: function() {
			return domainSignature_1.signatureDomainPrefix;
		}
	});
	Object.defineProperty(exports, "domainSign", {
		enumerable: true,
		get: function() {
			return domainSignature_1.domainSign;
		}
	});
	Object.defineProperty(exports, "domainSignVerify", {
		enumerable: true,
		get: function() {
			return domainSignature_1.domainSignVerify;
		}
	});
	Object.defineProperty(exports, "domainDataToSign", {
		enumerable: true,
		get: function() {
			return domainSignature_1.domainDataToSign;
		}
	});
}));
//#endregion
//#region node_modules/@ton/ton/dist/client/api/TonCache.js
var require_TonCache = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InMemoryCache = void 0;
	var InMemoryCache = class {
		constructor() {
			this.cache = /* @__PURE__ */ new Map();
			this.set = async (namespace, key, value) => {
				if (value !== null) this.cache.set(namespace + "$$" + key, value);
				else this.cache.delete(namespace + "$$" + key);
			};
			this.get = async (namespace, key) => {
				let res = this.cache.get(namespace + "$$" + key);
				if (res !== void 0) return res;
				else return null;
			};
		}
	};
	exports.InMemoryCache = InMemoryCache;
}));
//#endregion
//#region node_modules/dataloader/index.js
var require_dataloader = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Copyright (c) 2019-present, GraphQL Foundation
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*
	* 
	*/
	/**
	* A `DataLoader` creates a public API for loading data from a particular
	* data back-end with unique keys such as the `id` column of a SQL table or
	* document name in a MongoDB database, given a batch loading function.
	*
	* Each `DataLoader` instance contains a unique memoized cache. Use caution when
	* used in long-lived applications or those which serve many users with
	* different access permissions and consider creating a new instance per
	* web request.
	*/
	var DataLoader = /* @__PURE__ */ function() {
		function DataLoader(batchLoadFn, options) {
			if (typeof batchLoadFn !== "function") throw new TypeError("DataLoader must be constructed with a function which accepts " + ("Array<key> and returns Promise<Array<value>>, but got: " + batchLoadFn + "."));
			this._batchLoadFn = batchLoadFn;
			this._maxBatchSize = getValidMaxBatchSize(options);
			this._batchScheduleFn = getValidBatchScheduleFn(options);
			this._cacheKeyFn = getValidCacheKeyFn(options);
			this._cacheMap = getValidCacheMap(options);
			this._batch = null;
			this.name = getValidName(options);
		}
		var _proto = DataLoader.prototype;
		/**
		* Loads a key, returning a `Promise` for the value represented by that key.
		*/
		_proto.load = function load(key) {
			if (key === null || key === void 0) throw new TypeError("The loader.load() function must be called with a value, " + ("but got: " + String(key) + "."));
			var batch = getCurrentBatch(this);
			var cacheMap = this._cacheMap;
			var cacheKey;
			if (cacheMap) {
				cacheKey = this._cacheKeyFn(key);
				var cachedPromise = cacheMap.get(cacheKey);
				if (cachedPromise) {
					var cacheHits = batch.cacheHits || (batch.cacheHits = []);
					return new Promise(function(resolve) {
						cacheHits.push(function() {
							resolve(cachedPromise);
						});
					});
				}
			}
			batch.keys.push(key);
			var promise = new Promise(function(resolve, reject) {
				batch.callbacks.push({
					resolve,
					reject
				});
			});
			if (cacheMap) cacheMap.set(cacheKey, promise);
			return promise;
		};
		_proto.loadMany = function loadMany(keys) {
			if (!isArrayLike(keys)) throw new TypeError("The loader.loadMany() function must be called with Array<key> " + ("but got: " + keys + "."));
			var loadPromises = [];
			for (var i = 0; i < keys.length; i++) loadPromises.push(this.load(keys[i])["catch"](function(error) {
				return error;
			}));
			return Promise.all(loadPromises);
		};
		_proto.clear = function clear(key) {
			var cacheMap = this._cacheMap;
			if (cacheMap) {
				var cacheKey = this._cacheKeyFn(key);
				cacheMap["delete"](cacheKey);
			}
			return this;
		};
		_proto.clearAll = function clearAll() {
			var cacheMap = this._cacheMap;
			if (cacheMap) cacheMap.clear();
			return this;
		};
		_proto.prime = function prime(key, value) {
			var cacheMap = this._cacheMap;
			if (cacheMap) {
				var cacheKey = this._cacheKeyFn(key);
				if (cacheMap.get(cacheKey) === void 0) {
					var promise;
					if (value instanceof Error) {
						promise = Promise.reject(value);
						promise["catch"](function() {});
					} else promise = Promise.resolve(value);
					cacheMap.set(cacheKey, promise);
				}
			}
			return this;
		};
		return DataLoader;
	}();
	var enqueuePostPromiseJob = typeof process === "object" && typeof process.nextTick === "function" ? function(fn) {
		if (!resolvedPromise) resolvedPromise = Promise.resolve();
		resolvedPromise.then(function() {
			process.nextTick(fn);
		});
	} : typeof setImmediate === "function" ? function(fn) {
		setImmediate(fn);
	} : function(fn) {
		setTimeout(fn);
	};
	var resolvedPromise;
	function getCurrentBatch(loader) {
		var existingBatch = loader._batch;
		if (existingBatch !== null && !existingBatch.hasDispatched && existingBatch.keys.length < loader._maxBatchSize) return existingBatch;
		var newBatch = {
			hasDispatched: false,
			keys: [],
			callbacks: []
		};
		loader._batch = newBatch;
		loader._batchScheduleFn(function() {
			dispatchBatch(loader, newBatch);
		});
		return newBatch;
	}
	function dispatchBatch(loader, batch) {
		batch.hasDispatched = true;
		if (batch.keys.length === 0) {
			resolveCacheHits(batch);
			return;
		}
		var batchPromise;
		try {
			batchPromise = loader._batchLoadFn(batch.keys);
		} catch (e) {
			return failedDispatch(loader, batch, /* @__PURE__ */ new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function " + ("errored synchronously: " + String(e) + ".")));
		}
		if (!batchPromise || typeof batchPromise.then !== "function") return failedDispatch(loader, batch, /* @__PURE__ */ new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did " + ("not return a Promise: " + String(batchPromise) + ".")));
		batchPromise.then(function(values) {
			if (!isArrayLike(values)) throw new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did " + ("not return a Promise of an Array: " + String(values) + "."));
			if (values.length !== batch.keys.length) throw new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise of an Array of the same length as the Array of keys." + ("\n\nKeys:\n" + String(batch.keys)) + ("\n\nValues:\n" + String(values)));
			resolveCacheHits(batch);
			for (var i = 0; i < batch.callbacks.length; i++) {
				var _value = values[i];
				if (_value instanceof Error) batch.callbacks[i].reject(_value);
				else batch.callbacks[i].resolve(_value);
			}
		})["catch"](function(error) {
			failedDispatch(loader, batch, error);
		});
	}
	function failedDispatch(loader, batch, error) {
		resolveCacheHits(batch);
		for (var i = 0; i < batch.keys.length; i++) {
			loader.clear(batch.keys[i]);
			batch.callbacks[i].reject(error);
		}
	}
	function resolveCacheHits(batch) {
		if (batch.cacheHits) for (var i = 0; i < batch.cacheHits.length; i++) batch.cacheHits[i]();
	}
	function getValidMaxBatchSize(options) {
		if (!(!options || options.batch !== false)) return 1;
		var maxBatchSize = options && options.maxBatchSize;
		if (maxBatchSize === void 0) return Infinity;
		if (typeof maxBatchSize !== "number" || maxBatchSize < 1) throw new TypeError("maxBatchSize must be a positive number: " + maxBatchSize);
		return maxBatchSize;
	}
	function getValidBatchScheduleFn(options) {
		var batchScheduleFn = options && options.batchScheduleFn;
		if (batchScheduleFn === void 0) return enqueuePostPromiseJob;
		if (typeof batchScheduleFn !== "function") throw new TypeError("batchScheduleFn must be a function: " + batchScheduleFn);
		return batchScheduleFn;
	}
	function getValidCacheKeyFn(options) {
		var cacheKeyFn = options && options.cacheKeyFn;
		if (cacheKeyFn === void 0) return function(key) {
			return key;
		};
		if (typeof cacheKeyFn !== "function") throw new TypeError("cacheKeyFn must be a function: " + cacheKeyFn);
		return cacheKeyFn;
	}
	function getValidCacheMap(options) {
		if (!(!options || options.cache !== false)) return null;
		var cacheMap = options && options.cacheMap;
		if (cacheMap === void 0) return /* @__PURE__ */ new Map();
		if (cacheMap !== null) {
			var missingFunctions = [
				"get",
				"set",
				"delete",
				"clear"
			].filter(function(fnName) {
				return cacheMap && typeof cacheMap[fnName] !== "function";
			});
			if (missingFunctions.length !== 0) throw new TypeError("Custom cacheMap missing methods: " + missingFunctions.join(", "));
		}
		return cacheMap;
	}
	function getValidName(options) {
		if (options && options.name) return options.name;
		return null;
	}
	function isArrayLike(x) {
		return typeof x === "object" && x !== null && typeof x.length === "number" && (x.length === 0 || x.length > 0 && Object.prototype.hasOwnProperty.call(x, x.length - 1));
	}
	module.exports = DataLoader;
}));
//#endregion
//#region node_modules/axios/dist/browser/axios.cjs
/*! Axios v1.15.0 Copyright (c) 2026 Matt Zabriskie and contributors */
var require_axios = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Create a bound version of a function with a specified `this` context
	*
	* @param {Function} fn - The function to bind
	* @param {*} thisArg - The value to be passed as the `this` parameter
	* @returns {Function} A new function that will call the original function with the specified `this` context
	*/
	function bind(fn, thisArg) {
		return function wrap() {
			return fn.apply(thisArg, arguments);
		};
	}
	var { toString } = Object.prototype;
	var { getPrototypeOf } = Object;
	var { iterator, toStringTag } = Symbol;
	var kindOf = ((cache) => (thing) => {
		const str = toString.call(thing);
		return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
	})(Object.create(null));
	var kindOfTest = (type) => {
		type = type.toLowerCase();
		return (thing) => kindOf(thing) === type;
	};
	var typeOfTest = (type) => (thing) => typeof thing === type;
	/**
	* Determine if a value is a non-null object
	*
	* @param {Object} val The value to test
	*
	* @returns {boolean} True if value is an Array, otherwise false
	*/
	var { isArray } = Array;
	/**
	* Determine if a value is undefined
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if the value is undefined, otherwise false
	*/
	var isUndefined = typeOfTest("undefined");
	/**
	* Determine if a value is a Buffer
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a Buffer, otherwise false
	*/
	function isBuffer(val) {
		return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
	}
	/**
	* Determine if a value is an ArrayBuffer
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is an ArrayBuffer, otherwise false
	*/
	var isArrayBuffer = kindOfTest("ArrayBuffer");
	/**
	* Determine if a value is a view on an ArrayBuffer
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	*/
	function isArrayBufferView(val) {
		let result;
		if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) result = ArrayBuffer.isView(val);
		else result = val && val.buffer && isArrayBuffer(val.buffer);
		return result;
	}
	/**
	* Determine if a value is a String
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a String, otherwise false
	*/
	var isString = typeOfTest("string");
	/**
	* Determine if a value is a Function
	*
	* @param {*} val The value to test
	* @returns {boolean} True if value is a Function, otherwise false
	*/
	var isFunction$1 = typeOfTest("function");
	/**
	* Determine if a value is a Number
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a Number, otherwise false
	*/
	var isNumber = typeOfTest("number");
	/**
	* Determine if a value is an Object
	*
	* @param {*} thing The value to test
	*
	* @returns {boolean} True if value is an Object, otherwise false
	*/
	var isObject = (thing) => thing !== null && typeof thing === "object";
	/**
	* Determine if a value is a Boolean
	*
	* @param {*} thing The value to test
	* @returns {boolean} True if value is a Boolean, otherwise false
	*/
	var isBoolean = (thing) => thing === true || thing === false;
	/**
	* Determine if a value is a plain Object
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a plain Object, otherwise false
	*/
	var isPlainObject = (val) => {
		if (kindOf(val) !== "object") return false;
		const prototype = getPrototypeOf(val);
		return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
	};
	/**
	* Determine if a value is an empty object (safely handles Buffers)
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is an empty object, otherwise false
	*/
	var isEmptyObject = (val) => {
		if (!isObject(val) || isBuffer(val)) return false;
		try {
			return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
		} catch (e) {
			return false;
		}
	};
	/**
	* Determine if a value is a Date
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a Date, otherwise false
	*/
	var isDate = kindOfTest("Date");
	/**
	* Determine if a value is a File
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a File, otherwise false
	*/
	var isFile = kindOfTest("File");
	/**
	* Determine if a value is a React Native Blob
	* React Native "blob": an object with a `uri` attribute. Optionally, it can
	* also have a `name` and `type` attribute to specify filename and content type
	*
	* @see https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Network/FormData.js#L68-L71
	* 
	* @param {*} value The value to test
	* 
	* @returns {boolean} True if value is a React Native Blob, otherwise false
	*/
	var isReactNativeBlob = (value) => {
		return !!(value && typeof value.uri !== "undefined");
	};
	/**
	* Determine if environment is React Native
	* ReactNative `FormData` has a non-standard `getParts()` method
	* 
	* @param {*} formData The formData to test
	* 
	* @returns {boolean} True if environment is React Native, otherwise false
	*/
	var isReactNative = (formData) => formData && typeof formData.getParts !== "undefined";
	/**
	* Determine if a value is a Blob
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a Blob, otherwise false
	*/
	var isBlob = kindOfTest("Blob");
	/**
	* Determine if a value is a FileList
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a File, otherwise false
	*/
	var isFileList = kindOfTest("FileList");
	/**
	* Determine if a value is a Stream
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a Stream, otherwise false
	*/
	var isStream = (val) => isObject(val) && isFunction$1(val.pipe);
	/**
	* Determine if a value is a FormData
	*
	* @param {*} thing The value to test
	*
	* @returns {boolean} True if value is an FormData, otherwise false
	*/
	function getGlobal() {
		if (typeof globalThis !== "undefined") return globalThis;
		if (typeof self !== "undefined") return self;
		if (typeof window !== "undefined") return window;
		if (typeof global !== "undefined") return global;
		return {};
	}
	var G = getGlobal();
	var FormDataCtor = typeof G.FormData !== "undefined" ? G.FormData : void 0;
	var isFormData = (thing) => {
		let kind;
		return thing && (FormDataCtor && thing instanceof FormDataCtor || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
	};
	/**
	* Determine if a value is a URLSearchParams object
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a URLSearchParams object, otherwise false
	*/
	var isURLSearchParams = kindOfTest("URLSearchParams");
	var [isReadableStream, isRequest, isResponse, isHeaders] = [
		"ReadableStream",
		"Request",
		"Response",
		"Headers"
	].map(kindOfTest);
	/**
	* Trim excess whitespace off the beginning and end of a string
	*
	* @param {String} str The String to trim
	*
	* @returns {String} The String freed of excess whitespace
	*/
	var trim = (str) => {
		return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};
	/**
	* Iterate over an Array or an Object invoking a function for each item.
	*
	* If `obj` is an Array callback will be called passing
	* the value, index, and complete array for each item.
	*
	* If 'obj' is an Object callback will be called passing
	* the value, key, and complete object for each property.
	*
	* @param {Object|Array<unknown>} obj The object to iterate
	* @param {Function} fn The callback to invoke for each item
	*
	* @param {Object} [options]
	* @param {Boolean} [options.allOwnKeys = false]
	* @returns {any}
	*/
	function forEach(obj, fn, { allOwnKeys = false } = {}) {
		if (obj === null || typeof obj === "undefined") return;
		let i;
		let l;
		if (typeof obj !== "object") obj = [obj];
		if (isArray(obj)) for (i = 0, l = obj.length; i < l; i++) fn.call(null, obj[i], i, obj);
		else {
			if (isBuffer(obj)) return;
			const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
			const len = keys.length;
			let key;
			for (i = 0; i < len; i++) {
				key = keys[i];
				fn.call(null, obj[key], key, obj);
			}
		}
	}
	/**
	* Finds a key in an object, case-insensitive, returning the actual key name.
	* Returns null if the object is a Buffer or if no match is found.
	*
	* @param {Object} obj - The object to search.
	* @param {string} key - The key to find (case-insensitive).
	* @returns {?string} The actual key name if found, otherwise null.
	*/
	function findKey(obj, key) {
		if (isBuffer(obj)) return null;
		key = key.toLowerCase();
		const keys = Object.keys(obj);
		let i = keys.length;
		let _key;
		while (i-- > 0) {
			_key = keys[i];
			if (key === _key.toLowerCase()) return _key;
		}
		return null;
	}
	var _global = (() => {
		if (typeof globalThis !== "undefined") return globalThis;
		return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
	})();
	var isContextDefined = (context) => !isUndefined(context) && context !== _global;
	/**
	* Accepts varargs expecting each argument to be an object, then
	* immutably merges the properties of each object and returns result.
	*
	* When multiple objects contain the same key the later object in
	* the arguments list will take precedence.
	*
	* Example:
	*
	* ```js
	* const result = merge({foo: 123}, {foo: 456});
	* console.log(result.foo); // outputs 456
	* ```
	*
	* @param {Object} obj1 Object to merge
	*
	* @returns {Object} Result of all merge properties
	*/
	function merge() {
		const { caseless, skipUndefined } = isContextDefined(this) && this || {};
		const result = {};
		const assignValue = (val, key) => {
			if (key === "__proto__" || key === "constructor" || key === "prototype") return;
			const targetKey = caseless && findKey(result, key) || key;
			if (isPlainObject(result[targetKey]) && isPlainObject(val)) result[targetKey] = merge(result[targetKey], val);
			else if (isPlainObject(val)) result[targetKey] = merge({}, val);
			else if (isArray(val)) result[targetKey] = val.slice();
			else if (!skipUndefined || !isUndefined(val)) result[targetKey] = val;
		};
		for (let i = 0, l = arguments.length; i < l; i++) arguments[i] && forEach(arguments[i], assignValue);
		return result;
	}
	/**
	* Extends object a by mutably adding to it the properties of object b.
	*
	* @param {Object} a The object to be extended
	* @param {Object} b The object to copy properties from
	* @param {Object} thisArg The object to bind function to
	*
	* @param {Object} [options]
	* @param {Boolean} [options.allOwnKeys]
	* @returns {Object} The resulting value of object a
	*/
	var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
		forEach(b, (val, key) => {
			if (thisArg && isFunction$1(val)) Object.defineProperty(a, key, {
				value: bind(val, thisArg),
				writable: true,
				enumerable: true,
				configurable: true
			});
			else Object.defineProperty(a, key, {
				value: val,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}, { allOwnKeys });
		return a;
	};
	/**
	* Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	*
	* @param {string} content with BOM
	*
	* @returns {string} content value without BOM
	*/
	var stripBOM = (content) => {
		if (content.charCodeAt(0) === 65279) content = content.slice(1);
		return content;
	};
	/**
	* Inherit the prototype methods from one constructor into another
	* @param {function} constructor
	* @param {function} superConstructor
	* @param {object} [props]
	* @param {object} [descriptors]
	*
	* @returns {void}
	*/
	var inherits = (constructor, superConstructor, props, descriptors) => {
		constructor.prototype = Object.create(superConstructor.prototype, descriptors);
		Object.defineProperty(constructor.prototype, "constructor", {
			value: constructor,
			writable: true,
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(constructor, "super", { value: superConstructor.prototype });
		props && Object.assign(constructor.prototype, props);
	};
	/**
	* Resolve object with deep prototype chain to a flat object
	* @param {Object} sourceObj source object
	* @param {Object} [destObj]
	* @param {Function|Boolean} [filter]
	* @param {Function} [propFilter]
	*
	* @returns {Object}
	*/
	var toFlatObject = (sourceObj, destObj, filter, propFilter) => {
		let props;
		let i;
		let prop;
		const merged = {};
		destObj = destObj || {};
		if (sourceObj == null) return destObj;
		do {
			props = Object.getOwnPropertyNames(sourceObj);
			i = props.length;
			while (i-- > 0) {
				prop = props[i];
				if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
					destObj[prop] = sourceObj[prop];
					merged[prop] = true;
				}
			}
			sourceObj = filter !== false && getPrototypeOf(sourceObj);
		} while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
		return destObj;
	};
	/**
	* Determines whether a string ends with the characters of a specified string
	*
	* @param {String} str
	* @param {String} searchString
	* @param {Number} [position= 0]
	*
	* @returns {boolean}
	*/
	var endsWith = (str, searchString, position) => {
		str = String(str);
		if (position === void 0 || position > str.length) position = str.length;
		position -= searchString.length;
		const lastIndex = str.indexOf(searchString, position);
		return lastIndex !== -1 && lastIndex === position;
	};
	/**
	* Returns new array from array like object or null if failed
	*
	* @param {*} [thing]
	*
	* @returns {?Array}
	*/
	var toArray = (thing) => {
		if (!thing) return null;
		if (isArray(thing)) return thing;
		let i = thing.length;
		if (!isNumber(i)) return null;
		const arr = new Array(i);
		while (i-- > 0) arr[i] = thing[i];
		return arr;
	};
	/**
	* Checking if the Uint8Array exists and if it does, it returns a function that checks if the
	* thing passed in is an instance of Uint8Array
	*
	* @param {TypedArray}
	*
	* @returns {Array}
	*/
	var isTypedArray = ((TypedArray) => {
		return (thing) => {
			return TypedArray && thing instanceof TypedArray;
		};
	})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
	/**
	* For each entry in the object, call the function with the key and value.
	*
	* @param {Object<any, any>} obj - The object to iterate over.
	* @param {Function} fn - The function to call for each entry.
	*
	* @returns {void}
	*/
	var forEachEntry = (obj, fn) => {
		const _iterator = (obj && obj[iterator]).call(obj);
		let result;
		while ((result = _iterator.next()) && !result.done) {
			const pair = result.value;
			fn.call(obj, pair[0], pair[1]);
		}
	};
	/**
	* It takes a regular expression and a string, and returns an array of all the matches
	*
	* @param {string} regExp - The regular expression to match against.
	* @param {string} str - The string to search.
	*
	* @returns {Array<boolean>}
	*/
	var matchAll = (regExp, str) => {
		let matches;
		const arr = [];
		while ((matches = regExp.exec(str)) !== null) arr.push(matches);
		return arr;
	};
	var isHTMLForm = kindOfTest("HTMLFormElement");
	var toCamelCase = (str) => {
		return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
			return p1.toUpperCase() + p2;
		});
	};
	var hasOwnProperty = (({ hasOwnProperty }) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);
	/**
	* Determine if a value is a RegExp object
	*
	* @param {*} val The value to test
	*
	* @returns {boolean} True if value is a RegExp object, otherwise false
	*/
	var isRegExp = kindOfTest("RegExp");
	var reduceDescriptors = (obj, reducer) => {
		const descriptors = Object.getOwnPropertyDescriptors(obj);
		const reducedDescriptors = {};
		forEach(descriptors, (descriptor, name) => {
			let ret;
			if ((ret = reducer(descriptor, name, obj)) !== false) reducedDescriptors[name] = ret || descriptor;
		});
		Object.defineProperties(obj, reducedDescriptors);
	};
	/**
	* Makes all methods read-only
	* @param {Object} obj
	*/
	var freezeMethods = (obj) => {
		reduceDescriptors(obj, (descriptor, name) => {
			if (isFunction$1(obj) && [
				"arguments",
				"caller",
				"callee"
			].indexOf(name) !== -1) return false;
			const value = obj[name];
			if (!isFunction$1(value)) return;
			descriptor.enumerable = false;
			if ("writable" in descriptor) {
				descriptor.writable = false;
				return;
			}
			if (!descriptor.set) descriptor.set = () => {
				throw Error("Can not rewrite read-only method '" + name + "'");
			};
		});
	};
	/**
	* Converts an array or a delimited string into an object set with values as keys and true as values.
	* Useful for fast membership checks.
	*
	* @param {Array|string} arrayOrString - The array or string to convert.
	* @param {string} delimiter - The delimiter to use if input is a string.
	* @returns {Object} An object with keys from the array or string, values set to true.
	*/
	var toObjectSet = (arrayOrString, delimiter) => {
		const obj = {};
		const define = (arr) => {
			arr.forEach((value) => {
				obj[value] = true;
			});
		};
		isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
		return obj;
	};
	var noop = () => {};
	var toFiniteNumber = (value, defaultValue) => {
		return value != null && Number.isFinite(value = +value) ? value : defaultValue;
	};
	/**
	* If the thing is a FormData object, return true, otherwise return false.
	*
	* @param {unknown} thing - The thing to check.
	*
	* @returns {boolean}
	*/
	function isSpecCompliantForm(thing) {
		return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
	}
	/**
	* Recursively converts an object to a JSON-compatible object, handling circular references and Buffers.
	*
	* @param {Object} obj - The object to convert.
	* @returns {Object} The JSON-compatible object.
	*/
	var toJSONObject = (obj) => {
		const stack = new Array(10);
		const visit = (source, i) => {
			if (isObject(source)) {
				if (stack.indexOf(source) >= 0) return;
				if (isBuffer(source)) return source;
				if (!("toJSON" in source)) {
					stack[i] = source;
					const target = isArray(source) ? [] : {};
					forEach(source, (value, key) => {
						const reducedValue = visit(value, i + 1);
						!isUndefined(reducedValue) && (target[key] = reducedValue);
					});
					stack[i] = void 0;
					return target;
				}
			}
			return source;
		};
		return visit(obj, 0);
	};
	/**
	* Determines if a value is an async function.
	*
	* @param {*} thing - The value to test.
	* @returns {boolean} True if value is an async function, otherwise false.
	*/
	var isAsyncFn = kindOfTest("AsyncFunction");
	/**
	* Determines if a value is thenable (has then and catch methods).
	*
	* @param {*} thing - The value to test.
	* @returns {boolean} True if value is thenable, otherwise false.
	*/
	var isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
	/**
	* Provides a cross-platform setImmediate implementation.
	* Uses native setImmediate if available, otherwise falls back to postMessage or setTimeout.
	*
	* @param {boolean} setImmediateSupported - Whether setImmediate is supported.
	* @param {boolean} postMessageSupported - Whether postMessage is supported.
	* @returns {Function} A function to schedule a callback asynchronously.
	*/
	var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
		if (setImmediateSupported) return setImmediate;
		return postMessageSupported ? ((token, callbacks) => {
			_global.addEventListener("message", ({ source, data }) => {
				if (source === _global && data === token) callbacks.length && callbacks.shift()();
			}, false);
			return (cb) => {
				callbacks.push(cb);
				_global.postMessage(token, "*");
			};
		})(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
	})(typeof setImmediate === "function", isFunction$1(_global.postMessage));
	/**
	* Schedules a microtask or asynchronous callback as soon as possible.
	* Uses queueMicrotask if available, otherwise falls back to process.nextTick or _setImmediate.
	*
	* @type {Function}
	*/
	var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
	var isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
	var utils$1 = {
		isArray,
		isArrayBuffer,
		isBuffer,
		isFormData,
		isArrayBufferView,
		isString,
		isNumber,
		isBoolean,
		isObject,
		isPlainObject,
		isEmptyObject,
		isReadableStream,
		isRequest,
		isResponse,
		isHeaders,
		isUndefined,
		isDate,
		isFile,
		isReactNativeBlob,
		isReactNative,
		isBlob,
		isRegExp,
		isFunction: isFunction$1,
		isStream,
		isURLSearchParams,
		isTypedArray,
		isFileList,
		forEach,
		merge,
		extend,
		trim,
		stripBOM,
		inherits,
		toFlatObject,
		kindOf,
		kindOfTest,
		endsWith,
		toArray,
		forEachEntry,
		matchAll,
		isHTMLForm,
		hasOwnProperty,
		hasOwnProp: hasOwnProperty,
		reduceDescriptors,
		freezeMethods,
		toObjectSet,
		toCamelCase,
		noop,
		toFiniteNumber,
		findKey,
		global: _global,
		isContextDefined,
		isSpecCompliantForm,
		toJSONObject,
		isAsyncFn,
		isThenable,
		setImmediate: _setImmediate,
		asap,
		isIterable
	};
	var AxiosError = class AxiosError extends Error {
		static from(error, code, config, request, response, customProps) {
			const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
			axiosError.cause = error;
			axiosError.name = error.name;
			if (error.status != null && axiosError.status == null) axiosError.status = error.status;
			customProps && Object.assign(axiosError, customProps);
			return axiosError;
		}
		/**
		* Create an Error with the specified message, config, error code, request and response.
		*
		* @param {string} message The error message.
		* @param {string} [code] The error code (for example, 'ECONNABORTED').
		* @param {Object} [config] The config.
		* @param {Object} [request] The request.
		* @param {Object} [response] The response.
		*
		* @returns {Error} The created error.
		*/
		constructor(message, code, config, request, response) {
			super(message);
			Object.defineProperty(this, "message", {
				value: message,
				enumerable: true,
				writable: true,
				configurable: true
			});
			this.name = "AxiosError";
			this.isAxiosError = true;
			code && (this.code = code);
			config && (this.config = config);
			request && (this.request = request);
			if (response) {
				this.response = response;
				this.status = response.status;
			}
		}
		toJSON() {
			return {
				message: this.message,
				name: this.name,
				description: this.description,
				number: this.number,
				fileName: this.fileName,
				lineNumber: this.lineNumber,
				columnNumber: this.columnNumber,
				stack: this.stack,
				config: utils$1.toJSONObject(this.config),
				code: this.code,
				status: this.status
			};
		}
	};
	AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
	AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
	AxiosError.ECONNABORTED = "ECONNABORTED";
	AxiosError.ETIMEDOUT = "ETIMEDOUT";
	AxiosError.ERR_NETWORK = "ERR_NETWORK";
	AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
	AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
	AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
	AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
	AxiosError.ERR_CANCELED = "ERR_CANCELED";
	AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
	AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
	var httpAdapter = null;
	/**
	* Determines if the given thing is a array or js object.
	*
	* @param {string} thing - The object or array to be visited.
	*
	* @returns {boolean}
	*/
	function isVisitable(thing) {
		return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
	}
	/**
	* It removes the brackets from the end of a string
	*
	* @param {string} key - The key of the parameter.
	*
	* @returns {string} the key without the brackets.
	*/
	function removeBrackets(key) {
		return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
	}
	/**
	* It takes a path, a key, and a boolean, and returns a string
	*
	* @param {string} path - The path to the current key.
	* @param {string} key - The key of the current object being iterated over.
	* @param {string} dots - If true, the key will be rendered with dots instead of brackets.
	*
	* @returns {string} The path to the current key.
	*/
	function renderKey(path, key, dots) {
		if (!path) return key;
		return path.concat(key).map(function each(token, i) {
			token = removeBrackets(token);
			return !dots && i ? "[" + token + "]" : token;
		}).join(dots ? "." : "");
	}
	/**
	* If the array is an array and none of its elements are visitable, then it's a flat array.
	*
	* @param {Array<any>} arr - The array to check
	*
	* @returns {boolean}
	*/
	function isFlatArray(arr) {
		return utils$1.isArray(arr) && !arr.some(isVisitable);
	}
	var predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
		return /^is[A-Z]/.test(prop);
	});
	/**
	* Convert a data object to FormData
	*
	* @param {Object} obj
	* @param {?Object} [formData]
	* @param {?Object} [options]
	* @param {Function} [options.visitor]
	* @param {Boolean} [options.metaTokens = true]
	* @param {Boolean} [options.dots = false]
	* @param {?Boolean} [options.indexes = false]
	*
	* @returns {Object}
	**/
	/**
	* It converts an object into a FormData object
	*
	* @param {Object<any, any>} obj - The object to convert to form data.
	* @param {string} formData - The FormData object to append to.
	* @param {Object<string, any>} options
	*
	* @returns
	*/
	function toFormData(obj, formData, options) {
		if (!utils$1.isObject(obj)) throw new TypeError("target must be an object");
		formData = formData || new FormData();
		options = utils$1.toFlatObject(options, {
			metaTokens: true,
			dots: false,
			indexes: false
		}, false, function defined(option, source) {
			return !utils$1.isUndefined(source[option]);
		});
		const metaTokens = options.metaTokens;
		const visitor = options.visitor || defaultVisitor;
		const dots = options.dots;
		const indexes = options.indexes;
		const useBlob = (options.Blob || typeof Blob !== "undefined" && Blob) && utils$1.isSpecCompliantForm(formData);
		if (!utils$1.isFunction(visitor)) throw new TypeError("visitor must be a function");
		function convertValue(value) {
			if (value === null) return "";
			if (utils$1.isDate(value)) return value.toISOString();
			if (utils$1.isBoolean(value)) return value.toString();
			if (!useBlob && utils$1.isBlob(value)) throw new AxiosError("Blob is not supported. Use a Buffer instead.");
			if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
			return value;
		}
		/**
		* Default visitor.
		*
		* @param {*} value
		* @param {String|Number} key
		* @param {Array<String|Number>} path
		* @this {FormData}
		*
		* @returns {boolean} return true to visit the each prop of the value recursively
		*/
		function defaultVisitor(value, key, path) {
			let arr = value;
			if (utils$1.isReactNative(formData) && utils$1.isReactNativeBlob(value)) {
				formData.append(renderKey(path, key, dots), convertValue(value));
				return false;
			}
			if (value && !path && typeof value === "object") {
				if (utils$1.endsWith(key, "{}")) {
					key = metaTokens ? key : key.slice(0, -2);
					value = JSON.stringify(value);
				} else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
					key = removeBrackets(key);
					arr.forEach(function each(el, index) {
						!(utils$1.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
					});
					return false;
				}
			}
			if (isVisitable(value)) return true;
			formData.append(renderKey(path, key, dots), convertValue(value));
			return false;
		}
		const stack = [];
		const exposedHelpers = Object.assign(predicates, {
			defaultVisitor,
			convertValue,
			isVisitable
		});
		function build(value, path) {
			if (utils$1.isUndefined(value)) return;
			if (stack.indexOf(value) !== -1) throw Error("Circular reference detected in " + path.join("."));
			stack.push(value);
			utils$1.forEach(value, function each(el, key) {
				if ((!(utils$1.isUndefined(el) || el === null) && visitor.call(formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers)) === true) build(el, path ? path.concat(key) : [key]);
			});
			stack.pop();
		}
		if (!utils$1.isObject(obj)) throw new TypeError("data must be an object");
		build(obj);
		return formData;
	}
	/**
	* It encodes a string by replacing all characters that are not in the unreserved set with
	* their percent-encoded equivalents
	*
	* @param {string} str - The string to encode.
	*
	* @returns {string} The encoded string.
	*/
	function encode$1(str) {
		const charMap = {
			"!": "%21",
			"'": "%27",
			"(": "%28",
			")": "%29",
			"~": "%7E",
			"%20": "+",
			"%00": "\0"
		};
		return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
			return charMap[match];
		});
	}
	/**
	* It takes a params object and converts it to a FormData object
	*
	* @param {Object<string, any>} params - The parameters to be converted to a FormData object.
	* @param {Object<string, any>} options - The options object passed to the Axios constructor.
	*
	* @returns {void}
	*/
	function AxiosURLSearchParams(params, options) {
		this._pairs = [];
		params && toFormData(params, this, options);
	}
	var prototype = AxiosURLSearchParams.prototype;
	prototype.append = function append(name, value) {
		this._pairs.push([name, value]);
	};
	prototype.toString = function toString(encoder) {
		const _encode = encoder ? function(value) {
			return encoder.call(this, value, encode$1);
		} : encode$1;
		return this._pairs.map(function each(pair) {
			return _encode(pair[0]) + "=" + _encode(pair[1]);
		}, "").join("&");
	};
	/**
	* It replaces URL-encoded forms of `:`, `$`, `,`, and spaces with
	* their plain counterparts (`:`, `$`, `,`, `+`).
	*
	* @param {string} val The value to be encoded.
	*
	* @returns {string} The encoded value.
	*/
	function encode(val) {
		return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
	}
	/**
	* Build a URL by appending params to the end
	*
	* @param {string} url The base of the url (e.g., http://www.google.com)
	* @param {object} [params] The params to be appended
	* @param {?(object|Function)} options
	*
	* @returns {string} The formatted url
	*/
	function buildURL(url, params, options) {
		if (!params) return url;
		const _encode = options && options.encode || encode;
		const _options = utils$1.isFunction(options) ? { serialize: options } : options;
		const serializeFn = _options && _options.serialize;
		let serializedParams;
		if (serializeFn) serializedParams = serializeFn(params, _options);
		else serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, _options).toString(_encode);
		if (serializedParams) {
			const hashmarkIndex = url.indexOf("#");
			if (hashmarkIndex !== -1) url = url.slice(0, hashmarkIndex);
			url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
		}
		return url;
	}
	var InterceptorManager = class {
		constructor() {
			this.handlers = [];
		}
		/**
		* Add a new interceptor to the stack
		*
		* @param {Function} fulfilled The function to handle `then` for a `Promise`
		* @param {Function} rejected The function to handle `reject` for a `Promise`
		* @param {Object} options The options for the interceptor, synchronous and runWhen
		*
		* @return {Number} An ID used to remove interceptor later
		*/
		use(fulfilled, rejected, options) {
			this.handlers.push({
				fulfilled,
				rejected,
				synchronous: options ? options.synchronous : false,
				runWhen: options ? options.runWhen : null
			});
			return this.handlers.length - 1;
		}
		/**
		* Remove an interceptor from the stack
		*
		* @param {Number} id The ID that was returned by `use`
		*
		* @returns {void}
		*/
		eject(id) {
			if (this.handlers[id]) this.handlers[id] = null;
		}
		/**
		* Clear all interceptors from the stack
		*
		* @returns {void}
		*/
		clear() {
			if (this.handlers) this.handlers = [];
		}
		/**
		* Iterate over all the registered interceptors
		*
		* This method is particularly useful for skipping over any
		* interceptors that may have become `null` calling `eject`.
		*
		* @param {Function} fn The function to call for each interceptor
		*
		* @returns {void}
		*/
		forEach(fn) {
			utils$1.forEach(this.handlers, function forEachHandler(h) {
				if (h !== null) fn(h);
			});
		}
	};
	var transitionalDefaults = {
		silentJSONParsing: true,
		forcedJSONParsing: true,
		clarifyTimeoutError: false,
		legacyInterceptorReqResOrdering: true
	};
	var platform$1 = {
		isBrowser: true,
		classes: {
			URLSearchParams: typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams,
			FormData: typeof FormData !== "undefined" ? FormData : null,
			Blob: typeof Blob !== "undefined" ? Blob : null
		},
		protocols: [
			"http",
			"https",
			"file",
			"blob",
			"url",
			"data"
		]
	};
	var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
	var _navigator = typeof navigator === "object" && navigator || void 0;
	/**
	* Determine if we're running in a standard browser environment
	*
	* This allows axios to run in a web worker, and react-native.
	* Both environments support XMLHttpRequest, but not fully standard globals.
	*
	* web workers:
	*  typeof window -> undefined
	*  typeof document -> undefined
	*
	* react-native:
	*  navigator.product -> 'ReactNative'
	* nativescript
	*  navigator.product -> 'NativeScript' or 'NS'
	*
	* @returns {boolean}
	*/
	var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || [
		"ReactNative",
		"NativeScript",
		"NS"
	].indexOf(_navigator.product) < 0);
	/**
	* Determine if we're running in a standard browser webWorker environment
	*
	* Although the `isStandardBrowserEnv` method indicates that
	* `allows axios to run in a web worker`, the WebWorker will still be
	* filtered out due to its judgment standard
	* `typeof window !== 'undefined' && typeof document !== 'undefined'`.
	* This leads to a problem when axios post `FormData` in webWorker
	*/
	var hasStandardBrowserWebWorkerEnv = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
	var origin = hasBrowserEnv && window.location.href || "http://localhost";
	var platform = {
		.../* @__PURE__ */ Object.freeze({
			__proto__: null,
			hasBrowserEnv,
			hasStandardBrowserEnv,
			hasStandardBrowserWebWorkerEnv,
			navigator: _navigator,
			origin
		}),
		...platform$1
	};
	function toURLEncodedForm(data, options) {
		return toFormData(data, new platform.classes.URLSearchParams(), {
			visitor: function(value, key, path, helpers) {
				if (platform.isNode && utils$1.isBuffer(value)) {
					this.append(key, value.toString("base64"));
					return false;
				}
				return helpers.defaultVisitor.apply(this, arguments);
			},
			...options
		});
	}
	/**
	* It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
	*
	* @param {string} name - The name of the property to get.
	*
	* @returns An array of strings.
	*/
	function parsePropPath(name) {
		return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
			return match[0] === "[]" ? "" : match[1] || match[0];
		});
	}
	/**
	* Convert an array to an object.
	*
	* @param {Array<any>} arr - The array to convert to an object.
	*
	* @returns An object with the same keys and values as the array.
	*/
	function arrayToObject(arr) {
		const obj = {};
		const keys = Object.keys(arr);
		let i;
		const len = keys.length;
		let key;
		for (i = 0; i < len; i++) {
			key = keys[i];
			obj[key] = arr[key];
		}
		return obj;
	}
	/**
	* It takes a FormData object and returns a JavaScript object
	*
	* @param {string} formData The FormData object to convert to JSON.
	*
	* @returns {Object<string, any> | null} The converted object.
	*/
	function formDataToJSON(formData) {
		function buildPath(path, value, target, index) {
			let name = path[index++];
			if (name === "__proto__") return true;
			const isNumericKey = Number.isFinite(+name);
			const isLast = index >= path.length;
			name = !name && utils$1.isArray(target) ? target.length : name;
			if (isLast) {
				if (utils$1.hasOwnProp(target, name)) target[name] = [target[name], value];
				else target[name] = value;
				return !isNumericKey;
			}
			if (!target[name] || !utils$1.isObject(target[name])) target[name] = [];
			if (buildPath(path, value, target[name], index) && utils$1.isArray(target[name])) target[name] = arrayToObject(target[name]);
			return !isNumericKey;
		}
		if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
			const obj = {};
			utils$1.forEachEntry(formData, (name, value) => {
				buildPath(parsePropPath(name), value, obj, 0);
			});
			return obj;
		}
		return null;
	}
	/**
	* It takes a string, tries to parse it, and if it fails, it returns the stringified version
	* of the input
	*
	* @param {any} rawValue - The value to be stringified.
	* @param {Function} parser - A function that parses a string into a JavaScript object.
	* @param {Function} encoder - A function that takes a value and returns a string.
	*
	* @returns {string} A stringified version of the rawValue.
	*/
	function stringifySafely(rawValue, parser, encoder) {
		if (utils$1.isString(rawValue)) try {
			(parser || JSON.parse)(rawValue);
			return utils$1.trim(rawValue);
		} catch (e) {
			if (e.name !== "SyntaxError") throw e;
		}
		return (encoder || JSON.stringify)(rawValue);
	}
	var defaults = {
		transitional: transitionalDefaults,
		adapter: [
			"xhr",
			"http",
			"fetch"
		],
		transformRequest: [function transformRequest(data, headers) {
			const contentType = headers.getContentType() || "";
			const hasJSONContentType = contentType.indexOf("application/json") > -1;
			const isObjectPayload = utils$1.isObject(data);
			if (isObjectPayload && utils$1.isHTMLForm(data)) data = new FormData(data);
			if (utils$1.isFormData(data)) return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
			if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) return data;
			if (utils$1.isArrayBufferView(data)) return data.buffer;
			if (utils$1.isURLSearchParams(data)) {
				headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
				return data.toString();
			}
			let isFileList;
			if (isObjectPayload) {
				if (contentType.indexOf("application/x-www-form-urlencoded") > -1) return toURLEncodedForm(data, this.formSerializer).toString();
				if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
					const _FormData = this.env && this.env.FormData;
					return toFormData(isFileList ? { "files[]": data } : data, _FormData && new _FormData(), this.formSerializer);
				}
			}
			if (isObjectPayload || hasJSONContentType) {
				headers.setContentType("application/json", false);
				return stringifySafely(data);
			}
			return data;
		}],
		transformResponse: [function transformResponse(data) {
			const transitional = this.transitional || defaults.transitional;
			const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
			const JSONRequested = this.responseType === "json";
			if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) return data;
			if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
				const strictJSONParsing = !(transitional && transitional.silentJSONParsing) && JSONRequested;
				try {
					return JSON.parse(data, this.parseReviver);
				} catch (e) {
					if (strictJSONParsing) {
						if (e.name === "SyntaxError") throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
						throw e;
					}
				}
			}
			return data;
		}],
		/**
		* A timeout in milliseconds to abort a request. If set to 0 (default) a
		* timeout is not created.
		*/
		timeout: 0,
		xsrfCookieName: "XSRF-TOKEN",
		xsrfHeaderName: "X-XSRF-TOKEN",
		maxContentLength: -1,
		maxBodyLength: -1,
		env: {
			FormData: platform.classes.FormData,
			Blob: platform.classes.Blob
		},
		validateStatus: function validateStatus(status) {
			return status >= 200 && status < 300;
		},
		headers: { common: {
			Accept: "application/json, text/plain, */*",
			"Content-Type": void 0
		} }
	};
	utils$1.forEach([
		"delete",
		"get",
		"head",
		"post",
		"put",
		"patch"
	], (method) => {
		defaults.headers[method] = {};
	});
	var ignoreDuplicateOf = utils$1.toObjectSet([
		"age",
		"authorization",
		"content-length",
		"content-type",
		"etag",
		"expires",
		"from",
		"host",
		"if-modified-since",
		"if-unmodified-since",
		"last-modified",
		"location",
		"max-forwards",
		"proxy-authorization",
		"referer",
		"retry-after",
		"user-agent"
	]);
	/**
	* Parse headers into an object
	*
	* ```
	* Date: Wed, 27 Aug 2014 08:58:49 GMT
	* Content-Type: application/json
	* Connection: keep-alive
	* Transfer-Encoding: chunked
	* ```
	*
	* @param {String} rawHeaders Headers needing to be parsed
	*
	* @returns {Object} Headers parsed into an object
	*/
	var parseHeaders = (rawHeaders) => {
		const parsed = {};
		let key;
		let val;
		let i;
		rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
			i = line.indexOf(":");
			key = line.substring(0, i).trim().toLowerCase();
			val = line.substring(i + 1).trim();
			if (!key || parsed[key] && ignoreDuplicateOf[key]) return;
			if (key === "set-cookie") if (parsed[key]) parsed[key].push(val);
			else parsed[key] = [val];
			else parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
		});
		return parsed;
	};
	var $internals = Symbol("internals");
	var isValidHeaderValue = (value) => !/[\r\n]/.test(value);
	function assertValidHeaderValue(value, header) {
		if (value === false || value == null) return;
		if (utils$1.isArray(value)) {
			value.forEach((v) => assertValidHeaderValue(v, header));
			return;
		}
		if (!isValidHeaderValue(String(value))) throw new Error(`Invalid character in header content ["${header}"]`);
	}
	function normalizeHeader(header) {
		return header && String(header).trim().toLowerCase();
	}
	function stripTrailingCRLF(str) {
		let end = str.length;
		while (end > 0) {
			const charCode = str.charCodeAt(end - 1);
			if (charCode !== 10 && charCode !== 13) break;
			end -= 1;
		}
		return end === str.length ? str : str.slice(0, end);
	}
	function normalizeValue(value) {
		if (value === false || value == null) return value;
		return utils$1.isArray(value) ? value.map(normalizeValue) : stripTrailingCRLF(String(value));
	}
	function parseTokens(str) {
		const tokens = Object.create(null);
		const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
		let match;
		while (match = tokensRE.exec(str)) tokens[match[1]] = match[2];
		return tokens;
	}
	var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
	function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
		if (utils$1.isFunction(filter)) return filter.call(this, value, header);
		if (isHeaderNameFilter) value = header;
		if (!utils$1.isString(value)) return;
		if (utils$1.isString(filter)) return value.indexOf(filter) !== -1;
		if (utils$1.isRegExp(filter)) return filter.test(value);
	}
	function formatHeader(header) {
		return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
			return char.toUpperCase() + str;
		});
	}
	function buildAccessors(obj, header) {
		const accessorName = utils$1.toCamelCase(" " + header);
		[
			"get",
			"set",
			"has"
		].forEach((methodName) => {
			Object.defineProperty(obj, methodName + accessorName, {
				value: function(arg1, arg2, arg3) {
					return this[methodName].call(this, header, arg1, arg2, arg3);
				},
				configurable: true
			});
		});
	}
	var AxiosHeaders = class {
		constructor(headers) {
			headers && this.set(headers);
		}
		set(header, valueOrRewrite, rewrite) {
			const self = this;
			function setHeader(_value, _header, _rewrite) {
				const lHeader = normalizeHeader(_header);
				if (!lHeader) throw new Error("header name must be a non-empty string");
				const key = utils$1.findKey(self, lHeader);
				if (!key || self[key] === void 0 || _rewrite === true || _rewrite === void 0 && self[key] !== false) {
					assertValidHeaderValue(_value, _header);
					self[key || _header] = normalizeValue(_value);
				}
			}
			const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
			if (utils$1.isPlainObject(header) || header instanceof this.constructor) setHeaders(header, valueOrRewrite);
			else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) setHeaders(parseHeaders(header), valueOrRewrite);
			else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
				let obj = {}, dest, key;
				for (const entry of header) {
					if (!utils$1.isArray(entry)) throw TypeError("Object iterator must return a key-value pair");
					obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
				}
				setHeaders(obj, valueOrRewrite);
			} else header != null && setHeader(valueOrRewrite, header, rewrite);
			return this;
		}
		get(header, parser) {
			header = normalizeHeader(header);
			if (header) {
				const key = utils$1.findKey(this, header);
				if (key) {
					const value = this[key];
					if (!parser) return value;
					if (parser === true) return parseTokens(value);
					if (utils$1.isFunction(parser)) return parser.call(this, value, key);
					if (utils$1.isRegExp(parser)) return parser.exec(value);
					throw new TypeError("parser must be boolean|regexp|function");
				}
			}
		}
		has(header, matcher) {
			header = normalizeHeader(header);
			if (header) {
				const key = utils$1.findKey(this, header);
				return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
			}
			return false;
		}
		delete(header, matcher) {
			const self = this;
			let deleted = false;
			function deleteHeader(_header) {
				_header = normalizeHeader(_header);
				if (_header) {
					const key = utils$1.findKey(self, _header);
					if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
						delete self[key];
						deleted = true;
					}
				}
			}
			if (utils$1.isArray(header)) header.forEach(deleteHeader);
			else deleteHeader(header);
			return deleted;
		}
		clear(matcher) {
			const keys = Object.keys(this);
			let i = keys.length;
			let deleted = false;
			while (i--) {
				const key = keys[i];
				if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
					delete this[key];
					deleted = true;
				}
			}
			return deleted;
		}
		normalize(format) {
			const self = this;
			const headers = {};
			utils$1.forEach(this, (value, header) => {
				const key = utils$1.findKey(headers, header);
				if (key) {
					self[key] = normalizeValue(value);
					delete self[header];
					return;
				}
				const normalized = format ? formatHeader(header) : String(header).trim();
				if (normalized !== header) delete self[header];
				self[normalized] = normalizeValue(value);
				headers[normalized] = true;
			});
			return this;
		}
		concat(...targets) {
			return this.constructor.concat(this, ...targets);
		}
		toJSON(asStrings) {
			const obj = Object.create(null);
			utils$1.forEach(this, (value, header) => {
				value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
			});
			return obj;
		}
		[Symbol.iterator]() {
			return Object.entries(this.toJSON())[Symbol.iterator]();
		}
		toString() {
			return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
		}
		getSetCookie() {
			return this.get("set-cookie") || [];
		}
		get [Symbol.toStringTag]() {
			return "AxiosHeaders";
		}
		static from(thing) {
			return thing instanceof this ? thing : new this(thing);
		}
		static concat(first, ...targets) {
			const computed = new this(first);
			targets.forEach((target) => computed.set(target));
			return computed;
		}
		static accessor(header) {
			const accessors = (this[$internals] = this[$internals] = { accessors: {} }).accessors;
			const prototype = this.prototype;
			function defineAccessor(_header) {
				const lHeader = normalizeHeader(_header);
				if (!accessors[lHeader]) {
					buildAccessors(prototype, _header);
					accessors[lHeader] = true;
				}
			}
			utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
			return this;
		}
	};
	AxiosHeaders.accessor([
		"Content-Type",
		"Content-Length",
		"Accept",
		"Accept-Encoding",
		"User-Agent",
		"Authorization"
	]);
	utils$1.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
		let mapped = key[0].toUpperCase() + key.slice(1);
		return {
			get: () => value,
			set(headerValue) {
				this[mapped] = headerValue;
			}
		};
	});
	utils$1.freezeMethods(AxiosHeaders);
	/**
	* Transform the data for a request or a response
	*
	* @param {Array|Function} fns A single function or Array of functions
	* @param {?Object} response The response object
	*
	* @returns {*} The resulting transformed data
	*/
	function transformData(fns, response) {
		const config = this || defaults;
		const context = response || config;
		const headers = AxiosHeaders.from(context.headers);
		let data = context.data;
		utils$1.forEach(fns, function transform(fn) {
			data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
		});
		headers.normalize();
		return data;
	}
	function isCancel(value) {
		return !!(value && value.__CANCEL__);
	}
	var CanceledError = class extends AxiosError {
		/**
		* A `CanceledError` is an object that is thrown when an operation is canceled.
		*
		* @param {string=} message The message.
		* @param {Object=} config The config.
		* @param {Object=} request The request.
		*
		* @returns {CanceledError} The created error.
		*/
		constructor(message, config, request) {
			super(message == null ? "canceled" : message, AxiosError.ERR_CANCELED, config, request);
			this.name = "CanceledError";
			this.__CANCEL__ = true;
		}
	};
	/**
	* Resolve or reject a Promise based on response status.
	*
	* @param {Function} resolve A function that resolves the promise.
	* @param {Function} reject A function that rejects the promise.
	* @param {object} response The response.
	*
	* @returns {object} The response.
	*/
	function settle(resolve, reject, response) {
		const validateStatus = response.config.validateStatus;
		if (!response.status || !validateStatus || validateStatus(response.status)) resolve(response);
		else reject(new AxiosError("Request failed with status code " + response.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
	}
	function parseProtocol(url) {
		const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
		return match && match[1] || "";
	}
	/**
	* Calculate data maxRate
	* @param {Number} [samplesCount= 10]
	* @param {Number} [min= 1000]
	* @returns {Function}
	*/
	function speedometer(samplesCount, min) {
		samplesCount = samplesCount || 10;
		const bytes = new Array(samplesCount);
		const timestamps = new Array(samplesCount);
		let head = 0;
		let tail = 0;
		let firstSampleTS;
		min = min !== void 0 ? min : 1e3;
		return function push(chunkLength) {
			const now = Date.now();
			const startedAt = timestamps[tail];
			if (!firstSampleTS) firstSampleTS = now;
			bytes[head] = chunkLength;
			timestamps[head] = now;
			let i = tail;
			let bytesCount = 0;
			while (i !== head) {
				bytesCount += bytes[i++];
				i = i % samplesCount;
			}
			head = (head + 1) % samplesCount;
			if (head === tail) tail = (tail + 1) % samplesCount;
			if (now - firstSampleTS < min) return;
			const passed = startedAt && now - startedAt;
			return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
		};
	}
	/**
	* Throttle decorator
	* @param {Function} fn
	* @param {Number} freq
	* @return {Function}
	*/
	function throttle(fn, freq) {
		let timestamp = 0;
		let threshold = 1e3 / freq;
		let lastArgs;
		let timer;
		const invoke = (args, now = Date.now()) => {
			timestamp = now;
			lastArgs = null;
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			fn(...args);
		};
		const throttled = (...args) => {
			const now = Date.now();
			const passed = now - timestamp;
			if (passed >= threshold) invoke(args, now);
			else {
				lastArgs = args;
				if (!timer) timer = setTimeout(() => {
					timer = null;
					invoke(lastArgs);
				}, threshold - passed);
			}
		};
		const flush = () => lastArgs && invoke(lastArgs);
		return [throttled, flush];
	}
	var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
		let bytesNotified = 0;
		const _speedometer = speedometer(50, 250);
		return throttle((e) => {
			const loaded = e.loaded;
			const total = e.lengthComputable ? e.total : void 0;
			const progressBytes = loaded - bytesNotified;
			const rate = _speedometer(progressBytes);
			const inRange = loaded <= total;
			bytesNotified = loaded;
			listener({
				loaded,
				total,
				progress: total ? loaded / total : void 0,
				bytes: progressBytes,
				rate: rate ? rate : void 0,
				estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
				event: e,
				lengthComputable: total != null,
				[isDownloadStream ? "download" : "upload"]: true
			});
		}, freq);
	};
	var progressEventDecorator = (total, throttled) => {
		const lengthComputable = total != null;
		return [(loaded) => throttled[0]({
			lengthComputable,
			total,
			loaded
		}), throttled[1]];
	};
	var asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
	var isURLSameOrigin = platform.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
		url = new URL(url, platform.origin);
		return origin.protocol === url.protocol && origin.host === url.host && (isMSIE || origin.port === url.port);
	})(new URL(platform.origin), platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)) : () => true;
	var cookies = platform.hasStandardBrowserEnv ? {
		write(name, value, expires, path, domain, secure, sameSite) {
			if (typeof document === "undefined") return;
			const cookie = [`${name}=${encodeURIComponent(value)}`];
			if (utils$1.isNumber(expires)) cookie.push(`expires=${new Date(expires).toUTCString()}`);
			if (utils$1.isString(path)) cookie.push(`path=${path}`);
			if (utils$1.isString(domain)) cookie.push(`domain=${domain}`);
			if (secure === true) cookie.push("secure");
			if (utils$1.isString(sameSite)) cookie.push(`SameSite=${sameSite}`);
			document.cookie = cookie.join("; ");
		},
		read(name) {
			if (typeof document === "undefined") return null;
			const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
			return match ? decodeURIComponent(match[1]) : null;
		},
		remove(name) {
			this.write(name, "", Date.now() - 864e5, "/");
		}
	} : {
		write() {},
		read() {
			return null;
		},
		remove() {}
	};
	/**
	* Determines whether the specified URL is absolute
	*
	* @param {string} url The URL to test
	*
	* @returns {boolean} True if the specified URL is absolute, otherwise false
	*/
	function isAbsoluteURL(url) {
		if (typeof url !== "string") return false;
		return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	}
	/**
	* Creates a new URL by combining the specified URLs
	*
	* @param {string} baseURL The base URL
	* @param {string} relativeURL The relative URL
	*
	* @returns {string} The combined URL
	*/
	function combineURLs(baseURL, relativeURL) {
		return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
	}
	/**
	* Creates a new URL by combining the baseURL with the requestedURL,
	* only when the requestedURL is not already an absolute URL.
	* If the requestURL is absolute, this function returns the requestedURL untouched.
	*
	* @param {string} baseURL The base URL
	* @param {string} requestedURL Absolute or relative URL to combine
	*
	* @returns {string} The combined full path
	*/
	function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
		let isRelativeUrl = !isAbsoluteURL(requestedURL);
		if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) return combineURLs(baseURL, requestedURL);
		return requestedURL;
	}
	var headersToObject = (thing) => thing instanceof AxiosHeaders ? { ...thing } : thing;
	/**
	* Config-specific merge-function which creates a new config-object
	* by merging two configuration objects together.
	*
	* @param {Object} config1
	* @param {Object} config2
	*
	* @returns {Object} New object resulting from merging config2 to config1
	*/
	function mergeConfig(config1, config2) {
		config2 = config2 || {};
		const config = {};
		function getMergedValue(target, source, prop, caseless) {
			if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) return utils$1.merge.call({ caseless }, target, source);
			else if (utils$1.isPlainObject(source)) return utils$1.merge({}, source);
			else if (utils$1.isArray(source)) return source.slice();
			return source;
		}
		function mergeDeepProperties(a, b, prop, caseless) {
			if (!utils$1.isUndefined(b)) return getMergedValue(a, b, prop, caseless);
			else if (!utils$1.isUndefined(a)) return getMergedValue(void 0, a, prop, caseless);
		}
		function valueFromConfig2(a, b) {
			if (!utils$1.isUndefined(b)) return getMergedValue(void 0, b);
		}
		function defaultToConfig2(a, b) {
			if (!utils$1.isUndefined(b)) return getMergedValue(void 0, b);
			else if (!utils$1.isUndefined(a)) return getMergedValue(void 0, a);
		}
		function mergeDirectKeys(a, b, prop) {
			if (prop in config2) return getMergedValue(a, b);
			else if (prop in config1) return getMergedValue(void 0, a);
		}
		const mergeMap = {
			url: valueFromConfig2,
			method: valueFromConfig2,
			data: valueFromConfig2,
			baseURL: defaultToConfig2,
			transformRequest: defaultToConfig2,
			transformResponse: defaultToConfig2,
			paramsSerializer: defaultToConfig2,
			timeout: defaultToConfig2,
			timeoutMessage: defaultToConfig2,
			withCredentials: defaultToConfig2,
			withXSRFToken: defaultToConfig2,
			adapter: defaultToConfig2,
			responseType: defaultToConfig2,
			xsrfCookieName: defaultToConfig2,
			xsrfHeaderName: defaultToConfig2,
			onUploadProgress: defaultToConfig2,
			onDownloadProgress: defaultToConfig2,
			decompress: defaultToConfig2,
			maxContentLength: defaultToConfig2,
			maxBodyLength: defaultToConfig2,
			beforeRedirect: defaultToConfig2,
			transport: defaultToConfig2,
			httpAgent: defaultToConfig2,
			httpsAgent: defaultToConfig2,
			cancelToken: defaultToConfig2,
			socketPath: defaultToConfig2,
			responseEncoding: defaultToConfig2,
			validateStatus: mergeDirectKeys,
			headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
		};
		utils$1.forEach(Object.keys({
			...config1,
			...config2
		}), function computeConfigValue(prop) {
			if (prop === "__proto__" || prop === "constructor" || prop === "prototype") return;
			const merge = utils$1.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
			const configValue = merge(config1[prop], config2[prop], prop);
			utils$1.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
		});
		return config;
	}
	var resolveConfig = (config) => {
		const newConfig = mergeConfig({}, config);
		let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
		newConfig.headers = headers = AxiosHeaders.from(headers);
		newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
		if (auth) headers.set("Authorization", "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : "")));
		if (utils$1.isFormData(data)) {
			if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) headers.setContentType(void 0);
			else if (utils$1.isFunction(data.getHeaders)) {
				const formHeaders = data.getHeaders();
				const allowedHeaders = ["content-type", "content-length"];
				Object.entries(formHeaders).forEach(([key, val]) => {
					if (allowedHeaders.includes(key.toLowerCase())) headers.set(key, val);
				});
			}
		}
		if (platform.hasStandardBrowserEnv) {
			withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
			if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
				const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
				if (xsrfValue) headers.set(xsrfHeaderName, xsrfValue);
			}
		}
		return newConfig;
	};
	var xhrAdapter = typeof XMLHttpRequest !== "undefined" && function(config) {
		return new Promise(function dispatchXhrRequest(resolve, reject) {
			const _config = resolveConfig(config);
			let requestData = _config.data;
			const requestHeaders = AxiosHeaders.from(_config.headers).normalize();
			let { responseType, onUploadProgress, onDownloadProgress } = _config;
			let onCanceled;
			let uploadThrottled, downloadThrottled;
			let flushUpload, flushDownload;
			function done() {
				flushUpload && flushUpload();
				flushDownload && flushDownload();
				_config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
				_config.signal && _config.signal.removeEventListener("abort", onCanceled);
			}
			let request = new XMLHttpRequest();
			request.open(_config.method.toUpperCase(), _config.url, true);
			request.timeout = _config.timeout;
			function onloadend() {
				if (!request) return;
				const responseHeaders = AxiosHeaders.from("getAllResponseHeaders" in request && request.getAllResponseHeaders());
				settle(function _resolve(value) {
					resolve(value);
					done();
				}, function _reject(err) {
					reject(err);
					done();
				}, {
					data: !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response,
					status: request.status,
					statusText: request.statusText,
					headers: responseHeaders,
					config,
					request
				});
				request = null;
			}
			if ("onloadend" in request) request.onloadend = onloadend;
			else request.onreadystatechange = function handleLoad() {
				if (!request || request.readyState !== 4) return;
				if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) return;
				setTimeout(onloadend);
			};
			request.onabort = function handleAbort() {
				if (!request) return;
				reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
				request = null;
			};
			request.onerror = function handleError(event) {
				const err = new AxiosError(event && event.message ? event.message : "Network Error", AxiosError.ERR_NETWORK, config, request);
				err.event = event || null;
				reject(err);
				request = null;
			};
			request.ontimeout = function handleTimeout() {
				let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
				const transitional = _config.transitional || transitionalDefaults;
				if (_config.timeoutErrorMessage) timeoutErrorMessage = _config.timeoutErrorMessage;
				reject(new AxiosError(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, config, request));
				request = null;
			};
			requestData === void 0 && requestHeaders.setContentType(null);
			if ("setRequestHeader" in request) utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
				request.setRequestHeader(key, val);
			});
			if (!utils$1.isUndefined(_config.withCredentials)) request.withCredentials = !!_config.withCredentials;
			if (responseType && responseType !== "json") request.responseType = _config.responseType;
			if (onDownloadProgress) {
				[downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
				request.addEventListener("progress", downloadThrottled);
			}
			if (onUploadProgress && request.upload) {
				[uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
				request.upload.addEventListener("progress", uploadThrottled);
				request.upload.addEventListener("loadend", flushUpload);
			}
			if (_config.cancelToken || _config.signal) {
				onCanceled = (cancel) => {
					if (!request) return;
					reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
					request.abort();
					request = null;
				};
				_config.cancelToken && _config.cancelToken.subscribe(onCanceled);
				if (_config.signal) _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
			}
			const protocol = parseProtocol(_config.url);
			if (protocol && platform.protocols.indexOf(protocol) === -1) {
				reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
				return;
			}
			request.send(requestData || null);
		});
	};
	var composeSignals = (signals, timeout) => {
		const { length } = signals = signals ? signals.filter(Boolean) : [];
		if (timeout || length) {
			let controller = new AbortController();
			let aborted;
			const onabort = function(reason) {
				if (!aborted) {
					aborted = true;
					unsubscribe();
					const err = reason instanceof Error ? reason : this.reason;
					controller.abort(err instanceof AxiosError ? err : new CanceledError(err instanceof Error ? err.message : err));
				}
			};
			let timer = timeout && setTimeout(() => {
				timer = null;
				onabort(new AxiosError(`timeout of ${timeout}ms exceeded`, AxiosError.ETIMEDOUT));
			}, timeout);
			const unsubscribe = () => {
				if (signals) {
					timer && clearTimeout(timer);
					timer = null;
					signals.forEach((signal) => {
						signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener("abort", onabort);
					});
					signals = null;
				}
			};
			signals.forEach((signal) => signal.addEventListener("abort", onabort));
			const { signal } = controller;
			signal.unsubscribe = () => utils$1.asap(unsubscribe);
			return signal;
		}
	};
	var streamChunk = function* (chunk, chunkSize) {
		let len = chunk.byteLength;
		if (len < chunkSize) {
			yield chunk;
			return;
		}
		let pos = 0;
		let end;
		while (pos < len) {
			end = pos + chunkSize;
			yield chunk.slice(pos, end);
			pos = end;
		}
	};
	var readBytes = async function* (iterable, chunkSize) {
		for await (const chunk of readStream(iterable)) yield* streamChunk(chunk, chunkSize);
	};
	var readStream = async function* (stream) {
		if (stream[Symbol.asyncIterator]) {
			yield* stream;
			return;
		}
		const reader = stream.getReader();
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				yield value;
			}
		} finally {
			await reader.cancel();
		}
	};
	var trackStream = (stream, chunkSize, onProgress, onFinish) => {
		const iterator = readBytes(stream, chunkSize);
		let bytes = 0;
		let done;
		let _onFinish = (e) => {
			if (!done) {
				done = true;
				onFinish && onFinish(e);
			}
		};
		return new ReadableStream({
			async pull(controller) {
				try {
					const { done, value } = await iterator.next();
					if (done) {
						_onFinish();
						controller.close();
						return;
					}
					let len = value.byteLength;
					if (onProgress) onProgress(bytes += len);
					controller.enqueue(new Uint8Array(value));
				} catch (err) {
					_onFinish(err);
					throw err;
				}
			},
			cancel(reason) {
				_onFinish(reason);
				return iterator.return();
			}
		}, { highWaterMark: 2 });
	};
	var DEFAULT_CHUNK_SIZE = 64 * 1024;
	var { isFunction } = utils$1;
	var globalFetchAPI = (({ Request, Response }) => ({
		Request,
		Response
	}))(utils$1.global);
	var { ReadableStream: ReadableStream$1, TextEncoder } = utils$1.global;
	var test = (fn, ...args) => {
		try {
			return !!fn(...args);
		} catch (e) {
			return false;
		}
	};
	var factory = (env) => {
		env = utils$1.merge.call({ skipUndefined: true }, globalFetchAPI, env);
		const { fetch: envFetch, Request, Response } = env;
		const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
		const isRequestSupported = isFunction(Request);
		const isResponseSupported = isFunction(Response);
		if (!isFetchSupported) return false;
		const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
		const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
		const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
			let duplexAccessed = false;
			const body = new ReadableStream$1();
			const hasContentType = new Request(platform.origin, {
				body,
				method: "POST",
				get duplex() {
					duplexAccessed = true;
					return "half";
				}
			}).headers.has("Content-Type");
			body.cancel();
			return duplexAccessed && !hasContentType;
		});
		const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
		const resolvers = { stream: supportsResponseStream && ((res) => res.body) };
		isFetchSupported && [
			"text",
			"arrayBuffer",
			"blob",
			"formData",
			"stream"
		].forEach((type) => {
			!resolvers[type] && (resolvers[type] = (res, config) => {
				let method = res && res[type];
				if (method) return method.call(res);
				throw new AxiosError(`Response type '${type}' is not supported`, AxiosError.ERR_NOT_SUPPORT, config);
			});
		});
		const getBodyLength = async (body) => {
			if (body == null) return 0;
			if (utils$1.isBlob(body)) return body.size;
			if (utils$1.isSpecCompliantForm(body)) return (await new Request(platform.origin, {
				method: "POST",
				body
			}).arrayBuffer()).byteLength;
			if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) return body.byteLength;
			if (utils$1.isURLSearchParams(body)) body = body + "";
			if (utils$1.isString(body)) return (await encodeText(body)).byteLength;
		};
		const resolveBodyLength = async (headers, body) => {
			const length = utils$1.toFiniteNumber(headers.getContentLength());
			return length == null ? getBodyLength(body) : length;
		};
		return async (config) => {
			let { url, method, data, signal, cancelToken, timeout, onDownloadProgress, onUploadProgress, responseType, headers, withCredentials = "same-origin", fetchOptions } = resolveConfig(config);
			let _fetch = envFetch || fetch;
			responseType = responseType ? (responseType + "").toLowerCase() : "text";
			let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
			let request = null;
			const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
				composedSignal.unsubscribe();
			});
			let requestContentLength;
			try {
				if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
					let _request = new Request(url, {
						method: "POST",
						body: data,
						duplex: "half"
					});
					let contentTypeHeader;
					if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) headers.setContentType(contentTypeHeader);
					if (_request.body) {
						const [onProgress, flush] = progressEventDecorator(requestContentLength, progressEventReducer(asyncDecorator(onUploadProgress)));
						data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
					}
				}
				if (!utils$1.isString(withCredentials)) withCredentials = withCredentials ? "include" : "omit";
				const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
				const resolvedOptions = {
					...fetchOptions,
					signal: composedSignal,
					method: method.toUpperCase(),
					headers: headers.normalize().toJSON(),
					body: data,
					duplex: "half",
					credentials: isCredentialsSupported ? withCredentials : void 0
				};
				request = isRequestSupported && new Request(url, resolvedOptions);
				let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
				const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
				if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
					const options = {};
					[
						"status",
						"statusText",
						"headers"
					].forEach((prop) => {
						options[prop] = response[prop];
					});
					const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
					const [onProgress, flush] = onDownloadProgress && progressEventDecorator(responseContentLength, progressEventReducer(asyncDecorator(onDownloadProgress), true)) || [];
					response = new Response(trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
						flush && flush();
						unsubscribe && unsubscribe();
					}), options);
				}
				responseType = responseType || "text";
				let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
				!isStreamResponse && unsubscribe && unsubscribe();
				return await new Promise((resolve, reject) => {
					settle(resolve, reject, {
						data: responseData,
						headers: AxiosHeaders.from(response.headers),
						status: response.status,
						statusText: response.statusText,
						config,
						request
					});
				});
			} catch (err) {
				unsubscribe && unsubscribe();
				if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) throw Object.assign(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request, err && err.response), { cause: err.cause || err });
				throw AxiosError.from(err, err && err.code, config, request, err && err.response);
			}
		};
	};
	var seedCache = /* @__PURE__ */ new Map();
	var getFetch = (config) => {
		let env = config && config.env || {};
		const { fetch, Request, Response } = env;
		const seeds = [
			Request,
			Response,
			fetch
		];
		let i = seeds.length, seed, target, map = seedCache;
		while (i--) {
			seed = seeds[i];
			target = map.get(seed);
			target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
			map = target;
		}
		return target;
	};
	getFetch();
	/**
	* Known adapters mapping.
	* Provides environment-specific adapters for Axios:
	* - `http` for Node.js
	* - `xhr` for browsers
	* - `fetch` for fetch API-based requests
	*
	* @type {Object<string, Function|Object>}
	*/
	var knownAdapters = {
		http: httpAdapter,
		xhr: xhrAdapter,
		fetch: { get: getFetch }
	};
	utils$1.forEach(knownAdapters, (fn, value) => {
		if (fn) {
			try {
				Object.defineProperty(fn, "name", { value });
			} catch (e) {}
			Object.defineProperty(fn, "adapterName", { value });
		}
	});
	/**
	* Render a rejection reason string for unknown or unsupported adapters
	*
	* @param {string} reason
	* @returns {string}
	*/
	var renderReason = (reason) => `- ${reason}`;
	/**
	* Check if the adapter is resolved (function, null, or false)
	*
	* @param {Function|null|false} adapter
	* @returns {boolean}
	*/
	var isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
	/**
	* Get the first suitable adapter from the provided list.
	* Tries each adapter in order until a supported one is found.
	* Throws an AxiosError if no adapter is suitable.
	*
	* @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
	* @param {Object} config - Axios request configuration
	* @throws {AxiosError} If no suitable adapter is available
	* @returns {Function} The resolved adapter function
	*/
	function getAdapter(adapters, config) {
		adapters = utils$1.isArray(adapters) ? adapters : [adapters];
		const { length } = adapters;
		let nameOrAdapter;
		let adapter;
		const rejectedReasons = {};
		for (let i = 0; i < length; i++) {
			nameOrAdapter = adapters[i];
			let id;
			adapter = nameOrAdapter;
			if (!isResolvedHandle(nameOrAdapter)) {
				adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
				if (adapter === void 0) throw new AxiosError(`Unknown adapter '${id}'`);
			}
			if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) break;
			rejectedReasons[id || "#" + i] = adapter;
		}
		if (!adapter) {
			const reasons = Object.entries(rejectedReasons).map(([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build"));
			throw new AxiosError(`There is no suitable adapter to dispatch the request ` + (length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
		}
		return adapter;
	}
	/**
	* Exports Axios adapters and utility to resolve an adapter
	*/
	var adapters = {
		/**
		* Resolve an adapter from a list of adapter names or functions.
		* @type {Function}
		*/
		getAdapter,
		/**
		* Exposes all known adapters
		* @type {Object<string, Function|Object>}
		*/
		adapters: knownAdapters
	};
	/**
	* Throws a `CanceledError` if cancellation has been requested.
	*
	* @param {Object} config The config that is to be used for the request
	*
	* @returns {void}
	*/
	function throwIfCancellationRequested(config) {
		if (config.cancelToken) config.cancelToken.throwIfRequested();
		if (config.signal && config.signal.aborted) throw new CanceledError(null, config);
	}
	/**
	* Dispatch a request to the server using the configured adapter.
	*
	* @param {object} config The config that is to be used for the request
	*
	* @returns {Promise} The Promise to be fulfilled
	*/
	function dispatchRequest(config) {
		throwIfCancellationRequested(config);
		config.headers = AxiosHeaders.from(config.headers);
		config.data = transformData.call(config, config.transformRequest);
		if ([
			"post",
			"put",
			"patch"
		].indexOf(config.method) !== -1) config.headers.setContentType("application/x-www-form-urlencoded", false);
		return adapters.getAdapter(config.adapter || defaults.adapter, config)(config).then(function onAdapterResolution(response) {
			throwIfCancellationRequested(config);
			response.data = transformData.call(config, config.transformResponse, response);
			response.headers = AxiosHeaders.from(response.headers);
			return response;
		}, function onAdapterRejection(reason) {
			if (!isCancel(reason)) {
				throwIfCancellationRequested(config);
				if (reason && reason.response) {
					reason.response.data = transformData.call(config, config.transformResponse, reason.response);
					reason.response.headers = AxiosHeaders.from(reason.response.headers);
				}
			}
			return Promise.reject(reason);
		});
	}
	var VERSION = "1.15.0";
	var validators$1 = {};
	[
		"object",
		"boolean",
		"number",
		"function",
		"string",
		"symbol"
	].forEach((type, i) => {
		validators$1[type] = function validator(thing) {
			return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
		};
	});
	var deprecatedWarnings = {};
	/**
	* Transitional option validator
	*
	* @param {function|boolean?} validator - set to false if the transitional option has been removed
	* @param {string?} version - deprecated version / removed since version
	* @param {string?} message - some message with additional info
	*
	* @returns {function}
	*/
	validators$1.transitional = function transitional(validator, version, message) {
		function formatMessage(opt, desc) {
			return "[Axios v1.15.0] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
		}
		return (value, opt, opts) => {
			if (validator === false) throw new AxiosError(formatMessage(opt, " has been removed" + (version ? " in " + version : "")), AxiosError.ERR_DEPRECATED);
			if (version && !deprecatedWarnings[opt]) {
				deprecatedWarnings[opt] = true;
				console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
			}
			return validator ? validator(value, opt, opts) : true;
		};
	};
	validators$1.spelling = function spelling(correctSpelling) {
		return (value, opt) => {
			console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
			return true;
		};
	};
	/**
	* Assert object's properties type
	*
	* @param {object} options
	* @param {object} schema
	* @param {boolean?} allowUnknown
	*
	* @returns {object}
	*/
	function assertOptions(options, schema, allowUnknown) {
		if (typeof options !== "object") throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
		const keys = Object.keys(options);
		let i = keys.length;
		while (i-- > 0) {
			const opt = keys[i];
			const validator = schema[opt];
			if (validator) {
				const value = options[opt];
				const result = value === void 0 || validator(value, opt, options);
				if (result !== true) throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
				continue;
			}
			if (allowUnknown !== true) throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
		}
	}
	var validator = {
		assertOptions,
		validators: validators$1
	};
	var validators = validator.validators;
	/**
	* Create a new instance of Axios
	*
	* @param {Object} instanceConfig The default config for the instance
	*
	* @return {Axios} A new instance of Axios
	*/
	var Axios = class {
		constructor(instanceConfig) {
			this.defaults = instanceConfig || {};
			this.interceptors = {
				request: new InterceptorManager(),
				response: new InterceptorManager()
			};
		}
		/**
		* Dispatch a request
		*
		* @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
		* @param {?Object} config
		*
		* @returns {Promise} The Promise to be fulfilled
		*/
		async request(configOrUrl, config) {
			try {
				return await this._request(configOrUrl, config);
			} catch (err) {
				if (err instanceof Error) {
					let dummy = {};
					Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = /* @__PURE__ */ new Error();
					const stack = (() => {
						if (!dummy.stack) return "";
						const firstNewlineIndex = dummy.stack.indexOf("\n");
						return firstNewlineIndex === -1 ? "" : dummy.stack.slice(firstNewlineIndex + 1);
					})();
					try {
						if (!err.stack) err.stack = stack;
						else if (stack) {
							const firstNewlineIndex = stack.indexOf("\n");
							const secondNewlineIndex = firstNewlineIndex === -1 ? -1 : stack.indexOf("\n", firstNewlineIndex + 1);
							const stackWithoutTwoTopLines = secondNewlineIndex === -1 ? "" : stack.slice(secondNewlineIndex + 1);
							if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) err.stack += "\n" + stack;
						}
					} catch (e) {}
				}
				throw err;
			}
		}
		_request(configOrUrl, config) {
			if (typeof configOrUrl === "string") {
				config = config || {};
				config.url = configOrUrl;
			} else config = configOrUrl || {};
			config = mergeConfig(this.defaults, config);
			const { transitional, paramsSerializer, headers } = config;
			if (transitional !== void 0) validator.assertOptions(transitional, {
				silentJSONParsing: validators.transitional(validators.boolean),
				forcedJSONParsing: validators.transitional(validators.boolean),
				clarifyTimeoutError: validators.transitional(validators.boolean),
				legacyInterceptorReqResOrdering: validators.transitional(validators.boolean)
			}, false);
			if (paramsSerializer != null) if (utils$1.isFunction(paramsSerializer)) config.paramsSerializer = { serialize: paramsSerializer };
			else validator.assertOptions(paramsSerializer, {
				encode: validators.function,
				serialize: validators.function
			}, true);
			if (config.allowAbsoluteUrls !== void 0);
			else if (this.defaults.allowAbsoluteUrls !== void 0) config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
			else config.allowAbsoluteUrls = true;
			validator.assertOptions(config, {
				baseUrl: validators.spelling("baseURL"),
				withXsrfToken: validators.spelling("withXSRFToken")
			}, true);
			config.method = (config.method || this.defaults.method || "get").toLowerCase();
			let contextHeaders = headers && utils$1.merge(headers.common, headers[config.method]);
			headers && utils$1.forEach([
				"delete",
				"get",
				"head",
				"post",
				"put",
				"patch",
				"common"
			], (method) => {
				delete headers[method];
			});
			config.headers = AxiosHeaders.concat(contextHeaders, headers);
			const requestInterceptorChain = [];
			let synchronousRequestInterceptors = true;
			this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
				if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) return;
				synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
				const transitional = config.transitional || transitionalDefaults;
				if (transitional && transitional.legacyInterceptorReqResOrdering) requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
				else requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
			});
			const responseInterceptorChain = [];
			this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
				responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
			});
			let promise;
			let i = 0;
			let len;
			if (!synchronousRequestInterceptors) {
				const chain = [dispatchRequest.bind(this), void 0];
				chain.unshift(...requestInterceptorChain);
				chain.push(...responseInterceptorChain);
				len = chain.length;
				promise = Promise.resolve(config);
				while (i < len) promise = promise.then(chain[i++], chain[i++]);
				return promise;
			}
			len = requestInterceptorChain.length;
			let newConfig = config;
			while (i < len) {
				const onFulfilled = requestInterceptorChain[i++];
				const onRejected = requestInterceptorChain[i++];
				try {
					newConfig = onFulfilled(newConfig);
				} catch (error) {
					onRejected.call(this, error);
					break;
				}
			}
			try {
				promise = dispatchRequest.call(this, newConfig);
			} catch (error) {
				return Promise.reject(error);
			}
			i = 0;
			len = responseInterceptorChain.length;
			while (i < len) promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
			return promise;
		}
		getUri(config) {
			config = mergeConfig(this.defaults, config);
			return buildURL(buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls), config.params, config.paramsSerializer);
		}
	};
	utils$1.forEach([
		"delete",
		"get",
		"head",
		"options"
	], function forEachMethodNoData(method) {
		Axios.prototype[method] = function(url, config) {
			return this.request(mergeConfig(config || {}, {
				method,
				url,
				data: (config || {}).data
			}));
		};
	});
	utils$1.forEach([
		"post",
		"put",
		"patch"
	], function forEachMethodWithData(method) {
		function generateHTTPMethod(isForm) {
			return function httpMethod(url, data, config) {
				return this.request(mergeConfig(config || {}, {
					method,
					headers: isForm ? { "Content-Type": "multipart/form-data" } : {},
					url,
					data
				}));
			};
		}
		Axios.prototype[method] = generateHTTPMethod();
		Axios.prototype[method + "Form"] = generateHTTPMethod(true);
	});
	/**
	* A `CancelToken` is an object that can be used to request cancellation of an operation.
	*
	* @param {Function} executor The executor function.
	*
	* @returns {CancelToken}
	*/
	var CancelToken = class CancelToken {
		constructor(executor) {
			if (typeof executor !== "function") throw new TypeError("executor must be a function.");
			let resolvePromise;
			this.promise = new Promise(function promiseExecutor(resolve) {
				resolvePromise = resolve;
			});
			const token = this;
			this.promise.then((cancel) => {
				if (!token._listeners) return;
				let i = token._listeners.length;
				while (i-- > 0) token._listeners[i](cancel);
				token._listeners = null;
			});
			this.promise.then = (onfulfilled) => {
				let _resolve;
				const promise = new Promise((resolve) => {
					token.subscribe(resolve);
					_resolve = resolve;
				}).then(onfulfilled);
				promise.cancel = function reject() {
					token.unsubscribe(_resolve);
				};
				return promise;
			};
			executor(function cancel(message, config, request) {
				if (token.reason) return;
				token.reason = new CanceledError(message, config, request);
				resolvePromise(token.reason);
			});
		}
		/**
		* Throws a `CanceledError` if cancellation has been requested.
		*/
		throwIfRequested() {
			if (this.reason) throw this.reason;
		}
		/**
		* Subscribe to the cancel signal
		*/
		subscribe(listener) {
			if (this.reason) {
				listener(this.reason);
				return;
			}
			if (this._listeners) this._listeners.push(listener);
			else this._listeners = [listener];
		}
		/**
		* Unsubscribe from the cancel signal
		*/
		unsubscribe(listener) {
			if (!this._listeners) return;
			const index = this._listeners.indexOf(listener);
			if (index !== -1) this._listeners.splice(index, 1);
		}
		toAbortSignal() {
			const controller = new AbortController();
			const abort = (err) => {
				controller.abort(err);
			};
			this.subscribe(abort);
			controller.signal.unsubscribe = () => this.unsubscribe(abort);
			return controller.signal;
		}
		/**
		* Returns an object that contains a new `CancelToken` and a function that, when called,
		* cancels the `CancelToken`.
		*/
		static source() {
			let cancel;
			return {
				token: new CancelToken(function executor(c) {
					cancel = c;
				}),
				cancel
			};
		}
	};
	/**
	* Syntactic sugar for invoking a function and expanding an array for arguments.
	*
	* Common use case would be to use `Function.prototype.apply`.
	*
	*  ```js
	*  function f(x, y, z) {}
	*  const args = [1, 2, 3];
	*  f.apply(null, args);
	*  ```
	*
	* With `spread` this example can be re-written.
	*
	*  ```js
	*  spread(function(x, y, z) {})([1, 2, 3]);
	*  ```
	*
	* @param {Function} callback
	*
	* @returns {Function}
	*/
	function spread(callback) {
		return function wrap(arr) {
			return callback.apply(null, arr);
		};
	}
	/**
	* Determines whether the payload is an error thrown by Axios
	*
	* @param {*} payload The value to test
	*
	* @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
	*/
	function isAxiosError(payload) {
		return utils$1.isObject(payload) && payload.isAxiosError === true;
	}
	var HttpStatusCode = {
		Continue: 100,
		SwitchingProtocols: 101,
		Processing: 102,
		EarlyHints: 103,
		Ok: 200,
		Created: 201,
		Accepted: 202,
		NonAuthoritativeInformation: 203,
		NoContent: 204,
		ResetContent: 205,
		PartialContent: 206,
		MultiStatus: 207,
		AlreadyReported: 208,
		ImUsed: 226,
		MultipleChoices: 300,
		MovedPermanently: 301,
		Found: 302,
		SeeOther: 303,
		NotModified: 304,
		UseProxy: 305,
		Unused: 306,
		TemporaryRedirect: 307,
		PermanentRedirect: 308,
		BadRequest: 400,
		Unauthorized: 401,
		PaymentRequired: 402,
		Forbidden: 403,
		NotFound: 404,
		MethodNotAllowed: 405,
		NotAcceptable: 406,
		ProxyAuthenticationRequired: 407,
		RequestTimeout: 408,
		Conflict: 409,
		Gone: 410,
		LengthRequired: 411,
		PreconditionFailed: 412,
		PayloadTooLarge: 413,
		UriTooLong: 414,
		UnsupportedMediaType: 415,
		RangeNotSatisfiable: 416,
		ExpectationFailed: 417,
		ImATeapot: 418,
		MisdirectedRequest: 421,
		UnprocessableEntity: 422,
		Locked: 423,
		FailedDependency: 424,
		TooEarly: 425,
		UpgradeRequired: 426,
		PreconditionRequired: 428,
		TooManyRequests: 429,
		RequestHeaderFieldsTooLarge: 431,
		UnavailableForLegalReasons: 451,
		InternalServerError: 500,
		NotImplemented: 501,
		BadGateway: 502,
		ServiceUnavailable: 503,
		GatewayTimeout: 504,
		HttpVersionNotSupported: 505,
		VariantAlsoNegotiates: 506,
		InsufficientStorage: 507,
		LoopDetected: 508,
		NotExtended: 510,
		NetworkAuthenticationRequired: 511,
		WebServerIsDown: 521,
		ConnectionTimedOut: 522,
		OriginIsUnreachable: 523,
		TimeoutOccurred: 524,
		SslHandshakeFailed: 525,
		InvalidSslCertificate: 526
	};
	Object.entries(HttpStatusCode).forEach(([key, value]) => {
		HttpStatusCode[value] = key;
	});
	/**
	* Create an instance of Axios
	*
	* @param {Object} defaultConfig The default config for the instance
	*
	* @returns {Axios} A new instance of Axios
	*/
	function createInstance(defaultConfig) {
		const context = new Axios(defaultConfig);
		const instance = bind(Axios.prototype.request, context);
		utils$1.extend(instance, Axios.prototype, context, { allOwnKeys: true });
		utils$1.extend(instance, context, null, { allOwnKeys: true });
		instance.create = function create(instanceConfig) {
			return createInstance(mergeConfig(defaultConfig, instanceConfig));
		};
		return instance;
	}
	var axios = createInstance(defaults);
	axios.Axios = Axios;
	axios.CanceledError = CanceledError;
	axios.CancelToken = CancelToken;
	axios.isCancel = isCancel;
	axios.VERSION = VERSION;
	axios.toFormData = toFormData;
	axios.AxiosError = AxiosError;
	axios.Cancel = axios.CanceledError;
	axios.all = function all(promises) {
		return Promise.all(promises);
	};
	axios.spread = spread;
	axios.isAxiosError = isAxiosError;
	axios.mergeConfig = mergeConfig;
	axios.AxiosHeaders = AxiosHeaders;
	axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
	axios.getAdapter = adapters.getAdapter;
	axios.HttpStatusCode = HttpStatusCode;
	axios.default = axios;
	module.exports = axios;
}));
//#endregion
//#region node_modules/zod/v3/helpers/util.cjs
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
	var util;
	(function(util) {
		util.assertEqual = (_) => {};
		function assertIs(_arg) {}
		util.assertIs = assertIs;
		function assertNever(_x) {
			throw new Error();
		}
		util.assertNever = assertNever;
		util.arrayToEnum = (items) => {
			const obj = {};
			for (const item of items) obj[item] = item;
			return obj;
		};
		util.getValidEnumValues = (obj) => {
			const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
			const filtered = {};
			for (const k of validKeys) filtered[k] = obj[k];
			return util.objectValues(filtered);
		};
		util.objectValues = (obj) => {
			return util.objectKeys(obj).map(function(e) {
				return obj[e];
			});
		};
		util.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
			const keys = [];
			for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key)) keys.push(key);
			return keys;
		};
		util.find = (arr, checker) => {
			for (const item of arr) if (checker(item)) return item;
		};
		util.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
		function joinValues(array, separator = " | ") {
			return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
		}
		util.joinValues = joinValues;
		util.jsonStringifyReplacer = (_, value) => {
			if (typeof value === "bigint") return value.toString();
			return value;
		};
	})(util || (exports.util = util = {}));
	var objectUtil;
	(function(objectUtil) {
		objectUtil.mergeShapes = (first, second) => {
			return {
				...first,
				...second
			};
		};
	})(objectUtil || (exports.objectUtil = objectUtil = {}));
	exports.ZodParsedType = util.arrayToEnum([
		"string",
		"nan",
		"number",
		"integer",
		"float",
		"boolean",
		"date",
		"bigint",
		"symbol",
		"function",
		"undefined",
		"null",
		"array",
		"object",
		"unknown",
		"promise",
		"void",
		"never",
		"map",
		"set"
	]);
	var getParsedType = (data) => {
		switch (typeof data) {
			case "undefined": return exports.ZodParsedType.undefined;
			case "string": return exports.ZodParsedType.string;
			case "number": return Number.isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
			case "boolean": return exports.ZodParsedType.boolean;
			case "function": return exports.ZodParsedType.function;
			case "bigint": return exports.ZodParsedType.bigint;
			case "symbol": return exports.ZodParsedType.symbol;
			case "object":
				if (Array.isArray(data)) return exports.ZodParsedType.array;
				if (data === null) return exports.ZodParsedType.null;
				if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") return exports.ZodParsedType.promise;
				if (typeof Map !== "undefined" && data instanceof Map) return exports.ZodParsedType.map;
				if (typeof Set !== "undefined" && data instanceof Set) return exports.ZodParsedType.set;
				if (typeof Date !== "undefined" && data instanceof Date) return exports.ZodParsedType.date;
				return exports.ZodParsedType.object;
			default: return exports.ZodParsedType.unknown;
		}
	};
	exports.getParsedType = getParsedType;
}));
//#endregion
//#region node_modules/zod/v3/ZodError.cjs
var require_ZodError = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
	var util_js_1 = require_util();
	exports.ZodIssueCode = util_js_1.util.arrayToEnum([
		"invalid_type",
		"invalid_literal",
		"custom",
		"invalid_union",
		"invalid_union_discriminator",
		"invalid_enum_value",
		"unrecognized_keys",
		"invalid_arguments",
		"invalid_return_type",
		"invalid_date",
		"invalid_string",
		"too_small",
		"too_big",
		"invalid_intersection_types",
		"not_multiple_of",
		"not_finite"
	]);
	var quotelessJson = (obj) => {
		return JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, "$1:");
	};
	exports.quotelessJson = quotelessJson;
	var ZodError = class ZodError extends Error {
		get errors() {
			return this.issues;
		}
		constructor(issues) {
			super();
			this.issues = [];
			this.addIssue = (sub) => {
				this.issues = [...this.issues, sub];
			};
			this.addIssues = (subs = []) => {
				this.issues = [...this.issues, ...subs];
			};
			const actualProto = new.target.prototype;
			if (Object.setPrototypeOf) Object.setPrototypeOf(this, actualProto);
			else this.__proto__ = actualProto;
			this.name = "ZodError";
			this.issues = issues;
		}
		format(_mapper) {
			const mapper = _mapper || function(issue) {
				return issue.message;
			};
			const fieldErrors = { _errors: [] };
			const processError = (error) => {
				for (const issue of error.issues) if (issue.code === "invalid_union") issue.unionErrors.map(processError);
				else if (issue.code === "invalid_return_type") processError(issue.returnTypeError);
				else if (issue.code === "invalid_arguments") processError(issue.argumentsError);
				else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
				else {
					let curr = fieldErrors;
					let i = 0;
					while (i < issue.path.length) {
						const el = issue.path[i];
						if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
						else {
							curr[el] = curr[el] || { _errors: [] };
							curr[el]._errors.push(mapper(issue));
						}
						curr = curr[el];
						i++;
					}
				}
			};
			processError(this);
			return fieldErrors;
		}
		static assert(value) {
			if (!(value instanceof ZodError)) throw new Error(`Not a ZodError: ${value}`);
		}
		toString() {
			return this.message;
		}
		get message() {
			return JSON.stringify(this.issues, util_js_1.util.jsonStringifyReplacer, 2);
		}
		get isEmpty() {
			return this.issues.length === 0;
		}
		flatten(mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of this.issues) if (sub.path.length > 0) {
				const firstEl = sub.path[0];
				fieldErrors[firstEl] = fieldErrors[firstEl] || [];
				fieldErrors[firstEl].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		get formErrors() {
			return this.flatten();
		}
	};
	exports.ZodError = ZodError;
	ZodError.create = (issues) => {
		return new ZodError(issues);
	};
}));
//#endregion
//#region node_modules/zod/v3/locales/en.cjs
var require_en = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var ZodError_js_1 = require_ZodError();
	var util_js_1 = require_util();
	var errorMap = (issue, _ctx) => {
		let message;
		switch (issue.code) {
			case ZodError_js_1.ZodIssueCode.invalid_type:
				if (issue.received === util_js_1.ZodParsedType.undefined) message = "Required";
				else message = `Expected ${issue.expected}, received ${issue.received}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_literal:
				message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_js_1.util.jsonStringifyReplacer)}`;
				break;
			case ZodError_js_1.ZodIssueCode.unrecognized_keys:
				message = `Unrecognized key(s) in object: ${util_js_1.util.joinValues(issue.keys, ", ")}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_union:
				message = `Invalid input`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_union_discriminator:
				message = `Invalid discriminator value. Expected ${util_js_1.util.joinValues(issue.options)}`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_enum_value:
				message = `Invalid enum value. Expected ${util_js_1.util.joinValues(issue.options)}, received '${issue.received}'`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_arguments:
				message = `Invalid function arguments`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_return_type:
				message = `Invalid function return type`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_date:
				message = `Invalid date`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_string:
				if (typeof issue.validation === "object") if ("includes" in issue.validation) {
					message = `Invalid input: must include "${issue.validation.includes}"`;
					if (typeof issue.validation.position === "number") message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
				} else if ("startsWith" in issue.validation) message = `Invalid input: must start with "${issue.validation.startsWith}"`;
				else if ("endsWith" in issue.validation) message = `Invalid input: must end with "${issue.validation.endsWith}"`;
				else util_js_1.util.assertNever(issue.validation);
				else if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
				else message = "Invalid";
				break;
			case ZodError_js_1.ZodIssueCode.too_small:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "bigint") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
				else message = "Invalid input";
				break;
			case ZodError_js_1.ZodIssueCode.too_big:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "bigint") message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
				else message = "Invalid input";
				break;
			case ZodError_js_1.ZodIssueCode.custom:
				message = `Invalid input`;
				break;
			case ZodError_js_1.ZodIssueCode.invalid_intersection_types:
				message = `Intersection results could not be merged`;
				break;
			case ZodError_js_1.ZodIssueCode.not_multiple_of:
				message = `Number must be a multiple of ${issue.multipleOf}`;
				break;
			case ZodError_js_1.ZodIssueCode.not_finite:
				message = "Number must be finite";
				break;
			default:
				message = _ctx.defaultError;
				util_js_1.util.assertNever(issue);
		}
		return { message };
	};
	exports.default = errorMap;
}));
//#endregion
//#region node_modules/zod/v3/errors.cjs
var require_errors = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultErrorMap = void 0;
	exports.setErrorMap = setErrorMap;
	exports.getErrorMap = getErrorMap;
	var en_js_1 = __importDefault(require_en());
	exports.defaultErrorMap = en_js_1.default;
	var overrideErrorMap = en_js_1.default;
	function setErrorMap(map) {
		overrideErrorMap = map;
	}
	function getErrorMap() {
		return overrideErrorMap;
	}
}));
//#endregion
//#region node_modules/zod/v3/helpers/parseUtil.cjs
var require_parseUtil = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.EMPTY_PATH = exports.makeIssue = void 0;
	exports.addIssueToContext = addIssueToContext;
	var errors_js_1 = require_errors();
	var en_js_1 = __importDefault(require_en());
	var makeIssue = (params) => {
		const { data, path, errorMaps, issueData } = params;
		const fullPath = [...path, ...issueData.path || []];
		const fullIssue = {
			...issueData,
			path: fullPath
		};
		if (issueData.message !== void 0) return {
			...issueData,
			path: fullPath,
			message: issueData.message
		};
		let errorMessage = "";
		const maps = errorMaps.filter((m) => !!m).slice().reverse();
		for (const map of maps) errorMessage = map(fullIssue, {
			data,
			defaultError: errorMessage
		}).message;
		return {
			...issueData,
			path: fullPath,
			message: errorMessage
		};
	};
	exports.makeIssue = makeIssue;
	exports.EMPTY_PATH = [];
	function addIssueToContext(ctx, issueData) {
		const overrideMap = (0, errors_js_1.getErrorMap)();
		const issue = (0, exports.makeIssue)({
			issueData,
			data: ctx.data,
			path: ctx.path,
			errorMaps: [
				ctx.common.contextualErrorMap,
				ctx.schemaErrorMap,
				overrideMap,
				overrideMap === en_js_1.default ? void 0 : en_js_1.default
			].filter((x) => !!x)
		});
		ctx.common.issues.push(issue);
	}
	exports.ParseStatus = class ParseStatus {
		constructor() {
			this.value = "valid";
		}
		dirty() {
			if (this.value === "valid") this.value = "dirty";
		}
		abort() {
			if (this.value !== "aborted") this.value = "aborted";
		}
		static mergeArray(status, results) {
			const arrayValue = [];
			for (const s of results) {
				if (s.status === "aborted") return exports.INVALID;
				if (s.status === "dirty") status.dirty();
				arrayValue.push(s.value);
			}
			return {
				status: status.value,
				value: arrayValue
			};
		}
		static async mergeObjectAsync(status, pairs) {
			const syncPairs = [];
			for (const pair of pairs) {
				const key = await pair.key;
				const value = await pair.value;
				syncPairs.push({
					key,
					value
				});
			}
			return ParseStatus.mergeObjectSync(status, syncPairs);
		}
		static mergeObjectSync(status, pairs) {
			const finalObject = {};
			for (const pair of pairs) {
				const { key, value } = pair;
				if (key.status === "aborted") return exports.INVALID;
				if (value.status === "aborted") return exports.INVALID;
				if (key.status === "dirty") status.dirty();
				if (value.status === "dirty") status.dirty();
				if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) finalObject[key.value] = value.value;
			}
			return {
				status: status.value,
				value: finalObject
			};
		}
	};
	exports.INVALID = Object.freeze({ status: "aborted" });
	var DIRTY = (value) => ({
		status: "dirty",
		value
	});
	exports.DIRTY = DIRTY;
	var OK = (value) => ({
		status: "valid",
		value
	});
	exports.OK = OK;
	var isAborted = (x) => x.status === "aborted";
	exports.isAborted = isAborted;
	var isDirty = (x) => x.status === "dirty";
	exports.isDirty = isDirty;
	var isValid = (x) => x.status === "valid";
	exports.isValid = isValid;
	var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
	exports.isAsync = isAsync;
}));
//#endregion
//#region node_modules/zod/v3/helpers/typeAliases.cjs
var require_typeAliases = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/zod/v3/helpers/errorUtil.cjs
var require_errorUtil = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.errorUtil = void 0;
	var errorUtil;
	(function(errorUtil) {
		errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
		errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
	})(errorUtil || (exports.errorUtil = errorUtil = {}));
}));
//#endregion
//#region node_modules/zod/v3/types.cjs
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.ZodReadonly = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
	exports.NEVER = exports.void = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports.null = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports.instanceof = exports.function = exports.enum = exports.effect = void 0;
	exports.datetimeRegex = datetimeRegex;
	exports.custom = custom;
	var ZodError_js_1 = require_ZodError();
	var errors_js_1 = require_errors();
	var errorUtil_js_1 = require_errorUtil();
	var parseUtil_js_1 = require_parseUtil();
	var util_js_1 = require_util();
	var ParseInputLazyPath = class {
		constructor(parent, value, path, key) {
			this._cachedPath = [];
			this.parent = parent;
			this.data = value;
			this._path = path;
			this._key = key;
		}
		get path() {
			if (!this._cachedPath.length) if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
			else this._cachedPath.push(...this._path, this._key);
			return this._cachedPath;
		}
	};
	var handleResult = (ctx, result) => {
		if ((0, parseUtil_js_1.isValid)(result)) return {
			success: true,
			data: result.value
		};
		else {
			if (!ctx.common.issues.length) throw new Error("Validation failed but no issues detected.");
			return {
				success: false,
				get error() {
					if (this._error) return this._error;
					const error = new ZodError_js_1.ZodError(ctx.common.issues);
					this._error = error;
					return this._error;
				}
			};
		}
	};
	function processCreateParams(params) {
		if (!params) return {};
		const { errorMap, invalid_type_error, required_error, description } = params;
		if (errorMap && (invalid_type_error || required_error)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
		if (errorMap) return {
			errorMap,
			description
		};
		const customMap = (iss, ctx) => {
			const { message } = params;
			if (iss.code === "invalid_enum_value") return { message: message ?? ctx.defaultError };
			if (typeof ctx.data === "undefined") return { message: message ?? required_error ?? ctx.defaultError };
			if (iss.code !== "invalid_type") return { message: ctx.defaultError };
			return { message: message ?? invalid_type_error ?? ctx.defaultError };
		};
		return {
			errorMap: customMap,
			description
		};
	}
	var ZodType = class {
		get description() {
			return this._def.description;
		}
		_getType(input) {
			return (0, util_js_1.getParsedType)(input.data);
		}
		_getOrReturnCtx(input, ctx) {
			return ctx || {
				common: input.parent.common,
				data: input.data,
				parsedType: (0, util_js_1.getParsedType)(input.data),
				schemaErrorMap: this._def.errorMap,
				path: input.path,
				parent: input.parent
			};
		}
		_processInputParams(input) {
			return {
				status: new parseUtil_js_1.ParseStatus(),
				ctx: {
					common: input.parent.common,
					data: input.data,
					parsedType: (0, util_js_1.getParsedType)(input.data),
					schemaErrorMap: this._def.errorMap,
					path: input.path,
					parent: input.parent
				}
			};
		}
		_parseSync(input) {
			const result = this._parse(input);
			if ((0, parseUtil_js_1.isAsync)(result)) throw new Error("Synchronous parse encountered promise.");
			return result;
		}
		_parseAsync(input) {
			const result = this._parse(input);
			return Promise.resolve(result);
		}
		parse(data, params) {
			const result = this.safeParse(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		safeParse(data, params) {
			const ctx = {
				common: {
					issues: [],
					async: params?.async ?? false,
					contextualErrorMap: params?.errorMap
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			return handleResult(ctx, this._parseSync({
				data,
				path: ctx.path,
				parent: ctx
			}));
		}
		"~validate"(data) {
			const ctx = {
				common: {
					issues: [],
					async: !!this["~standard"].async
				},
				path: [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			if (!this["~standard"].async) try {
				const result = this._parseSync({
					data,
					path: [],
					parent: ctx
				});
				return (0, parseUtil_js_1.isValid)(result) ? { value: result.value } : { issues: ctx.common.issues };
			} catch (err) {
				if (err?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = true;
				ctx.common = {
					issues: [],
					async: true
				};
			}
			return this._parseAsync({
				data,
				path: [],
				parent: ctx
			}).then((result) => (0, parseUtil_js_1.isValid)(result) ? { value: result.value } : { issues: ctx.common.issues });
		}
		async parseAsync(data, params) {
			const result = await this.safeParseAsync(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		async safeParseAsync(data, params) {
			const ctx = {
				common: {
					issues: [],
					contextualErrorMap: params?.errorMap,
					async: true
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: (0, util_js_1.getParsedType)(data)
			};
			const maybeAsyncResult = this._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
			return handleResult(ctx, await ((0, parseUtil_js_1.isAsync)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult)));
		}
		refine(check, message) {
			const getIssueProperties = (val) => {
				if (typeof message === "string" || typeof message === "undefined") return { message };
				else if (typeof message === "function") return message(val);
				else return message;
			};
			return this._refinement((val, ctx) => {
				const result = check(val);
				const setError = () => ctx.addIssue({
					code: ZodError_js_1.ZodIssueCode.custom,
					...getIssueProperties(val)
				});
				if (typeof Promise !== "undefined" && result instanceof Promise) return result.then((data) => {
					if (!data) {
						setError();
						return false;
					} else return true;
				});
				if (!result) {
					setError();
					return false;
				} else return true;
			});
		}
		refinement(check, refinementData) {
			return this._refinement((val, ctx) => {
				if (!check(val)) {
					ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
					return false;
				} else return true;
			});
		}
		_refinement(refinement) {
			return new ZodEffects({
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "refinement",
					refinement
				}
			});
		}
		superRefine(refinement) {
			return this._refinement(refinement);
		}
		constructor(def) {
			/** Alias of safeParseAsync */
			this.spa = this.safeParseAsync;
			this._def = def;
			this.parse = this.parse.bind(this);
			this.safeParse = this.safeParse.bind(this);
			this.parseAsync = this.parseAsync.bind(this);
			this.safeParseAsync = this.safeParseAsync.bind(this);
			this.spa = this.spa.bind(this);
			this.refine = this.refine.bind(this);
			this.refinement = this.refinement.bind(this);
			this.superRefine = this.superRefine.bind(this);
			this.optional = this.optional.bind(this);
			this.nullable = this.nullable.bind(this);
			this.nullish = this.nullish.bind(this);
			this.array = this.array.bind(this);
			this.promise = this.promise.bind(this);
			this.or = this.or.bind(this);
			this.and = this.and.bind(this);
			this.transform = this.transform.bind(this);
			this.brand = this.brand.bind(this);
			this.default = this.default.bind(this);
			this.catch = this.catch.bind(this);
			this.describe = this.describe.bind(this);
			this.pipe = this.pipe.bind(this);
			this.readonly = this.readonly.bind(this);
			this.isNullable = this.isNullable.bind(this);
			this.isOptional = this.isOptional.bind(this);
			this["~standard"] = {
				version: 1,
				vendor: "zod",
				validate: (data) => this["~validate"](data)
			};
		}
		optional() {
			return ZodOptional.create(this, this._def);
		}
		nullable() {
			return ZodNullable.create(this, this._def);
		}
		nullish() {
			return this.nullable().optional();
		}
		array() {
			return ZodArray.create(this);
		}
		promise() {
			return ZodPromise.create(this, this._def);
		}
		or(option) {
			return ZodUnion.create([this, option], this._def);
		}
		and(incoming) {
			return ZodIntersection.create(this, incoming, this._def);
		}
		transform(transform) {
			return new ZodEffects({
				...processCreateParams(this._def),
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "transform",
					transform
				}
			});
		}
		default(def) {
			const defaultValueFunc = typeof def === "function" ? def : () => def;
			return new ZodDefault({
				...processCreateParams(this._def),
				innerType: this,
				defaultValue: defaultValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodDefault
			});
		}
		brand() {
			return new ZodBranded({
				typeName: ZodFirstPartyTypeKind.ZodBranded,
				type: this,
				...processCreateParams(this._def)
			});
		}
		catch(def) {
			const catchValueFunc = typeof def === "function" ? def : () => def;
			return new ZodCatch({
				...processCreateParams(this._def),
				innerType: this,
				catchValue: catchValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodCatch
			});
		}
		describe(description) {
			const This = this.constructor;
			return new This({
				...this._def,
				description
			});
		}
		pipe(target) {
			return ZodPipeline.create(this, target);
		}
		readonly() {
			return ZodReadonly.create(this);
		}
		isOptional() {
			return this.safeParse(void 0).success;
		}
		isNullable() {
			return this.safeParse(null).success;
		}
	};
	exports.ZodType = ZodType;
	exports.Schema = ZodType;
	exports.ZodSchema = ZodType;
	var cuidRegex = /^c[^\s-]{8,}$/i;
	var cuid2Regex = /^[0-9a-z]+$/;
	var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
	var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
	var nanoidRegex = /^[a-z0-9_-]{21}$/i;
	var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
	var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
	var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
	var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
	var emojiRegex;
	var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
	var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
	var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
	var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
	var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
	var dateRegex = new RegExp(`^${dateRegexSource}$`);
	function timeRegexSource(args) {
		let secondsRegexSource = `[0-5]\\d`;
		if (args.precision) secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
		else if (args.precision == null) secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
		const secondsQuantifier = args.precision ? "+" : "?";
		return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
	}
	function timeRegex(args) {
		return new RegExp(`^${timeRegexSource(args)}$`);
	}
	function datetimeRegex(args) {
		let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
		const opts = [];
		opts.push(args.local ? `Z?` : `Z`);
		if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
		regex = `${regex}(${opts.join("|")})`;
		return new RegExp(`^${regex}$`);
	}
	function isValidIP(ip, version) {
		if ((version === "v4" || !version) && ipv4Regex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6Regex.test(ip)) return true;
		return false;
	}
	function isValidJWT(jwt, alg) {
		if (!jwtRegex.test(jwt)) return false;
		try {
			const [header] = jwt.split(".");
			if (!header) return false;
			const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
			const decoded = JSON.parse(atob(base64));
			if (typeof decoded !== "object" || decoded === null) return false;
			if ("typ" in decoded && decoded?.typ !== "JWT") return false;
			if (!decoded.alg) return false;
			if (alg && decoded.alg !== alg) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isValidCidr(ip, version) {
		if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) return true;
		return false;
	}
	var ZodString = class ZodString extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = String(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.string) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.string,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const status = new parseUtil_js_1.ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.length < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.length > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "length") {
				const tooBig = input.data.length > check.value;
				const tooSmall = input.data.length < check.value;
				if (tooBig || tooSmall) {
					ctx = this._getOrReturnCtx(input, ctx);
					if (tooBig) (0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					else if (tooSmall) (0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "email") {
				if (!emailRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "email",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "emoji") {
				if (!emojiRegex) emojiRegex = new RegExp(_emojiRegex, "u");
				if (!emojiRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "emoji",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "uuid") {
				if (!uuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "uuid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "nanoid") {
				if (!nanoidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "nanoid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid") {
				if (!cuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cuid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid2") {
				if (!cuid2Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cuid2",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ulid") {
				if (!ulidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "ulid",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "url") try {
				new URL(input.data);
			} catch {
				ctx = this._getOrReturnCtx(input, ctx);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					validation: "url",
					code: ZodError_js_1.ZodIssueCode.invalid_string,
					message: check.message
				});
				status.dirty();
			}
			else if (check.kind === "regex") {
				check.regex.lastIndex = 0;
				if (!check.regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "regex",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "trim") input.data = input.data.trim();
			else if (check.kind === "includes") {
				if (!input.data.includes(check.value, check.position)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: {
							includes: check.value,
							position: check.position
						},
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "toLowerCase") input.data = input.data.toLowerCase();
			else if (check.kind === "toUpperCase") input.data = input.data.toUpperCase();
			else if (check.kind === "startsWith") {
				if (!input.data.startsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: { startsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "endsWith") {
				if (!input.data.endsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: { endsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "datetime") {
				if (!datetimeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "datetime",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "date") {
				if (!dateRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "date",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "time") {
				if (!timeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						validation: "time",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "duration") {
				if (!durationRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "duration",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ip") {
				if (!isValidIP(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "ip",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "jwt") {
				if (!isValidJWT(input.data, check.alg)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "jwt",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cidr") {
				if (!isValidCidr(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "cidr",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64") {
				if (!base64Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "base64",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64url") {
				if (!base64urlRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						validation: "base64url",
						code: ZodError_js_1.ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_regex(regex, validation, message) {
			return this.refinement((data) => regex.test(data), {
				validation,
				code: ZodError_js_1.ZodIssueCode.invalid_string,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		_addCheck(check) {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		email(message) {
			return this._addCheck({
				kind: "email",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		url(message) {
			return this._addCheck({
				kind: "url",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		emoji(message) {
			return this._addCheck({
				kind: "emoji",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		uuid(message) {
			return this._addCheck({
				kind: "uuid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		nanoid(message) {
			return this._addCheck({
				kind: "nanoid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		cuid(message) {
			return this._addCheck({
				kind: "cuid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		cuid2(message) {
			return this._addCheck({
				kind: "cuid2",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		ulid(message) {
			return this._addCheck({
				kind: "ulid",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		base64(message) {
			return this._addCheck({
				kind: "base64",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		base64url(message) {
			return this._addCheck({
				kind: "base64url",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		jwt(options) {
			return this._addCheck({
				kind: "jwt",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		ip(options) {
			return this._addCheck({
				kind: "ip",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		cidr(options) {
			return this._addCheck({
				kind: "cidr",
				...errorUtil_js_1.errorUtil.errToObj(options)
			});
		}
		datetime(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "datetime",
				precision: null,
				offset: false,
				local: false,
				message: options
			});
			return this._addCheck({
				kind: "datetime",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				offset: options?.offset ?? false,
				local: options?.local ?? false,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		date(message) {
			return this._addCheck({
				kind: "date",
				message
			});
		}
		time(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "time",
				precision: null,
				message: options
			});
			return this._addCheck({
				kind: "time",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		duration(message) {
			return this._addCheck({
				kind: "duration",
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		regex(regex, message) {
			return this._addCheck({
				kind: "regex",
				regex,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		includes(value, options) {
			return this._addCheck({
				kind: "includes",
				value,
				position: options?.position,
				...errorUtil_js_1.errorUtil.errToObj(options?.message)
			});
		}
		startsWith(value, message) {
			return this._addCheck({
				kind: "startsWith",
				value,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		endsWith(value, message) {
			return this._addCheck({
				kind: "endsWith",
				value,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		min(minLength, message) {
			return this._addCheck({
				kind: "min",
				value: minLength,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		max(maxLength, message) {
			return this._addCheck({
				kind: "max",
				value: maxLength,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		length(len, message) {
			return this._addCheck({
				kind: "length",
				value: len,
				...errorUtil_js_1.errorUtil.errToObj(message)
			});
		}
		/**
		* Equivalent to `.min(1)`
		*/
		nonempty(message) {
			return this.min(1, errorUtil_js_1.errorUtil.errToObj(message));
		}
		trim() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "trim" }]
			});
		}
		toLowerCase() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "toLowerCase" }]
			});
		}
		toUpperCase() {
			return new ZodString({
				...this._def,
				checks: [...this._def.checks, { kind: "toUpperCase" }]
			});
		}
		get isDatetime() {
			return !!this._def.checks.find((ch) => ch.kind === "datetime");
		}
		get isDate() {
			return !!this._def.checks.find((ch) => ch.kind === "date");
		}
		get isTime() {
			return !!this._def.checks.find((ch) => ch.kind === "time");
		}
		get isDuration() {
			return !!this._def.checks.find((ch) => ch.kind === "duration");
		}
		get isEmail() {
			return !!this._def.checks.find((ch) => ch.kind === "email");
		}
		get isURL() {
			return !!this._def.checks.find((ch) => ch.kind === "url");
		}
		get isEmoji() {
			return !!this._def.checks.find((ch) => ch.kind === "emoji");
		}
		get isUUID() {
			return !!this._def.checks.find((ch) => ch.kind === "uuid");
		}
		get isNANOID() {
			return !!this._def.checks.find((ch) => ch.kind === "nanoid");
		}
		get isCUID() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid");
		}
		get isCUID2() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid2");
		}
		get isULID() {
			return !!this._def.checks.find((ch) => ch.kind === "ulid");
		}
		get isIP() {
			return !!this._def.checks.find((ch) => ch.kind === "ip");
		}
		get isCIDR() {
			return !!this._def.checks.find((ch) => ch.kind === "cidr");
		}
		get isBase64() {
			return !!this._def.checks.find((ch) => ch.kind === "base64");
		}
		get isBase64url() {
			return !!this._def.checks.find((ch) => ch.kind === "base64url");
		}
		get minLength() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxLength() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	exports.ZodString = ZodString;
	ZodString.create = (params) => {
		return new ZodString({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodString,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	function floatSafeRemainder(val, step) {
		const valDecCount = (val.toString().split(".")[1] || "").length;
		const stepDecCount = (step.toString().split(".")[1] || "").length;
		const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
		return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
	}
	var ZodNumber = class ZodNumber extends ZodType {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
			this.step = this.multipleOf;
		}
		_parse(input) {
			if (this._def.coerce) input.data = Number(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.number) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.number,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			let ctx = void 0;
			const status = new parseUtil_js_1.ParseStatus();
			for (const check of this._def.checks) if (check.kind === "int") {
				if (!util_js_1.util.isInteger(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.invalid_type,
						expected: "integer",
						received: "float",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (floatSafeRemainder(input.data, check.value) !== 0) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "finite") {
				if (!Number.isFinite(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_finite,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodNumber({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil_js_1.errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodNumber({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		int(message) {
			return this._addCheck({
				kind: "int",
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		finite(message) {
			return this._addCheck({
				kind: "finite",
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		safe(message) {
			return this._addCheck({
				kind: "min",
				inclusive: true,
				value: Number.MIN_SAFE_INTEGER,
				message: errorUtil_js_1.errorUtil.toString(message)
			})._addCheck({
				kind: "max",
				inclusive: true,
				value: Number.MAX_SAFE_INTEGER,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
		get isInt() {
			return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util_js_1.util.isInteger(ch.value));
		}
		get isFinite() {
			let max = null;
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") return true;
			else if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			} else if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return Number.isFinite(min) && Number.isFinite(max);
		}
	};
	exports.ZodNumber = ZodNumber;
	ZodNumber.create = (params) => {
		return new ZodNumber({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodNumber,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodBigInt = class ZodBigInt extends ZodType {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
		}
		_parse(input) {
			if (this._def.coerce) try {
				input.data = BigInt(input.data);
			} catch {
				return this._getInvalidInput(input);
			}
			if (this._getType(input) !== util_js_1.ZodParsedType.bigint) return this._getInvalidInput(input);
			let ctx = void 0;
			const status = new parseUtil_js_1.ParseStatus();
			for (const check of this._def.checks) if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						type: "bigint",
						minimum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						type: "bigint",
						maximum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (input.data % check.value !== BigInt(0)) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_getInvalidInput(input) {
			const ctx = this._getOrReturnCtx(input);
			(0, parseUtil_js_1.addIssueToContext)(ctx, {
				code: ZodError_js_1.ZodIssueCode.invalid_type,
				expected: util_js_1.ZodParsedType.bigint,
				received: ctx.parsedType
			});
			return parseUtil_js_1.INVALID;
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil_js_1.errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil_js_1.errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil_js_1.errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	exports.ZodBigInt = ZodBigInt;
	ZodBigInt.create = (params) => {
		return new ZodBigInt({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodBigInt,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	var ZodBoolean = class extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = Boolean(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.boolean) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.boolean,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodBoolean = ZodBoolean;
	ZodBoolean.create = (params) => {
		return new ZodBoolean({
			typeName: ZodFirstPartyTypeKind.ZodBoolean,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodDate = class ZodDate extends ZodType {
		_parse(input) {
			if (this._def.coerce) input.data = new Date(input.data);
			if (this._getType(input) !== util_js_1.ZodParsedType.date) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.date,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (Number.isNaN(input.data.getTime())) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, { code: ZodError_js_1.ZodIssueCode.invalid_date });
				return parseUtil_js_1.INVALID;
			}
			const status = new parseUtil_js_1.ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.getTime() < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						message: check.message,
						inclusive: true,
						exact: false,
						minimum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.getTime() > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						message: check.message,
						inclusive: true,
						exact: false,
						maximum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else util_js_1.util.assertNever(check);
			return {
				status: status.value,
				value: new Date(input.data.getTime())
			};
		}
		_addCheck(check) {
			return new ZodDate({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		min(minDate, message) {
			return this._addCheck({
				kind: "min",
				value: minDate.getTime(),
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		max(maxDate, message) {
			return this._addCheck({
				kind: "max",
				value: maxDate.getTime(),
				message: errorUtil_js_1.errorUtil.toString(message)
			});
		}
		get minDate() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min != null ? new Date(min) : null;
		}
		get maxDate() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max != null ? new Date(max) : null;
		}
	};
	exports.ZodDate = ZodDate;
	ZodDate.create = (params) => {
		return new ZodDate({
			checks: [],
			coerce: params?.coerce || false,
			typeName: ZodFirstPartyTypeKind.ZodDate,
			...processCreateParams(params)
		});
	};
	var ZodSymbol = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.symbol) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.symbol,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodSymbol = ZodSymbol;
	ZodSymbol.create = (params) => {
		return new ZodSymbol({
			typeName: ZodFirstPartyTypeKind.ZodSymbol,
			...processCreateParams(params)
		});
	};
	var ZodUndefined = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.undefined,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodUndefined = ZodUndefined;
	ZodUndefined.create = (params) => {
		return new ZodUndefined({
			typeName: ZodFirstPartyTypeKind.ZodUndefined,
			...processCreateParams(params)
		});
	};
	var ZodNull = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.null) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.null,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodNull = ZodNull;
	ZodNull.create = (params) => {
		return new ZodNull({
			typeName: ZodFirstPartyTypeKind.ZodNull,
			...processCreateParams(params)
		});
	};
	var ZodAny = class extends ZodType {
		constructor() {
			super(...arguments);
			this._any = true;
		}
		_parse(input) {
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodAny = ZodAny;
	ZodAny.create = (params) => {
		return new ZodAny({
			typeName: ZodFirstPartyTypeKind.ZodAny,
			...processCreateParams(params)
		});
	};
	var ZodUnknown = class extends ZodType {
		constructor() {
			super(...arguments);
			this._unknown = true;
		}
		_parse(input) {
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodUnknown = ZodUnknown;
	ZodUnknown.create = (params) => {
		return new ZodUnknown({
			typeName: ZodFirstPartyTypeKind.ZodUnknown,
			...processCreateParams(params)
		});
	};
	var ZodNever = class extends ZodType {
		_parse(input) {
			const ctx = this._getOrReturnCtx(input);
			(0, parseUtil_js_1.addIssueToContext)(ctx, {
				code: ZodError_js_1.ZodIssueCode.invalid_type,
				expected: util_js_1.ZodParsedType.never,
				received: ctx.parsedType
			});
			return parseUtil_js_1.INVALID;
		}
	};
	exports.ZodNever = ZodNever;
	ZodNever.create = (params) => {
		return new ZodNever({
			typeName: ZodFirstPartyTypeKind.ZodNever,
			...processCreateParams(params)
		});
	};
	var ZodVoid = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.void,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
	};
	exports.ZodVoid = ZodVoid;
	ZodVoid.create = (params) => {
		return new ZodVoid({
			typeName: ZodFirstPartyTypeKind.ZodVoid,
			...processCreateParams(params)
		});
	};
	var ZodArray = class ZodArray extends ZodType {
		_parse(input) {
			const { ctx, status } = this._processInputParams(input);
			const def = this._def;
			if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.array,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (def.exactLength !== null) {
				const tooBig = ctx.data.length > def.exactLength.value;
				const tooSmall = ctx.data.length < def.exactLength.value;
				if (tooBig || tooSmall) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: tooBig ? ZodError_js_1.ZodIssueCode.too_big : ZodError_js_1.ZodIssueCode.too_small,
						minimum: tooSmall ? def.exactLength.value : void 0,
						maximum: tooBig ? def.exactLength.value : void 0,
						type: "array",
						inclusive: true,
						exact: true,
						message: def.exactLength.message
					});
					status.dirty();
				}
			}
			if (def.minLength !== null) {
				if (ctx.data.length < def.minLength.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: def.minLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.minLength.message
					});
					status.dirty();
				}
			}
			if (def.maxLength !== null) {
				if (ctx.data.length > def.maxLength.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: def.maxLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.maxLength.message
					});
					status.dirty();
				}
			}
			if (ctx.common.async) return Promise.all([...ctx.data].map((item, i) => {
				return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			})).then((result) => {
				return parseUtil_js_1.ParseStatus.mergeArray(status, result);
			});
			const result = [...ctx.data].map((item, i) => {
				return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			});
			return parseUtil_js_1.ParseStatus.mergeArray(status, result);
		}
		get element() {
			return this._def.type;
		}
		min(minLength, message) {
			return new ZodArray({
				...this._def,
				minLength: {
					value: minLength,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		max(maxLength, message) {
			return new ZodArray({
				...this._def,
				maxLength: {
					value: maxLength,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		length(len, message) {
			return new ZodArray({
				...this._def,
				exactLength: {
					value: len,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	exports.ZodArray = ZodArray;
	ZodArray.create = (schema, params) => {
		return new ZodArray({
			type: schema,
			minLength: null,
			maxLength: null,
			exactLength: null,
			typeName: ZodFirstPartyTypeKind.ZodArray,
			...processCreateParams(params)
		});
	};
	function deepPartialify(schema) {
		if (schema instanceof ZodObject) {
			const newShape = {};
			for (const key in schema.shape) {
				const fieldSchema = schema.shape[key];
				newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
			}
			return new ZodObject({
				...schema._def,
				shape: () => newShape
			});
		} else if (schema instanceof ZodArray) return new ZodArray({
			...schema._def,
			type: deepPartialify(schema.element)
		});
		else if (schema instanceof ZodOptional) return ZodOptional.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodNullable) return ZodNullable.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodTuple) return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
		else return schema;
	}
	var ZodObject = class ZodObject extends ZodType {
		constructor() {
			super(...arguments);
			this._cached = null;
			/**
			* @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
			* If you want to pass through unknown properties, use `.passthrough()` instead.
			*/
			this.nonstrict = this.passthrough;
			/**
			* @deprecated Use `.extend` instead
			*  */
			this.augment = this.extend;
		}
		_getCached() {
			if (this._cached !== null) return this._cached;
			const shape = this._def.shape();
			const keys = util_js_1.util.objectKeys(shape);
			this._cached = {
				shape,
				keys
			};
			return this._cached;
		}
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.object) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const { status, ctx } = this._processInputParams(input);
			const { shape, keys: shapeKeys } = this._getCached();
			const extraKeys = [];
			if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
				for (const key in ctx.data) if (!shapeKeys.includes(key)) extraKeys.push(key);
			}
			const pairs = [];
			for (const key of shapeKeys) {
				const keyValidator = shape[key];
				const value = ctx.data[key];
				pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
					alwaysSet: key in ctx.data
				});
			}
			if (this._def.catchall instanceof ZodNever) {
				const unknownKeys = this._def.unknownKeys;
				if (unknownKeys === "passthrough") for (const key of extraKeys) pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: {
						status: "valid",
						value: ctx.data[key]
					}
				});
				else if (unknownKeys === "strict") {
					if (extraKeys.length > 0) {
						(0, parseUtil_js_1.addIssueToContext)(ctx, {
							code: ZodError_js_1.ZodIssueCode.unrecognized_keys,
							keys: extraKeys
						});
						status.dirty();
					}
				} else if (unknownKeys === "strip") {} else throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
			} else {
				const catchall = this._def.catchall;
				for (const key of extraKeys) {
					const value = ctx.data[key];
					pairs.push({
						key: {
							status: "valid",
							value: key
						},
						value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
						alwaysSet: key in ctx.data
					});
				}
			}
			if (ctx.common.async) return Promise.resolve().then(async () => {
				const syncPairs = [];
				for (const pair of pairs) {
					const key = await pair.key;
					const value = await pair.value;
					syncPairs.push({
						key,
						value,
						alwaysSet: pair.alwaysSet
					});
				}
				return syncPairs;
			}).then((syncPairs) => {
				return parseUtil_js_1.ParseStatus.mergeObjectSync(status, syncPairs);
			});
			else return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
		}
		get shape() {
			return this._def.shape();
		}
		strict(message) {
			errorUtil_js_1.errorUtil.errToObj;
			return new ZodObject({
				...this._def,
				unknownKeys: "strict",
				...message !== void 0 ? { errorMap: (issue, ctx) => {
					const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
					if (issue.code === "unrecognized_keys") return { message: errorUtil_js_1.errorUtil.errToObj(message).message ?? defaultError };
					return { message: defaultError };
				} } : {}
			});
		}
		strip() {
			return new ZodObject({
				...this._def,
				unknownKeys: "strip"
			});
		}
		passthrough() {
			return new ZodObject({
				...this._def,
				unknownKeys: "passthrough"
			});
		}
		extend(augmentation) {
			return new ZodObject({
				...this._def,
				shape: () => ({
					...this._def.shape(),
					...augmentation
				})
			});
		}
		/**
		* Prior to zod@1.0.12 there was a bug in the
		* inferred type of merged objects. Please
		* upgrade if you are experiencing issues.
		*/
		merge(merging) {
			return new ZodObject({
				unknownKeys: merging._def.unknownKeys,
				catchall: merging._def.catchall,
				shape: () => ({
					...this._def.shape(),
					...merging._def.shape()
				}),
				typeName: ZodFirstPartyTypeKind.ZodObject
			});
		}
		setKey(key, schema) {
			return this.augment({ [key]: schema });
		}
		catchall(index) {
			return new ZodObject({
				...this._def,
				catchall: index
			});
		}
		pick(mask) {
			const shape = {};
			for (const key of util_js_1.util.objectKeys(mask)) if (mask[key] && this.shape[key]) shape[key] = this.shape[key];
			return new ZodObject({
				...this._def,
				shape: () => shape
			});
		}
		omit(mask) {
			const shape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) if (!mask[key]) shape[key] = this.shape[key];
			return new ZodObject({
				...this._def,
				shape: () => shape
			});
		}
		/**
		* @deprecated
		*/
		deepPartial() {
			return deepPartialify(this);
		}
		partial(mask) {
			const newShape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) {
				const fieldSchema = this.shape[key];
				if (mask && !mask[key]) newShape[key] = fieldSchema;
				else newShape[key] = fieldSchema.optional();
			}
			return new ZodObject({
				...this._def,
				shape: () => newShape
			});
		}
		required(mask) {
			const newShape = {};
			for (const key of util_js_1.util.objectKeys(this.shape)) if (mask && !mask[key]) newShape[key] = this.shape[key];
			else {
				let newField = this.shape[key];
				while (newField instanceof ZodOptional) newField = newField._def.innerType;
				newShape[key] = newField;
			}
			return new ZodObject({
				...this._def,
				shape: () => newShape
			});
		}
		keyof() {
			return createZodEnum(util_js_1.util.objectKeys(this.shape));
		}
	};
	exports.ZodObject = ZodObject;
	ZodObject.create = (shape, params) => {
		return new ZodObject({
			shape: () => shape,
			unknownKeys: "strip",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject.strictCreate = (shape, params) => {
		return new ZodObject({
			shape: () => shape,
			unknownKeys: "strict",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject.lazycreate = (shape, params) => {
		return new ZodObject({
			shape,
			unknownKeys: "strip",
			catchall: ZodNever.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	var ZodUnion = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const options = this._def.options;
			function handleResults(results) {
				for (const result of results) if (result.result.status === "valid") return result.result;
				for (const result of results) if (result.result.status === "dirty") {
					ctx.common.issues.push(...result.ctx.common.issues);
					return result.result;
				}
				const unionErrors = results.map((result) => new ZodError_js_1.ZodError(result.ctx.common.issues));
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union,
					unionErrors
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.common.async) return Promise.all(options.map(async (option) => {
				const childCtx = {
					...ctx,
					common: {
						...ctx.common,
						issues: []
					},
					parent: null
				};
				return {
					result: await option._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					}),
					ctx: childCtx
				};
			})).then(handleResults);
			else {
				let dirty = void 0;
				const issues = [];
				for (const option of options) {
					const childCtx = {
						...ctx,
						common: {
							...ctx.common,
							issues: []
						},
						parent: null
					};
					const result = option._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					});
					if (result.status === "valid") return result;
					else if (result.status === "dirty" && !dirty) dirty = {
						result,
						ctx: childCtx
					};
					if (childCtx.common.issues.length) issues.push(childCtx.common.issues);
				}
				if (dirty) {
					ctx.common.issues.push(...dirty.ctx.common.issues);
					return dirty.result;
				}
				const unionErrors = issues.map((issues) => new ZodError_js_1.ZodError(issues));
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union,
					unionErrors
				});
				return parseUtil_js_1.INVALID;
			}
		}
		get options() {
			return this._def.options;
		}
	};
	exports.ZodUnion = ZodUnion;
	ZodUnion.create = (types, params) => {
		return new ZodUnion({
			options: types,
			typeName: ZodFirstPartyTypeKind.ZodUnion,
			...processCreateParams(params)
		});
	};
	var getDiscriminator = (type) => {
		if (type instanceof ZodLazy) return getDiscriminator(type.schema);
		else if (type instanceof ZodEffects) return getDiscriminator(type.innerType());
		else if (type instanceof ZodLiteral) return [type.value];
		else if (type instanceof ZodEnum) return type.options;
		else if (type instanceof ZodNativeEnum) return util_js_1.util.objectValues(type.enum);
		else if (type instanceof ZodDefault) return getDiscriminator(type._def.innerType);
		else if (type instanceof ZodUndefined) return [void 0];
		else if (type instanceof ZodNull) return [null];
		else if (type instanceof ZodOptional) return [void 0, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodNullable) return [null, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodBranded) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodReadonly) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodCatch) return getDiscriminator(type._def.innerType);
		else return [];
	};
	var ZodDiscriminatedUnion = class ZodDiscriminatedUnion extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const discriminator = this.discriminator;
			const discriminatorValue = ctx.data[discriminator];
			const option = this.optionsMap.get(discriminatorValue);
			if (!option) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_union_discriminator,
					options: Array.from(this.optionsMap.keys()),
					path: [discriminator]
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.common.async) return option._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
			else return option._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
		get discriminator() {
			return this._def.discriminator;
		}
		get options() {
			return this._def.options;
		}
		get optionsMap() {
			return this._def.optionsMap;
		}
		/**
		* The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
		* However, it only allows a union of objects, all of which need to share a discriminator property. This property must
		* have a different value for each object in the union.
		* @param discriminator the name of the discriminator property
		* @param types an array of object schemas
		* @param params
		*/
		static create(discriminator, options, params) {
			const optionsMap = /* @__PURE__ */ new Map();
			for (const type of options) {
				const discriminatorValues = getDiscriminator(type.shape[discriminator]);
				if (!discriminatorValues.length) throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
				for (const value of discriminatorValues) {
					if (optionsMap.has(value)) throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
					optionsMap.set(value, type);
				}
			}
			return new ZodDiscriminatedUnion({
				typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
				discriminator,
				options,
				optionsMap,
				...processCreateParams(params)
			});
		}
	};
	exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
	function mergeValues(a, b) {
		const aType = (0, util_js_1.getParsedType)(a);
		const bType = (0, util_js_1.getParsedType)(b);
		if (a === b) return {
			valid: true,
			data: a
		};
		else if (aType === util_js_1.ZodParsedType.object && bType === util_js_1.ZodParsedType.object) {
			const bKeys = util_js_1.util.objectKeys(b);
			const sharedKeys = util_js_1.util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
			const newObj = {
				...a,
				...b
			};
			for (const key of sharedKeys) {
				const sharedValue = mergeValues(a[key], b[key]);
				if (!sharedValue.valid) return { valid: false };
				newObj[key] = sharedValue.data;
			}
			return {
				valid: true,
				data: newObj
			};
		} else if (aType === util_js_1.ZodParsedType.array && bType === util_js_1.ZodParsedType.array) {
			if (a.length !== b.length) return { valid: false };
			const newArray = [];
			for (let index = 0; index < a.length; index++) {
				const itemA = a[index];
				const itemB = b[index];
				const sharedValue = mergeValues(itemA, itemB);
				if (!sharedValue.valid) return { valid: false };
				newArray.push(sharedValue.data);
			}
			return {
				valid: true,
				data: newArray
			};
		} else if (aType === util_js_1.ZodParsedType.date && bType === util_js_1.ZodParsedType.date && +a === +b) return {
			valid: true,
			data: a
		};
		else return { valid: false };
	}
	var ZodIntersection = class extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const handleParsed = (parsedLeft, parsedRight) => {
				if ((0, parseUtil_js_1.isAborted)(parsedLeft) || (0, parseUtil_js_1.isAborted)(parsedRight)) return parseUtil_js_1.INVALID;
				const merged = mergeValues(parsedLeft.value, parsedRight.value);
				if (!merged.valid) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, { code: ZodError_js_1.ZodIssueCode.invalid_intersection_types });
					return parseUtil_js_1.INVALID;
				}
				if ((0, parseUtil_js_1.isDirty)(parsedLeft) || (0, parseUtil_js_1.isDirty)(parsedRight)) status.dirty();
				return {
					status: status.value,
					value: merged.data
				};
			};
			if (ctx.common.async) return Promise.all([this._def.left._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			})]).then(([left, right]) => handleParsed(left, right));
			else return handleParsed(this._def.left._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}));
		}
	};
	exports.ZodIntersection = ZodIntersection;
	ZodIntersection.create = (left, right, params) => {
		return new ZodIntersection({
			left,
			right,
			typeName: ZodFirstPartyTypeKind.ZodIntersection,
			...processCreateParams(params)
		});
	};
	var ZodTuple = class ZodTuple extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.array) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.array,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			if (ctx.data.length < this._def.items.length) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.too_small,
					minimum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._def.rest && ctx.data.length > this._def.items.length) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.too_big,
					maximum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				status.dirty();
			}
			const items = [...ctx.data].map((item, itemIndex) => {
				const schema = this._def.items[itemIndex] || this._def.rest;
				if (!schema) return null;
				return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
			}).filter((x) => !!x);
			if (ctx.common.async) return Promise.all(items).then((results) => {
				return parseUtil_js_1.ParseStatus.mergeArray(status, results);
			});
			else return parseUtil_js_1.ParseStatus.mergeArray(status, items);
		}
		get items() {
			return this._def.items;
		}
		rest(rest) {
			return new ZodTuple({
				...this._def,
				rest
			});
		}
	};
	exports.ZodTuple = ZodTuple;
	ZodTuple.create = (schemas, params) => {
		if (!Array.isArray(schemas)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
		return new ZodTuple({
			items: schemas,
			typeName: ZodFirstPartyTypeKind.ZodTuple,
			rest: null,
			...processCreateParams(params)
		});
	};
	var ZodRecord = class ZodRecord extends ZodType {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.object) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.object,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const pairs = [];
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			for (const key in ctx.data) pairs.push({
				key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
				value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
				alwaysSet: key in ctx.data
			});
			if (ctx.common.async) return parseUtil_js_1.ParseStatus.mergeObjectAsync(status, pairs);
			else return parseUtil_js_1.ParseStatus.mergeObjectSync(status, pairs);
		}
		get element() {
			return this._def.valueType;
		}
		static create(first, second, third) {
			if (second instanceof ZodType) return new ZodRecord({
				keyType: first,
				valueType: second,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(third)
			});
			return new ZodRecord({
				keyType: ZodString.create(),
				valueType: first,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(second)
			});
		}
	};
	exports.ZodRecord = ZodRecord;
	var ZodMap = class extends ZodType {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.map) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.map,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			const pairs = [...ctx.data.entries()].map(([key, value], index) => {
				return {
					key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
					value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
				};
			});
			if (ctx.common.async) {
				const finalMap = /* @__PURE__ */ new Map();
				return Promise.resolve().then(async () => {
					for (const pair of pairs) {
						const key = await pair.key;
						const value = await pair.value;
						if (key.status === "aborted" || value.status === "aborted") return parseUtil_js_1.INVALID;
						if (key.status === "dirty" || value.status === "dirty") status.dirty();
						finalMap.set(key.value, value.value);
					}
					return {
						status: status.value,
						value: finalMap
					};
				});
			} else {
				const finalMap = /* @__PURE__ */ new Map();
				for (const pair of pairs) {
					const key = pair.key;
					const value = pair.value;
					if (key.status === "aborted" || value.status === "aborted") return parseUtil_js_1.INVALID;
					if (key.status === "dirty" || value.status === "dirty") status.dirty();
					finalMap.set(key.value, value.value);
				}
				return {
					status: status.value,
					value: finalMap
				};
			}
		}
	};
	exports.ZodMap = ZodMap;
	ZodMap.create = (keyType, valueType, params) => {
		return new ZodMap({
			valueType,
			keyType,
			typeName: ZodFirstPartyTypeKind.ZodMap,
			...processCreateParams(params)
		});
	};
	var ZodSet = class ZodSet extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.set) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.set,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const def = this._def;
			if (def.minSize !== null) {
				if (ctx.data.size < def.minSize.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_small,
						minimum: def.minSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.minSize.message
					});
					status.dirty();
				}
			}
			if (def.maxSize !== null) {
				if (ctx.data.size > def.maxSize.value) {
					(0, parseUtil_js_1.addIssueToContext)(ctx, {
						code: ZodError_js_1.ZodIssueCode.too_big,
						maximum: def.maxSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.maxSize.message
					});
					status.dirty();
				}
			}
			const valueType = this._def.valueType;
			function finalizeSet(elements) {
				const parsedSet = /* @__PURE__ */ new Set();
				for (const element of elements) {
					if (element.status === "aborted") return parseUtil_js_1.INVALID;
					if (element.status === "dirty") status.dirty();
					parsedSet.add(element.value);
				}
				return {
					status: status.value,
					value: parsedSet
				};
			}
			const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
			if (ctx.common.async) return Promise.all(elements).then((elements) => finalizeSet(elements));
			else return finalizeSet(elements);
		}
		min(minSize, message) {
			return new ZodSet({
				...this._def,
				minSize: {
					value: minSize,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		max(maxSize, message) {
			return new ZodSet({
				...this._def,
				maxSize: {
					value: maxSize,
					message: errorUtil_js_1.errorUtil.toString(message)
				}
			});
		}
		size(size, message) {
			return this.min(size, message).max(size, message);
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	exports.ZodSet = ZodSet;
	ZodSet.create = (valueType, params) => {
		return new ZodSet({
			valueType,
			minSize: null,
			maxSize: null,
			typeName: ZodFirstPartyTypeKind.ZodSet,
			...processCreateParams(params)
		});
	};
	var ZodFunction = class ZodFunction extends ZodType {
		constructor() {
			super(...arguments);
			this.validate = this.implement;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.function) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.function,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			function makeArgsIssue(args, error) {
				return (0, parseUtil_js_1.makeIssue)({
					data: args,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						(0, errors_js_1.getErrorMap)(),
						errors_js_1.defaultErrorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodError_js_1.ZodIssueCode.invalid_arguments,
						argumentsError: error
					}
				});
			}
			function makeReturnsIssue(returns, error) {
				return (0, parseUtil_js_1.makeIssue)({
					data: returns,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						(0, errors_js_1.getErrorMap)(),
						errors_js_1.defaultErrorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodError_js_1.ZodIssueCode.invalid_return_type,
						returnTypeError: error
					}
				});
			}
			const params = { errorMap: ctx.common.contextualErrorMap };
			const fn = ctx.data;
			if (this._def.returns instanceof ZodPromise) {
				const me = this;
				return (0, parseUtil_js_1.OK)(async function(...args) {
					const error = new ZodError_js_1.ZodError([]);
					const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
						error.addIssue(makeArgsIssue(args, e));
						throw error;
					});
					const result = await Reflect.apply(fn, this, parsedArgs);
					return await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
						error.addIssue(makeReturnsIssue(result, e));
						throw error;
					});
				});
			} else {
				const me = this;
				return (0, parseUtil_js_1.OK)(function(...args) {
					const parsedArgs = me._def.args.safeParse(args, params);
					if (!parsedArgs.success) throw new ZodError_js_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
					const result = Reflect.apply(fn, this, parsedArgs.data);
					const parsedReturns = me._def.returns.safeParse(result, params);
					if (!parsedReturns.success) throw new ZodError_js_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
					return parsedReturns.data;
				});
			}
		}
		parameters() {
			return this._def.args;
		}
		returnType() {
			return this._def.returns;
		}
		args(...items) {
			return new ZodFunction({
				...this._def,
				args: ZodTuple.create(items).rest(ZodUnknown.create())
			});
		}
		returns(returnType) {
			return new ZodFunction({
				...this._def,
				returns: returnType
			});
		}
		implement(func) {
			return this.parse(func);
		}
		strictImplement(func) {
			return this.parse(func);
		}
		static create(args, returns, params) {
			return new ZodFunction({
				args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
				returns: returns || ZodUnknown.create(),
				typeName: ZodFirstPartyTypeKind.ZodFunction,
				...processCreateParams(params)
			});
		}
	};
	exports.ZodFunction = ZodFunction;
	var ZodLazy = class extends ZodType {
		get schema() {
			return this._def.getter();
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			return this._def.getter()._parse({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
	};
	exports.ZodLazy = ZodLazy;
	ZodLazy.create = (getter, params) => {
		return new ZodLazy({
			getter,
			typeName: ZodFirstPartyTypeKind.ZodLazy,
			...processCreateParams(params)
		});
	};
	var ZodLiteral = class extends ZodType {
		_parse(input) {
			if (input.data !== this._def.value) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_literal,
					expected: this._def.value
				});
				return parseUtil_js_1.INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
		get value() {
			return this._def.value;
		}
	};
	exports.ZodLiteral = ZodLiteral;
	ZodLiteral.create = (value, params) => {
		return new ZodLiteral({
			value,
			typeName: ZodFirstPartyTypeKind.ZodLiteral,
			...processCreateParams(params)
		});
	};
	function createZodEnum(values, params) {
		return new ZodEnum({
			values,
			typeName: ZodFirstPartyTypeKind.ZodEnum,
			...processCreateParams(params)
		});
	}
	var ZodEnum = class ZodEnum extends ZodType {
		_parse(input) {
			if (typeof input.data !== "string") {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					expected: util_js_1.util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodError_js_1.ZodIssueCode.invalid_type
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._cache) this._cache = new Set(this._def.values);
			if (!this._cache.has(input.data)) {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
		get options() {
			return this._def.values;
		}
		get enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Values() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		extract(values, newDef = this._def) {
			return ZodEnum.create(values, {
				...this._def,
				...newDef
			});
		}
		exclude(values, newDef = this._def) {
			return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
				...this._def,
				...newDef
			});
		}
	};
	exports.ZodEnum = ZodEnum;
	ZodEnum.create = createZodEnum;
	var ZodNativeEnum = class extends ZodType {
		_parse(input) {
			const nativeEnumValues = util_js_1.util.getValidEnumValues(this._def.values);
			const ctx = this._getOrReturnCtx(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.string && ctx.parsedType !== util_js_1.ZodParsedType.number) {
				const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					expected: util_js_1.util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodError_js_1.ZodIssueCode.invalid_type
				});
				return parseUtil_js_1.INVALID;
			}
			if (!this._cache) this._cache = new Set(util_js_1.util.getValidEnumValues(this._def.values));
			if (!this._cache.has(input.data)) {
				const expectedValues = util_js_1.util.objectValues(nativeEnumValues);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					received: ctx.data,
					code: ZodError_js_1.ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return parseUtil_js_1.INVALID;
			}
			return (0, parseUtil_js_1.OK)(input.data);
		}
		get enum() {
			return this._def.values;
		}
	};
	exports.ZodNativeEnum = ZodNativeEnum;
	ZodNativeEnum.create = (values, params) => {
		return new ZodNativeEnum({
			values,
			typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
			...processCreateParams(params)
		});
	};
	var ZodPromise = class extends ZodType {
		unwrap() {
			return this._def.type;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== util_js_1.ZodParsedType.promise && ctx.common.async === false) {
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.promise,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			const promisified = ctx.parsedType === util_js_1.ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
			return (0, parseUtil_js_1.OK)(promisified.then((data) => {
				return this._def.type.parseAsync(data, {
					path: ctx.path,
					errorMap: ctx.common.contextualErrorMap
				});
			}));
		}
	};
	exports.ZodPromise = ZodPromise;
	ZodPromise.create = (schema, params) => {
		return new ZodPromise({
			type: schema,
			typeName: ZodFirstPartyTypeKind.ZodPromise,
			...processCreateParams(params)
		});
	};
	var ZodEffects = class extends ZodType {
		innerType() {
			return this._def.schema;
		}
		sourceType() {
			return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const effect = this._def.effect || null;
			const checkCtx = {
				addIssue: (arg) => {
					(0, parseUtil_js_1.addIssueToContext)(ctx, arg);
					if (arg.fatal) status.abort();
					else status.dirty();
				},
				get path() {
					return ctx.path;
				}
			};
			checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
			if (effect.type === "preprocess") {
				const processed = effect.transform(ctx.data, checkCtx);
				if (ctx.common.async) return Promise.resolve(processed).then(async (processed) => {
					if (status.value === "aborted") return parseUtil_js_1.INVALID;
					const result = await this._def.schema._parseAsync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return parseUtil_js_1.INVALID;
					if (result.status === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					if (status.value === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					return result;
				});
				else {
					if (status.value === "aborted") return parseUtil_js_1.INVALID;
					const result = this._def.schema._parseSync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return parseUtil_js_1.INVALID;
					if (result.status === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					if (status.value === "dirty") return (0, parseUtil_js_1.DIRTY)(result.value);
					return result;
				}
			}
			if (effect.type === "refinement") {
				const executeRefinement = (acc) => {
					const result = effect.refinement(acc, checkCtx);
					if (ctx.common.async) return Promise.resolve(result);
					if (result instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
					return acc;
				};
				if (ctx.common.async === false) {
					const inner = this._def.schema._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inner.status === "aborted") return parseUtil_js_1.INVALID;
					if (inner.status === "dirty") status.dirty();
					executeRefinement(inner.value);
					return {
						status: status.value,
						value: inner.value
					};
				} else return this._def.schema._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}).then((inner) => {
					if (inner.status === "aborted") return parseUtil_js_1.INVALID;
					if (inner.status === "dirty") status.dirty();
					return executeRefinement(inner.value).then(() => {
						return {
							status: status.value,
							value: inner.value
						};
					});
				});
			}
			if (effect.type === "transform") if (ctx.common.async === false) {
				const base = this._def.schema._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				if (!(0, parseUtil_js_1.isValid)(base)) return parseUtil_js_1.INVALID;
				const result = effect.transform(base.value, checkCtx);
				if (result instanceof Promise) throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
				return {
					status: status.value,
					value: result
				};
			} else return this._def.schema._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}).then((base) => {
				if (!(0, parseUtil_js_1.isValid)(base)) return parseUtil_js_1.INVALID;
				return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
					status: status.value,
					value: result
				}));
			});
			util_js_1.util.assertNever(effect);
		}
	};
	exports.ZodEffects = ZodEffects;
	exports.ZodTransformer = ZodEffects;
	ZodEffects.create = (schema, effect, params) => {
		return new ZodEffects({
			schema,
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			effect,
			...processCreateParams(params)
		});
	};
	ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
		return new ZodEffects({
			schema,
			effect: {
				type: "preprocess",
				transform: preprocess
			},
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			...processCreateParams(params)
		});
	};
	var ZodOptional = class extends ZodType {
		_parse(input) {
			if (this._getType(input) === util_js_1.ZodParsedType.undefined) return (0, parseUtil_js_1.OK)(void 0);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodOptional = ZodOptional;
	ZodOptional.create = (type, params) => {
		return new ZodOptional({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodOptional,
			...processCreateParams(params)
		});
	};
	var ZodNullable = class extends ZodType {
		_parse(input) {
			if (this._getType(input) === util_js_1.ZodParsedType.null) return (0, parseUtil_js_1.OK)(null);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodNullable = ZodNullable;
	ZodNullable.create = (type, params) => {
		return new ZodNullable({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodNullable,
			...processCreateParams(params)
		});
	};
	var ZodDefault = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			let data = ctx.data;
			if (ctx.parsedType === util_js_1.ZodParsedType.undefined) data = this._def.defaultValue();
			return this._def.innerType._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		removeDefault() {
			return this._def.innerType;
		}
	};
	exports.ZodDefault = ZodDefault;
	ZodDefault.create = (type, params) => {
		return new ZodDefault({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodDefault,
			defaultValue: typeof params.default === "function" ? params.default : () => params.default,
			...processCreateParams(params)
		});
	};
	var ZodCatch = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const newCtx = {
				...ctx,
				common: {
					...ctx.common,
					issues: []
				}
			};
			const result = this._def.innerType._parse({
				data: newCtx.data,
				path: newCtx.path,
				parent: { ...newCtx }
			});
			if ((0, parseUtil_js_1.isAsync)(result)) return result.then((result) => {
				return {
					status: "valid",
					value: result.status === "valid" ? result.value : this._def.catchValue({
						get error() {
							return new ZodError_js_1.ZodError(newCtx.common.issues);
						},
						input: newCtx.data
					})
				};
			});
			else return {
				status: "valid",
				value: result.status === "valid" ? result.value : this._def.catchValue({
					get error() {
						return new ZodError_js_1.ZodError(newCtx.common.issues);
					},
					input: newCtx.data
				})
			};
		}
		removeCatch() {
			return this._def.innerType;
		}
	};
	exports.ZodCatch = ZodCatch;
	ZodCatch.create = (type, params) => {
		return new ZodCatch({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodCatch,
			catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
			...processCreateParams(params)
		});
	};
	var ZodNaN = class extends ZodType {
		_parse(input) {
			if (this._getType(input) !== util_js_1.ZodParsedType.nan) {
				const ctx = this._getOrReturnCtx(input);
				(0, parseUtil_js_1.addIssueToContext)(ctx, {
					code: ZodError_js_1.ZodIssueCode.invalid_type,
					expected: util_js_1.ZodParsedType.nan,
					received: ctx.parsedType
				});
				return parseUtil_js_1.INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
	};
	exports.ZodNaN = ZodNaN;
	ZodNaN.create = (params) => {
		return new ZodNaN({
			typeName: ZodFirstPartyTypeKind.ZodNaN,
			...processCreateParams(params)
		});
	};
	exports.BRAND = Symbol("zod_brand");
	var ZodBranded = class extends ZodType {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const data = ctx.data;
			return this._def.type._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		unwrap() {
			return this._def.type;
		}
	};
	exports.ZodBranded = ZodBranded;
	var ZodPipeline = class ZodPipeline extends ZodType {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.common.async) {
				const handleAsync = async () => {
					const inResult = await this._def.in._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inResult.status === "aborted") return parseUtil_js_1.INVALID;
					if (inResult.status === "dirty") {
						status.dirty();
						return (0, parseUtil_js_1.DIRTY)(inResult.value);
					} else return this._def.out._parseAsync({
						data: inResult.value,
						path: ctx.path,
						parent: ctx
					});
				};
				return handleAsync();
			} else {
				const inResult = this._def.in._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				if (inResult.status === "aborted") return parseUtil_js_1.INVALID;
				if (inResult.status === "dirty") {
					status.dirty();
					return {
						status: "dirty",
						value: inResult.value
					};
				} else return this._def.out._parseSync({
					data: inResult.value,
					path: ctx.path,
					parent: ctx
				});
			}
		}
		static create(a, b) {
			return new ZodPipeline({
				in: a,
				out: b,
				typeName: ZodFirstPartyTypeKind.ZodPipeline
			});
		}
	};
	exports.ZodPipeline = ZodPipeline;
	var ZodReadonly = class extends ZodType {
		_parse(input) {
			const result = this._def.innerType._parse(input);
			const freeze = (data) => {
				if ((0, parseUtil_js_1.isValid)(data)) data.value = Object.freeze(data.value);
				return data;
			};
			return (0, parseUtil_js_1.isAsync)(result) ? result.then((data) => freeze(data)) : freeze(result);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	exports.ZodReadonly = ZodReadonly;
	ZodReadonly.create = (type, params) => {
		return new ZodReadonly({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodReadonly,
			...processCreateParams(params)
		});
	};
	function cleanParams(params, data) {
		const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
		return typeof p === "string" ? { message: p } : p;
	}
	function custom(check, _params = {}, fatal) {
		if (check) return ZodAny.create().superRefine((data, ctx) => {
			const r = check(data);
			if (r instanceof Promise) return r.then((r) => {
				if (!r) {
					const params = cleanParams(_params, data);
					const _fatal = params.fatal ?? fatal ?? true;
					ctx.addIssue({
						code: "custom",
						...params,
						fatal: _fatal
					});
				}
			});
			if (!r) {
				const params = cleanParams(_params, data);
				const _fatal = params.fatal ?? fatal ?? true;
				ctx.addIssue({
					code: "custom",
					...params,
					fatal: _fatal
				});
			}
		});
		return ZodAny.create();
	}
	exports.late = { object: ZodObject.lazycreate };
	var ZodFirstPartyTypeKind;
	(function(ZodFirstPartyTypeKind) {
		ZodFirstPartyTypeKind["ZodString"] = "ZodString";
		ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
		ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
		ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
		ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
		ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
		ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
		ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
		ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
		ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
		ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
		ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
		ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
		ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
		ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
		ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
		ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
		ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
		ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
		ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
		ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
		ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
		ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
		ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
		ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
		ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
		ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
		ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
		ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
		ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
		ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
		ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
		ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
		ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
		ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
		ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
	})(ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}));
	var instanceOfType = (cls, params = { message: `Input not instance of ${cls.name}` }) => custom((data) => data instanceof cls, params);
	exports.instanceof = instanceOfType;
	var stringType = ZodString.create;
	exports.string = stringType;
	var numberType = ZodNumber.create;
	exports.number = numberType;
	exports.nan = ZodNaN.create;
	exports.bigint = ZodBigInt.create;
	var booleanType = ZodBoolean.create;
	exports.boolean = booleanType;
	exports.date = ZodDate.create;
	exports.symbol = ZodSymbol.create;
	exports.undefined = ZodUndefined.create;
	exports.null = ZodNull.create;
	exports.any = ZodAny.create;
	exports.unknown = ZodUnknown.create;
	exports.never = ZodNever.create;
	exports.void = ZodVoid.create;
	exports.array = ZodArray.create;
	exports.object = ZodObject.create;
	exports.strictObject = ZodObject.strictCreate;
	exports.union = ZodUnion.create;
	exports.discriminatedUnion = ZodDiscriminatedUnion.create;
	exports.intersection = ZodIntersection.create;
	exports.tuple = ZodTuple.create;
	exports.record = ZodRecord.create;
	exports.map = ZodMap.create;
	exports.set = ZodSet.create;
	exports.function = ZodFunction.create;
	exports.lazy = ZodLazy.create;
	exports.literal = ZodLiteral.create;
	exports.enum = ZodEnum.create;
	exports.nativeEnum = ZodNativeEnum.create;
	exports.promise = ZodPromise.create;
	var effectsType = ZodEffects.create;
	exports.effect = effectsType;
	exports.transformer = effectsType;
	exports.optional = ZodOptional.create;
	exports.nullable = ZodNullable.create;
	exports.preprocess = ZodEffects.createWithPreprocess;
	exports.pipeline = ZodPipeline.create;
	var ostring = () => stringType().optional();
	exports.ostring = ostring;
	var onumber = () => numberType().optional();
	exports.onumber = onumber;
	var oboolean = () => booleanType().optional();
	exports.oboolean = oboolean;
	exports.coerce = {
		string: ((arg) => ZodString.create({
			...arg,
			coerce: true
		})),
		number: ((arg) => ZodNumber.create({
			...arg,
			coerce: true
		})),
		boolean: ((arg) => ZodBoolean.create({
			...arg,
			coerce: true
		})),
		bigint: ((arg) => ZodBigInt.create({
			...arg,
			coerce: true
		})),
		date: ((arg) => ZodDate.create({
			...arg,
			coerce: true
		}))
	};
	exports.NEVER = parseUtil_js_1.INVALID;
}));
//#endregion
//#region node_modules/zod/v3/external.cjs
var require_external = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$13) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$13, p)) __createBinding(exports$13, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_errors(), exports);
	__exportStar(require_parseUtil(), exports);
	__exportStar(require_typeAliases(), exports);
	__exportStar(require_util(), exports);
	__exportStar(require_types(), exports);
	__exportStar(require_ZodError(), exports);
}));
//#endregion
//#region node_modules/zod/index.cjs
var require_zod = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	var __exportStar = exports && exports.__exportStar || function(m, exports$12) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$12, p)) __createBinding(exports$12, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.z = void 0;
	var z = __importStar(require_external());
	exports.z = z;
	__exportStar(require_external(), exports);
	exports.default = z;
}));
//#endregion
//#region node_modules/@ton/ton/package.json
var require_package = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"name": "@ton/ton",
		"version": "16.2.4",
		"repository": "https://github.com/ton-org/ton.git",
		"author": "Whales Corp. <developers@whalescorp.com>",
		"license": "MIT",
		"main": "dist/index.js",
		"files": [
			"dist",
			"!*.test.*",
			"!*.spec.*",
			"!*.trait.*",
			"!__snapshots__",
			"!__testdata__",
			"!__tests__"
		],
		"scripts": {
			"build": "rm -fr dist && tsc -p ./tsconfig.build.json",
			"typecheck": "tsc",
			"test": "jest --verbose",
			"format": "biome format --write .",
			"format:check": "biome format .",
			"coverage": "jest -c ./jest-coverage.config.js",
			"release": "yarn build && yarn release-it --npm.yarn1"
		},
		"devDependencies": {
			"@biomejs/biome": "2.3.8",
			"@release-it/keep-a-changelog": "^5.0.0",
			"@swc/core": "^1.15.3",
			"@swc/jest": "^0.2.39",
			"@ton/core": "^0.63.0",
			"@ton/crypto": "3.2.0",
			"@ton/sandbox": "^0.40.0",
			"@ton/test-utils": "^0.12.0",
			"@types/jest": "^29.5.12",
			"@types/node": "^20.11.30",
			"jest": "^29.7.0",
			"release-it": "^17.1.1",
			"typescript": "^5.6.3"
		},
		"dependencies": {
			"axios": "1.15.0",
			"dataloader": "^2.0.0",
			"zod": "^3.21.4"
		},
		"peerDependencies": {
			"@ton/core": ">=0.63.0 <1.0.0",
			"@ton/crypto": ">=3.2.0"
		},
		"publishConfig": {
			"access": "public",
			"registry": "https://registry.npmjs.org/"
		},
		"release-it": {
			"github": { "release": true },
			"plugins": { "@release-it/keep-a-changelog": { "filename": "CHANGELOG.md" } }
		},
		"packageManager": "yarn@3.4.1"
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/client/api/HttpApi.js
var require_HttpApi = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpApi = void 0;
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var TonCache_1 = require_TonCache();
	var dataloader_1 = __importDefault(require_dataloader());
	var axios_1 = __importDefault(require_axios());
	var zod_1 = require_zod();
	var version = require_package().version;
	var blockIdExt = zod_1.z.object({
		"@type": zod_1.z.literal("ton.blockIdExt"),
		workchain: zod_1.z.number(),
		shard: zod_1.z.string(),
		seqno: zod_1.z.number(),
		root_hash: zod_1.z.string(),
		file_hash: zod_1.z.string()
	});
	var addressInformation = zod_1.z.object({
		balance: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
		extra_currencies: zod_1.z.optional(zod_1.z.array(zod_1.z.object({
			"@type": zod_1.z.literal("extraCurrency"),
			id: zod_1.z.number(),
			amount: zod_1.z.string()
		}))),
		state: zod_1.z.union([
			zod_1.z.literal("active"),
			zod_1.z.literal("uninitialized"),
			zod_1.z.literal("frozen")
		]),
		data: zod_1.z.string(),
		code: zod_1.z.string(),
		last_transaction_id: zod_1.z.object({
			"@type": zod_1.z.literal("internal.transactionId"),
			lt: zod_1.z.string(),
			hash: zod_1.z.string()
		}),
		block_id: blockIdExt,
		sync_utime: zod_1.z.number()
	});
	var bocResponse = zod_1.z.object({ "@type": zod_1.z.literal("ok") });
	var feeResponse = zod_1.z.object({
		"@type": zod_1.z.literal("query.fees"),
		source_fees: zod_1.z.object({
			"@type": zod_1.z.literal("fees"),
			in_fwd_fee: zod_1.z.number(),
			storage_fee: zod_1.z.number(),
			gas_fee: zod_1.z.number(),
			fwd_fee: zod_1.z.number()
		})
	});
	var callGetMethod = zod_1.z.object({
		gas_used: zod_1.z.number(),
		exit_code: zod_1.z.number(),
		stack: zod_1.z.array(zod_1.z.unknown())
	});
	var messageData = zod_1.z.union([
		zod_1.z.object({
			"@type": zod_1.z.literal("msg.dataRaw"),
			body: zod_1.z.string()
		}),
		zod_1.z.object({
			"@type": zod_1.z.literal("msg.dataText"),
			text: zod_1.z.string()
		}),
		zod_1.z.object({
			"@type": zod_1.z.literal("msg.dataDecryptedText"),
			text: zod_1.z.string()
		}),
		zod_1.z.object({
			"@type": zod_1.z.literal("msg.dataEncryptedText"),
			text: zod_1.z.string()
		})
	]);
	var message = zod_1.z.object({
		source: zod_1.z.string(),
		destination: zod_1.z.string(),
		value: zod_1.z.string(),
		fwd_fee: zod_1.z.string(),
		ihr_fee: zod_1.z.string(),
		created_lt: zod_1.z.string(),
		body_hash: zod_1.z.string(),
		msg_data: messageData,
		message: zod_1.z.string().optional()
	});
	var transaction = zod_1.z.object({
		data: zod_1.z.string(),
		utime: zod_1.z.number(),
		transaction_id: zod_1.z.object({
			lt: zod_1.z.string(),
			hash: zod_1.z.string()
		}),
		fee: zod_1.z.string(),
		storage_fee: zod_1.z.string(),
		other_fee: zod_1.z.string(),
		in_msg: zod_1.z.union([zod_1.z.undefined(), message]),
		out_msgs: zod_1.z.array(message)
	});
	var getTransactions = zod_1.z.array(transaction);
	var getMasterchain = zod_1.z.object({
		state_root_hash: zod_1.z.string(),
		last: blockIdExt,
		init: blockIdExt
	});
	var getShards = zod_1.z.object({ shards: zod_1.z.array(blockIdExt) });
	var blockShortTxt = zod_1.z.object({
		"@type": zod_1.z.literal("blocks.shortTxId"),
		mode: zod_1.z.number(),
		account: zod_1.z.string(),
		lt: zod_1.z.string(),
		hash: zod_1.z.string()
	});
	var getBlockTransactions = zod_1.z.object({
		id: blockIdExt,
		req_count: zod_1.z.number(),
		incomplete: zod_1.z.boolean(),
		transactions: zod_1.z.array(blockShortTxt)
	});
	var TypedCache = class {
		constructor(namespace, cache, codec, keyEncoder) {
			this.namespace = namespace;
			this.cache = cache;
			this.codec = codec;
			this.keyEncoder = keyEncoder;
		}
		async get(key) {
			let ex = await this.cache.get(this.namespace, this.keyEncoder(key));
			if (ex) {
				let decoded = this.codec.safeParse(JSON.parse(ex));
				if (decoded.success) return decoded.data;
			}
			return null;
		}
		async set(key, value) {
			if (value !== null) await this.cache.set(this.namespace, this.keyEncoder(key), JSON.stringify(value));
			else await this.cache.set(this.namespace, this.keyEncoder(key), null);
		}
	};
	var HttpApi = class {
		constructor(endpoint, parameters) {
			this.endpoint = endpoint;
			this.cache = new TonCache_1.InMemoryCache();
			this.parameters = {
				timeout: parameters?.timeout || 3e4,
				apiKey: parameters?.apiKey,
				adapter: parameters?.adapter
			};
			this.shardCache = new TypedCache("ton-shard", this.cache, zod_1.z.array(blockIdExt), (src) => src + "");
			this.shardLoader = new dataloader_1.default(async (src) => {
				return await Promise.all(src.map(async (v) => {
					const cached = await this.shardCache.get(v);
					if (cached) return cached;
					let loaded = (await this.doCall("shards", { seqno: v }, getShards)).shards;
					await this.shardCache.set(v, loaded);
					return loaded;
				}));
			});
			this.shardTransactionsCache = new TypedCache("ton-shard-tx", this.cache, getBlockTransactions, (src) => src.workchain + ":" + src.shard + ":" + src.seqno);
			this.shardTransactionsLoader = new dataloader_1.default(async (src) => {
				return await Promise.all(src.map(async (v) => {
					const cached = await this.shardTransactionsCache.get(v);
					if (cached) return cached;
					let loaded = await this.doCall("getBlockTransactions", {
						workchain: v.workchain,
						seqno: v.seqno,
						shard: v.shard
					}, getBlockTransactions);
					await this.shardTransactionsCache.set(v, loaded);
					return loaded;
				}));
			}, { cacheKeyFn: (src) => src.workchain + ":" + src.shard + ":" + src.seqno });
		}
		getAddressInformation(address) {
			return this.doCall("getAddressInformation", { address: address.toString() }, addressInformation);
		}
		async getTransactions(address, opts) {
			const inclusive = opts.inclusive;
			delete opts.inclusive;
			let hash = void 0;
			if (opts.hash) hash = Buffer.from(opts.hash, "base64").toString("hex");
			let limit = opts.limit;
			if (opts.hash && opts.lt && inclusive !== true) limit++;
			let res = await this.doCall("getTransactions", {
				address: address.toString(),
				...opts,
				limit,
				hash
			}, getTransactions);
			if (res.length > limit) res = res.slice(0, limit);
			if (opts.hash && opts.lt && inclusive !== true) {
				res.shift();
				return res;
			} else return res;
		}
		async getMasterchainInfo() {
			return await this.doCall("getMasterchainInfo", {}, getMasterchain);
		}
		async getShards(seqno) {
			return await this.shardLoader.load(seqno);
		}
		async getBlockTransactions(workchain, seqno, shard) {
			return await this.shardTransactionsLoader.load({
				workchain,
				seqno,
				shard
			});
		}
		async getTransaction(address, lt, hash) {
			let convHash = Buffer.from(hash, "base64").toString("hex");
			let ex = (await this.doCall("getTransactions", {
				address: address.toString(),
				lt,
				hash: convHash,
				limit: 1
			}, getTransactions)).find((v) => v.transaction_id.lt === lt && v.transaction_id.hash === hash);
			if (ex) return ex;
			else return null;
		}
		async callGetMethod(address, method, stack) {
			return await this.doCall("runGetMethod", {
				address: address.toString(),
				method,
				stack: serializeStack(stack)
			}, callGetMethod);
		}
		async sendBoc(body) {
			await this.doCall("sendBoc", { boc: body.toString("base64") }, bocResponse);
		}
		async estimateFee(address, args) {
			return await this.doCall("estimateFee", {
				address: address.toString(),
				body: args.body.toBoc().toString("base64"),
				init_data: args.initData ? args.initData.toBoc().toString("base64") : "",
				init_code: args.initCode ? args.initCode.toBoc().toString("base64") : "",
				ignore_chksig: args.ignoreSignature
			}, feeResponse);
		}
		async tryLocateResultTx(source, destination, created_lt) {
			return await this.doCall("tryLocateResultTx", {
				source: source.toString(),
				destination: destination.toString(),
				created_lt
			}, transaction);
		}
		async tryLocateSourceTx(source, destination, created_lt) {
			return await this.doCall("tryLocateSourceTx", {
				source: source.toString(),
				destination: destination.toString(),
				created_lt
			}, transaction);
		}
		async doCall(method, body, codec) {
			let headers = {
				"Content-Type": "application/json",
				"X-Ton-Client-Version": version
			};
			if (this.parameters.apiKey) headers["X-API-Key"] = this.parameters.apiKey;
			let res = await axios_1.default.post(this.endpoint, JSON.stringify({
				id: "1",
				jsonrpc: "2.0",
				method,
				params: body
			}), {
				headers,
				timeout: this.parameters.timeout,
				adapter: this.parameters.adapter
			});
			if (res.status !== 200 || !res.data.ok) throw Error("Received error: " + JSON.stringify(res.data));
			let decoded = codec.safeParse(res.data.result);
			if (decoded.success) return decoded.data;
			else throw Error("Malformed response: " + decoded.error.format()._errors.join(", "));
		}
	};
	exports.HttpApi = HttpApi;
	function serializeStack(src) {
		let stack = [];
		for (let s of src) if (s.type === "int") stack.push(["num", s.value.toString()]);
		else if (s.type === "cell") stack.push(["tvm.Cell", s.cell.toBoc().toString("base64")]);
		else if (s.type === "slice") stack.push(["tvm.Slice", s.cell.toBoc().toString("base64")]);
		else if (s.type === "builder") stack.push(["tvm.Builder", s.cell.toBoc().toString("base64")]);
		else throw Error("Unsupported stack item type: " + s.type);
		return stack;
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/client/TonClient.js
var require_TonClient = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TonClient = void 0;
	var HttpApi_1 = require_HttpApi();
	var core_1 = require_dist$1();
	var TonClient = class {
		constructor(parameters) {
			this.parameters = { endpoint: parameters.endpoint };
			this.api = new HttpApi_1.HttpApi(this.parameters.endpoint, {
				timeout: parameters.timeout,
				apiKey: parameters.apiKey,
				adapter: parameters.httpAdapter
			});
		}
		/**
		* Get Address Balance
		* @param address address for balance check
		* @returns balance
		*/
		async getBalance(address) {
			return (await this.getContractState(address)).balance;
		}
		/**
		* Invoke get method
		* @param address contract address
		* @param name name of method
		* @param params optional parameters
		* @returns stack and gas_used field
		*/
		async runMethod(address, name, stack = []) {
			let res = await this.api.callGetMethod(address, name, stack);
			if (res.exit_code !== 0) throw Error("Unable to execute get method. Got exit_code: " + res.exit_code);
			return {
				gas_used: res.gas_used,
				stack: parseStack(res.stack)
			};
		}
		/**
		* Invoke get method
		* @param address contract address
		* @param name name of method
		* @param params optional parameters
		* @returns stack and gas_used field
		* @deprecated use runMethod instead
		*/
		async callGetMethod(address, name, stack = []) {
			return this.runMethod(address, name, stack);
		}
		/**
		* Invoke get method that returns error code instead of throwing error
		* @param address contract address
		* @param name name of method
		* @param params optional parameters
		* @returns stack and gas_used field
		*/
		async runMethodWithError(address, name, params = []) {
			let res = await this.api.callGetMethod(address, name, params);
			return {
				gas_used: res.gas_used,
				stack: parseStack(res.stack),
				exit_code: res.exit_code
			};
		}
		/**
		* Invoke get method that returns error code instead of throwing error
		* @param address contract address
		* @param name name of method
		* @param params optional parameters
		* @returns stack and gas_used field
		* @deprecated use runMethodWithError instead
		*/
		async callGetMethodWithError(address, name, stack = []) {
			return this.runMethodWithError(address, name, stack);
		}
		/**
		* Get transactions
		* @param address address
		*/
		async getTransactions(address, opts) {
			let tx = await this.api.getTransactions(address, opts);
			let res = [];
			for (let r of tx) res.push((0, core_1.loadTransaction)(core_1.Cell.fromBoc(Buffer.from(r.data, "base64"))[0].beginParse()));
			return res;
		}
		/**
		* Get transaction by it's id
		* @param address address
		* @param lt logical time
		* @param hash transaction hash
		* @returns transaction or null if not exist
		*/
		async getTransaction(address, lt, hash) {
			let res = await this.api.getTransaction(address, lt, hash);
			if (res) return (0, core_1.loadTransaction)(core_1.Cell.fromBoc(Buffer.from(res.data, "base64"))[0].beginParse());
			else return null;
		}
		/**
		* Locate outcoming transaction of destination address by incoming message
		* @param source message source address
		* @param destination message destination address
		* @param created_lt message's created lt
		* @returns transaction
		*/
		async tryLocateResultTx(source, destination, created_lt) {
			let res = await this.api.tryLocateResultTx(source, destination, created_lt);
			return (0, core_1.loadTransaction)(core_1.Cell.fromBase64(res.data).beginParse());
		}
		/**
		* Locate incoming transaction of source address by outcoming message
		* @param source message source address
		* @param destination message destination address
		* @param created_lt message's created lt
		* @returns transaction
		*/
		async tryLocateSourceTx(source, destination, created_lt) {
			let res = await this.api.tryLocateSourceTx(source, destination, created_lt);
			return (0, core_1.loadTransaction)(core_1.Cell.fromBase64(res.data).beginParse());
		}
		/**
		* Fetch latest masterchain info
		* @returns masterchain info
		*/
		async getMasterchainInfo() {
			let r = await this.api.getMasterchainInfo();
			return {
				workchain: r.init.workchain,
				shard: r.last.shard,
				initSeqno: r.init.seqno,
				latestSeqno: r.last.seqno
			};
		}
		/**
		* Fetch latest workchain shards
		* @param seqno masterchain seqno
		*/
		async getWorkchainShards(seqno) {
			return (await this.api.getShards(seqno)).map((m) => ({
				workchain: m.workchain,
				shard: m.shard,
				seqno: m.seqno
			}));
		}
		/**
		* Fetch transactions inf shards
		* @param workchain
		* @param seqno
		* @param shard
		*/
		async getShardTransactions(workchain, seqno, shard) {
			let tx = await this.api.getBlockTransactions(workchain, seqno, shard);
			if (tx.incomplete) throw Error("Unsupported");
			return tx.transactions.map((v) => ({
				account: core_1.Address.parseRaw(v.account),
				lt: v.lt,
				hash: v.hash
			}));
		}
		/**
		* Send message to a network
		* @param src source message
		*/
		async sendMessage(src) {
			const boc = (0, core_1.beginCell)().store((0, core_1.storeMessage)(src)).endCell().toBoc();
			await this.api.sendBoc(boc);
		}
		/**
		* Send file to a network
		* @param src source file
		*/
		async sendFile(src) {
			await this.api.sendBoc(src);
		}
		/**
		* Estimate fees for external message
		* @param address target address
		* @returns
		*/
		async estimateExternalMessageFee(address, args) {
			return await this.api.estimateFee(address, {
				body: args.body,
				initCode: args.initCode,
				initData: args.initData,
				ignoreSignature: args.ignoreSignature
			});
		}
		/**
		* Send external message to contract
		* @param contract contract to send message
		* @param src message body
		*/
		async sendExternalMessage(contract, src) {
			if (await this.isContractDeployed(contract.address) || !contract.init) {
				const message = (0, core_1.external)({
					to: contract.address,
					body: src
				});
				await this.sendMessage(message);
			} else {
				const message = (0, core_1.external)({
					to: contract.address,
					init: contract.init,
					body: src
				});
				await this.sendMessage(message);
			}
		}
		/**
		* Check if contract is deployed
		* @param address addres to check
		* @returns true if contract is in active state
		*/
		async isContractDeployed(address) {
			return (await this.getContractState(address)).state === "active";
		}
		/**
		* Resolves contract state
		* @param address contract address
		*/
		async getContractState(address) {
			let info = await this.api.getAddressInformation(address);
			let balance = BigInt(info.balance);
			let state = info.state;
			return {
				balance,
				extra_currencies: info.extra_currencies,
				state,
				code: info.code !== "" ? Buffer.from(info.code, "base64") : null,
				data: info.data !== "" ? Buffer.from(info.data, "base64") : null,
				lastTransaction: info.last_transaction_id.lt !== "0" ? {
					lt: info.last_transaction_id.lt,
					hash: info.last_transaction_id.hash
				} : null,
				blockId: {
					workchain: info.block_id.workchain,
					shard: info.block_id.shard,
					seqno: info.block_id.seqno
				},
				timestampt: info.sync_utime
			};
		}
		/**
		* Open contract
		* @param src source contract
		* @returns contract
		*/
		open(src) {
			return (0, core_1.openContract)(src, (args) => createProvider(this, args.address, args.init));
		}
		/**
		* Create a provider
		* @param address address
		* @param init optional init
		* @returns provider
		*/
		provider(address, init) {
			return createProvider(this, address, init ?? null);
		}
	};
	exports.TonClient = TonClient;
	function parseStackEntry(x) {
		const typeName = x["@type"];
		switch (typeName) {
			case "tvm.list":
			case "tvm.tuple": return x.elements.map(parseStackEntry);
			case "tvm.cell": return core_1.Cell.fromBoc(Buffer.from(x.bytes, "base64"))[0];
			case "tvm.slice": return core_1.Cell.fromBoc(Buffer.from(x.bytes, "base64"))[0];
			case "tvm.stackEntryCell": return parseStackEntry(x.cell);
			case "tvm.stackEntrySlice": return parseStackEntry(x.slice);
			case "tvm.stackEntryTuple": return parseStackEntry(x.tuple);
			case "tvm.stackEntryList": return parseStackEntry(x.list);
			case "tvm.stackEntryNumber": return parseStackEntry(x.number);
			case "tvm.numberDecimal": return BigInt(x.number);
			default: throw Error("Unsupported item type: " + typeName);
		}
	}
	function parseStackItem(s) {
		if (s[0] === "num") {
			let val = s[1];
			if (val.startsWith("-")) return {
				type: "int",
				value: -BigInt(val.slice(1))
			};
			else return {
				type: "int",
				value: BigInt(val)
			};
		} else if (s[0] === "null") return { type: "null" };
		else if (s[0] === "cell") return {
			type: "cell",
			cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, "base64"))[0]
		};
		else if (s[0] === "slice") return {
			type: "slice",
			cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, "base64"))[0]
		};
		else if (s[0] === "builder") return {
			type: "builder",
			cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, "base64"))[0]
		};
		else if (s[0] === "tuple" || s[0] === "list") {
			if (s[1].elements.length === 0) return { type: "null" };
			return {
				type: "tuple",
				items: s[1].elements.map(parseStackEntry)
			};
		} else throw Error("Unsupported stack item type: " + s[0]);
	}
	function parseStack(src) {
		let stack = [];
		for (let s of src) stack.push(parseStackItem(s));
		return new core_1.TupleReader(stack);
	}
	function createProvider(client, address, init) {
		return {
			async getState() {
				let state = await client.getContractState(address);
				let balance = state.balance;
				let last = state.lastTransaction ? {
					lt: BigInt(state.lastTransaction.lt),
					hash: Buffer.from(state.lastTransaction.hash, "base64")
				} : null;
				let ecMap = null;
				let storage;
				if (state.state === "active") storage = {
					type: "active",
					code: state.code ? state.code : null,
					data: state.data ? state.data : null
				};
				else if (state.state === "uninitialized") storage = { type: "uninit" };
				else if (state.state === "frozen") storage = {
					type: "frozen",
					stateHash: Buffer.alloc(0)
				};
				else throw Error("Unsupported state");
				if (state.extra_currencies && state.extra_currencies.length > 0) {
					ecMap = {};
					for (let ec of state.extra_currencies) ecMap[ec.id] = BigInt(ec.amount);
				}
				return {
					balance,
					extracurrency: ecMap,
					last,
					state: storage
				};
			},
			async get(name, args) {
				if (typeof name !== "string") throw new Error("Method name must be a string for TonClient provider");
				return { stack: (await client.runMethod(address, name, args)).stack };
			},
			async external(message) {
				let neededInit = null;
				if (init && !await client.isContractDeployed(address)) neededInit = init;
				const ext = (0, core_1.external)({
					to: address,
					init: neededInit,
					body: message
				});
				let boc = (0, core_1.beginCell)().store((0, core_1.storeMessage)(ext)).endCell().toBoc();
				await client.sendFile(boc);
			},
			async internal(via, message) {
				let neededInit = null;
				if (init && !await client.isContractDeployed(address)) neededInit = init;
				let bounce = true;
				if (message.bounce !== null && message.bounce !== void 0) bounce = message.bounce;
				let value;
				if (typeof message.value === "string") value = (0, core_1.toNano)(message.value);
				else value = message.value;
				let body = null;
				if (typeof message.body === "string") body = (0, core_1.comment)(message.body);
				else if (message.body) body = message.body;
				await via.send({
					to: address,
					value,
					bounce,
					sendMode: message.sendMode,
					extracurrency: message.extracurrency,
					init: neededInit,
					body
				});
			},
			open(contract) {
				return (0, core_1.openContract)(contract, (args) => createProvider(client, args.address, args.init ?? null));
			},
			getTransactions(address, lt, hash, limit) {
				return client.getTransactions(address, {
					limit: limit ?? 100,
					lt: lt.toString(),
					hash: hash.toString("base64"),
					inclusive: true
				});
			}
		};
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/utils/toUrlSafe.js
var require_toUrlSafe = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toUrlSafe = toUrlSafe;
	function toUrlSafe(src) {
		while (src.indexOf("/") >= 0) src = src.replace("/", "_");
		while (src.indexOf("+") >= 0) src = src.replace("+", "-");
		while (src.indexOf("=") >= 0) src = src.replace("=", "");
		return src;
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/client/TonClient4.js
var require_TonClient4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
		if (kind === "m") throw new TypeError("Private method is not writable");
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
		return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
	};
	var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f) {
		if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
		if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
		return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	var _TonClient4_endpoint, _TonClient4_timeout, _TonClient4_adapter, _TonClient4_axios;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TonClient4 = void 0;
	var axios_1 = __importDefault(require_axios());
	var core_1 = require_dist$1();
	var toUrlSafe_1 = require_toUrlSafe();
	var zod_1 = require_zod();
	var TonClient4 = class {
		constructor(args) {
			_TonClient4_endpoint.set(this, void 0);
			_TonClient4_timeout.set(this, void 0);
			_TonClient4_adapter.set(this, void 0);
			_TonClient4_axios.set(this, void 0);
			__classPrivateFieldSet(this, _TonClient4_axios, axios_1.default.create(), "f");
			__classPrivateFieldSet(this, _TonClient4_endpoint, args.endpoint, "f");
			__classPrivateFieldSet(this, _TonClient4_timeout, args.timeout || 5e3, "f");
			__classPrivateFieldSet(this, _TonClient4_adapter, args.httpAdapter, "f");
			if (args.requestInterceptor) __classPrivateFieldGet(this, _TonClient4_axios, "f").interceptors.request.use(args.requestInterceptor);
		}
		/**
		* Get Last Block
		* @returns last block info
		*/
		async getLastBlock() {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/latest", {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let lastBlock = lastBlockCodec.safeParse(res.data);
			if (!lastBlock.success) throw Error("Mailformed response: " + lastBlock.error.format()._errors.join(", "));
			return lastBlock.data;
		}
		/**
		* Get block info
		* @param seqno block sequence number
		* @returns block info
		*/
		async getBlock(seqno) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno, {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let block = blockCodec.safeParse(res.data);
			if (!block.success) throw Error("Mailformed response");
			if (!block.data.exist) throw Error("Block is out of scope");
			return block.data.block;
		}
		/**
		* Get block info by unix timestamp
		* @param ts unix timestamp
		* @returns block info
		*/
		async getBlockByUtime(ts) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/utime/" + ts, {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let block = blockCodec.safeParse(res.data);
			if (!block.success) throw Error("Mailformed response");
			if (!block.data.exist) throw Error("Block is out of scope");
			return block.data.block;
		}
		/**
		* Get block info by unix timestamp
		* @param seqno block sequence number
		* @param address account address
		* @returns account info
		*/
		async getAccount(seqno, address) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno + "/" + address.toString({ urlSafe: true }), {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let account = accountCodec.safeParse(res.data);
			if (!account.success) throw Error("Mailformed response");
			return account.data;
		}
		/**
		* Get account lite info (without code and data)
		* @param seqno block sequence number
		* @param address account address
		* @returns account lite info
		*/
		async getAccountLite(seqno, address) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno + "/" + address.toString({ urlSafe: true }) + "/lite", {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let account = accountLiteCodec.safeParse(res.data);
			if (!account.success) throw Error("Mailformed response");
			return account.data;
		}
		/**
		* Check if contract is deployed
		* @param address addres to check
		* @returns true if contract is in active state
		*/
		async isContractDeployed(seqno, address) {
			return (await this.getAccountLite(seqno, address)).account.state.type === "active";
		}
		/**
		* Check if account was updated since
		* @param seqno block sequence number
		* @param address account address
		* @param lt account last transaction lt
		* @returns account change info
		*/
		async isAccountChanged(seqno, address, lt) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno + "/" + address.toString({ urlSafe: true }) + "/changed/" + lt.toString(10), {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let changed = changedCodec.safeParse(res.data);
			if (!changed.success) throw Error("Mailformed response");
			return changed.data;
		}
		/**
		* Load unparsed account transactions
		* @param address address
		* @param lt last transaction lt
		* @param hash last transaction hash
		* @returns unparsed transactions
		*/
		async getAccountTransactions(address, lt, hash) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/account/" + address.toString({ urlSafe: true }) + "/tx/" + lt.toString(10) + "/" + (0, toUrlSafe_1.toUrlSafe)(hash.toString("base64")), {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let transactions = transactionsCodec.safeParse(res.data);
			if (!transactions.success) throw Error("Mailformed response");
			let data = transactions.data;
			let tx = [];
			let cells = core_1.Cell.fromBoc(Buffer.from(data.boc, "base64"));
			for (let i = 0; i < data.blocks.length; i++) tx.push({
				block: data.blocks[i],
				tx: (0, core_1.loadTransaction)(cells[i].beginParse())
			});
			return tx;
		}
		/**
		* Load parsed account transactions
		* @param address address
		* @param lt last transaction lt
		* @param hash last transaction hash
		* @param count number of transactions to load
		* @returns parsed transactions
		*/
		async getAccountTransactionsParsed(address, lt, hash, count = 20) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/account/" + address.toString({ urlSafe: true }) + "/tx/parsed/" + lt.toString(10) + "/" + (0, toUrlSafe_1.toUrlSafe)(hash.toString("base64")), {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f"),
				params: { count }
			});
			let parsedTransactionsRes = parsedTransactionsCodec.safeParse(res.data);
			if (!parsedTransactionsRes.success) throw Error("Mailformed response");
			return parsedTransactionsRes.data;
		}
		/**
		* Get network config
		* @param seqno block sequence number
		* @param ids optional config ids
		* @returns network config
		*/
		async getConfig(seqno, ids) {
			let tail = "";
			if (ids && ids.length > 0) tail = "/" + [...ids].sort().join(",");
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno + "/config" + tail, {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let config = configCodec.safeParse(res.data);
			if (!config.success) throw Error("Mailformed response");
			return config.data;
		}
		/**
		* Execute run method
		* @param seqno block sequence number
		* @param address account address
		* @param name method name
		* @param args method arguments
		* @returns method result
		*/
		async runMethod(seqno, address, name, args) {
			let tail = args && args.length > 0 ? "/" + (0, toUrlSafe_1.toUrlSafe)((0, core_1.serializeTuple)(args).toBoc({
				idx: false,
				crc32: false
			}).toString("base64")) : "";
			let url = __classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/block/" + seqno + "/" + address.toString({ urlSafe: true }) + "/run/" + encodeURIComponent(name) + tail;
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").get(url, {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			let runMethod = runMethodCodec.safeParse(res.data);
			if (!runMethod.success) throw Error("Mailformed response");
			let resultTuple = runMethod.data.resultRaw ? (0, core_1.parseTuple)(core_1.Cell.fromBoc(Buffer.from(runMethod.data.resultRaw, "base64"))[0]) : [];
			return {
				exitCode: runMethod.data.exitCode,
				result: resultTuple,
				resultRaw: runMethod.data.resultRaw,
				block: runMethod.data.block,
				shardBlock: runMethod.data.shardBlock,
				reader: new core_1.TupleReader(resultTuple)
			};
		}
		/**
		* Send external message
		* @param message message boc
		* @returns message status
		*/
		async sendMessage(message) {
			let res = await __classPrivateFieldGet(this, _TonClient4_axios, "f").post(__classPrivateFieldGet(this, _TonClient4_endpoint, "f") + "/send", { boc: message.toString("base64") }, {
				adapter: __classPrivateFieldGet(this, _TonClient4_adapter, "f"),
				timeout: __classPrivateFieldGet(this, _TonClient4_timeout, "f")
			});
			if (!sendCodec.safeParse(res.data).success) throw Error("Mailformed response");
			return { status: res.data.status };
		}
		/**
		* Open smart contract
		* @param contract contract
		* @returns opened contract
		*/
		open(contract) {
			return (0, core_1.openContract)(contract, (args) => createProvider(this, null, args.address, args.init));
		}
		/**
		* Open smart contract
		* @param block block number
		* @param contract contract
		* @returns opened contract
		*/
		openAt(block, contract) {
			return (0, core_1.openContract)(contract, (args) => createProvider(this, block, args.address, args.init));
		}
		/**
		* Create provider
		* @param address address
		* @param init optional init data
		* @returns provider
		*/
		provider(address, init) {
			return createProvider(this, null, address, init ?? null);
		}
		/**
		* Create provider at specified block number
		* @param block block number
		* @param address address
		* @param init optional init data
		* @returns provider
		*/
		providerAt(block, address, init) {
			return createProvider(this, block, address, init ?? null);
		}
	};
	exports.TonClient4 = TonClient4;
	_TonClient4_endpoint = /* @__PURE__ */ new WeakMap(), _TonClient4_timeout = /* @__PURE__ */ new WeakMap(), _TonClient4_adapter = /* @__PURE__ */ new WeakMap(), _TonClient4_axios = /* @__PURE__ */ new WeakMap();
	function createProvider(client, block, address, init) {
		return {
			async getState() {
				let sq = block;
				if (sq === null) sq = (await client.getLastBlock()).last.seqno;
				let state = await client.getAccount(sq, address);
				let last = state.account.last ? {
					lt: BigInt(state.account.last.lt),
					hash: Buffer.from(state.account.last.hash, "base64")
				} : null;
				let storage;
				if (state.account.state.type === "active") storage = {
					type: "active",
					code: state.account.state.code ? Buffer.from(state.account.state.code, "base64") : null,
					data: state.account.state.data ? Buffer.from(state.account.state.data, "base64") : null
				};
				else if (state.account.state.type === "uninit") storage = { type: "uninit" };
				else if (state.account.state.type === "frozen") storage = {
					type: "frozen",
					stateHash: Buffer.from(state.account.state.stateHash, "base64")
				};
				else throw Error("Unsupported state");
				let ecMap = null;
				if (state.account.balance.currencies) {
					ecMap = {};
					let currencies = state.account.balance.currencies;
					for (let [k, v] of Object.entries(currencies)) ecMap[Number(k)] = BigInt(v);
				}
				return {
					balance: BigInt(state.account.balance.coins),
					extracurrency: ecMap,
					last,
					state: storage
				};
			},
			async get(name, args) {
				if (typeof name !== "string") throw new Error("Method name must be a string for TonClient4 provider");
				let sq = block;
				if (sq === null) sq = (await client.getLastBlock()).last.seqno;
				let method = await client.runMethod(sq, address, name, args);
				if (method.exitCode !== 0 && method.exitCode !== 1) throw Error("Exit code: " + method.exitCode);
				return { stack: new core_1.TupleReader(method.result) };
			},
			async external(message) {
				let last = await client.getLastBlock();
				let neededInit = null;
				if (init && (await client.getAccountLite(last.last.seqno, address)).account.state.type !== "active") neededInit = init;
				const ext = (0, core_1.external)({
					to: address,
					init: neededInit,
					body: message
				});
				let pkg = (0, core_1.beginCell)().store((0, core_1.storeMessage)(ext)).endCell().toBoc();
				await client.sendMessage(pkg);
			},
			async internal(via, message) {
				let last = await client.getLastBlock();
				let neededInit = null;
				if (init && (await client.getAccountLite(last.last.seqno, address)).account.state.type !== "active") neededInit = init;
				let bounce = true;
				if (message.bounce !== null && message.bounce !== void 0) bounce = message.bounce;
				let value;
				if (typeof message.value === "string") value = (0, core_1.toNano)(message.value);
				else value = message.value;
				let body = null;
				if (typeof message.body === "string") body = (0, core_1.comment)(message.body);
				else if (message.body) body = message.body;
				await via.send({
					to: address,
					value,
					extracurrency: message.extracurrency,
					bounce,
					sendMode: message.sendMode,
					init: neededInit,
					body
				});
			},
			open(contract) {
				return (0, core_1.openContract)(contract, (args) => createProvider(client, block, args.address, args.init ?? null));
			},
			async getTransactions(address, lt, hash, limit) {
				const useLimit = typeof limit === "number";
				if (useLimit && limit <= 0) return [];
				let transactions = [];
				do {
					const txs = await client.getAccountTransactions(address, lt, hash);
					const firstTx = txs[0].tx;
					const [firstLt, firstHash] = [firstTx.lt, firstTx.hash()];
					if (transactions.length > 0 && firstLt === lt && firstHash.equals(hash)) txs.shift();
					if (txs.length === 0) break;
					const lastTx = txs[txs.length - 1].tx;
					const [lastLt, lastHash] = [lastTx.lt, lastTx.hash()];
					if (lastLt === lt && lastHash.equals(hash)) break;
					transactions.push(...txs.map((tx) => tx.tx));
					lt = lastLt;
					hash = lastHash;
				} while (useLimit && transactions.length < limit);
				if (useLimit) transactions = transactions.slice(0, limit);
				return transactions;
			}
		};
	}
	var lastBlockCodec = zod_1.z.object({
		last: zod_1.z.object({
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			workchain: zod_1.z.number(),
			fileHash: zod_1.z.string(),
			rootHash: zod_1.z.string()
		}),
		init: zod_1.z.object({
			fileHash: zod_1.z.string(),
			rootHash: zod_1.z.string()
		}),
		stateRootHash: zod_1.z.string(),
		now: zod_1.z.number()
	});
	var blockCodec = zod_1.z.union([zod_1.z.object({ exist: zod_1.z.literal(false) }), zod_1.z.object({
		exist: zod_1.z.literal(true),
		block: zod_1.z.object({ shards: zod_1.z.array(zod_1.z.object({
			workchain: zod_1.z.number(),
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			rootHash: zod_1.z.string(),
			fileHash: zod_1.z.string(),
			transactions: zod_1.z.array(zod_1.z.object({
				account: zod_1.z.string(),
				hash: zod_1.z.string(),
				lt: zod_1.z.string()
			}))
		})) })
	})]);
	var storageStatCodec = zod_1.z.object({
		lastPaid: zod_1.z.number(),
		duePayment: zod_1.z.union([zod_1.z.null(), zod_1.z.string()]),
		used: zod_1.z.object({
			bits: zod_1.z.number(),
			cells: zod_1.z.number(),
			publicCells: zod_1.z.number().optional()
		})
	});
	var accountCodec = zod_1.z.object({
		account: zod_1.z.object({
			state: zod_1.z.union([
				zod_1.z.object({ type: zod_1.z.literal("uninit") }),
				zod_1.z.object({
					type: zod_1.z.literal("active"),
					code: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]),
					data: zod_1.z.union([zod_1.z.string(), zod_1.z.null()])
				}),
				zod_1.z.object({
					type: zod_1.z.literal("frozen"),
					stateHash: zod_1.z.string()
				})
			]),
			balance: zod_1.z.object({
				coins: zod_1.z.string(),
				currencies: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
			}),
			last: zod_1.z.union([zod_1.z.null(), zod_1.z.object({
				lt: zod_1.z.string(),
				hash: zod_1.z.string()
			})]),
			storageStat: zod_1.z.union([zod_1.z.null(), storageStatCodec])
		}),
		block: zod_1.z.object({
			workchain: zod_1.z.number(),
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			rootHash: zod_1.z.string(),
			fileHash: zod_1.z.string()
		})
	});
	var accountLiteCodec = zod_1.z.object({ account: zod_1.z.object({
		state: zod_1.z.union([
			zod_1.z.object({ type: zod_1.z.literal("uninit") }),
			zod_1.z.object({
				type: zod_1.z.literal("active"),
				codeHash: zod_1.z.string(),
				dataHash: zod_1.z.string()
			}),
			zod_1.z.object({
				type: zod_1.z.literal("frozen"),
				stateHash: zod_1.z.string()
			})
		]),
		balance: zod_1.z.object({
			coins: zod_1.z.string(),
			currencies: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
		}),
		last: zod_1.z.union([zod_1.z.null(), zod_1.z.object({
			lt: zod_1.z.string(),
			hash: zod_1.z.string()
		})]),
		storageStat: zod_1.z.union([zod_1.z.null(), storageStatCodec])
	}) });
	var changedCodec = zod_1.z.object({
		changed: zod_1.z.boolean(),
		block: zod_1.z.object({
			workchain: zod_1.z.number(),
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			rootHash: zod_1.z.string(),
			fileHash: zod_1.z.string()
		})
	});
	var runMethodCodec = zod_1.z.object({
		exitCode: zod_1.z.number(),
		resultRaw: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]),
		block: zod_1.z.object({
			workchain: zod_1.z.number(),
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			rootHash: zod_1.z.string(),
			fileHash: zod_1.z.string()
		}),
		shardBlock: zod_1.z.object({
			workchain: zod_1.z.number(),
			seqno: zod_1.z.number(),
			shard: zod_1.z.string(),
			rootHash: zod_1.z.string(),
			fileHash: zod_1.z.string()
		})
	});
	var configCodec = zod_1.z.object({ config: zod_1.z.object({
		cell: zod_1.z.string(),
		address: zod_1.z.string(),
		globalBalance: zod_1.z.object({ coins: zod_1.z.string() })
	}) });
	var sendCodec = zod_1.z.object({ status: zod_1.z.number() });
	var blocksCodec = zod_1.z.array(zod_1.z.object({
		workchain: zod_1.z.number(),
		seqno: zod_1.z.number(),
		shard: zod_1.z.string(),
		rootHash: zod_1.z.string(),
		fileHash: zod_1.z.string()
	}));
	var transactionsCodec = zod_1.z.object({
		blocks: blocksCodec,
		boc: zod_1.z.string()
	});
	var parsedAddressExternalCodec = zod_1.z.object({
		bits: zod_1.z.number(),
		data: zod_1.z.string()
	});
	var parsedMessageInfoCodec = zod_1.z.union([
		zod_1.z.object({
			type: zod_1.z.literal("internal"),
			value: zod_1.z.string(),
			dest: zod_1.z.string(),
			src: zod_1.z.string(),
			bounced: zod_1.z.boolean(),
			bounce: zod_1.z.boolean(),
			ihrDisabled: zod_1.z.boolean(),
			createdAt: zod_1.z.number(),
			createdLt: zod_1.z.string(),
			fwdFee: zod_1.z.string(),
			ihrFee: zod_1.z.string()
		}),
		zod_1.z.object({
			type: zod_1.z.literal("external-in"),
			dest: zod_1.z.string(),
			src: zod_1.z.union([parsedAddressExternalCodec, zod_1.z.null()]),
			importFee: zod_1.z.string()
		}),
		zod_1.z.object({
			type: zod_1.z.literal("external-out"),
			dest: zod_1.z.union([parsedAddressExternalCodec, zod_1.z.null()])
		})
	]);
	var parsedStateInitCodec = zod_1.z.object({
		splitDepth: zod_1.z.union([zod_1.z.number(), zod_1.z.null()]),
		code: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]),
		data: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]),
		special: zod_1.z.union([zod_1.z.object({
			tick: zod_1.z.boolean(),
			tock: zod_1.z.boolean()
		}), zod_1.z.null()])
	});
	var parsedMessageCodec = zod_1.z.object({
		body: zod_1.z.string(),
		info: parsedMessageInfoCodec,
		init: zod_1.z.union([parsedStateInitCodec, zod_1.z.null()])
	});
	var accountStatusCodec = zod_1.z.union([
		zod_1.z.literal("uninitialized"),
		zod_1.z.literal("frozen"),
		zod_1.z.literal("active"),
		zod_1.z.literal("non-existing")
	]);
	var txBodyCodec = zod_1.z.union([zod_1.z.object({
		type: zod_1.z.literal("comment"),
		comment: zod_1.z.string()
	}), zod_1.z.object({
		type: zod_1.z.literal("payload"),
		cell: zod_1.z.string()
	})]);
	var parsedOperationItemCodec = zod_1.z.union([zod_1.z.object({
		kind: zod_1.z.literal("ton"),
		amount: zod_1.z.string()
	}), zod_1.z.object({
		kind: zod_1.z.literal("token"),
		amount: zod_1.z.string()
	})]);
	var supportedMessageTypeCodec = zod_1.z.union([
		zod_1.z.literal("jetton::excesses"),
		zod_1.z.literal("jetton::transfer"),
		zod_1.z.literal("jetton::transfer_notification"),
		zod_1.z.literal("deposit"),
		zod_1.z.literal("deposit::ok"),
		zod_1.z.literal("withdraw"),
		zod_1.z.literal("withdraw::all"),
		zod_1.z.literal("withdraw::delayed"),
		zod_1.z.literal("withdraw::ok"),
		zod_1.z.literal("airdrop")
	]);
	var opCodec = zod_1.z.object({
		type: supportedMessageTypeCodec,
		options: zod_1.z.optional(zod_1.z.record(zod_1.z.string()))
	});
	var parsedOperationCodec = zod_1.z.object({
		address: zod_1.z.string(),
		comment: zod_1.z.optional(zod_1.z.string()),
		items: zod_1.z.array(parsedOperationItemCodec),
		op: zod_1.z.optional(opCodec)
	});
	var parsedTransactionCodec = zod_1.z.object({
		address: zod_1.z.string(),
		lt: zod_1.z.string(),
		hash: zod_1.z.string(),
		prevTransaction: zod_1.z.object({
			lt: zod_1.z.string(),
			hash: zod_1.z.string()
		}),
		time: zod_1.z.number(),
		outMessagesCount: zod_1.z.number(),
		oldStatus: accountStatusCodec,
		newStatus: accountStatusCodec,
		fees: zod_1.z.string(),
		update: zod_1.z.object({
			oldHash: zod_1.z.string(),
			newHash: zod_1.z.string()
		}),
		inMessage: zod_1.z.union([parsedMessageCodec, zod_1.z.null()]),
		outMessages: zod_1.z.array(parsedMessageCodec),
		parsed: zod_1.z.object({
			seqno: zod_1.z.union([zod_1.z.number(), zod_1.z.null()]),
			body: zod_1.z.union([txBodyCodec, zod_1.z.null()]),
			status: zod_1.z.union([
				zod_1.z.literal("success"),
				zod_1.z.literal("failed"),
				zod_1.z.literal("pending")
			]),
			dest: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]),
			kind: zod_1.z.union([zod_1.z.literal("out"), zod_1.z.literal("in")]),
			amount: zod_1.z.string(),
			resolvedAddress: zod_1.z.string(),
			bounced: zod_1.z.boolean(),
			mentioned: zod_1.z.array(zod_1.z.string())
		}),
		operation: parsedOperationCodec
	});
	var parsedTransactionsCodec = zod_1.z.object({
		blocks: blocksCodec,
		transactions: zod_1.z.array(parsedTransactionCodec)
	});
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5beta/WalletV5BetaWalletId.js
var require_WalletV5BetaWalletId = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loadWalletIdV5Beta = loadWalletIdV5Beta;
	exports.storeWalletIdV5Beta = storeWalletIdV5Beta;
	var core_1 = require_dist$1();
	var walletV5BetaVersionsSerialisation = { v5: 0 };
	function loadWalletIdV5Beta(value) {
		const bitReader = new core_1.BitReader(new core_1.BitString(typeof value === "bigint" ? Buffer.from(value.toString(16), "hex") : value instanceof core_1.Slice ? value.loadBuffer(10) : value, 0, 80));
		const networkGlobalId = bitReader.loadInt(32);
		const workchain = bitReader.loadInt(8);
		const walletVersionRaw = bitReader.loadUint(8);
		const subwalletNumber = bitReader.loadUint(32);
		const walletVersion = Object.entries(walletV5BetaVersionsSerialisation).find(([_, value]) => value === walletVersionRaw)?.[0];
		if (walletVersion === void 0) throw new Error(`Can't deserialize walletId: unknown wallet version ${walletVersionRaw}`);
		return {
			networkGlobalId,
			workchain,
			walletVersion,
			subwalletNumber
		};
	}
	function storeWalletIdV5Beta(walletId) {
		return (builder) => {
			builder.storeInt(walletId.networkGlobalId, 32);
			builder.storeInt(walletId.workchain, 8);
			builder.storeUint(walletV5BetaVersionsSerialisation[walletId.walletVersion], 8);
			builder.storeUint(walletId.subwalletNumber, 32);
		};
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5beta/WalletContractV5Beta.js
var require_WalletContractV5Beta$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV5Beta = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	var WalletV5BetaWalletId_1 = require_WalletV5BetaWalletId();
	/**
	* @deprecated
	* use WalletContractV5R1 instead
	*/
	var WalletContractV5Beta = class WalletContractV5Beta {
		static create(args) {
			return new WalletContractV5Beta({
				networkGlobalId: args.walletId?.networkGlobalId ?? -239,
				workchain: args?.walletId?.workchain ?? 0,
				subwalletNumber: args?.walletId?.subwalletNumber ?? 0,
				walletVersion: args?.walletId?.walletVersion ?? "v5"
			}, args.publicKey, args.domain);
		}
		constructor(walletId, publicKey, domain) {
			this.walletId = walletId;
			this.publicKey = publicKey;
			this.walletId = walletId;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAIwAIQgLkzzsvTG1qYeoPK1RH0mZ4WyavNjfbLe7mvNGqgm80Eg3NjhE=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeInt(0, 33).store((0, WalletV5BetaWalletId_1.storeWalletIdV5Beta)(this.walletId)).storeBuffer(this.publicKey, 32).storeBit(0).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(this.walletId.workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Get Wallet Extensions
		*/
		async getExtensions(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("get_extensions", [])).stack.readCellOpt();
			else return null;
		}
		/**
		* Get Wallet Extensions
		*/
		async getExtensionsArray(provider) {
			const extensions = await this.getExtensions(provider);
			if (!extensions) return [];
			const dict = core_1.Dictionary.loadDirect(core_1.Dictionary.Keys.BigUint(256), core_1.Dictionary.Values.BigInt(8), extensions);
			return dict.keys().map((key) => {
				const wc = dict.get(key);
				const addressHex = key ^ wc + 1n;
				return core_1.Address.parseRaw(`${wc}:${addressHex.toString(16).padStart(64, "0")}`);
			});
		}
		/**
		* Get is secret-key authentication enabled
		*/
		async getIsSecretKeyAuthEnabled(provider) {
			return (await provider.get("get_is_signature_auth_allowed", [])).stack.readNumber() !== 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			const transfer = await this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Sign and send add extension request
		*/
		async sendAddExtension(provider, args) {
			const request = await this.createAddExtension(args);
			await this.send(provider, request);
		}
		/**
		* Sign and send remove extension request
		*/
		async sendRemoveExtension(provider, args) {
			const request = await this.createRemoveExtension(args);
			await this.send(provider, request);
		}
		/**
		* Sign and send actions batch
		*/
		async sendActionsBatch(provider, args) {
			const request = await this.createRequest(args);
			await this.send(provider, request);
		}
		createActions(args) {
			return args.messages.map((message) => ({
				type: "sendMsg",
				mode: args.sendMode,
				outMsg: message
			}));
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			return this.createRequest({
				...args,
				actions: this.createActions({
					messages: args.messages,
					sendMode: args.sendMode
				})
			});
		}
		/**
		* Create signed add extension request
		*/
		createAddExtension(args) {
			return this.createRequest({
				...args,
				actions: [{
					type: "addExtension",
					address: args.extensionAddress
				}]
			});
		}
		/**
		* Create signed remove extension request
		*/
		createRemoveExtension(args) {
			return this.createRequest({
				...args,
				actions: [{
					type: "removeExtension",
					address: args.extensionAddress
				}]
			});
		}
		/**
		* Create signed request or extension auth request
		*/
		createRequest(args) {
			if (args.authType === "extension") return (0, createWalletTransfer_1.createWalletTransferV5Beta)(args);
			return (0, createWalletTransfer_1.createWalletTransferV5Beta)({
				...args,
				walletId: (0, WalletV5BetaWalletId_1.storeWalletIdV5Beta)(this.walletId),
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode ?? core_1.SendMode.PAY_GAS_SEPARATELY + core_1.SendMode.IGNORE_ERRORS,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
	exports.WalletContractV5Beta = WalletContractV5Beta;
	WalletContractV5Beta.OpCodes = {
		auth_extension: 1702392942,
		auth_signed_external: 1936287598,
		auth_signed_internal: 1936289396
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5beta/WalletV5OutActions.js
var require_WalletV5OutActions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isOutActionExtended = isOutActionExtended;
	exports.isOutActionBasic = isOutActionBasic;
	function isOutActionExtended(action) {
		return action.type === "setIsPublicKeyEnabled" || action.type === "addExtension" || action.type === "removeExtension";
	}
	function isOutActionBasic(action) {
		return !isOutActionExtended(action);
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5beta/WalletV5BetaActions.js
var require_WalletV5BetaActions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeOutActionExtendedV5Beta = storeOutActionExtendedV5Beta;
	exports.loadOutActionV5BetaExtended = loadOutActionV5BetaExtended;
	exports.storeOutListExtendedV5Beta = storeOutListExtendedV5Beta;
	exports.loadOutListExtendedV5Beta = loadOutListExtendedV5Beta;
	var core_1 = require_dist$1();
	var WalletV5OutActions_1 = require_WalletV5OutActions();
	var outActionSetIsPublicKeyEnabledTag = 550222170;
	function storeOutActionSetIsPublicKeyEnabled(action) {
		return (builder) => {
			builder.storeUint(outActionSetIsPublicKeyEnabledTag, 32).storeUint(action.isEnabled ? 1 : 0, 1);
		};
	}
	var outActionAddExtensionTag = 474012575;
	function storeOutActionAddExtension(action) {
		return (builder) => {
			builder.storeUint(outActionAddExtensionTag, 32).storeAddress(action.address);
		};
	}
	var outActionRemoveExtensionTag = 1588524196;
	function storeOutActionRemoveExtension(action) {
		return (builder) => {
			builder.storeUint(outActionRemoveExtensionTag, 32).storeAddress(action.address);
		};
	}
	function storeOutActionExtendedV5Beta(action) {
		switch (action.type) {
			case "setIsPublicKeyEnabled": return storeOutActionSetIsPublicKeyEnabled(action);
			case "addExtension": return storeOutActionAddExtension(action);
			case "removeExtension": return storeOutActionRemoveExtension(action);
			default: throw new Error("Unknown action type" + action?.type);
		}
	}
	function loadOutActionV5BetaExtended(slice) {
		const tag = slice.loadUint(32);
		switch (tag) {
			case outActionSetIsPublicKeyEnabledTag: return {
				type: "setIsPublicKeyEnabled",
				isEnabled: !!slice.loadUint(1)
			};
			case outActionAddExtensionTag: return {
				type: "addExtension",
				address: slice.loadAddress()
			};
			case outActionRemoveExtensionTag: return {
				type: "removeExtension",
				address: slice.loadAddress()
			};
			default: throw new Error(`Unknown extended out action tag 0x${tag.toString(16)}`);
		}
	}
	function storeOutListExtendedV5Beta(actions) {
		const [action, ...rest] = actions;
		if (!action || !(0, WalletV5OutActions_1.isOutActionExtended)(action)) {
			if (actions.some(WalletV5OutActions_1.isOutActionExtended)) throw new Error("Can't serialize actions list: all extended actions must be placed before out actions");
			return (builder) => {
				builder.storeUint(0, 1).storeRef((0, core_1.beginCell)().store((0, core_1.storeOutList)(actions)).endCell());
			};
		}
		return (builder) => {
			builder.storeUint(1, 1).store(storeOutActionExtendedV5Beta(action)).storeRef((0, core_1.beginCell)().store(storeOutListExtendedV5Beta(rest)).endCell());
		};
	}
	function loadOutListExtendedV5Beta(slice) {
		const actions = [];
		while (slice.loadUint(1)) {
			const action = loadOutActionV5BetaExtended(slice);
			actions.push(action);
			slice = slice.loadRef().beginParse();
		}
		const commonAction = (0, core_1.loadOutList)(slice.loadRef().beginParse());
		if (commonAction.some((i) => i.type === "setCode")) throw new Error("Can't deserialize actions list: only sendMsg actions are allowed for wallet v5");
		return actions.concat(commonAction);
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/signing/singer.js
var require_singer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.signPayload = signPayload;
	var core_1 = require_dist$1();
	function signPayload(args, signingMessage, packMessage) {
		if ("secretKey" in args) return packMessage((0, core_1.domainSign)({
			data: signingMessage.endCell().hash(),
			secretKey: args.secretKey,
			domain: args.domain
		}), signingMessage);
		else
 /**
		* Client use external storage for secretKey.
		* In this case lib could create a request to external resource to sign transaction.
		*/
		return args.signer(signingMessage.endCell()).then((signature) => packMessage(signature, signingMessage));
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5r1/WalletV5R1WalletId.js
var require_WalletV5R1WalletId = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isWalletIdV5R1ClientContext = isWalletIdV5R1ClientContext;
	exports.loadWalletIdV5R1 = loadWalletIdV5R1;
	exports.storeWalletIdV5R1 = storeWalletIdV5R1;
	var core_1 = require_dist$1();
	function isWalletIdV5R1ClientContext(context) {
		return typeof context !== "number";
	}
	var walletV5R1VersionsSerialisation = { v5r1: 0 };
	/**
	* @param value serialized wallet id
	* @param networkGlobalId -239 is mainnet, -3 is testnet
	*/
	function loadWalletIdV5R1(value, networkGlobalId) {
		const val = new core_1.BitReader(new core_1.BitString(typeof value === "bigint" ? Buffer.from(value.toString(16).padStart(8, "0"), "hex") : value instanceof core_1.Slice ? value.loadBuffer(4) : value, 0, 32)).loadInt(32);
		const context = BigInt(val) ^ BigInt(networkGlobalId);
		const bitReader = (0, core_1.beginCell)().storeInt(context, 32).endCell().beginParse();
		if (bitReader.loadUint(1)) {
			const workchain = bitReader.loadInt(8);
			const walletVersionRaw = bitReader.loadUint(8);
			const subwalletNumber = bitReader.loadUint(15);
			const walletVersion = Object.entries(walletV5R1VersionsSerialisation).find(([_, value]) => value === walletVersionRaw)?.[0];
			if (walletVersion === void 0) throw new Error(`Can't deserialize walletId: unknown wallet version ${walletVersionRaw}`);
			return {
				networkGlobalId,
				context: {
					walletVersion,
					workchain,
					subwalletNumber
				}
			};
		} else return {
			networkGlobalId,
			context: bitReader.loadUint(31)
		};
	}
	function storeWalletIdV5R1(walletId) {
		return (builder) => {
			let context;
			if (isWalletIdV5R1ClientContext(walletId.context)) context = (0, core_1.beginCell)().storeUint(1, 1).storeInt(walletId.context.workchain, 8).storeUint(walletV5R1VersionsSerialisation[walletId.context.walletVersion], 8).storeUint(walletId.context.subwalletNumber, 15).endCell().beginParse().loadInt(32);
			else context = (0, core_1.beginCell)().storeUint(0, 1).storeUint(walletId.context, 31).endCell().beginParse().loadInt(32);
			return builder.storeInt(BigInt(walletId.networkGlobalId) ^ BigInt(context), 32);
		};
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5r1/WalletContractV5R1.js
var require_WalletContractV5R1$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV5R1 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	var WalletV5R1WalletId_1 = require_WalletV5R1WalletId();
	var WalletContractV5R1 = class WalletContractV5R1 {
		static create(args) {
			let workchain = 0;
			if ("workchain" in args && args.workchain != void 0) workchain = args.workchain;
			if (args.walletId?.context && (0, WalletV5R1WalletId_1.isWalletIdV5R1ClientContext)(args.walletId.context) && args.walletId.context.workchain != void 0) workchain = args.walletId.context.workchain;
			return new WalletContractV5R1(workchain, args.publicKey, {
				networkGlobalId: args.walletId?.networkGlobalId ?? -239,
				context: args.walletId?.context ?? {
					workchain: 0,
					walletVersion: "v5r1",
					subwalletNumber: 0
				}
			}, args.domain);
		}
		constructor(workchain, publicKey, walletId, domain, globalId) {
			this.publicKey = publicKey;
			this.walletId = walletId;
			this.globalId = globalId;
			this.walletId = walletId;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("b5ee9c7241021401000281000114ff00f4a413f4bcf2c80b01020120020d020148030402dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120050c020120060902016e07080019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00201480a0b0017b325fb51341c75c875c2c7e00011b262fb513435c280200019be5f0f6a2684080a0eb90fa02c0102f20e011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0b4d6c35e", "hex"))[0];
			let data = (0, core_1.beginCell)().storeUint(1, 1).storeUint(0, 32).store((0, WalletV5R1WalletId_1.storeWalletIdV5R1)(this.walletId)).storeBuffer(this.publicKey, 32).storeBit(0).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Get Wallet Extensions
		*/
		async getExtensions(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("get_extensions", [])).stack.readCellOpt();
			else return null;
		}
		/**
		* Get Wallet Extensions
		*/
		async getExtensionsArray(provider) {
			const extensions = await this.getExtensions(provider);
			if (!extensions) return [];
			return core_1.Dictionary.loadDirect(core_1.Dictionary.Keys.BigUint(256), core_1.Dictionary.Values.BigInt(1), extensions).keys().map((addressHex) => {
				const wc = this.address.workChain;
				return core_1.Address.parseRaw(`${wc}:${addressHex.toString(16).padStart(64, "0")}`);
			});
		}
		/**
		* Get is secret-key authentication enabled
		*/
		async getIsSecretKeyAuthEnabled(provider) {
			return (await provider.get("is_signature_allowed", [])).stack.readBoolean();
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			const transfer = await this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Sign and send add extension request
		*/
		async sendAddExtension(provider, args) {
			const request = await this.createAddExtension(args);
			await this.send(provider, request);
		}
		/**
		* Sign and send remove extension request
		*/
		async sendRemoveExtension(provider, args) {
			const request = await this.createRemoveExtension(args);
			await this.send(provider, request);
		}
		createActions(args) {
			return args.messages.map((message) => ({
				type: "sendMsg",
				mode: args.sendMode,
				outMsg: message
			}));
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			return this.createRequest({
				actions: this.createActions({
					messages: args.messages,
					sendMode: args.sendMode
				}),
				...args
			});
		}
		/**
		* Create signed add extension request
		*/
		createAddExtension(args) {
			return this.createRequest({
				actions: [{
					type: "addExtension",
					address: args.extensionAddress
				}],
				...args
			});
		}
		/**
		* Create signed remove extension request
		*/
		createRemoveExtension(args) {
			return this.createRequest({
				actions: [{
					type: "removeExtension",
					address: args.extensionAddress
				}],
				...args
			});
		}
		/**
		* Create signed request or extension auth request
		*/
		createRequest(args) {
			if (args.authType === "extension") return (0, createWalletTransfer_1.createWalletTransferV5R1)(args);
			return (0, createWalletTransfer_1.createWalletTransferV5R1)({
				...args,
				walletId: (0, WalletV5R1WalletId_1.storeWalletIdV5R1)(this.walletId),
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode ?? core_1.SendMode.PAY_GAS_SEPARATELY + core_1.SendMode.IGNORE_ERRORS,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
	exports.WalletContractV5R1 = WalletContractV5R1;
	WalletContractV5R1.OpCodes = {
		auth_extension: 1702392942,
		auth_signed_external: 1936287598,
		auth_signed_internal: 1936289396
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v5r1/WalletV5R1Actions.js
var require_WalletV5R1Actions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeOutActionExtendedV5R1 = storeOutActionExtendedV5R1;
	exports.loadOutActionExtendedV5R1 = loadOutActionExtendedV5R1;
	exports.storeOutListExtendedV5R1 = storeOutListExtendedV5R1;
	exports.loadOutListExtendedV5R1 = loadOutListExtendedV5R1;
	exports.toSafeV5R1SendMode = toSafeV5R1SendMode;
	exports.patchV5R1ActionsSendMode = patchV5R1ActionsSendMode;
	var core_1 = require_dist$1();
	var WalletV5OutActions_1 = require_WalletV5OutActions();
	var outActionSetIsPublicKeyEnabledTag = 4;
	function storeOutActionSetIsPublicKeyEnabled(action) {
		return (builder) => {
			builder.storeUint(outActionSetIsPublicKeyEnabledTag, 8).storeUint(action.isEnabled ? 1 : 0, 1);
		};
	}
	var outActionAddExtensionTag = 2;
	function storeOutActionAddExtension(action) {
		return (builder) => {
			builder.storeUint(outActionAddExtensionTag, 8).storeAddress(action.address);
		};
	}
	var outActionRemoveExtensionTag = 3;
	function storeOutActionRemoveExtension(action) {
		return (builder) => {
			builder.storeUint(outActionRemoveExtensionTag, 8).storeAddress(action.address);
		};
	}
	function storeOutActionExtendedV5R1(action) {
		switch (action.type) {
			case "setIsPublicKeyEnabled": return storeOutActionSetIsPublicKeyEnabled(action);
			case "addExtension": return storeOutActionAddExtension(action);
			case "removeExtension": return storeOutActionRemoveExtension(action);
			default: throw new Error("Unknown action type" + action?.type);
		}
	}
	function loadOutActionExtendedV5R1(slice) {
		const tag = slice.loadUint(8);
		switch (tag) {
			case outActionSetIsPublicKeyEnabledTag: return {
				type: "setIsPublicKeyEnabled",
				isEnabled: !!slice.loadUint(1)
			};
			case outActionAddExtensionTag: return {
				type: "addExtension",
				address: slice.loadAddress()
			};
			case outActionRemoveExtensionTag: return {
				type: "removeExtension",
				address: slice.loadAddress()
			};
			default: throw new Error(`Unknown extended out action tag 0x${tag.toString(16)}`);
		}
	}
	function storeOutListExtendedV5R1(actions) {
		const extendedActions = actions.filter(WalletV5OutActions_1.isOutActionExtended);
		const basicActions = actions.filter(WalletV5OutActions_1.isOutActionBasic);
		return (builder) => {
			const outListPacked = basicActions.length ? (0, core_1.beginCell)().store((0, core_1.storeOutList)(basicActions)) : null;
			builder.storeMaybeRef(outListPacked);
			if (extendedActions.length === 0) builder.storeUint(0, 1);
			else {
				const [first, ...rest] = extendedActions;
				builder.storeUint(1, 1).store(storeOutActionExtendedV5R1(first));
				if (rest.length > 0) builder.storeRef(packExtendedActionsRec(rest));
			}
		};
	}
	function packExtendedActionsRec(extendedActions) {
		const [first, ...rest] = extendedActions;
		let builder = (0, core_1.beginCell)().store(storeOutActionExtendedV5R1(first));
		if (rest.length > 0) builder = builder.storeRef(packExtendedActionsRec(rest));
		return builder.endCell();
	}
	function loadOutListExtendedV5R1(slice) {
		const actions = [];
		const outListPacked = slice.loadMaybeRef();
		if (outListPacked) {
			const loadedActions = (0, core_1.loadOutList)(outListPacked.beginParse());
			if (loadedActions.some((a) => a.type !== "sendMsg")) throw new Error("Can't deserialize actions list: only sendMsg actions are allowed for wallet v5r1");
			actions.push(...loadedActions);
		}
		if (slice.loadBoolean()) {
			const action = loadOutActionExtendedV5R1(slice);
			actions.push(action);
		}
		while (slice.remainingRefs > 0) {
			slice = slice.loadRef().beginParse();
			const action = loadOutActionExtendedV5R1(slice);
			actions.push(action);
		}
		return actions;
	}
	/**
	* Safety rules -- actions of external messages must have +2 in the SendMode. Internal messages actions may have arbitrary SendMode.
	*/
	function toSafeV5R1SendMode(sendMode, authType) {
		if (authType === "internal" || authType === "extension") return sendMode;
		return sendMode | core_1.SendMode.IGNORE_ERRORS;
	}
	function patchV5R1ActionsSendMode(actions, authType) {
		return actions.map((action) => action.type === "sendMsg" ? {
			...action,
			mode: toSafeV5R1SendMode(action.mode, authType)
		} : action);
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v4/WalletContractV4Actions.js
var require_WalletContractV4Actions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.storeExtendedAction = storeExtendedAction;
	exports.loadExtendedAction = loadExtendedAction;
	var core_1 = require_dist$1();
	function storeExtendedAction(action) {
		return (builder) => {
			switch (action.type) {
				case "sendMsg":
					builder.storeUint(0, 8);
					for (let m of action.messages) {
						builder.storeUint(action.sendMode ?? core_1.SendMode.NONE, 8);
						builder.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
					}
					break;
				case "addAndDeployPlugin":
					builder.storeUint(1, 8);
					builder.storeInt(action.workchain, 8);
					builder.storeCoins(action.forwardAmount);
					builder.storeRef((0, core_1.beginCell)().store((0, core_1.storeStateInit)(action.stateInit)));
					builder.storeRef(action.body);
					break;
				case "addPlugin":
					builder.storeUint(2, 8);
					builder.storeInt(action.address.workChain, 8);
					builder.storeBuffer(action.address.hash);
					builder.storeCoins(action.forwardAmount);
					builder.storeUint(action.queryId ?? 0n, 64);
					break;
				case "removePlugin":
					builder.storeUint(3, 8);
					builder.storeInt(action.address.workChain, 8);
					builder.storeBuffer(action.address.hash);
					builder.storeCoins(action.forwardAmount);
					builder.storeUint(action.queryId ?? 0n, 64);
					break;
				default: throw new Error(`Unsupported plugin action`);
			}
		};
	}
	function loadExtendedAction(slice) {
		const actionType = slice.loadUint(8);
		switch (actionType) {
			case 0: {
				const messages = [];
				let sendModeValue = void 0;
				while (slice.remainingRefs > 0) {
					if (slice.remainingBits < 8) throw new Error("Invalid sendMsg action: insufficient bits for send mode");
					const mode = slice.loadUint(8);
					const messageCell = slice.loadRef();
					const message = (0, core_1.loadMessageRelaxed)(messageCell.beginParse());
					if (sendModeValue === void 0) sendModeValue = mode;
					else if (sendModeValue !== mode) throw new Error("Invalid sendMsg action: mixed send modes are not supported");
					messages.push(message);
				}
				return {
					type: "sendMsg",
					messages,
					sendMode: sendModeValue
				};
			}
			case 1: {
				const workchain = slice.loadInt(8);
				const forwardAmount = slice.loadCoins();
				return {
					type: "addAndDeployPlugin",
					workchain,
					stateInit: (0, core_1.loadStateInit)(slice.loadRef().beginParse()),
					body: slice.loadRef(),
					forwardAmount
				};
			}
			case 2: {
				const workchain = slice.loadInt(8);
				const hash = slice.loadBuffer(32);
				const forwardAmount = slice.loadCoins();
				const queryId = slice.loadUintBig(64);
				return {
					type: "addPlugin",
					address: new core_1.Address(workchain, hash),
					forwardAmount,
					queryId: queryId === 0n ? void 0 : queryId
				};
			}
			case 3: {
				const workchain = slice.loadInt(8);
				const hash = slice.loadBuffer(32);
				const forwardAmount = slice.loadCoins();
				const queryId = slice.loadUintBig(64);
				return {
					type: "removePlugin",
					address: new core_1.Address(workchain, hash),
					forwardAmount,
					queryId: queryId === 0n ? void 0 : queryId
				};
			}
			default: throw new Error(`Unsupported action with opcode ${actionType}`);
		}
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/signing/createWalletTransfer.js
var require_createWalletTransfer = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createWalletTransferV1 = createWalletTransferV1;
	exports.createWalletTransferV2 = createWalletTransferV2;
	exports.createWalletTransferV3 = createWalletTransferV3;
	exports.createWalletTransferV4 = createWalletTransferV4;
	exports.createWalletTransferV5Beta = createWalletTransferV5Beta;
	exports.createWalletTransferV5R1 = createWalletTransferV5R1;
	var core_1 = require_dist$1();
	var WalletContractV5Beta_1 = require_WalletContractV5Beta$1();
	var WalletV5BetaActions_1 = require_WalletV5BetaActions();
	var singer_1 = require_singer();
	var WalletContractV5R1_1 = require_WalletContractV5R1$1();
	var WalletV5R1Actions_1 = require_WalletV5R1Actions();
	var WalletContractV4Actions_1 = require_WalletContractV4Actions();
	function packSignatureToFront(signature, signingMessage) {
		return (0, core_1.beginCell)().storeBuffer(signature).storeBuilder(signingMessage).endCell();
	}
	function packSignatureToTail(signature, signingMessage) {
		return (0, core_1.beginCell)().storeBuilder(signingMessage).storeBuffer(signature).endCell();
	}
	function createWalletTransferV1(args) {
		let signingMessage = (0, core_1.beginCell)().storeUint(args.seqno, 32);
		if (args.message) {
			signingMessage.storeUint(args.sendMode, 8);
			signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(args.message)));
		}
		let signature = (0, core_1.domainSign)({
			data: signingMessage.endCell().hash(),
			secretKey: args.secretKey,
			domain: args.domain
		});
		return (0, core_1.beginCell)().storeBuffer(signature).storeBuilder(signingMessage).endCell();
	}
	function createWalletTransferV2(args) {
		if (args.messages.length > 4) throw Error("Maximum number of messages in a single transfer is 4");
		let signingMessage = (0, core_1.beginCell)().storeUint(args.seqno, 32);
		if (args.seqno === 0) for (let i = 0; i < 32; i++) signingMessage.storeBit(1);
		else signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
		for (let m of args.messages) {
			signingMessage.storeUint(args.sendMode, 8);
			signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
		}
		let signature = (0, core_1.domainSign)({
			data: signingMessage.endCell().hash(),
			secretKey: args.secretKey,
			domain: args.domain
		});
		return (0, core_1.beginCell)().storeBuffer(signature).storeBuilder(signingMessage).endCell();
	}
	function createWalletTransferV3(args) {
		if (args.messages.length > 4) throw Error("Maximum number of messages in a single transfer is 4");
		let signingMessage = (0, core_1.beginCell)().storeUint(args.walletId, 32);
		if (args.seqno === 0) for (let i = 0; i < 32; i++) signingMessage.storeBit(1);
		else signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
		signingMessage.storeUint(args.seqno, 32);
		for (let m of args.messages) {
			signingMessage.storeUint(args.sendMode, 8);
			signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
		}
		return (0, singer_1.signPayload)(args, signingMessage, packSignatureToFront);
	}
	function createWalletTransferV4(args) {
		let signingMessage = (0, core_1.beginCell)().storeUint(args.walletId, 32);
		if (args.seqno === 0) for (let i = 0; i < 32; i++) signingMessage.storeBit(1);
		else signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
		signingMessage.storeUint(args.seqno, 32);
		signingMessage.store((0, WalletContractV4Actions_1.storeExtendedAction)(args.action));
		return (0, singer_1.signPayload)(args, signingMessage, packSignatureToFront);
	}
	function createWalletTransferV5Beta(args) {
		if (args.actions.length > 255) throw Error("Maximum number of OutActions in a single request is 255");
		if (args.authType === "extension") return (0, core_1.beginCell)().storeUint(WalletContractV5Beta_1.WalletContractV5Beta.OpCodes.auth_extension, 32).store((0, WalletV5BetaActions_1.storeOutListExtendedV5Beta)(args.actions)).endCell();
		const signingMessage = (0, core_1.beginCell)().storeUint(args.authType === "internal" ? WalletContractV5Beta_1.WalletContractV5Beta.OpCodes.auth_signed_internal : WalletContractV5Beta_1.WalletContractV5Beta.OpCodes.auth_signed_external, 32).store(args.walletId);
		if (args.seqno === 0) for (let i = 0; i < 32; i++) signingMessage.storeBit(1);
		else signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
		signingMessage.storeUint(args.seqno, 32).store((0, WalletV5BetaActions_1.storeOutListExtendedV5Beta)(args.actions));
		return (0, singer_1.signPayload)(args, signingMessage, packSignatureToTail);
	}
	function createWalletTransferV5R1(args) {
		if (args.actions.length > 255) throw Error("Maximum number of OutActions in a single request is 255");
		args = { ...args };
		if (args.authType === "extension") return (0, core_1.beginCell)().storeUint(WalletContractV5R1_1.WalletContractV5R1.OpCodes.auth_extension, 32).storeUint(args.queryId ?? 0, 64).store((0, WalletV5R1Actions_1.storeOutListExtendedV5R1)(args.actions)).endCell();
		args.actions = (0, WalletV5R1Actions_1.patchV5R1ActionsSendMode)(args.actions, args.authType);
		const signingMessage = (0, core_1.beginCell)().storeUint(args.authType === "internal" ? WalletContractV5R1_1.WalletContractV5R1.OpCodes.auth_signed_internal : WalletContractV5R1_1.WalletContractV5R1.OpCodes.auth_signed_external, 32).store(args.walletId);
		if (args.seqno === 0) for (let i = 0; i < 32; i++) signingMessage.storeBit(1);
		else signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32);
		signingMessage.storeUint(args.seqno, 32).store((0, WalletV5R1Actions_1.storeOutListExtendedV5R1)(args.actions));
		return (0, singer_1.signPayload)(args, signingMessage, packSignatureToTail);
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v1/r1.js
var require_r1$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV1R1 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV1R1 = class WalletContractV1R1 {
		static create(args) {
			return new WalletContractV1R1(args.workchain, args.publicKey, args.domain);
		}
		constructor(workchain, publicKey, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEARAAAhP8AIN2k8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVEH98Ik=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			let state = await provider.getState();
			if (state.state.type === "active") return core_1.Cell.fromBoc(state.state.data)[0].beginParse().loadUint(32);
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
			if (args.sendMode !== null && args.sendMode !== void 0) sendMode = args.sendMode;
			return (0, createWalletTransfer_1.createWalletTransferV1)({
				seqno: args.seqno,
				sendMode,
				secretKey: args.secretKey,
				message: args.message,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					message: (0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV1R1.js
var require_WalletContractV1R1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$11) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$11, p)) __createBinding(exports$11, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r1$2(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v1/r2.js
var require_r2$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV1R2 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV1R2 = class WalletContractV1R2 {
		static create(args) {
			return new WalletContractV1R2(args.workchain, args.publicKey, args.domain);
		}
		constructor(workchain, publicKey, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAUwAAov8AIN0gggFMl7qXMO1E0NcLH+Ck8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVNDieG8=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
			if (args.sendMode !== null && args.sendMode !== void 0) sendMode = args.sendMode;
			return (0, createWalletTransfer_1.createWalletTransferV1)({
				seqno: args.seqno,
				sendMode,
				secretKey: args.secretKey,
				message: args.message,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					message: (0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV1R2.js
var require_WalletContractV1R2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$10) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$10, p)) __createBinding(exports$10, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r2$2(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v1/r3.js
var require_r3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV1R3 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV1R3 = class WalletContractV1R3 {
		static create(args) {
			return new WalletContractV1R3(args.workchain, args.publicKey, args.domain);
		}
		constructor(workchain, publicKey, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAXwAAuv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVLW4bkI=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(executor, message) {
			await executor.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
			if (args.sendMode !== null && args.sendMode !== void 0) sendMode = args.sendMode;
			return (0, createWalletTransfer_1.createWalletTransferV1)({
				seqno: args.seqno,
				sendMode,
				secretKey: args.secretKey,
				message: args.message,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					message: (0, core_1.internal)({
						to: args.to,
						value: args.value,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV1R3.js
var require_WalletContractV1R3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$9) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$9, p)) __createBinding(exports$9, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r3(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v2/r1.js
var require_r1$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV2R1 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV2R1 = class WalletContractV2R1 {
		static create(args) {
			return new WalletContractV2R1(args.workchain, args.publicKey, args.domain);
		}
		constructor(workchain, publicKey, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAVwAAqv8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VShNwu2", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
			if (args.sendMode !== null && args.sendMode !== void 0) sendMode = args.sendMode;
			return (0, createWalletTransfer_1.createWalletTransferV2)({
				seqno: args.seqno,
				sendMode,
				secretKey: args.secretKey,
				messages: args.messages,
				timeout: args.timeout,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV2R1.js
var require_WalletContractV2R1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$8) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$8, p)) __createBinding(exports$8, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r1$1(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v2/r2.js
var require_r2$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV2R2 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV2R2 = class WalletContractV2R2 {
		static create(args) {
			return new WalletContractV2R2(args.workchain, args.publicKey, args.domain);
		}
		constructor(workchain, publicKey, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAYwAAwv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VQETNeh", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
			if (args.sendMode !== null && args.sendMode !== void 0) sendMode = args.sendMode;
			return (0, createWalletTransfer_1.createWalletTransferV2)({
				seqno: args.seqno,
				sendMode,
				secretKey: args.secretKey,
				messages: args.messages,
				timeout: args.timeout,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV2R2.js
var require_WalletContractV2R2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$7) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$7, p)) __createBinding(exports$7, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r2$1(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v3/r1.js
var require_r1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV3R1 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV3R1 = class WalletContractV3R1 {
		static create(args) {
			return new WalletContractV3R1(args.workchain, args.publicKey, args.walletId, args.domain);
		}
		constructor(workchain, publicKey, walletId, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			if (walletId !== null && walletId !== void 0) this.walletId = walletId;
			else this.walletId = 698983191 + workchain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAYgAAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVD++buA=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeUint(this.walletId, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get wallet balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create transfer
		*/
		createTransfer(args) {
			return (0, createWalletTransfer_1.createWalletTransferV3)({
				...args,
				sendMode: args.sendMode ?? core_1.SendMode.PAY_GAS_SEPARATELY,
				walletId: this.walletId,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV3R1.js
var require_WalletContractV3R1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$6) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$6, p)) __createBinding(exports$6, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r1(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v3/r2.js
var require_r2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV3R2 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV3R2 = class WalletContractV3R2 {
		static create(args) {
			return new WalletContractV3R2(args.workchain, args.publicKey, args.walletId, args.domain);
		}
		constructor(workchain, publicKey, walletId, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			if (walletId !== null && walletId !== void 0) this.walletId = walletId;
			else this.walletId = 698983191 + workchain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6cckEBAQEAcQAA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVBC9ba0=", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeUint(this.walletId, 32).storeBuffer(publicKey).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get wallet balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create transfer
		*/
		createTransfer(args) {
			return (0, createWalletTransfer_1.createWalletTransferV3)({
				...args,
				sendMode: args.sendMode ?? core_1.SendMode.PAY_GAS_SEPARATELY,
				walletId: this.walletId,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV3R2.js
var require_WalletContractV3R2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$5) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$5, p)) __createBinding(exports$5, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_r2(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/v4/WalletContractV4.js
var require_WalletContractV4$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletContractV4 = void 0;
	var core_1 = require_dist$1();
	var createWalletTransfer_1 = require_createWalletTransfer();
	exports.WalletContractV4 = class WalletContractV4 {
		static create(args) {
			return new WalletContractV4(args.workchain, args.publicKey, args.walletId, args.domain);
		}
		constructor(workchain, publicKey, walletId, domain) {
			this.workchain = workchain;
			this.publicKey = publicKey;
			this.domain = domain;
			if (walletId !== null && walletId !== void 0) this.walletId = walletId;
			else this.walletId = 698983191 + workchain;
			let code = core_1.Cell.fromBoc(Buffer.from("te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBIAIDAgFIBAUE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8QERITAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNBgcCASAICQB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAKCwBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDA0AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA4PABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==", "base64"))[0];
			let data = (0, core_1.beginCell)().storeUint(0, 32).storeUint(this.walletId, 32).storeBuffer(this.publicKey).storeBit(0).endCell();
			this.init = {
				code,
				data
			};
			this.address = (0, core_1.contractAddress)(workchain, {
				code,
				data
			});
		}
		/**
		* Get Wallet Balance
		*/
		async getBalance(provider) {
			return (await provider.getState()).balance;
		}
		/**
		* Get Wallet Seqno
		*/
		async getSeqno(provider) {
			if ((await provider.getState()).state.type === "active") return (await provider.get("seqno", [])).stack.readNumber();
			else return 0;
		}
		async getIsPluginInstalled(provider, pluginAddress) {
			if ((await provider.getState()).state.type !== "active") return false;
			const wc = BigInt(pluginAddress.workChain);
			const addrHash = BigInt("0x" + pluginAddress.hash.toString("hex"));
			return (await provider.get("is_plugin_installed", [{
				type: "int",
				value: wc
			}, {
				type: "int",
				value: addrHash
			}])).stack.readBoolean();
		}
		async getPluginsArray(provider) {
			if ((await provider.getState()).state.type !== "active") return [];
			return (await provider.get("get_plugin_list", [])).stack.readLispList().map((item) => {
				if (item.type !== "tuple") throw Error("Not a tuple");
				const entry = new core_1.TupleReader(item.items);
				const workchain = entry.readNumber();
				const addressHex = entry.readBigNumber().toString(16).padStart(64, "0");
				return core_1.Address.parseRaw(`${workchain}:${addressHex}`);
			});
		}
		/**
		* Send signed transfer
		*/
		async send(provider, message) {
			await provider.external(message);
		}
		/**
		* Sign and send transfer
		*/
		async sendTransfer(provider, args) {
			let transfer = this.createTransfer(args);
			await this.send(provider, transfer);
		}
		/**
		* Create signed transfer
		*/
		createTransfer(args) {
			return this.createRequest({
				seqno: args.seqno,
				timeout: args.timeout,
				action: {
					type: "sendMsg",
					messages: args.messages,
					sendMode: args.sendMode
				},
				..."secretKey" in args ? { secretKey: args.secretKey } : { signer: args.signer }
			});
		}
		async sendRequest(provider, args) {
			const action = await this.createRequest(args);
			await this.send(provider, action);
		}
		createRequest(args) {
			return (0, createWalletTransfer_1.createWalletTransferV4)({
				...args,
				walletId: this.walletId,
				domain: this.domain
			});
		}
		/**
		* Create sender
		*/
		sender(provider, secretKey) {
			return { send: async (args) => {
				let seqno = await this.getSeqno(provider);
				let transfer = this.createTransfer({
					seqno,
					secretKey,
					sendMode: args.sendMode,
					messages: [(0, core_1.internal)({
						to: args.to,
						value: args.value,
						extracurrency: args.extracurrency,
						init: args.init,
						body: args.body,
						bounce: args.bounce
					})]
				});
				await this.send(provider, transfer);
			} };
		}
		async sendAddPlugin(provider, args) {
			const request = await this.createAddPlugin(args);
			return await this.send(provider, request);
		}
		async sendRemovePlugin(provider, args) {
			const request = await this.createRemovePlugin(args);
			return await this.send(provider, request);
		}
		async sendAddAndDeployPlugin(provider, args) {
			const request = await this.createAddAndDeployPlugin(args);
			return await this.send(provider, request);
		}
		createAddPlugin(args) {
			return this.createRequest({
				action: {
					type: "addPlugin",
					address: args.address,
					forwardAmount: args.forwardAmount,
					queryId: args.queryId
				},
				...args
			});
		}
		createRemovePlugin(args) {
			return this.createRequest({
				action: {
					type: "removePlugin",
					address: args.address,
					forwardAmount: args.forwardAmount,
					queryId: args.queryId
				},
				...args
			});
		}
		createAddAndDeployPlugin(args) {
			return this.createRequest({
				action: {
					type: "addAndDeployPlugin",
					workchain: args.workchain,
					stateInit: args.stateInit,
					body: args.body,
					forwardAmount: args.forwardAmount
				},
				...args
			});
		}
		async sendPluginRequestFunds(provider, sender, args) {
			await provider.internal(sender, {
				value: args.forwardAmount,
				body: this.createPluginRequestFundsMessage(args),
				sendMode: args.sendMode
			});
		}
		createPluginRequestFundsMessage(args) {
			return (0, core_1.beginCell)().storeUint(1886156135, 32).storeUint(args.queryId ?? 0, 64).storeCoins(args.toncoinsToWithdraw).storeDict(null).endCell();
		}
		async sendPluginRemovePlugin(provider, sender, amount, queryId) {
			await provider.internal(sender, {
				value: amount,
				body: this.createPluginRemovePluginMessage(queryId)
			});
		}
		createPluginRemovePluginMessage(queryId) {
			return (0, core_1.beginCell)().storeUint(1685288050, 32).storeUint(queryId ?? 0, 64).endCell();
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV4.js
var require_WalletContractV4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$4) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$4, p)) __createBinding(exports$4, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_WalletContractV4$1(), exports);
	__exportStar(require_WalletContractV4Actions(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV5Beta.js
var require_WalletContractV5Beta = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$3) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$3, p)) __createBinding(exports$3, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_WalletContractV5Beta$1(), exports);
	__exportStar(require_WalletV5BetaActions(), exports);
	__exportStar(require_WalletV5BetaWalletId(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/wallets/WalletContractV5R1.js
var require_WalletContractV5R1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_WalletContractV5R1$1(), exports);
	__exportStar(require_WalletV5R1Actions(), exports);
	__exportStar(require_WalletV5R1WalletId(), exports);
}));
//#endregion
//#region node_modules/@ton/ton/dist/jetton/JettonMaster.js
var require_JettonMaster = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JettonMaster = void 0;
	var core_1 = require_dist$1();
	exports.JettonMaster = class JettonMaster {
		static create(address) {
			return new JettonMaster(address);
		}
		constructor(address) {
			this.address = address;
		}
		async getWalletAddress(provider, owner) {
			return (await provider.get("get_wallet_address", [{
				type: "slice",
				cell: (0, core_1.beginCell)().storeAddress(owner).endCell()
			}])).stack.readAddress();
		}
		async getJettonData(provider) {
			let res = await provider.get("get_jetton_data", []);
			return {
				totalSupply: res.stack.readBigNumber(),
				mintable: res.stack.readBoolean(),
				adminAddress: res.stack.readAddress(),
				content: res.stack.readCell(),
				walletCode: res.stack.readCell()
			};
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/jetton/JettonWallet.js
var require_JettonWallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JettonWallet = void 0;
	exports.JettonWallet = class JettonWallet {
		static create(address) {
			return new JettonWallet(address);
		}
		constructor(address) {
			this.address = address;
		}
		async getBalance(provider) {
			if ((await provider.getState()).state.type !== "active") return 0n;
			return (await provider.get("get_wallet_data", [])).stack.readBigNumber();
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/multisig/MultisigOrder.js
var require_MultisigOrder = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MultisigOrder = void 0;
	var crypto_1 = require_dist$2();
	var core_1 = require_dist$1();
	exports.MultisigOrder = class MultisigOrder {
		constructor(payload) {
			this.signatures = {};
			this.payload = payload;
		}
		static fromCell(cell) {
			let s = cell.beginParse();
			let signatures = s.loadMaybeRef()?.beginParse();
			let order = new MultisigOrder(s.asCell());
			if (signatures) {
				while (signatures.remainingBits > 0) {
					const signature = signatures.loadBuffer(64);
					const ownerId = signatures.loadUint(8);
					order.signatures[ownerId] = signature;
					if (signatures.remainingRefs > 0) signatures = signatures.loadRef().asSlice();
					else signatures.skip(1);
				}
				signatures.endParse();
			}
			return order;
		}
		static fromPayload(payload) {
			return new MultisigOrder(payload);
		}
		addSignature(ownerId, signature, multisig) {
			const signingHash = this.payload.hash();
			if (!(0, crypto_1.signVerify)(signingHash, signature, multisig.owners.get(ownerId).slice(0, -1))) throw Error("invalid signature");
			this.signatures[ownerId] = signature;
		}
		sign(ownerId, secretKey) {
			const signingHash = this.payload.hash();
			this.signatures[ownerId] = (0, crypto_1.sign)(signingHash, secretKey);
			return signingHash;
		}
		unionSignatures(other) {
			this.signatures = Object.assign({}, this.signatures, other.signatures);
		}
		clearSignatures() {
			this.signatures = {};
		}
		toCell(ownerId) {
			let b = (0, core_1.beginCell)().storeBit(0);
			for (const ownerId in this.signatures) {
				const signature = this.signatures[ownerId];
				b = (0, core_1.beginCell)().storeBit(1).storeRef((0, core_1.beginCell)().storeBuffer(signature).storeUint(parseInt(ownerId), 8).storeBuilder(b).endCell());
			}
			return (0, core_1.beginCell)().storeUint(ownerId, 8).storeBuilder(b).storeBuilder(this.payload.asBuilder()).endCell();
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/multisig/MultisigOrderBuilder.js
var require_MultisigOrderBuilder = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MultisigOrderBuilder = void 0;
	var core_1 = require_dist$1();
	var MultisigOrder_1 = require_MultisigOrder();
	var MultisigOrderBuilder = class {
		constructor(walletId, offset) {
			this.messages = (0, core_1.beginCell)();
			this.queryId = 0n;
			this.walletId = walletId;
			this.queryOffset = offset || 7200;
		}
		addMessage(message, mode) {
			if (this.messages.refs >= 4) throw Error("only 4 refs are allowed");
			this.updateQueryId();
			this.messages.storeUint(mode, 8);
			this.messages.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(message)).endCell());
		}
		clearMessages() {
			this.messages = (0, core_1.beginCell)();
		}
		build() {
			return MultisigOrder_1.MultisigOrder.fromPayload((0, core_1.beginCell)().storeUint(this.walletId, 32).storeUint(this.queryId, 64).storeBuilder(this.messages).endCell());
		}
		updateQueryId() {
			const time = BigInt(Math.floor(Date.now() / 1e3 + this.queryOffset));
			this.queryId = time << 32n;
		}
	};
	exports.MultisigOrderBuilder = MultisigOrderBuilder;
}));
//#endregion
//#region node_modules/@ton/ton/dist/multisig/MultisigWallet.js
var require_MultisigWallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MultisigWallet = void 0;
	var crypto_1 = require_dist$2();
	var core_1 = require_dist$1();
	var MULTISIG_CODE = core_1.Cell.fromBase64("te6ccgECKwEABBgAART/APSkE/S88sgLAQIBIAIDAgFIBAUE2vIgxwCOgzDbPOCDCNcYIPkBAdMH2zwiwAAToVNxePQOb6Hyn9s8VBq6+RDyoAb0BCD5AQHTH1EYuvKq0z9wUwHwCgHCCAGDCryx8mhTFYBA9A5voSCYDqQgwgryZw7f+COqH1NAufJhVCOjU04gIyEiAgLMBgcCASAMDQIBIAgJAgFmCgsAA9GEAiPymAvHoHN9CYbZ5S7Z4BPHohwhJQAtAKkItdJEqCTItdKlwLUAdAT8ArobBKAATwhbpEx4CBukTDgAdAg10rDAJrUAvALyFjPFszJ4HHXI8gBzxb0AMmACASAODwIBIBQVARW77ZbVA0cFUg2zyCoCAUgQEQIBIBITAXOxHXQgwjXGCD5AQHTB4IB1MTtQ9hTIHj0Dm+h8p/XC/9eMfkQ8qCuAfQEIW6TW3Ey4PkBWNs8AaQBgJwA9rtqA6ADoAPoCAXoCEfyAgPyA3XlP+AXkegAA54tkwAAXrhlXP8EA1WZ2oexAAgEgFhcCASAYGQFRtyVbZ4YmRmpGEAgegc30McJNhFpAADMaYeYuAFrgJhwLb+4cC3d0bhAjAYm1WZtnhqvgb+2xxsoicAgej430pBHEoFpAADHDhBACGuQkuuBk9kUWE5kAOeLKhACQCB6IYFImHFImHFImXEA2YlzNijAjAgEgGhsAF7UGtc4QQDVZnah7EAIBIBwdAgOZOB4fARGsGm2eL4G2CUAjABWt+UEAzJV2oewYQAENqTbPBVfBYCMAFa3f3CCAarM7UPYgAiDbPALyZfgAUENxQxPbPO1UIyoACtP/0wcwBKDbPC+uUyCw8mISsQKkJbNTHLmwJYEA4aojoCi8sPJpggGGoPgBBZcCERACPj4wjo0REB/bPEDXePRDEL0F4lQWW1Rz51YQU9zbPFRxClR6vCQlKCYAIO1E0NMf0wfTB9M/9AT0BNEAXgGOGjDSAAHyo9MH0wdQA9cBIPkBBfkBFbrypFAD4GwhIddKqgIi10m68qtwVCATAAwByMv/ywcE1ts87VT4D3AlblOJvrGYEG4QLVDHXwePGzBUJANQTds8UFWgRlAQSRA6SwlTuds8UFQWf+L4AAeDJaGOLCaAQPSWb6UglDBTA7neII4WODk5CNIAAZfTBzAW8AcFkTDifwgHBZJsMeKz5jAGKicoKQBgcI4pA9CDCNcY0wf0BDBTFnj0Dm+h8qXXC/9URUT5EPKmrlIgsVIDvRShI27mbCIyAH5SML6OIF8D+ACTItdKmALTB9QC+wAC6DJwyMoAQBSAQPRDAvAHjhdxyMsAFMsHEssHWM8BWM8WQBOAQPRDAeIBII6KEEUQNEMA2zztVJJfBuIqABzIyx/LB8sHyz/0APQAyQ==");
	exports.MultisigWallet = class MultisigWallet {
		constructor(publicKeys, workchain, walletId, k, opts) {
			this.provider = null;
			this.owners = core_1.Dictionary.empty();
			this.workchain = workchain;
			this.walletId = walletId;
			this.k = k;
			for (let i = 0; i < publicKeys.length; i += 1) this.owners.set(i, Buffer.concat([publicKeys[i], Buffer.alloc(1)]));
			this.init = {
				code: MULTISIG_CODE,
				data: (0, core_1.beginCell)().storeUint(this.walletId, 32).storeUint(this.owners.size, 8).storeUint(this.k, 8).storeUint(0, 64).storeDict(this.owners, core_1.Dictionary.Keys.Uint(8), core_1.Dictionary.Values.Buffer(33)).storeBit(0).endCell()
			};
			this.address = opts?.address || (0, core_1.contractAddress)(workchain, this.init);
			if (opts?.provider) this.provider = opts.provider;
			else if (opts?.client) this.provider = opts.client.provider(this.address, {
				code: this.init.code,
				data: this.init.data
			});
		}
		static async fromAddress(address, opts) {
			let provider;
			if (opts.provider) provider = opts.provider;
			else {
				if (!opts.client) throw Error("Either provider or client must be specified");
				provider = opts.client.provider(address, {
					code: null,
					data: null
				});
			}
			const contractState = (await provider.getState()).state;
			if (contractState.type !== "active") throw Error("Contract must be active");
			const data = core_1.Cell.fromBoc(contractState.data)[0].beginParse();
			const walletId = data.loadUint(32);
			data.skip(8);
			const k = data.loadUint(8);
			data.skip(64);
			const owners = data.loadDict(core_1.Dictionary.Keys.Uint(8), core_1.Dictionary.Values.Buffer(33));
			let publicKeys = [];
			for (const [key, value] of owners) {
				const publicKey = value.subarray(0, 32);
				publicKeys.push(publicKey);
			}
			return new MultisigWallet(publicKeys, address.workChain, walletId, k, {
				address,
				provider,
				client: opts.client
			});
		}
		async deployExternal(provider) {
			if (!provider && !this.provider) throw Error("you must specify provider if there is no such property in MultisigWallet instance");
			if (!provider) provider = this.provider;
			await provider.external(core_1.Cell.EMPTY);
		}
		async deployInternal(sender, value = 1000000000n) {
			await sender.send({
				sendMode: core_1.SendMode.PAY_GAS_SEPARATELY + core_1.SendMode.IGNORE_ERRORS,
				to: this.address,
				value,
				init: this.init,
				body: core_1.Cell.EMPTY,
				bounce: true
			});
		}
		async sendOrder(order, secretKey, provider) {
			if (!provider && !this.provider) throw Error("you must specify provider if there is no such property in MultisigWallet instance");
			if (!provider) provider = this.provider;
			let publicKey = (0, crypto_1.keyPairFromSecretKey)(secretKey).publicKey;
			let ownerId = this.getOwnerIdByPubkey(publicKey);
			let cell = order.toCell(ownerId);
			let signature = (0, crypto_1.sign)(cell.hash(), secretKey);
			cell = (0, core_1.beginCell)().storeBuffer(signature).storeSlice(cell.asSlice()).endCell();
			await provider.external(cell);
		}
		async sendOrderWithoutSecretKey(order, signature, ownerId, provider) {
			if (!provider && !this.provider) throw Error("you must specify provider if there is no such property in MultisigWallet instance");
			if (!provider) provider = this.provider;
			let cell = order.toCell(ownerId);
			cell = (0, core_1.beginCell)().storeBuffer(signature).storeSlice(cell.asSlice()).endCell();
			await provider.external(cell);
		}
		getOwnerIdByPubkey(publicKey) {
			for (const [key, value] of this.owners) if (value.subarray(0, 32).equals(publicKey)) return key;
			throw Error("public key is not an owner");
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/elector/ElectorContract.js
var require_ElectorContract = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ElectorContract = void 0;
	var core_1 = require_dist$1();
	var FrozenDictValue = {
		serialize(src, builder) {
			throw Error("not implemented");
		},
		parse(src) {
			return {
				address: new core_1.Address(-1, src.loadBuffer(32)),
				weight: src.loadUintBig(64),
				stake: src.loadCoins()
			};
		}
	};
	var EntitiesDictValue = {
		serialize(src, builder) {
			throw Error("not implemented");
		},
		parse(src) {
			const stake = src.loadCoins();
			src.skip(64);
			return {
				stake,
				address: new core_1.Address(-1, src.loadBuffer(32)),
				adnl: src.loadBuffer(32)
			};
		}
	};
	exports.ElectorContract = class ElectorContract {
		static create() {
			return new ElectorContract();
		}
		constructor() {
			this.address = core_1.Address.parseRaw("-1:3333333333333333333333333333333333333333333333333333333333333333");
		}
		async getReturnedStake(provider, address) {
			if (address.workChain !== -1) throw Error("Only masterchain addresses could have stake");
			return (await provider.get("compute_returned_stake", [{
				type: "int",
				value: BigInt("0x" + address.hash.toString("hex"))
			}])).stack.readBigNumber();
		}
		async getPastElectionsList(provider) {
			const res = await provider.get("past_elections_list", []);
			const electionsListRaw = new core_1.TupleReader(res.stack.readLispList());
			const elections = [];
			while (electionsListRaw.remaining > 0) {
				const electionsListEntry = electionsListRaw.readTuple();
				const id = electionsListEntry.readNumber();
				const unfreezeAt = electionsListEntry.readNumber();
				electionsListEntry.pop();
				const stakeHeld = electionsListEntry.readNumber();
				elections.push({
					id,
					unfreezeAt,
					stakeHeld
				});
			}
			return elections;
		}
		async getPastElections(provider) {
			const res = await provider.get("past_elections", []);
			const electionsRaw = new core_1.TupleReader(res.stack.readLispList());
			const elections = [];
			while (electionsRaw.remaining > 0) {
				const electionsEntry = electionsRaw.readTuple();
				const id = electionsEntry.readNumber();
				const unfreezeAt = electionsEntry.readNumber();
				const stakeHeld = electionsEntry.readNumber();
				electionsEntry.pop();
				const frozenDict = electionsEntry.readCell();
				const totalStake = electionsEntry.readBigNumber();
				const bonuses = electionsEntry.readBigNumber();
				let frozen = /* @__PURE__ */ new Map();
				const frozenData = frozenDict.beginParse().loadDictDirect(core_1.Dictionary.Keys.Buffer(32), FrozenDictValue);
				for (const [key, value] of frozenData) frozen.set(BigInt("0x" + key.toString("hex")).toString(10), {
					address: value["address"],
					weight: value["weight"],
					stake: value["stake"]
				});
				elections.push({
					id,
					unfreezeAt,
					stakeHeld,
					totalStake,
					bonuses,
					frozen
				});
			}
			return elections;
		}
		async getElectionEntities(provider) {
			const account = await provider.getState();
			if (account.state.type !== "active") throw Error("Unexpected error");
			const cs = core_1.Cell.fromBoc(account.state.data)[0].beginParse();
			if (!cs.loadBit()) return null;
			const sc = cs.loadRef().beginParse();
			const startWorkTime = sc.loadUint(32);
			const endElectionsTime = sc.loadUint(32);
			const minStake = sc.loadCoins();
			const allStakes = sc.loadCoins();
			const entitiesData = sc.loadDict(core_1.Dictionary.Keys.Buffer(32), EntitiesDictValue);
			let entities = [];
			if (entitiesData) for (const [key, value] of entitiesData) entities.push({
				pubkey: key,
				stake: value["stake"],
				address: value["address"],
				adnl: value["adnl"]
			});
			return {
				minStake,
				allStakes,
				endElectionsTime,
				startWorkTime,
				entities
			};
		}
		async getActiveElectionId(provider) {
			const electionId = (await provider.get("active_election_id", [])).stack.readNumber();
			return electionId > 0 ? electionId : null;
		}
		async getComplaints(provider, electionId) {
			const b = new core_1.TupleBuilder();
			b.writeNumber(electionId);
			const res = await provider.get("list_complaints", b.build());
			if (res.stack.peek().type === "null") return [];
			const complaintsRaw = new core_1.TupleReader(res.stack.readLispList());
			const results = [];
			while (complaintsRaw.remaining > 0) {
				const complaintsEntry = complaintsRaw.readTuple();
				const id = complaintsEntry.readBigNumber();
				const completeUnpackedComplaint = complaintsEntry.readTuple();
				const unpackedComplaints = completeUnpackedComplaint.readTuple();
				const publicKey = Buffer.from(unpackedComplaints.readBigNumber().toString(16), "hex");
				unpackedComplaints.readCell();
				const createdAt = unpackedComplaints.readNumber();
				const severity = unpackedComplaints.readNumber();
				const rewardAddress = new core_1.Address(-1, Buffer.from(unpackedComplaints.readBigNumber().toString(16), "hex"));
				const paid = unpackedComplaints.readBigNumber();
				const suggestedFine = unpackedComplaints.readBigNumber();
				const suggestedFinePart = unpackedComplaints.readBigNumber();
				const votes = [];
				const votersListRaw = new core_1.TupleReader(completeUnpackedComplaint.readLispList());
				while (votersListRaw.remaining > 0) votes.push(votersListRaw.readNumber());
				const vsetId = completeUnpackedComplaint.readBigNumber();
				const remainingWeight = completeUnpackedComplaint.readBigNumber();
				results.push({
					id,
					publicKey,
					createdAt,
					severity,
					paid,
					suggestedFine,
					suggestedFinePart,
					rewardAddress,
					votes,
					remainingWeight,
					vsetId
				});
			}
			return results;
		}
	};
}));
//#endregion
//#region node_modules/@ton/ton/dist/config/ConfigParser.js
var require_ConfigParser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.configParseMasterAddress = configParseMasterAddress;
	exports.parseValidatorSet = parseValidatorSet;
	exports.parseBridge = parseBridge;
	exports.configParseMasterAddressRequired = configParseMasterAddressRequired;
	exports.configParse5 = configParse5;
	exports.configParse6 = configParse6;
	exports.configParse7 = configParse7;
	exports.configParse9 = configParse9;
	exports.configParse10 = configParse10;
	exports.configParse13 = configParse13;
	exports.configParse14 = configParse14;
	exports.configParse15 = configParse15;
	exports.configParse16 = configParse16;
	exports.configParse17 = configParse17;
	exports.configParse18 = configParse18;
	exports.configParse8 = configParse8;
	exports.configParse40 = configParse40;
	exports.configParseWorkchainDescriptor = configParseWorkchainDescriptor;
	exports.configParse12 = configParse12;
	exports.configParseValidatorSet = configParseValidatorSet;
	exports.configParseBridge = configParseBridge;
	exports.loadJettonBridgeParams = loadJettonBridgeParams;
	exports.configParseGasLimitsPrices = configParseGasLimitsPrices;
	exports.configParseBlockLimits = configParseBlockLimits;
	exports.configParseMsgPrices = configParseMsgPrices;
	exports.configParse28 = configParse28;
	exports.configParse29 = configParse29;
	exports.configParse31 = configParse31;
	exports.configParse44 = configParse44;
	exports.configParse45 = configParse45;
	exports.parseProposalSetup = parseProposalSetup;
	exports.parseVotingSetup = parseVotingSetup;
	exports.loadConfigParamById = loadConfigParamById;
	exports.loadConfigParamsAsSlice = loadConfigParamsAsSlice;
	exports.parseFullConfig = parseFullConfig;
	exports.parseFullerConfig = parseFullerConfig;
	var core_1 = require_dist$1();
	function configParseMasterAddress(slice) {
		if (slice) return new core_1.Address(-1, slice.loadBuffer(32));
		else return null;
	}
	function readPublicKey(slice) {
		if (slice.loadUint(32) !== 2390828938) throw Error("Invalid publicKey");
		return slice.loadBuffer(32);
	}
	var ValidatorDescriptionDictValue = {
		serialize(src, builder) {
			throw Error("not implemented");
		},
		parse(src) {
			const header = src.loadUint(8);
			if (header === 83) return {
				publicKey: readPublicKey(src),
				weight: src.loadUintBig(64),
				adnlAddress: null
			};
			else if (header === 115) return {
				publicKey: readPublicKey(src),
				weight: src.loadUintBig(64),
				adnlAddress: src.loadBuffer(32)
			};
			else throw Error("Invalid validator description dict");
		}
	};
	function parseValidatorSet(slice) {
		const header = slice.loadUint(8);
		if (header === 17) return {
			timeSince: slice.loadUint(32),
			timeUntil: slice.loadUint(32),
			total: slice.loadUint(16),
			main: slice.loadUint(16),
			totalWeight: null,
			list: slice.loadDictDirect(core_1.Dictionary.Keys.Uint(16), ValidatorDescriptionDictValue)
		};
		else if (header === 18) return {
			timeSince: slice.loadUint(32),
			timeUntil: slice.loadUint(32),
			total: slice.loadUint(16),
			main: slice.loadUint(16),
			totalWeight: slice.loadUintBig(64),
			list: slice.loadDict(core_1.Dictionary.Keys.Uint(16), ValidatorDescriptionDictValue)
		};
		return null;
	}
	function parseBridge(slice) {
		const bridgeAddress = new core_1.Address(-1, slice.loadBuffer(32));
		const oracleMultisigAddress = new core_1.Address(-1, slice.loadBuffer(32));
		const oraclesDict = slice.loadDict(core_1.Dictionary.Keys.Buffer(32), core_1.Dictionary.Values.Buffer(32));
		const oracles = /* @__PURE__ */ new Map();
		for (const [local, remote] of oraclesDict) oracles.set(new core_1.Address(-1, local).toString(), remote);
		return {
			bridgeAddress,
			oracleMultisigAddress,
			oracles,
			externalChainAddress: slice.loadBuffer(32)
		};
	}
	function configParseMasterAddressRequired(slice) {
		if (!slice) throw Error("Invalid master address");
		return configParseMasterAddress(slice);
	}
	function configParse5(slice) {
		if (!slice) throw Error("No config5 slice");
		if (slice.loadUint(8) === 1) return {
			blackholeAddr: slice.loadBit() ? new core_1.Address(-1, slice.loadBuffer(32)) : null,
			feeBurnNominator: slice.loadUint(32),
			feeBurnDenominator: slice.loadUint(32)
		};
		throw new Error("Invalid config5");
	}
	function configParse6(slice) {
		if (!slice) return null;
		return {
			mintNewPrice: slice.loadCoins(),
			mintAddPrice: slice.loadCoins()
		};
	}
	function configParse7(slice) {
		if (!slice) throw Error("No config7 slice");
		return { toMint: (0, core_1.loadExtraCurrency)(slice.loadRef()) };
	}
	function configParse9(slice) {
		if (!slice) throw Error("No config9 slice");
		return new Set(slice.loadDictDirect(core_1.Dictionary.Keys.Int(32), core_1.Dictionary.Values.Uint(0)).keys());
	}
	function configParse10(slice) {
		if (!slice) throw Error("No config10 slice");
		return new Set(slice.loadDictDirect(core_1.Dictionary.Keys.Int(32), core_1.Dictionary.Values.Uint(0)).keys());
	}
	function configParse13(slice) {
		if (!slice) throw Error("No config13 slice");
		if (slice.loadUint(8) !== 26) throw new Error("Invalid config13");
		return {
			deposit: slice.loadCoins(),
			bitPrice: slice.loadCoins(),
			cellPrice: slice.loadCoins()
		};
	}
	function configParse14(slice) {
		if (!slice) throw Error("No config14 slice");
		if (slice.loadUint(8) !== 107) throw new Error("Invalid config14");
		return {
			masterchainBlockFee: slice.loadCoins(),
			workchainBlockFee: slice.loadCoins()
		};
	}
	function configParse15(slice) {
		if (!slice) throw Error("No config15 slice");
		return {
			validatorsElectedFor: slice.loadUint(32),
			electorsStartBefore: slice.loadUint(32),
			electorsEndBefore: slice.loadUint(32),
			stakeHeldFor: slice.loadUint(32)
		};
	}
	function configParse16(slice) {
		if (!slice) throw Error("No config16 slice");
		return {
			maxValidators: slice.loadUint(16),
			maxMainValidators: slice.loadUint(16),
			minValidators: slice.loadUint(16)
		};
	}
	function configParse17(slice) {
		if (!slice) throw Error("No config17 slice");
		return {
			minStake: slice.loadCoins(),
			maxStake: slice.loadCoins(),
			minTotalStake: slice.loadCoins(),
			maxStakeFactor: slice.loadUint(32)
		};
	}
	var StoragePricesDictValue = {
		serialize(src, builder) {
			throw Error("not implemented");
		},
		parse(src) {
			if (src.loadUint(8) !== 204) throw Error("Invalid storage prices dict");
			return {
				utime_since: src.loadUint(32),
				bit_price_ps: src.loadUintBig(64),
				cell_price_ps: src.loadUintBig(64),
				mc_bit_price_ps: src.loadUintBig(64),
				mc_cell_price_ps: src.loadUintBig(64)
			};
		}
	};
	function configParse18(slice) {
		if (!slice) throw Error("No config18 slice");
		return slice.loadDictDirect(core_1.Dictionary.Keys.Buffer(4), StoragePricesDictValue).values();
	}
	function configParse8(slice) {
		if (!slice) return {
			version: 0,
			capabilities: 0n
		};
		return {
			version: slice.loadUint(32),
			capabilities: slice.loadUintBig(64)
		};
	}
	function configParse40(slice) {
		if (!slice) return null;
		if (slice.loadUint(8) !== 1) throw Error("Invalid config40");
		return {
			defaultFlatFine: slice.loadCoins(),
			defaultProportionaFine: slice.loadCoins(),
			severityFlatMult: slice.loadUint(16),
			severityProportionalMult: slice.loadUint(16),
			unfunishableInterval: slice.loadUint(16),
			longInterval: slice.loadUint(16),
			longFlatMult: slice.loadUint(16),
			longProportionalMult: slice.loadUint(16),
			mediumInterval: slice.loadUint(16),
			mediumFlatMult: slice.loadUint(16),
			mediumProportionalMult: slice.loadUint(16)
		};
	}
	function configParseWorkchainDescriptor(slice) {
		const constructorTag = slice.loadUint(8);
		if (!(constructorTag == 166 || constructorTag == 167)) throw Error("Invalid workchain descriptor");
		const enabledSince = slice.loadUint(32);
		const actialMinSplit = slice.loadUint(8);
		const min_split = slice.loadUint(8);
		const max_split = slice.loadUint(8);
		const basic = slice.loadBit();
		const active = slice.loadBit();
		const accept_msgs = slice.loadBit();
		const flags = slice.loadUint(13);
		const zerostateRootHash = slice.loadBuffer(32);
		const zerostateFileHash = slice.loadBuffer(32);
		const version = slice.loadUint(32);
		if (!slice.loadUint(4)) throw Error("Not basic workchain descriptor");
		const vmVersion = slice.loadInt(32);
		const vmMode = slice.loadUintBig(64);
		let extension = void 0;
		if (constructorTag == 167) {
			const splitMergeTimings = parseWorkchainSplitMergeTimings(slice);
			const stateSplitDepth = slice.loadUint(8);
			if (stateSplitDepth > 63) throw RangeError(`Invalid persistent_state_split_depth: ${stateSplitDepth} expected <= 63`);
			extension = {
				split_merge_timings: splitMergeTimings,
				persistent_state_split_depth: stateSplitDepth
			};
		}
		return {
			enabledSince,
			actialMinSplit,
			min_split,
			max_split,
			basic,
			active,
			accept_msgs,
			flags,
			zerostateRootHash,
			zerostateFileHash,
			version,
			format: {
				vmVersion,
				vmMode
			},
			workchain_v2: extension
		};
	}
	function parseWorkchainSplitMergeTimings(slice) {
		if (slice.loadUint(4) !== 0) throw Error(`Invalid WcSplitMergeTimings tag expected 0!`);
		return {
			split_merge_delay: slice.loadUint(32),
			split_merge_interval: slice.loadUint(32),
			min_split_merge_interval: slice.loadUint(32),
			max_split_merge_delay: slice.loadUint(32)
		};
	}
	var WorkchainDescriptorDictValue = {
		serialize(src, builder) {
			throw Error("not implemented");
		},
		parse(src) {
			return configParseWorkchainDescriptor(src);
		}
	};
	function configParse12(slice) {
		if (!slice) throw Error("No config12 slice");
		const wd = slice.loadDict(core_1.Dictionary.Keys.Uint(32), WorkchainDescriptorDictValue);
		if (wd) return wd;
		throw Error("No workchains exist");
	}
	function configParseValidatorSet(slice) {
		if (!slice) return null;
		return parseValidatorSet(slice);
	}
	function configParseBridge(slice) {
		if (!slice) return null;
		return parseBridge(slice);
	}
	function loadJettonBridgeParams(slice) {
		if (!slice) return null;
		const magic = slice.loadUint(8);
		if (magic === 0) return {
			bridgeAddress: new core_1.Address(-1, slice.loadBuffer(32)),
			oracleAddress: new core_1.Address(-1, slice.loadBuffer(32)),
			oracles: [...slice.loadDict(core_1.Dictionary.Keys.Buffer(32), core_1.Dictionary.Values.Buffer(32))].map((e) => ({
				addr: new core_1.Address(-1, e[0]),
				pubkey: e[1]
			})),
			flags: slice.loadUint(8),
			bridgeBurnFee: slice.loadCoins()
		};
		if (magic === 1) {
			const bridgeAddress = new core_1.Address(-1, slice.loadBuffer(32));
			const oracleAddress = new core_1.Address(-1, slice.loadBuffer(32));
			const oracles = [...slice.loadDict(core_1.Dictionary.Keys.Buffer(32), core_1.Dictionary.Values.Buffer(32))].map((e) => ({
				addr: new core_1.Address(-1, e[0]),
				pubkey: e[1]
			}));
			const flags = slice.loadUint(8);
			const pricesRef = slice.loadRef().beginParse();
			const bridgeBurnFee = pricesRef.loadCoins();
			const bridgeMintFee = pricesRef.loadCoins();
			const walletMinTonsForStorage = pricesRef.loadCoins();
			const walletGasConsumption = pricesRef.loadCoins();
			const minterMinTonsForStorage = pricesRef.loadCoins();
			const discoverGasConsumption = pricesRef.loadCoins();
			const externalChainAddress = slice.loadBuffer(32);
			return {
				bridgeAddress,
				oracleAddress,
				oracles,
				flags,
				jettonBridgePrices: {
					bridgeBurnFee,
					bridgeMintFee,
					walletMinTonsForStorage,
					walletGasConsumption,
					minterMinTonsForStorage,
					discoverGasConsumption
				},
				externalChainAddress
			};
		}
		throw new Error("Invalid msg prices param");
	}
	function parseGasLimitsInternal(slice) {
		const tag = slice.loadUint(8);
		if (tag === 222) return {
			gasPrice: slice.loadUintBig(64),
			gasLimit: slice.loadUintBig(64),
			specialGasLimit: slice.loadUintBig(64),
			gasCredit: slice.loadUintBig(64),
			blockGasLimit: slice.loadUintBig(64),
			freezeDueLimit: slice.loadUintBig(64),
			deleteDueLimit: slice.loadUintBig(64)
		};
		else if (tag === 221) return {
			gasPrice: slice.loadUintBig(64),
			gasLimit: slice.loadUintBig(64),
			gasCredit: slice.loadUintBig(64),
			blockGasLimit: slice.loadUintBig(64),
			freezeDueLimit: slice.loadUintBig(64),
			deleteDueLimit: slice.loadUintBig(64)
		};
		else throw Error("Invalid gas limits internal");
	}
	function configParseGasLimitsPrices(slice) {
		if (!slice) throw Error("No gas limits slice");
		if (slice.loadUint(8) === 209) return {
			flatLimit: slice.loadUintBig(64),
			flatGasPrice: slice.loadUintBig(64),
			other: parseGasLimitsInternal(slice)
		};
		else throw Error("Invalid gas limits");
	}
	function configParseLimitParams(slice) {
		if (slice.loadUint(8) !== 195) throw Error("Invalid params limit slice");
		const underload = slice.loadUint(32);
		const softLimit = slice.loadUint(32);
		const hardLimit = slice.loadUint(32);
		if (underload > softLimit || softLimit > hardLimit) throw Error("Incosistent limitParams");
		return {
			underload,
			softLimit,
			hardLimit
		};
	}
	function configParseBlockLimits(slice) {
		if (!slice) throw Error("No block limits slice");
		const blockLimitTag = slice.loadUint(8);
		if (blockLimitTag === 93) return {
			bytes: configParseLimitParams(slice),
			gas: configParseLimitParams(slice),
			ltDelta: configParseLimitParams(slice)
		};
		if (blockLimitTag === 94) {
			const bytes = configParseLimitParams(slice);
			const gas = configParseLimitParams(slice);
			const ltDelta = configParseLimitParams(slice);
			const collatedData = configParseLimitParams(slice);
			if (slice.loadUint(8) !== 211) throw Error("Invalid importedMsgQueue");
			return {
				bytes,
				gas,
				ltDelta,
				collatedData,
				importedMsgQueue: {
					maxBytes: slice.loadUint(32),
					maxMsgs: slice.loadUint(32)
				}
			};
		}
		throw Error("Invalid block limits");
	}
	function configParseMsgPrices(slice) {
		if (!slice) throw new Error("No msg prices slice");
		if (slice.loadUint(8) !== 234) throw new Error("Invalid msg prices param");
		return {
			lumpPrice: slice.loadUintBig(64),
			bitPrice: slice.loadUintBig(64),
			cellPrice: slice.loadUintBig(64),
			ihrPriceFactor: slice.loadUint(32),
			firstFrac: slice.loadUint(16),
			nextFrac: slice.loadUint(16)
		};
	}
	function configParse28(slice) {
		if (!slice) throw new Error("No config28 slice");
		const magic = slice.loadUint(8);
		if (magic === 193) return {
			masterCatchainLifetime: slice.loadUint(32),
			shardCatchainLifetime: slice.loadUint(32),
			shardValidatorsLifetime: slice.loadUint(32),
			shardValidatorsCount: slice.loadUint(32)
		};
		if (magic === 194) return {
			flags: slice.loadUint(7),
			suffleMasterValidators: slice.loadBit(),
			masterCatchainLifetime: slice.loadUint(32),
			shardCatchainLifetime: slice.loadUint(32),
			shardValidatorsLifetime: slice.loadUint(32),
			shardValidatorsCount: slice.loadUint(32)
		};
		throw new Error("Invalid config28");
	}
	function configParse29(slice) {
		if (!slice) throw new Error("No config29 slice");
		const magic = slice.loadUint(8);
		if (magic === 214) return {
			roundCandidates: slice.loadUint(32),
			nextCandidateDelay: slice.loadUint(32),
			consensusTimeout: slice.loadUint(32),
			fastAttempts: slice.loadUint(32),
			attemptDuration: slice.loadUint(32),
			catchainMaxDeps: slice.loadUint(32),
			maxBlockBytes: slice.loadUint(32),
			maxColaltedBytes: slice.loadUint(32)
		};
		else if (magic === 215) return {
			flags: slice.loadUint(7),
			newCatchainIds: slice.loadBit(),
			roundCandidates: slice.loadUint(8),
			nextCandidateDelay: slice.loadUint(32),
			consensusTimeout: slice.loadUint(32),
			fastAttempts: slice.loadUint(32),
			attemptDuration: slice.loadUint(32),
			catchainMaxDeps: slice.loadUint(32),
			maxBlockBytes: slice.loadUint(32),
			maxColaltedBytes: slice.loadUint(32)
		};
		else if (magic === 216) return {
			flags: slice.loadUint(7),
			newCatchainIds: slice.loadBit(),
			roundCandidates: slice.loadUint(8),
			nextCandidateDelay: slice.loadUint(32),
			consensusTimeout: slice.loadUint(32),
			fastAttempts: slice.loadUint(32),
			attemptDuration: slice.loadUint(32),
			catchainMaxDeps: slice.loadUint(32),
			maxBlockBytes: slice.loadUint(32),
			maxColaltedBytes: slice.loadUint(32),
			protoVersion: slice.loadUint(16)
		};
		else if (magic === 217) return {
			flags: slice.loadUint(7),
			newCatchainIds: slice.loadBit(),
			roundCandidates: slice.loadUint(8),
			nextCandidateDelay: slice.loadUint(32),
			consensusTimeout: slice.loadUint(32),
			fastAttempts: slice.loadUint(32),
			attemptDuration: slice.loadUint(32),
			catchainMaxDeps: slice.loadUint(32),
			maxBlockBytes: slice.loadUint(32),
			maxColaltedBytes: slice.loadUint(32),
			protoVersion: slice.loadUint(16),
			catchainMaxBlocksCoeff: slice.loadUint(32)
		};
		throw new Error("Invalid config29");
	}
	function configParse31(slice) {
		if (!slice) throw Error("No config31 slice");
		return [...slice.loadDict(core_1.Dictionary.Keys.Buffer(32), core_1.Dictionary.Values.Uint(0))].map((e) => new core_1.Address(-1, e[0]));
	}
	function configParse44(slice) {
		if (!slice) throw Error("No config44 slice");
		if (slice.loadUint(8) !== 0) throw new Error("Invalid config44");
		const rawAddrsDict = slice.loadDict(core_1.Dictionary.Keys.Buffer(36), core_1.Dictionary.Values.Uint(0));
		const suspendedUntil = slice.loadUint(32);
		return {
			addresses: [...rawAddrsDict].map((e) => new core_1.Address(e[0].readInt32BE(), e[0].subarray(4))),
			suspendedUntil
		};
	}
	var PrecompiledContractsDictValue = {
		serialize: () => {
			throw Error("not implemented");
		},
		parse: (src) => {
			if (src.loadUint(8) !== 176) throw new Error("Invalid precompiled contracts dict");
			return src.loadUintBig(64);
		}
	};
	function configParse45(slice) {
		if (!slice) throw Error("No config45 slice");
		if (slice.loadUint(8) !== 192) throw new Error("Invalid config45");
		return [...slice.loadDict(core_1.Dictionary.Keys.Buffer(32), PrecompiledContractsDictValue)].map((e) => ({
			hash: e[0],
			gasUsed: e[1]
		}));
	}
	function parseProposalSetup(slice) {
		if (slice.loadUint(8) !== 54) throw new Error("Invalid proposal setup");
		return {
			minTotalRounds: slice.loadUint(8),
			maxTotalRounds: slice.loadUint(8),
			minWins: slice.loadUint(8),
			maxLoses: slice.loadUint(8),
			minStoreSec: slice.loadUint(32),
			maxStoreSec: slice.loadUint(32),
			bitPrice: slice.loadUint(32),
			cellPrice: slice.loadUint(32)
		};
	}
	function parseVotingSetup(slice) {
		if (!slice) throw new Error("No voting setup");
		if (slice.loadUint(8) !== 145) throw new Error("Invalid voting setup");
		return {
			normalParams: parseProposalSetup(slice.loadRef().beginParse()),
			criticalParams: parseProposalSetup(slice.loadRef().beginParse())
		};
	}
	function loadConfigParams(configBase64) {
		return core_1.Cell.fromBase64(configBase64).beginParse().loadDictDirect(core_1.Dictionary.Keys.Int(32), core_1.Dictionary.Values.Cell());
	}
	function loadConfigParamById(configBase64, id) {
		return loadConfigParams(configBase64).get(id);
	}
	function loadConfigParamsAsSlice(configBase64) {
		const pramsAsCells = loadConfigParams(configBase64);
		const params = /* @__PURE__ */ new Map();
		for (const [key, value] of pramsAsCells) params.set(key, value.beginParse());
		return params;
	}
	function parseFullConfig(configs) {
		return {
			configAddress: configParseMasterAddressRequired(configs.get(0)),
			electorAddress: configParseMasterAddressRequired(configs.get(1)),
			minterAddress: configParseMasterAddress(configs.get(2)),
			feeCollectorAddress: configParseMasterAddress(configs.get(3)),
			dnsRootAddress: configParseMasterAddress(configs.get(4)),
			burningConfig: configParse5(configs.get(5)),
			globalVersion: configParse8(configs.get(8)),
			workchains: configParse12(configs.get(12)),
			voting: parseVotingSetup(configs.get(11)),
			validators: {
				...configParse15(configs.get(15)),
				...configParse16(configs.get(16)),
				...configParse17(configs.get(17))
			},
			storagePrices: configParse18(configs.get(18)),
			gasPrices: {
				masterchain: configParseGasLimitsPrices(configs.get(20)),
				workchain: configParseGasLimitsPrices(configs.get(21))
			},
			msgPrices: {
				masterchain: configParseMsgPrices(configs.get(24)),
				workchain: configParseMsgPrices(configs.get(25))
			},
			validatorSets: {
				prevValidators: configParseValidatorSet(configs.get(32)),
				prevTempValidators: configParseValidatorSet(configs.get(33)),
				currentValidators: configParseValidatorSet(configs.get(34)),
				currentTempValidators: configParseValidatorSet(configs.get(35)),
				nextValidators: configParseValidatorSet(configs.get(36)),
				nextTempValidators: configParseValidatorSet(configs.get(37))
			},
			validatorsPunish: configParse40(configs.get(40)),
			bridges: {
				ethereum: configParseBridge(configs.get(71)),
				binance: configParseBridge(configs.get(72)),
				polygon: configParseBridge(configs.get(73))
			},
			catchain: configParse28(configs.get(28)),
			consensus: configParse29(configs.get(29))
		};
	}
	function parseFullerConfig(configs) {
		return {
			configAddress: configParseMasterAddressRequired(configs.get(0)),
			electorAddress: configParseMasterAddressRequired(configs.get(1)),
			minterAddress: configParseMasterAddress(configs.get(2)),
			feeCollectorAddress: configParseMasterAddress(configs.get(3)),
			dnsRootAddress: configParseMasterAddress(configs.get(4)),
			burningConfig: configParse5(configs.get(5)),
			extraCurrenciesMintPrices: configParse6(configs.get(6)),
			extraCurrencies: configParse7(configs.get(7)),
			globalVersion: configParse8(configs.get(8)),
			configMandatoryParams: configParse9(configs.get(9)),
			configCriticalParams: configParse10(configs.get(10)),
			voting: parseVotingSetup(configs.get(11)),
			workchains: configParse12(configs.get(12)),
			complaintCost: configParse13(configs.get(13)),
			blockCreationRewards: configParse14(configs.get(14)),
			validators: {
				...configParse15(configs.get(15)),
				...configParse16(configs.get(16)),
				...configParse17(configs.get(17))
			},
			storagePrices: configParse18(configs.get(18)),
			gasPrices: {
				masterchain: configParseGasLimitsPrices(configs.get(20)),
				workchain: configParseGasLimitsPrices(configs.get(21))
			},
			blockLimits: {
				masterchain: configParseBlockLimits(configs.get(22)),
				workchain: configParseBlockLimits(configs.get(23))
			},
			msgPrices: {
				masterchain: configParseMsgPrices(configs.get(24)),
				workchain: configParseMsgPrices(configs.get(25))
			},
			catchain: configParse28(configs.get(28)),
			consensus: configParse29(configs.get(29)),
			fundamentalSmcAddr: configParse31(configs.get(31)),
			validatorSets: {
				prevValidators: configParseValidatorSet(configs.get(32)),
				prevTempValidators: configParseValidatorSet(configs.get(33)),
				currentValidators: configParseValidatorSet(configs.get(34)),
				currentTempValidators: configParseValidatorSet(configs.get(35)),
				nextValidators: configParseValidatorSet(configs.get(36)),
				nextTempValidators: configParseValidatorSet(configs.get(37))
			},
			validatorsPunish: configParse40(configs.get(40)),
			suspended: configParse44(configs.get(44)),
			precompiledContracts: configParse45(configs.get(45)),
			bridges: {
				ethereum: configParseBridge(configs.get(71)),
				binance: configParseBridge(configs.get(72)),
				polygon: configParseBridge(configs.get(73))
			},
			tokenBridges: {
				ethereum: loadJettonBridgeParams(configs.get(79)),
				binance: loadJettonBridgeParams(configs.get(81)),
				polygon: loadJettonBridgeParams(configs.get(82))
			}
		};
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/utils/fees.js
var require_fees = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.computeStorageFees = computeStorageFees;
	exports.computeFwdFees = computeFwdFees;
	exports.computeGasPrices = computeGasPrices;
	exports.computeExternalMessageFees = computeExternalMessageFees;
	exports.computeMessageForwardFees = computeMessageForwardFees;
	var core_1 = require_dist$1();
	function computeStorageFees(data) {
		const { lastPaid, now, storagePrices, storageStat, special, masterchain } = data;
		if (now <= lastPaid || storagePrices.length === 0 || now < storagePrices[0].utime_since || special) return BigInt(0);
		let upto = Math.max(lastPaid, storagePrices[0].utime_since);
		let total = BigInt(0);
		for (let i = 0; i < storagePrices.length && upto < now; i++) {
			let valid_until = i < storagePrices.length - 1 ? Math.min(now, storagePrices[i + 1].utime_since) : now;
			let payment = BigInt(0);
			if (upto < valid_until) {
				let delta = valid_until - upto;
				payment += BigInt(storageStat.cells) * (masterchain ? storagePrices[i].mc_cell_price_ps : storagePrices[i].cell_price_ps);
				payment += BigInt(storageStat.bits) * (masterchain ? storagePrices[i].mc_bit_price_ps : storagePrices[i].bit_price_ps);
				payment = payment * BigInt(delta);
			}
			upto = valid_until;
			total += payment;
		}
		return shr16ceil(total);
	}
	function computeFwdFees(msgPrices, cells, bits) {
		return msgPrices.lumpPrice + shr16ceil(msgPrices.bitPrice * bits + msgPrices.cellPrice * cells);
	}
	function computeGasPrices(gasUsed, prices) {
		if (gasUsed <= prices.flatLimit) return prices.flatPrice;
		else return prices.flatPrice + (prices.price * (gasUsed - prices.flatLimit) >> 16n);
	}
	function computeExternalMessageFees(msgPrices, cell) {
		let storageStats = collectCellStats(cell);
		storageStats.bits -= cell.bits.length;
		storageStats.cells -= 1;
		return computeFwdFees(msgPrices, BigInt(storageStats.cells), BigInt(storageStats.bits));
	}
	function computeMessageForwardFees(msgPrices, cell) {
		let msg = (0, core_1.loadMessageRelaxed)(cell.beginParse());
		let storageStats = {
			bits: 0,
			cells: 0
		};
		if (msg.init) {
			const rawBuilder = new core_1.Cell().asBuilder();
			(0, core_1.storeStateInit)(msg.init)(rawBuilder);
			const raw = rawBuilder.endCell();
			let c = collectCellStats(raw);
			c.bits -= raw.bits.length;
			c.cells -= 1;
			storageStats.bits += c.bits;
			storageStats.cells += c.cells;
		}
		let bc = collectCellStats(msg.body);
		bc.bits -= msg.body.bits.length;
		bc.cells -= 1;
		storageStats.bits += bc.bits;
		storageStats.cells += bc.cells;
		let fees = computeFwdFees(msgPrices, BigInt(storageStats.cells), BigInt(storageStats.bits));
		let res = fees * BigInt(msgPrices.firstFrac) >> 16n;
		return {
			fees: res,
			remaining: fees - res
		};
	}
	function collectCellStats(cell) {
		let bits = cell.bits.length;
		let cells = 1;
		for (let ref of cell.refs) {
			let r = collectCellStats(ref);
			cells += r.cells;
			bits += r.bits;
		}
		return {
			bits,
			cells
		};
	}
	function shr16ceil(src) {
		let rem = src % 65536n;
		let res = src >> 16n;
		if (rem !== 0n) res += 1n;
		return res;
	}
}));
//#endregion
//#region node_modules/@ton/ton/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Whales Corp.
	* All Rights Reserved.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.computeStorageFees = exports.computeMessageForwardFees = exports.computeGasPrices = exports.computeFwdFees = exports.computeExternalMessageFees = exports.loadConfigParamsAsSlice = exports.loadConfigParamById = exports.parseFullerConfig = exports.parseFullConfig = exports.parseVotingSetup = exports.parseValidatorSet = exports.parseProposalSetup = exports.parseBridge = exports.configParseWorkchainDescriptor = exports.configParseValidatorSet = exports.configParseMsgPrices = exports.configParseMasterAddressRequired = exports.configParseMasterAddress = exports.configParseGasLimitsPrices = exports.configParseBridge = exports.configParse40 = exports.configParse29 = exports.configParse28 = exports.configParse18 = exports.configParse17 = exports.configParse16 = exports.configParse15 = exports.configParse13 = exports.configParse12 = exports.configParse8 = exports.configParse5 = exports.ElectorContract = exports.MultisigWallet = exports.MultisigOrderBuilder = exports.MultisigOrder = exports.JettonWallet = exports.JettonMaster = exports.WalletContractV5R1 = exports.WalletContractV5Beta = exports.WalletContractV4 = exports.WalletContractV3R2 = exports.WalletContractV3R1 = exports.WalletContractV2R2 = exports.WalletContractV2R1 = exports.WalletContractV1R3 = exports.WalletContractV1R2 = exports.WalletContractV1R1 = exports.TonClient4 = exports.TonClient = exports.HttpApi = void 0;
	__exportStar(require_dist$1(), exports);
	var HttpApi_1 = require_HttpApi();
	Object.defineProperty(exports, "HttpApi", {
		enumerable: true,
		get: function() {
			return HttpApi_1.HttpApi;
		}
	});
	var TonClient_1 = require_TonClient();
	Object.defineProperty(exports, "TonClient", {
		enumerable: true,
		get: function() {
			return TonClient_1.TonClient;
		}
	});
	var TonClient4_1 = require_TonClient4();
	Object.defineProperty(exports, "TonClient4", {
		enumerable: true,
		get: function() {
			return TonClient4_1.TonClient4;
		}
	});
	var WalletContractV1R1_1 = require_WalletContractV1R1();
	Object.defineProperty(exports, "WalletContractV1R1", {
		enumerable: true,
		get: function() {
			return WalletContractV1R1_1.WalletContractV1R1;
		}
	});
	var WalletContractV1R2_1 = require_WalletContractV1R2();
	Object.defineProperty(exports, "WalletContractV1R2", {
		enumerable: true,
		get: function() {
			return WalletContractV1R2_1.WalletContractV1R2;
		}
	});
	var WalletContractV1R3_1 = require_WalletContractV1R3();
	Object.defineProperty(exports, "WalletContractV1R3", {
		enumerable: true,
		get: function() {
			return WalletContractV1R3_1.WalletContractV1R3;
		}
	});
	var WalletContractV2R1_1 = require_WalletContractV2R1();
	Object.defineProperty(exports, "WalletContractV2R1", {
		enumerable: true,
		get: function() {
			return WalletContractV2R1_1.WalletContractV2R1;
		}
	});
	var WalletContractV2R2_1 = require_WalletContractV2R2();
	Object.defineProperty(exports, "WalletContractV2R2", {
		enumerable: true,
		get: function() {
			return WalletContractV2R2_1.WalletContractV2R2;
		}
	});
	var WalletContractV3R1_1 = require_WalletContractV3R1();
	Object.defineProperty(exports, "WalletContractV3R1", {
		enumerable: true,
		get: function() {
			return WalletContractV3R1_1.WalletContractV3R1;
		}
	});
	var WalletContractV3R2_1 = require_WalletContractV3R2();
	Object.defineProperty(exports, "WalletContractV3R2", {
		enumerable: true,
		get: function() {
			return WalletContractV3R2_1.WalletContractV3R2;
		}
	});
	var WalletContractV4_1 = require_WalletContractV4();
	Object.defineProperty(exports, "WalletContractV4", {
		enumerable: true,
		get: function() {
			return WalletContractV4_1.WalletContractV4;
		}
	});
	var WalletContractV5Beta_1 = require_WalletContractV5Beta();
	Object.defineProperty(exports, "WalletContractV5Beta", {
		enumerable: true,
		get: function() {
			return WalletContractV5Beta_1.WalletContractV5Beta;
		}
	});
	var WalletContractV5R1_1 = require_WalletContractV5R1();
	Object.defineProperty(exports, "WalletContractV5R1", {
		enumerable: true,
		get: function() {
			return WalletContractV5R1_1.WalletContractV5R1;
		}
	});
	var JettonMaster_1 = require_JettonMaster();
	Object.defineProperty(exports, "JettonMaster", {
		enumerable: true,
		get: function() {
			return JettonMaster_1.JettonMaster;
		}
	});
	var JettonWallet_1 = require_JettonWallet();
	Object.defineProperty(exports, "JettonWallet", {
		enumerable: true,
		get: function() {
			return JettonWallet_1.JettonWallet;
		}
	});
	var MultisigOrder_1 = require_MultisigOrder();
	Object.defineProperty(exports, "MultisigOrder", {
		enumerable: true,
		get: function() {
			return MultisigOrder_1.MultisigOrder;
		}
	});
	var MultisigOrderBuilder_1 = require_MultisigOrderBuilder();
	Object.defineProperty(exports, "MultisigOrderBuilder", {
		enumerable: true,
		get: function() {
			return MultisigOrderBuilder_1.MultisigOrderBuilder;
		}
	});
	var MultisigWallet_1 = require_MultisigWallet();
	Object.defineProperty(exports, "MultisigWallet", {
		enumerable: true,
		get: function() {
			return MultisigWallet_1.MultisigWallet;
		}
	});
	var ElectorContract_1 = require_ElectorContract();
	Object.defineProperty(exports, "ElectorContract", {
		enumerable: true,
		get: function() {
			return ElectorContract_1.ElectorContract;
		}
	});
	var ConfigParser_1 = require_ConfigParser();
	Object.defineProperty(exports, "configParse5", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse5;
		}
	});
	Object.defineProperty(exports, "configParse8", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse8;
		}
	});
	Object.defineProperty(exports, "configParse12", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse12;
		}
	});
	Object.defineProperty(exports, "configParse13", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse13;
		}
	});
	Object.defineProperty(exports, "configParse15", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse15;
		}
	});
	Object.defineProperty(exports, "configParse16", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse16;
		}
	});
	Object.defineProperty(exports, "configParse17", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse17;
		}
	});
	Object.defineProperty(exports, "configParse18", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse18;
		}
	});
	Object.defineProperty(exports, "configParse28", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse28;
		}
	});
	Object.defineProperty(exports, "configParse29", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse29;
		}
	});
	Object.defineProperty(exports, "configParse40", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParse40;
		}
	});
	Object.defineProperty(exports, "configParseBridge", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseBridge;
		}
	});
	Object.defineProperty(exports, "configParseGasLimitsPrices", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseGasLimitsPrices;
		}
	});
	Object.defineProperty(exports, "configParseMasterAddress", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseMasterAddress;
		}
	});
	Object.defineProperty(exports, "configParseMasterAddressRequired", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseMasterAddressRequired;
		}
	});
	Object.defineProperty(exports, "configParseMsgPrices", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseMsgPrices;
		}
	});
	Object.defineProperty(exports, "configParseValidatorSet", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseValidatorSet;
		}
	});
	Object.defineProperty(exports, "configParseWorkchainDescriptor", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.configParseWorkchainDescriptor;
		}
	});
	Object.defineProperty(exports, "parseBridge", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseBridge;
		}
	});
	Object.defineProperty(exports, "parseProposalSetup", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseProposalSetup;
		}
	});
	Object.defineProperty(exports, "parseValidatorSet", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseValidatorSet;
		}
	});
	Object.defineProperty(exports, "parseVotingSetup", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseVotingSetup;
		}
	});
	Object.defineProperty(exports, "parseFullConfig", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseFullConfig;
		}
	});
	Object.defineProperty(exports, "parseFullerConfig", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.parseFullerConfig;
		}
	});
	Object.defineProperty(exports, "loadConfigParamById", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.loadConfigParamById;
		}
	});
	Object.defineProperty(exports, "loadConfigParamsAsSlice", {
		enumerable: true,
		get: function() {
			return ConfigParser_1.loadConfigParamsAsSlice;
		}
	});
	var fees_1 = require_fees();
	Object.defineProperty(exports, "computeExternalMessageFees", {
		enumerable: true,
		get: function() {
			return fees_1.computeExternalMessageFees;
		}
	});
	Object.defineProperty(exports, "computeFwdFees", {
		enumerable: true,
		get: function() {
			return fees_1.computeFwdFees;
		}
	});
	Object.defineProperty(exports, "computeGasPrices", {
		enumerable: true,
		get: function() {
			return fees_1.computeGasPrices;
		}
	});
	Object.defineProperty(exports, "computeMessageForwardFees", {
		enumerable: true,
		get: function() {
			return fees_1.computeMessageForwardFees;
		}
	});
	Object.defineProperty(exports, "computeStorageFees", {
		enumerable: true,
		get: function() {
			return fees_1.computeStorageFees;
		}
	});
}));
//#endregion
export default require_dist();

//# sourceMappingURL=@ton_ton.js.map