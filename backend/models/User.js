// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    alias: 'userId' // This allows fetching by 'userId' which is common in your app
  },
  
  name: {
    type: String,
    // required: true,
    trim: true,
    maxlength: 100
  },
  
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  stats: {
    circuitsCreated: {
      type: Number,
      default: 0
    },
    gatesUsed: {
      type: Number,
      default: 0
    },
    simulationsRun: {
      type: Number,
      default: 0
    },
    codeExports: {
      type: Number,
      default: 0
    }
    // Note: The structure here mirrors the 'userStats' object you already use in app.js
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster email lookups
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);