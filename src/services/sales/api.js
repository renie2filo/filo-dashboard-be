import fetch from 'node-fetch'
import {
    p_filter_closed_since,
    p_filter_created_since,
    filterBy_closed_date,
    filterBy_status,
    groupBy_month
} from './filters.js'

import Sales_Collection from './schema.js'

const baseUrl = (endpoint, query) => `${process.env.PIPEDRIVE_URL}/${endpoint}?${query}&api_token=${process.env.PIPEDRIVE_API_KEY}`

const get_allDeals = async (filterId) => {
    let results = []
    const query = (start) => `filter_id=${filterId}&limit=500&start=${start}`
    for (let i = 0; i >= 0; i = i + 500) {
        const response = await fetch(baseUrl('deals', query(i)))
        const result = await response.json()
        if (!result.data) break;
        else results = results.concat(result.data)

    }
    return results
}


const deals = async (today) => {
    const data = await Sales_Collection.findById('617abdfa6a0039d62f27953e')
    const results_closed = await get_allDeals(p_filter_closed_since)
    const results_created = await get_allDeals(p_filter_created_since)
    const closed_byMonth = await groupBy_month(results_closed, '2021', 'close_time')
    const created_byMonth = await groupBy_month(results_created, '2021', 'add_time')
    const won_deals = closed_byMonth.map(month => month.length > 0 ? filterBy_status(month, 'won') : [])
    const lost_deals = closed_byMonth.map(month => month.length > 0 ? filterBy_status(month, 'lost') : [])
    const open_deals = created_byMonth.map(month => month.length > 0 ? filterBy_status(month, 'open') : [])

    const open_deals_2021 = filterBy_status(results_created, 'open')
    const lost_deals_2021 = filterBy_status(results_created, 'lost')
    const won_deals_2021 = filterBy_status(results_created, 'won')

    const deals_summary_2021 = [open_deals_2021, lost_deals_2021, won_deals_2021]

    const body_update = {
        data:{
            ...data.data,
            years: rows_vs.map((month, index) => {
                return [month, won_deals[index].length, lost_deals[index].length, open_deals[index].length]
            }),
            status: {
                open: deals_summary_2021[0].length,
                lost: deals_summary_2021[1].length,
                won: deals_summary_2021[2].length,
            },
            updated_at: today
        }
    }

    const db_update = await Sales_Collection.findByIdAndUpdate('617abdfa6a0039d62f27953e', body_update)
    await db_update.save()

    const deals_2021 = [{
        columns: columns_2021,
        rows: rows_2021.map((value, i) => [value, deals_summary_2021[i].length]),
        type: 'table'
    }]

    const deals_vs = [{
        columns: columns_vs,
        rows: rows_vs.map((month, index) => [month, won_deals[index].length, lost_deals[index].length, open_deals[index].length]),
        type: 'table',
    }]
    return {comparions: deals_vs, summary: deals_2021}
}

const columns_vs = [{
        text: 'Tipo',
        type: 'string',
    },
    {
        text: 'Open',
        type: 'number'
    },
    {
        text: 'Lost',
        type: 'number'
    },
    {
        text: 'Won',
        type: 'number'
    }
]
const rows_vs = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']


const columns_2021 =[{
        text: 'Tipo',
        type: 'string',
    },
    {
        text: 'Valore',
        type: 'number'
    }
]
const rows_2021 = ['Open', 'Lost', 'Won']


export {
    deals,
    get_allDeals,
    baseUrl,
    columns_vs,
    columns_2021,
}