const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (file.endsWith('.tsx') && dirFile.includes('src/app/')) {
         filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src/app');

files.forEach(file => {
  if (file.includes('page.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace parseTimeStringToSeconds -> parseDurationToSeconds
    content = content.replace(/parseTimeStringToSeconds/g, 'parseDurationToSeconds');
    
    // Auto import ValidationMessage and safeNumber
    if (content.includes('import { Input, Label, Button') && !content.includes('ValidationMessage')) {
      content = content.replace('import { Input, Label, Button }', 'import { Input, Label, Button, ValidationMessage }');
    }
    if (content.includes('Button, Select') && !content.includes('ValidationMessage')) {
       content = content.replace('Button, Select', 'Button, Select, ValidationMessage');
    }
    if (content.includes("from '@/lib/formatters/time'") && !content.includes('safeNumber')) {
      content = content.replace("from '@/lib/formatters/time'", ", safeNumber } from '@/lib/formatters/time'");
      content = content.replace("}, safeNumber", ", safeNumber");
    } else if (!content.includes("from '@/lib/formatters/time'") && content.includes('calculate')) {
      content = content.replace("import { calculate", "import { safeNumber } from '@/lib/formatters/time';\nimport { calculate");
    }

    // Add error state if not present
    if (content.includes('const [result, setResult]') && !content.includes('const [error, setError]')) {
      content = content.replace('const [result, setResult] = useState', 'const [error, setError] = useState<string | null>(null);\n  const [result, setResult] = useState');
    }

    // Wrap Calculate button with flex and add Reset
    const btnRegex = /(<Button type="submit"[^>]*>.*<\/Button>)/g;
    content = content.replace(btnRegex, (match) => {
      // Check if it already has Reset button nearby to avoid duplicates
      if (content.includes('onClick={handleReset}')) return match; 
      
      let modified = match.replace(/w-full/, 'flex-1').replace(/mt-\d/, ''); // Strip margin/width
      return `<ValidationMessage message={error} />\n                <div className="flex gap-3 pt-4">\n                  ${modified}\n                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>\n                </div>`;
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Injected base structures to ${file}`);
    }
  }
});
