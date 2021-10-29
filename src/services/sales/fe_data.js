import {Router} from 'express';
import {get_allDeals} from './api.js'
import {
    p_filter_closed_since,
    p_filter_created_since,
    p_filter_last_month
} from './filters.js'
import moment from 'moment'

import Sales_Collection from './schema.js'

const router = Router()

router.route('/').get(async (req, res, next) => {
    try {
        const query = req.query.data
        let result
        const today = moment().format('YYYY-MM-DD')
        const data = await Sales_Collection.findById('617abdfa6a0039d62f27953e')

        switch(query){
            case 'values' : {
                if(data.data.updated_at !== today){
                    const results_closed = await get_allDeals(p_filter_closed_since)
                    const results_created = await get_allDeals(p_filter_created_since)        
                    
                    const won_deals_value = results_closed.filter(res => res.status === 'won').reduce((a, res) => a + res.value, 0).toString()
                    const lost_deals_value = results_closed.filter(res => res.status === 'lost').reduce((a, res) => a + res.value, 0).toString()
                    const open_deals_value = results_created.filter(res => res.status === 'open').reduce((a, res) => a + res.value, 0).toString()
    
                    const round = (str) => {
                        let index = str.indexOf('.')
                        let strV = str.substring(0, index)
                        let kOrM = strV.length > 6 ? strV.substring(0,2) : strV.substring(0,4)
                        let num = parseInt(kOrM) / 10
                        let value = Math.round(num * 10) / 10
                        return value > 100 ? `${value}k` : `${value}M`
                        // return value
                    }
                    
                    const values = {
                        open: round(open_deals_value),
                        lost: round(lost_deals_value),
                        won: round(won_deals_value)
                    }
                    const body_update = {
                        data:{
                            ...data.data,
                            values, 
                            updated_at: today
                        }
                    }
                
                    const db_update = await Sales_Collection.findByIdAndUpdate('617abdfa6a0039d62f27953e', body_update)
                    await db_update.save()
    
                    result = values
                } else {
                    result = data.data.values
                }
            };
            break;
            case 'last_deals' : {
                const last_deals = await get_allDeals(p_filter_last_month)

                const last_deals_data = last_deals.map(res => {
                    return{
                        user: res.user_id.name,
                        value: res.value,
                        title: res.title,
                        status: res.status,
                        created_at: res.add_time,
                    }
                })

                result = last_deals_data.reverse().splice(0,20)
            };
            break;
            default: ;
        }

        res.send(result)

    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default router