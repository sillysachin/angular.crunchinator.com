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
     * This links companies and investors to the round object so that when filtering
     * we have access to the other models it contians
     *
     * @param {object} companiesById An object/hash of all companies keyed by their IDs
     * @param {object} investorsById An object/hash of all categories keyed by their IDs
     */
    ServiceUsage.prototype.linkModels = function(companiesById, investorsById, categoriesById) {
        _.each(this.all, function(serviceUsage){
            //Add funding round to company
            var company = companiesById[serviceUsage.company_id];
            company.service_usages = company.service_usages || [];
            company.service_usages.push(serviceUsage);

            //Add company to funding round
            serviceUsage.company = company;

            //Add category to funding round
            serviceUsage.category = categoriesById[company.category_id];

            //Add funding round to category
            serviceUsage.category.service_usages = serviceUsage.category.service_usages || [];
            serviceUsage.category.service_usages.push(serviceUsage);

            serviceUsage.investors = [];
            _.each(serviceUsage.investor_ids, function(investorId){
                var investor = investorsById[investorId];
                investor.service_usages = investor.service_usages || [];
                if(investor) {
                    //Add investors to funding rounds
                    serviceUsage.investors.push(investor);

                    //Add funding rounds to investor
                    investor.service_usages.push(serviceUsage);
                }
            });
        });
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    ServiceUsage.prototype.setupDimensions = function() {
        var crossServiceUsages = crossfilter(this.all);
        var parse = this.format.parse;
        var self = this;

        this.dimensions = {
            byLocation: crossServiceUsages.dimension(function(round) { return round.location; }),
            byFundedOn: crossServiceUsages.dimension(function(round){
                return round.funded_on ? parse(round.funded_on) : null;
            }),
            byFundingAmount: crossServiceUsages.dimension(function(round){ return round.raised_amount; }),
            byRoundCode: crossServiceUsages.dimension(function(round){ return round.round_code; })
        };

        this.byName = crossServiceUsages.dimension(function(round) {
            return round.round_code;
        });

        var allFundingValues = _.pluck(this.all, 'raised_amount');
        this.maxFundingValue = parseInt(_.max(allFundingValues, function(n){ return parseInt(n); }));

        this.fundingSeries = _.unique(_.pluck(this.all, 'round_code'));
        this.roundHash = {};
        _.each(this.fundingSeries, function(roundCode){
            self.roundHash[roundCode] = {
                name: roundCode.length > 1 ? roundCode : 'Series ' + roundCode,
                id: roundCode
            };
        });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    ServiceUsage.prototype.dataSets = {
        dataForInvestments: ['byFundedOn'],
        dataForFundingAmount: ['byFundingAmount'],
        dataForRoundName: ['byRoundCode']
    };

    /**
     * A list of functions that filter on a single dimension
     * When building datasets every filter is applied to that dataset except what's in the exclusion list
     * Adding a new filter here will apply the filter to every dataset unless its excluded
     */
    ServiceUsage.prototype.filters = {
        byCompany: function() {
            var self = this;
            this.dimensions.byCompany.filter(function(company){
                return self.companyPassesFilters(company, self.filterData);
            });
        },
        byFundedOn: function() {
            var range = this.filterData.fundingActivity;
            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundedOn.filter(function(funded_on) {
                    funded_on = funded_on || new Date(1, 1, 1);
                    return self.fallsWithinRange(funded_on, range);
                });
            }
        },
        byFundingAmount: function() {
            var range = this.filterData.roundRanges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundingAmount.filter(function(funding) {
                    return self.fallsWithinRange(funding, range);
                });
            }
        },
        byRoundCode: function() {
            var codes = this.filterData.roundCodes;

            if (codes.length > 0) {
                this.dimensions.byRoundCode.filter(function(round_code) {
                    return (_.contains(codes, round_code));
                });
            }
        },
    };

    /**
     * Checks to see if a Company passes ServiceUsage specific filtering. Calls super-class method,
     * 'companyPassesFilters' to check general filters.
     *
     * @override
     * @param {object} a Company to check filters against.
     * @param {object} current filter parameters.
     * @returns {boolean} whether a Company passes the current filter state.
     */
    ServiceUsage.prototype.companyPassesFilters = function(company, fd){
        //Company's category is included in filters
        if(fd.categoryIds.length > 0 && !_.include(fd.categoryIds, company.category_id)) {
            return false;
        }

        //Company's id is included in filters
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, company.id)) {
            return false;
        }

        //Company includes filtered investor ids
        if(fd.investorIds.length > 0 && _.intersection(fd.investorIds, company.investor_ids).length < 1) {
            return false;
        }

        //Company passes all other filters
        if(!Model.companyPassesFilters(company, fd)) {
            return false;
        }

        return true;
    };


    return new ServiceUsage();
});
