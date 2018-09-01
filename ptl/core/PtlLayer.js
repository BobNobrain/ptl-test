const PtlMethod = require('./PtlMethod');

// const tObj = typeof {};
// const tFun = typeof Function;

// function isPrimitive(v) {
//     const t = typeof v;
//     if (t === tObj) return v === null;
//     if (t === tFun) return false;
//     return true;
// }

class PtlLayer {
    constructor(name, description) {
        this.name = name;
        this.schema = description;

        for (let propertyName in description) {
            description[propertyName].name = propertyName;
        }

        let plainRef = null;
        this.plain = function () {
            if (plainRef === null) {
                plainRef = {};
                for (let propertyName in this.schema) {
                    // TODO: getters/setters
                    const property = this.schema[propertyName];
                    Object.defineProperty(plainRef, propertyName, {
                        enumerable: true,
                        get() {
                            console.log('get property');
                            console.log(property);
                            return property._value;
                        },
                        set(value) {
                            property._value = value;
                            return value;
                        }
                    });
                }
            }
            return plainRef;
        };

        console.log(JSON.stringify(this.plain()));
        console.log();
    }

    init() {}

    getProperty(path) {
        let _path = path.slice();
        let property = this;
        while (_path.length) {
            property = property.schema[_path.shift()];
            if (!property) {
                throw new ReferenceError(`Path "${path.join}" does not exist on ${this}`);
            }
        }
        return property;
    }

    call(context, path, args) {
        const property = this.getProperty(path);
        if (property instanceof PtlMethod) {
            return property.call(this.plain(), args, context);
        } else {
            return Promise.reject(new TypeError(`Cannot call "${path.join('.')}": not a function`));
        }
    }

    getName() {
        return this.name;
    }
    toString() {
        return `[PtlLayer "${this.name}"]`;
    }
}

module.exports = PtlLayer;
