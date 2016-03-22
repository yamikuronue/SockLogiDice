'use strict';
const Chai = require('chai');
const expect = Chai.expect;
const chaiAsPromised = require("chai-as-promised");
Chai.use(chaiAsPromised);
const Sinon = require('sinon');

const logiDice = require('./logiDice.js');

describe('Logios Dice for SockBot', () => {
	let sandbox = Sinon.sandbox.create();

	afterEach(function() {
		sandbox.restore();
	});
	
	describe('Roll()', () => {
		
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
	});
});