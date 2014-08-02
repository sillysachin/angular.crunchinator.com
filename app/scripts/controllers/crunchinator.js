'use strict';

angular.module('crunchinatorApp.controllers')
    .controller('CrunchinatorCtrl', [
        '$scope', '$rootScope', '$location', '$q', 'Company', 'Category',
        'Investor', 'FundingRound', 'ComponentData',
        function CrunchinatorCtrl($scope, $rootScope, $location, $q, Company, Category, Investor, FundingRound, ComponentData, ServiceUsage, Customer) {
            $scope.shouldScroll = false;

            ComponentData.updateDataSets();

            //Create the initial empty filter data for every filter
            $scope.filterData = {
                categoryIds: [],
                investorIds: [],
                companyIds: [],
                ranges: [],
                roundRanges: [],
                mostRecentRoundRanges: [],
                statuses: [],
                states: [],
                fundingActivity: [],
                acquiredDate: [],
                foundedDate: [],
                ipoValueRange: [],
                ipoDateRange: [],
                acquiredValueRange: [],
                roundCodes: [],
                ageGroups: []
            };

            $scope.selectedRanges = [];

            //Bind models to the scope, so we can use the calls in the views
            $scope.companies = Company;
            $scope.investors = Investor;
            $scope.categories = Category;
            $scope.fundingRounds = FundingRound;
            $scope.serviceUsages = ServiceUsage;
            $scope.customers = Customer;

            //Fetch the data for each model, then set up its dimensions and run its filters.
            var modelCount = 0;
            var models = [Company, Category, Investor, FundingRound];
            _.each(models, function (Model) {
                Model.fetch().then(function () {
                    modelCount++;
                    if (modelCount === models.length) {
                        var companiesById = _.indexBy(Company.all, 'id');
                        var categoriesById = _.indexBy(Category.all, 'id');
                        var investorsById = _.indexBy(Investor.all, 'id');

                        Investor.linkModels(companiesById, categoriesById);
                        Category.linkModels(companiesById, investorsById);
                        FundingRound.linkModels(companiesById, investorsById, categoriesById);

                        if ($location.search().filters) {
                            $scope.filterData = JSON.parse(decodeURIComponent($location.search().filters));
                            var toDate = function (dateString) {
                                return new Date(dateString);
                            };
                            $scope.filterData.fundingActivity = _.map($scope.filterData.fundingActivity, toDate);
                            $scope.filterData.ipoDateRange = _.map($scope.filterData.ipoDateRange, toDate);
                            $scope.filterData.foundedDate = _.map($scope.filterData.foundedDate, toDate);
                            $scope.filterData.acquiredDate = _.map($scope.filterData.acquiredDate, toDate);
                        }

                        _.each(models, function (Model) {
                            Model.setupDimensions();
                            Model.runFilters($scope.filterData);
                        });
                        ComponentData.updateDataSets();

                        $scope.initiated = true;
                        $rootScope.initiated = true;
                    }
                });
            });


            //Bind component data services to the scope, so we can use them in the views
            $scope.ComponentData = ComponentData;

            //All of our filters broadcast 'filterAction' when they've been operated on
            //When a filter receives input we set up filterData and run each model's filters
            //This should automatically update all the graph displays
            $scope.$on('filterAction', function () {
                var deferred = $q.defer();

                function applyFilters() {
                    _.delay(function () {
                        $scope.$apply(function () {
                            $location.search({filters: encodeURIComponent(JSON.stringify($scope.filterData))});
                            Company.runFilters($scope.filterData);
                            Category.runFilters($scope.filterData);
                            Investor.runFilters($scope.filterData);
                            FundingRound.runFilters($scope.filterData);
                            ComponentData.updateDataSets();

                            deferred.resolve('Finished filters');
                        });
                    }, 250);

                    return deferred.promise;
                }

                $scope.loading = true;

                applyFilters().then(function(){
                    $scope.loading = false;
                });
            });
        }
    ]);
