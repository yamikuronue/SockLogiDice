'use strict'

class View {
    constructor (forum) {
        this.formatter = forum.Format;
        this.multiline = forum.supports('Formatting.Multiline');
        this.spoiler = forum.supports('Formatting.Spoiler');
    }
    
    formatRoll(dice, rolls, result) {
        //This is a single roll
        if (this.multiline) {
            return `${dice}: ${rolls} = ${result}\n`;
        } else {
            return `${dice}: ${rolls} = ${result} | `;
        }
    }
    
    formatMultiRoll(line) {
        //This is one of many rolls using the recursion operator 'x'
        //The input is the result of the above formatRoll
        if (this.multiline) {
            return `${line}\n\n---\n`;
        } else {
            return `«${line}»`;
        }
    }
    
    formatOutput(output, input, total) {
        //This is the total output for a single set of rolls
        if (this.multiline) {
            if (this.spoiler) {
                //This is badly named, we're really looking for a summary-details widget
                return this.formatter.spoiler(`${this.formatter.bold("Your rolls")}: \n ${output} \n Total: ${total}`, //details
                    `You rolled ${input}:`); //summary
            }
            
            return `You rolled ${input}\n\n ${output} \n\n Total: ${this.formatter.bold(total)}`;
        }
        
        return `You rolled: ${input} || ${output}  || Total: ${this.formatter.bold(total)}`;
    }
    
    formatGrandTotal(total) {
        //This is the final output for a recursion operator rll
        return `${this.formatter.bold('Grand Total')}: ${total}`;
    }
}

module.exports = View;