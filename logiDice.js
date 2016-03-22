"use strict";

module.exports = {
	mode: {
		SUM: 0,
		FATE: 1,
		WW: 2,
		SCION: 3
	},

	roll: (dice, mode) => {
		return new Promise((resolve, reject) => {
			let parts = dice.split(/d/, 2);
			let left = parts[0];
			let right = parts[1];

			if (left > 100) {
				left = 100;
			}

			if (right > 1000) {
				right = 1000;
			}

			let rolls = [];

			let sumDice = (tally, current) => {
				return tally + current;
			}

			 for(let i = 0; i < left; i++) {
			 	rolls.push(Math.random() * right);
			 }

			let retVal = {
				result: rolls.reduce(sumDice),
				rolls: rolls
			}

			resolve(retVal);
		});
	}
}