import fetch from 'node-fetch'
import {
    current_week,
    last_week,
    currentDate
} from '../../utilities/datetime/index.js'
import {
    grafana_table,
    filters_status_values,
    filters_type_values,
    grafana_columns1,
    grafana_rows,
    url_byday,
    url_byday_activity
} from '../../utilities/api_tools.js'

import { cc_saveDB, cc_updateDB } from '../../utilities/db/utilities.js'

import Customer_Collection from './schema.js'

const base_url = process.env.FRESHDESK_URL

const headers = {
    'Authorization': 'Basic ' + Buffer.from(`${process.env.FRESHDESK_API_KEY}:x`).toString('base64')
}

const updateDB_obj = (field, value) => {
    let body = {
        data:{}
    }
    body.data[field] = value
    return body
}

const get_fetch = async (url) => {
    let result
    const response = await fetch(url)
    if (response.status !== 200) result = undefined
    else result = response.json()
    return result
}

const get_data = async (url) => {
    let result
    const response = await fetch(url, {
        headers
    })
    if(response.statusCode !== 200) result = undefined 
    else result = response.json()
    return result
}

const get_tickets_dayxday = async (week) => {
    const current_tickets = await get_received_tickets(week)
    const url = (qty) => base_url + `/tickets?per_page=${qty}`
    const current_tickets_tot = current_tickets.map(ticket => ticket[0]).reduce((a, b) => a + b, 0)
    const current_result = await get_data(url(current_tickets_tot))
    return current_result
}

const getTickets = async (range) => {
    const result = await Promise.all(
        range.map(async day => {
            const res = await get_data(url_byday(day.day))
            return res
        })
    )
    return result
}

const get_received_tickets = async (range) => {
    const result = await Promise.all(
        range.map(async (day) => {
            let data = await Customer_Collection.findById(day.day)
            let result
            // console.log(data)
            if (!data) {
                let result
                const res = await get_data(url_byday(day.day))
                res === undefined ? result = [0, parseInt(day.timestamp)] : result = [res.total, parseInt(day.timestamp)] 
                let body = {data: {received_t: result}}
                const newData = await cc_saveDB(day.day, body)
            } else if (data.data.received_t.length < 1) {
                const res = await get_data(url_byday(day.day))
                res === undefined ? result = [0, parseInt(day.timestamp)] : result = [res.total, parseInt(day.timestamp)] 
                let body = {data:{...data.data}}
                body.data.received_t = result
                await cc_updateDB(day.day, body)
            } else result = data.data.received_t
            return result
        })
    )
    return result
}

const get_resolved_tickets = async (range) => {
    const result = await Promise.all(
        range.map(async day => {
            let data = await Customer_Collection.findById(day.day)
            let result
            if (!data) {
                const activity_result = await get_data(url_byday_activity(day.day))
                let res
                if (activity_result !== undefined && activity_result.export !== undefined) {
                    const activity_log_result = await get_fetch(activity_result.export[0].url)
                    const resolved = await activity_log_result.activities_data.filter(log => log.activity.status === "Resolved")
                    res = resolved.length
                } else {
                    res = 0
                }
                result = [res, parseInt(day.timestamp)]
                let body = {data:{resolved_t: result}}
                await cc_saveDB(day.day, body)
            } else if (data.data.resolved_t.length < 1){
                const activity_result = await get_data(url_byday_activity(day.day))
                let res
                if (activity_result !== undefined && activity_result.export !== undefined) {
                    const activity_log_result = await get_fetch(activity_result.export[0].url)
                    const resolved = await activity_log_result.activities_data.filter(log => log.activity.status === "Resolved")
                    res = resolved.length
                } else {
                    res = 0
                }
                result = [res, parseInt(day.timestamp)]
                let body = {data: {...data.data}}
                body.data.resolved_t = result
                await cc_updateDB(day.day, body)
            } else result = data.data.resolved_t 
            return result
        })
    )
    return result
}


const get_tickets_byType = async (range) => {
    let new_array = []
    let res = {}
    filters_type_values.map(value => res[value] = 0)
    const resArray = await Promise.all(
        range.map(async day => {
            const data = await Customer_Collection.findById(day.day)
            if (!data) {
                const url = base_url + `/search/tickets?query="updated_at:%27${day.day}%27"`
                const res = await get_data(url)
                if(res !== undefined){
                    const filters_result = filters_type_values.map(value => {
                        const filtered_tickets = res.results.filter(log => log.custom_fields["cf_motivo_del_contatto_def"] === value)
                        return filtered_tickets.length
                    })
                    const rows = grafana_rows(filters_type_values, filters_result)
                    let body = {
                        data: {byType: rows}
                    }
                    await cc_saveDB(day.day, body)
                }
            } else if (data.data.byType.length === 0){
                const url = base_url + `/search/tickets?query="updated_at:%27${day.day}%27"`
                const res = await get_data(url)
                let body = {
                    data: {...data.data}
                }
                if(res !== undefined){
                    const filters_result = filters_type_values.map(value => {
                        const filtered_tickets = res.results.filter(log => log.custom_fields["cf_motivo_del_contatto_def"] === value)
                        return filtered_tickets.length
                    })
                    const rows = grafana_rows(filters_type_values, filters_result)
                    body.data.byType = rows
                } else {
                    body.data.byType = filters_type_values.map(v => [v, 0])
                }
                await cc_updateDB(day.day, body)
            } else {
                filters_type_values.map((type, index) => {
                    res[type] = res[type] + parseInt(data.data.byType[index][1])
                })
            }
        })
    )
    let rows
    if (new_array.length > 0) {
        res = filter_handler(new_array)
        rows = grafana_rows(filters_type_values, res)
    } else {
        let values = Object.values(res)
        rows = filters_type_values.map((type, index) => [type, values[index]]) 
    }
    const data = grafana_table(grafana_columns1, rows)
    return data
}

const filter_handler = (array) => filters_status_values.map(value => {
    const filtered_tickets = array.filter(log => {
        if (log.activity["status"] === value) {
            return log
        }
    })
    return filtered_tickets.length
})


const get_tickets_byStatus = async (range) => {
    let new_array = []
    let res = {}
    filters_status_values.map(value => res[value] = 0)
    const result = await Promise.all(
        range.map(async day => {
            let data = await Customer_Collection.findById(day.day)
            if(!data){
                const activity_result = await get_data(url_byday_activity(day.day))
                if (activity_result.export !== undefined) {
                    const activity_log_result = await get_fetch(activity_result.export[0].url)
                    const unique_ticket = await uniqByKeepLast(activity_log_result.activities_data, ticket => ticket.ticket_id)
                    new_array = [...new_array, ...unique_ticket]
                    let byStatus = grafana_rows(filters_status_values, filter_handler(unique_ticket))
                    let body = {data: {byStatus: byStatus}}
                    await cc_saveDB(day.day, body)
                }
            } else if (data.data.byStatus.length === 0){
                const activity_result = await get_data(url_byday_activity(day.day))
                if (activity_result !==undefined && activity_result.export !== undefined) {
                    const activity_log_result = await get_fetch(activity_result.export[0].url)
                    let body = {data:{...data.data}}
                    if (activity_log_result !== undefined) {
                        const unique_ticket = await uniqByKeepLast(activity_log_result.activities_data, ticket => ticket.ticket_id)
                        new_array = [...new_array, ...unique_ticket]
                        let byStatus = grafana_rows(filters_status_values, filter_handler(unique_ticket))
                        body.data.byStatus = byStatus
                    } else {
                        body.data.byStatus = filters_type_values.map(v => [v, 0])
                    }
                    await cc_updateDB(day.day, body)
                }
            } else{
                filters_status_values.map((status, index) => {
                    res[status] = res[status] + parseInt(data.data.byStatus[index][1])
                })
            }
        })
    )
        let rows
    if (new_array.length > 0) {
        res = filter_handler(new_array)
        rows = grafana_rows(filters_status_values, res)
    } else {
        let values = Object.values(res)
        rows = filters_status_values.map((status, index) => [status, values[index]]) 
    }
    const data = grafana_table(grafana_columns1, rows)
    return data
}

const get_tickets_unassigned = async () => {
    const current_result = await get_tickets_dayxday(current_week)
    const last_result = await Promise.all(
        last_week.map(async day => {
            const single_result = await get_data(url_byday(day.day))
            const unassigned = await single_result.results.filter(log => log.responder_id === null)
            return {
                tot: single_result.results.length,
                unassigned: unassigned.length
            }
        })
    )
    const last_week_result = await last_result.reduce((a, b) => a + b.unassigned, 0)
    const current_week_result = current_result.filter(log => log.responder_id === null)
    // const percentage = last_week_result * 100 / current_week_result.length
    
    const rows = [
        ["Last Week Unassigned", last_week_result],
        ["Current Week Unassigned", current_week_result.length]
    ]
    const data = grafana_table(grafana_columns1, rows)
    return data
}

const get_comparison_received = async () => {
    const current_result = await get_tickets_dayxday(current_week)
    const last_result = await Promise.all(
        last_week.map(async day => {
            const single_result = await get_data(url_byday(day.day))
            const unassigned = await single_result.results.filter(log => log.responder_id === null)
            return {
                tot: single_result.results.length,
                unassigned: unassigned.length
            }
        })
    )
    const last_week_received = await last_result.reduce((a, b) => a + b.tot, 0)
    const rows = [
        ["Last Week Received", last_week_received],
        ["Current Week Received", current_result.length]
    ]
    const data = grafana_table(grafana_columns1, rows)
    return data
}

function uniqByKeepLast(a, key) {
    return [
        ...new Map(
            a.map(x => [key(x), x])
        ).values()
    ]
}

export {
    get_received_tickets,
    get_resolved_tickets,
    get_tickets_byType,
    get_tickets_byStatus,
    get_tickets_unassigned,
    get_comparison_received,
    getTickets
}