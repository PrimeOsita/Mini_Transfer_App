const userModel = require('../model/user');
const accountModel = require('../model/account');
const transactionHistoryModel = require('../model/transactionHistory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
       const {fullName, emailAddress, password, confirmPassword } = req.body;
       
       const existingEmail = await userModel.findOne({emailAddress: emailAddress.toLowerCase()});
       if(existingEmail) {
        return next({
            message: `User with email ${emailAddress} already exists`,
            statusCode: 400
        })
       }


       if(password !== confirmPassword) {
        return next({
            message: `Password does not match`,
            statusCode: 400
        })
       }

       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       const user = await userModel.create({
        fullName,
        emailAddress: emailAddress.toLowerCase(),
        password: hashedPassword,
       })

       const accData = await accountModel.create({
        accountName: fullName,
        accountNumber: Math.floor(Math.random()*1E10),
        accountType: 'savings',
        userId: user._id
       })

       const data = {
        name: user.fullName,
        email: user.emailAddress,
        accountNumber: accData.accountNumber,
        accountType: accData.accountType
       }

       res.status(201).json({
        message: 'User created succesfully',
        data
       })
    } catch (error) {
         next({
                message: error.message,
                statusCode: 500
            })
    }
},

exports.login = async (req, res, next) => {
    try {
        const { emailAddress, password} = req.body;

        const user = await userModel.findOne({emailAddress : emailAddress.toLowerCase()});
        if(!user) {
            return next({
                message: `User with email ${emailAddress} does not exist`,
                statusCode: 404
            })
        }
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return next({
                message: `Account locked until ${user.lockUntil}`,
                statusCode: 403
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
                user.loginAttempts = 0;
            }
            await user.save();
            return next({
                message: `Invalid Credentials`,
                statusCode: 400
            })
        }

        const token = await jwt.sign({ id: user._id, email: user.emailAddress}, process.env.JWT_SECRET, { expiresIn: '7 days'});

        res.status(200).json({
            message: 'Login successful',
            token
        })
    } catch (error) {
         next({
                message: error.message,
                statusCode: 500
            })
    }
};

exports.createAccount = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if(!user) {
            return next({
                message: `User does not exist`,
                statusCode: 404
            })
        }
        // console.log(req.protocol);
        const accountType = req.body.accountType || 'savings';
        const accData = await accountModel.create({
            userId: user._id,
            accountName: user.fullName,
            accountNumber: Math.floor(Math.random()*1E10),
            accountType: accountType
        });
        await accData.save();

        res.status(201).json({
            message: 'Account created successfully',
            data: {
                accountNumber: accData.accountNumber,
                accountType: accData.accountType
            }
        });

    } catch (error) {
         next({
                message: error.message,
                statusCode: 500
            })
    }
};

exports.totalBalance =async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if(!user) {
            return next({
                message: `User does not exist`,
                statusCode: 404
            })
        }
        const totalBalance = await accountModel.find({userId: id});
        if(!totalBalance) {
            return next({
                message: `Account does not exist`,
                statusCode: 404
            })
        }

        const total = totalBalance.reduce((acc, account) => acc + parseFloat(account.balance), 0);

        res.status(200).json({
            message: 'Total funds retrieved successfully',
            totalFunds: total
        })
    } catch (error) {
        next({
                message: error.message,
                statusCode: 500
            })
    }
};

exports.createPin = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);

        if (!user) {
            return next({
                message: `user with ${id} not found`,
                statusCode: 404
            })
        }

        const { pin } = req.body;

        if (pin.length > 4) {
            return next({
                message: `Pin must be 4 digits`,
                statusCode: 400
            })
        }

        const salt = await bcrypt.genSalt(10);
       const hashedPin = await bcrypt.hash(pin, salt);

        const setpin = {
            pin : hashedPin
        }

        const updatePin = await accountModel.findOneAndUpdate({userId: id}, setpin, {new: true});

        res.status(200).json({
            message: 'pin set succesfully'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.transferFunds = async (req, res, next) => {
    try {
        const { id } = req.user;
        const acccountId = req.params.id;

        const { sendersAccountNumber, recipientAccountNumber, amount, pin, memo } = req.body;
        const sender = await userModel.findById(id);
        if(!sender) {
            return next({
                message: `User does not exist`,
                statusCode: 404
            })
        }
        const senderAccount = await accountModel.findOne({ $or: [{ accountNumber: sendersAccountNumber }, { _id: acccountId }] });
        if (!senderAccount) {
            return next({
                message: `Sender account does not exist`,
                statusCode: 404
            })
        }
        const recipientAccount = await accountModel.findOne({ accountNumber: recipientAccountNumber});

        // console.log(recipientAccount);
        if (!recipientAccount) {
            return next({
                message: `Recipient account does not exist`,
                statusCode: 404
            })
        }

        if(senderAccount.pin === undefined) {
            return next({
                message: `Please set a transfer pin to continue`,
                statusCode: 400
            })
        }

        const pinMatch = await bcrypt.compare(pin, senderAccount.pin);

        if (!pinMatch) {
            return next({
                message: `Invalid pin`,
                statusCode: 400
            })
        }

        if (amount > senderAccount.balance) {
            return next({
                message: `Insufficient funds`,
                statusCode: 400
            })
        }

        senderAccount.balance -= amount;
        recipientAccount.balance += amount;

        await transactionHistoryModel.create({
        accountId: senderAccount._id,
        debit: amount,
        credit: 0,
        memo: memo || `Transfer to account ${recipientAccount.accountNumber}`
        });
        await transactionHistoryModel.create({
        accountId: recipientAccount._id,
        credit: amount,
        debit: 0,
        memo: memo || `Transfer from account ${senderAccount.accountNumber}`
        });
        await senderAccount.save();
        await recipientAccount.save();
        res.status(200).json({
            message: 'Funds transferred successfully',
            data: { senderAccountNumber: senderAccount.accountNumber, recipientAccountNumber: recipientAccount.accountNumber, recipientName: recipientAccount.accountName, amount }
        });
    } catch (error) {
        next({
                message: error.message,
                statusCode: 500
            })
    }
};

exports.getAllAccounts = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);
        if(!user) {
            return next({
                message: `User does not exist`,
                statusCode: 404
            })
        }
        console.log(id);
        const accounts = await accountModel.find({userId: id}).select('accountNumber accountType _id');
        res.status(200).json({
            message: 'Accounts retrieved successfully',
            data: accounts
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}