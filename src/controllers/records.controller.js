const models = require('../../models');

// Create Record functionality
exports.createRecord = async (req, res) => {
  try {
    //  Validate mandatory fields
    if(!req.body.distance) return res.status(400).send({message:"Distance is not provided"})
    if(!req.body.time) return res.status(400).send({message:"Time is not provided"})
    if(!req.body.from) return res.status(400).send({message:"Date is not provided"})
    if(!req.body.userId) return res.status(400).send({message:"Please specify a user ID"})
    if(isNaN(req.body.distance)) return res.status(400).send({message:"Please make sure that the distance is in metres!"})
    if(isNaN(req.body.time)) return res.status(400).send({message:"Please make sure that the time is in seconds!"})
    if(isNaN(new Date(req.body.from))) return res.status(400).send({message:"Please make sure a correct form of date is provided!"}) 
    //  Distance is provided in metres
    const distance =  (parseFloat(req.body.distance))
    //  Speed is provided in seconds
    const time = parseInt(req.body.time)
    //  Calculate to date
    let fromDate = new Date(req.body.from);
    let toDate = fromDate + (req.body.time*1000);
    toDate = new Date(toDate)  
    console.log("toDate",toDate)
    console.log("fromDate",fromDate)
    //  Calculate Speed
    const speed  =  (distance/(time/60*60)) ; 
    //  Fetch User
    //  If the logged in user is a regular user, then the record belogs to the user
    //  If the user is an admin user, then check for provided userId
    const loggedInUser = await models.user.findOne({
      where:{
        id: req.userId
      }
    })
    if(loggedInUser.role==="regular"){
      // Save record into the database
      const record = await models.record.create({
        speed,
        to_date: toDate,
        from_date: fromDate,
        distance,
        time,
        userId: loggedInUser.id
      });
      return res.status(200).send({
        data:{
          speed: record.speed,
          to_date: record.to_date,
          from_date: record.from_date,
          distance: record.distance,
          time: record.time,
          userId: loggedInUser.id
        }
      });
    }  else if(loggedInUser.role === "admin") {
      
      // Check if the mandatory fields are provided
      if(!req.body.userId) return res.status(401).send({message: "Please make sure a user is selected!"})
      const selectedUser = await models.user.findOne({
        where:{
          id: req.body.userId
        }
      })
      if(!selectedUser) return res.status(404).send({message: "User not found!"})
      const record = await models.record.create({
        speed,
        to_date: toDate,
        from_date: fromDate,
        distance,
        time,
        userId: selectedUser.id
      });
      return res.status(201).send({
        data: {
          id: record.id,
          speed: record.speed,
          to_date: record.to_date,
          from_date: record.to_date,
          distance: record.distance,
          time: record.time,
          user_id: selectedUser.id
        },
      });
    } else {
      return res.status(500).send({message: "You are not authorized to create a record!"})
    }  
  } catch (error) {
      return res.status(500).send({message: error.message})
    }
}

// Get All Records functionality
exports.getAllRecords = async (req, res) => {
  try {
    // Validate the logged-in user 
    const loggedInUser = await models.user.findOne(
      {
        where: {
          id: req.userId
        }
    });

    // If the logged in user is a regular user
    // Fetch the records the user owns
    // If the logged in user is an admin
    // Fetch the records for the specified user
    if(loggedInUser.role === "regular"){
        // Fetch  records paginated and filtered for the logged-in user
        const page = req.query.page ? parseInt(req.query.page) : 0;
        const offset = page === 0 ? 0 : (page*10 - 10) ;
   
        // if(req.query.fromDate) filterObject[fromDate] = new Date(req.query.fromDate)
        // if(req.query.toDate) filterObject[toDate] = new Date(req.query.toDate)
        const { count, records }= await models.record.findAndCountAll({
          limit: 10,
          offset,
          where:{
            userId:loggedInUser.id,
            ...(req.query.fromDate && {from_date: new Date(req.query.fromDate)}),
            ...(req.query.toDate && {to_date: new Date(req.query.toDate)})
          },
          include: [
            {
              model: models.user,
              as: 'user',
            }
          ]
        });
        return res.status(200).send({ 
          data:{
            records,
            total: count,
            pages: Math.floor(count/10)
          }
         
         });
    } else if(loggedInUser.role === "admin" ) {
      // CHeck if there is a user specified or not 
      if(!req.query.userId) return res.status(404).send({message: "Please specify a user!"})
      const specifiedUser = await models.user.findOne(
        {
          where:{ id: req.query.userId }
      })  
      if(!specifiedUser) return res.status(404).send({message: "No user found for the provided User ID!"})
      // Fetch  records paginated and filtered for the specified user
        const page = req.query.page ? parseInt(req.query.page) : 0;
        const offset = page === 0 ? 0 : (page*10 - 10) ;
        // if(req.query.fromDate) filterObject[fromDate] = new Date(req.query.fromDate)
        // if(req.query.toDate) filterObject[toDate] = new Date(req.query.toDate)
        const {count,rows} = await models.record.findAndCountAll({
          limit: 10,
          offset,
          where:{
            userId: specifiedUser.id,
            ...(req.query.fromDate && {from_date: new Date(req.query.fromDate)}),
            ...(req.query.toDate && {to_date: new Date(req.query.toDate)})
          },
          include: [
            {
              model: models.user,
              as: 'user',
            }
          ]
        });
        let results = rows.map((elem,index)=>{
          return {
            speed: elem.speed,
            time: elem.time,
            distance: elem.distance,
            from: elem.from_date,
            id: elem.id,
            user_id: elem.user.id,
          }
        })
        return res.status(200).send({ 
          count,
          data: {
            results:[...results]
          } });
    } else {
        return res.status(500).send({message : "You are not authorized to view the records!"});
    }
  } catch (error) {
    return res.status(500).send({message : error.message});
  }
}

// Get Record By ID functionality
exports.getRecordById = async (req, res) => {
  try {
  
    // Check if an id for the record is provided
    const recordId  = req.params.recordId;
    if(!recordId || isNaN(recordId)) return res.status(401).send({message: "Please provide an id for a record"})

    const loggedInUser = await models.user.findOne(
      {
        where:{ id: req.userId}
    })  
    const record = await models.record.findOne({
      where: { id: recordId },
      include: [
        {
          model: models.user,
          as: 'user'
        }
    ]});
    if(!record) return res.status(200).send({ 
      message:"No record found for the specified ID"
    });
    if(record.userId !== loggedInUser.id && loggedInUser.role !== "admin" )  return res.status(500).send({error:"You are not authorized to view this record!"});
    if (record) return res.status(200).send({ 
      data:{
        speed: record.speed,
        from_date: record.from_date,
        time: record.time,
        distance: record.distance,
        user_id: record.user.id,
        id: record.id
      }
    });
    return res.status(404).send({messgae: 'Record with the specified ID does not exists'});
  } catch (error) {
    return res.status(500).send({
     message: error.message
    });
  }
}


// Needs to be modified
// Update Single Record
exports.updateRecord = async (req, res) => {
  try {
    // Check the logged in user
    const loggedInUser = await models.user.findOne({
      where:{
          id: req.userId
    }})
    const { recordId } = req.params;
    if(!recordId) return res.status(400).send({
      message: "Please specify a record to update!"
    })
    // Check if records exists
    let record = await models.record.findOne({ where: { id: recordId },
      include: [
          {
            model: models.user,
            as: 'user'
          }
        ]
    });
    if(!record) return res.status(404).send({
      message:"Record does not exist!"}
    );
      
      // Validate whether the user is authorized to update the record or not 
      // If the record does not belong to the user , and the user is not admin
      //  then the user is not allowed to update the record
      if(record.user.id === loggedInUser.id || loggedInUser.role === "admin"){
      // Updated Record instance;
      let updateRecord = {
        speed: parseFloat(record.speed),
        distance: parseFloat(record.distance),
        time: parseInt(record.time),
      };
      // Check if user wants to update time
      // which means that the speed, toDate  will also be updated
      // Validate provided time and update speed and to date
      if(req.body.time) {
        if(isNaN(req.body.time)) return res.status(404).send("PLease make sure time is provided in seconds !");
        const fromDate = new Date(record.from_date);
        let newToDateInMilliseconds = fromDate.getTime() + req.body.time*1000;
        const newToDate = new Date(newToDateInMilliseconds);
        updateRecord['to_date'] = newToDate;
        updateRecord.time= parseFloat(req.body.time)
        updateRecord.speed = updateRecord['distance']/updateRecord['time'];
      }
      // Check if the user wants to update distance
      // which means that the 
      if(req.body.distance){
        if(isNaN(req.body.distance)) return res.status(404).send("Please make sure distance is provided in metres !");
        updateRecord.distance = parseFloat(req.body.distance);
        updateRecord.speed =  parseFloat(req.body.distance)/updateRecord.time
      }
      const [ updated ] = await models.record.update({
        ...updateRecord
        }, {
        where: { id: recordId }
      });
      // Return updated record
      if (updated) {
          const updatedRecord = await models.record.findOne({ where: { id: recordId } });
          return res.status(200).send({ 
            data:{
            record: updatedRecord 
          },
          message:"Record has been updated successfully!"
        });
      }
  } else {
        return res.status(401).send({
          message:"You are not authorized to edit this record!"
        })
      } 

    } catch (error) {
        return res.status(500).send({
          message: error.message
        });
    }
};

// Delete Record functionality
exports.deleteRecord = async (req, res) => {
  try {
    // Fetch the logged-in user
    const loggedInUser = await models.user.findOne(
      {
        where:{
          id: req.userId
    }})
    // Fetch the record
    const recordId  = req.params.recordId;
    if(!recordId) return res.status(500).send({message: "Please provide a record ID!"});
    let record = await models.record.findOne({ where: { id: recordId },
      include: [
        {
          model: models.user,
          as: 'user'
        }
      ]
    });
    if(!record) return res.status(500).send({
      message: "Record does not exist!"
    });
    // Validate whether the user is authorized to delete the record or not 
    if(record.user.id !== loggedInUser.id && loggedInUser.role !== "admin") return res.status(500).send({
      message:"You are not authorized to delete the record!"
    });
    const deleted = await models.record.destroy({
          where: { id: record.id }
    });
    if (deleted) return res.status(200).send({ 
      message:"Record deleted successfully !"
    });
  } catch (error) {
    return res.status(500).send({
      message : error.message
    });
  }
};