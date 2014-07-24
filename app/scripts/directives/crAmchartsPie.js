'use strict';

angular.module('crunchinatorApp.directives').directive('crAmchartsPie', ['$rootScope',
    function ($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                data: '=',
                chartTitle: '@',
                chartId: '@',
                selected: '@',
                filterProperty: '@',
                config: '='
            },
            templateUrl: 'views/amcharts.tpl.html',
            link: function (scope, element) {
                scope.selectedItems = scope.$parent.filterData[scope.selected].slice(0);
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var chart;

                window.onresize = function () {
                    scope.$apply();
                    $rootScope.$broadcast('filterAction');
                };

                scope.$parent.$watch('filterData.' + scope.filterProperty, function (newval) {

                });

                scope.$watch('data', function (data) {
                    if (!chart && ( data && data.length > 0)) {
                        var initChart = function () {
                            var config = scope.config || {};
                            chart = new AmCharts.AmPieChart(AmCharts.themes.light);
                            chart.dataProvider = [];
                            chart.valueField = 'count';
                            chart.titleField = 'label';
                            chart.labelRadius = 5;
                            chart.radius = '42%';
                            chart.innerRadius = '60%';
                            chart.depth3D = 10;
                            chart.angle = 15;

                            element.append('<div style="min-width: 310px; height: 325px; margin: 0 auto" id="' + scope.chartId + '"></div>');
                            chart.write(scope.chartId);

                            if (config.loading) {
                                chart.showLoading();
                            }

                            chart.addListener('clickSlice', onChartItemClick);

                        };
                        initChart();
                        scope.render(data);
                    } else {
                        return scope.render(data);
                    }
                }, true);

                function onChartItemClick(event) {
                    var label = event.dataItem.dataContext.label;
                    scope.$parent.$apply(function () {
                        if (!_.contains(scope.selectedItems, label)) {
                            scope.selectedItems.push(label);
                        } else {
                            var index = scope.selectedItems.indexOf(label);
                            scope.selectedItems.splice(index, 1);
                        }
                        scope.$parent.filterData[scope.selected] = scope.selectedItems.slice(0);
                        $rootScope.$broadcast('filterAction');
                    });
                }

                scope.render = function (data) {
                    if (!data || data.length === 0) {
                        return;
                    }
                    chart.dataProvider = data;
                    chart.validateData();
                };
            }
        };
    }
]);