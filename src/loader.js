import * as main from "./main.js";
let presets = [];

window.onload = () => {
	// 1 - do preload here - load fonts, images, additional sounds, etc...
	loadJsonFetch("data/presets.json",dataLoaded);
}

const loadJsonFetch = (url,callback) => {
	fetch(url)
		.then(response => {
			// If the response is successful, return the JSON
			if (response.ok) {
				return response.json();
			}

			// else throw an error that will be caught below
			return response.text().then(text =>{
				throw text;
			});
		}) // send the response.json() promise to the next .then()
		.then(json => { // the second promise is resolved, and `json` is a JSON object
			callback(json);
		}).catch(error => {
			// error
			console.log(error);
	});
};

const dataLoaded = json => {
	presets = json.presets || ["No 'presets' found"];
	// 2 - start up app
	main.init(presets);
};