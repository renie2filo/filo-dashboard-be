import mongoose from 'mongoose'
const {Schema} = mongoose

const Customer_Collection = mongoose.createConnection(process.env.MONGODB_CC)

const CustomerModel = new Schema({
    _id: {type: 'String'},
    data: {
        received: {type: 'Number'},
        unassigned: {type: 'Number'},
        byType: [[{type: 'String'}, {type: 'Number'}]],
        byStatus: [[{type: 'String'}, {type: 'Number'}]],
        received_t: [{type: 'Number'}, {type: 'Number'}],
        resolved_t: [{type: 'Number'}, {type: 'Number'}]
    }
})

export default Customer_Collection.model('day', CustomerModel)