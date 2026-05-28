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

const titleMap = {
  'PACE MATRIX': 'Pace Lab',
  'HEART RATE MATRIX': 'Heart Rate Lab',
  'ZONE MATRIX': 'Zone Lab',
  'RACE ENVIRONMENT': 'Race Lab',
  'TRAINING PACE LOGIC': 'Training Pace Lab',
  'CRITICAL SPEED LOGIC': 'Critical Speed Lab',
  'VO2 & METABOLIC MODULE': 'VO2 & Metabolic Lab',
  'WORKOUT SCHEMA': 'Workout Lab',
  'WORKOUT INDEX': 'Workout Library',
  'LOAD ANALYSIS': 'Load Lab',
  'FUEL & HYDRATION SYSTEM': 'Fuel & Hydration Lab',
  'ENVIRONMENT MODULE': 'Environment Lab',
  'TRAIL & ALTITUDE METRICS': 'Trail & Elevation Lab',
  'TREADMILL CALIBRATOR': 'Treadmill Lab',
  'BIOMECHANICS PARSER': 'Biomechanics Lab',
  'POWER ANALYSIS': 'Power Lab',
  'RECOVERY DELTA': 'Recovery Check Lab',
  'GEAR LAB': 'Gear Lab',
  'FORMULA LIBRARY': 'Formula Library'
};

const files = walkSync('./src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace button texts
  content = content.replace(/>COMPUTE MATRIX</g, '>Calculate<');
  content = content.replace(/>COMPUTE COSTS & MILEAGE</g, '>Calculate<');
  content = content.replace(/>RUN FORMULA</g, '>Calculate<');
  content = content.replace(/>COMPUTE STRUCTURE</g, '>Calculate<');
  content = content.replace(/>COMPUTE TIME & REPS</g, '>Calculate<');
  content = content.replace(/>COMPUTE OUTCOMES</g, '>Calculate<');
  
  // Fix LabPageHeader titles
  for (const [key, val] of Object.entries(titleMap)) {
    const regex = new RegExp(`title="${key}"`, 'g');
    content = content.replace(regex, `title="${val}"`);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
