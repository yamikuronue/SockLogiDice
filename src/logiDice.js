"use strict";

const Mathjs = require('mathjs');
const View = require('./view');

module.exports = {
	/**
	 * An enumeration of valid modes
	 * @type {Object}
	 */
	mode: {
		SUM: 0,
		FATE: 1,
		WW: 2,
		SCION: 3
	},

	/**
	 * A result object
	 * @typedef {Object} Result
	 * @property {Numeric} result The total, typically the sum of all dice rolled.
	 *			The exact semantics depend on the dice mode.
	 * @property {Array} rolls Strings describing what dice were rolled
	 * @property {Array} subQueries If the recursion operator was used, this will
	 *			contain the subqueries that added up to the total
	 * @property {String} input The raw input requested
	 */


	/**
	 * Parse the input to figure out what dice to roll, then roll them
	 * @param  {String} input The input to parse
	 * @param  {Number} mode  What mode to roll in. Valid values are defined in the mode enum.
	 * @return {Result}       The result of the rolling
	 */
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
			input: new String(input),
			result: 0,
			rolls: [],
			subQueries: false
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
				}, {
					rolls: [],
					result: 0
				});

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
			if (input.indexOf('dF') > -1) {
				mode = module.exports.mode.FATE;
				input = input.replace(/[Ff]/g, '6');
			}
			const diceItems = input.match(/\d+d\d+/g);

			let dicePromises = diceItems.map((current) => { return module.exports.roll(current, mode)});

			return Promise.all(dicePromises).then((rolls) => {
				let diceResult = rolls.reduce((tally, current, index) => {
					input = input.replace(diceItems[index], current.result);
					current.rolls = [module.exports.view.formatRoll(diceItems[index], current.rolls, current.result, mode)];
					return mergeResults(tally, current);
				}, false);

				/*Do math with order of operations*/
				result.result = Mathjs.eval(input);
				result.rolls = diceResult.rolls;

				return result;
			});
		}
	},

	/**
	 * Just roll some dice
	 * @param  {String} dice The dice string, like 1d20 or 4d6
	 * @param  {Number} mode The mode, as defined in the mode enum
	 * @return {Object}       The result of the roll. Two parameters:
	 *					Result is the total, and Rolls is the raw dice
	 */
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

			const summation = function() {
				switch(mode) {
					case modeEnum.FATE:
						return fateDice;
					case modeEnum.WW:
						return wwDice;
					case modeEnum.SCION:
						return scionDice;
					default:
						return sumDice;
				}
			}();

			const fatify = (current) => {
				if (current < 3) {
					return '[-]';
				}

				if (current > 4) {
					return '[+]';
				}

				return '[ ]'
			}

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
				rolls: (mode == modeEnum.FATE ? rolls.map(fatify) : rolls)
			}

			resolve(retVal);
		});
	},


	/**
	 * Handler for the !roll command
	 * @param  {Command} command The command that invoked this handler
	 * @return {Promise}         A promise that resolves when processing is done
	 */
	onRoll: (command) => {
		const diceString = command.args[0];
		return module.exports.parse(diceString, module.exports.mode.SUM).then((result) => {
			return command.reply(
				module.exports.view.formatOutput(result)
			);
		});
	},

	/**
	 * Handler for the !rollFate command
	 * @param  {Command} command The command that invoked this handler
	 * @return {Promise}         A promise that resolves when processing is done
	 */
	onFate: (command) => {
		const diceString = command.args[0];
		return module.exports.parse(diceString, module.exports.mode.FATE).then((result) => {
			return command.reply(
				module.exports.view.formatOutput(result)
			);
		});
	},

	/**
	 * Handler for the !rollWW command
	 * @param  {Command} command The command that invoked this handler
	 * @return {Promise}         A promise that resolves when processing is done
	 */
	onWW: (command) => {
		const diceString = command.args[0];
		return module.exports.parse(diceString, module.exports.mode.WW).then((result) => {
			return command.reply(
				module.exports.view.formatOutput(result)
			);
		});
	},

	/**
	 * Handler for the !rollScion command
	 * @param  {Command} command The command that invoked this handler
	 * @return {Promise}         A promise that resolves when processing is done
	 */
	onScion: (command) => {
		const diceString = command.args[0];
		return module.exports.parse(diceString, module.exports.mode.SCION).then((result) => {
			return command.reply(
				module.exports.view.formatOutput(result)
			);
		});
	},

	plugin: function(forum) {

		/**
	     * Activate the plugin.
	     *
	     * Register the commands to the forum instance this plugin is bound to
	     *
	     * @returns {Promise} Resolves when plugin is fully activated     *
	     */
	    function activate() {
	    	module.exports.view = new View(forum);
	        return forum.Commands.add('roll', 'Roll some dice', module.exports.onRoll)
	        		.then(() => forum.Commands.add('rollww', 'Roll dice for White Wolf games', module.exports.onWW))
	        		.then(() => forum.Commands.add('rollscion', 'Roll dice for Scion', module.exports.onScion))
	        		.then(() => forum.Commands.add('rollfate', 'Roll dice for Fate', module.exports.onFate))
	    }

	    return {
	        activate: activate,
	        deactivate: () => {}
	    };
	}
}
