const dotenv = require("dotenv")
dotenv.config();
const app = require('./app');
const cloudinary = require("cloudinary");
const connectDB = require("../backend/db/database");
require("./db/database")
// const connectDatabase = require("./db/database");

// // handling uncaught error
// process.on("uncaughtException", err => {
//     console.log(`Error: ${err.message}`);
//     console.log("shutting down the server due to uncaughtexception error")
//     process.exit(1);
// })

// confiq
dotenv.config()
connectDB();
const PORT = process.env.PORT || 8000;

// connectDatabase();
cloudinary.config({
    cloud_name:"drbzzh6j7",
    api_key: 776943229854165,
    api_secret: "RWZatGE-U7hTRE0Re8XM8JnVv84"
});

app.get("/",(req,res) => {
    res.send("Server Completed")
})

const server = app.listen(PORT, () => {
    console.log("server started on http/localhost: ",PORT);
});

// console.log(youtuber)

// Unhandled Promise Rejections
// process.on("unhandledRejection", err => {
//     console.log(`Error: ${err.message}`);
//     console.log("Shuting down the server due to unhandled promise rejection");
//     server.close(() => {
//         process.exit(1);
//     });
// })