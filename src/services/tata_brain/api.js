import fetch from 'node-fetch';

import moment from 'moment';

import {tata_brain_saveDB, tata_brain_updateDB} from '../../utilities/db/utilities.js'

import Tata_Brain_DB from './schema.js'

const getUrl = (date) => {
    return date.hour === '' ? `${process.env.TATA_BRAIN_URL}/${date.year}/${date.month}/${date.day}` : `${process.env.TATA_BRAIN_URL}/${date.year}/${date.month}/${date.day}?hour=${date.hour}`
}

const fetchData = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        withCredentials: true,
        headers: {
            'x-api-key': `${process.env.TATA_BRAIN_API_KEY}`,
            "Content-Type" : 'application/json'
        }
    })
    const result = await response.json()
    return result.data
}

const dateObj = (string_date, hour) => {
    return {
        year: string_date.substring(0,4),
        month: string_date.substring(5,7),
        day: string_date.substring(8,10),
        hour
    }
}

const hourObj = (data) => {
    return{
        hour: data.event_hour_gmt,
        a0: data.a0,
        a1: data.a1,
        a2: data.a2,
        a3: data.a3,
        event_timestamp: data.event_timestamp,
        monitors: data.monitors,
    }
}

const emptyHour = (datetime, hour) =>{
    return{
        hour: hour,
        a0: '0',
        a1: '0',
        a2: '0',
        a3: '0',
        event_timestamp: datetime,
        monitors: '0',
    }
}

const alarms_data_fill = (hoursArray, alarm, callback) => {
    return hoursArray.map(data => {
        let {value, time} = callback(data, alarm)
        let valueN = value === undefined ? 0 : parseInt(value)
        return [valueN, parseInt(time)]
    })
}

const dataAlarm = (obj,alarm) => {
    return{
        value: obj[alarm] === '' ? 0 : obj[alarm],
        time: moment(obj.event_timestamp).format('x')
    }
}

const checkAlarms = (obj) => {
    let checkArray = []
    if(obj) {
        if (!obj['a0']) checkArray.push('a0') 
        if (!obj['a1']) checkArray.push('a1') 
        if (!obj['a2']) checkArray.push('a2') 
        if (!obj['a3']) checkArray.push('a3') 
        if (!obj['monitors']) checkArray.push('monitors')
    }
    return checkArray
}

const getData = async (day, toTime, monitorOrAlarm) => {
    const data = await Tata_Brain_DB.findById(day)
    let res
    if (!data) {
        const hours = []
        const date = dateObj(day, '')
        const url = getUrl(date)
        const dayResult = await fetchData(url)
        // const dayResult = data_09.filter(dataDay => dataDay.event_date_gmt === day)
        for (let i = 0; i < parseInt(toTime); i++) {
            let hour = i < 10 ? `0${i}`: `${i}`
            let hourData = dayResult.find(data => data.event_hour_gmt === hour)
            let checkArray = checkAlarms(hourData)
            let body
            if (hourData){
                if (checkArray.length > 0) {
                    body = hourObj(hourData)
                    checkArray.map(target => body[target] = '0')
                    hours.push(body)
                } else {
                    body = hourObj(hourData)
                    hours.push(body)
                }
            } else {
                body = emptyHour(`${day} ${hour}:00`, hour)
                hours.push(body)
            }
        }
        await tata_brain_saveDB(day, {hours: hours})
        res = {
            _id: day,
            hours: hours
        }
    } else if (!data.hours.find(hour => hour.hour === toTime)){
        const hours = []
        const date = dateObj(day, '')
        const url = getUrl(date)
        const dayResult = await fetchData(url)
        for (let i = 0; i < parseInt(toTime); i++) {
            let hour = i < 10 ? `0${i}`: `${i}`
            let hourData = dayResult.find(data => data.event_hour_gmt === hour)
            let checkArray = checkAlarms(hourData)
            let body
            if (hourData){
                if (checkArray.length > 0 && checkArray === hourData) {
                    body = hourObj(hourData)
                    checkArray.map(target => body[target] = '0')
                    hours.push(body)
                } else {
                    body = hourObj(hourData)
                    hours.push(body)
                }
            }  else {
                body = emptyHour(`${day} ${hour}:00`, hour)
                hours.push(body)
            }
            await tata_brain_updateDB(day, {hours: hours})
            res = {
                _id: day,
                hours: hours
            }
        }
    } else {
        res = data
    }
    const monitors_data = {
        monitors: alarms_data_fill(res.hours, 'monitors', dataAlarm),
    }
    const alarms_data = {
        a0: alarms_data_fill(res.hours, 'a0', dataAlarm),
        a1: alarms_data_fill(res.hours, 'a1', dataAlarm),
        a2: alarms_data_fill(res.hours, 'a2', dataAlarm),
        a3: alarms_data_fill(res.hours, 'a3', dataAlarm),
    }


    const dashboard_data = (() => {
        if (monitorOrAlarm === "alarm") {
                return Object.keys(alarms_data).map((key, index) => {
                const values = Object.values(alarms_data)
                return {
                    target: `Alarm ${index}`,
                    datapoints: values[index]
                }
            })
        } else {
            return Object.keys(monitors_data).map((key, index) =>{
                const values = Object.values(alarms_data)
                return {
                    target: `Monitors`,
                    datapoints: values[index]
                }
            })
        }
    })()

    return dashboard_data
}

const getRangeData = async (range, toTime, monitorOrAlarm) => {
    let final_array=[]
    const today = moment().format('YYYY-MM-DD')
    await Promise.all(
        range.map(async day => {
            const data = await Tata_Brain_DB.findById(day.day)
            let res
            if(!data){
                const hours = []
                const date = dateObj(day.day, '')
                const url = getUrl(date)
                const dayResult = await fetchData(url)
                // console.log(dayResult)
                for (let i = 0; i < parseInt(toTime); i++) {
                    let hour = i < 10 ? `0${i}`: `${i}`
                    let hourData = dayResult.find(data => data.event_hour_gmt === hour)
                    let checkArray = checkAlarms(hourData)
                    let body 
                    if (hourData){
                        if (checkArray.length > 0) {
                            body = hourObj(hourData)
                            checkArray.map(target => body[target] = '0')
                            hours.push(body)
                        } else {
                            body = hourObj(hourData)
                            hours.push(body)
                        }
                    } else {
                        body = emptyHour(`${day.day} ${hour}:00`, hour)
                        hours.push(body)
                    }
                }
                await tata_brain_saveDB(day.day, {hours: hours})
                res = {
                    _id: day.day,
                    hours: hours
                }
            } else if (day.day === today && !data.hours.find(hour => hour.hour === toTime)){
                const hours = []
                const date = dateObj(day.day, '')
                const url = getUrl(date)
                const dayResult = await fetchData(url)
                for (let i = 0; i < (parseInt(toTime) + 1); i++) {
                    let hour = i < 10 ? `0${i}`: `${i}`
                    let hourData = dayResult.find(data => data.event_hour_gmt === hour)
                    let checkArray = checkAlarms(hourData)
                    //console.log(checkArray)
                    let body
                    if (hourData){
                        if (checkArray.length > 0 && checkArray === hourData) {
                            body = hourObj(hourData)
                            checkArray.map(target => body[target] = '0')
                            hours.push(body)
                        } else {
                            body = hourObj(hourData)
                            hours.push(body)
                        }
                    } else {
                        body = emptyHour(`${day.day} ${hour}:00`, hour)
                        hours.push(body)
                    }
                    await tata_brain_updateDB(day.day, {hours: hours})
                    res = {
                        _id: day.day,
                        hours: hours
                    }
                }
            } else {
                res = data
            }
            const monitors_data = {
                monitors: alarms_data_fill(res.hours, 'monitors', dataAlarm),
            }
            const alarms_data = {
                a0: alarms_data_fill(res.hours, 'a0', dataAlarm),
                a1: alarms_data_fill(res.hours, 'a1', dataAlarm),
                a2: alarms_data_fill(res.hours, 'a2', dataAlarm),
                a3: alarms_data_fill(res.hours, 'a3', dataAlarm),
            }
            const dashboard_data = (() => {
                let data
                if (monitorOrAlarm === "alarm") {
                    data = Object.keys(alarms_data).map((key, index) => {
                    const values = Object.values(alarms_data)
                    return {
                        target: `Alarm ${index}`,
                        datapoints: values[index]
                    }
                })
                } else {
                    data = Object.keys(monitors_data).map((key, index) =>{
                        const values = Object.values(monitors_data)
                        return {
                            target: `Monitors`,
                            datapoints: values[index]
                        }
                    })
                }
                return data
            })()
            final_array.push(...dashboard_data)
        })
    )
    return final_array
}

export {getData, getRangeData}