<script>
	import { createEventDispatcher, onMount } from "svelte";
	import { DataSet, Network } from "vis-network";

	export let graph = {};
	export let showNetwork = false;
	const dispatch = createEventDispatcher();

	let nodeList = [];
	let newNodeLabel = "";
	let nodes = new DataSet([]);
	let edges = new DataSet([]);
	let graphContainer;

	function updateNodeList() {
		nodeList = Object.keys(graph);
	}

	function addNode() {
		const newId = newNodeLabel.trim();
		if (!newId || graph[newId]) return;
		graph[newId] = [];
		updateNodeList();
		newNodeLabel = "";
		dispatch("update", graph);
		if (showNetwork) updateVisNetwork();
	}

	function updateWeight(from, to, value) {
		let weight = parseFloat(value);
		if (isNaN(weight)) return;

		graph[from] = graph[from].filter(([t]) => t !== to);
		if (weight > 0) graph[from].push([to, weight]);
		dispatch("update", graph);
		if (showNetwork) updateVisNetwork();
	}

	function updateVisNetwork() {
		const nodeIds = Object.keys(graph);
		const edgeList = [];
		nodes.clear();
		edges.clear();
		nodeIds.forEach((id) => {
			nodes.add({ id: id, label: String(id) });
			graph[id].forEach(([to, weight]) => {
				edgeList.push({
					from: id,
					to: to,
					label: String(weight),
					arrows: "to",
				});
			});
		});
		edges.add(edgeList);
	}

	onMount(() => {
		updateNodeList();
		if (showNetwork) {
			const data = { nodes, edges };
			const options = {
				layout: { improvedLayout: true },
				physics: false,
			};
			new Network(graphContainer, data, options);
			updateVisNetwork();
		}
	});
</script>

<div style="margin-bottom: 1rem;">
	<input placeholder="New node label" bind:value={newNodeLabel} />
	<button on:click={addNode}>Add Node</button>
</div>
<table border="1">
	<thead>
		<tr>
			<th></th>
			{#each nodeList as col}
				<th>{col}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each nodeList as row}
			<tr>
				<th>{row}</th>
				{#each nodeList as col}
					<td>
						<input
							type="number"
							min="0"
							value={(() => {
								const edge = graph[row]?.find(
									([t]) => t == col,
								);
								return edge ? edge[1] : "";
							})()}
							on:change={(e) =>
								updateWeight(
									row,
									col,
									e.target instanceof HTMLInputElement
										? e.target.value
										: "",
								)}
							style="width: 50px"
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
{#if showNetwork}
	<div
		bind:this={graphContainer}
		style="height: 400px; border: 1px solid #ccc; margin-top: 1rem;"
	></div>
{/if}
