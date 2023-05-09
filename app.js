require('dotenv').config();
const express = require('express')
const { v4: uuidv4, isUUID } = require('uuid')
const mongoose = require('mongoose')
const validator = require('validator')


// Connect to MongoDB
mongoose.connect("mongodb://0.0.0.0:27017/taskDB")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB: ', error);
  });

// User schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: [String], default: [] },
});

// User model
const User = mongoose.model('User', userSchema);

const app = express();

app.use(express.json());


// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  }
   catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!validator.isUUID(userId)) {
    // userId is not valid
    res.status(400).json({ message: 'Invalid userId' });
    return;
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      // userid found but data doesn't exist
      res.status(404).json({ message: 'User not found' });
    }
     else {
      res.status(200).json(user);
    }
  } 
  catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Creating a new user
app.post('/api/users', async (req, res) => {
  const { username, age, hobbies } = req.body;
  if (!username || !age || !hobbies) {
    // one of the above fields is missing
    res.status(400).json({ message: 'Username, age, and hobbies are required' });
    return;
  }
  const newUser = new User({
    // to generate unique id
    id: uuidv4(),
    username,
    age,
    hobbies,
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } 
  catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Updating an existing user
app.put('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!validator.isUUID(userId)) {
    res.status(400).json({ message: 'Invalid userId' });
    return;
  }

  const { username, age, hobbies } = req.body;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      // userid is not valid
      res.status(404).json({ message: 'User not found' });
    } 
    else {
      user.username = username || user.username;
      user.age = age || user.age;
      user.hobbies = hobbies || user.hobbies;

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deleting a user
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!validator.isUUID(userId)) {
      // userid is not valid
      res.status(400).json({ message: 'Invalid userId' });
      return;
    }
  
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        // valid userid but record doesn't exist
        res.status(404).json({ message: 'User not found' });
      } 
      else {
        await User.deleteOne({ id: userId });
        res.sendStatus(204);
      }
    } 
    catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Handling non-existing endpoints
  app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
  });
  
  // Handling errors
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  });
  
  // console.log(process.env.PORT);
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  
