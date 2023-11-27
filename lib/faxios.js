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

	// Compose URL
	let url = new URL(config.url, config.baseURL || defaults.baseURL || undefined);

	if (config.params) { // Append `params` (URL.searchParams) if provided
		Object.entries(config.params)
			.forEach(([key, val]) => url.searchParams.append(key, val));
	}

	// Compose output
	return [
		url.toString().replace(/\/$/, ''),
		{
			method: config.method || 'GET',
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
}


/**
* Run a fetch request + decode JSON output all in one cal
* @param {AxiosRequest} An axios-like request to make
* @returns {Promise<AxiosResponse>} An eventual response
*/
export default function faxios(config = {}) {
	return fetch(...getFetchRequest(config))
		.then(faxiosResponse => faxiosResponse.json())
}
