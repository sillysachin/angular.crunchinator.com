'use strict';

angular.module('crunchinatorApp.directives').directive('crAmchartsPie', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                data: '=',
                chartTitle: '@',
                selected: '@',
                filterProperty: '@',
                config: '='
            },
            templateUrl: 'views/amcharts.tpl.html',
            link: function(scope, element) {
                scope.selectedItems = scope.$parent.filterData[scope.selected].slice(0);
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var width = element[0].clientWidth;
                var height = parent.height() - 70;
                var radius = (Math.min(width, height) / 2) - 20;
                var color = function(slice){
                    return {
                        deadpooled: '#caeafc',
                        acquired: '#36b0f1',
                        IPOed: '#0096ed',
                        alive: '#8acff7'
                    }[slice];
                };
                var path, ticks, labels;

                var fill = function (d) {
                    if(scope.selectedItems.length === 0 || _.contains(scope.selectedItems, d.data.label)) {
                        return color(d.data.label);
                    } else {
                        return '#666';
                    }
                };

                window.onresize = function() {
                    scope.$apply();
                    $rootScope.$broadcast('filterAction');
                };

                var initial_load = true;
                scope.$parent.$watch('filterData.' + scope.filterProperty, function(newval) {

                });

                scope.$watch('data', function(data) {
                    if(!path && data.length > 0) {
                    } else {
                        return scope.render(data);
                    }
                }, true);

                scope.$watch('config', function (config) {
                    var chart = false;

                    var initChart = function () {
                        if (chart) chart.destroy();
                        var config = scope.config || {};
                        chart = new Highcharts.Chart(config);


                        if (config.loading) {
                            chart.showLoading();
                        }

                    };
                    initChart();
                });

                scope.render = function(data) {
                    if(!data || data.length === 0) { return; }
                };
            }
        };
    }
]);