// === Global Variables ===
let distances = {};
let steps = {};
let orderList = [];
let original_edge_weights = {};
let pathOptions = {};
let nodesDS = null;
let edgesDS = null;
let network = null;
let stepIndex = 0;
let pathChosen = false;
let startNode = null;
let nodes = [];
let edges = [];
let edgePrep = {};
let initial_distances = {};
let graph = {};


let runButton = null;
let prevButton = null;
let nextButton = null;
let vis_container = null;
let d_container = null;
let select = null;
let pathButtonsDiv = null;
class PriorityQueue {
	constructor() {
		this.items = [];
	}

	// Add an element to the queue with a priority
	enqueue(data, priority) {
		this.items.push({ data, priority });
		this.items.sort((a, b) => a.priority - b.priority); // Sort by priority (lowest priority first)
	}

	// Remove and return the element with the highest priority (lowest priority value)
	dequeue() {
		return this.items.shift(); // Remove the first element
	}

	// Check if the queue is empty
	isEmpty() {
		return this.items.length === 0;
	}
}


function dijkstra(graph, start) {
	const nodes = new Set(Object.keys(graph));
	const distances = {};
	const previous = {};
	const queue = new PriorityQueue();

	// Initialize the distances and previous object
	nodes.forEach((node) => {
		distances[node] = node === start ? 0 : Infinity;
		queue.enqueue(node, distances[node]);
	});

	// array of steps
	const steps = {};
	// each step has a from [(to, fromDistance, weight, toDistance_before, is_updated, toDistance_after = fromDistance + weight(no need to store)),
	// (to, fromDistance, weight, toDistance_before, is_updated, toDistance_after = fromDistance + weight(no need to store)), ...]


	// Loop as long as there are nodes to visit
	let orderList = [];
	while (!queue.isEmpty()) {
		const smallest = queue.dequeue();
		const smallestNode = smallest.data;
		const smallestDistance = smallest.priority;

		// If the smallest distance is Infinity, then we are done
		if (smallestDistance > distances[smallestNode]) {
			continue;
		}


		// For each neighbor of the current node
		const neighbors = graph[smallestNode];
		let cur_step = [];
		for (const neighbor of Object.keys(neighbors)) {

			const neighborWeight = neighbors[neighbor];
			const new_distance = smallestDistance + neighborWeight;
			const old_distance = distances[neighbor];
			const is_relaxed = new_distance < old_distance;

			console.log(`Relaxing edge from ${smallestNode} to ${neighbor} with weight ${neighborWeight}`);
			cur_step.push([neighbor, distances[smallestNode], neighborWeight, distances[neighbor], is_relaxed]);

			if (is_relaxed) {
				// Update the distance and previous node
				distances[neighbor] = new_distance;
				previous[neighbor] = smallestNode;
				queue.enqueue(neighbor, new_distance);
			}

		};
		orderList.push(smallestNode);
		steps[smallestNode] = cur_step;


	}

	let dict_paths = {};
	for (const node of nodes) {
		let path = [];
		let cur = node;
		if (!(node in previous)) {
			continue;
		}
		while (cur !== start) {
			path.push(cur);
			cur = previous[cur];
		}
		path.push(start);
		path.reverse();
		dict_paths[node] = path;
	}
	// console.log(dict_paths);

	return {
		"distances": distances,
		"predecessors": previous,
		"steps": steps,
		"orderList": orderList,
		"dict_paths": dict_paths
	}
}

function createDijkstraInterface() {
	/*
		the outer container is the dijkstra-section
		then create select dropdown
		then create run button

		then create a div for the visualization called vis-container

		inside the vis-container, 
		1. create a div for the dijkstra-container for the visualization
		2. create a button for previous step and next step
		3. create a div for the path buttons
		4. add the dijkstra-container, previous step button, next step button, and path buttons to the vis-container
		
		add the vis-container to the dijkstra-section
	*/

	const container = document.getElementById("dijkstra-section");
	container.innerHTML = "";

	select = document.createElement("select");
	select.id = "start-node-select";
	for (const node of Object.keys(graph)) {
		const option = document.createElement("option");
		option.value = node;
		option.textContent = node;
		select.appendChild(option);
	}

	runButton = document.createElement("button");


	container.appendChild(select);
	container.appendChild(runButton);


	// Create a div for the visualization

	const vis_container = document.createElement("div");
	vis_container.id = "vis-container";
	container.appendChild(vis_container);


	runButton.textContent = "Run";
	runButton.onclick = () => {

		if (graph === null || Object.keys(graph).length === 0) {
			alert("Please generate a graph first.");
			return;
		}
		// *********************************
		// Clear the previous visualization //
		// *********************************
		vis_container.innerHTML = "";
	

		// Create a new div for the visualization

		d_container = document.createElement("div");
		d_container.id = "dijkstra-container";
	
	
	

		// Add step buttons
		prevButton = document.createElement("button");
		prevButton.textContent = "Previous Step";
		prevButton.onclick = prevStep;
	
		nextButton = document.createElement("button");
		nextButton.textContent = "Next Step";
		nextButton.onclick = nextStep;
	
	
	
		// Add path buttons container
		pathButtonsDiv = document.createElement("div");
		pathButtonsDiv.id = "path-buttons";
		pathButtonsDiv.style.marginTop = "20px";
	
		// add to vis_container
		vis_container.appendChild(d_container);
		vis_container.appendChild(prevButton);
		vis_container.appendChild(nextButton);
		vis_container.appendChild(pathButtonsDiv);

		vis_container.scrollIntoView({ behavior: "smooth", block: "start" });

		// **************************
		// Run Dijkstra's Algorithm //
		// process the graph
		const start = select.value;
		startNode = start;
		const result = dijkstra(graph, start);
		// reuslt is a dict with distances, predecessors, steps, orderList
		distances = result.distances;
		steps = result.steps;
		orderList = result.orderList;


		// **************************
		// Prepare the visualization
		// **************************
		/*
			1. create a set of all nodes (nodeSet)
			2. create a dict of all distances (initial_distances) it is initialized to infinity except for the start node with 0
			3. create a list of nodes (nodes) with id and label
			4. create a list of edges (edges) with id, from, to, label, arrows, color
			     - id is the edge id hash the format: from-to. ie: 0-1
			5. create a dict of original weights (original_edge_weights) for the edges, shortest path from start to each node
			6. create a dict of path options (pathOptions) for the edges, shortest path from start to each node
			     - in form of edge id: from-to ie 	: 0-1
			7. create a DataSet for nodes and edges
			8. create a network with the DataSet and options
		*/



		// set of all nodes
		const nodeSet = prepareNodeSet(graph);

		// initial distances infinity (step 0)
		initial_distances = prepareInitialDistances(nodeSet);

		// the text for the nodes
		nodes = prepareNodes(nodeSet);

		// the text for the edges
		edgePrep = prepareEdges(graph);
		edges = edgePrep.edges;


		// original weights for the edges
		original_edge_weights = edgePrep.originalWeights;
		pathOptions = preparePathOptions(result.dict_paths, startNode);

		nodesDS = new vis.DataSet(nodes);
		edgesDS = new vis.DataSet(edges);

		network = new vis.Network(document.getElementById("dijkstra-container"), { nodes: nodesDS, edges: edgesDS }, { physics: false });
	

		stepIndex = 0;
		pathChosen = false;

		nodesDS.update({ id: startNode, color: '#FF0000', label: `${startNode} - 0` });
		distances[startNode] = 0;
	};


}

window.onGraphUpdated = function (vis_graph) {

	if (Object.keys(vis_graph).length === 0) {
		graph = {};

		//remove the d-container
		if (d_container) {
			d_container.remove();
			d_container = null;

			//remove the path buttons
			if (pathButtonsDiv) {
				pathButtonsDiv.innerHTML = "";
			}

			//remove the step buttons
			if (prevButton) {
				prevButton.remove();
				prevButton = null;
			}
			if (nextButton) {
				nextButton.remove();
				nextButton = null;
			}
			if (select) {
				select.remove();
				select = null;
			}
			if (runButton) {
				runButton.remove();
				runButton = null;
			}
		}
		return;
	}
	graph = vis_graph;

	createDijkstraInterface();

};

// === Dijkstra's Algorithm Visualization ===
// This function is called when the graph is updated

// === Animation Preparation ===
function prepareNodeSet(graph) {
	const nodeSet = new Set(Object.keys(graph));
	for (const neighbors of Object.values(graph)) {
		for (const v of Object.keys(neighbors)) {
			nodeSet.add(v);
		}
	}
	return nodeSet;
}

function prepareInitialDistances(nodeSet) {
	const dist = {};
	for (const node of nodeSet) {
		dist[node] = Infinity;
	}
	return dist;
}

function prepareNodes(nodeSet) {
	return Array.from(nodeSet).sort().map(node => ({
		id: node,
		label: node !== startNode ? `${node} - ∞` : `${node} - 0`,
		color: '#97C2FC'
	}));
}

function prepareEdges(graph) {
	const edges = [];
	const originalWeights = {};
	for (const [u, neighbors] of Object.entries(graph)) {
		for (const [v, w] of Object.entries(neighbors)) {
			const edgeId = `${u}-${v}`;
			edges.push({
				id: edgeId,
				from: u,
				to: v,
				label: `${w}`,
				arrows: 'to',
				color: { color: '#848484' }
			});
			originalWeights[edgeId] = w;
		}
	}
	return { edges, originalWeights };
}

function preparePathOptions(pathsDict, startNode) {
	const pathOptions = {};
	for (const [target, fullPath] of Object.entries(pathsDict)) {
		if (fullPath[0] !== startNode || fullPath[fullPath.length - 1] !== target) continue;
		const pathName = `${startNode} → ${target}`;
		const edgeList = [];
		for (let i = 0; i < fullPath.length - 1; i++) {
			edgeList.push(`${fullPath[i]}-${fullPath[i + 1]}`);
		}
		pathOptions[pathName] = edgeList;
	}
	return pathOptions;
}

function resetColorsAndLabels(nodesDS, edgesDS, distances, startNode, original_edge_weights) {
	nodesDS.forEach(n => {
		const dist = distances[n.id];
		const label = dist === Infinity ? `${n.id} - ∞` : `${n.id} - ${dist}`;
		const color = n.id === startNode ? '#FF0000' : '#97C2FC';
		nodesDS.update({ id: n.id, color, label });
	});
	edgesDS.forEach(e => {
		const w = original_edge_weights[e.id];
		edgesDS.update({
			id: e.id,
			color: { color: '#848484' },
			label: `${w}`,
			width: 1
		});
	});
}

function applyStep(index, orderList, steps, nodesDS, edgesDS, distances, startNode, original_edge_weights) {
	if (index < 0 || index >= orderList.length) return;

	resetColorsAndLabels(nodesDS, edgesDS, distances, startNode, original_edge_weights);
	const from = orderList[index];
	const step = steps[from];
	if (from !== startNode) {
		nodesDS.update({ id: from, color: '#FFD700' });
	}


	for (const data of step) {
		const [to, fromDist, weight, toDist, isUpdated] = data;
		const newDist = fromDist + weight;
		const edgeId = `${from}-${to}`;

		nodesDS.update({ id: to, color: '#ADD8E6' });

		let edgeLabel = `${weight}`;
		if (fromDist !== Infinity) {
			edgeLabel = `${fromDist}+${weight}=${newDist}`;
		}

		edgesDS.update({
			id: edgeId,
			color: { color: 'red' },
			label: edgeLabel
		});

		if (isUpdated) {
			distances[to] = newDist;
			nodesDS.update({
				id: to,
				color: '#32CD32',
				label: `${to} - ${newDist}`
			});
		}
	};
}


function prevStep() {
	pathChosen = false;
	const pathButtons = document.getElementById("path-buttons");
	if (pathButtons) pathButtons.innerHTML = "";

	stepIndex = Math.max(0, stepIndex - 1);
	console.log("Step Index:", stepIndex);

	// If stepIndex becomes 0, going back one more means full reset
	if (stepIndex === 0) {
		const nodeSet = prepareNodeSet(nodesDS.getIds().reduce((acc, id) => {
			acc[id] = {}; return acc;
		}, {}));
		distances = prepareInitialDistances(nodeSet);
		resetColorsAndLabels(nodesDS, edgesDS, distances, startNode, original_edge_weights);
		return;
	}

	// Reset distances
	const nodeSet = prepareNodeSet(nodesDS.getIds().reduce((acc, id) => {
		acc[id] = {}; return acc;
	}, {}));
	distances = prepareInitialDistances(nodeSet);

	// Re-apply all steps up to the one before this
	for (let i = 0; i < stepIndex; i++) {
		const from = orderList[i];
		const step = steps[from];
		step.forEach(([to, fromDist, weight, toDist, isUpdated]) => {
			if (isUpdated) distances[to] = fromDist + weight;
		});
	}

	applyStep(stepIndex - 1, orderList, steps, nodesDS, edgesDS, distances, startNode, original_edge_weights);
}

function nextStep() {
	{
		if (stepIndex >= orderList.length) return;
		applyStep(stepIndex, orderList, steps, nodesDS, edgesDS, distances, startNode, original_edge_weights);
		stepIndex++;

		if (stepIndex === orderList.length) {
			{
				// show correct distances
				resetColorsAndLabels(nodesDS, edgesDS, distances, startNode, original_edge_weights);


				showPathOptions(pathOptions, "path-buttons", edgesDS);
			}
		}
	}
}

function showPathOptions(pathOptions, containerId, edgesDS) {
	const container = document.getElementById(containerId);


	container.innerHTML = "<h3>Choose a Final Path:</h3>";
	for (const pathName in pathOptions) {
		const btn = document.createElement("button");
		btn.textContent = pathName;
		btn.onclick = () => {
			highlightPath(pathName, pathOptions, edgesDS);
		};
		container.appendChild(btn);
	}
	container.scrollIntoView({ behavior: "smooth", block: "start" });
}

function highlightPath(pathName, pathOptions, edgesDS) {
	const edgeList = pathOptions[pathName];

	// Reset all edges to original color
	edgesDS.forEach(edge => {
		edgesDS.update({
			id: edge.id,
			color: { color: '#848484' },
			width: 1
		});
	});

	edgeList.forEach(edgeId => {
		
			edgesDS.update({
				id: edgeId,
				color: { color: 'blue' },
				width: 3
			});
	
	});
}