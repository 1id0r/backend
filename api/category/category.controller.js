import { logger } from '../../services/logger.service.js'
import { categoryService } from './category.service.js'

export async function getCategories(req, res) {
  try {
    const categories = await categoryService.query()
    res.json(categories)
  } catch (err) {
    logger.error('Failed to get stations', err)
    res.status(400).send({ err: 'Failed to get stations' })
  }
}
