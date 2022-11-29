const { fstat } = require('fs');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  });
  
readline.question(`Where is your chat history file?`, filePath => {
  console.log(`You have ${numMessageFile}! message files in total`);
  console.log(`You have ${numPhoto}! photos in total`);
  console.log(`You have ${numAudio}! audio in total`);
  console.log(`You have ${numVideo}! videos in total`);
  readline.close();
});

fs.stat(filePath, (err, stats) => {
  if (err) {
    console.error(err);
  }
})