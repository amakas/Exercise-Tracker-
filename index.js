require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique:true }
})

const exerciseSchema = new mongoose.Schema({
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
  res.json({username: user.username, _id: user.id});
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await userModel.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const exercise = new exerciseModel({ _id: req.body._id, description: req.body.description, duration: req.body.duration, date: req.body.date });
  await exercise.save();
  date = exercise.date;
  if(date){
    date.toDateString()
  }
  else{date= new Date().toDateString()}
  res.json({_id: exercise.id, description: exercise.description, duration: exercise.duration, date: date});
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
