const express = require("express");
const taskRoutes = require('./routes/tasks.routes');
const cors = require('cors');
const origin = require('../origin');

const app = express();

// CORS
app.use(cors({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// MIDDLEWARE
app.use(express.json());
app.use('/', taskRoutes);

app.listen(3000);
console.log("Server working");