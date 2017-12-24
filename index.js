const kafka = require('kafka-node');
const spotify = require('./spotify');

process.on('unhandledRejection', (reason) => {
  throw new Error('Unhandled Rejection: '.concat(reason));
});

async function run() {

  const payloads = await spotify();

  const client = new kafka.Client('localhost:2181/');
  
  client.on('error', err => {
    throw err;
  });

  const producer = new kafka.Producer(client);
  
  producer.on('error', err => {
    throw err;
  });

  producer.on('ready', () => {
    
    console.log('Producer is ready');
  
    producer.send(payloads, (err, data) => {
      console.log(err);
      console.log(data);
      process.exit(0);
    });
    
  });
}

run();