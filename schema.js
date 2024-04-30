require("dotenv").config();
const dbUrl = process.env.DB_CONNECT;
const mongoose = require('mongoose');
mongoose.connect(dbUrl).then(()=>{
  console.log("Db in Schema Connected");
}).catch((err)=>{
  console.log(err);
});

//User - Job Seeker or employer
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['job seeker', 'employer'], required: true },
    googleId:{type:String,required:false}
    // Add other fields as needed
  });
  
  //Saved Jobs
  const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    jobDescription: { type: String, required: true },
    location: { type: String, required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    // Add other fields as needed
  });

  //Apply For Jobs 
  const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    // Add other fields as needed
  });
  
  //Company Data Stored for the job posted by employer
  const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    industry: { type: String },
    // Add other fields as needed
  });

  //Featured
  const featuredJobSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    // Add other fields as needed
  });
 

  //Notify by email
  const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    // Add other fields as needed
  });
  
  // Define models
  const User = mongoose.model('User', userSchema);
  const Job = mongoose.model('Job', jobSchema);
  const Application = mongoose.model('Application', applicationSchema);
  const Company = mongoose.model('Company', companySchema);
  const FeaturedJob = mongoose.model('FeaturedJob', featuredJobSchema);
  const Notification = mongoose.model('Notification', notificationSchema);
  
  module.exports = {
    User,
    Job,
    Application,
    Company,
    FeaturedJob,
    Notification,
  };
  