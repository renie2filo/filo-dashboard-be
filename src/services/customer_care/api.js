import fetch from 'node-fetch';
import CC_DB from './schema.js'
import {compareDates, diff} from './api-tools.js'

const baseUrl = process.env.FRESHDESK_URL
const activityUrl = process.env.FRESHDESK_ACTIVITY_URL
const key = process.env.FRESHDESK_API_KEY

const headers = {
    'Authorization': 'Basic ' + Buffer.from(`${key}:x`).toString('base64')
}

const getTickets = async (date) => {
    const url = baseUrl + `/search/tickets?query="created_at:%27${date}%27"`
    const response = await fetch(url, {headers: headers})
    const result = await response.json()
    return result
}

const statsTickets = async (date) => {
    const url = baseUrl + `/tickets?include=stats&updated_since=${date}&per_page=100`
    const response = await fetch(url, {headers: headers})
    const result = await response.json()
    return result
}

const activityTickets = async (date) => {
    const url = activityUrl + `?created_at=${date}`
    const response = await fetch(url, {headers: headers})
    const result = await response.json()
    let list
    if (result.message === 'file_not_found'){
        list = null
    } else {
        const activity_res = await fetch(result.export[0].url)
        const activity_result = await activity_res.json()
        list = activity_result
    }
    return list
}


const getUnassigned = async (ticketsArray) => {
    const unassigned = ticketsArray.filter(ticket => ticket.responder_id === null).map(ticket => ticket.responder_id)
    return unassigned.length
}

const getResolved = async (ticketsArray, date) => {
    const list = ticketsArray.map(ticket => {return{id: ticket.id, stats:ticket.stats}})
    const resolved = list.filter(ticket => {if (ticket.stats.resolved_at) return ticket.stats.resolved_at.substring(0,10) === date})
    return resolved.length
}

const getByType = async (ticketsArray) => {
    const type = ticketsArray.map(ticket => {return{id:ticket.id, type:ticket.custom_fields.cf_motivo_del_contatto_def}})
    const obj = {
        "No Value": type.filter(ticket => ticket.type === null).length,
        "Richiesta Informazioni" : type.filter(ticket => ticket.type === "Richiesta informazioni").length,
        "Ordini e Spedizioni": type.filter(ticket => ticket.type === "Ordini e spedizioni").length,
        "Assistenza Tecnica": type.filter(ticket => ticket.type === "Assistenza tecnica").length,
    }
    return obj
}

const getByStatus = async (ticketsArray) => {
    let final=[]
    const list = ticketsArray.map(ticket => {
        if (ticket.activity.status) return {id: ticket.ticket_id, status: ticket.activity.status, activity: ticket.performed_at.substring(11, 19)}
    }).filter(ticket => ticket !== null && ticket !== undefined)
    list.map(ticket => {
        if (final.length > 0) {
            let check = final.find(item => item.id === ticket.id)
            if (check && check !== undefined){
                let result = compareDates(check, ticket)
                final = final.filter(item => item !== check)
                final.push(result)
            } else final.push(ticket)
        } else final.push(ticket)
    })
    const obj = {
        "Risolto con invio sondaggio" : final.filter(ticket => ticket.status === 'Risolto con invio sondaggio').length,
        "Open" : final.filter(ticket => ticket.status === 'Open').length,
        "Pending" : final.filter(ticket => ticket.status === 'Pending').length,
        "Follow up": final.filter(ticket => ticket.status === 'Follow up').length,
        "Resolved" : final.filter(ticket => ticket.status === 'Resolved').length,
        "Closed" : final.filter(ticket => ticket.status === 'Closed').length,
    }
    return obj
}

const getFR = async (ticketsArray) => {
    const list = ticketsArray.map(ticket => {return{id: ticket.id, first_response: ticket.stats.first_responded_at, created_at: ticket.created_at}}).filter(ticket => ticket.first_response !== null)
    let avg = list.reduce((acc, item) => acc + diff(item.first_response, item.created_at),0)
    avg = Math.floor(avg / list.length)
    return avg
}

const getResolution = async (ticketsArray) => {
    const list = ticketsArray.map(ticket => {return{id: ticket.id, resolved: ticket.stats.resolved_at, created_at: ticket.created_at}}).filter(ticket => ticket.resolved !== null)
    let avg = list.reduce((acc, item) => acc + diff(item.first_response, item.created_at),0)
    avg = Math.floor(avg / list.length)
    return avg
}

export {getUnassigned, getResolved, getByType, getByStatus, getTickets, statsTickets, activityTickets, getFR, getResolution}