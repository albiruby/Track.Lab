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

const files = walkSync('./src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/>COMPUTE [A-Z&\- ]*</g, '>Calculate<');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced COMPUTE in ${file}`);
  }
});
