const pool = require('../../database/db');

const getTopics = async (req, res) => {
    const result = await pool.query('SELECT * FROM topics', []);
    res.json({
        topics: result.rows
    });
};

module.exports = getTopics;