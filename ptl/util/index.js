/**
 * Returns obj's type name
 * @param  {any}    obj Value that we want to get type name of
 * @return {String}     Name of obj's type
 */
function typename(obj) {
    if (obj === void 0) return null;
    if (obj === null) return null;
    const constructor = obj.constructor;
    if (constructor) {
        if (typeof constructor.name === typeof '') return constructor.name;
    }
    const s = Object.toString.call(obj);
    return s.substring(8, s.length - 1);
}

module.exports = {
    typename
};
