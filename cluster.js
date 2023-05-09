const cluster = require('cluster');
// const numCPUs = require('node:os').availableParallelism();
const os = require('os');

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
  // Fork worker processes equal to the number of logical processor cores
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // Handle worker exit event
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ID: ${worker.process.pid} exited with code ${code} and signal ${signal}`);
    console.log('Starting a new worker...');
    cluster.fork();
  });
}
 else {
  require('./app');
  console.log(`Worker ${process.pid} started`);
}
