const expect = require('chai').expect;
const specHelper = require('../spec_helper');
const Contact = require('../../models/contact');

const supertestAgent = specHelper.supertestAgent;
const contacts = [
	{"firstName": "Arun", "lastName": "S", "phoneNumber": "9876767676", "email": "arun@gmail.com", "address": "Taramani, Chennai"},
	{"firstName": "Krishna", "lastName": "S", "phoneNumber": "9876767123", "email": "krihna@gmail.com", "address": "Chennai"}
];
var contactIds = [];

before(done => {
	Contact.destroy({truncate: true})
	.then(() => {
			Contact.bulkCreate(contacts)
			.then(() => {
				return Contact.findAll();
			}).then(createdContacts => {
				contactIds = createdContacts.map(contact => contact.id);
				done();
			})
			.catch(err => {
				done(err);
			});
	}).catch(err => {
		done(err);
	});
});

describe('GET /contacts', () => {
	it('should return all contacts', done => {
		supertestAgent
		.get('/contacts')
		.expect('Content-Type', /json/)
		.expect(200)
		.then(response => {
			const actualContacts = response.body;

			expect(actualContacts.length).to.equal(2);
			expect(actualContacts[0]).to.include(contacts[0]);
			expect(actualContacts[1]).to.include(contacts[1]);
			done();
		})
		.catch(err => {
			done(err);
		});
	});
});

describe('GET /contacts/:id', () => {
	it('should return contact by id', done => {
		const id = contactIds[0];

		supertestAgent
		.get(`/contacts/${id}`)
		.expect('Content-Type', /json/)
		.expect(200)
		.then(response => {
			const actualContact = response.body;

			expect(actualContact.id).to.equal(id);
			expect(actualContact).to.include(contacts[0]);
			done();
		})
		.catch(err => {
			done(err);
		});
	});
});

describe('PUT /contacts', () => {
	it('should create a contact', done => {
		const contact = {
			"firstName": "Viky", "lastName": "C", "phoneNumber": "9876767676", "email": "viky@gmail.com", "address": "Chennai"
		};

		supertestAgent
		.put('/contacts')
		.send(contact)
		.expect('Content-Type', /json/)
		.expect(200)
		.then(response => {
			const actualContact = response.body;

			expect(actualContact).to.include(contact);
			done();
		})
		.catch(err => {
			done(err);
		});
	});

	it('should respond with error when any field is empty', done => {
		const contact = {
			"firstName": "", "lastName": "C", "phoneNumber": "9876767676", "email": "viky@gmail.com", "address": "Chennai"
		};

		supertestAgent
		.put('/contacts')
		.send(contact)
		.expect('Content-Type', /json/)
		.expect(500)
		.then(response => {
			const error = response.body;

			expect(error.message).to.equal('Validation error: Validation notEmpty on firstName failed');
			done();
		})
		.catch(err => {
			done(err);
		});
	});
});