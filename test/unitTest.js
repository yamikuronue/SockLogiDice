'use strict';
const Chai = require('chai');
const expect = Chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");

Chai.use(chaiAsPromised);
Chai.use(sinonChai);
Chai.should();

const Sinon = require('sinon');
require('sinon-as-promised');

const logiDice = require('../src/logiDice.js');
const View = require('../src/view');

describe('Logios Dice for SockBot', () => {
	let sandbox = Sinon.sandbox.create();

	beforeEach(function() {
		logiDice.view = new View({
			Format: {
				bold: (input) => `**${input}**`,
				spoiler: (body, summary) => `${summary} : ${body}`
			},
			supports: (item) => true
		}, {});
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('Activate/plugin', () => {
		const fakeForum = {
			Commands: {
				add: () => Promise.resolve()
			},
			supports: () => false
		};

		it('Should activate commands', () => {
			sandbox.spy(fakeForum.Commands, 'add');
			return logiDice.plugin(fakeForum, {}).activate().then(() => {
				fakeForum.Commands.add.should.be.calledWith('roll');
				fakeForum.Commands.add.should.be.calledWith('rollww');
				fakeForum.Commands.add.should.be.calledWith('rollscion');
				fakeForum.Commands.add.should.be.calledWith('rollfate');
			});
		});
		
		it('Should provide default config', () => {
			return logiDice.plugin(fakeForum, {}).config.spoilers.should.be.false;
		});
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

		it('should behave sensibly with nonsensical input', () => {
			sandbox.stub(Math, 'random').returns(0.5);
			return expect(logiDice.roll('@index&zwnj;d@index', logiDice.mode.SUM)).to.eventually.deep.equal({
				rolls: [],
				result: 0
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

		it('should behave sensibly with nonsensical input', () => {
			sandbox.stub(Math, 'random').returns(0.5);
			return logiDice.parse('@index&zwnj;d@index', logiDice.mode.SUM).then((result) => {
				expect(result.rolls).to.deep.equal([]);
				expect(result.result).to.equal(0);
			});
		});

		it('should behave sensibly with nonsensical recursive input', () => {
			sandbox.stub(Math, 'random').returns(0.5);
			return logiDice.parse('10x@index&zwnj;d@index', logiDice.mode.SUM).then((result) => {
				expect(result.rolls).to.deep.equal([]);
				expect(result.result).to.equal(0);
			});
		});
		
		it('should behave sensibly with nonsensical Fate input', () => {
			sandbox.stub(Math, 'random').returns(0.5);
			return logiDice.parse('10x@index&zwnj;dF', logiDice.mode.SUM).then((result) => {
				expect(result.rolls).to.deep.equal([]);
				expect(result.result).to.equal(0);
			});
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

			sandbox.stub(logiDice.view, 'formatOutput').returns('output');

			return logiDice.parse("1d10", logiDice.mode.SUM).then((result) => {
				expect(result.rolls).to.contain('1d10: 4 = 4');
				expect(result.result).to.equal(4);
			});

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
				expect(result.rolls).to.contain('2d10: 4 8 = 12');
				expect(result.rolls).to.contain('1d4: 2 = 2');
				expect(result.result).to.equal(14);
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
				expect(result.rolls).to.contain('2d10: 4 8 = 12');
				expect(result.rolls).to.contain('1d4: 2 = 2');
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
				expect(result.rolls).to.contain('2d10: 4 8 = 12');
				expect(result.rolls).to.contain('2d10: 2 2 = 4');
			});
		});

		it('should bold white wolf successes', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 39,
				rolls: [4,8, 10, 7, 10]
			});

			return logiDice.parse("5d10", logiDice.mode.WW).then((result) => {
				expect(result.rolls).to.contain('5d10: 4 **8** **10** 7 **10** = 39');
			});
		});

		it('should bold scion successes', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 39,
				rolls: [4,8, 10, 7, 10]
			});

			return logiDice.parse("5d10", logiDice.mode.SCION).then((result) => {
				expect(result.rolls).to.contain('5d10: 4 **8** **10** **7** **10** = 39');
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
				expect(output).to.include("You rolled 1d10");
				expect(output).to.contain('1d10: 4 = 4');
			})

		});
	});

	describe("FateHandler", () => {
		it('should roll Fate dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			const fakeCommand = {
				reply: sandbox.stub().resolves(),
				args: ["1d6"]
			}

			return logiDice.onFate(fakeCommand).then(() => {

				expect(logiDice.roll.calledWith('1d6', logiDice.mode.FATE)).to.equal(true);
				expect(fakeCommand.reply.called).to.equal(true);
			})

		});
	})

	describe("WWHandler", () => {
		it('should roll White Wolf dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			const fakeCommand = {
				reply: sandbox.stub().resolves(),
				args: ["1d10"]
			}

			return logiDice.onWW(fakeCommand).then(() => {

				expect(logiDice.roll.calledWith('1d10', logiDice.mode.WW)).to.equal(true);
				expect(fakeCommand.reply.called).to.equal(true);
			})

		});
	})

	describe("ScionHandler", () => {
		it('should roll White Wolf dice', () => {
			sandbox.stub(logiDice, 'roll').resolves({
				result: 4,
				rolls: [4]
			});

			const fakeCommand = {
				reply: sandbox.stub().resolves(),
				args: ["1d10"]
			}

			return logiDice.onScion(fakeCommand).then(() => {

				expect(logiDice.roll.calledWith('1d10', logiDice.mode.SCION)).to.equal(true);
				expect(fakeCommand.reply.called).to.equal(true);
			});
		});
	});
});

describe('Logios Dice view', () => {
	let sandbox = Sinon.sandbox.create();
	let view;

	describe('single-line mode', () => {
		before(function() {
			view = new View({
				Format: {
					bold: (input) => `*${input}*`,
					spoiler: (body, summary) => `${summary} : ${body}`
				},
				supports: (item) => false
			});
			view.multiline = false;
		});

		afterEach(function() {
			sandbox.restore();
		});

		describe('formatOutput', () => {
			it('should trim trailing | ', () => {
				const expected = 'You rolled: 1d20 || 1d20: 8 = 8 || Total: *8*';
				const result = {
					input: '1d20',
					rolls: [view.formatRoll('1d20', [8], 8, logiDice.mode.SUM)],
					result: 8
				};

				expect(view.formatOutput(result)).to.equal(expected);
			});

			it('should trim trailing | in multiple lines', () => {
				const expected = 'You rolled: 1d20+2d4 || 1d20: 8 = 8 | 2d4: 1 2 = 3 || Total: *11*';
				const result = {
					input: '1d20+2d4',
					rolls: [
						view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
						view.formatRoll('2d4', [1,2], 3, logiDice.mode.SUM)
					],
					result: 11
				};

				expect(view.formatOutput(result)).to.equal(expected);
			});

			it('should trim trailing | in multiple recursion lines', () => {
				const expected = 'You rolled: 2x1d20 || «1d20: 8 = 8» | «1d20: 4 = 4» || Total: *12*';
				const result = {
					input: '2x1d20',
					rolls: [
						view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
						view.formatRoll('1d20', [4], 4, logiDice.mode.SUM)
						],
					result: 12,
					subQueries: [
						{
							input: '1d20',
							rolls: [
								view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
							],
							result: 8
						},
						{
							input: '1d20',
							rolls: [
								view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
							],
							result: 4
						}
					]
				};

				expect(view.formatOutput(result)).to.equal(expected);
			});

			it('should trim trailing | in multiple recursion lineswith multiple rolls', () => {
				const expected = 'You rolled: 2x1d20+2d4 || «1d20: 8 = 8 | 2d4: 1 3 = 4» | «1d20: 4 = 4 | 2d4: 2 2 = 4» || Total: *20*';
				const result = {
					input: '2x1d20+2d4',
					rolls: [
						view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
						view.formatRoll('2d4', [1,3], 4, logiDice.mode.SUM),
						view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
						view.formatRoll('2d4', [2,2], 4, logiDice.mode.SUM),
						],
					result: 20,
					subQueries: [
						{
							input: '1d20+2d4',
							rolls: [
								view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
								view.formatRoll('2d4', [1,3], 4, logiDice.mode.SUM),
							],
							result: 11
						},
						{
							input: '1d20+2d4',
							rolls: [
								view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
								view.formatRoll('2d4', [2,2], 4, logiDice.mode.SUM),
							],
							result: 8
						}
					]
				};

				expect(view.formatOutput(result)).to.equal(expected);
			});
		});
	});


	describe('multi-line mode', () => {
		const fakeForum = {
				Format: {
					bold: (input) => `*${input}*`,
					spoiler: (body, summary) => `${summary} : ${body}`
				},
				supports: (item) => true
			};
			
		const fakeForumNoSpoilers = {
				Format: {
					bold: (input) => `*${input}*`,
					spoiler: (body, summary) => `${summary} : ${body}`
				},
				supports: (item) => false
		}

		before(function() {
			view = new View(fakeForum, {});
			view.multiline = true;
		});

		afterEach(function() {
			sandbox.restore();
		});
		
		describe('configuration', () => {
			it('should turn on spoilers if supported and enabled', () => new View(fakeForum, {spoilers: true}).spoiler.should.equal(true));
			it('should turn off spoilers if supported but not enabled', () => new View(fakeForum, {spoilers: false}).spoiler.should.equal(false));
			it('should turn off spoilers if not supported but enabled', () => new View(fakeForumNoSpoilers, {spoilers: true}).spoiler.should.equal(false));
			it('should turn off spoilers if not supported and not enabled', () => new View(fakeForumNoSpoilers, {spoilers: false}).spoiler.should.equal(false));
		});

		describe('formatOutput', () => {
			it('should offer spoilers if supported', () => {
				view.spoiler = true;
				sandbox.spy(fakeForum.Format, 'spoiler');
				const result = {
					input: '1d20',
					rolls: [view.formatRoll('1d20', [8], 8, logiDice.mode.SUM)],
					result: 8
				};

				view.formatOutput(result);
				expect(fakeForum.Format.spoiler).to.have.been.calledOnce;
				const args = fakeForum.Format.spoiler.firstCall.args;
				expect(args[0]).to.equal('*Your rolls*: \n1d20: 8 = 8\nTotal: *8*');
				expect(args[1]).to.equal('You rolled 1d20: 8');
			});

			it('should use multiple lines without spoilers if not supported', () => {
				view.spoiler = false;
				const result = {
					input: '1d20',
					rolls: [view.formatRoll('1d20', [8], 8, logiDice.mode.SUM)],
					result: 8
				};

				expect(view.formatOutput(result)).to.equal('You rolled 1d20\n\n1d20: 8 = 8\nTotal: *8*');
			});

			it('should offer spoilers with recursion if supported', () => {
				view.spoiler = true;
				sandbox.spy(fakeForum.Format, 'spoiler');
				const result = {
					input: '2x1d20',
					rolls: [
						view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
						view.formatRoll('1d20', [4], 4, logiDice.mode.SUM)
						],
					result: 12,
					subQueries: [
						{
							input: '1d20',
							rolls: [
								view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
							],
							result: 8
						},
						{
							input: '1d20',
							rolls: [
								view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
							],
							result: 4
						}
					]
				};

				view.formatOutput(result);
				expect(fakeForum.Format.spoiler).to.have.been.calledOnce;
				const args = fakeForum.Format.spoiler.firstCall.args;
				expect(args[0]).to.equal('*Your rolls*: \n*1d20*:\n- 1d20: 8 = 8\n\n*1d20*:\n- 1d20: 4 = 4\n\nTotal: *12*');
				expect(args[1]).to.equal('You rolled 2x1d20: 12');
			});

			it('should use multiple lines with recursion without spoilers', () => {
				view.spoiler = false;
				const result = {
					input: '2x1d20+2d4',
					rolls: [
						view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
						view.formatRoll('2d4', [1,3], 4, logiDice.mode.SUM),
						view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
						view.formatRoll('2d4', [2,2], 4, logiDice.mode.SUM),
						],
					result: 20,
					subQueries: [
						{
							input: '1d20+2d4',
							rolls: [
								view.formatRoll('1d20', [8], 8, logiDice.mode.SUM),
								view.formatRoll('2d4', [1,3], 4, logiDice.mode.SUM),
							],
							result: 11
						},
						{
							input: '1d20+2d4',
							rolls: [
								view.formatRoll('1d20', [4], 4, logiDice.mode.SUM),
								view.formatRoll('2d4', [2,2], 4, logiDice.mode.SUM),
							],
							result: 8
						}
					]
				};

				expect(view.formatOutput(result)).to.equal('You rolled 2x1d20+2d4\n\n*1d20+2d4*:\n- 1d20: 8 = 8\n- 2d4: 1 3 = 4\n\n*1d20+2d4*:\n- 1d20: 4 = 4\n- 2d4: 2 2 = 4\n\nTotal: *20*');
			});
		});
	});
});