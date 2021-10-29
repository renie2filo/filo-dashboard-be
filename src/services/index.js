import express from 'express'

//*ROUTES IMPORT
import customerCare_route from './customer_care/index.js'
import production_route from './production/index.js'
import sales_route from './sales/index.js'
import tata_brain from './tata_brain/index.js'
import db_route from './db/index.js'

const router = express.Router()

router.use('/customer-care', customerCare_route)
router.use('/production', production_route)
router.use('/sales', sales_route)
router.use('/tata-brain', tata_brain)
router.use('/db', db_route)

export default router