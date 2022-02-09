const models = require('../../models');
const { QueryTypes } = require('sequelize');

exports.getReportForUser = async (req,res) => {
    try{

        // Check if a user is specified
        if(!req.body ||!req.body.userId)   res.status(500).json({error: "Please specify a user!"})
        const userSpecified =  await models.user.findOne({ 
            where:{
                id: parseInt(req.body.userId) 
            },
        });
        if(!userSpecified) res.status(500).json({error: "There's no such user!"})
        // Fetch the records for the user
        const records = await models.sequelize.query(`SELECT date_part('week', from_date) AS week_number, AVG(records.distance) as average_distance, AVG(records.time) as average_time FROM records WHERE from_date Is Not Null AND "userId" = :user_id GROUP BY week_number ORDER BY week_number;`,
            { 
              type: QueryTypes.SELECT ,
              replacements: { user_id: userSpecified.id },
        });
        // Format the results
        let results = []
        for(let i = 0; i< records.length;i++){
            let result = {
                week : i,
                average_distance: records[i].average_distance,
                average_speed: records[i].average_speed, 
            }
            results.push(result);
        }

        res.status(200).json({
            data:{
                user_id: userSpecified.id,
                username:   userSpecified.username,
                records:[...results]
            }
        })

    } catch(err) {
        res.status(500).send({message: err.message});
    }
}