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

  // 1. Add noValidate to forms
  content = content.replace(/<form onSubmit={([^}]+)} className="([^"]+)">/g, `<form onSubmit={$1} className="$2" noValidate>`);
  
  // 1b. Just in case...
  content = content.replace(/<form onSubmit=\{([^}]+)\} className="([^"]+)">/g, `<form onSubmit={$1} className="$2" noValidate>`);

  // 2. Remove pattern attribute
  content = content.replace(/\spattern="[^"]*"/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated form logic in ${file}`);
  }
});
