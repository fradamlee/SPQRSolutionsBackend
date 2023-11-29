const pool = require('../../database/db');
const { youAreNotTheOwner } = require('./responses');

const postComment = async(req, res) => {
    const { comment } = req.body;
    const user_id = req.user.user_id;
    const algo_id = req.params.algo_id;
    try {
        const result = await pool.query(
            'INSERT INTO comments(comment, owner_id, belongs_to_algo_id, date_and_hour) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [comment, user_id, algo_id]
        );
        res.json({
            id_assiged: result.rows[0].id
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

//
const setDefalutValuesForGetAlgos = (query) => {
    if (!query.limit) query.limit=60;
    if (!query.offest) query.offest=0;
}

const fragmentQueryToGetCommentAtributesOfSelection = 
    "comments.id AS comment_id, comments.comment AS comment, comments.owner_id AS owner_id, comments.belongs_to_algo_id AS belongs_to_algo_id, comments.date_and_hour AS date_and_hour, ";

const fragmentQueryToGetUserAtributesOfSelection = 
    "users_public_data.user_name AS owner_user_name, users_public_data.photo_link AS owner_photo_link ";

const getCommentsAndCommentatorsData = async(algo_id, queryAttributes) => {
    const result = await pool.query(
        'SELECT ' +
        fragmentQueryToGetCommentAtributesOfSelection +
        fragmentQueryToGetUserAtributesOfSelection +
        'FROM comments INNER JOIN users_public_data ON comments.owner_id = users_public_data.id WHERE belongs_to_algo_id=($1) ORDER BY date_and_hour DESC LIMIT ($2) OFFSET ($3)',
        [algo_id, queryAttributes.limit, queryAttributes.offest]
    );
    return result.rows;
}

const tryGetCommentsAndCommentatorsData = async(req, res) => {
    const algo_id = req.params.algo_id;
    const queryAttributes = req.query;
    setDefalutValuesForGetAlgos(queryAttributes);
    try {
        res.json({
            commentData: await getCommentsAndCommentatorsData(algo_id, queryAttributes)
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const deleteComment = async (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.user.user_id;
    try {
        const result = await pool.query(
            'DELETE FROM comments WHERE id=($1) AND owner_id=($2) RETURNING id',
            [comment_id, user_id]
        );
        if (result.rows.length === 1) res.status(200).json({message: "Successfully deleted"});
        else res.status(403).json(youAreNotTheOwner);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    postComment,
    tryGetCommentsAndCommentatorsData,
    deleteComment
}