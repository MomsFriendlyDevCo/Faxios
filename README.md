@MomsFriendlyDevCo/Faxios
=========================
Tiny utility wrapper to add Axios functionality to Fetch.

* *Automatic JSON decoding* - No more silly 'await request.json()` calls
* *Single object requests* - Throw around single AxiosRequest objects instead of the URL + config (except the URL query bits of course) stuff that Fetch insists you do
* *Less foot-guns* - URL query strings are automatically handled by the `params` options structure
* *Multipart data encoding* - Simply pass `{dataType: 'formData'}` to wrap all data inside `new FormData()` structures instead of standard JSON encoding
* *Simple default injection* - As with Axios, its simple to extend the `defaults` object to include common headers or data entities that should always be used
* *Error detection + warning (dev mode only)* - Faxios will yell at you nicely if you try to use a feature that you should probably use a full library for like parameter serialization, proxies or agent overrides


```javascript
import faxios from '@momsfriendlydevco/faxios';

// Simple posting
let {data} = await faxios.post('https://somewebsite.com/api/something', {
    foo: 1,
    bar: 2,
    baz: 3,
})


// Single object AxiosRequest parity
let {data} = await faxios({
    method: 'PUT',
    url: 'https://somewebsite.com/api/something',
    auth: { // Handle Base64 basic auth natively
        username: 'api',
        password: 'mega-secure-api-token',
    },
    dataType: 'formData', // Encode data with `new FormData()` rather than `JSON.stringify()`
    data: {
        foo: 1,
        bar: 2,
        baz: 3,
    },
})
```
