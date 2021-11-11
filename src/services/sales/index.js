import express from 'express';
import {deals, columns_2021, columns_vs} from './api.js'
import fe_data_router from './fe_data.js'
import Sales_Collection from './schema.js'
import moment from 'moment'

const router = express.Router();

router.use('/fe', fe_data_router)

router.route('/').get(async (req, res, next) => {
    console.log('ciao')
    try {
        res.status(200).send('Test Connection Successfull')
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

router.route('/search').post(async (req, res, next) => {
    try {
        const result = ["Deals Comparison", "Deals Summary", 'Deals Values']
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        let result
        let comparions_d, summary_d
        const date = moment().format('YYYY-MM-DD')
        const data = await Sales_Collection.findById('617abdfa6a0039d62f27953e')
        if(data.data.updated_at === date) {
            comparions_d = [{
                columns: columns_vs,
                rows: data.data.year.map(month => [month[0],parseInt(month[1]),parseInt(month[2]),parseInt(month[3])]),
                type: 'table'
            }]
            summary_d = [{
                columns: columns_2021,
                rows: Object.keys(data.data.status).map((key, index) => [key, data.data.status[key]]),
                type: 'table'
            }]
        } else {
            const {comparions, summary} = await deals(date)
            comparions_d = comparions
            summary_d = summary
        }
        switch (req.body.targets[0].target){
            case "Deals Comparison": result = comparions_d;
            break;
            case "Deals Summary": result = summary_d;
            break;
            default: 'No Result'
        }
        res.send(result)

    } catch (error) {
        console.log(error)
        next(error)
    }
})


router.route('/annotations').post(async (req, res, next) => {
    try {
        res.send('annotations')
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default router