const express = require('express');
require('./db.js');
require('dotenv').config();
const routes = require('./routes.js');
const app = express();
const port = process.env.API_PORT;

app.use(express.json());

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.use('/api', routes);

app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});

