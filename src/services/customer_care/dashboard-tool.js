import moment from "moment"
const byTypeTable = (array) => {
    const columns= [{text: 'Tipo', type: 'string'}, {text: 'Valore', type: 'number'}]
    const noValue = array.reduce((acc, ticket) => acc + ticket.data.byType['No Value'], 0)
    const info = array.reduce((acc, ticket) => acc + ticket.data.byType['Richiesta Informazioni'], 0)
    const orders = array.reduce((acc, ticket) => acc + ticket.data.byType['Ordini e Spedizioni'], 0)
    const ast_tech = array.reduce((acc, ticket) => acc + ticket.data.byType['Assistenza Tecnica'], 0)
    const rows = [
        ['No Value', noValue],
        ['Richiesta Informazioni', info],
        ['Ordini e Spedizioni', orders],
        ['Assistenza Tecnica', ast_tech],
    ]
    return[{
        columns,
        rows,
        type: 'table'
    }]
}
const byStatusTable = (array) => {
    const columns= [{text: 'Tipo', type: 'string'}, {text: 'Valore', type: 'number'}]
    const byStat1 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Risolto con invio sondaggio'], 0)
    const byStat2 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Open'], 0)
    const byStat3 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Pending'], 0)
    const byStat4 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Follow up'], 0)
    const byStat5 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Resolved'], 0)
    const byStat6 = array.reduce((acc, ticket) => acc + ticket.data.byStatus['Closed'], 0)
    const rows = [
        ['Risolto con invio sondaggio', byStat1],
        ['Open', byStat2],
        ['Pending', byStat3],
        ['Follow up', byStat4],
        ['Resolved', byStat5],
        ['Closed', byStat6],
    ]
    return[{
        columns,
        rows,
        type: 'table'
    }]
}

const rec_vs_res = (array) => {
    const received = {
        target: 'Received',
        datapoints: array.map(ticket => {
            return[
                ticket.data.received,
                parseInt(moment(ticket._id).format('x'))
            ]
        })
    }
    const resolved = {
        target: 'Resolved',
        datapoints: array.map(ticket => {
            return[
                ticket.data.resolved,
                parseInt(moment(ticket._id).format('x'))
            ]
        })
    }
    return [received, resolved]
}

export {byTypeTable, byStatusTable, rec_vs_res}