const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Blog API', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it('should list items on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('should add an item on POST', function() {
    const newItem = {title: 'foo', content: 'bar', author: 'foo bar', publishDate: 2018};
    return chai.request(app)
      .post('/blog-posts')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  it('should update items on PUT', function() {
    const updateData = {
      title: 'fizz',
      content: 'buzz',
      author: 'fizz buzz',
      publishDate: 1918
    };

    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  it('should delete items on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});