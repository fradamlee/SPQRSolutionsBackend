const userNameRepeted = {
    "response": 6,
    "message": "username is repeted"
};

const invalidUserCredentialsCanRetry = {
    "response": 2,
    "message": "invalid user credentials, can retry"
};

const youAreNotTheOwner = {
    "response": 10,
    "message": "Permission denied: You are not the owner"
}

module.exports = 
{
    userNameRepeted,
    invalidUserCredentialsCanRetry,
    youAreNotTheOwner
};