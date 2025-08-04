"package net.fimastgd.forevercore.routes.panel.accounts";

const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router({ mergeParams: true });
const { getSettings } = require("../../serverconf/settings");
const { captcha } = require("../../serverconf/captcha");
const Panel = require("../../panel/main").default;
const changeUsername = require("../../panel/accounts/changeUsername").default;
const changePassword = require("../../panel/accounts/changePassword").default;
const deleteAccount = require("../../panel/accounts/deleteAccount").default;
const axios = require("axios");

const ConsoleApi = require("../../modules/console-api").default;

router.use(cookieParser());

router.get("/:route", async (req, res) => {
	const ROUTE = req.params.route;
	const GDPSID = String(req.params.gdpsid); /* string */
	// LOGIN
	if (ROUTE == "login") {
		ConsoleApi.Log("Query thread", `Handled new session '/${GDPSID}/panel/accounts/login', opened by anonymousous`);
		let username;
		if (req.cookies[req.params.gdpsid.toString() + "-username"]) {
			username = req.cookies[req.params.gdpsid.toString() + "-username"];
		} else {
			username = "null";
		}
		const data = { GDPS: getSettings(req.params.gdpsid.toString()).serverName, username: username, GDPSID: GDPSID };
		res.render("panel/accounts/login", data);
		return;

		// EXIT
	} else if (ROUTE == "exit") {
		ConsoleApi.Log(
			"Query thread",
			`Handled new session '/${GDPSID}/panel/accounts/exit', opened by ${
				req.cookies[req.params.gdpsid.toString() + "-username"] ? req.cookies[req.params.gdpsid.toString() + "-username"] : "anonymous"
			}`
		);
		res.clearCookie(req.params.gdpsid.toString() + "-username");
		res.send("1");
		return;

		// CHANGE USERNAME
	} else if (ROUTE == "changeUsername") {
		if (!req.cookies[req.params.gdpsid.toString() + "-username"]) {
			if (GDPSID != "") {
				res.redirect(`/${GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log(
			"Query thread",
			`Handled new session '/panel/accounts/changeUsername', opened by ${req.cookies[req.params.gdpsid.toString() + "-username"]}`
		);
		const data = { GDPS: getSettings(req.params.gdpsid.toString()).serverName, username: req.cookies[req.params.gdpsid.toString() + "-username"], GDPSID: GDPSID };
		ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/changeUsername'`);
		res.render("panel/accounts/changeUsername", data);
		return;
	} else if (ROUTE == "changePassword") {
		if (!req.cookies[req.params.gdpsid.toString() + "-username"]) {
			if (GDPSID != "") {
				res.redirect(`${GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log(
			"Query thread",
			`Handled new session '/panel/accounts/changePassword', opened by ${req.cookies[req.params.gdpsid.toString() + "-username"]}`
		);
		const accid = await Panel.account(req.params.gdpsid.toString(), "getID", req.cookies[req.params.gdpsid.toString() + "-username"]);
		const data = {
			GDPS: getSettings(req.params.gdpsid.toString()).serverName,
			username: req.cookies[req.params.gdpsid.toString() + "-username"],
			accountID: accid,
			GDPSID: GDPSID
		};
		ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/changePassword'`);
		res.render("panel/accounts/changePassword", data);
		return;
	} else if (ROUTE == "delete") {
		if (!req.cookies[req.params.gdpsid.toString() + "-username"]) {
			if (GDPSID != "") {
				res.redirect(`${GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log(
			"Query thread",
			`Handled new session '/panel/accounts/delete', opened by ${req.cookies[req.params.gdpsid.toString() + "-username"]}`
		);
		const accid = await Panel.account(req.params.gdpsid.toString(), "getID", req.cookies[req.params.gdpsid.toString() + "-username"]);
		const data = {
			GDPS: getSettings(req.params.gdpsid.toString()).serverName,
			username: req.cookies[req.params.gdpsid.toString() + "-username"],
			accountID: accid,
			captchaKey: captcha.key,
			GDPSID: GDPSID
		};
		ConsoleApi.Log("Render thread", `Rendered page '/panel/accounts/delete'`);
		res.render("panel/accounts/delete", data);
		return;
	} else {
		res.render("errors/404");
		return;
	}
});

// POST
router.post("/login", async (req, res) => {
	if (!req.body.username || !req.body.password) res.status(200).send("-1");
	const isValid = await Panel.isValidUsrname(req.params.gdpsid.toString(), req.body.username, req.body.password, req);
	let output;
	//console.log(isValid);
	if (isValid == 1 || isValid == -2) {
		res.cookie(req.params.gdpsid.toString() + "-username", req.body.username, { maxAge: 7 * 24 * 60 * 60 * 1000 });
		Panel.account(req.params.gdpsid.toString(), "activate", req.body.username);
		output = "1";
	} else {
		output = "-1";
	}
	res.status(200).send(output);
	return;
});
router.post("/exit", async (req, res) => {
	res.clearCookie(req.params.gdpsid.toString() + "-username");
	res.status(200).send("1");
	return;
});
router.post("/changeUsername", async (req, res) => {
	// "1" если успешно, "-2" если имя слишком длинное, "-3" если имя слишком короткое, "-4" при системной ошибке, "-5" если имя уже занято 
	const result = await changeUsername(req.params.gdpsid.toString(), req.body.newusr, req.cookies[req.params.gdpsid.toString() + "-username"]);
	res.status(200).send(result);
	return;
});
router.post("/changePassword", async (req, res) => {
	// "1" / "-1"
	const result = await changePassword(req.params.gdpsid.toString(), req);
	res.status(200).send(result);
	return;
});
router.post("/delete", async (req, res) => {
	const hCaptchaSecret = captcha.secret;
	const hCaptchaResponse = req.body.captchaResponse;
	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});

	try {
		const response = await axios.post("https://hcaptcha.com/siteverify", data);
		const responseData = response.data;
		const resp = responseData.success;
		let result;
		if (resp === true) {
			result = "1";
		} else {
			result = "-1";
		}
		if (result == "-1") {
			res.status(200).send("-2");
			return;
		}
		const accountID = req.body.accountID;
		// "1" / "-1"
		const deleteAcc = await deleteAccount(req.params.gdpsid.toString(), accountID);
		if (deleteAcc == "1") {
			res.status(200).send("1");
			return;
		} else {
			res.status(200).send("-1");
			return;
		}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.routes.panel.accounts`);
		res.status(500).send("-1");
		return;
	}
});

module.exports = router;
