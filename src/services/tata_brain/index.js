import { Router } from "express"

import {getData, getRangeData} from './api.js'

import {get_currentRange} from '../../utilities/datetime/index.js'

import moment from 'moment'

const router = Router()

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
        const result = ["Today Alarm", "Alarms", "Today Monitor", "Monitors"]
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        const from = moment(req.body.range.from)
        const to = moment(req.body.range.to)
        const days = to.diff(from, 'days') +1
        const range = get_currentRange(to, parseInt(days))
        const localtime = moment(req.body.range.to).utcOffset('+02:00').format('YYYY-MM-DD HH:mm:ss')
        let data
        switch(req.body.targets[0].target){
            case 'Today Alarm': data = await getData(req.body.range.to.substring(0, 10), localtime.substring(11,13), 'alarm');
            break;
            case 'Today Monitor': data = await getData(req.body.range.to.substring(0, 10), localtime.substring(11,13), 'monitor');
            break;
            case 'Alarms': data = await getRangeData(range, localtime.substring(11, 13), 'alarm');
            break;
            case 'Monitors': data = await getRangeData(range, localtime.substring(11, 13), 'monitor');
            break;
            default:
                console.log('Invalid target');
        }
        res.status(200).send(data)

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