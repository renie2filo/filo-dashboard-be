import moment from "moment"
const compareDates = (objA, objB) => {
    const a = {
        hh: parseInt(objA.activity.substring(0,2)),
        mm: parseInt(objA.activity.substring(3,5)),
        ss: parseInt(objA.activity.substring(6,8))
    }
    const b = {
        hh: parseInt(objB.activity.substring(0,2)),
        mm: parseInt(objB.activity.substring(3,5)),
        ss: parseInt(objB.activity.substring(6,8))
    }
    let result
    if (a.hh === b.hh) {
        a.mm > b.mm ? result = objA : result = objB
    } else if (a.hh > b.hh) result = objA
    else if (a.hh < b.hh) result = objB
    return result
}

const diff = (from, to) => {
    const a = moment(from)
    const b = moment(to)
    const m_difference = Math.abs(Math.floor(a.diff(b, 'hours')))
    return m_difference

}

export {compareDates, diff}