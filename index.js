const express = require('express');
const  mongoose  = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const catchAsync= require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const session = require('express-session');
const Review = require('./models/review');
const flash= require('connect-flash')
const passport= require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const {campgroundSchema,reviewSchema} = require('./schemas.js')
const methodOverride = require('method-override');

const campgrounds= require('./routes/campgrounds');
const reviews= require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log('Mongo connection open')
    })
    .catch(err=>{
    console.log("oh no Mongo connection e rror!")
    console.log(err)
})


const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
//app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')))

const sessionConfig={
    secret:'thisshouldbebettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:"true",
        expires:Date.now()+ 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.get('/fakeUser', async (req,res) =>{
    const user = new User ({email:'coltttt@gmail.com',username:'colttt'})
    const newUser = await User.register(user,'chicken')
    res.send(newUser);
} )

app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)

app.get('/', (req, res)=>{
    res.render('home')
})


// app.get('/makecampground', async (req, res)=>{
//     const camp = new Campground({title:'My Backyard', description : 'cheap camping!'});
//     await camp.save();
//     res.send(camp)
// })


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
    // res.send("404!!")
})

app.use((err,req,res,next) => {
    const{statusCode=500} = err;
    if(!err.message) err.message = 'Oh No,something wrong'
    res.status(statusCode).render('error',{err})
    // res.send('Oh boy,Something went wrong!')
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})

//Post /campground/:id/review