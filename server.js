require('zone.js/dist/zone-node');
require('reflect-metadata');

const express = require('express');
const ngUniversal = require('@nguniversal/express-engine');
const {provideModuleMap} = require('@nguniversal/module-map-ngfactory-loader');
const path = require('path');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const fs = require('fs');
const keys = require('./config/keys');
// const cloudinary = require('cloudinary'); 
const session = require('express-session');
const compression = require('compression');
const MongoStore = require('connect-mongo')(session);

// Import the AOT compiled factory for your AppServerModule - Universal require
// This import will change with the hash of your built server bundle - use --output-hashing=none
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist-server/main.bundle');

function angularRouter(req, res) {
  res.render('index', {req, res});
}

const  { renderModuleFactory } = require('@angular/platform-server');
const { platformServer } = require('@angular/platform-server');


const app = express();

app.engine('html', ngUniversal.ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', 'dist')

app.use(bodyParser.json());

app.use(
  session({
      cookie : { maxAge: 30 * 24 * 60 * 60 * 1000 },
      secret: keys.cookieKey,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({mongooseConnection: mongoose.connection})
  })
);

// middlewares
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// mongoose models
require('./models/User');
require('./models/Product');

// services
require('./services/passport');

mongoose.connect(keys.mongoURI);

app.get('/', angularRouter);

// routes
require('./routes/productRoutes')(app);
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);

app.get('*.*', express.static(path.join(__dirname, '..', 'dist')));

app.use(express.static(`${__dirname}/dist`));

// compress files
app.use(compression());

app.get('*', angularRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});



// set for add images for products to cnd -  add dashboard - TODO

// cloudinary.config({
//   cloud_name: 'dnpgh1vhi',
//   api_key: '823993163517434',
//   api_secret: 'vXxVASwN0UbhGvNY3tSYSuBQjSw'
// });

// cloudinary.uploader.upload("", function(result) {
//   console.log(result)
// });