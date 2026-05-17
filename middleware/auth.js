const jwt = require('jsonwebtoken');
const userModel = require('../model/user')

exports.authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            return next({
                message: `Auth required`,
                statusCode: 400
            })
        }
        const token = auth.split(' ')[1]
        // console.log(token)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decodedToken.id)
        if (!user) {
            return next({
                message: `Authentication failed: User not found`,
                statusCode: 404
            })
        }

        req.user = decodedToken

        next()


    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next({
                message: `Session expired, Login to continue`,
                statusCode: 401
            })
        }
        next({
                message: error.message,
                statusCode: 500
            })
    }

};