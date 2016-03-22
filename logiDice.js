"use strict";

module.exports = {
	mode: {
		SUM: 0,
		FATE: 1,
		WW: 2,
		SCION: 3
	},

	roll: (dice, mode) => {

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

			let summation;

			if (mode == module.exports.mode.FATE) {
				summation = fateDice;
			} else {
				summation = sumDice;
			}

			for(let i = 0; i < left; i++) {
			 	rolls.push(Math.random() * right);
			}

			let retVal = {
				result: rolls.reduce(summation, 0),
				rolls: rolls
			}

			resolve(retVal);
		});
	}
}