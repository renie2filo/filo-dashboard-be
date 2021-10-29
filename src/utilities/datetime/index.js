import moment from "moment"

const currentDate = moment().format('YYYY-MM-DD')

const get_workWeek = (date, days) => {
    date = moment(date);
    // console.log(date)
    let workWeek = []
    while (days > 0) {
            workWeek.push({day: date.format('YYYY-MM-DD'), timestamp: moment(date).format('x')});
            date = date.subtract(1, 'days');
        days -= 1;
    }
// console.log(workWeek)
    return workWeek;
}
const get_lastWorkWeek = (date, days) => {
    date = moment(date).subtract(1, 'days');
    // console.log(date)
    let workWeek = []
    while (days > 0) {
            workWeek.push({day: date.format('YYYY-MM-DD'), timestamp: moment(date).format('x')});
            date = date.subtract(1, 'days');
        days -= 1;
    }
// console.log(workWeek)
    return workWeek;
}

const get_currentRange = (date, days) => {
    date = moment(date);
    // console.log(date)
    let current_range = []
    while (days > 0) {
            current_range.push({day: date.format('YYYY-MM-DD'), timestamp: moment(date).format('x')});
            date = date.subtract(1, 'days');
        days -= 1;
    }
// console.log(current_range)
    return current_range;
}

const get_rangeDates = (from, to) => {
    let from_date = moment(from).format('YYYY-MM-DD')
    let to_date = moment(to).format('YYYY-MM-DD')
    let diff = moment(to_date).diff(from_date, 'd')+1
    let range = []
    for (let i = 0; i < diff; i++) {
        range.push(moment(from_date).add(i, 'd').format('YYYY-MM-DD'))
    }
    return range
}

const current_week = get_workWeek(currentDate, 7)
const last_week = get_lastWorkWeek(current_week[current_week.length - 1].day, 6)

export {currentDate, current_week, last_week, get_currentRange, get_rangeDates}