function deepCopyMatrix(matrix) {
	const copy = [];
	for (const row of matrix) {
		copy.push([...row]);
	}
	return copy;
}


function floydWarshall(graph) {
	const keyList = Object.keys(graph);
	const n = keyList.length;

	const indexMap = {};
	keyList.forEach((key, idx) => {
		indexMap[key] = idx;
	});

	const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
	const pi = Array.from({ length: n }, () => Array(n).fill("."));

	keyList.forEach((v) => {
		const vIndex = indexMap[v];
		const edges = graph[v];

		for (const [u, w] of Object.entries(edges)) {
			const uIndex = indexMap[u];
			dist[vIndex][uIndex] = w;
			pi[vIndex][uIndex] = v;
		}

		dist[vIndex][vIndex] = 0;
	});

	const distSteps = [deepCopyMatrix(dist)];
	const piSteps = [deepCopyMatrix(pi)];
	const updateCell = {};

	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (dist[i][j] > dist[i][k] + dist[k][j]) {
					dist[i][j] = dist[i][k] + dist[k][j];
					pi[i][j] = pi[k][j];

					if (!(k + 1 in updateCell)) updateCell[k + 1] = [];
					updateCell[k + 1].push([i + 1, j + 1]);
				}
			}
		}

		distSteps.push(deepCopyMatrix(dist));
		piSteps.push(deepCopyMatrix(pi));
	}

	return {
		distSteps,
		piSteps,
		updateCell,
		keyList
	};
}


function createMatrixTable(matrix, updated = [], keyList = []) {
	const size = matrix.length;
	let html = '<table><tr><th class="label"></th>';

	// Column headers
	for (let i = 0; i < size; i++) {
		const label = keyList[i] ?? (i + 1);
		html += `<th class="label">${label}</th>`;
	}
	html += '</tr>';

	// Rows
	for (let i = 0; i < size; i++) {
		const rowLabel = keyList[i] ?? (i + 1);
		html += `<tr><th class="label">${rowLabel}</th>`;

		for (let j = 0; j < size; j++) {
			const highlight = updated.some(([r, c]) => r - 1 === i && c - 1 === j);
			const raw = matrix[i][j] === Infinity ? '∞' : matrix[i][j];
			const value = String(raw).padStart(3, ' ');		
			html += `<td${highlight ? ' class="highlight"' : ''}>${value}</td>`;
		}

		html += '</tr>';
	}

	html += '</table>';
	return html;
}
function render_floydWarshall(distance_matrices, pi_matrices, update_cells, keyList = []) {
	const container = document.getElementById("floydWarshall-container");
	container.innerHTML = '';

	// Create two columns
	const leftPanel = document.createElement('div');
	const rightPanel = document.createElement('div');

	leftPanel.className = 'fw-panel';
	rightPanel.className = 'fw-panel';

	// DISTANCE MATRICES
	const distHeader = document.createElement('h2');
	distHeader.textContent = 'Distance Matrices';
	leftPanel.appendChild(distHeader);

	for (let step = 0; step < distance_matrices.length; step++) {
		const updates = update_cells[step] || [];
		const distTitle = document.createElement('h3');
		distTitle.textContent = `Step ${step}`;
		leftPanel.appendChild(distTitle);
		leftPanel.innerHTML += createMatrixTable(distance_matrices[step], updates, keyList);
	}

	// PI MATRICES
	const piHeader = document.createElement('h2');
	piHeader.textContent = 'Pi Matrices';
	rightPanel.appendChild(piHeader);

	for (let step = 0; step < pi_matrices.length; step++) {
		const updates = update_cells[step] || [];
		const piTitle = document.createElement('h3');
		piTitle.textContent = `Step ${step}`;
		rightPanel.appendChild(piTitle);
		rightPanel.innerHTML += createMatrixTable(pi_matrices[step], updates, keyList);
	}

	// Append panels
	container.appendChild(leftPanel);
	container.appendChild(rightPanel);
}
function render_floydWarshall_empty() {
	const container = document.getElementById("floydWarshall-container");
	container.innerHTML = '<p>Graph is empty</p>';
}

// Register general callback
window.onGraphUpdated = function (graph) {
	// check if graph is empty
	if (Object.keys(graph).length === 0) {
		render_floydWarshall_empty();
		return;
	}
	console.log(graph);
	const { distSteps, piSteps, updateCell, keyList } = floydWarshall(graph);

	render_floydWarshall(distSteps, piSteps, updateCell, keyList);
};