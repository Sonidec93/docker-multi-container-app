const path = require("path");

const keys = require("./keys")

const redisClient = require("redis").createClient({ host: keys.redisHost, port: keys.redisPort, retry_strategy: () => 1000 })

const sub = redisClient.duplicate();

const fib = (x) => {
    if (x <= 2) return 1;
    return fib(x - 1) + fib(x - 2);
}

sub.on("message", (channel, message) => {
    redisClient.hset("values", message, fib(parseInt(message)));
})
sub.subscribe("insert")
console.log("running");