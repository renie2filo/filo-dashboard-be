import express from 'express'
import {
    current_week,
    get_currentRange,
    currentDate
} from '../../utilities/datetime/index.js'
import {
    getTickets,
    get_received_tickets,
    get_tickets_byType,
    get_tickets_byStatus,
    get_comparison_received,
    get_tickets_unassigned
} from './api.js'

const router = express.Router()

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
        const result = ["Received", "Unassigned", "Type", "Status"]
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
        // const received_tickets = await getTickets(range)
        // const total_tickets = received_tickets.map(ticket => ticket[0]).reduce((a, b) => a + b, 0)
        // console.log(total_tickets)
        const byType = await get_tickets_byType(range)
        const byStatus = await get_tickets_byStatus(range)
        // const received = await get_comparison_received()
        // const unassigned = await get_tickets_unassigned()
        let result;
        switch (req.body.targets[0].target) {
            // case 'Received':
            //     result = received;
            //     break;
            // case 'Unassigned':
            //     result = unassigned;
            //     break;
            case 'Type':
                result = byType;
                break;
            case 'Status':
                result = byStatus;
                break;
            default:
                console.log(req.body.targets[0].target)
        }
        res.status(200).send(result)
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