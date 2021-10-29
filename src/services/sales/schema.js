import mongoose from 'mongoose'
const {Schema} = mongoose

const Sales_Collection = mongoose.createConnection(process.env.MONGODB_SALES)
const SalesModel = new Schema({
    data: {
        year:[[String, Number, Number, Number]],
        status:{
            open:{type: 'Number'},
            lost:{type: 'Number'},
            won:{type: 'Number'},
        },
        values:{
            open:{type: 'String'},
            lost:{type: 'String'},
            won:{type: 'String'},
        },
        updated_at:{type: 'String'}
    }
})



export default Sales_Collection.model('data', SalesModel)