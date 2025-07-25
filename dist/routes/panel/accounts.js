'package net.fimastgd.forevercore.routes.panel.accounts';
const express = require('express');
const cookieParser = require("cookie-parser");
const router = express.Router();
const { settings } = require("../../serverconf/settings");
const { captcha } = require("../../serverconf/captcha");
const Panel = require("../../panel/main").default;
const changeUsername = require("../../panel/accounts/changeUsername").default;
const changePassword = require("../../panel/accounts/changePassword").default;
const deleteAccount = require("../../panel/accounts/deleteAccount").default;
//import fetch from 'node-fetch';
const axios = require('axios');
const ConsoleApi = require("../../modules/console-api").default;
router.use(cookieParser());
router.get('/:route', async (req, res) => {
    const ROUTE = req.params.route;
    // LOGIN
    if (ROUTE == "login") {
        ConsoleApi.Log("Query thread", `Handled new session '/panel/accounts/login', opened by anonym`);
        let username;
        if (req.cookies.username) {
            username = req.cookies.username;
        }
        else {
            username = "null";
        }
        const data = { GDPS: settings.serverName, username: username, GDPSID: settings.GDPSID };
        ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/login'`);
        res.render('panel/accounts/login', data);
        return;
        // EXIT
    }
    else if (ROUTE == "exit") {
        ConsoleApi.Log("Query thread", `Handled new session '/panel/accounts/exit', opened by ${req.cookies.username ? req.cookies.username : "anonym"}`);
        res.clearCookie('username');
        res.send("1");
        return;
        // CHANGE USERNAME
    }
    else if (ROUTE == "changeUsername") {
        if (!req.cookies.username) {
            if (settings.GDPSID != "") {
                res.redirect(`${settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        ConsoleApi.Log("Query thread", `Handled new session '/panel/accounts/changeUsername', opened by ${req.cookies.username}`);
        const data = { GDPS: settings.serverName, username: req.cookies.username, GDPSID: settings.GDPSID };
        ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/changeUsername'`);
        res.render('panel/accounts/changeUsername', data);
        return;
    }
    else if (ROUTE == "changePassword") {
        if (!req.cookies.username) {
            if (settings.GDPSID != "") {
                res.redirect(`${settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        ConsoleApi.Log("Query thread", `Handled new session '/panel/accounts/changePassword', opened by ${req.cookies.username}`);
        const accid = await Panel.account("getID", req.cookies.username);
        const data = { GDPS: settings.serverName, username: req.cookies.username, accountID: accid, GDPSID: settings.GDPSID };
        ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/changePassword'`);
        res.render('panel/accounts/changePassword', data);
        return;
    }
    else if (ROUTE == "delete") {
        if (!req.cookies.username) {
            if (settings.GDPSID != "") {
                res.redirect(`${settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        ConsoleApi.Log("Query thread", `Handled new session '/panel/accounts/delete', opened by ${req.cookies.username}`);
        const accid = await Panel.account("getID", req.cookies.username);
        const data = { GDPS: settings.serverName, username: req.cookies.username, accountID: accid, captchaKey: captcha.key, GDPSID: settings.GDPSID };
        ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/delete'`);
        res.render('panel/accounts/delete', data);
        return;
    }
    else {
        res.render('errors/404');
        return;
    }
});
// POST
router.post('/login', async (req, res) => {
    if (!req.body.username || !req.body.password)
        res.status(200).send("-1");
    const isValid = await Panel.isValidUsrname(req.body.username, req.body.password, req);
    let output;
    //console.log(isValid);
    if (isValid == 1 || isValid == -2) {
        res.cookie('username', req.body.username, { maxAge: 7 * 24 * 60 * 60 * 1000 });
        Panel.account("activate", req.body.username);
        output = "1";
    }
    else {
        output = "-1";
    }
    res.status(200).send(output);
    return;
});
router.post('/exit', async (req, res) => {
    res.clearCookie("username");
    res.status(200).send("1");
    return;
});
router.post('/changeUsername', async (req, res) => {
    const result = await changeUsername(req.body.newusr, req.cookies.username);
    res.status(200).send(result);
    return;
});
router.post('/changePassword', async (req, res) => {
    const result = await changePassword(req);
    res.status(200).send(result);
    return;
});
router.post('/delete', async (req, res) => {
    const hCaptchaSecret = captcha.secret;
    const hCaptchaResponse = req.body.captchaResponse;
    // console.log("Captcha Response:", hCaptchaResponse);
    const data = new URLSearchParams({
        'secret': hCaptchaSecret,
        'response': hCaptchaResponse
    });
    try {
        const response = await axios.post('https://hcaptcha.com/siteverify', data);
        const responseData = response.data;
        const resp = responseData.success;
        let result;
        if (resp === true) {
            result = "1";
        }
        else {
            result = "-1";
        }
        if (result == "-1") {
            res.status(200).send("-2");
            return;
        }
        const accountID = req.body.accountID;
        const deleteAcc = await deleteAccount(accountID);
        if (deleteAcc == "1") {
            res.status(200).send("1");
            return;
        }
        else {
            res.status(200).send("-1");
            return;
        }
    }
    catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.routes.panel.accounts`);
        res.status(500).send("-1");
        return;
    }
});
module.exports = router;
