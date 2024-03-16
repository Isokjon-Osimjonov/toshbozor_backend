const redis = require("redis");
// Create Redis client
const client = redis.createClient({
  // Redis server configuration options (host, port, etc.)
});

// Handle connection errors
client.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Example function to get value from Redis
const getValueFromRedis = (key) => {
  return new Promise((resolve, reject) => {
    // Check if the client is connected
    if (!client.connected) {
      reject(new Error("Redis client is not connected"));
    }

    // Execute Redis command
    client.get(key, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
};

// Example usage
getValueFromRedis("myKey")
  .then((value) => {
    console.log("Value from Redis:", value);
  })
  .catch((error) => {
    console.error("Error getting value from Redis:", error);
  });
