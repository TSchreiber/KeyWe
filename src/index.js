require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const { connectDB } = require('./db');

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.set("views","./views");
app.set("view engine", "ejs");

connectDB();

app.use('/', routes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
