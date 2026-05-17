const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        REF: 'user'
    },
   accountId: {
        type: mongoose.Schema.Types.ObjectId
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 150000
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
      accountType:{
        type: String,
        enum: ['savings', 'current'],
        default: 'savings'
    },
    transferAttempts: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const account = mongoose.model('accounts', accountSchema);

module.exports= account;