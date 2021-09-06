const express = require("express");
const keys = require("./keys");
const redisClient = require("redis").createClient({ host: keys.redisHost, port: keys.redisPort, retry_strategy: () => 1000 })
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser")
const { Pool } = require("pg");

const pgClient = new Pool({ host: keys.pgHost, database: keys.pgDatabase, user: keys.pgUser, password: keys.pgPassword, port: keys.pgPort })

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

pgClient.on("connect", (client) => {
    client.query("CREATE TABLE IF NOT EXISTS fibvalues(number INT)").catch(err => console.log(err));
})

const redisPublisher = redisClient.duplicate();

app.get("/", (req, res) => {
    res.send("Hi")
})
//send all the indices stored in postgres
app.get("/values/all", async (req, res) => {
    let values = await pgClient.query("SELECT * FROM fibvalues");
    res.send(values.rows);
})

//sends all the indices with values from redis
app.get("/values/current", async (req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values)
    })
})

app.post("/values", (req, res) => {
    if (+req.body.index > 40) {
        res.status(422).send("Index is too high");
    }
    redisClient.hset("values", +req.body.index, "Nothing yet");
    redisPublisher.publish("insert", +req.body.index);
    pgClient.query("INSERT INTO fibvalues(number) VALUES($1)", [+req.body.index])
    res.status(200).send({ message: "value is being stored!" })
})

app.listen(5000, () => {
    console.log("node-server listening on 5000");
})