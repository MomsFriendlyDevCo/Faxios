import {expect} from 'chai';
import {defaults, getFetchRequest} from '#lib/faxios';

describe('AxiosRequest translation', ()=> {

	it('translate basic config structures', ()=> {
		let data;

		expect(()=> getFetchRequest({})).to.throw;

		expect(getFetchRequest({
			url: 'https://google.com',
		})).to.deep.equal([
			'https://google.com',
			{
				method: 'GET',
				headers: defaults.headers.common,
			},
		]);

		expect(getFetchRequest({
			method: 'POST',
			url: 'https://google.com',
		})).to.deep.equal([
			'https://google.com',
			{
				method: 'POST',
				headers: defaults.headers.common,
			},
		]);

		data = {
			foo: 123,
			bar: 'bar!',
			baz: ['1', false, null, 3],
		};
		expect(getFetchRequest({
			method: 'POST',
			url: 'https://google.com',
			data,
			headers: {
				Authentication: 'Bearer abcdef',
			},
		})).to.deep.equal([
			'https://google.com',
			{
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					Authentication: 'Bearer abcdef',
					...defaults.headers.common,
				},
			},
		]);

	});

});
