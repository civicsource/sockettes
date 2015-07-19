//https://github.com/chaijs/chai/issues/41
/* jshint expr:true */
import { expect } from "chai";
import behavesLikeStubs from "./stubs";
import behavesLikeSocketteConnection from "./behaves-like-sockette-connection";
import crosstab from "crosstab";

describe("Closing a socket connection", function() {
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

			describe("when closing as the master tab with no other tabs listening", function() {
				function setup(action) {
					beforeEach(function() {
						crosstab.id = "master";
						if (action) action();

						this.resetSocketteTracking();
						this.resetWebSocketTracking();

						this.socket.close();
					});

					it("should broadcast socket close message on crosstab", function() {
						expect(this.isCloseMessageSent).to.be.true;
					});

					it("should broadcast socket closed message on crosstab", function() {
						expect(this.isClosedMessageSent).to.be.true;
					});

					it("should raise socket closed event", function() {
						expect(this.isCloseEventRaised).to.be.true;
					});

					it("should mark the socket as closed", function() {
						expect(this.socket.isOpen).to.be.false;
					});

					it("should close the real websocket", function() {
						expect(this.isWebSocketClose).to.be.true;
					});
				}

				describe("via no other tabs ever listening", function() {
					setup();
				});

				describe("via a tab opening then closing the socket", function() {
					setup(function() {
						crosstab.broadcast("socket.open", null, "some_other_tab");
						crosstab.broadcast("socket.close", null, "some_other_tab");
					});
				});

				describe("via a tab sending on then closing the socket", function() {
					setup(function() {
						crosstab.broadcast("socket.send", { hello: "world" }, "some_other_tab");
						crosstab.broadcast("socket.close", null, "some_other_tab");
					});
				});
			});

			describe("when closing as the master tab with other tabs listening", function() {
				function setup(action) {
					beforeEach(function() {
						crosstab.id = "master";
						action();

						this.resetSocketteTracking();
						this.resetWebSocketTracking();

						this.socket.close();
					});

					it("should broadcast socket close message on crosstab", function() {
						expect(this.isCloseMessageSent).to.be.true;
					});

					it("should not broadcast socket closed message on crosstab", function() {
						expect(this.isClosedMessageSent).to.be.false;
					});

					it("should not raise socket closed event", function() {
						expect(this.isCloseEventRaised).to.be.false;
					});

					it("should mark the socket as still open", function() {
						expect(this.socket.isOpen).to.be.true;
					});

					it("should not close the real websocket", function() {
						expect(this.isWebSocketClose).to.be.false;
					});
				}

				describe("via opening the socket", function() {
					setup(function() {
						crosstab.broadcast("socket.open", null, "some_other_tab");
					});
				});

				describe("via sending on the socket", function() {
					setup(function() {
						crosstab.broadcast("socket.send", null, "some_other_tab");
					});
				});
			});

			describe("when closing not as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					this.socket.close();
				});

				it("should broadcast socket close message on crosstab", function() {
					expect(this.isCloseMessageSent).to.be.true;
				});

				it("should not broadcast socket closed message on crosstab", function() {
					expect(this.isClosedMessageSent).to.be.false;
				});

				it("should not raise closed event", function() {
					expect(this.isCloseEventRaised).to.be.false;
				});

				it("should mark the socket as still open", function() {
					expect(this.socket.isOpen).to.be.true;
				});

				it("should not close the real websocket", function() {
					expect(this.isWebSocketClose).to.be.false;
				});
			});

			describe("when another tab tries to close the socket with the master tab still listening", function() {
				beforeEach(function() {
					crosstab.id = "master";
					crosstab.broadcast("socket.close", null, "some_other_tab");
				});

				it("should not raise socket closed event", function() {
					expect(this.isCloseEventRaised).to.be.false;
				});

				it("should mark the socket as still open", function() {
					expect(this.socket.isOpen).to.be.true;
				});

				it("should not close the real websocket", function() {
					expect(this.isWebSocketClose).to.be.false;
				});
			});

			describe("when another tab tries to close the socket after the master tab has stopped listening", function() {
				beforeEach(function() {
					crosstab.id = "master";
					crosstab.broadcast("socket.open", null, "some_other_tab"); //some_other_tab is listening

					this.socket.close(); //master is not listening anymore
					expect(this.socket.isOpen).to.be.true; //the socket should still be open, though

					crosstab.broadcast("socket.close", null, "some_other_tab");
				});

				it("should raise socket closed event", function() {
					expect(this.isCloseEventRaised).to.be.true;
				});

				it("should mark the socket as closed", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should close the real websocket", function() {
					expect(this.isWebSocketClose).to.be.true;
				});

				it("should broadcast socket closed message on crosstab", function() {
					expect(this.isClosedMessageSent).to.be.true;
				});
			});
		});

		describe("on a closed socket connection", function() {
			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when closing not as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "another_tab";

					this.socket.close();
				});

				it("socket should still be in closed state", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should still broadcast socket close message on crosstab despite closed state", function() {
					expect(this.isCloseMessageSent).to.be.true;
				});

				it("should not broadcast socket closed message on crosstab", function() {
					expect(this.isClosedMessageSent).to.be.false;
				});

				it("should not raise closed event", function() {
					expect(this.isCloseEventRaised).to.be.false;
				});

				it("should not close the real websocket", function() {
					expect(this.isWebSocketClose).to.be.false;
				});
			});

			describe("when master tab receives socket close message for another tab", function() {
				beforeEach(function() {
					crosstab.id = "master";

					crosstab.broadcast("socket.close", null, "some_other_tab");
				});

				it("should raise closed event again", function() {
					expect(this.isCloseEventRaised).to.be.true;
				});

				it("socket should be in closed state", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should broadcast socket closed message", function() {
					expect(this.isClosedMessageSent).to.be.true;
				});

				it("should not reclose the real websocket since it was never opened", function() {
					expect(this.isWebSocketClose).to.be.false;
				});
			});

			describe("when closing as the master tab", function() {
				beforeEach(function() {
					crosstab.id = "master";

					this.resetSocketteTracking();
					this.resetWebSocketTracking();

					this.socket.close();
				});

				it("should broadcast socket close message on crosstab", function() {
					expect(this.isCloseMessageSent).to.be.true;
				});

				it("should broadcast socket closed message on crosstab", function() {
					expect(this.isClosedMessageSent).to.be.true;
				});

				it("should raise socket closed event", function() {
					expect(this.isCloseEventRaised).to.be.true;
				});

				it("should mark the socket as closed", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should not close the real websocket since it was never opened", function() {
					expect(this.isWebSocketClose).to.be.false;
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

			describe("when closing", function() {
				beforeEach(function() {
					this.socket.close();
				});

				it("should raise closed event", function() {
					expect(this.isCloseEventRaised).to.be.true;
				});

				it("should mark the socket as closed", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should not broadcast any messages on crosstab", function() {
					expect(crosstab.broadcast.called).to.be.false;
				});

				it("should close the real websocket", function() {
					expect(this.isWebSocketClose).to.be.true;
				});
			});
		});

		describe("on a closed socket connection", function() {
			beforeEach(function() {
				this.resetSocketteTracking();
				this.resetWebSocketTracking();
			});

			describe("when closing", function() {
				beforeEach(function() {
					this.socket.close();
				});

				it("should raise closed event", function() {
					expect(this.isCloseEventRaised).to.be.true;
				});

				it("should mark the socket as closed", function() {
					expect(this.socket.isOpen).to.be.false;
				});

				it("should not broadcast any messages on crosstab", function() {
					expect(crosstab.broadcast.called).to.be.false;
				});

				it("should not close the real websocket since it was never open", function() {
					expect(this.isWebSocketClose).to.be.false;
				});
			});
		});
	});
});
