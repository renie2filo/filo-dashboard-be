import express from 'express';
import moment from 'moment';
import {sheet_getData, andamento_tot_range, get_production} from './sheet.js'
const router = express.Router();

router.route('/').get(async (req, res, next) => {
    try {
        res.status(200).send('Test Connection Successfull')
    } catch (error) {
        console.log(error)
        next(error)

    }
})

router.route('/search').post(async (req, res, next) => {
    try {
        const result = ["Totale", "Production"]
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)

    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        const target = req.body.targets[0].target
        let result

        switch(target){
            case 'Totale': {
                const data = await sheet_getData(process.env.ANDAMENTO_TOT_ID, andamento_tot_range)
                const months = data.values[0].slice(0, data.values[1].length).map((month, index) => `2021-0${index+1}`)
                const res = months.map((month, index) =>{
                    let value = data.values[1][index].replace('.',"").replace('.','').replace('€','').replace(',','.')
                    const timestamp = moment(month).format('YYYY-MM').valueOf()
                    return [parseFloat(value), timestamp]
                })
                result = [{target: "Totale", datapoints: res}]
            }
            break;
            case 'Production' : {
                const productions = await get_production()
                result = productions
            }
            default:;
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