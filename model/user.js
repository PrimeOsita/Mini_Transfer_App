const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    fullName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0  
    },
    lockUntil: {
        type: Date
    }
}, {timestamps: true});

const user = mongoose.model('user', userSchema);

module.exports= user;