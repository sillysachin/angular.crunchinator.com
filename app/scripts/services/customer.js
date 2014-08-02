'use strict';

angular.module('crunchinatorApp.models').service('Customer', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of Customer.
     *
     * @constructor
     * @this {Customer}
     */
    var Customer = function() {
        this.url = API_BASE_URL + '/customers.json';
    };

    Customer.prototype = Object.create(Model);

    Customer.prototype.constructor = Customer;

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @override
     * @param {object} [response] The response returned from the API
     * @return {array} A list of customers extracted from the response
     */
    Customer.prototype.parse = function(response) {
        return response.customers;
    };

    return new Customer();
});
