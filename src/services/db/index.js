import {Router} from 'express';
import tataBrain from '../tata_brain/schema.js'
import {get_rangeDates} from '../../utilities/datetime/index.js'

const router = Router()

router.route('/').get(async (req, res, next) => {
    try {
        const {collection, from, to} = req.query
        const rangeDates = get_rangeDates(from, to)
        let result
        switch (collection){
            case 'tata-brain': {
                result = await Promise.all(
                    rangeDates.map(async day => {
                        const dayData = await tataBrain.findById(day)
                        return dayData
                    })
                )
            };
            break;
            default: ;
        }
        res.send(result)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default router