'package net.fimastgd.forevercore.loop';

import ConsoleApi from './modules/console-api';
import ColorSide from 'colorside';
const cs = new ColorSide("ru");
cs.use(cs.console);

import express from 'express';
const app = express();
app.listen(3000, () => console.log("Сервер запущен (PM2 видит процесс)"));

//namespace ForeverCore {
	for (let i: number = 0; i < 5000; i++) {
		console.log("a")
		cs.console.sleepSync(1000);
	}
//}
