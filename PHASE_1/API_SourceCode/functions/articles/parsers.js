const functions = require("firebase-functions");

const parseQuery = (queryParams) => {
    if (!("period_of_interest" in queryParams)) {
        throw new Error("'period_of_interest' must not be null");
    }
    const [startDate, endDate, wildcardedDate] = parsePeriodOfInterest(queryParams.period_of_interest);

    let keyTerms;
    if ("key_terms" in queryParams && queryParams.key_terms.trim() !== "") {
        keyTerms = parseKeyTerms(queryParams.key_terms.trim());
    } else {
        functions.logger.debug("no key terms specified");
        keyTerms = [];
    }

    let location;
    if ("location" in queryParams && queryParams.location.trim() !== "") {
        location = parseLocation(queryParams.location.trim());
    } else {
        functions.logger.debug("no location specified");
        location = "";
    }

    return {
        startDate: startDate,
        endDate: endDate,
        wildcardedDate: wildcardedDate,
        keyTerms: keyTerms,
        location: location,
    };
};

const parsePeriodOfInterest = (periodOfInterestString) => {
    const dateRegex = /^(\d{4})-(\d\d|xx)-(\d\d|xx) (\d\d|xx):(\d\d|xx):(\d\d|xx)$/;
    const splitDates = periodOfInterestString.split(" to ");
    let wildcardedDate = "";
    let startDate;
    let endDate;

    if (splitDates.length === 1) {
        // WILDCARDED DATE
        wildcardedDate = splitDates[0].trim();
        if (!wildcardedDate.includes("x")) {
            throw new Error(`'${wildcardedDate} does not contain any wildcards`);
        }

        if (!wildcardedDate.match(dateRegex)) {
            throw new Error(`'${wildcardedDate}' must match date regex ${dateRegex}`);
        }
        const year = parseInt(wildcardedDate.substring(0, 4));
        startDate = new Date(year.toString());
        endDate = new Date((year + 1).toString());
    } else if (splitDates.length === 2) {
        // START TO END
        startDate = parseDate("start_date", splitDates[0].trim());
        endDate = parseDate("end_date", splitDates[1].trim());

        if (startDate.getTime() > endDate.getTime()) {
            throw new Error(`'end_date' ${endDate} must not be before 'start_date' ${startDate}`);
        }

        // TODO: date isnt 31st Feb
    } else {
        throw new Error(`'${periodOfInterestString}' must match date regex ${dateRegex} or must be "<start_date> to <end_date>"`);
    }

    return [startDate, endDate, wildcardedDate];
};

const parseDate = (field, dateString) => {
    const timestamp = Date.parse(dateString);

    if (isNaN(timestamp)) throw new Error(`'${field}' is an invalid date format`);

    return new Date(timestamp);
};

const parseKeyTerms = (keyTermsString) => {
    if (!keyTermsString) return [];

    const keyTermsArray = keyTermsString.split(",");
    return keyTermsArray
        .map((word) => word.trim().toLowerCase()).filter((word) => word != "");
};

const parseLocation = (locationString) => (locationString.toLowerCase());

exports.parseQuery = parseQuery;
