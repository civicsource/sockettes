export default function() {
	beforeEach(function() {
		this.isWebSocketOpened = false;

		this.resetWebSocketOpened = () => {
			this.isWebSocketOpened = false;
		};

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
}
