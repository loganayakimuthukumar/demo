const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/link');
const timeRoutes = require('./routes/time');



const app = express();

connectDB();


app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api', linkRoutes);
app.use('/api', timeRoutes);



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
