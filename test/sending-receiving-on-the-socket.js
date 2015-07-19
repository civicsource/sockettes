//https://github.com/chaijs/chai/issues/41
/* jshint expr:true */
import { expect } from "chai";
import behavesLikeStubs from "./stubs";
import behavesLikeSocketteConnection from "./behaves-like-sockette-connection";
import crosstab from "crosstab";

describe("Sending & receiving on the socket connection", function() {
	behavesLikeStubs();

	describe("with crosstab supported", function() {
		beforeEach(function() {
			crosstab.supported = true;
		});

		behavesLikeSocketteConnection();

		describe("on a previously opened socket connection", function() {
			beforeEach(function(done) {
				crosstab.id = "master";

				this.socket.open();

				setTimeout(done, 0);
			});

			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when sending as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "master";

					this.socket.send({
						hello: "world"
					});
				});

				it("should not raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.false;
				});

				it("should broadcast socket send message on crosstab", function() {
					expect(this.isSendMessageSent).to.be.true;
				});

				it("should not broadcast socket opened message on crosstab", function() {
					expect(this.isOpenedTabMessageSent).to.be.false;
				});

				it("should broadcast message sent message on crosstab", function() {
					expect(this.isSentMessageSent).to.be.true;
				});

				it("should broadcast message received message on crosstab", function() {
					expect(this.isReceiveMessageSent).to.be.true;
				});

				it("should raise message received event", function() {
					expect(this.receivedMessage).to.be.ok;
					expect(this.receivedMessage.hello).to.equal("world");
				});

				it("should send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.true;
				});
			});

			describe("when sending not as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					this.socket.send({
						hello: "world"
					});
				});

				it("should not raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.false;
				});

				it("should broadcast socket send message on crosstab", function() {
					expect(this.isSendMessageSent).to.be.true;
				});

				it("should not broadcast socket opened message on crosstab", function() {
					expect(this.isOpenedTabMessageSent).to.be.false;
				});

				it("should not broadcast message sent message on crosstab", function() {
					expect(this.isSentMessageSent).to.be.false;
				});

				it("should not broadcast socket received message on crosstab", function() {
					expect(this.isReceiveMessageSent).to.be.false;
				});

				it("should not raise message received event", function() {
					expect(this.receivedMessage).to.not.be.ok;
				});

				it("should not send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.false;
				});
			});

			describe("when master tab acknowledges message sent for another tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					crosstab.broadcast("socket.sent", {
						hello: "world"
					});
				});

				it("should not raise opened event since this tab already knew the socket was opened", function() {
					expect(this.isOpenEventRaised).to.be.false;
				});

				it("socket should be in open state", function() {
					expect(this.socket.isOpen).to.be.true;
				});
			});
		});

		describe("on a closed socket connection", function() {
			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when sending not as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					this.socket.send({
						hello: "world"
					});
				});

				it("should not raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.false;
				});

				it("socket should still be in closed state", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should still broadcast socket send message on crosstab despite closed state", function() {
					expect(this.isSendMessageSent).to.be.true;
				});

				it("should not broadcast socket opened message on crosstab", function() {
					expect(this.isOpenedTabMessageSent).to.be.false;
				});

				it("should not broadcast message sent message on crosstab", function() {
					expect(this.isSentMessageSent).to.be.false;
				});

				it("should not broadcast socket received message on crosstab", function() {
					expect(this.isReceiveMessageSent).to.be.false;
				});

				it("should not raise message received event", function() {
					expect(this.receivedMessage).to.not.be.ok;
				});

				it("should not send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.false;
				});
			});

			describe("when master tab acknowledges message sent for another tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					crosstab.broadcast("socket.sent", {
						hello: "world"
					});
				});

				it("should raise opened event since this tab didn't know the socket was opened", function() {
					expect(this.isOpenEventRaised).to.be.true;
				});

				it("socket should be in open state", function() {
					expect(this.socket.isOpen).to.be.true;
				});
			});

			describe("when sending as the master tab", function() {
				beforeEach(function(done) {
					crosstab.id = "master";

					this.socket.send({
						hello: "world"
					});

					setTimeout(done, 0);
				});

				it("should raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.true;
				});

				it("should mark socket as opened", function() {
					expect(this.socket.isOpen).to.be.true;
				});

				it("should open the real websocket", function() {
					expect(this.isWebSocketOpened).to.be.true;
				});

				it("should broadcast socket opened message on crosstab", function() {
					expect(this.isOpenedTabMessageSent).to.be.true;
				});

				it("should broadcast socket send message on crosstab", function() {
					expect(this.isSendMessageSent).to.be.true;
				});

				it("should send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.true;
				});

				it("should broadcast message received message on crosstab", function() {
					expect(this.isReceiveMessageSent).to.be.true;
				});

				it("should raise message received event", function() {
					expect(this.receivedMessage).to.be.ok;
					expect(this.receivedMessage.hello).to.equal("world");
				});
			});
		});
	});

	describe("with crosstab not supported", function() {
		beforeEach(function() {
			crosstab.supported = false;
		});

		behavesLikeSocketteConnection();

		describe("on a previously opened socket connection", function() {
			beforeEach(function(done) {
				this.socket.open();
				setTimeout(done, 0);
			});

			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when sending", function() {
				beforeEach(function() {
					this.socket.send({
						hello: "world"
					});
				});

				it("should not raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.false;
				});

				it("should not broadcast any messages on crosstab", function() {
					expect(crosstab.broadcast.called).to.be.false;
				});

				it("should raise message received event", function() {
					expect(this.receivedMessage).to.be.ok;
					expect(this.receivedMessage.hello).to.equal("world");
				});

				it("should send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.true;
				});
			});
		});

		describe("on a closed socket connection", function() {
			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when sending", function() {
				beforeEach(function(done) {
					this.socket.send({
						hello: "world"
					});

					setTimeout(done, 0);
				});

				it("should raise opened event", function() {
					expect(this.isOpenEventRaised).to.be.true;
				});

				it("should mark socket as opened", function() {
					expect(this.socket.isOpen).to.be.true;
				});

				it("should open the real websocket", function() {
					expect(this.isWebSocketOpened).to.be.true;
				});

				it("should not broadcast any messages on crosstab", function() {
					expect(crosstab.broadcast.called).to.be.false;
				});

				it("should send data on the real websocket", function() {
					expect(this.isWebSocketSent).to.be.true;
				});

				it("should raise message received event", function() {
					expect(this.receivedMessage).to.be.ok;
					expect(this.receivedMessage.hello).to.equal("world");
				});
			});
		});
	});
});
