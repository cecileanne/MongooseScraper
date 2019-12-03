const express = require("express"); // node server
const logger = require("morgan"); // logging middleware
const mongoose = require("mongoose"); // object data modelling library for mongoDB
const axios = require("axios"); // promise-based http library
const cheerio = require("cheerio"); // html parser, scraper
// const hndlbrs = require("express-handlebars"); // html templating

const db = require("./models"); // require all of the models in the folder

const PORT = 3000;

const app = express(); // initialize express

// Configure middleware
app.use(logger("dev")); // Use morgan logger for logging requests
app.use(express.urlencoded({ extended: true })); // Parse request body as JSON
app.use(express.json());
app.use(express.static("public")); // Make public a static folder

// // Set Handlebars as the default templating engine.
// app.engine("handlebars", hndlbrs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongooseScraperHW", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes

// GET from tlo
app.get("/scrape", function(req, res) {
  axios.get("http://tomandlorenzo.com/").then(function(response) {
    // grab html body
    let $ = cheerio.load(response.data); // loads html body into cheerio saved as $ selector

    // Grab every h3 heading within the content (article title)
    $(".gradient-light > h3").each(function(i, element) {
      const result = {};
      // save individual properties of the result
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new curated article list to put into our database
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    }); // closes grab

    // confirm to client the scrape is done
    res.send("Scrape complete");
  }); // closes axios
}); // closes get

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}, function(err, data) {
    if (err) throw err;
    res.json(data);
  });
});

// GET specific article (by id) from our database of scraped articles, populated with its comments
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id }, function(err, data) {
    if (err) throw err;
    res.json(data);
  })
    // and run the populate method with "comment",
    .populate("comment")
    // then responds with the article with the comment included
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body, function(err, data) {
    if (err) throw err;
    console.log(data);
    // res.json(data);
    db.Article.update(
      { _id: req.params.id },
      { $push: { comment: data._id } },
      function(err, data2) {
        if (err) throw err;
        console.log(data2);
        res.json(data2);
      }
    );
  });
});

// listen
app.listen(PORT, function() {
  console.log(`listening on ${PORT}`);
});
