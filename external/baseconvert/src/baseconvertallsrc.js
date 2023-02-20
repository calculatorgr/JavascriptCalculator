(function (window, undefined) {
	'use strict';

	// new Base({
	//  Big: Big, // An instance of either Big or BigNumber to be used to convert to a number's internal representation.
	//  extensions: [...], // Array of objects to pass to extend(); or array of functions returning objects to pass to extend().
	// })
	function Base(options) {
		var Big = this.Big = options.Big;

		// Settings.
		if (Big.DP) {
			// Big.js used for low precision.
			this.FRACTION_PRECISION = Math.floor(Big.DP * Math.log(10) / Math.log(2));
			if (!Big.prototype.floor) {
				Big.prototype.floor = function () {
					return this.round(0, 0);
				};
			}
		} else if (Big.config) {
			// BigNumber.js used for high precision.
			var config = Big.config();
			this.FRACTION_PRECISION = Math.floor(config.DECIMAL_PLACES * Math.log(10) / Math.log(2));
		} else {
			throw new TypeError('Expected options.Big to be Big or BigNumber');
		}

		this.ext = {
			// To internal representation.
			from: [],

			// From internal representation.
			to: [],

			// Direct conversion from one base to another.
			convert: [],

			// Suggest bases.
			suggest: [],

			// Get the name of a base.
			getName: [],

			// Validate a base.
			valid: [],
		};

		this.extend(options.extensions || []);
	}

	// base.extend({
	// 	from: function (fromBase, number) { },
	// 	to: function (toBase, number) { },
	// 	convert: function (fromBase, toBase, number) { },
	// 	suggest: function (baseText, reBaseText) { },
	// 	getName: function (baseId) { },
	// });
	Base.prototype.extend = function (extension) {
		// If extension is a function, call it and recurse.
		if (typeof extension === 'function') {
			this.extend(extension.call(this));
			return;
		}

		// If extension is an array, recurse.
		if (extension.length) {
			for (var i = 0; i < extension.length; i++) {
				this.extend(extension[i]);
			}
			return;
		}

		// Add the extensions.
		for (var key in this.ext) {
			if (key in extension) {
				this.ext[key].push(extension[key]);
			}
		}
	};

	Base.prototype.convert = function (fromBase, toBase, number) {
		fromBase += '';
		toBase += '';
		number += '';

		// Directly converted.
		var result = notUndefined(this.ext.convert, function (fn) {
			return fn(fromBase, toBase, number);
		});

		if (!result) {
			result = this.to(toBase, this.from(fromBase, number));
		}

		// Not directly converted, so first convert to internal, then to the target base.
		return result;
	};

	Base.prototype.convertToMultiple = function (fromBase, toBases, number) {
		var self = this;
		fromBase += '';
		number += '';

		var internal = false;

		var results = toBases.map(function (toBase) {
			toBase += '';

			// Directly converted.
			var result = notUndefined(self.ext.convert, function (fn) {
				return fn(fromBase, toBase, number);
			});

			if (!result) {
				// Not directly converted, so first convert to internal, then to the target base.
				if (internal === false) {
					internal = self.from(fromBase, number);
				}

				if (internal) {
					result = self.to(toBase, internal);
				}
			}

			return result;
		});

		return results;
	};

	Base.prototype.from = function (fromBase, number) {
		if (number == null) {
			return;
		}

		fromBase += '';
		number += '';

		return this.toBig(notUndefined(this.ext.from, function (fn) {
			return fn(fromBase, number);
		}));
	};

	Base.prototype.to = function (toBase, number) {
		if (number == null) {
			return;
		}

		toBase += '';
		number = this.toBig(number);

		return notUndefined(this.ext.to, function (fn) {
			return fn(toBase, number);
		});
	};

	Base.prototype.valid = function (base, number) {
		function execValid(fn) {
			return fn(base, number);
		}

		return (
			// Check extensions.
			this.ext.valid.some(execValid)

			// Just try to convert.
			|| this.convert(base, '10', number || '1') !== undefined
		);
	};

	Base.prototype.getName = function (baseId) {
		return notUndefined(this.ext.getName, function (fn) {
			return fn(baseId);
		});
	};

	Base.prototype.suggest = function (baseText) {
		baseText = baseText.toLowerCase();
		var reBaseText = new RegExp(regexpEscape(baseText), 'i');

		return this.ext.suggest.reduce(function (obj, fn) {

			var curSuggestions = fn(baseText, reBaseText);

			append(obj.match, curSuggestions.match);
			append(obj.proposed, curSuggestions.proposed);
			append(obj.good, curSuggestions.good);
			append(obj.other, curSuggestions.other);

			return obj;
		}, { match: [], proposed: [], good: [], other: [] });
	};

	Base.prototype.suggestList = function (baseText) {
		var categorized = this.suggest(baseText);

		var result = [];

		append(result, categorized.match);
		append(result, categorized.proposed);
		append(result, categorized.good);
		append(result, categorized.other);

		return result;
	};

	Base.prototype.toBig = function (number) {
		if (typeof number === 'number' || typeof number === 'string') {
			return new this.Big(
				number === 0 && 1/number < 0
					? '-0'
					: '' + number
			);
		} else {
			return number;
		}
	};


	// Public utilities.
	Base.addSpaces = function (input, numCharsInGroup, fromBeginning) {
		var parts = [];
		var index = 0;
		var remainderChars = input.length % numCharsInGroup;
		if (!fromBeginning && remainderChars) {
			parts.push(input.substr(0, remainderChars));
			index = remainderChars;
		}

		for (; index < input.length; index += numCharsInGroup) {
			parts.push(input.substr(index, numCharsInGroup));
		}

		return parts.join(' ');
	};


	// Utilities.

	function append(array, arrayToAppend) {
		if (arrayToAppend) {
			array.push.apply(array, arrayToAppend);
		}
	}

	function notUndefined(array, fn) {
		for (var i = 0; i < array.length; i++) {
			var result = fn(array[i]);
			if (result !== undefined) {
				return result;
			}
		}
	}

	function toBig(number) {
		if (typeof number === 'number' || typeof number === 'string') {

		}
	}

	// by jQuery UI
	function regexpEscape(value) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
	}


	window.Base = Base;

}(window));
function extStandard() {
	'use strict';
	var undefined;
	var converter = this;
	var Base = converter.constructor;
	var dictionary = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var dictionaryArr = dictionary.split('');


	var reValidNumber = {
		// allow binary and hexadecimal numbers to begin with 0b and 0x respectively
		2: /^(\-?[01]*\.?[01]*|\-?0b[01]+\.?[01]*)$/i,
		16: /^(\-?[0-9a-f]*\.?[0-9a-f]*|\-?0x[0-9a-f]+\.?[0-9a-f]*)$/i,
	};
	var reValidNumberBig = /^\-?(\d+(\:\d+)*)?\.?(\d+(\:\d+)*)?$/;
	var baseNames = { 2: 'binary', 8: 'octal', 10: 'decimal', 12: 'duodecimal', 16: 'hexadecimal', '-2': 'negabinary', '-10': 'negadecimal' };
	var baseSuggestions = {
		proposed: '2 8 10 12 16'.split(' '),
		good: '20 36 60 100'.split(' '),
		other: '11 13 14 15 18 30 40 50 70 80 90'.split(' '),
	};
	var spacing = {
		2: 4,
		4: 4,
		8: 4,
		16: 4,
		10: 3,
	};
	var spacingFraction = {
		2: 4,
		4: 4,
		8: 4,
		16: 4,
		10: 5,
	};


	function isInt(num) {
		return num.eq(num.floor());
	}

	function getValidator(base) {
		var chars = '[' + dictionary.substr(0, Math.abs(base)) + ']*';
		return (reValidNumber[base] = new RegExp('^\\-?' + chars + '\\.?' + chars + '$', 'i'));
	}
	function getName(base) {
		if (parseInt(base, 10) + '' === base && base < -1 || base > 1) {
			if (baseNames[base]) {
				return baseNames[base] + ' (base ' + base + ')';
			} else {
				return 'base ' + base;
			}
		}
	}

	function toGenericNegative(toBase, number) {
		var digits = [];

		while (!number.eq(0)) {
			var remainder = +number.mod(toBase).valueOf();
			number = number.sub(remainder).div(toBase);

			if (remainder < 0) {
				remainder += -toBase;
				number = number.add(1);
			}

			digits.push(remainder);
		}

		digits.reverse();
		return digits;
	}
	function toGeneric(toBase, number) {
		if (number.eq(0)) {
			return {
				digits: [0],
				neg: false,
				pt: false
			};
		}

		if (toBase < 0) {
			return {
				digits: toGenericNegative(toBase, number),
				neg: false,
				pt: false
			};
		}

		var tmp, integerLength,
			digits = [],
			isNegative = number.lt(0),
			integ = number.abs().floor(), // the integer part; make the number non-negative
			fract = number.abs().mod(1), // the fractional part; we don't need the 'number' variable any more
			significantDigits = 0,

			// number of significant digits we can safely handle
			maxSignificantFractionDigits = Math.floor(converter.FRACTION_PRECISION * Math.log(2) / Math.log(toBase));

		// find the integer part of the result
		while (integ.gt(0)) {
			tmp = +integ.mod(toBase).valueOf(); // sufficiently small
			digits.unshift(tmp);
			integ = integ.sub(tmp).div(toBase);
		}
		integerLength = digits.length;

		// find the fractional part of the result
		for (; significantDigits < maxSignificantFractionDigits && !fract.eq(0); significantDigits++) {
			fract = fract.mul(toBase);
			tmp = fract.floor();
			fract = fract.sub(tmp);
			digits.push(+tmp.valueOf()); // sufficiently small
		}

		if (significantDigits >= maxSignificantFractionDigits) {
			// round (away from zero)

			// fraction
			if (digits.pop() >= toBase / 2) {
				// 3199.9995 -> 3200; 0.129999 -> 0.13; 9999.9999 -> 10000
				// round up
				tmp = digits.length;
				// add 1 to the last element, but if it's toBase, we'll have to remove it, and check the next
				while (++digits[--tmp] === toBase) {
					digits[tmp] = 0;
				}
				digits.length = Math.max(tmp + 1, integerLength); // truncate the array
			} else {
				// 3120.0004 -> 3120; 0.120004 -> 0.12
				// round down
				tmp = digits.length;
				while (digits[--tmp] === 0 && tmp >= integerLength) {
				}
				digits.length = tmp + 1;
			}
		}
		if (digits[-1] !== undefined) {
			digits.unshift(1);
			integerLength++;
		}
		if (integerLength === 0) {
			// .16 -> 0.16
			digits.unshift(0);
			integerLength++;
		}
		return {
			digits: digits,
			neg: isNegative,
			pt: integerLength === digits.length ? false : integerLength
		};
	}

	function validFrom(fromBase, number) {
		var abs = Math.abs(fromBase);
		number = number.replace(/ /g, '').replace(',', '.');
		return (
			// eliminate the strings that the RegExp can't handle
			number !== '' && number !== '.' && number !== '-.' && number !== '-' &&

			// valid base
			2 <= abs && abs <= 36 &&
			parseInt(fromBase, 10) + '' === fromBase &&

			// get the validator RegExp
			(reValidNumber[fromBase] || getValidator(fromBase))
				// and test the number on that RegExp
				.test(number)
		);
	}

	function validTo(toBase, number) {
		var abs = Math.abs(toBase);
		return (
			number instanceof converter.Big &&

			// for negative bases, require integer values, and within range (since we cannot round)
			(
				toBase > 0 || isInt(number)
			) &&

			// valid base
			2 <= abs && abs <= 36 &&
			parseInt(toBase, 10) + '' === toBase
		);
	}

	function validFromBig(fromBase, number) {
		var abs = Math.abs(fromBase);
		number = number.replace(/ /g, '').replace(',', '.');
		if (
			// eliminate the strings that the RegExp can't handle
			number !== '' && number !== '.' && number !== '-.' && number !== '-' &&

			// valid base
			36 < abs &&
			parseInt(fromBase, 10) + '' === fromBase &&

			reValidNumberBig.test(number)
		) {
			number = number.split(/[\-\.\:]/);
			for (var i = number.length - 1; i >= 0; i--) {
				if (number[i] >= abs) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	function validToBig(toBase, number) {
		var abs = Math.abs(toBase);
		return (
			number instanceof converter.Big &&

			// for negative bases, require integer values, and within range (since we cannot round)
			(
				toBase > 0 || isInt(number)
			) &&

			// valid base
			36 < abs &&
			parseInt(toBase, 10) + '' === toBase
		);
	}



	return [
		// Bases 2..36, and -2..-36.
		{
			from: function (fromBase, number) {
				if (typeof number !== 'string') {
					number += '';
				}

				if (!validFrom(fromBase, number)) {
					return;
				}

				fromBase = +fromBase;

				number = number
					.replace(/ /g, '')
					.replace(',', '.')
					.toUpperCase()
					.split('.');
				var i, fractResult,
					positive = (number[0].charAt(0) !== '-'),
					result = converter.Big(0),
					integ = (positive ? // skip first character or not?
						number[0] :
						number[0].substr(1)),
					fract = number[1];

				// allow binary and hexadecimal prefixes
				if (
					(fromBase === 2 && /^0b/i.test(integ)) ||
					(fromBase === 16 && /^0x/i.test(integ))
					) {
					integ = integ.substr(2);
				}

				// find the integer part of the result
				for (i = 0; i < integ.length; i++) {
					result = result.mul(fromBase).add(dictionary.indexOf(integ.charAt(i)));
				}

				// find the fractional part of the result
				if (fract) {
					fractResult = converter.Big(0);
					for (i = 0; i < fract.length; i++) {
						fractResult = fractResult.mul(fromBase).add(dictionary.indexOf(fract.charAt(i)));
					}
					fractResult = fractResult.div(converter.Big(fromBase).pow(fract.length));
					result = result.add(fractResult);
				}

				return (positive ?
					result :
					result.mul(-1));
			},


			to: function (toBase, number) {
				if (!validTo(toBase, number)) {
					return;
				}

				var i, length,
					result = toGeneric(+toBase, number),
					digits = result.digits,
					pt = result.pt;
				for (i = 0, length = digits.length; i < length; i++) {
					digits[i] = dictionaryArr[digits[i]];
				}
				var intPart = (pt ? digits.slice(0, pt) : digits).join(''),
					fractPart = pt ? digits.slice(pt).join('') : '';

				var absBase = Math.abs(toBase);
				if (spacing[absBase]) {
					intPart = Base.addSpaces(intPart, spacing[absBase]);
					if (fractPart && spacingFraction[absBase]) {
						fractPart = Base.addSpaces(fractPart, spacingFraction[absBase], true);
					}
				}

				return (
					(result.neg ? '-' : '') +
					intPart +
					(pt ? '.' + fractPart : '')
				);
			},

			getName: getName,

			suggest: function (baseText, reBaseText) {
				var i, j, tmp;
				var matches = {
					match: [],
					proposed: []
				};
				var all = {};
				var numberMatch = /(\-?\d+)(i?)/i.exec(baseText);

				if (numberMatch) {
					var number = numberMatch[1];
					if (number < -1 || 1 < number) {
						if (numberMatch[2] === 'i') {
							// E.g. "2i" isn't an exact match.
							matches.proposed.push([number, getName(number)]);
						} else {
							matches.match.push([number, getName(number)]);
						}
						matches.proposed.push([-number + '', getName(-number + '')]);
						all[number] = all[-number] = true;
					}
					for (i in baseSuggestions) {
						tmp = baseSuggestions[i];
						for (j = 0; j < tmp.length; j++) {
							if (tmp[j].indexOf(number) !== -1 && !all[tmp[j]]) {
								if (!matches[i]) {
									matches[i] = [];
								}
								matches[i].push([tmp[j], getName(tmp[j])]);
								all[tmp[j]] = true;
							}
						}
					}
				}

				for (i in baseNames) {
					tmp = getName(i);
					if (!all[i] && reBaseText.test(tmp)) {
						matches.proposed.push([i, tmp]);
						all[i] = true;
					}
				}

				return matches;
			},
		},


		// Bases 37..X and -37..-X.
		{
			// parameters number and base
			from: function (fromBase, number) {
				if (!validFromBig(fromBase, number)) {
					return;
				}

				fromBase = +fromBase;
				number = number.split(/[.,]/);

				var i, fractResult,
					positive = (number[0].charAt(0) !== '-'),
					result = converter.Big(0),
					integ = (positive ? // skip first character or not?
						number[0] :
						number[0].substr(1)),
					fract = (number[1] ? number[1].split(':') : false);
				integ = (integ ? integ.split(':') : []);

				// find the integer part of the result
				for (i = 0; i < integ.length; i++) {
					result = result.mul(fromBase).add(+integ[i]);
				}
				// find the fractional part of the result
				if (fract) {
					fractResult = converter.Big(0);
					for (i = 0; i < fract.length; i++) {
						fractResult = fractResult.mul(fromBase).add(+fract[i]);
					}
					fractResult = fractResult.div(converter.Big(fromBase).pow(fract.length));
					result = result.add(fractResult);
				}

				return (positive ?
					result :
					result.mul(-1));
			},


			to: function (toBase, number) {
				if (!validToBig(toBase, number)) {
					return;
				}

				var result = toGeneric(+toBase, number),
					digits = result.digits,
					pt = result.pt;
				return (
					(result.neg ? '-' : '') +
					(pt ?
						// a decimal point
						digits.slice(0, pt).join(' : ') + ' . ' + digits.slice(pt).join(' : ') :
						// no decimal point - just join
						digits.join(' : '))
				);
			},
		}
	];
}
function extRoman() {
	'use strict';

	var converter = this;
	var optionUppercase = true;
	var optionStrict = true;


	var undefined;
	var messageBadOrder = "Found unexpected sorting order: '$1' followed by '$2' (using strict sorting order).";
	var messageBadOrderNonstrict = "Found unexpected sorting order: '$1' followed by '$2' (using non-strict sorting order)";
	var messageBadRepetition = "Found unexpected repetition: '$1' $2 times in a row";

	var strictConversions = {
		M: 1000, CM: 900, D: 500, CD: 400,
		C: 100, XC: 90, L: 50, XL: 40,
		X: 10, IX: 9, V: 5, IV: 4, I: 1,
	};
	var repetitionAllowed = {
		M: 3, C: 4, X: 4, I: 4,
	};
	var classes = {
		M: 6,
		D: 5, C: 5,
		CM: 4, CD: 4,
		LM: 3, LD: 3, L: 3, X: 3,
		XM: 2, XD: 2, XC: 2, XL: 2,
		VM: 1, VD: 1, VC: 1, VL: 1, V: 1, I: 1,
		IM: 0, ID: 0, IC: 0, IL: 0, IX: 0, IV: 0,
	};
	var classes2 = {
		D: 3, CD: 3,
		L: 2, XL: 2,
		V: 1, IV: 1,
	};
	var nonstrictConversions = {
		M: 1000, IM: 999, VM: 995, XM: 990, LM: 950, CM: 900,
		D: 500, ID: 499, VD: 495, XD: 490, LD: 450, CD: 400,
		C: 100, IC: 99, VC: 95, XC: 90,
		L: 50, IL: 49, VL: 45, XL: 40,
		X: 10, IX: 9, V: 5, IV: 4, I: 1,
	};


	function isValidTo(toBase, number) {
		return (
			toBase === 'roman'
			&& number instanceof converter.Big
			&& number.gt(0)
			&& number.lt(4000)
			&& number.eq(number.floor()) // Is integer.
		);
	}

	function log(message, $1, $2) {
		console.log(
			'[Base:roman]',
			message
				.replace('$1', $1)
				.replace('$2', $2)
		);
	}

	return {
		/*
			always accept
				IIII = 4
			never accept
				IIIII = 5
				IXIX = 18
				IXIV = 13
		*/
		from: function (fromBase, number) {
			if (fromBase !== 'roman' || !/^[IVXLCDM]+$/i.test(number)) {
				return;
			}

			// inspiration taken from Netzreport (http://netzreport.googlepages.com/index_en.html)
			number = number.toUpperCase();
			var
				result = 0, // we know that it's sufficient to use JavaScript's own numbers
				conv = optionStrict ? strictConversions : nonstrictConversions,
				token,
				next,
				value,
				klass,
				class2,
				lastToken,
				lastValue = 10000, // something greater than M = 1000
				lastClass = 7, // something greater than the greatest class, M: 6
				lastClass2 = 4, // something greater than the greatest class, D: 3
				repetitionCount;

			// tokenize
			for (var i = 0; i < number.length; i++) {
				token = number.charAt(i);
				next = number.charAt(i+1);
				// lookahead one character to find this token's value
				if (i+1 < number.length && conv[token+next]) { // there's another character to look at
					// yep, this is a token: let's add the next character to i
					token += next;

					// and skip the next character since it's part of *this* token
					i++;
				}
				value = conv[token];
				klass = classes[token];
				class2 = classes2[token];
				if (lastValue === value) {
					repetitionCount++;
				} else {
					repetitionCount = 1;
				}

				if (lastValue < value || lastClass < klass) {
					return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
						lastToken,
						token);
				} else if (lastClass === klass) {
					if (!repetitionAllowed[token]) {
						return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
							lastToken,
							token);
					} else if (lastValue === value && repetitionCount > repetitionAllowed[token]) {
						// We accept repetition 4 times (as in IIII instead of IV), but not 5.
						return log(messageBadRepetition, token, repetitionCount);
					}
				} else if (class2 !== undefined && lastClass2 === class2) {
					return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
						lastToken,
						token);
				}
				result += value;
				lastValue = value;
				lastClass = klass;
				lastClass2 = class2;
			}
			return converter.Big(result);
		},

		// toBase will always be 'roman'
		to: function (toBase, number) {
			if (!isValidTo(toBase, number)) {
				return;
			}

			// the primitive value will always be sufficient for roman numerals
			number = +number.valueOf();
			var i, result = '';
			for (i in strictConversions) {
				while (number >= strictConversions[i]) {
					number -= strictConversions[i];
					result += i;
				}
			}
			return (optionUppercase ?
				result :
				result.toLowerCase());
		},

		getName: function (base) {
			if (base === 'roman') {
				return 'roman numerals';
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/^rom/i.test(baseText)) {
				// Close enough match.
				return { match: [['roman', 'roman numerals']] };
			} else if (reBaseText.test('roman numerals')) {
				return { proposed: [['roman', 'roman numerals']] };
			} else {
				return {};
			}
		},
	};
}
function extLeet() {
	'use strict';

	var converter = this;

	return {
		// Normally takes parameters base and number (it'll always be 10/100 and 'leet'/'le:et' respectively).
		from: function (fromBase, number) {
			number = number.toLowerCase();
			if ((fromBase === '10' && number === 'leet') || (fromBase === '100' && number.replace(/ /g, '') === 'le:et')) {
				return converter.Big(1337);
			}
		},

		// Normally takes parameters base and number (it'll always be 10/100 and 1337 respectively).
		to: function (toBase, number) {
			if (number instanceof converter.Big && number.eq(1337)) {
				if (toBase === '10') {
					return 'leet';
				} else if (toBase === '100') {
					return 'le : et';
				}
			}
		},
	};
}
function extTwosComplement() {
	'use strict';

	var converter = this;

	return {
		from: function (fromBase, number) {
			if (fromBase !== '2-compl') {
				return;
			}

			number = number
				.replace(/ /g, '')
				.replace(',', '.')
				// Multiples of the same digit in the beginning of the number don't change anything.
				.replace(/^(.)\1+/, '$1');

			if (!number) {
				return;
			}

			var sign = number[0];
			var asBinary = converter.from('2', number);
			if (sign === '0' || !asBinary) {
				return asBinary;
			} else {
				var integerLength = number.indexOf('.');
				if (integerLength === -1) {
					integerLength = number.length;
				}

				return converter.Big(2).pow(integerLength).mul(-1).add(asBinary);
			}
		},

		to: function (toBase, number) {
			if (toBase !== '2-compl') {
				return;
			}

			var sign;
			if (number.gte(0)) {
				number = converter.to('2', number).replace(/ /g, '');
				sign = '0';
			} else {
				var decimalPlaces = 0;
				for (var i = 0; i < converter.FRACTION_PRECISION && !number.mod(1).eq(0); i++) {
					number = number.mul(2);
					decimalPlaces++;
				}
				number = number.round();

				var minimumDigits = converter.to('2', number).replace(/[ \.\-]/g, '').length;

				number = converter.to('2',
					converter.Big(2).pow(minimumDigits).add(number)
				).replace(/ /g, '');

				while (number.length < minimumDigits) {
					number = '0' + number;
				}

				while (number.length < decimalPlaces) {
					number = '1' + number;
				}

				if (decimalPlaces) {
					number =
						number.substr(0, number.length - decimalPlaces) +
						'.' +
						number.substr(number.length - decimalPlaces);
				}

				sign = '1';
			}

			var parts = number.split(/[.,]/);
			var integer = parts[0];
			var fraction = parts[1];

			// Add at least two digits indicating sign / for padding.
			integer = sign + sign + integer;
			fraction = fraction && fraction + '00';

			// The result should be a number of digits, divisible by 4.
			while (integer.length % 4 !== 0) {
				integer = sign + integer;
			}
			while (fraction && fraction.length % 4 !== 0) {
				fraction += '0';
			}

			integer = integer.replace(/[01]{4}(?=[01])/g, '$& ');
			fraction = fraction && fraction.replace(/[01]{4}(?=[01])/g, '$& ');

			return integer + (fraction ? '.' + fraction : '');
		},

		getName: function (base) {
			if (base === '2-compl') {
				return "two's complement";
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/two|2/i.test(baseText) && /compl/i.test(baseText)) {
				// Close enough match.
				return { match: [['2-compl', "two's complement"]] };
			} else {
				var twos = /(2|two)'?s?/.exec(baseText);
				twos = twos ? twos[0] : "two's";
				if ((twos + ' complement').indexOf(baseText) !== -1) {
					return { proposed: [['2-compl', "two's complement"]] };
				} else {
					return {};
				}
			}
		},
	};
}
function extImaginary() {
	'use strict';

	var converter = this;
	var Base = converter.constructor;

	return {
		// Only convert directly between base 10 and base 2i.
		convert: function (fromBase, toBase, number) {
			if (fromBase === '2i' && toBase === '10') {
				return quatImagToDec(number);
			} else if (fromBase === '10' && toBase === '2i') {
				return decToQuatImag(number);
			} else {
				return;
			}
		},

		from: function (fromBase, number) {
			if (fromBase === '2i') {
				var dec = quatImagToDec(number);
				if (dec && dec.indexOf('i') === -1) {
					return converter.Big(dec.replace(/ /g, ''));
				}
			}
		},

		to: function (toBase, number) {
			if (toBase === '2i') {
				return decToQuatImag(number + '');
			}
		},

		valid: function (base, number) {
			if (base === '10' && number) {
				// Make sure that e.g. 4i is a valid number in base 10.
				return decToQuatImag(number) !== undefined;
			}
		},

		getName: function (base) {
			if (base === '2i') {
				return 'quater-imaginary (base 2i)';
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/\b2i/i.test(baseText) || (/quat/i.test(baseText) && /imag/i.test(baseText))) {
				// Close enough match.
				return { match: [['2i', 'quater-imaginary (base 2i)']] };
			} else if ('2i quater-imaginary'.indexOf(baseText) !== -1) {
				// Partly a match (or no text entered).
				return { proposed: [['2i', 'quater-imaginary (base 2i)']] };
			} else {
				return {};
			}
		},
	};

	function rev(str) {
		return str.split('').reverse().join('');
	}


	function decToQuatImag(num) {
		num	= num.replace(/ /g, '');
		var imag, real;
		var match = num.match(/^(\-?[0-9.]+)([\+\-][0-9.]*)i$/);
		if (match) {
			real = match[1];
			imag = match[2];
			if (imag.length === 1) {
				imag += '1';
			}
			if (imag[0] === '+') {
				imag = imag.substr(1);
			}
		} else {
			match = num.match(/^(\-?[0-9.]*)(i?)$/);
			if (!match) {
				return;
			} else if (match[2] === 'i') {
				real = '0';
				if (match[1] === '' || match[1] === '-') {
					imag = match[1] + '1';
				} else {
					imag = match[1];
				}
			} else {
				real = match[1];
				imag = '0';
			}
		}

		var imag_quat = converter.to('-4', converter.Big(imag).div(2));
		var real_quat = converter.convert('10', '-4', real);

		if (!imag_quat || !real_quat) {
			return;
		}

		imag_quat = imag_quat.replace(/ /g, '').split('.');
		real_quat = real_quat.replace(/ /g, '').split('.');

		var imag_quat_integ = imag_quat[0];
		var real_quat_integ = real_quat[0];
		var imag_quat_fract = imag_quat[1] || '0';
		var real_quat_fract = real_quat[1] || '0';

		var integ = '';
		for (var i = Math.max(imag_quat_integ.length, real_quat_integ.length) - 1; i >= 0; i--) {
			integ += imag_quat_integ[imag_quat_integ.length-1 - i] || '0';
			integ += real_quat_integ[real_quat_integ.length-1 - i] || '0';
		}
		integ = integ.replace(/^0(.)/, '$1');

		var fract = '';
		for (var i = 0; i < Math.max(imag_quat_fract.length, real_quat_fract.length); i++) {
			fract += imag_quat_fract[i] || '0';
			fract += real_quat_fract[i] || '0';
		}
		fract = fract.replace(/(.)0$/, '$1');

		integ = Base.addSpaces(integ, 4);
		fract = Base.addSpaces(fract, 4, true);

		if (fract === '0') {
			return integ;
		} else {
			return integ + '.' + fract;
		}
	}


	function quatImagToDec(num) {
		num	= num.replace(/ /g, '');
		if (!num) {
			return;
		}

		num = num.split('.');
		var integ = num[0] || '0';
		var integ_rev = rev(integ);

		var imag_integ_rev = integ_rev.replace(/[0-3]([0-3])?/g, '$1');
		var real_integ_rev = integ_rev.replace(/([0-3])[0-3]?/g, '$1');

		var imag_integ = rev(imag_integ_rev);
		var real_integ = rev(real_integ_rev);

		var fract = num[1];
		if (fract) {
			var imag_fract = '.' + fract.replace(/([0-3])[0-3]?/g, '$1');
			var real_fract = '.' + fract.replace(/[0-3]([0-3])?/g, '$1');
		}

		var imag_half = converter.from('-4', (imag_integ || '0') + (imag_fract || ''));
		var real = converter.convert('-4', '10', (real_integ || '0') + (real_fract || ''));

		if (!imag_half || !real) {
			return;
		}

		var imag = converter.to('10', imag_half.mul(2));

		if (imag === '0') {
			return real;
		} else if (real === '0') {
			return imag + 'i';
		} else if (imag[0] !== '-') {
			return real + ' + ' + imag + 'i';
		} else {
			return real + ' - ' + imag.substr(1) + 'i';
		}
	}
}
function extIeee754() {
	'use strict';

	var converter = this;

	function normalize(number) {
		return number
			.replace(/ /g, '')
			.replace(',', '.')
			.replace(/nan/i, 'NaN')
			.replace(/∞|infinity/i, 'Infinity');
	}

	function parseToView(digitsPerByte, fromBase, number) {
		if (/^0[bx]/i.test(number)) {
			number = number.substr(2);
		}

		var arr = new Uint8Array(number.length / digitsPerByte);

		for (var i = 0; i < arr.length; i++) {
			arr[i] = parseInt(
				number.substr(i * digitsPerByte, digitsPerByte),
				fromBase
			);
		}

		return new DataView(arr.buffer);
	}

	function numberToArr32(number) {
		var arr = new Uint8Array(4);
		var view = new DataView(arr.buffer);
		view.setFloat32(0, +number);
		return arr;
	}

	function numberToArr64(number) {
		var arr = new Uint8Array(8);
		var view = new DataView(arr.buffer);
		view.setFloat64(0, +number);
		return arr;
	}

	function arrToBase(toBase, arr) {
		var result = '';
		for (var i = 0; i < arr.length; i++) {
			result += (256 + arr[i]).toString(toBase).substr(1).toUpperCase();
		}

		return result;
	}

	function getExactDec(number) {
		return (
			number === 0 && 1/number < 0
				? '-0'
				: new converter.Big(
					number.toString(16),
					16
				).toString(10)
		);
	}

	function valid(base, number) {
		if (number === undefined) {
			return base === 'dec' || /^(dec|bin|hex)(32|64)$/.test(base);
		}

		number = normalize(number);

		if (number) {
			if (base === 'dec') {
				return number === 'NaN' || !isNaN(+number);
			} else if (base === 'bin32') {
				return /^(0b)?[01]{32}$/i.test(number);
			} else if (base === 'bin64') {
				return /^(0b)?[01]{64}$/i.test(number);
			} else if (base === 'hex32') {
				return /^(0x)?[0-9a-f]{8}$/i.test(number);
			} else if (base === 'hex64') {
				return /^(0x)?[0-9a-f]{16}$/i.test(number);
			}
		}

		return false;
	}

	return {
		from: function (fromBase, number) {
			number = normalize(number);

			if (!valid(fromBase, number)) {
				return;
			}

			if (fromBase === 'dec') {
				return +number;
			} else if (fromBase === 'bin32') {
				return parseToView(8, 2, number).getFloat32(0);
			} else if (fromBase === 'bin64') {
				return parseToView(8, 2, number).getFloat64(0);
			} else if (fromBase === 'hex32') {
				return parseToView(2, 16, number).getFloat32(0);
			} else if (fromBase === 'hex64') {
				return parseToView(2, 16, number).getFloat64(0);
			}
		},

		to: function (toBase, number) {
			if (toBase === 'dec') {
				return '' + number;
			} else {
				number = +number;

				if (toBase === 'dec32') {
					return getExactDec(new DataView(numberToArr32(number).buffer).getFloat32(0));
				} else if (toBase === 'dec64') {
					return getExactDec(number);
				} else if (toBase === 'bin32') {
					return arrToBase(2, numberToArr32(number)).replace(/^(.)(.{8})(.+)$/, '$1 $2 $3');
				} else if (toBase === 'bin64') {
					return arrToBase(2, numberToArr64(number)).replace(/^(.)(.{11})(.+)$/, '$1 $2 $3');
				} else if (toBase === 'hex32') {
					return arrToBase(16, numberToArr32(number));
				} else if (toBase === 'hex64') {
					return arrToBase(16, numberToArr64(number));
				}
			}
		},

		valid: valid,
	};
}
