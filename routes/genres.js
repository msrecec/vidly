const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost/vidly')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// const genres = [
//   { id: 1, name: 'Action' },
//   { id: 2, name: 'Horror' },
//   { id: 3, name: 'Romance' },
// ];

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
    lowercase: true,
    trim: true,
  },
});

const Genre = mongoose.model('Genre', genreSchema);

async function createGenre(name) {
  const genre = new Genre({
    name: name,
  });
  try {
    if (!/^[a-z]+$/i.test(name)) {
      return 'Must only contain letters';
    }
    const result = await genre.save();
    console.log(result);
    return result;
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

async function getGenres() {
  const genres = await Genre.find().sort({ name: 1 }).select({ name: 1 });
  console.log(genres);
  return genres;
}

async function getGenre(id) {
  const genre = await Genre.findById(id).sort({ name: 1 }).select({ name: 1 });
  console.log(genre);
  if (!genre) return;
  else return genre;
}

async function updateGenre(id, updatedName) {
  const genre = await Genre.findById(id);
  if (!genre) return;

  genre.author = updatedName;
  const result = await genre.save();
  console.log(result);
  return result;
}

async function removeGenre(id) {
  const genre = await Genre.findByIdAndRemove(id);
  console.log(genre);
  return genre;
}

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).max(10).required(),
  };

  return Joi.validate(genre, schema);
}

router.get('/', (req, res) => {
  (async function () {
    const genres = await getGenres();
    console.log('These are the genres ', genres);
    res.send(genres);
  })();
});

router.post('/', (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  (async function () {
    const genreName = req.body.name;
    const genre = await createGenre(genreName);
    res.send(genre);
  })();
});

router.put('/:id', (req, res) => {
  // const genre = genres.find((c) => c.id === parseInt(req.params.id));
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  (async function () {
    const genre = await updateGenre(req.params.id);
    if (!genre)
      return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
  })();
});

router.delete('/:id', (req, res) => {
  (async function () {
    const genre = await removeGenre(req.params.id);
    if (!genre)
      return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
  })();
});

router.get('/:id', (req, res) => {
  (async function () {
    const genre = await getGenre(req.params.id);
    if (!genre)
      return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
  })();
});

module.exports = router;
