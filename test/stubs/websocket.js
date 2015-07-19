export default function() {
	beforeEach(function() {
		this.isWebSocketOpened = false;
		this.isWebSocketSent = false;
		this.isWebSocketClose = false;

		this.resetWebSocketTracking = () => {
			this.isWebSocketOpened = false;
			this.isWebSocketSent = false;
			this.isWebSocketClose = false;
		};

		var testSelf = this;
		global.WebSocket = class WebSocket {
			constructor() {
				testSelf.isWebSocketOpened = true;

				this.readyState = 0;

				setTimeout(() => {
					this.readyState = 1;
					if (this.onopen) {
						this.onopen();
					}
				}, 0);
			}

			close() {
				testSelf.isWebSocketClose = true;

				if (this.onclose) {
					this.onclose();
				}
			}

			send(data) {
				testSelf.isWebSocketSent = true;

				//just echo it right back
				if (this.onmessage) {
					this.onmessage({
						data: data
					});
				}
			}
		};

		global.WebSocket.OPEN = 1;
	});
}
