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
    constructor (forum) {
        this.formatter = forum.Format;
        this.multiline = forum.supports('Formatting.Multiline');
        this.spoiler = forum.supports('Formatting.Spoilers');
    }
    
    formatRoll(dice, rolls, result, mode) {
        //This is a single roll
        rolls = rolls.join(' ');
        if (mode == MODE.WW) {
    		rolls = rolls.map((roll) => roll.replace(/([89]|10)/g, '**$1**'));
    	}
    
    	if (mode == MODE.SCION) {
    		rolls = rolls.map((roll) => roll.replace(/([789]|10)/g, '**$1**'));
    	}
    	
       return `${dice}: ${rolls} = ${result}`;
    }
    
    formatMultiRoll(line) {
        //This is one of many rolls using the recursion operator 'x'
        //The input is the result of the above formatRoll
        if (this.multiline) {
            return `${line}\n\n---\n`;
        } else {
            return `«${line}» `;
        }
    }
    
    formatOutput(result) {
        //This is the total output for a single set of rolls
        if (this.multiline) {
            if (this.spoiler) {
                //This is badly named, we're really looking for a summary-details widget
                return this.formatter.spoiler(`${this.formatter.bold("Your rolls")}: \n${result.rolls.join('\n')}\nTotal: ${this.formatter.bold(result.result)}`, //details
                    `You rolled ${result.input}: ${result.result}`); //summary
            }
            
            return `You rolled ${result.input}\n\n${result.rolls.join('\n')}\n\nTotal: ${this.formatter.bold(result.result)}`;
        }
        
        return `You rolled: ${result.input} || ${result.rolls.join(' | ')} || Total: ${this.formatter.bold(result.result)}`;
    }
    
    formatGrandTotal(total) {
        //This is the final output for a recursion operator rll
        return `${this.formatter.bold('Grand Total')} : ${total}`;
    }
}

module.exports = View;