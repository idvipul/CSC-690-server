const crypto = require('crypto')
const userController = require('../../controllers/user')

exports.create = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})

        const uuid = crypto.randomBytes(10).toString('hex')
        const text = request.body.text
        const insertedPost = await db.execute(`
            INSERT INTO posts 
            SET 
            uuid = ?,
            user_id = ?,
            text = ?`, [uuid, userId, text])
        
        //console.log(insertedPost[0].insertId)
        return response.status(200).json({"postId": uuid})
    } 
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }

exports.get = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})

        let whereStr = ''
        let qvals = []

        if(request.body.uuid) {
            whereStr = ' WHERE uuid = ?'
            qvals.push(request.body.uuid)
        }
        const [posts, fields] = await db.execute(`
            SELECT u.id, u.username, u.image_url, p.uuid, p.text, p.created_at 
            FROM users u
            JOIN posts p on p.user_id = u.id ${whereStr}`, qvals
        ) 
        return response.status(200).json({"posts": posts})
    } 
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
}