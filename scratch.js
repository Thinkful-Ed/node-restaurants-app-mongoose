'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL } = require('./config');

mongoose.connect(DATABASE_URL, { useMongoClient: true });

const favoriteSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  votes: { type: Number, default: 0 },
  comment: String,
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

Favorite.create({
  name: 'The Hitchhiker’s Guide to the Galaxy',
  comment: 'I won’t enjoy it. –Marvin',
  votes: 42
}).then(favorite => {
  console.log('Created favorite:', favorite);
});

Favorite.create({
  name: 'Serenity',
  comment: 'Great Movie',
  votes: 99
}).then(favorite => {
  console.log('Created favorite:', favorite);
});

Favorite.find({})
  .then(favorites => {
    console.log('Read favorites:', favorites);
  });

Favorite.findById('5a1d82fabbed51aa01614c31')
  .then(favorites => {
    console.log('Read favorites:', favorites);
  });

Favorite.findOne({
  name: 'The Hitchhiker’s Guide to the Galaxy'
}).then(favorites => {
  console.log('Read favorites:', favorites);
});

Favorite.updateOne({ name: 'Serenity' }, { votes: 42 })
  .then(result => {
    console.log('Write Results', result);
  });

Favorite.updateMany({ votes: 42 }, { votes: 99 })
  .then(favorite => {
    console.log('Updated favorite', favorite);
  });

Favorite.findByIdAndUpdate('5a1d8b9a9298d8b1101e6f06',
  { name: 'Upserted document', comment: 'this is new', votes: 52 },
  { new: true, upsert: true }
).then(favorite => {
  console.log('Updated favorite', favorite);
});


Favorite.findByIdAndRemove('5a1d8b9a9298d8b1101e6f08')
  .then((res) => {
    if (res) {
      console.log('Deleted', res);
    } else {
      console.log('Id not found, so can not delete');
    }
  });

Favorite.remove().then((results) => {
  console.log(results);
});