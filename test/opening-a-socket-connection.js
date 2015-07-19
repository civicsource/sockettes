//https://github.com/chaijs/chai/issues/41
/* jshint expr:true */
import { expect } from "chai";
import behavesLikeStubs from "./stubs";
import behavesLikeSocketteConnection from "./behaves-like-sockette-connection";
import crosstab from "crosstab";

describe("Opening a socket connection", function() {
	behavesLikeStubs();

	describe("with crosstab supported", function() {
		beforeEach(function() {
			crosstab.supported = true;
		});

		behavesLikeSocketteConnection();

		describe("when opening a socket connection as the master tab", function() {
			beforeEach(function(done) {
				crosstab.id = "master";

				this.socket.open();

				setTimeout(done, 0);
			});

			it("should raise opened event", function() {
				expect(this.isOpenEventRaised).to.be.true;
			});

			it("should mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.true;
			});

			it("should broadcast socket open message on crosstab", function() {
				expect(this.isOpenTabMessageSent).to.be.true;
			});

			it("should broadcast socket opened message on crosstab", function() {
				expect(this.isOpenedTabMessageSent).to.be.true;
			});

			it("should open a real websocket connection", function() {
				expect(this.isWebSocketOpened).to.be.true;
			});
		});

		describe("when opening a socket connection as the master tab after the socket is already open", function() {
			beforeEach(function(done) {
				crosstab.id = "master";

				this.socket.open();

				setTimeout(done, 0);
			});

			beforeEach(function(done) {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();

				this.socket.open();
				setTimeout(done, 0);
			});

			it("should raise opened event again", function() {
				expect(this.isOpenEventRaised).to.be.true;
			});

			it("should mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.true;
			});

			it("should broadcast socket open message on crosstab", function() {
				expect(this.isOpenTabMessageSent).to.be.true;
			});

			it("should broadcast socket opened message on crosstab", function() {
				expect(this.isOpenedTabMessageSent).to.be.true;
			});

			it("should not open real websocket connection again", function() {
				expect(this.isWebSocketOpened).to.be.false;
			});
		});

		describe("when opening a socket connection not as the master tab", function() {
			beforeEach(function(done) {
				crosstab.id = "other_tab";

				this.socket.open();

				setTimeout(done, 0);
			});

			it("should not raise opened event", function() {
				expect(this.isOpenEventRaised).to.be.false;
			});

			it("should not mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.false;
			});

			it("should broadcast socket open message on crosstab", function() {
				expect(this.isOpenTabMessageSent).to.be.true;
			});

			it("should not broadcast socket opened message on crosstab", function() {
				expect(this.isOpenedTabMessageSent).to.be.false;
			});

			it("should not open a real websocket connection", function() {
				expect(this.isWebSocketOpened).to.be.false;
			});
		});

		describe("when another master tab opens a socket connection", function() {
			beforeEach(function(done) {
				crosstab.id = "other_tab";

				crosstab.broadcast("socket.opened");

				setTimeout(done, 0);
			});

			it("should raise opened event", function() {
				expect(this.isOpenEventRaised).to.be.true;
			});

			it("should mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.true;
			});

			it("should not open a real websocket connection", function() {
				expect(this.isWebSocketOpened).to.be.false;
			});
		});
	});

	describe("without crosstab supported", function(){
		beforeEach(function() {
			crosstab.supported = false;
		});

		behavesLikeSocketteConnection();

		describe("when opening a socket connection", function() {
			beforeEach(function(done) {
				this.socket.open();

				setTimeout(done, 0);
			});

			it("should raise opened event", function() {
				expect(this.isOpenEventRaised).to.be.true;
			});

			it("should mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.true;
			});

			it("should not broadcast any messages on crosstab", function() {
				expect(crosstab.broadcast.called).to.be.false;
			});

			it("should open a real websocket connection", function() {
				expect(this.isWebSocketOpened).to.be.true;
			});
		});

		describe("when opening a socket connection after the socket is already open", function() {
			beforeEach(function(done) {
				this.socket.open();

				setTimeout(done, 0);
			});

			beforeEach(function(done) {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();

				this.socket.open();
				setTimeout(done, 0);
			});

			it("should raise opened event again", function() {
				expect(this.isOpenEventRaised).to.be.true;
			});

			it("should mark the socket as opened", function() {
				expect(this.socket.isOpen).to.be.true;
			});

			it("should not broadcast any messages on crosstab", function() {
				expect(crosstab.broadcast.called).to.be.false;
			});

			it("should not open real websocket connection again", function() {
				expect(this.isWebSocketOpened).to.be.false;
			});
		});
	});
});
