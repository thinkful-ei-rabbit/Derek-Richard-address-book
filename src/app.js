require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");

const { NODE_ENV, API_TOKEN } = require("./config");
const mockData = require("./mockData");

const app = express();
app.use(express.json());

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

let DATA = [...mockData];

app.use("/address", function tokenValidation(req, res, next) {
  if (req.method === "GET") {
    next();
  }
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized Request" });
  }
  next();
});

app.use("/address", function validateProperties(req, res, next) {
  if (req.method !== "POST") {
    next();
  }
  const { firstName, lastName, address1, city, state, zip } = req.body;
  if (!firstName || !lastName || !address1 || !city || !state || !zip) {
    return res.status(400).json({ error: "Missing required parameter" });
  }
  if (state.length !== 2) {
    return res.status(400).json({ error: "State doesn't exist" });
  }
  if (zip.toString().length !== 5) {
    return res.status(400).json({ error: "Zipcode doesn't exist" });
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Express boilerplate initialized!");
});

app.get("/address", (req, res) => {
  res.json(DATA);
});

app.post("/address", (req, res) => {
  const id = uuidv4();
  req.body.id = id;
  DATA.push(req.body);
  res.json(DATA);
});

app.delete("/address/:userId", (req, res) => {
  const id = req.params.userId;

  const validate = DATA.length;
  DATA = DATA.filter((ad) => ad.id !== parseInt(id));

  if (DATA.length === validate) {
    return res.status(400).send("Adress not found!");
  }

  res.json(DATA);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
