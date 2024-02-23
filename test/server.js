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
		app.get('/basic/html', (req, res) =>
			res.send('<strong>Hello World</strong>')
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

	it('request with onConfig callback', ()=>
		new Promise((resolve, reject) =>
			faxios.post('/basic/200', {
				foo: 1,
				bar: 2,
				baz: 3,
			}, {
				onConfig(fUrl, fConfig) {
					resolve({fUrl, fConfig});
				},
			})
		)
			.then(({fUrl, fConfig}) => {
				expect(fUrl).to.be.equal('http://localhost:8181/basic/200');
				expect(fConfig).to.deep.equal({
					method: 'POST',
					headers: {
						"Content-Type": "application/json;charset=UTF-8",
					},
					body: "{\"foo\":1,\"bar\":2,\"baz\":3}",
				});
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

	it('HTML proxying', ()=>
		faxios.get('/basic/html')
			.then(({data, status, text}) => {
				expect(status).to.equal(200);
				expect(data).to.deep.equal('<strong>Hello World</strong>');
				expect(text).to.deep.equal('<strong>Hello World</strong>');
			})
	);

	it('should have the defaults object exposed', ()=> {
		expect(faxios.defaults).to.be.an('object');
		expect(faxios.defaults).to.have.property('baseURL');
		expect(faxios.defaults).to.have.nested.property('headers.common.Content-Type', 'application/json;charset=UTF-8');
	});

});
