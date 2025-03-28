import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, '../public/source');


import { basePath } from '../vite.config.js';

// Get all folders
const folders = fs.readdirSync(sourcePath).filter(name =>
	fs.statSync(path.join(sourcePath, name)).isDirectory()
);

// Save folder list
fs.writeFileSync(
	path.join(sourcePath, 'index.json'),
	JSON.stringify(folders, null, 2)
);

// For each folder
// 1. create a JSON file with list of HTML files
// 2. create an index.html file to redirect to /projects/?folder=FOLDER_NAME
folders.forEach(folder => {
	const folderPath = path.join(sourcePath, folder);

	// Get list of HTML files (excluding index.html)
	const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html') && f !== 'index.html');

	// Save JSON list of HTML files
	fs.writeFileSync(
		path.join(sourcePath, `${folder}.json`),
		JSON.stringify(htmlFiles, null, 2)
	);

	// Create index.html to redirect to /{basePath}/?folder=FOLDER_NAME
	const indexFileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Redirecting...</title>
  <script>
    window.location.href = "${basePath}?folder=${folder}";
  </script>
</head>
<body>
  <p>Redirecting to folder view...</p>
</body>
</html>
`;
	fs.writeFileSync(
		path.join(folderPath, 'index.html'),
		indexFileContent
	);
});