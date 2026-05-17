const { register, login, createAccount, addFunds, totalBalance, transferFunds } = require("../controller/user");
const { authenticate } = require("../middleware/auth");
const router = require('express').Router();

/** 
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/** 
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     tags:
 *      - User
 *     summary: User Registration
 *     description: Register a new user with fullname, email, password and other details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string 
 *                 description: The User's Name
 *                 example: John Does
 *               emailAddress:
 *                 type: string
 *                 description: The User's Email
 *                 example: 0MfPp@example.com
 *               password:
 *                 type: string
 *                 description: The User's Password
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 description: The User's Confirm Password
 *                 example: password123
 *               pin:
 *                 type: number
 *                 decription: The User's Transfer Pin
 *                 example: 1234
 *     responses:
 *       201:
 *         description: User registered succesfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: User registered successfully
 */


router.post('/register', register);

/** 
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags:
 *      - User
 *     summary: User Login
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 description: The User's Email
 *                 example: 0MfPp@example.com
 *               password:
 *                 type: string
 *                 description: The User's Password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: User logged in successfully
 */

router.post('/login', login);

/** 
 * @swagger
 * /api/v1/user/account:
 *   put:
 *     tags:
 *      - User
 *     summary: Create User Account
 *     description: Create a new account for the authenticated user
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 description: The User's Account Number
 *                 example: 1234567890
 *               accountType:
 *                 type: string
 *                 description: The User's Account Type (savings or current)
 *                 example: savings 
 *               pin:
 *                 type: number
 *                 description: The User's Transfer Pin
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Account created successfully
 */

router.put('/account', authenticate, createAccount);

/** 
 * @swagger
 * /api/v1/user/totalBalance:
 *   put:
 *     tags:
 *      - User
 *     summary: Update User Total Balance
 *     description: Update the total balance for the authenticated user
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to add to the user's balance
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Total balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Total balance updated successfully
 */

router.put('/totalBalance', authenticate, totalBalance);

/** 
 * @swagger
 * /api/v1/user/transferFunds:
 *   put:
 *     tags:
 *      - User
 *     summary: Transfer Funds
 *     description: Transfer funds from one user's account to another
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendersAccountNumber:
 *                 type: string
 *                 description: The account number of the user transferring funds
 *                 example: 1234567890
 *               recipientAccountNumber:
 *                 type: string
 *                 description: The account number of the user receiving funds
 *                 example: 0987654321
 *               amount:
 *                 type: number
 *                 description: The amount to transfer
 *                 example: 1000
 *               pin:
 *                 type: number
 *                 description: The transfer pin of the sender's account
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Funds transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Funds transferred successfully
 */

router.put('/transferFunds', authenticate, transferFunds);

module.exports = router