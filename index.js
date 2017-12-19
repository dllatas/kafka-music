const request = require('request');
const util = require('util');
const kafka = require('kafka-node');

const Producer = kafka.Producer;
const client = new kafka.Client("localhost:2181/");
const producer = new Producer(client);
const KeyedMessage = kafka.KeyedMessage;

const options = { 
  method: 'GET',
  url: 'https://api.spotify.com/v1/search',
  qs: { q: 'nin', type: 'album' },
  headers: 
    {
      'Postman-Token': '1011d5a4-7bfe-4840-10c5-44bd7ebdd3e0',
      'Cache-Control': 'no-cache',
      Authorization: 'Bearer BQBDa8dGtvD-OMHnLzepFCvT-zAxAzZq2DXFbBzxa47OiPtYHcO1c7P_D5pua97tx9mHtINVc8VOZ9aswR0'
    } 
};

producer.on('ready', async function() {
  console.log('Producer for NIN is ready');

  let result = [];
  let response = await util.promisify(request)(options);
  response = JSON.parse(response.body);
  result = response.albums.items.map(i => { return {id: i.id, name: i.name} });
  console.log(result.length);

  const messagePromises = result.map(r => produceMessage(r));
  await Promise.all(messagePromises);
  process.exit(0);


});

producer.on('error', function (err) {
  console.error("Problem with producing Kafka message ".concat(JSON.stringify(err)));
});

async function produceMessage(album) {
  
  const albumKM = new KeyedMessage(album.id, JSON.stringify(album));
  const payloads = [ { topic: 'nin3', messages: albumKM, partition: 0 } ];

  try {
    const data = await util.promisify(producer.send)(payloads);
    console.log(data);
  } catch (error) {
    console.log(JSON.stringify(error));
  }
}