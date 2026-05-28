const fs = require('fs');
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = require('path').join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (file.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes('<ValidationMessage message={error} />') && !content.includes('const [error, setError] =')) {
    // find first useState and insert error there
    const m = content.match(/const \[.*\] = useState/);
    if (m) {
      content = content.replace(m[0], 'const [error, setError] = useState<string | null>(null);\n  ' + m[0]);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added error state to', file);
  }
});
