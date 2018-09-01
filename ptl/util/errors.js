class PtlError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.code = code;
    }
}

class AbtractMethodError extends TypeError {
    constructor(what) {
        super(what + ' is abstract!');
    }
}
function abstract(what) {
    throw new AbtractMethodError(what);
}

class ArgumentError extends PtlError {
}
function required(what) {
    throw new ArgumentError(what + ' is required argument');
}

class IllegalAccessError extends PtlError {
}


module.exports = {
    abstract,
    required,

    PtlError,
    IllegalAccessError
};
