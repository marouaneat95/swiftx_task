const models = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Password Encryption 
const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
};
// Compare provied password
const comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword)
};

// Sign Up functionality
exports.signUp = async (req, res) => {
  try{

    // Check if mandatory fields are provided
    if(!req.body.username) return res.status(400).send({message:"Please provide a username!"});
    if(!req.body.password) return res.status(400).send({message:"Please provide a password!"});
    if(String(req.body.username).length < 8 ) return res.status(400).send({message: 'Username should be at least 8 characters!'})
    if(String(req.body.password).length < 8 ) return res.status(400).send({message: 'Password should be atleast 8 characters!'})
    // Check if a user exists with the same username
    const userExist = await models.user.findOne({ where:{
      username: String(req.body.username) }
    });
    if (userExist) return res.status(400).send({message: 'User with the same username already exists'})
    
    // Encrypt provided password
    const encryptedPassword = await encryptPassword(String(req.body.password));
  
    if(encryptPassword){
      const savedUser = await models.user.create({
        username: req.body.username, 
        password: encryptedPassword,
        role:"regular"
      });
      // Create Token
      const newToken = jwt.sign({ id: savedUser.id }, 'secretKey', {
        expiresIn: 86400 // one day
      })
      return res.status(200).send({
        data:{
          token:newToken,
          id: savedUser.id,
          username: savedUser.username
        } 
         
      })
    }
  } catch(error){
      return res.status(500).send(error.message);
  }
}

// Login functionality
exports.logIn = async (req, res) => {
  try{
      // Check if mandatory fields are provided
    if(!req.body.username) return res.status(400).send({message: 'Username should be provided'})
    if(!req.body.password) return res.status(400).send({message: 'Password should be provided'})
    // Check if a user exists with the username
    const userExist = await models.user.findOne({ 
        where: { username: req.body.username} 
    });
    if (!userExist) return res.status(400).send({ message: 'User not exists'})
    // Validate entered password
    const matchPassword = await comparePassword( String(req.body.password), userExist.password)
    if (!matchPassword) return res.status(401).send({
          token: null,
          message: 'Invalid password!'
    })
    // Create Token
    const token = jwt.sign({ id: userExist.id }, 'secretKey', { expiresIn: 86400})
  
    return res.status(200).send({
      message: 'Authentication Succesful',
      data: {
      id: userExist.id,
      username: userExist.username,
    
      token: token
    
    }})
  } catch(error){
    return res.status(500).send({message: error.message});
  }
}

// Create User Functionality
exports.create = async (req, res) => {
  try{
    // Validate mandatory fields
    if(!req.body.username) return res.status(400).send({message: 'Username should be provided'})
    if(!req.body.password) return res.status(400).send({message: 'Password should be provided'})
    if(!req.body.role) return res.status(400).send({message: 'The role of the user should be provided'})
    // Find if there is a user with the same username
    if(String(req.body.username).length < 8) return res.status(400).send({message: 'Username should be atleast of 8 characters'})
    if(String(req.body.password).length < 8) return res.status(400).send({message: 'Password should be atleast of 8 characters'})
    const userExist = await models.user.findOne({ where:{username: String(req.body.username)} });
    if (userExist) return res.status(400).send({
        message: 'User already exists with the same username!'
    })
    console.log("userExists", userExist)
    // Check if the user is authorized to create users
    const loggedInUser = await models.user.findOne(
      {where : {
        id: req.userId
    } })
    if(loggedInUser.role !== "admin"){
        return res.status(400).send({
            message: 'You are not authorized to create users !'
        })
    }
    
    const { username, role } = req.body;
    // Encrypt provided password
    const encryptedPassword = await encryptPassword(String(req.body.password));
    // Create User
    const savedUser = await models.user.create({
        username, 
        password: encryptedPassword,
        role
    });
    // Return create user 
    return res.status(200).send({
      data:{
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        message: 'User created successfully !',
    }})
  } catch(error){
    return res.status(500).send({
      message:error.message
    });
  }
}

// Get all users
exports.getUsers = async (req,res) =>{
  try{
    // Check whether the user is admin
    const loggedInUser = await models.user.findOne(
      {where : {
        id: req.userId
    } })
    if(loggedInUser.role !== "admin"){
      return res.status(400).send({
          message: 'You are not authorized to view users !'
      })
    }
    let page = (isNaN(req.query.page)) ? 1 : parseInt(req.query.page) + 1;

  
    let offset = page === 1 || !page ? 0 : (page*10) - 10 ;
 
    const {count, rows} = await models.user.findAndCountAll({
      limit: 10,
      offset
    })

    let numberOfPages = Math.ceil(count/10)
    if(rows && rows.length > 0){
      let results = rows.map((elem,index)=>{
        return {username:elem.username, role:elem.role, created_at: elem.createdAt, updated_at: elem.updatedAt, id: elem.id}
      })
      return res.status(200).send({
        number_of_pages: numberOfPages,
        page,
        count,
        data: {
        results
      }})
    } else {
      return res.status(404).send({
        message: "No users found!"
      })
    }
  } catch(err){
    return res.status(500).send({
      message :err.message
    });
  }

}
// Get User by ID functionality
exports.getUser = async (req,res) => {
  try{
    const loggedInUser = await models.user.findOne(
      {where : {
        id: req.userId
    } })
    if(loggedInUser.role !== "admin"){
      return res.status(400).send({
          message: 'You are not authorized to view users !'
      })
    }
    if(!req.params.id || isNaN(req.params.id)) return res.status(400).send({
      message:"Please make sure you have specified a user ID!"
    })
    const requestUserId = parseInt(req.params.id);
    const user = await models.user.findOne({
      where:{
        id: requestUserId
      },
      raw: false
    });
    if(!user) return res.status(404).send({message: "No user found!"})
    return res.status(200).send({
      data:{
        username: user.username,
        id:user.id,
        role:user.role
      }
    })
  } catch(error){
    return res.status(500).send({
      message:error.message
    });
  }
}
// Delete User
exports.delete = async (req,res) =>{
  try{
    // Check whether the logged-in user is authorized
    const loggedInUser = await models.user.findOne(
      { where : {
        id: req.userId
    }})
    if(loggedInUser.role !== "admin"){
      return res.status(400).send({
          message: 'You are not authorized to delete users !'
      })
    }
    if(!req.params.id || isNaN(req.params.id)) return res.status(400).send({
      message:"Please make sure you have provided a valid user ID"
    }) 
    const userExists = await models.user.findOne({
      where:{
        id: parseInt(req.params.id)
      }
    })
    if(!userExists) return res.status(400).send({
      message:"Please make sure you have provided a valid user ID"
    }) 
    const deleted = await models.user.destroy({
      where:{
        id: parseInt(req.params.id)
      }
    })
    if (deleted) return res.status(200).send({ 
      message:"User deleted successfully !"
    });

  } catch(error) {
    return res.status(500).send({
      message:error.message
    });
  }
}

exports.update = async(req,res) => {
  try{
    // Check whether the logged-in user is authorized
    const loggedInUser = await models.user.findOne(
      { where : {
          id: req.userId
    }})
    if(loggedInUser.role !== "admin") return res.status(400).send({ message: 'You are not authorized to edit users !'})
    // Validate provided input
    if(!req.params.id || isNaN(req.params.id)) return res.status(400).send({ message:"Please make sure you have provided a valid user ID"}) 
    if(!req.body.username) return res.status(400).send({ message:"Please make sure you have provided a username!"})
    if(!req.body.password) return res.status(400).send({ message:"Please make sure you have provided a password!"}) 
    if(!req.body.username) return res.status(400).send({ message:"Username's length should be atleast 8 characters!"}) 
    if(req.body.password.length < 8) return res.status(400).send({ message:"Password's length should be atleast 8 characters!"})
    if(!req.body.role) return res.status(400).send({message:"Please make sure that the role is specified!"}) 
    if(!(req.body.role === "regular" || req.body.role === "admin" || req.body.role === "manager")) return res.status(400).send({message:"Please make sure a valid role is provided!"}) 
    // Check if a user exists with the same name 
    const userExists = await models.user.findOne({
      where:{
        username :  req.body.username
      }
    })
    if(userExists) {
      if(parseInt(userExists.id) !== parseInt(req.params.id)) return res.status(400).send({ message:"User exists with the same username!"})
    
    }  // Update user
    let updatedPassword = await encryptPassword(req.body.password)
    const updateUser = {
  
      username: req.body.username,
      password: updatedPassword,
      role: req.body.role
    }

    const userToUpdate = await models.user.findOne({
      where: {id: parseInt(req.params.id)}
    })
    if(!userToUpdate) return res.status(500).send({
      message:"No user found for the provided user ID"
    })
    const [ updated ] = await models.user.update({
      username: updateUser.username,
      password: updateUser.password,
      role: updateUser.role
      }, {
      where: { id: userToUpdate.id }
    });
  console.log(updated)    
    // Return updated user
        const updatedRecord = await models.user.findOne({ where: { id: parseInt(req.params.id) } });
        return res.status(200).send({ 
          data:{
            id: updatedRecord.id,
            username: updatedRecord.username,
            role:updatedRecord.role 
        },
        message:"User has been updated successfully!"
      });
  
  } catch(err){
    return res.status(500).send({
      message:err.message
    })
  }
}