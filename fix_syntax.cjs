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

  content = content.replace(/\} , safeNumber \} from/g, ", safeNumber } from");
  content = content.replace(/\}, safeNumber \} from/g, ", safeNumber } from");
  content = content.replace(/import \{ safeNumber \} from '@\/lib\/formatters\/time';\nimport \{ ([^}]+) \} from '@\/lib\/formatters\/time';/g, "import { $1, safeNumber } from '@/lib/formatters/time';");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax in', file);
  }
});
