# kafka-music
Fun project to use node + apache kafka + spotify api + docker

### How to use Apache Kafka

1. Local
2. Apache Kafka on Docker but development not Docker
3. Everything Docker (aka production?)

#### Local

Follow this nice tutorial [DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-apache-kafka-on-ubuntu-14-04#step-2-%E2%80%94-install-java)

#### Apache Kafka on Docker but development not Docker

Clone [Spotify kafka docker image](https://github.com/spotify/docker-kafka). Sadly project seems to be outdated.
Some issues might arise because of the use of docker-machine, then check [this awesome gist](https://gist.github.com/abacaphiliac/f0553548f9c577214d16290c2e751071).
The branch master runs for this Kafka configuration.

This line of code builds Kafka server and starts it. It must be executed from inside the cloned container.

```
docker run --rm --env ADVERTISED_HOST=localhost -p 2181:2181 -p 9092:9092 --env ADVERTISED_PORT=9092 --name kafka -h kafka spotify/kafka
```

Start a consumer

```
docker exec kafka /opt/kafka_2.11-0.10.1.0/bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic nin --from-beginning
```

List the current topics

```
docker exec kafka /opt/kafka_2.11-0.10.1.0/bin/kafka-topics.sh --list --nin localhost:2181
```

#### Everything Docker (aka production?)

TODO!!!

This repo should run on a node container too. Why? MICROSERVICES!!

```
docker run -d -p 2181:2181 -p 9092:9092 --env ADVERTISED_HOST=kafka --env ADVERTISED_PORT=9092 --name kafka spotify/kafka
```

### Get a new spotify token 

```
curl -X "POST" -H "Authorization: Basic ZWZhNTA4YTY2MmI1NGRjNzlmNjhiYmJkNGU1ZmUzN2Q6MmVhMzRlNTJkMmY1NDBmYTlmYTlkODkyMjQ5NGI3YzA=" -d grant_type=client_credentials https://accounts.spotify.com/api/token
```

### Nice links 
- I got inspired by this article to explore with streams, so I 'll call it [the genesis](https://technology.amis.nl/2017/02/09/nodejs-publish-messages-to-apache-kafka-topic-with-random-delays-to-generate-sample-events-based-on-records-in-csv-file/)
- [kafka node](https://github.com/SOHU-Co/kafka-node)
- [intro to kafka with docker](https://ngeor.wordpress.com/2017/03/25/kafka-with-docker-a-docker-introduction/)
- [get docker ip](https://stackoverflow.com/questions/17157721/how-to-get-a-docker-containers-ip-address-from-the-host)
- [kafka streams](https://github.com/miguno/kafka-streams-docker)