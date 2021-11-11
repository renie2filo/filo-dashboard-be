import express from 'express'


const router = express.Router()

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
        const result = ["Received", "Unassigned", "Type", "Status"]
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error)

    }
})

router.route('/query').post(async (req, res, next) => {
    try {
        // console.log(data)
        // res.status(200).send(data)
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