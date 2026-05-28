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

  // regex to capture (t{1,2}s) > 0
  content = content.replace(/(t\ds?) > 0/g, '$1 !== null && $1 > 0');
  content = content.replace(/(a|max|rest|maxHr) > 0/g, '$1 !== null && $1 > 0');
  // Just blanket fix some obvious ones
  content = content.replace(/t1s > 0/g, 't1s !== null && t1s > 0');
  content = content.replace(/t2s > 0/g, 't2s !== null && t2s > 0');
  content = content.replace(/secs > 0/g, 'secs !== null && secs > 0');
  content = content.replace(/pacing > 0/g, 'pacing !== null && pacing > 0');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed typescript TSObject is possibly null in', file);
  }
});
