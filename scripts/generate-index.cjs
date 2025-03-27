const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../public/source');

// Get all folders
const folders = fs.readdirSync(sourcePath).filter(name =>
  fs.statSync(path.join(sourcePath, name)).isDirectory()
);

// Save folder list
fs.writeFileSync(
  path.join(sourcePath, 'index.json'),
  JSON.stringify(folders, null, 2)
);

// For each folder, create a json list of html files
folders.forEach(folder => {
  const folderPath = path.join(sourcePath, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.html') && f !== 'index.html');
  fs.writeFileSync(
    path.join(sourcePath, `${folder}.json`),
    JSON.stringify(files, null, 2)
  );
});