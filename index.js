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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  duration: Number,
  date: Date
})


const userModel = mongoose.model('User', userSchema);
const exerciseModel = mongoose.model('Exerсise', exerciseSchema);


app.post('/api/users', async (req, res) => {
  try{
  const existingUser = await userModel.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(409).json({ error: 'This username already exists' });
    }

  const user = new userModel({ username: req.body.username });
  await user.save();
  res.json({username: user.username, _id: user.id});
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    
    const users = await userModel.find({}, 'username _id');
    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  let date = req.body.date;
  if(date){
   date = new Date(date).toDateString()
  }
  else{date= new Date().toDateString()}
  
  const exercise = new exerciseModel({ userId: req.params._id, description: req.body.description, duration: req.body.duration, date: date });
  await exercise.save();
  
  res.json({ _id: exercise.userId, description: exercise.description, duration: exercise.duration, date: date});
});

app.get('/api/users/:_id/logs?[from][&to][&limit]', async(req,res)=>{
  try{
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;
    const userId = req.params._id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let dateFilter = {};
    if (from) {
      dateFilter.$gte = new Date(from);  
    }
    if (to) {
      dateFilter.$lte = new Date(to);    
    }

    let filter = { userId: userId };
    if (from || to) {
      filter.date = dateFilter;
    }

    let query = exerciseModel.find(filter);

    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const exercises = await query.exec();
  
  const log = exercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }))
  
  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log
  }
  )
}
   catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
