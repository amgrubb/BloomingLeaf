/**
 * Set up Ctrl+c and Ctrl+v shortcut for macOS
 *  
 */
var clipboard = new joint.ui.Clipboard();
// Check if the browser is on Mac
var macOS = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
if(macOS) {
	KeyboardJS.on('command + c, ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('command + v, ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

} else {

	KeyboardJS.on('ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(selection, graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('ctrl + v', function() {
		clipboard.pasteCells(graph);

		selectionView.cancelSelection();

		clipboard.pasteCells(graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			selection.add(graph.get('cells').get(cell.id));
		});

		selection.each(function(cell) {
		selectionView.createSelectionBox(paper.findViewByModel(cell));
		});
	});

}