const fs = require('fs');
const path = require('path');

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
  content = content.replace(/'http:\/\/localhost:5000\/api'/g, "`http://${window.location.hostname}:5000/api`");
  content = content.replace(/'http:\/\/localhost:5000'/g, "`http://${window.location.hostname}:5000`");
  fs.writeFileSync(file, content);
});

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.dev = 'vite --host';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

console.log('Patched');
