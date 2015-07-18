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
	});

	afterEach(function() {
		crosstab.broadcast.restore();
		crosstab.on.restore();
	});
}
