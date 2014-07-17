'use strict';

angular.module('crunchinatorApp.directives').directive('crAmchartsColumn', ['$rootScope',
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
                            chart.dataProvider = [];
                            chart.categoryField = 'label';
                            chart.depth3D = 10;
                            chart.angle = 25;
                            chart.startDuration = 2;
                            var chartCursor = new AmCharts.ChartCursor();
                            chartCursor.categoryBalloonEnabled = false;
                            chartCursor.cursorAlpha = .0;
                            chartCursor.zoomable = false;
                            var graph = new AmCharts.AmGraph();
                            graph.valueField = 'count';
                            graph.type = 'column';
                            graph.fillAlphas = 1;
                            graph.lineAlphas = 0.1;
                            graph.colorField = 'color';
                            graph.balloonText = '[[category]]: <b>[[value]]</b>';

                            chart.addGraph(graph);

                            element.append('<div style="min-width: 310px; height: 350px; margin: 0 auto" id="' + scope.chartId + '"></div>');
                            chart.write(scope.chartId);

                            if (config.loading) {
                                chart.showLoading();
                            }
                        };
                        initChart();
                        scope.render(data);
                    } else {
                        return scope.render(data);
                    }
                }, true);

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