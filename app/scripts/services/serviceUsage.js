'use strict';

angular.module('crunchinatorApp.models').service('ServiceUsage', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of ServiceUsage.
     *
     * @constructor
     * @this {ServiceUsage}
     */
    var ServiceUsage = function() {
        this.url = API_BASE_URL + '/service_usages.json';
    };

    ServiceUsage.prototype = Object.create(Model);

    ServiceUsage.prototype.constructor = ServiceUsage;

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @override
     * @param {object} response The response returned from the API
     * @return {array} A list of ServiceUsages extracted from the response
     */
    ServiceUsage.prototype.parse = function(response) {
        return response.service_usages;
    };

    return new ServiceUsage();
});
