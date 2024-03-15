import mongoose from "mongoose";

mongoose.connect("mongodb://localhost/companydb")
    .then(db => console.log('Connected to Database'))
    .catch(err => console.error(err));
