import { asyncLocalStorage } from '../../services/als.service.js'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
  add,
  getById,
  update,
  remove,
  query,
  getByUsername,
  addLikedSong,
  removeLikedSong,
  addLikedStation,
  removeLikedStation,
}

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('user')
    const users = await collection.find(criteria).toArray()

    return users.map((user) => {
      delete user.password
      return user
    })
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function getById(userId) {
  try {

    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId)})
    delete user.password
    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ username })

    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection('user')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    const userToSave = {
      _id: ObjectId.createFromHexString(user._id),
      name: user.name,
      username: user.username,
      likedSongs: user.likedSongs,
      likedStations: user.likedStations,
    }

    const collection = await dbService.getCollection('user')
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    const userToAdd = {
      name: user.name,
      username: user.username,
      password: user.password,
      likedSongs: [],
      likedStations: [],
    }


    const collection = await dbService.getCollection('user')
    const res =await collection.insertOne(userToAdd)

    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

async function addLikedSong(song) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const collection = await dbService.getCollection('user')
    const songToAdd = {
      _id: song._id,
      name: song.name,
      artists: song.artists.map((artist) => ({
        name: artist.name,
        _id: artist._id,
      })),
      album: {
        name: song.album.name,
        _id: song.album._id,
      },
      duration: song.duration,
      imgUrl: song.imgUrl,
      addedAt: Date.now(),
      youtubeId: song.youtubeId || '',
    }

    await collection.updateOne({ _id: ObjectId.createFromHexString(loggedinUser._id) }, { $push: { likedSongs: songToAdd } })
    return getById(loggedinUser._id)
  } catch (err) {
    logger.error(`cannot add liked song to user ${userId}`, err)
    throw err
  }
}
async function removeLikedSong(songId) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const collection = await dbService.getCollection('user')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(loggedinUser._id) },
      { $pull: { likedSongs: { _id: songId } } }
    )

    return getById(loggedinUser._id)
  } catch (err) {
    logger.error(`cannot remove liked song from user ${loggedinUser._id}`, err)
    throw err
  }
}

async function addLikedStation(station) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const collection = await dbService.getCollection('user')
    const stationToAdd = {
      _id: station._id,
      name: station.name,
      imgUrl: station.imgUrl,
      createdBy: station.createdBy,
      addedAt: Date.now(),
    }

    await collection.updateOne(
      { _id: ObjectId.createFromHexString(loggedinUser._id) },
      { $push: { likedStations: stationToAdd } }
    )
    return getById(loggedinUser._id)
  } catch (err) {
    logger.error(`cannot add liked station to user ${loggedinUser._id}`, err)
    throw err
  }
}

async function removeLikedStation(stationId) {

  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const collection = await dbService.getCollection('user')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(loggedinUser._id) },
      { $pull: { likedStations: { _id: stationId } } }
    )
    return getById(loggedinUser._id)
  } catch (err) {
    logger.error(`cannot remove liked station from user ${loggedinUser._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [{ username: txtCriteria }, { name: txtCriteria }]
  }
  return criteria
}
