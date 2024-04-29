
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
const { User, Job, Application, Company, FeaturedJob, SavedJob, Notification } = require('./schema');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// My crypto generated secret key for sessions: fafdae1eeb3ae2f685fd8850a09b8695437caa02ee3ea1d203cf4a711c188cc5
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// const dbUrl = 'mongodb+srv://harshkhatri682:z7L7PrhHoJT8Cb2H@job-board.layuqym.mongodb.net/';
mongoose.connect(dbUrl, {
}).then(() => {
  console.log("Db Connected Successfully");
}).catch(err => {
  console.error("Error connecting to database:", err);
});
// Go to previous page (USE of Middleware)
app.use((req, res, next) => {
  if(req.url==='/login'){
  next();
  }
  // Store the current page's URL in the session
  req.session.redirectUrl = req.session.previousUrl;
  req.session.previousUrl = req.originalUrl;
  next();
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





    // res.redirect('/select-role');
    // Make a POST request to your /signup route with the user data
    
    // Now that authentication is complete, you can access the user's data from Google
    // const userData = req.user;

    // Prepare the data to be sent in the POST request
    // const postData = {
    //   username: userData.displayName,
    //   email: userData.email,
    //   role: req.session.role // Assuming you store the user's selected role in the session
    //   // You may need to adjust this based on how you store the user's role
    // };

    // try {
    //   // Make the POST request to the /signup route
    //   const response = await axios.post('http://localhost:8000/signup', postData);

    //   // Assuming the signup process is successful, update the session data
    //   req.session.userData = postData;
    //   req.session.signedUp = true;

    //   // Render the homepage with the updated session data
    //   res.render('index.ejs', { userData: req.session.userData });
    // } catch (error) {
    //   console.error(error);
    //   // Handle error appropriately
    //   res.status(500).send('Internal Server Error');
    // }
    
    // if (req.isAuthenticated()) {
    //   // If the user is already logged in, render the home page
    //   const userData = req.user;

    
    // } else {
    //   // If the user is not logged in, render the role selection page
    //   res.render('role.ejs', { session: req.session });
    // }
    // console.log('redirect and previous',req.session.redirectUrl,req.session.previousUrl); 

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


  
app.get("/login",(req,res)=>{
  res.render('login.ejs');
})

app.listen(8000,()=>{
console.log("Listening to port http://localhost:8000/login");
});



      
      
      
  
   
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    
// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}' 'unsafe-inline'`);
//     next();
// });
//       const crypto = require('crypto');
// const nonce = crypto.randomBytes(16).toString('base64');
// console.log(nonce);

      // Middleware

// Connect to MongoDB





// // Serialize and deserialize user data to store/retrieve from the session
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((obj, done) => done(null, obj));

// app.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/signup' }),
//   (req, res) => {
//     res.redirect('/');
//   });

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });





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


  //////////////////////////////////////////////////////////
  // Assuming validation passes, you can proceed with the signup logic
  // For simplicity, let's assume the signup process is successful

  // Render the homepage with the username
  // res.render('index', { username });
});

//User Login
app.post("/login",async(req,res)=>{
  const { email, password } = req.body;
console.log("user data",email,password);
      // Validate the user's credentials
      const user = await User.findOne({ email, password });
      // console.log("user data",user.email,user.password);

      if (!user) {
          throw new Error("Invalid email or password");
      }

      // Store user data in the session
      req.session.userData = await { username:user.username,email: user.email, role:user.role}; // You can store more user data if needed
      req.session.loggedIn  = true;
      // Render index.ejs with user data
      res.redirect("/home");
      // res.render('index.ejs', { userData: req.session.userData });
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
    const jobs = await Job.find().populate('company');
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
    // console.log(jobs);
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
    const application = new Application({
      job: jobId,
      candidate: candidateId,
      resumeUrl,
      coverLetter,
      status: 'pending'
    });
    await application.save();
    res.send('Application submitted successfully');
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
// app.get("/login",(req,res)=>{

//   res.render('login.ejs',);
// })
// Start the server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
