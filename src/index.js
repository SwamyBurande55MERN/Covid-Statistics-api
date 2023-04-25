const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

//Route ==> total recovered patients 

app.get("/totalRecovered", async (req, res) => {  // to be executed asynchronously, return promise

      try{
            const data = await connection.aggregate([{
                  $group: {
                        "_id" : "total",
                        "recovered" : {"sum" : "$recovered"}
                  }
            }]);
            res.status(200).json({data : data[0]})
      } 
      catch (error){
            //console.log(error)
            res.status(500).json({
                  status : "failed",
                  message : error.message
            })
      }
})

//Route ==> total active covid cases/patients

app.get("/totalActive", async (req, res)=> {
      try{
            const data = await connection.aggregate([{
                  $group: {
                        "_id": "total",
                        "active": {
                              "$sum" : {
                                    "$subtract" : ["$infected", "recovered"]
                              }
                        }
                  }
            }])
            res.status(200).json({
                  data : data[0]
            })
      }
      catch(error){
            //console.log(error)
            res.status(500).json({
                  status : "failed",
                  message: error.message
            })
      }
})

// Route ==> count for total deaths

app.get("/totalDeath", async(req, res)=> {
      try{
            const data = await connection.aggregate([{
                  $group : {
                        "_id": "total",
                        "death" : {
                              "$sum" : "$death"
                        }
                  }
            }]);
            res.status(200).json({data : data[0]})
      }
      catch(error){
            //console.log(error)
            res.status(500).json({
                  status : "failed",
                  message: error.message
            })
      }
})

// Route ==> get all Hotspot states

app.get("/hotspotstates", async (req, res)=> {
      try{
            const data = await connection.aggregate([
                  {
                        "$match": {
                              "$expr": {
                                    "$gt": [{
                                          "$round" : [{
                                                "$divide": [
                                                      {
                                                            "$subtract": ["infected", "$recovered"]
                                                      },
                                                      "$infected"
                                                ]
                                          },5]
                                    },0.1]
                              }
                        }
                  },{
                        "$project": {
                              "_id": 0,
                              "state": 1,
                              "rate": {
                                    "$round": [{
                                          "$divide": [
                                                {
                                                      "$subtract" : ["$infected", "$recovered"]
                                                },
                                                "$infected"
                                          ]
                                    }, 5]
                              }
                        }
                  }

            ])
            res.status(200).json({data : data})
      }
      catch (error){
            //console.log(error);
            res.status(500).json({
                  status: "failed",
                  message: error.message
            })
      }
})




app.listen(port, () => {
      console.log(`App listening on port ${port}!`)
});

module.exports = app;