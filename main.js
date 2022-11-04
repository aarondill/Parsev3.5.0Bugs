/*global Parse*/
import codes from "./env.js";
let inited = false;
async function init(codes) {
	if (!Parse) throw Error("Parse is not included in the HTML");
	const [id, key, url] = codes;
	await Parse.initialize(id, key); /*app id, JS key*/
	Parse.serverURL = "https://parseapi.back4app.com/";
	Parse.liveQueryServerURL = "wss://" + url;
	inited = true;
}
async function addSubscription() {
	if (!inited) throw Error("Must initialize parse before using");

	const query = new Parse.Query("object");
	query.limit(1);
	try {
		const subscription = await query.subscribe();
		console.log("success");
		return subscription;
	} catch (e) {
		console.log("err");
		console.error(e);
		return e;
	}
}
async function firstObject() {
	if (!inited) throw Error("Must initialize parse before using");
	try {
		const Object = Parse.Object.extend("object");
		const query = new Parse.Query(Object);
		query.limit(1);
		const result = await query.first();
		return result;
	} catch (e) {
		console.error(e);
		return e;
	}
}
async function main() {
	await init(codes);
	const outFirst = await firstObject();
	document.querySelector("#firstout").innerText = outFirst;
	addSubscription();
	document.querySelector("#subout").innerText =
		"Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'socket')";
}
main();
