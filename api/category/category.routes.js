import express from 'express'
import { log } from '../../middlewares/logger.middleware.js'
import { getCategories } from './category.controller.js'

const router = express.Router()

router.get('/', log, getCategories)

export const categoryRoutes = router
