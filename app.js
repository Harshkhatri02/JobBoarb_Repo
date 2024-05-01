
require("dotenv").config();
const secretKey = process.env.SESSION_SECRET_KEY;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientUrl = process.env.CLIENT_URL;
const dbUrl = process.env.DB_CONNECT;


      const express = require('express');
      const mongoose = require('mongoose');
      const path = require('path');
      const session = require('express-session');
      const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const axios = require('axios');
const { User, Job, Application, Company, FeaturedJob, Notification } = require('./schema');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

// Go to previous page (USE of Middleware)
app.use((req, res, next) => {
  if(req.url==='/login'){
    next();
  }else{
    // Store the current page's URL in the session
    req.session.redirectUrl = req.session.previousUrl;
    req.session.previousUrl = req.originalUrl;
    next();

  }
});
app.use(passport.initialize());
app.use(passport.session());

// const dbUrl = 'mongodb+srv://harshkhatri682:z7L7PrhHoJT8Cb2H@job-board.layuqym.mongodb.net/';
mongoose.connect(dbUrl, {
}).then(() => {
  console.log("Db Connected Successfully");
}).catch(err => {
  console.error("Error connecting to database:", err);
});
passport.use(new GoogleStrategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: clientUrl,
  scope: ["profile", "email"],
},
function(accessToken, refreshToken, profile, cb) {
  // You can handle the user profile data here or save it to your database
  console.log('Google account details:', profile);
  cb(null, profile);
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/auth/google',
(req, res, next) => {
  console.log('Received request to /auth/google');
  console.log('Scope:', req.query.scope); // Log the scope parameter
  next(); // Continue to the passport.authenticate middleware
},
passport.authenticate('google', { scope: ['profile', 'email'] }));

app.post("/auth/google/callback",(req,res)=>{
  res.redirect('/auth/google/callback');
})
  app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async function (req, res) {


    const { given_name, family_name, email } = req.user._json;
    // const { given_name, family_name, email } = req.user._json;

    // Check if a user with the same email already exists in the database
    User.findOne({ email: email })
      .then(existingUser => {
        if (existingUser) {
          // User already exists, do not create a new user
          // Redirect to the home page or dashboard
          req.session.userData = existingUser;
          req.session.loggedIn = true;
          return res.redirect('/');
        }else{
          const newUser = new User({
            username: 'Anonymous', // Assuming username is the same as email
            email: email,
            password: '', // No password for Google authenticated users
            role: 'job seeker', // Default role for new users
            googleId: req.user.id
          });
          // Save the new user to the database
          newUser.save()
            .then(user => {
              res.redirect('/select-role'); // Redirect to role selection page
            })
            .catch(err => {
              console.error(err);
              res.redirect('/login'); // Redirect to login page on error
            });

        }
        
      });


  });

  app.get('/select-role',(req,res)=>{
    
    res.render('role.ejs',{session:req.session});
  });

  app.post('/submit-role',async(req,res)=>{
    const {username, role } = req.body;
    // Update the user's role in the database
    await User.findOneAndUpdate({ googleId: req.user.id }, { role: role ,username:username})
    .then(async() => {
      const user = await User.findOne({ googleId: req.user.id });
      req.session.userData = user;
        req.session.signedUp = true;
        res.redirect('/'); // Redirect to the appropriate dashboard based on the selected role
      })
      .catch(err => {
        console.error(err);
        res.redirect('/select-role'); // Redirect to role selection page on error
      });
  })


  app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy();
  
    // Revoke Google token
    if (req.user && req.user.googleAccessToken) {
      const { google } = require('googleapis');
      const OAuth2 = google.auth.OAuth2;
  
      const oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  
      oauth2Client.revokeToken(req.user.googleAccessToken, (err, body) => {
        if (err) {
          console.error('Failed to revoke Google token:', err);
        }
        console.log('Token revoked:', body);
        res.redirect('/');
      });
    } else {
      // Redirect to home page if no user or token found
      res.redirect('/');
    }
  });
    

  app.post('/profile', async(req, res) => {
    // Process the form data
    const { username, email } = req.body;
  
    // Update the session or database with the new username and email
    const user = await User.findOneAndUpdate({_id:req.session._id},{username,email});
    req.session.userData.username = username;
    req.session.userData.email = email;
  
    // Redirect back to the profile page
    res.redirect('/home');
  });
  
  app.get('/profile',(req,res)=>{
    res.render('profile',{session:req.session});
  })
app.get("/login",(req,res)=>{
  res.render('login.ejs');
})



      
      

// User signup
app.post('/signup', async(req, res) => {
  // Extract form data
  const { username, email, password, confirmPassword, role } = req.body;
   // Validate form data
   if (!username || !email || !password || !confirmPassword || !role) {
    return res.status(400).send('All fields are required');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  // Create a new user from the schema
  const user  = await User.findOne({email:email});

  if(user){
    res.send("User Already Exists.Please Login!");
  }else{
    
    const newUser = await new User({username, email, password, role });
    await newUser.save();
  }
  req.session.userData = { username, email, role };
  req.session.signedUp = true;
  res.render('index.ejs',{session:req.session});



//User Login
app.post("/login",async(req,res)=>{
  const { email, password } = req.body;
      // Validate the user's credentials
      const user = await User.findOne({ email, password });
      // console.log("user data",user.email,user.password);

      if (!user) {
          throw new Error("Invalid email or password");
      }

      // Store user data in the session
      req.session.userData = user; // You can store more user data if needed
      req.session.loggedIn  = true;
      // Render index.ejs with user data
      res.redirect("/home");
})


app.get('/goback', (req, res) => {
   // Retrieve the previous URL from the session
   const redirectUrl = req.session.redirectUrl;
    
   // Check if there is a previous URL stored
   if (redirectUrl) {
       // Clear the previous URL from the session to prevent further redirects
       // Redirect the user to the previous URL
       res.redirect(redirectUrl);
        delete req.session.previousUrl;
   } else {
       // If there is no previous URL, redirect to a default page (e.g., home page)
       res.redirect('/');
   }
});


// Routes for Users

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = new User({ username, email, password, role });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Routes for Jobs
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', ['name', 'description', 'industry']);

    // const jobs = await Job.find().populate('company');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/jobs', async (req, res) => {
  const { title, jobDescription, location, salaryMin, salaryMax, companyName, companyDescription, companyIndustry } = req.body;
  console.log(title, jobDescription, location, salaryMin, salaryMax, companyName, companyDescription, companyIndustry);
  try {
    const company = new Company({
      name: companyName,
      description: companyDescription,
      industry: companyIndustry
    });
    const savedCompany = await company.save();
    req.session.company = savedCompany;
    // const job = new Job({ title, jobDescription, location, salaryMin,salaryMax});
    const newJob = new Job({
      title,
      jobDescription,
      location,
      salaryMin,
      salaryMax,
      company: savedCompany._id,
      employer: req.session.userData._id
    });

    const savedJob = await newJob.save();
    req.session.job = savedJob;
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  

});

// Employer Jobs are here ,dynamic content!
app.get('/employer-jobs', async (req, res) => {
  try {
    // const jobs = await Job.find({ company: req.session.job._id }).populate('company');
    const jobs = await Job.find({ employer:req.session.userData._id });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
    res.status(500).json({ message: 'Failed to load jobs' });
  }
});


// app.js
app.post('/update-account',async (req, res) => {
  const { username, email } = req.body;
  // Assume req.session.userData contains the user's data

  // Update the user's data

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.session.userData._id },
    { username, email },
    { new: true }
  );
  // Check if the user was found and updated successfully
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
  req.session.userData.username = username;
  req.session.userData.email = email;

  // Optionally, update the user in the database
  
  res.status(200).send('Account updated successfully');
});

app.get('/job-detail/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', ['name', 'description', 'industry']);
    res.render('job-detail', { job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.get('/list-jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', ['name', 'description', 'industry']);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route for searching jobs
app.get('/search-jobs', async (req, res) => {
  const keyword = req.query.keyword;
  try {
    const jobs = await Job.find({
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } }
            ]
        }).populate('company');
        console.log(jobs);
        res.json(jobs);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});

app.post('/apply', async (req, res) => {
  const { jobId, resumeUrl, coverLetter } = req.body;
  
  
  
  const candidateId = req.session.userData._id; // Assuming this is the candidate's ID

  try {
    const user = await Application.findOne({job:jobId}) ;
    if(user){
    res.send('<script>alert("You have already applied for the Job! Please for Employer Responser"); window.location.href = "/login";</script>');
    }
    const application = new Application({
      job: jobId,
      candidate: candidateId,
      resumeUrl,
      coverLetter,
      status: 'pending'
    });
    await application.save();
    res.send('<script>alert("Application Submitted SuccessFully"); window.location.href = "/login";</script>');

    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/applications', async (req, res) => {

  try {
    const applications = await Application.find().populate('job', 'title').populate('candidate', 'username');;
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/job-details', async (req, res) => {
  const jobId = req.query.id;
  try {
    const job = await Job.findById(jobId);
    res.render('job-details.ejs', { job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Render Pages using app .get and pass data to the pages through res
app.get("/",(req,res)=>{
  res.redirect('/home');
})

app.get("/home",(req,res)=>{
  if(!req.session.userData){
  }else{
    var userData = req.session.userData;
  }
  res.render('index.ejs',{userData,session:req.session});
})

app.get("/job-listings",(req,res)=>{
  res.render('jobListing.ejs',{session:req.session});
})
app.get("/signup",(req,res)=>{
  res.render('signup.ejs');
})
app.get("/employer-dashboard",(req,res)=>{
  res.render('employerDashboard.ejs',{session:req.session});
})

app.listen(8000,()=>{
console.log("Listening to port http://localhost:8000/login");
});
