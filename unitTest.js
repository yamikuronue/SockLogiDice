'use strict';
const Chai = require('chai');
const expect = Chai.expect;
const chaiAsPromised = require("chai-as-promised");
Chai.use(chaiAsPromised);
const Sinon = require('sinon');
require('sinon-as-promised');

const logiDice = require('./logiDice.js');

describe('Logios Dice for SockBot', () => {
	let sandbox = Sinon.sandbox.create();

	afterEach(function() {
		sandbox.restore();
	});

	describe('Roll() in summation mode', () => {

		it("should roll one die", () => {
			sandbox.stub(Math, 'random').returns(3/6);
			return expect(logiDice.roll("1d6", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [3],
				result: 3
			});
		});

		it("should roll two die", () => {
			sandbox.stub(Math, 'random').returns(3/6);
			return expect(logiDice.roll("2d6", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [3, 3],
				result: 6
			});
		});

		it("should roll red die", () => {
			sandbox.stub(Math, 'random').returns(13/20);
			return expect(logiDice.roll("1d20", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [13],
				result: 13
			});
		});

		it("should roll blue die", () => {
			sandbox.stub(Math, 'random').returns(1/2);
			return expect(logiDice.roll("1d2", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [1],
				result: 1
			});
		});


		it("should cap at 100 dice", () => {
			sandbox.stub(Math, 'random').returns(1/2);
			return expect(logiDice.roll("400d2", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				result: 100
			});
		});

		it("should cap at d1000", () => {
			sandbox.stub(Math, 'random').returns(200/1000);
			return expect(logiDice.roll("1d4000", logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [200],
				result: 200
			});
		});

		/* Fate die work like this:
			- Roll 1d6
			- 1,2 = -1
			- 3,4 = 0
			- 5, 6 = +1
		*/
	});

	describe('Roll() in fate mode', () => {
		it("should roll 1dF", () => {
			sandbox.stub(Math, 'random').returns(3/6);
			return expect(logiDice.roll("1d6", logiDice.mode.FATE)).to.eventually.deep.equal({
				rolls: ['[ ]'],
				result: 0
			});
		});

		it("should return minus on dF", () => {
			sandbox.stub(Math, 'random').returns(2/6);
			return expect(logiDice.roll("1d6", logiDice.mode.FATE)).to.eventually.deep.equal({
				rolls: ['[-]'],
				result: -1
			});
		});

		it("should return plus on dF", () => {
			sandbox.stub(Math, 'random').returns(5/6);
			return expect(logiDice.roll("1d6", logiDice.mode.FATE)).to.eventually.deep.equal({
				rolls: ['[+]'],
				result: 1
			});
		});
	});
	describe('Roll() in white wolf mode', () => {
		/*
			White Wolf mode rolls a d10,
			and on 8, 9, or 10, it adds one to the 'success' count.
		 */
		it("should return 0 successes for three 6s", () => {
			sandbox.stub(Math, 'random').returns(6/10);
			return expect(logiDice.roll("3d10", logiDice.mode.WW)).to.eventually.deep.equal({
				rolls: [6, 6, 6],
				result: 0
			});
		});

		it("should return 0 successes for three 7s", () => {
			sandbox.stub(Math, 'random').returns(7/10);
			return expect(logiDice.roll("3d10", logiDice.mode.WW)).to.eventually.deep.equal({
				rolls: [7, 7, 7],
				result: 0
			});
		});

		it("should return 3 successes for three 8s", () => {
			sandbox.stub(Math, 'random').returns(8/10);
			return expect(logiDice.roll("3d10", logiDice.mode.WW)).to.eventually.deep.equal({
				rolls: [8, 8, 8],
				result: 3
			});
		});

		/*Added wrinkle: on a 10, white wolf adds another die to roll*/
		it("should return 3 successes for two dice with a 10", () => {
			sandbox.stub(Math, 'random').onFirstCall().returns(9/10).onSecondCall().returns(10/10).onThirdCall().returns(9/10);
			return expect(logiDice.roll("2d10", logiDice.mode.WW)).to.eventually.deep.equal({
				rolls: [9, 10, 9],
				result: 3
			});
		});
	});
	describe('Roll() in scion mode', () => {
		/*
			Scion mode is like White wolf dice, for the most part
			7s count as a success,
			and instead of exploding 10s, they count as 2 successes
		 */
		it("should return 0 successes for three 6s", () => {
			sandbox.stub(Math, 'random').returns(6/10);
			return expect(logiDice.roll("3d10", logiDice.mode.SCION)).to.eventually.deep.equal({
				rolls: [6, 6, 6],
				result: 0
			});
		});

		it("should return 3 successes for three 7s", () => {
			sandbox.stub(Math, 'random').returns(7/10);
			return expect(logiDice.roll("3d10", logiDice.mode.SCION)).to.eventually.deep.equal({
				rolls: [7, 7, 7],
				result: 3
			});
		});

		it("should return 3 successes for three 8s", () => {
			sandbox.stub(Math, 'random').returns(8/10);
			return expect(logiDice.roll("3d10", logiDice.mode.SCION)).to.eventually.deep.equal({
				rolls: [8, 8, 8],
				result: 3
			});
		});

		/*Added wrinkle: on a 10, white wolf adds another die to roll*/
		it("should return 3 successes for two dice with a 10", () => {
			sandbox.stub(Math, 'random').onFirstCall().returns(9/10).onSecondCall().returns(10/10).onThirdCall().returns(9/10);
			return expect(logiDice.roll("2d10", logiDice.mode.SCION)).to.eventually.deep.equal({
				rolls: [9, 10],
				result: 3
			});
		});
	});

	describe('Parse', () => {
		it('should roll dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10", logiDice.mode.SUM).then(() => {
				expect(logiDice.roll.called).to.equal(true);
			})

		});

		it('should add', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10+1", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(5);
			});
		});

		it('should subtract', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10-1", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(3);
			});
		});

		it('should add dice', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10+1d4", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(14);
			});
		});

		it('should subtract dice', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10-1d4", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(10);
			});
		});

		it('should add dice and constants correctly', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10+1d4+2", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(16);
			});
		});

		it('should subtract dice and constants', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10-1d4-1", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(9);
			});
		});

		it('should add and subtract both', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10+1d4-2", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(12);
			});
		});

		it('should multiply', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10*2", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(8);
			});
		});

		it('should divide', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10/2", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(2);
			});
		});

		it('should multiply dice', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10*1d4", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(24);
			});
		});

		it('should divide dice', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10/1d4", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(6);
			});
		});

		it('should apply the repetition operator', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 4,
				rolls: [2,2]
			});

			return logiDice.parse("2x2d10", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(16);
				expect(response.subQueries).to.be.ok;
			});
		});

		it('should apply the repetition operator with sums', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 4,
				rolls: [2,2]
			});

			return logiDice.parse("2x2d10+4", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(response.result).to.equal(24);
				expect(response.subQueries).to.be.ok;
			});
		});

		it('should not roll when there is nothing to be done', () => {
			sandbox.stub(logiDice, 'roll').rejects();

			return logiDice.parse("elephant", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(false);
				expect(response.result).to.equal(0);
			})
		});

		it('should auto-upgrade to Fate mode', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: -2,
				rolls: [1,1]
			})

			return logiDice.parse("2dF", logiDice.mode.SUM).then((response) => {
				expect(logiDice.roll.called).to.equal(true);
				expect(logiDice.roll.calledWith("2d6", logiDice.mode.FATE)).to.equal(true);
			})
		});

		it('should output dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			return logiDice.parse("1d10", logiDice.mode.SUM).then((result) => {
				expect(result.output).to.contain('1d10: 4 = 4');
				expect(result.output).to.contain('**Total**: 4');
			})

		});

		it('should output two dice', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10+1d4", logiDice.mode.SUM).then((result) => {
				expect(result.output).to.contain('2d10: 4 8 = 12');
				expect(result.output).to.contain('1d4: 2 = 2');
				expect(result.output).to.contain('**Total**: 14');
			});

		});

		it('should output dice and constants', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 2,
				rolls: [2]
			});

			return logiDice.parse("2d10-1d4-1", logiDice.mode.SUM).then((result) => {
				expect(result.output).to.contain('2d10: 4 8 = 12');
				expect(result.output).to.contain('1d4: 2 = 2');
				expect(result.output).to.contain('**Total**: 9');
			});
		});

		it('should output the repetition operator', () => {
			sandbox.stub(logiDice, 'roll').onFirstCall().resolves({
				result: 12,
				rolls: [4,8]
			}).onSecondCall().resolves({
				result: 4,
				rolls: [2,2]
			});

			return logiDice.parse("2x2d10", logiDice.mode.SUM).then((result) => {
				expect(result.output).to.contain('2d10: 4 8 = 12');
				expect(result.output).to.contain('2d10: 2 2 = 4');
				expect(result.output).to.contain('**Grand Total**: 16');
			});
		});
	});

	describe("RollHandler", () => {
		it('should roll dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			const fakeCommand = {
				reply: sandbox.stub().resolves(),
				args: ["1d10"]
			}

			return logiDice.onRoll(fakeCommand).then(() => {

				expect(logiDice.roll.called).to.equal(true);
				expect(fakeCommand.reply.called).to.equal(true);

				const output = fakeCommand.reply.firstCall.args[0];
				expect(output).to.include("You rolled 1d10:");
				expect(output).to.contain('**Your rolls:** \n');
				expect(output).to.contain('1d10: 4 = 4');
				expect(output).to.contain('**Total**: 4');
			})

		});
	})
});
