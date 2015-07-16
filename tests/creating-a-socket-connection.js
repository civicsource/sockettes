//https://github.com/chaijs/chai/issues/41
/* jshint expr:true */
import { expect } from "chai";
import behavesLikeStubs from "./stubs";

import Sockette from "./../src/socket";

describe("Creating a socket connection", function() {
	var socket;
	behavesLikeStubs();

	beforeEach(function() {
		socket = new Sockette("wss://example.com/");
	});

	it("should create a new sockette", function() {
		expect(socket).to.be.ok;
	});

	it("should set URL", function() {
		expect(socket.url).to.equal("wss://example.com/");
	});
});
