const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {Restaurant} = require('./models');

const app = express();
app.use(bodyParser.json());


// GET requests to /restaurants => return 10 restaurants
app.get('/restaurants', (req, res) => {
  Restaurant
    .find()
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .limit(10)
    // `exec` returns a promise
    .exec()
    .then(
      // success callback
      restaurants => res.json({restaurants}),
      // failure callback
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      }
    )}
);

// can also request by ID
app.get('/restaurants/:id', (req, res) => {
  Restaurant
    .findById(req.params.id)
    .exec()
    .then(
      restaurant => res.json(restaurant),
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})}
    );
});


app.post('/restaurants', (req, res) => {
  const {name, borough, restaurant_id, cuisine, grades, address} = req.body;

  Restaurant
    .create({name, borough, restaurant_id, cuisine, grades, address})
    .then(
      restaurant => res.status(201).json(restaurant),
      err => res.status(500).json({message: 'Internal server error'}));
});


app.put('/restaurants/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const msg = '';
    console.error(`${msg}`);
    // return error
  }
  Restaurant
    .update()
    .then(
      restaurant => res.status(204).end(),
      err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/restaurants/:id', (req, res) => {
  Restaurant
    .findByIdAndRemove(req.params.id)
    .then(
      restaurant => res.status(204).end(),
      err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});


// this function connects to our database, then starts the server
function runServer(callback) {
  mongoose.connect(DATABASE_URL, (err) => {
    if (err && callback) {
      return callback(err);
    }

    app.listen(PORT, () => {
      console.log(`Your app is listening on port ${PORT}`);
      if (callback) {
        callback();
      }
    });
  });
};

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance,
// test code) can start the server as needed.
if (require.main === module) {
  runServer(function(err) {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = {app, runServer};
