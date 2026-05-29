const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'tracklab_phase13_static_datasource_1_2_5', 'src', 'data_json');
const destDir = path.join(__dirname, 'src', 'data_json');

console.log('--- Track.Lab Phase 13 Static Datasource Copier ---');
console.log('Source directory:', srcDir);
console.log('Destination directory:', destDir);

try {
  if (!fs.existsSync(srcDir)) {
    console.error('Source directory not found. Please verify placement.');
    process.exit(1);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('Created destination directory:', destDir);
  }

  const files = ['fieldTestProtocols.json', 'formulaMethodRegistry.json', 'workoutTemplates.json'];

  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    if (fs.existsSync(srcFile)) {
      console.log(`Copying ${file}...`);
      fs.copyFileSync(srcFile, destFile);
      const srcStats = fs.statSync(srcFile);
      const destStats = fs.statSync(destFile);
      console.log(`Successfully copied ${file} (${srcStats.size} bytes -> ${destStats.size} bytes)`);
    } else {
      console.warn(`Warning: Source file not found: ${srcFile}`);
    }
  });

  console.log('Data copying completed successfully!');
} catch (err) {
  console.error('Error copying files:', err);
  process.exit(1);
}
