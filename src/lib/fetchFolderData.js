export async function fetchFolderData(folder) {
	if (folder) {
	  const [fileListRes, headerRes] = await Promise.all([
		fetch(`/source/${folder}.json`),
		fetch(`/source/${folder}/header.txt`)
	  ]);
	  const items = await fileListRes.json();
	  const header = await headerRes.text();
	  return { items, header, isSubfolder: true };
	} else {
	  const fileListRes = await fetch('/source/index.json');
	  const items = await fileListRes.json();
	  const header = `Welcome! I'm Huy — A Data Scientist That is learning stuff. Here I will post some little project I have learnt along the way. ✨`;
	  return { items, header, isSubfolder: false };
	}
  }