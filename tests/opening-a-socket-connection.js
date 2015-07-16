//https://github.com/chaijs/chai/issues/41
/* jshint expr:true */
import { expect } from "chai";
import behavesLikeStubs from "./stubs";

import Sockette from "./../src/socket";
import crosstab from "crosstab";

describe("Opening a socket connection", function() {
	var socket, isOpenEventRaised;
	behavesLikeStubs();

	beforeEach(function() {
		crosstab.supported = true;

		isOpenEventRaised = false;

		socket = new Sockette("wss://example.com/");
		socket.on("opened", () => { isOpenEventRaised = true; });
	});

	describe("when opening a socket connection as the master tab", function() {
		beforeEach(function(done) {
			crosstab.id = "master";

			socket.open();

			setTimeout(done, 0);
		});

		it("should raise opened event", function() {
			expect(isOpenEventRaised).to.be.true;
		});

		it("should mark the socket as opened", function() {
			expect(socket.isOpen).to.be.true;
		});

		it("should broadcast open message on crosstab", function() {
			expect(crosstab.broadcast.called).to.be.true;
		});

		it("should open a real websocket connection", function() {
			expect(this.isWebSocketOpened).to.be.true;
		});
	});

	describe("when opening a socket connection not as the master tab", function() {
		beforeEach(function(done) {
			crosstab.id = "other_tab";

			socket.open();

			setTimeout(done, 0);
		});

		it("should not raise opened event", function() {
			expect(isOpenEventRaised).to.be.false;
		});

		it("should not mark the socket as opened", function() {
			expect(socket.isOpen).to.be.false;
		});

		it("should broadcast open message on crosstab", function() {
			expect(crosstab.broadcast.called).to.be.true;
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
			expect(isOpenEventRaised).to.be.true;
		});

		it("should mark the socket as opened", function() {
			expect(socket.isOpen).to.be.true;
		});

		it("should not open a real websocket connection", function() {
			expect(this.isWebSocketOpened).to.be.false;
		});
	});
});
