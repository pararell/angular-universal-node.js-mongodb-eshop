require('zone.js/dist/zone-node');
require('reflect-metadata');

import { enableProdMode } from '@angular/core';

const express = require('express');
const session = require('express-session');
const platformServer = require('@angular/platform-server');
const ngUniversal = require('@nguniversal/express-engine');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const fs = require('fs');
const keys = require('./config/keys');
const compression = require('compression');
const MongoStore = require('connect-mongo')(session);

enableProdMode();

function angularRouter(req, res) {
  res.render('index', { req, res });
}

if (keys.mongoURI) {
  mongoose.connect(keys.mongoURI);
}

// mongoose models
require('./models/User');
require('./models/Product');
require('./models/Order');

// services
require('./services/passport');

const app = express();

app.all('*', (req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Key, Authorization');
  next();
});

const DIST_FOLDER = path.join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = fs.readFileSync(path.join(DIST_FOLDER, 'browser', 'index.html')).toString();

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

const factoryLoader = require('@nguniversal/module-map-ngfactory-loader');

app.engine('html', (_, options, callback) => {
  platformServer.renderModuleFactory(AppServerModuleNgFactory, {
    // Our index.html
    document: template,
    url: options.req.url,
    // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
    extraProviders: [
      factoryLoader.provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', path.join(DIST_FOLDER, 'browser'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(
  session({
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    },
    secret: keys.cookieKey,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: 'session'
    })
  })
);

// middlewares
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});


app.get('/', angularRouter);

// routes
require('./routes/productRoutes')(app);
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/adminRoutes')(app);


app.get('*.*', express.static(path.join(DIST_FOLDER, 'browser')));

// app.use(express.static(`${__dirname}/dist/browser`));

app.get('*', (req, res) => {
  res.render(path.join(DIST_FOLDER, 'browser', 'index.html'), { req });
});

// compress files
app.use(compression());

app.get('*', angularRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});
