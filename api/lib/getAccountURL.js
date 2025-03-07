'package net.fimastgd.forevercore.api.lib.getAccountURL';

const url = require('url');

// по-моему, оно больше не нужно, нет? 

const getAccountURL = async (req) => {
    return new Promise((resolve) => {
        const protocol = (req.secure || req.headers['x-forwarded-proto'] === 'https') ? 'https' : 'http';
        resolve(protocol);
    });
};
module.exports = getAccountURL;
