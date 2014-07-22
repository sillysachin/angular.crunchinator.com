'use strict';

angular.module('crunchinatorApp.directives').directive('crAmchartsArea', ['$rootScope',
    function ($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                data: '=',
                chartTitle: '@',
                chartId: '@',
                extent: '@',
                selected: '@',
                format: '@',
                ranges: '@',
                filterProperty: '@',
                config: '='
            },
            templateUrl: 'views/amcharts.tpl.html',
            link: function (scope, element) {
                scope.selectedItems = scope.$parent.filterData[scope.selected].slice(0);
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');
                scope.format = scope.format || '%m/%Y';

                var chart;
                var formatDate = d3.time.format(scope.format);
                var parseDate = formatDate.parse;
                var full_extent = [parseDate(scope.extent), new Date()];
                var initial_extent = full_extent;

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
                            chart = new AmCharts.AmSerialChart();
                            chart.pathToImages = 'vendor/amcharts/images/';
                            chart.dataProvider = [];
                            chart.categoryField = 'parsed_date';
                            var categoryAxis = chart.categoryAxis;
                            categoryAxis.parseDates = true;
                            categoryAxis.minPeriod = 'mm';
                            chart.chartScrollbar = {};
                            var chartCursor = new AmCharts.ChartCursor();
                            chartCursor.categoryBalloonEnabled = true;
                            chartCursor.categoryBalloonDateFormat = 'JJ:NN, DD MMMM YYYY';
                            chartCursor.cursorAlpha = 1.0;
                            chartCursor.cursorPosition = 'mouse';
                            chartCursor.zoomable = true;
                            chart.addChartCursor(chartCursor);
                            var graph = new AmCharts.AmGraph();
                            graph.valueField = 'count';
                            graph.type = 'smoothedLine';
                            graph.fillAlphas = 0.8;
                            chart.addGraph(graph);

                            element.append('<div style="min-width: 310px; height: 350px; margin: 0 auto" id="' + scope.chartId + '"></div>');
                            chart.write(scope.chartId);

                            if (config.loading) {
                                chart.showLoading();
                            }

                            chart.addListener('clickGraphItem', onChartItemClick);
                            chart.addListener("zoomed", onChartZoom);
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

                function onChartZoom(event) {
                    var startIndex = event.startIndex;
                    var endIndex = event.startIndex;
                    var startDate = event.startDate;
                    var endDate = event.endDate;
                    var extent = [startDate, endDate];
                    if (!_.isEqual(extent, lastExtent)) {
                        if (!_.isEqual(extent, full_extent)) {
                            scope.selectedItems = [extent[0], extent[1]];
                        } else {
                            scope.selectedItems = [];
                        }

                        scope.$parent.$apply(function () {
                            scope.$parent.filterData[scope.selected] = scope.selectedItems;
                            $rootScope.$broadcast('filterAction');
                        });
                    }
                    lastExtent = extent;
                }

                var lastExtent = initial_extent;

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