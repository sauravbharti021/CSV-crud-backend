require("dotenv").config();
const express = require('express')

const app = express()
const PORT= 5000
const cors= require('cors')

require('./db/connection')
const router = require('./routes/router.js')

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static("./uploads"))
app.use('/files',express.static('./public/files'))

app.use(router)

app.listen(PORT, ()=>{
    console.log(`Server started at Port ${PORT}`)
})
