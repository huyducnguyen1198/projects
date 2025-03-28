let nodes = [];
let matrix = [];

window.getGraphAsDict = function getGraphAsDict() {
	const adj_list = {};

	nodes.forEach((fromNode, i) => {
		adj_list[fromNode] = {};
		nodes.forEach((toNode, j) => {
			const weight = matrix[i][j];
			if (weight !== Infinity && weight !== 0) {
				adj_list[fromNode][toNode] = weight;
			}
		});
	});

	return { nodes, adj_list };//nodes is matrix of nodes and graph is adjacency list
}
function trigger_outside() {
	if (typeof window.onGraphUpdated === "function") {
		const graph = getGraphAsDict();
		window.onGraphUpdated(graph.adj_list);
	}
}

function renderGraph() {
	const nodesData = nodes.map((name, index) => ({ id: index, label: name }));

	const edgesData = [];
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			const weight = matrix[i][j];
			if (weight !== Infinity && weight !== 0) {
				edgesData.push({
					from: i,
					to: j,
					label: weight.toString(),
					arrows: "to",
				});
			}
		}
	}

	const container = document.getElementById("mynetwork");
	const data = {
		nodes: new vis.DataSet(nodesData),
		edges: new vis.DataSet(edgesData),
	};

	const options = {
		layout: {
			improvedLayout: true,
		},
		physics: {
			enabled: true,
		},
	};


	new vis.Network(container, data, options);


}
function updateNodeLabels() {
	const nodeListEl = document.getElementById("nodeLabels");
	nodeListEl.innerHTML = "";

	nodes.forEach((node, index) => {
		const button = document.createElement("button");
		button.textContent = node;
		button.style.margin = "5px";
		button.style.padding = "4px 8px";
		button.style.border = "1px solid #aaa";
		button.style.borderRadius = "5px";
		button.style.backgroundColor = "#444";
		button.style.color = "#fff";
		button.style.cursor = "pointer";

		button.addEventListener("click", () => {
			if (confirm(`Remove node "${node}" and all its edges?`)) {
				nodes.splice(index, 1);
				matrix.splice(index, 1);
				matrix.forEach(row => row.splice(index, 1));
				render_all();
			}
		});

		nodeListEl.appendChild(button);
	});

	// Add "Clear All" button if more than 1 node
	const clearContainer = document.getElementById("clearAllContainer");
	clearContainer.innerHTML = "";
	if (nodes.length > 1) {
		const clearButton = document.createElement("button");
		clearButton.textContent = "Clear All";
		clearButton.style.marginTop = "10px";
		clearButton.style.padding = "6px 12px";
		clearButton.style.backgroundColor = "#aa3333";
		clearButton.style.color = "#fff";
		clearButton.style.border = "none";
		clearButton.style.borderRadius = "6px";
		clearButton.style.cursor = "pointer";

		clearButton.addEventListener("click", () => {
			if (confirm("Are you sure you want to clear all nodes and reset the graph?")) {
				nodes = [];
				matrix = [];
				render_all();
			}
		});

		clearContainer.appendChild(clearButton);
	}
}


function createMatrixTable() {
	const table = document.getElementById("matrixTable");
	table.innerHTML = "";
	if (nodes.length === 0) {
		return;
	}
	const headerRow = document.createElement("tr");
	headerRow.appendChild(document.createElement("th")); // Empty top-left cell

	nodes.forEach((node) => {
		const th = document.createElement("th");
		th.textContent = node;
		headerRow.appendChild(th);
	});
	table.appendChild(headerRow);

	nodes.forEach((rowNode, i) => {
		const row = document.createElement("tr");
		const rowHeader = document.createElement("th");
		rowHeader.textContent = rowNode;
		row.appendChild(rowHeader);

		nodes.forEach((_, j) => {
			const cell = document.createElement("td");
			const input = document.createElement("input");
			input.type = "number";
			input.value = matrix[i][j];
			input.style.width = "50px";

			input.addEventListener("change", () => {
				matrix[i][j] = parseInt(input.value);
				render_all();
			});

			cell.appendChild(input);
			row.appendChild(cell);
		});

		table.appendChild(row);

		// return table;
	});

}
function render_all() {
	updateNodeLabels();
	createMatrixTable();
	renderGraph();
	trigger_outside();

}
function addNode() {
	const nodeInput = document.getElementById("newNode");
	const nodeName = nodeInput.value.trim();

	// if more tahn 6 nodes refuse to add
	if (nodes.length >= 6) {
		alert("Maximum 6 nodes allowed.");
		return;
	}

	if (!nodeName || nodes.includes(nodeName)) {
		alert("Enter a unique node name.");
		return;
	}

	nodes.push(nodeName);

	// Expand matrix
	matrix.forEach((row) => row.push(Infinity));
	matrix.push(new Array(nodes.length).fill(Infinity));

	render_all();
	nodeInput.value = "";
}

//Default
// Setup default graph
nodes = [1, 2, 3, 4].map(String); // ensure they're strings like "1", "2", "3", "4"
matrix = new Array(nodes.length).fill().map(() => new Array(nodes.length).fill(Infinity));

const indexMap = {};
nodes.forEach((node, idx) => {
	indexMap[node] = idx;
});

const defaultGraph = {
    1: [[2, 2], [3, 5]],
    2: [[3, 1]],
    3: [[4, 3]],
    4: [[1, 4]]
};

for (const [from, edges] of Object.entries(defaultGraph)) {
	const i = indexMap[from];
	edges.forEach(([to, weight]) => {
		const j = indexMap[to.toString()];
		matrix[i][j] = weight;
	});
}



window.onload = function () {
	document.getElementById("addButton").addEventListener("click", addNode);
	render_all();
};

window.onload = function () {
	document.getElementById("addButton").addEventListener("click", addNode);

	// Pressing Enter will trigger the addNode function
	document.getElementById("newNode").addEventListener("keydown", function (e) {
		if (e.key === "Enter") {
			addNode();
		}
	});

	render_all();
};


// General hook for any algorithm that listens to graph updates
