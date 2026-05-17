const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId
    },
    debit: {
        type: Number,
        default: 0
    },
    credit: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const transactionHistory = mongoose.model('transactionHistories', transactionHistorySchema);

module.exports= transactionHistory;