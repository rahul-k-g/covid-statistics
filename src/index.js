const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')



app.get('/api/v1/totalRecovered', async (req, res) => {
  try { 
    const result = await connection.aggregate([

      {$group:{_id:"total","recovered":{$sum:"$recovered"}}},
      
    ]) 
    res.status(200).json({
      data: result[0]
    })
  } catch (e) {
    res.status(500).json({
      status: 'Failed',
      message: e.message
    })
  }
})


app.get('/api/v1/totalActive', async (req, res) => {
  try {
    const result = await connection.aggregate([
      {$project:{"diff":{$subtract:["$infected","$recovered"]}}},
      {$group:{_id:"total","active":{$sum:"$diff"}}}
     
    ]) 
    res.status(200).json({
      data: result[0]
    })
  } catch (e) {
    res.status(500).json({
      status: 'Failed',
      message: e.message
    })
  }
})
app.get('/api/v1/totalDeath', async (req, res) => {
  try {
    const result = await connection.aggregate([

      {$group:{_id:"total","death":{$sum:"$death"}}}
     
    ]) 
   
    res.status(200).json({
      data: result[0]
    })
  } catch (e) {
    res.status(500).json({
      status: 'Failed',
      message: e.message
    })
  }
})


app.get('/api/v1/hotspotStates', async (req, res) => {
  try {
    const result = await connection.aggregate([
     {$project:{_id:0,"state":"$state",
     "rate":{$round:[{$divide:[{$subtract:["$infected","$recovered"]},"$infected"]},5]}}}
    
     
    ]) 
    res.status(200).json({
      data: result
    })
  } catch (e) {
    res.status(500).json({
      status: 'Failed',
      message: e.message
    })
  }
})

app.get('/api/v1/healthyStates', async (req, res) => {
  try {
    const result = await connection.aggregate([
     {$project:{_id:0,"state":"$state",
     "mortality":{$round:[{$divide:["$death","$infected"]},5]}}}
    
     
    ]) 
    res.status(200).json({
      data: result
    })
  } catch (e) {
    res.status(500).json({
      status: 'Failed',
      message: e.message
    })
  }
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;