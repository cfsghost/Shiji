import events from 'events';
import treeOperator from './TreeOperator';
import Cursor from './Cursor';
import Utils from './Utils';

class Selection extends events.EventEmitter {

	constructor() {
		super();

		this.id = Utils.generateId();
		this.styles = {
			background: '#cceeff'
		};
		this.cursors = [];
	}

	createCursor(ctx, prototype) {

		// Create cursor
		var newCursor = new Cursor(ctx.renderer);

		if (prototype.startNode) {
			var startNode = ctx.documentTree.getNodeById(prototype.startNode);
			newCursor.setStart(startNode, prototype.startOffset || 0);
		}

		if (prototype.endNode) {
			var endNode = ctx.documentTree.getNodeById(prototype.endNode);
			newCursor.setEnd(endNode, prototype.endOffset || 0);
		}

		newCursor.update();
		newCursor.show();

		// Add to selection
		this.addCursor(newCursor);
	}

	getCursorById(id) {
		return this.cursors.find((cursor) => {
			return (cursor.id == id);
		});
	}

	getAllCursors() {
		return this.cursors;
	}

	addCursor(cursor) {
		var index = this.cursors.indexOf(cursor);
		if (index != -1)
			return;

		cursor.nodeList = [];

		// Getting all nodes in range
		treeOperator.traverse(cursor.startNode, cursor.endNode, (node) => {
			cursor.nodeList.push(node);
		});

		this.cursors.push(cursor);

		this.emit('added', cursor);
	}

	removeAllCursors() {

		this.cursors.forEach((cursor) => {
			cursor.release();
		});

		this.cursors = [];
	}

	removeCursor(cursor) {
		var index = this.cursors.indexOf(cursor);
		if (index != -1)
			this.cursors.splice(index, 1);
	}

	update() {

		this.cursors.forEach((cursor) => {

			if (!cursor.ancestorNode)
				return;

			// Re-render component
			var task = cursor.ancestorNode.component.refresh();
			task.then(() => {
				// Do nothing
				this.emit('update');
			});
		});
	}
/*
	update() {
		this.cursors.forEach((cursor) => {
			treeOperator.traverse(cursor.startNode, cursor.endNode, function(node) {
				console.log(node);
			});
		});
	}
*/
}

export default Selection;
