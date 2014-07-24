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
                            chart.pathToImages = 'vendor/amcharts/images/';
                            chart.dataProvider = [];
                            chart.categoryField = 'label';
                            chart.depth3D = 10;
                            chart.angle = 25;
                            chart.startDuration = 2;

                            var chartCursor = new AmCharts.ChartCursor();
                            chartCursor.categoryBalloonEnabled = true;
                            chartCursor.cursorAlpha = 0.0;
                            chartCursor.zoomable = true;
                            chart.addChartCursor(chartCursor);

                            var graph = new AmCharts.AmGraph();
                            graph.id = 'graph-' + scope.chartId;
                            graph.valueField = 'count';
                            graph.type = 'column';
                            graph.fillAlphas = 1;
                            graph.lineAlphas = 0.1;
                            graph.colorField = 'color';
                            graph.balloonText = '[[category]]: <b>[[value]]</b>';
                            chart.addGraph(graph);

                            var chartScrollbar = new AmCharts.ChartScrollbar();
                            chartScrollbar.graph = graph;
                            chartScrollbar.scrollbarHeight = 30;
                            chart.addChartScrollbar(chartScrollbar);

                            element.append('<div style="min-width: 310px; height: 325px; margin: 0 auto" id="' + scope.chartId + '"></div>');
                            chart.write(scope.chartId);

                            if (config.loading) {
                                chart.showLoading();
                            }

                            chart.addListener('clickGraphItem', onChartItemClick);
                        };
                        initChart();
                        scope.render(data);
                    } else {
                        return scope.render(data);
                    }
                }, true);

                function onChartItemClick(event) {
                    var label = event.item.dataContext.label;
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
//                    var colors = ['#FF6600', '#FCD202', '#B0DE09', '#0D8ECF', '#2A0CD0', '#CD0D74', '#CC0000', '#00CC00', '#0000CC', '#DDDDDD', '#999999', '#333333', '#990000'];
//                    data.forEach(function(d) {
//                        d.color = colors[Math.floor(Math.random()*colors.length)];
//                    });
                    chart.dataProvider = data;
                    chart.validateData();
                };
            }
        };
    }
]);