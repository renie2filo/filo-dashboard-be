import express from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';
import mongoose from 'mongoose';
import router from './services/index.js';
import {notFound, unAuthorized, forbidden, badRequest, generalError} from './utilities/errors/index.js'

const server = express();
const PORT = process.env.PORT || 5001;
// const whiteList = process.env.NODE_ENV === 'production' ? [process.env.PROD_URL, process.env.DEV_URL] : [process.env.DEV_URL]
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whiteList.indexOf(origin) !== -1 || !origin) {
//             callback(null, true)
//         } else {
//             callback(new Error("CORS ISSUES : Invalid origin - Check origins list"))
//         }
//     }
// }

server.use(express.json());
server.use(cors());

server.get("/", async (req, res, next) => {
    try {
        res.send('<h1>Welcome to Filo Dashboard</h1>')
    } catch (error) {
        console.log(error)
        next(error)
    }
})
server.use('/', router)

//! ERRORS
server.use(notFound)
server.use(unAuthorized)
server.use(forbidden)
server.use(badRequest)
server.use(generalError)


//*CONSOLE LOG
console.log(listEndpoints(server))

server.listen(PORT, () => {
    process.env.NODE_ENV === "production" ?
        console.log(`Server running ONLINE on: ${PORT}`) :
        console.log(`Server running OFFLINE on: http://localhost:${PORT}`)
})
