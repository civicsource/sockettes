import Sockette from "./../src/socket";
import crosstab from "crosstab";

export default function() {
	beforeEach(function() {
		this.isOpenTabMessageSent = false;
		this.isOpenedTabMessageSent = false;
		this.isOpenEventRaised = false;

		this.socket = new Sockette("wss://example.com/");

		this.socket.on("opened", () => { this.isOpenEventRaised = true; });
		crosstab.on("socket.open", () => { this.isOpenTabMessageSent = true; });
		crosstab.on("socket.opened", () => { this.isOpenedTabMessageSent = true; });

		this.resetSocketteTracking = function() {
			this.isOpenTabMessageSent = false;
			this.isOpenedTabMessageSent = false;
			this.isOpenEventRaised = false;
		}.bind(this);
	});
}
