import express from 'express'
import tables from './tables.js'
import {get_rangeDates} from '../../utilities/datetime/index.js'
import {cc_saveDB, cc_updateDB} from '../../utilities/db/utilities.js'
import moment from 'moment'
import CC_DB from './schema.js'
import {byTypeTable, byStatusTable, rec_vs_res} from './dashboard-tool.js'
import {getTickets, getUnassigned, statsTickets, getResolved, getByType, activityTickets, getByStatus, getFR, getResolution} from './api.js'

const router = express.Router()

// router.use('/tables', tables)


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
        const result = ["ByType", 'ByStatus', 'Rec Vs Res']
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        const from = req.body.range.from.substring(0,10)
        const to = req.body.range.to.substring(0,10)
        const today = moment().format('YYYY-MM-DD')
        let range_to
        to === today ? range_to = moment().subtract(1, 'days').format('YYYY-MM-DD') : to
        const range = get_rangeDates(from, to)
        let datas = []
        let result
        await Promise.all(
            range.map(async day => {
                let data = await CC_DB.findById(day)
                const activityTicket = await activityTickets(day)
                let checkStatus
                if(data){
                    checkStatus = Object.values(data.data.byStatus).find(stat => stat !== 0)
                } else {
                    checkStatus = undefined
                }
                // console.log(checkStatus)
                if(!data){
                    const dayTickets = await getTickets(day)
                    const dayStats = await statsTickets(day)
                    const obj = {
                        data:{
                            byType: await getByType(dayTickets.results),
                            byStatus: activityTicket ? await getByStatus(activityTicket.activities_data) : {
                                'Risolto con invio sondaggio': 0,
                                'Open': 0,
                                'Pending': 0,
                                'Follow up': 0,
                                'Resolved': 0,
                                'Closed': 0
                            },
                            resolved: await getResolved(dayStats, day),
                            received: dayTickets.total,
                            fr_time: await getFR(dayStats),
                            resolution_time: await getResolution(dayStats),
                            unassigned: await getUnassigned(dayTickets.results)
                        }
                    }
                    await cc_saveDB(day, obj)
                    datas=datas.concat({_id: day, data: {...obj.data}})
                } else if(checkStatus === undefined && activityTicket) {
                    const updated = {...data}
                    data.data.byStatus = await getByStatus(activityTicket.activities_data)
                    await cc_updateDB(day, updated)
                    datas=datas.concat(updated)
                } else {datas = datas.concat(data)}
            })
        )
            switch(req.body.targets[0].target){
                case 'ByType' : result = byTypeTable(datas)
                break;
                case 'ByStatus' : result = byStatusTable(datas)
                break;
                case 'Rec Vs Res' : result = rec_vs_res(datas)
                break;
                default : ;
            }
        // test = await fR.reduce((acc, item) => acc + item.ticket, 0)
        // console.log(test)
        // let avg = `${Math.floor(Math.floor(test / 24) / fR.length)}D${Math.floor(test / 24) % fR.length}H`
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