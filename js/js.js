(function() {
 new Promise(function(resolve) {
    if(document.readyState === 'complete') {
        resolve();
    } else {
        window.onload = resolve;
    }

 }).then(function() {
       
    ymaps.ready(function () {

            var coords;
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.open('post', 'http://localhost:3000/', true);
            xhr.onload = function() {
                        console.log(xhr.response);
                for(var k in xhr.response) {
                    var reviews = xhr.response[k];
                    reviews.forEach(function(review) {
                        mark([review.coords.x, review.coords.y], address, review.name, review.place, review.text);
                    });
                }
            };
            xhr.send(JSON.stringify({op: 'all'}));

            var dataMap = {
                coords: [],
                name: '',
                place: '',
                text: '',
                address: ''
            }

            var myPlacemark,
                myMap = new ymaps.Map('map', {
                center: [51.52420326872876, 46.04014127613009],
                zoom: 9,
                behaviors: ['default', 'scrollZoom']
            }, {
                searchControlProvider: 'yandex#search'
            }),
 
                customItemContentLayout = ymaps.templateLayoutFactory.createClass(
                '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
                '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
                '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
            ),
                clusterer = new ymaps.Clusterer({
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: true,
                clusterBalloonContentLayout: 'cluster#balloonCarousel',
                clusterBalloonItemContentLayout: customItemContentLayout,
                clusterBalloonPanelMaxMapArea: 0,
                clusterBalloonContentLayoutWidth: 200,
                clusterBalloonContentLayoutHeight: 130,
                clusterBalloonPagerSize: 5
            });



            getPointData = function (index) {
                return {
                    balloonContentBody: 'балун <strong>метки ' + index + '</strong>',
                    clusterCaption: 'метка <strong>' + index + '</strong>'
                };
            },
 
            getPointOptions = function () {
                return {
                    preset: 'islands#orangeIcon'
                };
            },
            points = [
                
            ],
            geoObjects = [];


            for(var i = 0, len = points.length; i < len; i++) {
                geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions());
            };


            clusterer.options.set({
                gridSize: 80,
                clusterDisableClickZoom: true
            });

     
            clusterer.add(geoObjects);
            myMap.geoObjects.add(clusterer);


            // Слушаем клик на карте
            myMap.events.add('click', function (e) {
                dataMap.coords = e.get('coords');
                popup.style.display = 'block';

                getAddress(dataMap.coords).then(function(gotAddress) {
                    dataMap.address = gotAddress.properties.get('text');
                    document.getElementById('address').innerText = dataMap.address;
                });

                
            });

            popup.addEventListener('click', function(e) {
               console.log(dataMap.coords);

                if(e.target.id === 'submit' && name !== 'Ваше имя' && place !== 'Укажите место' && text !== 'Поделитесь впечатлениями') {

                    dataMap.name = document.getElementById('name').value;
                    dataMap.place = document.getElementById('place').value;
                    dataMap.text = document.getElementById('text').value;

                    myPlacemark = createPlacemark(dataMap.coords);   
                    myPlacemark.properties
                        .set({
                            balloonContentHeader: dataMap.place,
                            balloonContentBody: dataMap.text,
                            balloonContentFooter: dataMap.name
                    });
                    clusterer.add(myPlacemark);                    


                    var xhr = new XMLHttpRequest();
                    xhr.open('post', 'http://localhost:3000/', true);
                    xhr.onloadend = function() {
                        console.log(xhr.response);
                    };
                    xhr.send(JSON.stringify({
                        op: "add",
                        review: {
                            coords: {x: dataMap.coords[0], y: dataMap.coords[1]},
                            address: dataMap.address,
                            name: dataMap.name,
                            place: dataMap.place,
                            text: dataMap.text 
                        }
                    }));  



                    closePopup();                                     
                };

                if(e.target.value == 'Ваше имя' || e.target.value == 'Укажите место' || e.target.value == 'Поделитесь впечатлениями') {
                    e.target.value = '';    
                };

                if(e.target.id == 'closePopup') {
                   closePopup();  
                } 


            });




            // Создание метки
            function createPlacemark(coords) {
                return new ymaps.Placemark(coords, {
                    //iconContent: 'поиск...'
                }, {
                    preset: 'islands#orangeStretchyIcon',
                    draggable: false
                });
            }

            // Определяем адрес по координатам (обратное геокодирование)
            function getAddress(coords) {
                return ymaps.geocode(coords).then(function (res) {
                    return res.geoObjects.get(0);
                });
            }

           function mark(coords, address, name, place, text) {

                myPlacemark = createPlacemark(coords);   
                myPlacemark.properties
                    .set({
                        balloonContentHeader: place,
                        balloonContentBody: text,
                        balloonContentFooter: name
                });
                clusterer.add(myPlacemark);
                //myPlacemark = createPlacemark(coords);
            };




            //Прячем попап
            function closePopup() {
                popup.style.display = 'none';
                document.getElementById('name').value = 'Ваше имя';
                document.getElementById('place').value = 'Укажите место';
                document.getElementById('text').value = 'Поделитесь впечатлениями'; 
            };



        });
 });
}());


