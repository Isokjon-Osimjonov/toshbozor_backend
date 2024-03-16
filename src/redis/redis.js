const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("connect", () => {
  console.log("Connected to Redis12345");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("ready", () => {
  console.log("Redis is ready");
});

client.on("end", () => {
  console.log("Redis connection ended");
});

process.on("SIGINT", () => {
  client.quit();
});

// client
//   .connect()
//   .then(() => {
//     console.log("Connected to Redis");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

module.exports = client;
