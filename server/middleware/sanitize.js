module.exports = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = obj[key].replace(/[$<>]/g, "");
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);

    next();
};