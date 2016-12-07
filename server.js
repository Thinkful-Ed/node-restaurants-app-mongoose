const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

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
    // .exec()
    // success callback: for each restaurant we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(restaurants => {
      res.json({
        restaurants: restaurants.map(
          (restaurant) => restaurant.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// can also request by ID
app.get('/restaurants/:id', (req, res) => {
  Restaurant
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .exec()
    .then(restaurant =>res.json(restaurant.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});


app.post('/restaurants', (req, res) => {

  const requiredFields = ['name', 'borough', 'cuisine'];
  requiredFields.forEach(field => {
    // ensure that required fields have been sent over
    if (! (field in req.body && req.body[field])) {
      res.status(400).json({message: `Must specify value for ${field}`});
    }
  });

  Restaurant
    .create({
      name: req.body.name,
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      grades: req.body.grades,
      address: req.body.address})
    .then(
      restaurant => res.status(201).json(restaurant.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


app.put('/restaurants/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }
  // N.B. -- this assumes that clients are always sending over existing or
  // updated data for these fields.
  Restaurant
    .findByIdAndUpdate(req.params.id, {
      $set: {
        name: req.body.name,
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        address: req.body.address,
      }
    })
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/restaurants/:id', (req, res) => {
  Restaurant
    .findByIdAndRemove(req.params.id)
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
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
