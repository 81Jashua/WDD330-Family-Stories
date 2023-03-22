const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
//const hbs = require('express-handlebars')
const hbs = require('hbs')
// const helpers = require('handlebars-helpers')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const connectDB = require('./config/db')

// Load my configurations
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs')


// Handlebars
app.engine(
  '.hbs',
  exphbs.engine({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('view engine', '.hbs')



// Handlebars
//////hbs.registerPartials(__dirname + '/views/partials');
//////hbs.registerHelper(__dirname + '/views/helpers/hbs');
// hbs.registerHelper("./helpers/hbs", function(options) {
//     return options.fn(formatDate,);
//   });
// hbs.registerHelper(formatDate, function(options) {
//     return options.fn(this);
// });

//////app.set('views', path.join(__dirname, 'views'));
//////app.set('view engine', 'hbs');

// handlebar express
//app.engine('handlebars', hbs.engine);
//app.set('view engine', 'handlebars');
//app.set('views', './views/layouts');

// Sessions 
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 3000


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))