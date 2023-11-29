const pool = require('../../database/db');
const { sha256 } = require('js-sha256');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { userNameRepeted, invalidUserCredentialsCanRetry } = require('./responses');

const secretKey = process.env.JWT_SECRET;
const const_for_hash = process.env.const_for_hashing_password;

const getHashOfPassword = (password) => {
    return sha256(`${password}${const_for_hash}`);
}

const getHashOfPasswordFromQuery = (query) => {
    return query.rows[0].hash_of_password;
}

const getUserIdFromQuery = (query) => {
    return query.rows[0].id;
    
}

const getQueryOfUserByUsername = async (user_name) => {
    return await pool.query(
        'SELECT * FROM users WHERE user_name=($1)', [user_name]);
}

const insertUserData = async (user_name, hash_of_password) => {
    const result = await pool.query(
    'INSERT INTO users (user_name, hash_of_password, auth_provider) VALUES ($1, $2, $3) RETURNING id',
    [user_name, hash_of_password, '1']
    );
    console.log(result.rows[0]);
    return result.rows[0].id;
}

const insertNewIP = async (clientIP, user_id) => {
    await pool.query(
        'INSERT INTO ips (clientIP, user_id) VALUES ($1, $2)',
        [clientIP, user_id]
    );
}

const getToken = (user_id) => {
    const user_id_st = `${user_id}`;
    const token = jwt.sign(
        {'user_id': user_id_st}, secretKey, { expiresIn: '1h'}
    );
    return token;
}

const signIn = async (req, res) => {
    const { user_name, password } = req.body;
    const currentClientIP = `${req.ip}`;
    const hash_of_password = getHashOfPassword(password);
    try {
        const user_id = await insertUserData(user_name, hash_of_password)
        await insertNewIP(currentClientIP, user_id);
        res.json({ token: getToken(user_id)});
    } catch (error) {
        res.status(401).json(userNameRepeted);
        return;
    }
};

//
const userExists = (query) => {
    if (query.rows.length === 1) return true;
    else return false;
}

const areValidCredentials = async (queryOfUser, hash_of_password_entered) => {
    if (!userExists(queryOfUser)) return false;
    const hash_of_password_from_username = getHashOfPasswordFromQuery(queryOfUser);
    if (hash_of_password_entered === hash_of_password_from_username) return true;
    else return false;
}

const getIPsFromUserId = async (user_id) => {
    const query = await pool.query(
        'SELECT (clientIP) FROM ips WHERE user_id=($1)',
        [user_id]
    );
    return query.rows;
}

const hasPreviousSesionsFromCurrentIP = (validIPs, currentIP) => {
    return new Promise((resolve) => {
        validIPs.forEach((ele) => {
            if (ele.clientip === currentIP) resolve(true);
        });
        resolve(false);
    });
}

const logIn = async (req, res) => {
    try {
        const { user_name, password } = req.body;
        const hash_of_password_entered = getHashOfPassword(password);
        const queryOfUser = await getQueryOfUserByUsername(user_name);
        const user_id = getUserIdFromQuery(queryOfUser);
        const ips = await getIPsFromUserId(user_id);
        const currentIP = `${req.ip}`;
        const hasPreviousSesions =  await hasPreviousSesionsFromCurrentIP(ips, currentIP);
        const isValid = await areValidCredentials(queryOfUser, hash_of_password_entered);
        if (isValid && hasPreviousSesions) {
            const user_id = getUserIdFromQuery(queryOfUser);
            res.json({ token: getToken(user_id)});
        } else res.status(403).json(invalidUserCredentialsCanRetry);
    } catch (error) {
        if (error.message === "Cannot read properties of undefined (reading 'id')")
            res.status(401).json({message: 'User is not registread'})
    }
};

//

const getTokenFromRequest = (req) => {
    return req.header('Authorization');
}

const decodeToken = (token) => {
    return jwt.verify(token, secretKey);
}

const getDecodedOfTokenFromRequest = (req) => {
    const token = getTokenFromRequest(req);
    if (!token) throw new Error("Token not provided");
    return decodeToken(token);
}

const isValidToken = (req, res, next) => {
    try {
        req.user = getDecodedOfTokenFromRequest(req);
        next();
    } catch (error) {
        res.status(401).json({message: error.message});
    }
}

module.exports = { signIn, logIn, isValidToken};