import express from 'express';
import time_route from './timerange.js'
import tables_route from './tables.js'
import {get_production_tot} from './sheet.js'

const router = express.Router();

router.use('/time', time_route)
router.use('/table', tables_route)
router.route('/fe').get(async (req, res, next) =>{
    try {
        const result = await get_production_tot()
        res.send(result)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default router