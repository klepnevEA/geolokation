require.config({

    paths: {

        handlebars: 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min'
    },

    catchError: true
});


define(['popup', 'handlebars', 'http'], function(reviewPopup, Handlebars, http) {
    
    var remote = http('http://smelukov.com:3000');

    Handlebars.registerHelper('formatDate', function(time) {
        return formatDate(time);
    });

    new Promise(function(resolve) {
        ymaps.ready(resolve);
    }).then(function() {
        var theMap = new ymaps.Map("map", {
                center: [55.73, 37.68],
                zoom: 11
            }),
            customItemContentLayout = ymaps.templateLayoutFactory.createClass(balon.innerHTML),
            clusterer = new ymaps.Clusterer({
                preset: 'islands#invertedOrangeClusterIcons',
                groupByCoordinates: false,
                clusterHideIconOnBalloonOpen: false,
                geoObjectHideIconOnBalloonOpen: false,
                clusterBalloonContentLayout: 'cluster#balloonCarousel',
                clusterBalloonItemContentLayout: customItemContentLayout,
                clusterBalloonPanelMaxMapArea: 0,
                clusterBalloonContentLayoutWidth: 300,
                clusterBalloonContentLayoutHeight: 200,
                clusterBalloonPagerSize: 10
            });

        clusterer.options.set({
            gridSize: 80,
            clusterDisableClickZoom: true
        });


        /*Вот эта сатанинская вещь с координатами. Начать с этого завтра*/
        document.addEventListener('click', function(e) {

            if (e.target.classList.contains('ballonLinck')) {
                e.preventDefault();

                theMap.balloon.close();
                
                openReviewWindow([e.clientX, e.clientY], [e.target.dataset.x, e.target.dataset.y])
            }
        });

        theMap.geoObjects.add(clusterer);

        reviewPopup.on('addReview', addToCluster);

        theMap.events.add('click', function(e) {
            var event = e.get('domEvent'),
                coords = e.get('coords');

            openReviewWindow([e.get('clientX'), e.get('clientY')], coords);
        });

        remote.all().then(function(all) {
            var res = [];

            for (var address in all) {
                res = res.concat(all[address]);
            }
            console.log(res);
            addToCluster(res);

        });

        function openReviewWindow(coords, pount) {

            getAddress(pount).then(function(geoObject) {
                reviewPopup.open('popup', geoObject.properties.get('text'), {
                    x: coords[0],
                    y: coords[1]
                }, {
                    x: pount[0],
                    y: pount[1]
                });
            });
        };

        function getAddress(coords) {
            return ymaps.geocode(coords).then(function(res) {
                return res.geoObjects.get(0);
            });
        };

        /*добавление в кластеры*/
        function addToCluster(review) {
            var marks = [],
                reviews = Array.isArray(review) ? review : [review];

            reviews.forEach(function(review) {
                var placemark = new ymaps.Placemark([review.coords.x, review.coords.y], review, {
                    preset: 'islands#orangeIcon'
                });


                marks.push(placemark);
            });
            console.log(marks);
            clusterer.add(marks);
        };
    });


    /*Разобрать завтра с утра*/
    function formatDate(time) {
        var date = new Date(time),
            dateString = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(function(el) {
                return el < 10 ? '0' + el : el;
            }),
            timeString = [date.getHours(), date.getMinutes(), date.getSeconds()].map(function(el) {
                return el < 10 ? '0' + el : el;
            });
        return dateString.join('.') + ' ' + timeString.join(':');
    };
});
