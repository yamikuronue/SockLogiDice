'use strict'

class View {
    constructor (forum) {
        this.formatter = forum.Format;
        this.multiline = forum.supports('Formatting.Multiline');
        this.spoiler = forum.supports('Formatting.Spoiler');
    }
    
    formatRoll(dice, rolls, result) {
        if (this.multiline) {
            return `${dice}: ${rolls} = ${result}\n`;
        } else {
            return `${dice}: ${rolls} = ${result} | `;
        }
    }
    
    formatOutput(output, input, total) {
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
}

module.exports = View;