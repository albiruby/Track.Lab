const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (file.endsWith('.tsx')) {
         filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const files = walkSync('./src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find <CardTitle>XXX</CardTitle> and make XXX title case
  content = content.replace(/<CardTitle>([^<]+)<\/CardTitle>/g, (match, p1) => {
    // Only convert if it's all uppercase or mostly uppercase (excluding spaces/symbols)
    if (p1 === p1.toUpperCase() && p1.length > 3) {
      if (p1 === 'COMPUTED OUTPUT') return `<CardTitle>Results</CardTitle>`;
      return `<CardTitle>${toTitleCase(p1)}</CardTitle>`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Title-cased in ${file}`);
  }
});
