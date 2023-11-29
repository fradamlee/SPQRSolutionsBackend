const { Router } = require("express");
const { signIn, logIn, isValidToken } = require("../controllers/auth.controller");
const { createAlgo, getAlgos, updateAlgo, deleteAlgo } = require("../controllers/algo.controller");
const getTopics = require("../controllers/topic.contoller");
const { tryPostVote, tryDeleteVoteRecord, getSumOfVotes, getAllTheVotesFromAnAlgo } = require("../controllers/votes.controller");
const { tryGetCommentsAndCommentatorsData, postComment, deleteComment } = require("../controllers/comment.controller");
const getUsers = require("../controllers/user.controller");

const router = Router();

router.post(
    '/signIn',
    signIn
);

router.post(
    '/logIn',
    logIn
);

router.get(
    '/users',
    getUsers
);

router.post(
    '/algos',
    isValidToken,
    createAlgo
);

router.get(
    '/algos',
    getAlgos
);

router.put(
    '/algos/:algo_id',
    isValidToken,
    updateAlgo
);

router.delete(
    '/algos/:algo_id',
    isValidToken,
    deleteAlgo
);

router.post(
    '/algos/:algo_id/votes',
    isValidToken,
    tryPostVote 
);

router.get(
    '/algos/:algo_id/votes',
    getSumOfVotes
);

router.get(
    '/algos/:algo_id/allTheVotes',
    getAllTheVotesFromAnAlgo
)

router.delete(
    '/algos/:algo_id/votes',
    isValidToken,
    tryDeleteVoteRecord
);

router.post(
    '/algos/:algo_id/comments',
    isValidToken,
    postComment
);

router.get(
    '/algos/:algo_id/comments',
    tryGetCommentsAndCommentatorsData
);

router.delete(
    '/algos/:algo_id/comments/:comment_id',
    isValidToken,
    deleteComment
);

router.get(
    '/topics',
    getTopics
);

module.exports = router;