const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = mongoose.model('products');
const requireLogin = require('../middlewares/requireLogin');
const Cart = require('../models/Cart');

module.exports = app => {
  

  app.post('/prod/product', (req, res) => {
    const newProduct = Object.assign(req.body, {_user: req.user.id, dateAdd: Date.now()});
    const product = new Product(newProduct);

    product.save();

    res.status(200).send(product);
  });

  app.get('/prod/products', (req, res) => {
    Product.find({}, function(err, products) {
      res.status(200).send(products);
    });
  });

  app.get('/prod/productId/:name', (req, res) => {
    Product.findOne(
      {
        titleUrl: req.params.name
      },
      function(err, product) {
        res.status(200).send(product);
      }
    );
  });

  app.get('/prod/addcart/:id', (req, res) => {

    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, (err, product) => {
      if (err) {
        return res.redirect('/');
      }

      cart.add(product, product.id);

      req.session.cart = cart;

      if (req.user) {
        req.user.cart = cart;
        req.user.save();
      }
      res.send(cart);
    });
  });

  app.get('/prod/removefromcart/:id', (req, res) => {
    const productId = req.params.id;
    const storeCart = req.session.cart ? req.session.cart : new Cart({});
    res.set(
      'Cache-Control',
      'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    );
    const cart = new Cart(storeCart);

    Product.findById(productId, (err, product) => {
      if (err) {
        return res.redirect('/');
      }

      cart.remove(product, product.id);
      req.session.cart = cart;
      if (req.user) {
        req.user.cart = cart;
        req.user.save();
      }
      res.send(cart);
    });
  });

  app.get('/prod/cart', (req, res) => {
    const cart = req.user ? req.user.cart : req.session.cart ? req.session.cart : new Cart({});
    res.set(
      'Cache-Control',
      'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    );
    req.session.cart = cart;
    res.send(cart);
  });
};
