require('dotenv').config();

const express = require('express');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

const app = express();
const port = 5000 || process.env.PORT;

app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
		}),
	})
);

app.use(passport.initialize());
app.use(passport.session());

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());

connectDB();

//static files
app.use(express.static('public'));

// Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//routing

app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index.js'));
app.use('/', require('./server/routes/dashboard'));

//handling 404

app.get('*', function (req, res) {
	res.status(404).render('404');
});

app.listen(port, () => {
	console.log(`App is running on port ${port} `);
});
