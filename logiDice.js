"use strict";

module.exports = {
	mode: {
		SUM: 0,
		FATE: 1,
		WW: 2,
		SCION: 3
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