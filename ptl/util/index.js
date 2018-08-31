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
