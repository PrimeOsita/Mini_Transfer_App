const userModel = require('../model/user');
const accountModel = require('../model/account');
const HistoryModel = require('../model/transactionHistory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otp = require('otp-generator');

exports.register = async (req, res) => {
    try {
       const {fullName, emailAddress, password, confirmPassword, pin} = req.body;
       
       const existingEmail = await userModel.findOne({emailAddress: emailAddress.toLowerCase()});
       if(existingEmail) {
        return res.status(400).json({
            message: `User with email ${emailAddress} already exists`
        })
       }
       if(password !== confirmPassword) {
        return res.status(400).json({
            message: 'Password does not match'
        })
       }

       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);
       const Pin = await bcrypt.genSalt(10);
       const hashedPin = bcrypt.hash(pin, Pin)
       const user = await userModel.create({
        fullName,
        emailAddress: emailAddress.toLowerCase(),
        password: hashedPassword,
       })
       const account = await accountModel.create({
        accountName: user.fullName,
        accountNumber: otp.generate(10, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false }),
        userId: user._id,
        pin: Pin
       })

       const userAccount = {
        name: user.fullName,
        email: user.emailAddress,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        pin: Pin
       }

       res.status(201).json({
        message: 'User created succesfully',
        userAccount
       })
    } catch (error) {
         return res.status(500).json({
            error: error.message
         })
    }
},

exports.login = async (req, res) => {
    try {
        const { emailAddress, password} = req.body;

        const user = await userModel.findOne({emailAddress : emailAddress.toLowerCase()});
        if(!user) {
            return res.status(400).json({
                message: 'User does not exist'
            })
            }
        
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                message: `Account locked until ${user.lockUntil}`
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 10 * 60000);
                user.loginAttempts = 0;
            }
            await user.save();
            return res.status(400).json({
                message: `Invalid Credentials`
            })
        }

        const token = await jwt.sign({ id: user._id, email: user.emailAddress}, process.env.JWT_SECRET, { expiresIn: '7 days'});

        res.status(200).json({
            message: 'Login successful',
            token
        })
    } catch (error) {
         res.status(500).json({
            error: error.message
         })
    }
}

exports.createAccount = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if(!user) {
            return res.status(400).json({
                message: 'User does not exist'
            })
        }
        const accountType = req.body.accountType || 'savings';
        const account = await accountModel.create({
            userId: user._id,
            accountName: user.fullName,
            accountNumber: otp.generate(10, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false }),
            accountType: accountType,
        });
    
        await account.save();

        res.status(201).json({
            message: 'Account created successfully',
            data: {
                accountNumber: account.accountNumber,
                accountType: account.accountType
            }
        });

    } catch (error) {
         res.status(500).json({
            error: error.message
         })
    }
};

exports.totalBalance =async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if(!user) {
            return res.status(400).json({
                message: 'User does not exist'
            })
        }
        const balance = await accountModel.find({userId: id});
        if(!balance) {
             return res.status(400).json({
                message: 'Account does not exist'
            })
        }

        const total = balance.reduce((e, account) => e + parseFloat(account.balance), 0);

        res.status(200).json({
            message: 'Successfull',
            totalFunds: total
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
};

exports.transferFunds = async (req, res) => {
    try {
        const { id } = req.user;
        const { senderAccountDetails, recieverAccountDetails, amount } = req.body;
        const sender = await userModel.findById(id);
        if(!sender) {
           return res.status(400).json({
                message: 'Sender does not exist'
            })
        }
        const senderAccount = await accountModel.findOne({ accountNumber: sendersAccountNumber });
        if (!senderAccount) {
             return res.status(400).json({
                message: 'Account does not exist',
            })
                

        }
        const recieverAccount = await accountModel.findOne({ accountNumber: recipientAccountNumber});

        if (senderAccount.lockUntil && senderAccount.lockUntil > Date.now()) {
            return res.status(403).json({
                message: `Account locked until ${senderAccount.lockUntil}`
            })
        }

        if (!recieverAccount) {
            return res.status(400).json({
                message: 'Account does not exist'
            })
        }
        if (amount > senderAccount.balance) {
           return res.status(400).json({
            message: 'Insufficient funds'
           })
        }
        if (senderAccount.pin !== pin) {
            senderAccount.transferAttempts += 1;
            if (senderAccount.transferAttempts >= 5) {
                senderAccount.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
                senderAccount.transferAttempts = 0;
            }
            await senderAccount.save();
            return res.status(400).json({
                message: 'Invalid Pin, your account will be blocked after a few trial'
            })
        }

        senderAccount.balance -= amount;
        recieverAccount.balance += amount;

        await HistoryModel.create({
        accountId: senderAccount._id,
        debit: amount,
        credit: 0
        });
        await HistoryModel.create({
        accountId: recipientAccount._id,
        credit: amount,
        debit: 0
        });
        await senderAccount.save();
        await recipientAccount.save();
        res.status(200).json({
            message: 'Transfer Successful ✅',
            data: { senderAccountDetails: senderAccount.accountNumber, recieverAccountDetailsr: recipientAccount.accountNumber, recieverName: recieverAccount.accountName, amount }
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}