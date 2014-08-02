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

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    ServiceUsage.prototype.setupDimensions = function() {
        var crossServiceUsage = crossfilter(this.all);
        var parse = this.format.parse;
        var self = this;

        this.dimensions = {
            byAgeGroup: crossServiceUsage.dimension(function(usage){ return usage.age_group; })
        };

        this.ageGroupTypes = _.unique(_.pluck(this.all, 'age_group'));
        this.ageGroupHash = {};
        _.each(this.ageGroupTypes, function(ageGroup){
            self.ageGroupHash[ageGroup] = {
                name: ageGroup ,
                id: ageGroup
            };
        });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    ServiceUsage.prototype.dataSets = {
        dataForAgeGroup: ['byAgeGroup']
    };

    /**
     * A list of functions that filter on a single dimension
     * When building datasets every filter is applied to that dataset except what's in the exclusion list
     * Adding a new filter here will apply the filter to every dataset unless its excluded
     */
    ServiceUsage.prototype.filters = {
        byAgeGroup: function() {
            var codes = this.filterData.ageGroups;

            if (codes.length > 0) {
                this.dimensions.byAgeGroup.filter(function(age_group) {
                    return (_.contains(codes, age_group));
                });
            }
        }
    };

    return new ServiceUsage();
});
