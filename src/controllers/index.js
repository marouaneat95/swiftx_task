const models = require('../database/models');
const jwt = require('jsonwebtoken');
import Sequelize, { Op } from 'sequelize';
// const User = require('../models/User');
// Record Controller
const createRecord = async (req, res) => {
  try {
    // Validate mandatory fields
    if(!req.body.to) res.status(500).json({error: error.message})
    if(!req.body.from) res.status(500).json({error: error.message})
    if(!req.body.distance) res.status(500).json({error: error.message})

    // Validate provided dates and calculate time difference
    const toDate = new Date(req.body.to);
    const fromDate = new Date(req.body.from);
    const timeDifference = toDate.getTime() - fromDate.getTime();
    if( timeDifference < 0 ) res.status(500).json({error: error.message})
    const minutes = Math.floor(timeDifference / 60000);
    const seconds = ((timeDifference % 60000) / 1000).toFixed(0);
    const time =  minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    
    // Calculate Speed
    const distanceInMetres = (req.body.distance/1000)
    const speed  = distanceInMetres/(timeDifference/1000) ; 

    // Save record into the database
    const record = await models.Record.create({
      speed,
      to_date: req.body.to,
      from_date: req.body.from,
      distance,
      time
    });
    return res.status(201).json({
      record,
    });
  } catch (error) {
    return res.status(500).json({error: error.message})
  }
}
const getAllRecords = async (req, res) => {
  // Validate the logged-in user 
  const loggedInUser = await model.User.findOne({
    id: req.userId
})
if(loggedInUser.role==="regular"){
  try {
    const records = await models.Record.findAll({
      where:{
        userId:loggedInUser.id
      },
      include: [
        {
          model: models.User,
          as: 'user',
        }
      ]
    });
    return res.status(200).json({ records });
  } catch (error) {
    return res.status(500).send(error.message);
  }
} else if(loggedInUser.role === "admin") {
  const records = await models.Record.findAll({
    where:{
      userId: req.params.id
    },
    include: [
      {
        model: models.User,
        as: 'user',
      }
    ]
  });
  return res.status(200).json({ records });
  }
    
}
const getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    const loggedInUser = await model.User.findOne({
      id: req.userId
  })
    const record = await models.Record.findOne({
      where: { id: recordId },
      include: [
          {
            model: models.User,
            as: 'user'
          }
        ]
      });
    if(record.userId !== loggedInUser.id && loggedInUser.role !== "admin" )  throw new Error('You are not authorized to view this record');
    if (record) {
      return res.status(200).json({ record });
    }
      return res.status(404).send('Record with the specified ID does not exists');
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
  const updateRecord = async (req, res) => {
    try {
      // Check the logged in user
      const loggedInUser = await model.User.findOne({
        id: req.userId
    })
      const { recordId } = req.params;
      // Check if records exists
      let record = await models.Record.findOne({ where: { id: recordId },
        include: [
          {
            model: models.User,
            as: 'user'
          }
        ]
      });
      if(!record) throw new Error('Record not found');
      // Validate whether the user is authorized to update the record or not 
      if(record.user.id !== loggedInUser.id && loggedInUser.role !== "admin") throw new Error('You are not authorized to update this record');

       // Validate provided date(s) and calculate time difference
      if(req.body.to !== record.to_date || req.body.from !== record.from_date ){
        const toDate = new Date(req.body.to);
        const fromDate = new Date(req.body.from);
        const timeDifference = toDate.getTime() - fromDate.getTime();
        if( timeDifference < 0 ) res.status(500).json({error: error.message})
        record.to_date = req.body.to;
        record.from_date=  req.body.from;
        const minutes = Math.floor(timeDifference / 60000);
        const seconds = ((timeDifference % 60000) / 1000).toFixed(0);
        const time =  minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        record.time = time;
      }
      // Update Speed and Distance
      if(req.body.distance !== record.distance){
        record.distance = req.body.distance;
        const distanceInMetres = (req.body.distance/1000)
        const toDate = new Date(req.body.to);
        const fromDate = new Date(req.body.from);
        const timeDifference = toDate.getTime() - fromDate.getTime();
        const speed  = distanceInMetres/(timeDifference/1000) ; 
        record.speed = speed;
      }
      const [ updated ] = await models.Record.update(record, {
        where: { id: recordId }
      });
      // Return updated record
      if (updated) {
        const updatedRecord = await models.Record.findOne({ where: { id: recordId } });
        return res.status(200).json({ record: updatedRecord });
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };
  const deleteRecord = async (req, res) => {
    try {
      const loggedInUser = await model.User.findOne({
        id: req.userId
    })
      const { recordId } = req.params;
      let record = await models.Record.findOne({ where: { id: recordId },
        include: [
          {
            model: models.User,
            as: 'user'
          }
        ]
      });
      // Validate whether the user is authorized to update the record or not 
      if(record.user.id !== loggedInUser.id && loggedInUser.role !== "admin") throw new Error('You are not authorized to update this record');

      const deleted = await models.Record.destroy({
        where: { id: recordId }
      });
      if (deleted) {
        return res.status(204).send("Record deleted");
      }
      throw new Error("Record not found");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  // User Controllers
  const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
};
const comparePassword = async (password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword)
};
  const signUp = async (req, res) => {
    const { name, password } = req.body;

    const savedUser = await models.User.create({
        name, 
        password: encryptPassword(password),
        role:"user"
    });

    const newToken = jwt.sign({ id: savedUser.id }, 'secretKey', {
        expiresIn: 86400 // one day
    })

    res.status(200).json({ newToken })
}


const logIn = async (req, res) => {
    const userExist = await models.User.findOne({ name: req.body.name });

    if (!userExist) return res.status(400).json({
        message: 'User not exists'
    })

    const matchPassword = await comparePassword(req.body.password, userExist.password)

    if (!matchPassword) return res.status(401).json({
        token: null,
        message: 'Invalid password'
    })
    console.log(userExist)

    const token = jwt.sign({ id: userExist._id }, 'secretKey', {
        expiresIn: 86400
    })

    return res.json({
        id: userExist.id,
        name: userExist.name,
        message: 'Auth Succesful',
        token: token
    })
}
const create = async (req, res) => {
    const loggedInUser = await model.User.findOne({
        id: req.userId
    })
    
    const userExist = await models.User.findOne({ name: req.body.name });

    if (userExist) return res.status(400).json({
        message: 'User already exists with the same username'
    })
    if(loggedInUser.role === "regular"){
        return res.status(400).json({
            message: 'You are not authorized to create users !'
        })
    }
    if(loggedInUser.role === "manager"){
        if(req.body.role === "admin" || req.body.role === "manager") {
            return res.status(400).json({
                message: 'You are not authorized to create users with the provided role !'
            })
        }
    }
    const { name, password, role } = req.body;
    const savedUser = await models.User.create({
        name, 
        password: encryptPassword(password),
        role
    });

    res.status(200).json({
        id: savedUser.id,
        name: savedUser.name,
        message: 'User created successfully !',
    })
}
module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  logIn,
  signUp,
  create
}
