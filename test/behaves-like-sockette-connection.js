import Sockette from "./../src/socket";
import crosstab from "crosstab";

export default function() {
	beforeEach(function() {
		this.isOpenTabMessageSent = false;
		this.isOpenedTabMessageSent = false;
		this.isOpenEventRaised = false;

		this.isSendMessageSent = false;
		this.isSentMessageSent = false;
		this.isReceiveMessageSent = false;
		this.receivedMessage = null;

		this.socket = new Sockette("wss://example.com/");

		this.socket.on("opened", () => { this.isOpenEventRaised = true; });
		crosstab.on("socket.open", () => { this.isOpenTabMessageSent = true; });
		crosstab.on("socket.opened", () => { this.isOpenedTabMessageSent = true; });

		this.socket.on("message", msg => { this.receivedMessage = msg; });
		crosstab.on("socket.send", () => { this.isSendMessageSent = true; });
		crosstab.on("socket.sent", () => { this.isSentMessageSent = true; });
		crosstab.on("socket.message", () => { this.isReceiveMessageSent = true; });

		this.resetSocketteTracking = () => {
			this.isOpenTabMessageSent = false;
			this.isOpenedTabMessageSent = false;
			this.isOpenEventRaised = false;

			this.isSendMessageSent = false;
			this.isSentMessageSent = false;
			this.isReceiveMessageSent = false;
			this.receivedMessage = null;
		};
	});
}
