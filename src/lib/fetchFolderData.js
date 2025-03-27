  export async function fetchFolderData(folder) {
	if (folder) {
	  const [fileListRes, headerRes] = await Promise.all([
		fetch(`./source/${folder}.json`),
		fetch(`./source/${folder}/header.txt`)
	  ]);
	  const items = await fileListRes.json();
	  const header = await headerRes.text();
	  return { items, header, isSubfolder: true };
	} else {
	  const fileListRes = await fetch('./source/index.json');
	  const items = await fileListRes.json();
  
	  // ✅ Hardcoded homepage header message
	  const header = `Hi, I’m Huy — a curious learner on the path to becoming a better data scientist. This space is where I share small projects and experiments as I grow and explore new things. Thanks for stopping by `;
  
	  return { items, header, isSubfolder: false };
	}
  }