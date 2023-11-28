export let defaults = {
	baseURL: null,
	headers: {
		common: {
			'Content-Type': 'application/json;charset=UTF-8',
		},
	},
	dataType: 'json',
	data: null,
};

/**
* Map an Axios-like request object to fetch components
*
* @param {AxiosRequest} config The Axios request object to map
* @param {'json'|'formData'} [config.dataType='json'] Data type encoding to use when sending the request
*
* @returns {Array} An fetch comptible array of parameters to feed into `fetch()`
* @property {String} 0 The URL to request
* @property {Object} 1 The Fetch compatible request object
*
* @example Convert an Axios request object into a Fetch request
* fetch(...getFetchRequest({
*   url: 'https://somewhere.com',
*   method: 'POST',
*   data: {
*     foo: '123',
*   },
* })),
*/
export function getFetchRequest(config) {
	// Extra non-production checks {{{
	if (process.env.NODE_ENV != 'production') {
		['transformRequest', 'transformResponse', 'paramsSerializer', 'timeout', 'withCredentials', 'adapter', 'responseType', 'responseEncoding', 'xsrfCookieName', 'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength', 'maxBodyLength', 'validateStatus', 'maxRedirects', 'socketPath', 'httpAgent', 'httpsAgent', 'proxy', 'cancelToken', 'decompress']
			.forEach(key => {
				if (key in config) {
					throw new Error(`Faxios doesn't support the "${key}" config parameter`);
				}
			})
	}
	// }}}
	// Sanity checks {{{
	if (!config.url) throw new Error('Missing config field: `url`');
	// }}}

	// Compose URL
	let url = new URL(config.url, config.baseURL || defaults.baseURL || undefined);

	if (config.params) { // Append `params` (URL.searchParams) if provided
		Object.entries(config.params)
			.forEach(([key, val]) => url.searchParams.append(key, val));
	}

	// Compose output
	let faxiosRequest = [
		url.toString(),
		{
			method: config.method
				? config.method.toUpperCase()
				: 'GET',
			headers: {
				...defaults.headers.common,
				...defaults.headers[config.method ? config.method.toLowerCase() : 'get'],
				...config.headers,
				...(config.auth && {
					'Authorization': 'Basic ' + btoa(`${config.auth.username}:${config.auth.password}`),
				})
			},
			...((defaults.data || config.data) && {
				body: (()=> {
					let dataType = defaults.dataType || config.dataType;
					let data = {...defaults.data, ...config.data};
					switch (dataType) {
						case 'json':
							return JSON.stringify(data);
						case 'formData': // Encode in a FormData object
							var body = new FormData();
							Object.entries(data)
								.forEach(([key, val]) => body.append(key, val))
							return body;
						default:
							throw new Error(`Unknown dataType "${dataType}"`);
					}
				})()
			}),
		},
	];
	return faxiosRequest;
}


/**
* Run a fetch request + decode JSON output all in one call
*
* @param {AxiosRequest} An axios-like request to make
*
* @returns {Promise<AxiosResponse>} An eventual response
*/
export default function faxios(config) {
	return fetch(...getFetchRequest(config))
		// Collapse headers into something usable {{{
		.then(fetchResponse => {
			let headers = Object.fromEntries(fetchResponse.headers);
			let simpleType = (headers['content-type'] || 'text/plain')
				.replace(/^([a-z\-\/]+).*$/, '$1'); // Scrap everything after the mime so we can at least read it

			return {fetchResponse, headers, simpleType};
		})
		// }}}
		// Decode data payload if needed {{{
		.then(async ({fetchResponse, headers, simpleType}) => {
			let data;

			switch (simpleType) {
				case 'application/json':
					data = await fetchResponse.json();
					break;
				case 'text/plain':
					data = await fetchResponse.text();
					break;
				default:
					data = {};
			}

			return {fetchResponse, data, headers};
		})
		// }}}
		// Mangle the response back into an AxiosResponse like object {{{
		.then(({fetchResponse, data, headers}) => ({
			config,
			response: fetchResponse,
			headers,
			data,
			status: fetchResponse.status,
			text: fetchResponse.statusText,
		}))
}

// Glue all utility methods onto the `faxios` default export {{{
// This block creates faxios.get(url, config) and other simple getters
// METHOD + config glue
['request', 'get', 'delete', 'head', 'options']
	.forEach(method => faxios[method] = (url, config) =>
		faxios({
			method,
			url,
			...config,
		})
	);

// METHOD + payload + config glue
// This block creates faxios.post(url, data, config) and other simple posters
['post', 'put', 'patch']
	.forEach(method => faxios[method] = (url, data, config) =>
		faxios({
			method,
			url,
			data,
			...config,
		})
	);
// }}}
