<script>
	import GraphMatrixEditor from '$lib/components/GraphInput.svelte';
	import { dijkstra } from '$lib/algorithms/dijkstra';
	
	let graph = {
	  1: [[2, 2], [3, 5]],
	  2: [[3, 1]],
	  3: [[4, 3]],
	  4: [[1, 4]]
	};
	console.log('Initial graph:', graph);
	let startId = 1;
	let result = dijkstra(graph, startId);
  
	function updateGraph(newGraph) {
	  graph = newGraph;
	  result = dijkstra(graph, startId);
	}
  </script>
  
  <h1>Dijkstra Algorithm</h1>
  
  <label>Start Node ID:
	<input type="number" bind:value={startId} min="1" on:change={() => updateGraph(graph)} />
  </label>
  
  <GraphMatrixEditor {graph} on:update={e => updateGraph(e.detail)} showNetwork={true} />
  
  <h3>Result from Node {startId}:</h3>
  <pre>{JSON.stringify(result, null, 2)}</pre>
  