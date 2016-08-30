
var app = {"artworkUrl60":"http://a5.mzstatic.com/us/r30/Purple6/v4/e1/dd/01/e1dd01d1-1796-09a6-3085-fcb687589e12/mzl.vbcyyehm.75x75-65.jpg","button_text":"FREE","genre":"Business","trackId":"429047995","kind":"software","trackName":"EVER","release_date":"Updated Nov 14, 2013","url":"https://itunes.apple.com/us/app/ever/id681055530?mt=8","user_rating":0.0,"user_rating_count":0};

var existingCompetitors = [
    { "artworkUrl60": "http://a3.mzstatic.com/eu/r30/Purple5/v4/58/e0/2c/58e02cbd-b985-f635-f9f7-63e64e896fa6/icon180x180.png", "button_text": null, "genre": "Produttività", "trackId": "284882215", "kind": null, "trackName": "Evernote Scannable", "release_date": null, "url": "https://itunes.apple.com/it/app/evernote-scannable/id883338188?mt=8", "user_rating": 0.0, "user_rating_count": 0 }, { "artworkUrl60": "http://a5.mzstatic.com/us/r30/Purple1/v4/d3/26/e6/d326e674-2263-9473-5da2-e90cf5012cea/pr_source.75x75-65.jpg", "button_text": null, "genre": "Productivity", "trackId": "333903271", "kind": null, "trackName": "Everalbum: Protect your photos & videos—unlimited, encrypted, automatic backup", "release_date": null, "url": "https://itunes.apple.com/gb/app/everalbum-protect-your-photos/id703177890?mt=8", "user_rating": 0.0, "user_rating_count": 0 }
];


var currentStatus = {
    lang: 'US',
    category: 'ALL',
    device: 'IPHONE'
};

var historyCache = {};

var chartDataList = {};

var chart;
$(function() {

    var source = $("#competitor-item-template").html();
    var dropdownTemplate = Handlebars.compile(source);

    existingCompetitors.forEach(function(d) {
        d.shortName = d.trackName.shortName();
        var $html = $(dropdownTemplate(d));
        $html.on('click', function() {
            addItemToChartQueue(d);
            $(this).remove()
        });

        $('#competitor-dropdown').append($html);
    });


    chart = Highcharts.chart({
        chart: {
            renderTo: 'container',
            backgroundColor: 'hsla(0,0%, 100%, 0.9)'
        },
        credits: {
            enabled: false
        },
        title: {
            text: ""
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 48 * 3600 * 1000
        },
        yAxis: {
            title: {
                text: 'Rank'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#F0F0F0'
            }],
            minInterval: 2,
            min: 1,
            reversed: true
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            borderWidth: 0
        },
        series: []
    });

    $('.typeahead').typeahead(null, {
        source: search,
        name: 'best-pictures',
        displayKey: 'value',
        autoSelect: true,
        minLength: 2,
        highlight: true,
        templates: {
            empty: [
                '<div class="empty-message text-center">',
                'Sorry. We can\'t find any results.',
                '</div>'
            ].join('\n'),
            suggestion: function(item) {
                return '<div class="clearfix">' + '<img class="item-img" src="' + item.artworkUrl60 + '"/>' + '<div class="item">' + item.trackName + '</div>' + '<div class="item-type text-sm text-muted"><small>' + item.genre + '</small></div>' + '</div>';
            }
        }
    }).on('typeahead:selected', function(evt, item) {
        addItemToChartQueue(item);
    });


    $('#category-select>label').on('click', function(e) {
        currentStatus.category = $(this).find('input').val();
        refreshChartData();
    });

    $('#device-select>label').on('click', function(e) {
        currentStatus.device = $(this).find('input').val();
        refreshChartData();
    });

    $('#lang-dropdown>button').on('click', function(e) {
        currentStatus.lang = $(this).attr('data-lang');
        $('#dropdown-indicator').html($(this).html())
        refreshChartData();
    });


    addItemToChartQueue(app, true);

});



function addItemToChartQueue(item, isMain) {

    var trackId = item.trackId
    item.shortName = item.trackName.shortName();

    if (!isMain)
        chartDataList[trackId] = item;

    var source = $("#app-block-template").html();
    var template = Handlebars.compile(source);
    var $html = $(template(item));
    if (!isMain) {
        $html.find('.app-close').on('click', function() {
            removeApp(trackId);
        });
    } else {
        $html.find('.app-close').remove();
    }

    if (isMain)
        $('#my-app').append($html);
    else
        $('#their-app').append($html);

    getAppHistory(trackId, isMain);
}

function refreshChartData() {
    while (chart.series.length) {
        chart.series[0].remove(false);
    }

    chart.redraw();

    for (var key in historyCache) {
        filterAndSetChartData(historyCache[key], key);
    }

    if (chart.series.length == 0)
        chart.setTitle('No Data to Display')
}


function search(query, cb) {
    var query = $('#search_form').serialize();
    $('#spinner').removeClass('ninja');

    $.get('data/ever.json?' + query, function(data) {
        //Simulate real fetch by waiting 0.8s
        setTimeout(function() {

            cb(data.filter(function(d){
                return !(d.trackId in chartDataList);
            }));
            $('#spinner').addClass('ninja');
        }, 800)
    }, 'json')
}


function filterAndMerge(parent, childKey, filterFcn) {
    var filtered = parent[childKey].filter(filterFcn);

    filtered.forEach(function(d) {
        for (var key in parent) {
            if (key != childKey)
                d[key] = parent[key];
        }
    });

    return filtered;
}

function createRow(data, id) {
    var item;
    if (id == app.trackId){
        item = app;
        item.first = true;
    }else
        item = chartDataList[id];

    var _data = $.extend({}, item, {
        rank: {
            overall: {
                current: Math.ceil(15 * Math.random()),
                value: Math.ceil(10 * Math.random()) - 5,
            },
            category: {
                current: Math.ceil(15 * Math.random()),
                value: Math.ceil(10 * Math.random()) - 5
            }
        },
        visibility: Math.ceil(100 * Math.random())
    });

    if(_data.rank.overall.value > 0)
        _data.rank.overall.positive = true;

    if(_data.rank.category.value > 0)
        _data.rank.category.positive = true;

    var source = $("#grid-item-template").html();
    var dropdownTemplate = Handlebars.compile(source);

    var $html = $(dropdownTemplate(_data));
    $html.find('.app-close').on('click', function() {
        removeApp(_data.trackId);
    });

    $('#app-listing').append($html);

}

function filterAndSetChartData(data, id) {

    var name;
    if (id == app.trackId)
        name = app.shortName;
    else
        name = chartDataList[id].shortName;

    var filteredData = [];

    var countryFiltered = data.find(function(d) {

        return d.countryCode == currentStatus.lang;

    });

    var categoryFiltered = filterAndMerge(countryFiltered, 'ranksByCategoryIds', function(d) {
        if (currentStatus.category == 'ALL')
            return true;

        return d.categoryName == currentStatus.category;
    });

    var deviceFiltered = categoryFiltered.reduce(function(p, c) {

        return p.concat(filterAndMerge(c, 'rankings', function(d) {
            if (currentStatus.device == 'ALL')
                return true;

            return d.targetDevice == currentStatus.device;
        }));
        console.log(deviceFiltered)

    }, []);


    deviceFiltered.forEach(function(d) {
        chart.addSeries({
            color: memoizedRandomColors(),
            name: name + '/' + d.categoryName,
            data: d.ranksByDate.map(function(d) {
                return [d.date, d.rank]
            }),
        }, false);

    });
    chart.redraw();
}

function getAppHistory(id, isMain) {
    $.get('data/' + id + '.json', function(data) {

        historyCache[id] = data;

        filterAndSetChartData(data, id);
        createRow(data, id);


    });

    /*chart.addSeries({
        name: 'London',
        data: filteredData,
    });*/

}

function removeApp(id) {
    delete chartDataList[id];
    delete historyCache[id];
    $('#app-'+id).remove();
    $('#app-grid-'+id).remove();
    refreshChartData();
}

memoizedRandomColors = (function() {
    var index = 0;
    var colorsList = ["#015eff", "#0cc402", "#fc0a18", "#aea7a5", "#ff15ae", "#d99f07", "#11a5fe", "#037e43", "#ba4455", "#d10aff", "#9354a6", "#7b6d2b", "#08bbbb", "#95b42d", "#b54e04", "#ee74ff", "#2d7593", "#e19772", "#fa7fbe", "#fe035b", "#aea0db", "#905e76", "#92b27a", "#03c262", "#878aff", "#4a7662", "#ff6757", "#fe8504", "#9340e1", "#2a8602", "#07b6e5", "#d21170", "#526ab3", "#ff08e2", "#bb2ea7", "#e4919f", "#09bf91", "#90624c"];

    return function() {
        return colorsList[index++ % colorsList.length];
    }
})();
