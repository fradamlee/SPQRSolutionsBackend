const pool = require('../../database/db');
const { youAreNotTheOwner } = require('./responses')

const createAlgo = async (req, res) => {
    const { title, about, code, t1, t2, t3 } = req.body;
    const user_id = req.user.user_id;
    const result = await pool.query(
        'INSERT INTO algos(title, code, about, owner_id, t1, t2, t3, likes, dislikes) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [title, code, about, user_id, t1, t2, t3, 0, 0]
    );
    res.json({
        id_assiged: result.rows[0].id
    });
}

const setDefalutValuesForGetAlgos = (query) => {
    if (!query.q) query.q="";
    if (!query.limit) query.limit=60;
    if (!query.offest) query.offest=0;
}

const getQueryAndValuesApplingFKFilters = (queryAttributes) => {
    const {q, limit, offset, user_id, topic_id } = queryAttributes;
    if (!user_id && !topic_id) return {
        query: 'SELECT * FROM algos WHERE title LIKE ($1) ORDER BY (likes - dislikes) DESC LIMIT ($2) OFFSET ($3)',
        values: ["%" + q + "%", limit, offset]
    }; else if (user_id && topic_id) return {
        query: 'SELECT * FROM algos WHERE title LIKE ($1) AND owner_id=($2) AND (t1=($3) OR t2=($3) OR t3=($3)) ORDER BY (likes - dislikes) DESC LIMIT ($4) OFFSET ($5)',
        values: ["%" + q + "%", user_id, topic_id, limit, offset]
    }; else if (!!user_id) return {
        query: 'SELECT * FROM algos WHERE title LIKE ($1) AND owner_id=($2) ORDER BY (likes - dislikes) DESC LIMIT ($3) OFFSET ($4)',
        values: ["%" + q + "%", user_id, limit, offset]
    }; else return {
        query: 'SELECT * FROM algos WHERE title LIKE ($1) AND (t1=($2) OR t2=($2) OR t3=($2)) ORDER BY (likes - dislikes) DESC LIMIT ($3) OFFSET ($4)',
        values: ["%" + q + "%", topic_id, limit, offset]
    };
}

const getAlgos = async (req, res) => {
    const queryAttributes = req.query;
    setDefalutValuesForGetAlgos(queryAttributes);
    const { query, values } = getQueryAndValuesApplingFKFilters(queryAttributes);
    const result = await pool.query(query, values);
    res.json({
        algos: result.rows
    });
}

const updateAlgo = async (req, res) => {
    const { title, about, code, t1, t2, t3 } = req.body;
    const user_id = req.user.user_id;
    const algo_id = req.params.algo_id;
    const result = await pool.query(
        'UPDATE algos SET title=($1), about=($2), code=($3), t1=($4), t2=($5), t3=($6) WHERE id=($7) AND owner_id=($8) RETURNING id',
        [title, about, code, t1, t2, t3, algo_id, user_id]
    );
    if (result.rows.length === 1) res.status(200).json({message: "Successfully updated"});
    else res.status(403).json(youAreNotTheOwner);
}

const deleteAlgo = async (req, res) => {
    const user_id = req.user.user_id;
    const algo_id = req.params.algo_id;
    const result = await pool.query(
        'DELETE FROM algos WHERE id=($1) AND owner_id=($2) RETURNING id',
        [algo_id, user_id]
    );
    if (result.rows.length === 1) res.status(200).json({message: "Successfully deleted"});
    else res.status(403).json(youAreNotTheOwner);
}

module.exports = { 
    createAlgo, 
    getAlgos, 
    updateAlgo, 
    deleteAlgo, 
};