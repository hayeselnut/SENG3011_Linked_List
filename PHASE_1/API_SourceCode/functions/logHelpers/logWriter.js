const writeLog = async (db, request, response) => {
    const newLog = createLog(request, response);
    await db.collection("logs").add(newLog);
};

const createLog = (request, response) => {
    const newLog = {};
    const now = new Date();
    newLog.timestamp = now;
    newLog.endpoint = `/api${request.originalUrl}`;
    newLog.queryParams = request.query;
    newLog.pathParams = request.params;
    newLog.response = response;

    return newLog;
};

exports.writeLog = writeLog;
