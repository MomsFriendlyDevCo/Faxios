import bodyParser from 'body-parser';
import {expect} from 'chai';
import faxios, {defaults} from '#lib/faxios';
import express from 'express';

let port = 8181;
let url = 'http://localhost:' + port;

describe('Server comms', ()=> {

	let server;
	before('setup a server', function(finish) {
		let app = express();
		app.use(bodyParser.json());

		app.get('/basic/200', (req, res) =>
			res.sendStatus(200)
		);
		app.get('/basic/json', (req, res) =>
			res.send({
				foo: 1,
				bar: 'bar!',
				baz: [1, null, '3'],
			})
		);

		server = app.listen(port, null, finish);
	});
	before('set faxios baseURL', ()=> defaults.baseURL = url);

	after(()=> server && server.close());

	it('basic requests', ()=>
		faxios.get('/basic/200')
			.then(({data, status}) => {
				expect(status).to.equal(200);
				expect(data).to.equal('OK');
			})
	);

	it('JSON responses', ()=>
		faxios.get('/basic/json')
			.then(({data, status}) => {
				expect(status).to.equal(200);
				expect(data).to.deep.equal({
					foo: 1,
					bar: 'bar!',
					baz: [1, null, '3'],
				});
			})
	);

});
