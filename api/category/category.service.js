import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const categoryService = {
    query
  }
  
  async function query() {
    try {
      const collection = await dbService.getCollection('category')
      var categories = await collection.find().toArray()
      return categories
    } catch (err) {
      logger.error('cannot find categories', err)
      throw err
    }
  }