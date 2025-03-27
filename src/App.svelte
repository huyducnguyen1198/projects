<script>
  import { onMount } from 'svelte';
  import { fetchFolderData } from './lib/fetchFolderData.js';
  import { formatName } from './lib/formatters.js';

  let folder = '';
  let isSubfolder = false;
  let items = [];
  let headerMessage = '';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    folder = params.get('folder');
    
    const data = await fetchFolderData(folder);
    items = data.items;
    headerMessage = data.header;
    isSubfolder = data.isSubfolder;
  });
</script>


<header class="global-header">
  <div class="header-box">
    <h1>{isSubfolder ? formatName(folder) : "My Project Board"}</h1>
    <p>{headerMessage}</p>
  </div>
</header>


<main class="wrapper">
  <div class="note-container">
    {#each items as item}
      <a
        href={isSubfolder ? `/source/${folder}/${item}` : `/?folder=${item}`}
        class="note"
        target={isSubfolder ? "_blank" : "_self"}
      >
        <div class="title">{formatName(item)}</div>
        <div class="desc">{isSubfolder ? "Open file" : "View projects"}</div>
      </a>
    {/each}
  </div>
</main>


<style>
.global-header {
  width: 80vw;
  max-width: 1000px;
  margin: 2rem auto 1rem;
  font-family: system-ui, sans-serif;
}

.global-header h1 {
	font-size: 2rem;
	font-weight: 700;
	margin-bottom: 0.5rem;
	}

.global-header p {
	font-size: 1rem;
	color: #555;
	max-width: 600px;
	margin: 0 auto;
	line-height: 1.4;
	}

.header-box {
	background: #fffdf2;
	border: 1px solid #f5eec3;
	border-radius: 12px;
	padding: 1.5rem 2rem;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	text-align: center;
	}

	.header-box h1 {
	font-size: 1.75rem;
	font-weight: 700;
	margin-bottom: 0.5rem;
	color: #333;
	}

	.header-box p {
	font-size: 1rem;
	color: #555;
	line-height: 1.5;
	max-width: 600px;
	margin: 0 auto;
	}
.wrapper {
	width: 80vw;
	max-width: 1000px;
	margin: 2rem auto;
	padding: 1rem;
	background: #fefce8;
	min-height: 100vh;
	font-family: system-ui, sans-serif;
	border-radius: 12px;

	display: flex;
	justify-content: center;
	}
	.note-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;

		width: auto;              /* it shrinks/grows based on content */
		max-width: 100%;          /* won’t overflow wrapper */
		}
  .note {
		background: #fff9c4;
		width: 160px;
		height: 160px;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
		transform: rotate(-1.5deg);
		text-decoration: none;
		color: #333;
		transition: transform 0.2s ease;
		position: relative;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		box-sizing: border-box;
		gap: 0.4rem;
		}

	.note:hover {
	transform: rotate(0deg) scale(1.05);
	z-index: 2;
	}

	.note::after {
		content: '';
		position: absolute;
		width: 30px;
		height: 20px;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		background: #ffeb3b;
		border-radius: 4px;
		box-shadow: 0 0 3px rgba(0,0,0,0.2);
		}

	.title {
		font-weight: bold;
		font-size: 1rem;
		text-transform: capitalize;
		word-break: break-word;
		line-height: 1.2;
		max-width: 100%;
		}

		.desc {
		font-size: 0.75rem;
		color: #666;
		line-height: 1.1;
		}
</style>