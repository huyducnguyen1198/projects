
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


export function dijkstra(graph, start) {
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
