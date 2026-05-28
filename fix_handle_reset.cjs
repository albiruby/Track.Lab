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

  if (content.includes('onClick={handleReset}') && !content.includes('handleReset = ()')) {
    // just inject handleReset = () => { window.location.reload(); } after the states
    const injectPoint = /const \[[^\]]+\] = useState[^;]+;/g;
    let match;
    let lastIndex = -1;
    while ((match = injectPoint.exec(content)) !== null) {
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + '\n\n  const handleReset = () => { window.location.reload(); };' + content.substring(lastIndex);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added handleReset to', file);
  }
});
