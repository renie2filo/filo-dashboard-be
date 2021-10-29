const p_filter_closed_since = '1400'
const p_filter_created_since = '1401'
const p_filter_last_month = '1437'

const filterBy_status = (array, status) => array.filter(obj => obj.status === status)
const filterBy_closed_date = (array, date) => array.filter(obj => obj.close_time.includes(date))

const groupBy_month = (array, year, field) => {
    let result = []
    for (let i = 1; i < 13; i++) {
        const month = i < 10 ? `0${i}` : i
        const month_result = array.filter(obj => obj[field].includes(`${year}-${month}`))
        result = [...result, month_result]
    }
    return result
}

export {
    p_filter_closed_since,
    p_filter_created_since,
    p_filter_last_month,
    filterBy_closed_date,
    filterBy_status,
    groupBy_month
}