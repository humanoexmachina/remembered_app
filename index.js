import * as fs from 'node:fs';
import * as readline from 'node:readline';
import * as path from 'node:path';

const cmdLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  });
  
cmdLine.question(`Where is your chat history folder?`, folderPath => {

  console.log(`This is the folder path: `, folderPath);
  var fileName = readFiles(path.resolve(folderPath));
  console.log(fileName);
  cmdLine.close();
});

function readFiles(folderPath) {
  fs.readdirSync(folderPath).map(fileName => {
    return path.join(folderPath, fileName);
  });
}
