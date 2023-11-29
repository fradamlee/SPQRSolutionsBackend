const pool = require('../../database/db');

const setDefalutValuesForGetAlgos = (query) => {
    if (!query.q) query.q="";
    if (!query.limit) query.limit=60;
    if (!query.offest) query.offest=0;
}

const fragmentQueryToGetUserAtributesOfSelection = 
"users_public_data.id AS id, users_public_data.user_name AS owner_user_name, users_public_data.photo_link AS owner_photo_link ";

const getQueryAndValuesApplingFKFilters = (queryAttributes) => {
    const {algo_id, q, limit, offset } = queryAttributes;
    if (!algo_id) return {
        query: 'SELECT ' +
        fragmentQueryToGetUserAtributesOfSelection +
        'FROM users_public_data WHERE user_name LIKE ($1) ORDER BY user_name ASC LIMIT ($2) OFFSET ($3)',
        values: ["%" + q + "%", limit, offset]
    }; else return {
        query: 'SELECT ' +
        fragmentQueryToGetUserAtributesOfSelection +
        'FROM algos INNER JOIN users_public_data ON algos.owner_id = users_public_data.id WHERE algos.id=($1) AND user_name LIKE ($2) ORDER BY user_name ASC LIMIT ($3) OFFSET ($4)',
        values: [algo_id, "%" + q + "%", limit, offset]
    }
}

const getUsers = async (req, res) => {
    const queryAttributes = req.query;
    setDefalutValuesForGetAlgos(queryAttributes);
    const { query, values } = getQueryAndValuesApplingFKFilters(queryAttributes);
    const result = await pool.query(query, values);
    res.json({
        users: result.rows
    });
}

module.exports = getUsers;
