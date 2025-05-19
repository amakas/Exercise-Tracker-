const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
console.log('MONGO_URI:', process.env.MONGO_URI);
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new mongoose.Schema({
  username: {type: String, required: true}
})


const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
})


const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log:[String]
})
const userModel = mongoose.model('User', userSchema);
const exerciseModel = mongoose.model('Exerise', exerciseSchema);
const logModel = mongoose.model('Log', logSchema);

app.post('/api/users', async (req, res) => {
  const user = new userModel({ username: req.body.username });
  await user.save();
  res.json(user);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
