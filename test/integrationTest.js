'use strict';
const Chai = require('chai');
const expect = Chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
Chai.use(chaiAsPromised);
Chai.use(sinonChai);

const Sinon = require('sinon');
require('sinon-as-promised');

const logiDice = require('../src/logiDice.js');
const View = require('../src/view');

const fakeForum = {
    Commands: {
        add: () => Promise.resolve()
    },
    Format: {
        bold: (input) => `*${input}*`
    },
    supports: (item) => false
}

describe('Logios Dice for SockBot', () => {
	let command, sandbox;

	before(() => {
	    logiDice.plugin(fakeForum, {spoilers: true}).activate();
	});

	beforeEach(() => {
	    sandbox = Sinon.sandbox.create();
	    command = {
	        args: [],
	        reply: sandbox.stub().resolves()
	    };
	});

	afterEach(() => {
	    sandbox.restore();
	});

	describe('Rolling dice', () => {
	    it('rolls 1d20', () => {
	        command.args.push('1d20');
	        sandbox.stub(Math, 'random').returns(8/20);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: 1d20 || 1d20: 8 = 8 || Total: *8*');
	        });
	    });

	    it('rolls 2x1d20+1d4', () => {
	        command.args.push('2x1d20+1d4');
	        sandbox.stub(Math, 'random')
	            .onCall(0).returns(8/20)
	            .onCall(1).returns(2/4)
	            .onCall(2).returns(6/20)
	            .onCall(3).returns(3/4);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: 2x1d20+1d4 || «1d20: 8 = 8 | 1d4: 2 = 2» | «1d20: 6 = 6 | 1d4: 3 = 3» || Total: *19*');
	        });
	    });

	    it('rolls 1dF', () => {
	        command.args.push('1dF');
	        sandbox.stub(Math, 'random').returns(2/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: 1dF || 1d6: [-] = -1 || Total: *-1*');
	        });
	    });

	    it.only('rolls @index&zwnj;d@index', () => {
	        command.args.push('@index&zwnj;d@index');
	        sandbox.stub(Math, 'random').returns(2/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: @index&zwnj;d@index ||  || Total: *0*');
	        });
	    });

	    it('rolls 4dF', () => {
	        command.args.push('4dF');
	        sandbox.stub(Math, 'random')
	            .onCall(0).returns(1/6)
	            .onCall(1).returns(3/6)
	            .onCall(2).returns(5/6)
	            .onCall(3).returns(3/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: 4dF || 4d6: [-] [ ] [+] [ ] = 0 || Total: *0*');
	        });
	    });

	    it('does math', () => {
	        command.args.push('1d6+3');
	        sandbox.stub(Math, 'random').returns(3/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: 1d6+3 || 1d6: 3 = 3 || Total: *6*');
	        });
	    });

        it('does harder math', () => {
	        command.args.push('ceil(1d6/2)');
	        sandbox.stub(Math, 'random').returns(3/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: ceil(1d6/2) || 1d6: 3 = 3 || Total: *2*');
	        });
	    });

	    it('does math with f\'s', () => {
	        command.args.push('floor(1d6/2)');
	        sandbox.stub(Math, 'random').returns(3/6);

	        return logiDice.onRoll(command).then(() => {
	            expect(command.reply).to.have.been.calledOnce;
	            const output = command.reply.firstCall.args[0];
	            expect(output).to.equal('You rolled: floor(1d6/2) || 1d6: 3 = 3 || Total: *1*');
	        });
	    });

	});

});