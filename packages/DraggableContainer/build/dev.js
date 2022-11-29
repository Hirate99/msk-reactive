const { spawn } = require('node:child_process');

const ls = spawn('tsc', ['--watch']);

ls.stdout.on('data', (data) => {
  console.log(data.toString());
});

ls.stderr.on('data', (data) => {
  console.error(data.toString());
});
