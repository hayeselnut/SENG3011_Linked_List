exports.error = (statusCode, errorMessage) => ({
    errorMessage: `${statusCode} ${errorMessage}`,
});

exports.success = (response, responseField) => {
    const successResponse = {
        "log": {
            "team": "SENG3011_LINKED_LIST",
            "time_accessed": new Date(Date.now()).toISOString(),
        },
    };
    successResponse[responseField] = response;
    return successResponse;
};