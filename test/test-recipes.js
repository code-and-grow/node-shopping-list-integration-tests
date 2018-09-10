const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

// testcases for Recipes endpoint
describe('Recipes', function(){
  // start server
  before(function (){
    return runServer();
  });
  // close server after finishing tests
  after(function (){
    return closeServer();
  });
  // test strategy:
  //   1. make request to `/recipes`
  //   2. inspect response object and prove has right code and have right keys in response object.
  it('should list recipes on GET', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });
  // test strategy:
  //   1. make POST request to `/recipes` and make new recipe item with sent data
  //   2. inspect response object and prove it has right keys and values in response object.
  it('should add item to recipes with POST', function() {
    const newRecipe = {
      name: 'Pasta carbonara', 
      ingredients: [
        'penne', 
        'bacon', 
        'eggs', 
        'grated hard cheese'
      ]
    };
    return chai
      .request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.name).to.equal(newRecipe.name);
        expect(res.body.ingredients).to.be.a('array');
        expect(res.body.ingredients).to.include.members(newRecipe.ingredients);
      });
  });

  // test strategy:
  //   1. make GET request to receive `/recipes`
  //   2. update first recipe on list with PUT request
  //   3. inspect response status and see if it returns 204
  it('should update item in recipes list with PUT', function() {
    const updateRecipe = {
      name: 'pancakes',
      ingredients: [
        'eggs',
        'milk',
        'pinch of salt',
        'sugar'
      ]
    };
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        updateRecipe.id = `${res.body[0].id}`;
        return chai
          .request(app)
          .put(`/recipes/${updateRecipe.id}`)
          .send(updateRecipe)
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  // test strategy:
  //   1. make DELETE request to delete item from `/recipes`
  //   2. inspect response status and see if it returns 204
  it('should delete item in recipes list with DELETE', function() {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        return chai
          .request(app)
          .delete(`/recipes/${res.body[0].id}`)
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});
