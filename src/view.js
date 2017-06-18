'use strict'

const logiDice = require('./logiDice.js');

/**
 * An enumeration of valid modes
 * @type {Object}
 */
const MODE = {
	SUM: 0,
	FATE: 1,
	WW: 2,
	SCION: 3
};

class View {
    constructor (forum, config) {
        this.formatter = forum.Format;
        this.multiline = forum.supports('Formatting.Multiline');
        this.spoiler = forum.supports('Formatting.Spoilers') && config.spoilers;
    }
    
    formatRoll(dice, rolls, result, mode) {
        //This is a single roll

        if (mode == MODE.WW) {
    		rolls = rolls.map((roll) => roll.toString().replace(/([89]|10)/g, '**$1**'));
    	}
    
    	if (mode == MODE.SCION) {
    		rolls = rolls.map((roll) => roll.toString().replace(/([789]|10)/g, '**$1**'));
    	}
    	
        rolls = rolls.join(' ');
        return `${dice}: ${rolls} = ${result}`;
    }
    
    formatMultiRoll(input, rolls, rollJoiner) {
        //This is one of many rolls using the recursion operator 'x'
        //The input is an array of rolls formatted with formatRoll
        
        if (this.multiline) {
            const lines = rolls.map((roll) => `- ${roll}`);
            return `${this.formatter.bold(input)}:\n${lines.join('\n')}\n`;
        } else {
            return `«${rolls.join(rollJoiner)}»`;
        }
    }
    
    formatOutput(result) {
        //This is the total output for a single set of rolls
        
        const rollJoiner = this.multiline ? '\n' : ' | ';
        let rolls = result.rolls.join(rollJoiner);

        
        if (result.subQueries) {
            rolls = result.subQueries.map((query) => {
                return this.formatMultiRoll(query.input, query.rolls, rollJoiner);
            });
            
            rolls = rolls.join(rollJoiner);
        }
        
        if (this.multiline) {
            if (this.spoiler) {
                //This is badly named, we're really looking for a summary-details widget
                return this.formatter.spoiler(`${this.formatter.bold("Your rolls")}: \n${rolls}\nTotal: ${this.formatter.bold(result.result)}`, //details
                    `You rolled ${result.input}: ${result.result}`); //summary
            }
            
            return `You rolled ${result.input}\n\n${rolls}\nTotal: ${this.formatter.bold(result.result)}`;
        }
        
        return `You rolled: ${result.input} || ${rolls} || Total: ${this.formatter.bold(result.result)}`;
    }
}

module.exports = View;