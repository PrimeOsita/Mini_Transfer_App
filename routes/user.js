const { register, login, createAccount, addFunds, totalBalance, transferFunds, getAllAccounts, createPin } = require("../controller/user");
const { authenticate } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
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
 *     responses:
 *       201:
 *         description: User created succesfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: User created successfully
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: An error message
 *                    example: User already exists
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
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Login successful
 *       400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: An error message
 *                  example: Invalid credentials
 */

router.post('/login', rateLimiter, login);

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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  description: An error message
 *                  example: Invalid account details
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
 *         description: Total funds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Total funds retrieved successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *                   example: User not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Account ID
 *         schema:
 *           type: string
 *           example: 69f6fc59f069dce732d54a15
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientAccountNumber:
 *                 type: string
 *                 description: The account number of the user receiving funds
 *                 example: 0987654321
 *               amount:
 *                 type: number
 *                 description: The amount to transfer
 *                 example: 1000
 *               pin:
 *                 type: string
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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *                   example: Invalid pin
 */

router.put('/transferFunds/:id', authenticate, transferFunds);

/** 
 * @swagger
 * /api/v1/user/allAccounts:
 *   get:
 *     tags:
 *      - User
 *     summary: Get All User Accounts
 *     description: Retrieve all accounts for the authenticated user
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Accounts retrieved successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *                   example: User not found
 */

router.get('/allAccounts', authenticate, getAllAccounts);

/** 
 * @swagger
 * /api/v1/user/pin:
 *   post:
 *     tags:
 *      - User
 *     summary: Create Transfer Pin
 *     description: Create a transfer pin for the authenticated user
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 description: The transfer pin for the user
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Pin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: Pin created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *                   example: User not found
 */

router.post('/pin', authenticate, createPin);

module.exports = router