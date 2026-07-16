import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./src/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'http:\/\/localhost:5000\/api'/g, "'https://restaurant-qr-jl0w.onrender.com/api'");
  content = content.replace(/'http:\/\/localhost:5000'/g, "'https://restaurant-qr-jl0w.onrender.com'");
  fs.writeFileSync(file, content);
});

console.log('URLs updated for production');
