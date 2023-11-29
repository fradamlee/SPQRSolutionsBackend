const pool = require('../../database/db');

const getVoteUnit = (like_or_dislike) => {
    if(like_or_dislike === true) return 1;
    else if (like_or_dislike === false) return -1;
    throw new Error("Invalid vote request");
}

const postVote = async (req) => {
    const user_id = req.user.user_id;
    const { like_or_dislike } = req.body;
    const algo_id = req.params.algo_id;
    await pool.query(
        "INSERT INTO votes (like_or_dislike, voter_id, algo_id_voted) VALUES ($1, $2, $3)",
        [like_or_dislike, user_id, algo_id]
    )
}

const handleErrorsInVoting = (err, res) => {
    if (err.message === 'duplicate key value violates unique constraint "votes_voter_id_algo_id_voted_key"') {
        res.status(403).json({message: 'You already voted for this algo'});
    } else if (err.message === 'Invalid vote request') {
        res.status(401).json({message: err.message});
    } else if (err.message === "Cannot read properties of undefined (reading 'like_or_dislike')") {
        res.status(403).json({message: "You can't revoke a vote because, you don't have a record vote for this algo"});
    } else {
        console.log(err.message);
        res.status(500).json({message: err.message});
    }
}

const tryPostVote = async (req, res) => {
    try {
        await postVote(req);
        res.status(200).json({message: "Vote succesfully uploaded"});
    } catch (err) {
        handleErrorsInVoting(err, res);
    }
};
//

const deleteVoteRecord = async (req) => {
    const user_id = req.user.user_id;
    const algo_id = req.params.algo_id;
    const result = await pool.query(
        'DELETE FROM votes WHERE voter_id=($1) AND algo_id_voted=($2) RETURNING like_or_dislike',
        [user_id, algo_id]
    );
    return result.rows[0].like_or_dislike;
}

const tryDeleteVoteRecord = async (req, res, next) => {
    try {
        const like_or_dislike = await deleteVoteRecord(req);
        const vote = getVoteUnit(like_or_dislike);
        req.vote = vote;
        res.status(200).json({message: "Vote successfully revoked"})
    } catch (err) {
        handleErrorsInVoting(err, res)
    }
}

const getSumOfVotes = async (req, res) => {
    const algo_id = req.params.algo_id;
    const result = await pool.query(
        'SELECT (votes) FROM algos WHERE id=($1)', [algo_id]
    );
    try {
        res.json({votes: result.rows[0].votes});
    } catch (error) {
        console.log(error);
        res.status(401).json({message: error.message})
    }
}

const getAllTheVotesFromAnAlgo = async (req, res) => {
    const algo_id = req.params.algo_id;
    const result = await pool.query(
        'SELECT COUNT(*) as total FROM votes WHERE algo_id_voted = $1', [algo_id]
    );
    try {
        res.json({allTheVotes: result.rows[0].total});
    } catch (error) {
        console.log(error);
        res.status(401).json({message: error.message})
    }
}

module.exports = {
    tryPostVote,
    tryDeleteVoteRecord,
    getSumOfVotes,
    getAllTheVotesFromAnAlgo
};