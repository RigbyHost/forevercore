`package net.fimastgd.forevercore.routes.panel.accounts`;

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

/* will be deleted in next minor
router.get("/:route", async (req, res) => {
	const ROUTE = req.params.route;
	const GDPSID = String(req.params.gdpsid); // { string }
	// LOGIN
	if (ROUTE == "login") {
		ConsoleApi.Log("Query thread", `Handled new session '/${GDPSID}/panel/accounts/login', opened by anonymousous`);
		let username;
		if (req.cookies[req.params.gdpsid.toString() + "-username"]) {
			username = req.cookies[req.params.gdpsid.toString() + "-username"];
		} else {
			username = "null";
		}
		const data = { GDPS: await getSettings(req.params.gdpsid.toString()).serverName, username: username, GDPSID: GDPSID };
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
		const data = {
			GDPS: await getSettings(req.params.gdpsid.toString()).serverName,
			username: req.cookies[req.params.gdpsid.toString() + "-username"],
			GDPSID: GDPSID
		};
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
			GDPS: await getSettings(req.params.gdpsid.toString()).serverName,
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
			GDPS: await getSettings(req.params.gdpsid.toString()).serverName,
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
*/

// POST /login
router.post("/login", async (req, res) => {
	const gdpsid = req.params.gdpsid.toString();
	const username = req.body.username || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/accounts/login by ${username}`);
	
	if (!req.body.username || !req.body.password) {
		res.status(200).json({
			status: "error",
			code: -1,
			server_status: 200,
			message: "Missing username or password"
		});
	}

	const isValid = await Panel.isValidUsrname(gdpsid, req.body.username, req.body.password, req);

	if (isValid == 1 || isValid == -2) {
		res.cookie(gdpsid + "-username", req.body.username, { maxAge: 7 * 24 * 60 * 60 * 1000 });
		Panel.account(gdpsid, "activate", req.body.username);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Login successful"
		});
	} else {
		res.status(200).json({
			status: "error",
			code: -1,
			server_status: 200,
			message: "Invalid credentials"
		});
	}
});

// POST /exit
router.post("/exit", async (req, res) => {
	const gdpsid = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/accounts/exit by ${username}`);
	
	res.clearCookie(gdpsid + "-username");

	res.status(200).json({
		status: "success",
		code: 1,
		server_status: 200,
		message: "Logged out successfully"
	});
});

// POST /changeUsername
router.post("/changeUsername", async (req, res) => {
	const gdpsid = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/accounts/changeUsername by ${username}`);
	
	const result = await changeUsername(gdpsid, req.body.newusr, username);

	const responses = {
		1: { status: "success", message: "Username changed successfully" },
		"-2": { status: "error", message: "Username is too long" },
		"-3": { status: "error", message: "Username is too short" },
		"-4": { status: "error", message: "System error during username change" },
		"-5": { status: "error", message: "Username is already taken" }
	};

	const response = responses[result] || { status: "error", message: "Unknown error" };

	res.status(200).json({
		status: response.status,
		code: parseInt(result),
		server_status: 200,
		message: response.message
	});
});

// POST /changePassword
router.post("/changePassword", async (req, res) => {
	const gdpsid = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/accounts/changePassword by ${username}`);
	
	const result = await changePassword(gdpsid, req);

	res.status(200).json({
		status: result === "1" ? "success" : "error",
		code: parseInt(result),
		server_status: 200,
		message: result === "1" ? "Password changed successfully" : "Password change failed"
	});
});

// POST /delete
router.post("/delete", async (req, res) => {
	const gdpsid = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/accounts/delete by ${username}`);
	
	const hCaptchaSecret = captcha.secret;
	const hCaptchaResponse = req.body.captchaResponse;
	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});

	try {
		const response = await axios.post("https://hcaptcha.com/siteverify", data);
		const responseData = response.data;

		if (!responseData.success) {
			res.status(200).json({
				status: "error",
				code: -2,
				server_status: 200,
				message: "Captcha verification failed"
			});
		}

		const accountID = req.body.accountID;
		const deleteAcc = await deleteAccount(gdpsid, accountID);

		if (deleteAcc == "1") {
			res.status(200).json({
				status: "success",
				code: 1,
				server_status: 200,
				message: "Account deleted successfully"
			});
		} else {
			res.status(200).json({
				status: "error",
				code: -1,
				server_status: 200,
				message: "Account deletion failed"
			});
		}
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* ${error} at net.fimastgd.forevercore.routes.panel.accounts`);

		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Internal server error"
		});
	}
});

module.exports = router;