class AbtractMethodError extends TypeError {
    constructor(what) {
        super(what + ' is abstract!');
    }
}
function abstract(what) {
    throw new AbtractMethodError(what);
}

class ArgumentError extends Error {
}
function required(what) {
    throw new ArgumentError(what + ' is required argument');
}

module.exports = {
    abstract,
    required
};
