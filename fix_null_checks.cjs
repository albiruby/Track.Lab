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

  // fix pacing > 0 type error
  if (content.includes('pacing > 0')) {
     content = content.replace(/pacing > 0/g, 'pacing !== null && pacing > 0');
  }
  
  if (content.includes('secs > 0')) {
    content = content.replace(/secs > 0/g, 'secs !== null && secs > 0');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed typescript TSObject is possibly null in', file);
  }
});
