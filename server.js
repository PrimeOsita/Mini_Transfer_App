const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT ||7777;
// const rateLimiter = require('./middleware/rateLimiter');
const userRouter = require('./routes/user');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
// app.use(cors({origin: 'http://localhost:4070'}))
app.use(cors({origin: '*'}));
app.use(express.json());
// app.use(rateLimiter);
app.use('/api/v1/user', userRouter);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mini-Transfer-Api',
    version: '1.0.0',
    description: 'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    license: {
      name: 'official URL',
      url: 'http://google.com'
    },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com'
    },
 },
 servers: [
   {
     url: 'https://mini-transfer-app-1.onrender.com',
     description: 'Development server',
   },
 ],
 security: [
   {
     bearerAuth: []
   }
 ],
 components: {
   securitySchemes: {
     bearerAuth: {
       type: 'http',
       scheme: 'bearer',
       bearerFormat: 'JWT'
     }
   }
 }
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js']
}

const swaggerSpec = swaggerJsdoc(options);

app.use('/api/v1/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use((req, res, next) => {
    next({
                message: `route ${req.originalUrl} and ${req.method} not found`,
                statusCode: 500
            })
})

app.use((err, req, res, next) => {
    if (err.name === 'MulterError'){
        return res.status(400).json({
            message: 'File upload failed'
        })
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Session expired, please login again'
        })
    }
    res.status(500).json({
        message: err.message
    })
})

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        console.log(`Server is listening to Port: ${PORT}`);
    });
}).catch((error) => {
    console.log("Unable to connect:", error.message);
});