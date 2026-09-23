const fs = require('fs');
const EventEmitter = require('events');

// Create an instance of EventEmitter
const myEmitter = new EventEmitter();

// Object to store content from both files
const filesData = {};

// 1. Event listener for file merging
myEmitter.on('mergeFiles', (data) => {
  const combinedContent = data.file1 + '\n\n' + data.file2;

  // Write merged content to output.txt (Non-blocking Async)
  fs.writeFile('output.txt', combinedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Files merged successfully into output.txt!');
  });
});

// Function to check if both files have been read
function checkAndEmit() {
  if (filesData.file1 !== undefined && filesData.file2 !== undefined) {
    myEmitter.emit('mergeFiles', filesData);
  }
}

// 2. Read the first file (Non-blocking Async)
fs.readFile('file1.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file1.txt:', err);
    return;
  }
  filesData.file1 = data;
  checkAndEmit();
});

// 3. Read the second file (Non-blocking Async)
fs.readFile('file2.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file2.txt:', err);
    return;
  }
  filesData.file2 = data;
  checkAndEmit();
});