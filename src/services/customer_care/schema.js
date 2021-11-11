import mongoose from 'mongoose'
const {Schema} = mongoose

const Customer_Collection = mongoose.createConnection(process.env.MONGODB_CC)

const CustomerModel = new Schema({
    _id: {type: 'String'},
    data: {
        byType: {
            'No Value': {type: 'Number'},
            'Richiesta Informazioni': {type: 'Number'},
            'Ordini e Spedizioni': {type: 'Number'},
            'Assistenza Tecnica': {type: 'Number'},
        },
        byStatus: {
            'Risolto con invio sondaggio': {type: 'Number'},
            'Open': {type: 'Number'},
            'Pending': {type: 'Number'},
            'Follow up': {type: 'Number'},
            'Resolved': {type: 'Number'},
            'Closed': {type: 'Number'}
        },
        unassigned: {type: 'Number'},
        received: {type: 'Number'},
        resolved: {type: 'Number'},
        fr_time:{type: 'Number'},
        resolution_time:{type: 'Number'},
    }
})

export default Customer_Collection.model('day', CustomerModel)