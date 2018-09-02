/**
 * @class General Projectile error
 * @property {Number} code Http code of error
 */
class PtlError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.code = code;
    }
}

/**
 * @class Represents error that occures when trying to call an abstract method
 */
class AbtractMethodError extends TypeError {
    constructor(what) {
        super(what + ' is abstract');
    }
}
/**
 * Throws AbstractMethodError
 * @param  {String} what Name of abstract method
 */
function abstract(what) {
    throw new AbtractMethodError(what);
}

/**
 * @class General argument error
 */
class ArgumentError extends PtlError {
}
/**
 * Throws new Argument error saying that argument is required
 * @param  {String} what Name of required argument
 * @example
 * function mul(x = required('x'), y = 1) { return x * y; }
 */
function required(what) {
    throw new ArgumentError(what + ' is required argument');
}

/**
 * @class Represents error that occures when attempting to get/set a variable that is not allowed to be got/set
 */
class IllegalAccessError extends PtlError {
}


module.exports = {
    abstract,
    required,

    PtlError,
    IllegalAccessError
};
