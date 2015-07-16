import sinon from "sinon";
import crosstab from "crosstab";
import EventEmitter from "eventemitter3";

export default function() {
	var emitter;

	beforeEach(function() {
		emitter = new EventEmitter();

		sinon.stub(crosstab, "broadcast", (name, data) => emitter.emit(name, {
			origin: "some_other_tab",
			data: data
		}));
		sinon.stub(crosstab, "on", emitter.on.bind(emitter));

		crosstab.util.tabs[crosstab.util.keys.MASTER_TAB] = {
			id: "master"
		};

		this.isWebSocketOpened = false;

		var testSelf = this;
		global.WebSocket = class WebSocket {
			constructor() {
				testSelf.isWebSocketOpened = true;

				setTimeout(() => {
					if (this.onopen) {
						this.onopen();
					}
				}, 0);
			}

			close() {
				if (this.onclose) {
					this.onclose();
				}
			}

			send(data) {
				//just echo it right back
				if (this.onmessage) {
					this.onmessage({
						data: data
					});
				}
			}
		};
	});

	afterEach(function() {
		crosstab.broadcast.restore();
		crosstab.on.restore();
	});
}
