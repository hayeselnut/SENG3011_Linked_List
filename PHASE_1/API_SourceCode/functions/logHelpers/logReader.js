const getLogs = async (db) => {
    const snapshot = await db.collection("logs")
        .orderBy("timestamp", "desc")
        .limit(20)
        .get();

    const logs = extractLogsFromSnapshot(snapshot);
    return logs;
};

const extractLogsFromSnapshot = (snapshot) => {
    const logs = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        data.timestamp = data.timestamp.toDate();
        logs.push(data);
    });

    return logs;
};

exports.getLogs = getLogs;
