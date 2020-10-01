const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const customer = new mongoose.Schema({
  isGold: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
    trim: true,
    validate: {
      validator: function (v) {
        return v && !isNaN(v);
      },
      message: 'Super wrong phone number bro',
    },
  },
});

const Customer = mongoose.model('Customer', customer);

function validateCustomer(customer) {
  const schema = {
    isGold: Joi.bool().required(),
    name: Joi.string().min(1).max(50).required(),
    phone: Joi.string().min(4).max(20).required(),
  };
  return Joi.validate(customer, schema);
}

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

router.post('/', async (req, res) => {
  try {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = new Customer({
      isGold: req.body.isGold,
      name: req.body.name,
      phone: req.body.phone.replace(/\s/g, ''), // replacing spaces in case any
    });
    customer = await customer.save();

    res.send(customer);
  } catch (ex) {
    const errors = [];
    for (field in ex.errors) {
      errors.push(ex.errors[field].message);
    }
    res.status(400).send(errors.join('\n'));
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isGold: req.body.isGold, name: req.body.name, phone: req.body.phone },
    { new: true }
  );
  if (!customer)
    return res.status(404).send('The genre with the given ID was not found.');

  res.send(customer);
});

router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res.status(404).send('The genre with the given ID was not found.');

  res.send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(customer);
});

module.exports = router;
