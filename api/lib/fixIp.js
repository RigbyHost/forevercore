'package net.fimastgd.forevercore.api.lib.fixIp';

class FixIp {
    static getIP(req) {
        if (!req || !req.headers) {
            return `ERROR WITH IP() HEADERS!!!`;
        }
        const forwarded = req.headers["x-forwarded-for"];
       // console.log(forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress);
        return forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress;
    }
}

module.exports = FixIp;