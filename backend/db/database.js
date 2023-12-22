// var mongoose = require("mongoose");




// mongoose.connect()

// .then(() => console.log("database connected successfully"))
// .catch((err) => console.log(err));


const mongoose = require("mongoose");

const connectDB = async() => {
    try {
       const connection = await mongoose.connect("mongodb+srv://phritik06:zfXJ65SNiZoXhayt@eccom.zqrt7ny.mongodb.net/Shopify?retryWrites=true&w=majority");
       console.log("Databse Connected Successfully");
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB;
