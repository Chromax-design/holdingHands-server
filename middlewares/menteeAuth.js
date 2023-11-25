// const jwt = require('jsonwebtoken');
// const { selectData } = require('../utils/sqlHandlers');

//  const MenteeAuth =(req, res, next)=>{
//     const token = req.headers['authorization'];
//     if (!token) {
//         return res.status(401).json({message: 'Token not found'})
//     }
//     jwt.verify(token, process.env.PRIVATE_KEY, async(err, user)=>{
//         if (err) {
//             console.log(err)
//             return res.status(403).json({message: "Invalid token"})
//         }
//         const userData = await selectData('mentees',"id", user.userId)
//         if (userData[0].role != "mentee") {
//             return res.status(403).json({message: "Unidentified User"})
//         }
//         delete userData[0].password
//         req.user = userData[0]
//         next()
//     })
// }

// module.exports = MenteeAuth
