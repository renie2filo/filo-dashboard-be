import express from 'express'
import {current_week, get_currentRange, currentDate} from '../../utilities/datetime/index.js'
import {get_received_tickets, get_resolved_tickets} from './api.js'
import tables from './tables.js'

const router = express.Router()

router.use('/tables', tables)


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
        const result = ["Received", "Resolved"]
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        const days = req.body.rangeRaw.from.replace('now-','').replace('d','')
        const range = get_currentRange(currentDate, parseInt(days))
        const received_tickets = await get_received_tickets(range)
        const resolved_tickets = await get_resolved_tickets(range)
        res.status(200).send([{target: 'Received', datapoints: received_tickets}, {target: "Resolved", datapoints: resolved_tickets}])

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