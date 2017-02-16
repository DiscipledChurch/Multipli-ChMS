import crypto = require('crypto');

import Config from '../../config';

export function encrypted(target: any, key: string) {
    // determine if running in app or under test
    let getType = {};
    let obj = (this.encrypted && getType.toString.call(this.encrypted) === '[object Function]') ? target : this;

    // property value
    let _val = obj[key];

    // property getter
    let getter = function () {
        // console.log(`Get: ${key} => ${_val}`);
        return _val;
    };

    // property setter
    let setter = function (newVal: any) {
        // console.log(`Set: ${key} => ${newVal}`);
        _val = encrypt(newVal);
    };

    // delete property and assign getter/setter
    if ((delete obj[key]) && (delete obj['_' + key])) {

        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });

        // Create a new 'pointer' property that, for UI, 
        // - decrypts when reading
        // - saves to main property when setting
        Object.defineProperty(target, '_' + key, {
            get: function () { return decrypt(_val); },
            set: setter,
            configurable: true
        });
    }

    // add key to tracked properties
    if (!obj.encryptedKeys) {
        obj.encryptedKeys = [];
    } else if (obj.encryptedKeys.indexOf(key) > -1) {
        return;
    }

    obj.encryptedKeys.push(key);
}


function encrypt(value: any) {
    let config = new Config();

    let cipher = crypto.createCipher(config.algorithm, config.secret);
    let crypted = cipher.update(value, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function decrypt(value: any) {
    let config = new Config();

    let decipher = crypto.createDecipher(config.algorithm, config.secret);
    let decrypted = decipher.update(value, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
