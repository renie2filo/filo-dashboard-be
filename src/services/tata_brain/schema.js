import mongoose from 'mongoose'
const {Schema} = mongoose

const Tata_Brain_DB = mongoose.createConnection(process.env.MONGODB_TATA_BRAIN)

const TataBrainModel = new Schema({
    _id: {type: 'String'},
    hours:[
        {
            hour: {type: 'String'},
            a0: {type: 'String'},
            a1: {type: 'String'},
            a2: {type: 'String'},
            a3: {type: 'String'},
            event_timestamp: {type: 'String'},
            monitors: {type: 'String'}
        }
    ]
})

export default Tata_Brain_DB.model('day', TataBrainModel)