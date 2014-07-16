'use strict';

/**
 * Generate a random number based on a simple probability density function
 * between a range.
 *
 * @param {number} lower bound of the exponential distribution.
 * @param {number} upper bound of the exponential distribution.
 * @return {number} generated number
 */
var exp_dist = function(min, max) {
    var increment = (max - min) / 6;
    var num;
    do {
        var u = Math.random();
        var t = (-1 * Math.log(u))/1;
        num = min + (t * increment);
    }
    while(num <= min || num >= max);
    return num;
};

/**
 * Wraps function 'exp_dist' to round down the generated number to its nearest
 * integer.
 *
 * @param {number} lower bound of the exponential distribution.
 * @param {number} upper bound of the exponential distribution.
 * @return {number} generated, floored number
 */
var exponential_distribution = function(min, max) {
    return Math.floor(exp_dist(min, max));
};

/**
 * Create a random date between a given date range
 *
 * @param {date} lower bound of date range
 * @param {date} upper bound of date range
 * @return {date} a random date
 */
var randomDate = function(start, end) {
    return new Date(start.getTime() + (1 - exp_dist(0, 1)) * (end.getTime() - start.getTime()));
};

(function (ng, fk) {
    var injector = ng.injector(['configuration', 'ng']);
    var environment = injector.get('ENV');
    var api_version = injector.get('API_VERSION');

    /**
     * Generate a company object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned company.
     * @return {object} A company with randomly generated data values.
     */
    var randomCompany = function(id) {
        var name = fk.Company.companyName();
        id = id || 0;
        var statuses = ['alive', 'deadpooled', 'acquired', 'IPOed'];
        var states = fk.definitions.us_state_abbr;
        return {
            id: id,
            name: name,
            permalink: name.toLowerCase(),
            category_id: 0,
            total_funding: exponential_distribution(1, 6e9), //Random between 1 and 6 billion
            latitude: 1.0,
            longitude: 1.0,
            acquired_on: d3.time.format('%x')(randomDate(new Date(2006, 1, 1), new Date())), //Random date between two dates
            founded_on: d3.time.format('%x')(randomDate(new Date(1992, 1, 1), new Date())),
            investor_ids: [],
            most_recent_raised_amount: Math.floor(Math.random() * 1e8),
            status: statuses[exponential_distribution(0, statuses.length)],
            state_code: states[exponential_distribution(0, states.length)],
            ipo_on: d3.time.format('%x')(randomDate(new Date(1992, 1, 1), new Date())),
            ipo_valuation: exponential_distribution(3e6, 17e10),
            acquired_value: exponential_distribution(3e6, 17e10)
        };
    };

    /**
     * Generate an investor object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned investor.
     * @return {object} An investor with randomly generated data values.
     */
    var randomInvestor = function(id) {
        var type = Math.random() < 0.5 ? 'company' : 'person';
        var name = type === 'company' ? fk.Company.companyName() : fk.Name.findName();
        id = id || 0;
        return {
            id: id,
            name: name,
            investor_type: type,
            permalink: name.toLowerCase(),
            invested_company_ids: [],
            invested_category_ids: []
        };
    };

    /**
     * Generate a category object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned category.
     * @return {object} A category with randomly generated data values.
     */
    var randomCategory = function(id) {
        id = id || 0;
        var name = fk.random.bs_noun();
        return {
            id: id,
            name: name,
            permalink: name.toLowerCase(),
            display_name: name,
            company_ids: [],
            investor_ids: []
        };
    };

    /**
     * Generates a FundingRound with random attributes.
     *
     * @param {number} an ID for the generated FundingRound.
     * @return {object} FundingRound with randomly generated property values.
     */
    var randomFundingRound = function(id) {
        id = id || 0;
        return {
            id: id,
            company_id: 0,
            round_code: 'Unattributed',
            raised_amount: Math.floor(Math.random() * 1e8),
            funded_on: d3.time.format('%x')(randomDate(new Date(2000, 1, 1), new Date())),
            investor_ids: []
        };
    };

    /**
     * Generate a list of data based on a supplied function
     *
     * @param {number} [count] How many items should be returned in the data list
     * @param {function} [genFn] A function that when called returns an instance of a single item in the list
     * @return {array} A list of data generated from the supplied function
     */
    var generateDataList = function(count, genFn) {
        var generated = [];
        for(var i = 0; i < count; i++){
            generated.push(genFn(i));
        }
        return generated;
    };

    /**
     * Link a generated list of data together
     *
     * @param {array} [companies] An unlinked list of companies
     * @param {array} [investors] An unlinked list of investors
     * @param {array} [categories] An unlinked list of categories
     */
    var linkGeneratedLists = function(companies, investors, categories, rounds) {
        _.each(companies, function(company){
            var category = categories[exponential_distribution(0, categories.length)];
            company.category_id = category.id;
            category.company_ids.push(company.id);

            _(exponential_distribution(1, 10)).times(function(){
                var investor = investors[exponential_distribution(0, investors.length)];
                company.investor_ids.push(investor.id);
                category.investor_ids.push(investor.id);
                investor.invested_company_ids.push(company.id);
                investor.invested_category_ids.push(company.category_id);
            });
        });

        _.each(rounds, function(round){
            var company = companies[Math.floor(Math.random() * companies.length)];
            round.investor_ids = company.investor_ids;
            round.company_id = company.id;
        });
    };

    /**
     * Initiate and respond with fake backend data instead of querying an actual API
     */
    var setupStubbedBackend = function() {
        var categories = generateDataList(10, randomCategory);
        var investors = generateDataList(2500, randomInvestor);
        var companies = generateDataList(4000, randomCompany);
        var rounds = generateDataList(7500, randomFundingRound);
        linkGeneratedLists(companies, investors, categories, rounds);

        ng.module('crunchinatorApp')
        .config(['$provide', function($provide) {
            $provide.decorator('$httpBackend', ng.mock.e2e.$httpBackendDecorator);
        }]).run(['$httpBackend', function($httpBackend) {
            $httpBackend.when('GET', '/companies.json').respond({ companies: companies });
            $httpBackend.when('GET', '/categories.json').respond({ categories: categories });
            $httpBackend.when('GET', '/investors.json').respond({investors: investors });
            $httpBackend.when('GET', '/funding_rounds.json').respond({funding_rounds: rounds });
            $httpBackend.when('GET', /.*/).passThrough();
            $httpBackend.when('POST', /.*/).passThrough();
            $httpBackend.when('DELETE', /.*/).passThrough();
            $httpBackend.when('PUT', /.*/).passThrough();
        }]);
    };

    var base_url = '';
    switch (environment) {
    case 'development':
        setupStubbedBackend();
        break;
    case 'staging':
        base_url = 'http://staging.crunchinator.com/api/' + api_version;
        break;
    case 'production':
        base_url = 'http://crunchinator.com/api/' + api_version;
        break;
    }

    ng.module('crunchinatorApp.models').constant('API_BASE_URL', base_url);
})(angular, window.Faker);
