import crosstab from "crosstab";
import EventEmitter from "eventemitter3";
import isFunction from "lodash.isfunction";

export default class Sockette extends EventEmitter {
	constructor(url) {
		super();

		this.url = url;
		this.tabsListening = {};

		subscribeToTabEvents.call(this);
	}

	open() {
		crosstab.broadcast("socket.open");
	}

	close() {
		crosstab.broadcast("socket.close");
	}

	send(data) {
		crosstab.broadcast("socket.send", data);
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
			this.socket.send(JSON.stringify(ev.data));
		}
	});

	crosstab.on("socket.opened", this.emit.bind(this, "opened"));
	crosstab.on("socket.closed", this.emit.bind(this, "closed"));

	crosstab.on("socket.message", ev => {
		this.emit("message", ev.data);
	});

	crosstab.on(crosstab.util.eventTypes.becomeMaster, () => {
		if (this.isAnyTabsListening()) {
			openSocket.call(this);
		}
	});

	crosstab.on(crosstab.util.eventTypes.tabClosed, ev => {
		this.tabsListening[ev.origin] = false;
	});
}

function openSocket() {
	if (!this.socket) {
		var url = isFunction(this.url) ? this.url() : this.url;
		this.socket = new WebSocket(url);

		this.socket.onopen = crosstab.broadcast.bind(crosstab, "socket.opened");
		this.socket.onclose = () => {
			this.socket = null;
			crosstab.broadcast("socket.closed");
		};

		this.socket.onerror = err => {
			if (this.socket.readyState === WebSocket.OPEN) {
				//close the connection and try to reconnect
				this.socket.close();
			}
		};

		this.socket.onmessage = ev => {
			var msg = JSON.parse(ev.data);
			crosstab.broadcast("socket.message", msg);
		};
	}
}

function closeSocket() {
	if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		this.socket.close();
	}
}
