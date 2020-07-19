const mongoose = require('mongoose')
const cors=require('cors')
const morgon=require('morgan')
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const express = require('express')
const app = express()
const expressValidator=require('express-validator')
const dotenv = require('dotenv')
dotenv.config()


//db connection

const authRoutes=require('./routes/auth')
const userRoutes=require('./routes/user')
const categoryRoutes=require('./routes/category')
const productRoutes=require('./routes/product')
const braintreeRoutes=require('./routes/braintree')
const orderRoutes=require('./routes/order')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})
.then(() => {
    console.log('DB connected')
})

//for checking error in mongodb server

// mongoose.connection.on('error', err => {
//     console.log(`DB connection error: ${err.message}`)
// })
app.use(cors())
app.use(morgon('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator())


app.use('/api',userRoutes)
app.use('/api',authRoutes)
app.use('/api',categoryRoutes)
app.use('/api',productRoutes)
app.use('/api',braintreeRoutes)
app.use('/api',orderRoutes)
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

