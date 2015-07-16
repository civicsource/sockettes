import crosstab from "crosstab";
import EventEmitter from "eventemitter3";
import isFunction from "lodash.isfunction";

export default class Sockette extends EventEmitter {
	constructor(url) {
		super();

		this.url = url;
		this.isOpen = false;

		this.tabsListening = {};

		if (crosstab.supported) {
			subscribeToTabEvents.call(this);
		}
	}

	open() {
		if (crosstab.supported) {
			crosstab.broadcast("socket.open");
		} else {
			openSocket.call(this);
		}
	}

	close() {
		if (crosstab.supported) {
			crosstab.broadcast("socket.close");
		} else {
			closeSocket.call(this);
		}
	}

	send(data) {
		if (crosstab.supported) {
			crosstab.broadcast("socket.send", data);
		} else {
			sendOnSocket.call(this, data);
		}
	}

	isAnyTabsListening() {
		for (var tab in this.tabsListening) {
			var isListening = this.tabsListening[tab];
			if (isListening) {
				return true;
			}
		}
		return false;
	}
}

function isMasterTab() {
	return crosstab.util.tabs[crosstab.util.keys.MASTER_TAB].id === crosstab.id;
}

function subscribeToTabEvents() {
	crosstab.on("socket.open", ev => {
		this.tabsListening[ev.origin] = true;

		if (isMasterTab()) {
			openSocket.call(this);
		}
	});

	crosstab.on("socket.close", ev => {
		this.tabsListening[ev.origin] = false;

		if (isMasterTab() && !this.isAnyTabsListening()) {
			closeSocket.call(this);
		}
	});

	crosstab.on("socket.send", ev => {
		this.tabsListening[ev.origin] = true;

		if (isMasterTab()) {
			sendOnSocket.call(this, ev.data);
		}
	});

	crosstab.on("socket.opened", () => {
		this.isOpen = true;
		this.emit("opened");
	});

	crosstab.on("socket.closed", this.emit.bind(this, "closed"));

	crosstab.on("socket.message", ev => {
		this.emit("message", ev.data);
	});

	crosstab.on(crosstab.util.eventTypes.becomeMaster, () => {
		if (this.isAnyTabsListening()) {
			openSocket.call(this);
		}
	});

	crosstab.on(crosstab.util.eventTypes.demoteFromMaster, () => {
		closeSocket.call(this);
	});

	crosstab.on(crosstab.util.eventTypes.tabClosed, ev => {
		this.tabsListening[ev.origin] = false;
	});
}

function openSocket() {
	if (!this.socket) {
		var url = isFunction(this.url) ? this.url() : this.url;
		this.socket = new WebSocket(url);

		this.socket.onopen = () => {
			this.isOpen = true;

			if (crosstab.supported) {
				crosstab.broadcast("socket.opened");
			} else {
				this.emit("opened");
			}
		};

		this.socket.onclose = () => {
			this.socket = null;
			this.isOpen = false;

			if (this.isMasterTab()) {
				//only broadclast that the socket is closed if this is the master tab
				//if this is not the master tab, another tab will have taken up the socket torch

				if (crosstab.supported) {
					crosstab.broadcast("socket.closed");
				} else {
					this.emit("closed");
				}
			}
		};

		this.socket.onerror = err => {
			if (this.socket.readyState === WebSocket.OPEN) {
				//close the connection and try to reconnect
				this.socket.close();
			}
		};

		this.socket.onmessage = ev => {
			var msg = JSON.parse(ev.data);

			if (crosstab.supported) {
				crosstab.broadcast("socket.message", msg);
			} else {
				this.emit("message", msg);
			}
		};
	}
}

function sendOnSocket(data) {
	if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		this.socket.send(JSON.stringify(data));
	}
}

function closeSocket() {
	if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		this.socket.close();
	}
}
