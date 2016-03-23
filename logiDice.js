"use strict";

const Mathjs = require('mathjs');

module.exports = {
	mode: {
		SUM: 0,
		FATE: 1,
		WW: 2,
		SCION: 3
	},

	parse: (input, mode) => {
		function mergeResults(res1, res2) {
			if (!res1) {
				return res2
			}

			const retval = {
				result: res1.result + res2.result,
				rolls: res1.rolls.concat(res2.rolls)
			}

			return retval;
		}

		let result = {
			result: 0,
			rolls: []
		};

		//Sanity check
		if(!input.match(/[-+*/dX]/gi)) {
			return Promise.resolve(result);
		}

		/*Recursion operator*/
		if (input.toUpperCase().indexOf('X') > -1) {
			const parts = input.split(/x/g,2);
			const left = parts[0];
			const right = parts[1];
			let recPromises = [];

			for (let i = 0; i < left; i++) {
				recPromises.push(module.exports.parse(right));
			}

			return Promise.all(recPromises).then((subQueries) => {
				let diceResult = subQueries.reduce((tally, current, index) => {
					return mergeResults(tally, current);
				}, false);

				/*Do math with order of operations*/
				result.result = diceResult.result;
				result.rolls = diceResult.rolls;
				result.subQueries = subQueries;

				return result;
			});
		} else {
			/*
				Roll dice
			 */

			 //Upgrade to Fate
			if (input.toUpperCase().indexOf('F') > -1) {
				mode = module.exports.mode.FATE;
				input = input.replace(/[Ff]/g, '6');
			}
			const diceItems = input.match(/\d+d\d+/g);

			let dicePromises = diceItems.map((current) => { return module.exports.roll(current, mode)});

			return Promise.all(dicePromises).then((rolls) => {
				let diceResult = rolls.reduce((tally, current, index) => {
					input = input.replace(diceItems[index], current.result);
					return mergeResults(tally, current);
				}, false);

				/*Do math with order of operations*/
				result.result = Mathjs.eval(input);
				result.rolls = diceResult.rolls;

				return result;
			});
		}
	},

	roll: (dice, mode) => {
		/*Rolling function*/
		const rollDie = (sides) => {
			return Math.ceil(Math.random() * sides);
		}

		/*Dice summation functions*/
		const sumDice = (tally, current) => {
			return tally + current;
		}

		const fateDice = (tally, current) => {
			if (current < 3) {
				return tally-1;
			}

			if (current > 4) {
				return tally+1;
			}

			return tally;
		}

		const wwDice = (tally, current) => {
			if (current > 7) {
				return tally+1;
			} else {
				return tally;
			}
		}

		const scionDice = (tally, current) => {
			if (current == 10) {
				return tally + 2;
			} else if (current > 6) {
				return tally + 1;
			} else {
				return tally;
			}
		}

		return new Promise((resolve, reject) => {
			const modeEnum = module.exports.mode;
			let parts = dice.split(/d/, 2);
			let left = parts[0];
			let right = parts[1];

			//sanity checks
			if (left > 100) {
				left = 100;
			}

			if (right > 1000) {
				right = 1000;
			}

			const summation = () => {
				switch(mode) {
					case modeEnum.FATE:
						return fateDice;
					case modeEnum.WW:
						return wwDice;
					case modeEnum.SCION:
						return scionDice;
					default:
						return sumDice;
				};
			}();

			let rolls = [];
			for(let i = 0; i < left; i++) {
				let current = rollDie(right);
			 	rolls.push(current);
			 	if (mode == modeEnum.WW && current == 10) {
			 		left++;
			 	}
			}

			let retVal = {
				result: rolls.reduce(summation, 0),
				rolls: rolls
			}

			resolve(retVal);
		});
	}
}
