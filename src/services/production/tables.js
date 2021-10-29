import express from 'express';
import {get_production, get_oda, get_top_cp} from './sheet.js'

const router = express.Router();

router.route('/').get(async (req, res, next) => {
    try {
        res.status(200).send('Test Connection Successfull')
    } catch (error) {
        console.log(error)
        next(error)

    }
})

router.route('/search').post(async (req, res, next) => {
    try {
        const result = ["Produzioni 2021", 'Top Cp', 'ODA']
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)

    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        const query = req.body.targets[0].target
        let result
        switch(query){
            case 'Produzioni 2021': result = await get_production();
            break;
            case 'Top Cp' : result = await get_top_cp();
            break;
            case 'ODA' : result = await get_oda();
            break;
            default:;
        }
        res.send(result)
    } catch (error) {
        console.log(error)
        next(error)
    }
})


router.route('/annotations').post(async (req, res, next) => {
    try {
        res.send('annotations')
    } catch (error) {
        console.log(error)
        next(error)
    }
})



export default router