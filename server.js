const express = require("express"); // node server
const logger = require("morgan"); // logging middleware
const mongoose = require("mongoose"); // object data modelling library for mongoDB
const axios = require("axios"); // promise-based http library
const cheerio = require("cheerio"); // html parser, scraper

const db = require("./models"); // require all of the models in the folder

let PORT = 3000;

const app = express(); // initialize express

// Configure middleware
app.use(logger("dev")); // Use morgan logger for logging requests
app.use(express.urlencoded({ extended: true })); // Parse request body as JSON
app.use(express.json());
app.use(express.static("public")); // Make public a static folder

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", {
  useNewUrlParser: true
});

// Routes
