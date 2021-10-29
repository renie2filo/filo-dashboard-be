const base_url = process.env.FRESHDESK_URL
const createdAt_range = (from, to) => `${filter_query}"created_at:>%27${from}%27%20AND%20created_at:<%27${to}%27`
const createdAt = (date) => `created_at:%27${date}%27`
const url_byday = (day) => base_url + `/search/tickets?query="${createdAt(day)}"`
const url_byday_activity = (day) => base_url + `/export/ticket_activities?created_at=${day}`

const grafana_table = (columns, rows) => {
    return [{
        columns,
        rows,
        type: "table"
    }]
}

const grafana_rows = (values_array, result) => {
    return values_array.map((el, index) => el === null ? ["No value", result[index]] : [el, result[index]])
}

const grafana_columns1 = [{
        text: "Tipo",
        type: "string"
    },
    {
        text: "Valore",
        type: "number"
    }
]

const filters_type_values = [
    null,
    "Assistenza tecnica",
    "Ordini e spedizioni",
    "Richiesta informazioni"
]

const filters_status_values = [
    "Risolto con invio sondaggio",
    "Waiting on Third Party",
    "Follow up",
    "Open",
    "Pending",
    "Resolved",
    "Closed"
]

export {
    grafana_table,
    filters_status_values,
    filters_type_values,
    grafana_columns1,
    grafana_rows,
    createdAt_range,
    url_byday,
    createdAt,
    url_byday_activity,
}