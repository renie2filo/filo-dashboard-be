import Customer_Collection from '../../services/customer_care/schema.js'
import Tata_Brain_DB from '../../services/tata_brain/schema.js'

const cc_saveDB = async (date, body) => {
    let newData = await new Customer_Collection(body)
    newData._id = date
    await newData.save()
}

const cc_updateDB = async (date, body) => {
    const updatedData = await Customer_Collection.findByIdAndUpdate({_id: date}, body, {new: true})
    await updatedData.save()
}

const tata_brain_saveDB = async (date, body) => {
    let newData = await new Tata_Brain_DB(body)
    newData._id = date
    await newData.save()
}

const tata_brain_updateDB = async (date, body) => {
    const updatedData = await Tata_Brain_DB.findByIdAndUpdate({_id:date}, body, {new: true})
    await updatedData.save()
}



export {cc_saveDB, cc_updateDB, tata_brain_saveDB, tata_brain_updateDB}