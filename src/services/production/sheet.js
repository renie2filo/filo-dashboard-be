import {google} from 'googleapis'
import path from 'path';
import moment from 'moment';

const dirname = path.resolve()
const credentials = path.join(dirname, './src/utilities/credentials/google_sheet.json')
const get_range = (rangeObj) => `${rangeObj.sheet}!${rangeObj.range}`


const auth = new google.auth.GoogleAuth({
    keyFile: credentials,
    scopes: process.env.GOOGLE_SHEET_URL
})

const sheet_insatnce = async () => {
    const client = await auth.getClient()
    const googleSheets_instance = google.sheets({version: "v4", auth: client})
    return googleSheets_instance
}

const sheet_getData = async (id, rangeObj) => {
    const instance = await sheet_insatnce()
    const range = get_range(rangeObj)
    const data = await instance.spreadsheets.values.get({auth, spreadsheetId: id, range})
    return data.data
}

const andamento_tot_range = {
    sheet: "Foglio1",
    range: "D3:O4"
}

const produzioni_2021 = {
    sheet: "Consuntivo",
    range: "C36:O45"
}

const produzioni_tot = {
    sheet: "Consuntivo",
    range: "R35:S38"
}

const top_cp ={
    sheet: "Analisi",
    range: "G13:H18"
}

const oda = {
    sheet: "Situazione Attuale",
    range: "I88:J96"
}

const produzioni_2021_time = (data) => {
    const rows = ['EASYTECH', 'ARS01', 'TAG', 'TAG DO', 'TATA PAD', 'TATA GEN', 'TATA BPAD', 'TATA JPN', 'TATA ISR']
    const grafana_rows = data.values.map((row, i) => {
        let datapoints = []
        for (let i = 0; i < 12; i++) {
            const month = `2021-${i < 9 ? '0'+(i+1) : i+1}-01`
            const date = moment(month).format('YYYY-MM-DD')
            const month_x = moment(date).format('x')
            datapoints.push([parseInt(row[i]), parseInt(month_x)])
        }
        return {target: rows[i], datapoints}
    })
    return grafana_rows
}

const get_production_tot = async () => {
    const {values} = await sheet_getData(process.env.PRODUZIONI_2021, produzioni_tot)
    let result = {}
    result[values[0][0]] = parseInt(values[0][1])
    result[values[1][0]] = parseInt(values[1][1])
    result[values[2][0].replace(' ','_')] = parseInt(values[2][1])
    return result
}

const get_production = async () => {
    const response = await sheet_getData(process.env.PRODUZIONI_2021, produzioni_2021)
    const data = produzioni_2021_time(response)
    
    return data
}

const get_top_cp = async () => {
    const {values} = await sheet_getData(process.env.TOP_5_CP, top_cp)
    const columns = [
        {
            text: 'Tipo',
            type: 'string'
        },
        {
            text: 'Valore',
            type: 'number'
        }
    ]
    let array = values.map(v => {
        const charToremove = (chars, str) => {
            let newStr = str
            chars.forEach(c => {
                newStr = newStr.split(c).join('')
            })
            newStr = newStr.substring(0, (newStr.length - 3))
            let value = Math.round(parseInt(newStr) / 10) / 10
            return value
        }
        let newV = charToremove(['.',' ','€', ','], v[1])
        return [v[0], newV]
    })
    return [{
        columns,
        rows: array,
        type: 'table'
    }]
}

const get_oda = async () => {
    const {values} = await sheet_getData(process.env.ODA, oda)
    // console.log(values)
    const columns = [
        {
            text: 'Tipo',
            type: 'string'
        },
        {
            text: 'Valore',
            type: 'number'
        }
    ]
    let array = values.map(v => {
        const charToremove = (chars, str) => {
            let newStr = str
            chars.forEach(c => {
                newStr = newStr.split(c).join('')
            })
            newStr = newStr.substring(0, (newStr.length - 8))
            let value = Math.round(parseInt(newStr) * 10) / 100
            return value
        }
        let newV = charToremove(['.',' ','€'], v[1])
        return [v[0], newV]
    })
    return [{
        columns,
        rows: array,
        type: 'table'
    }]
}

export {sheet_getData, andamento_tot_range, get_production, get_production_tot, get_oda, get_top_cp}