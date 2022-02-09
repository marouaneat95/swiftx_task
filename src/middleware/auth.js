const jwt = require('jsonwebtoken');
const models = require('../../models');

exports.verifyToken = async (req, res, next) => {
    try {
        // Fetch token from header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(' ')[1]
    
        if (!token) res.status(403).json({ message: "Please login to proceed!"})
        // Validate token
        const decoded = jwt.verify(token, 'secretKey')
        const user = await models.user.findOne({
            where:{
                id:decoded.id
            }
        })
  
        if (!user) return res.status(404).json({message: "No user found!"})
        // Attach the ID of the logged in user to the request object and pass it to the callback function
        req.userId = user.id;
        // Call the next callback function
        next();
    } catch (error) {
       res.status(401).json({message: "Unauthorized"})
    }
}