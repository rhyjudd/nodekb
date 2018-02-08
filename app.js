const now = new Date();
console.log('app start...');
console.log(now);

// Dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');


//connecting mongodb to our app
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;


//Check Connection
db.once('open', function(){
    console.log('Connected to MongoDB');
})
//Check for DB errors
db.on('error', function(err){
    console.log(err);
});


//Init app
const app = express();

//Bring in models 
let Article = require('./models/articles')

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express-session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

//Express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Home Route
app.get('/', function(req, res){ 
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else{
        res.render('index',{
            title: 'Articles',
            articles: articles 
            })
        }
    })
    
});

//Get single article
app.get('/article/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        console.log(article);
        res.render('article',{
        article:article
        });
        
    });
});

//Load edit form
app.get('/article/edit/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        res.render('edit_article',{
        title:'Edit Article',
        article:article
        });
        
    });
});

//Add Rout
app.get('/articles/add', (req, res) => res.render('add_article',{
    title: 'Add Articles' 
 }));


//Add Submit POST route
app.post('/articles/add', function(req, res){
    let article = new Article();
    article.title = req.body.title;
    console.log(req.body.title);
    article.author = req.body.author;
    console.log(req.body.author);
    article.body = req.body.text;
    console.log(req.body.text);

    article.save(function(err){
        if(err){
            conosle.log(err);
            return;
        } else {
            res.redirect('/');
        }
    })
});

//Add Submit POST route
app.post('/articles/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    console.log(req.body.title);
    article.author = req.body.author;
    console.log(req.body.author);
    article.body = req.body.text;
    console.log(req.body.text);

    let query = {_id:req.params.id}
    Article.update(query, article, function(err){
        if(err){
            conosle.log(err);
            return;
        } else {
            res.redirect('/');
        }
    })
});

//app.delete
app.delete('/article/:id', function(req, res){
    let query = {_id:req.params.id};

    Article.remove(query, function(err){
        if(err){
            console.log(err);
        }
        res.send('success');
    })
});

// Start Server
app.listen(3000, ()=> console.log('Server started on port 3000'));
