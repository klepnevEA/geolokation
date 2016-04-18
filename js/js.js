 new Promise(function(resolve) {
    if(document.readyState === 'complete') {
        resolve();
    } else {
        window.onload = resolve;
    }

 }).then(function() {
       
    ymaps.ready(function () {
            var myPlacemark,
                myMap = new ymaps.Map('map', {
                center: [-84.50676726894993, 32.09877903696875],
                zoom: 9,
                behaviors: ['default', 'scrollZoom']
            }, {
                searchControlProvider: 'yandex#search'
            }),
 
            // Создаем собственный макет с информацией о выбранном геообъекте.
                customItemContentLayout = ymaps.templateLayoutFactory.createClass(
                // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
                '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
                '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
                '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
            ),
                clusterer = new ymaps.Clusterer({
                clusterDisableClickZoom: true,
                clusterOpenBalloonOnClick: true,
                // Устанавливаем стандартный макет балуна кластера "Карусель".
                clusterBalloonContentLayout: 'cluster#balloonCarousel',
                // Устанавливаем собственный макет.
                clusterBalloonItemContentLayout: customItemContentLayout,
                // Устанавливаем режим открытия балуна. 
                // В данном примере балун никогда не будет открываться в режиме панели.
                clusterBalloonPanelMaxMapArea: 0,
                // Устанавливаем размеры макета контента балуна (в пикселях).
                clusterBalloonContentLayoutWidth: 200,
                clusterBalloonContentLayoutHeight: 130,
                // Устанавливаем максимальное количество элементов в нижней панели на одной странице
                clusterBalloonPagerSize: 5
                // Настройка внешего вида нижней панели.
                // Режим marker рекомендуется использовать с небольшим количеством элементов.
                // clusterBalloonPagerType: 'marker',
                // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
                // clusterBalloonCycling: false,
                // Можно отключить отображение меню навигации.
                // clusterBalloonPagerVisible: false
            });

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.open('post', 'http://localhost:3000/', true);
            xhr.onload = function() {

                for(var k in xhr.response) {
                    var reviews = xhr.response[k];
                    reviews.forEach(function(review) {
                        mark([review.coords.x, review.coords.y], address, review.name, review.place, review.text);
                    });
                }
            };
            xhr.send(JSON.stringify({op: 'all'}));


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
                [55.831903,37.411961]
            ],
            geoObjects = [];


            for(var i = 0, len = points.length; i < len; i++) {
                geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions());
            }


            clusterer.options.set({
                gridSize: 80,
                clusterDisableClickZoom: true
            });

     
            clusterer.add(geoObjects);
            myMap.geoObjects.add(clusterer);


            myMap.setBounds(clusterer.getBounds(), {
                checkZoomRange: true
            });


            // Слушаем клик на карте
            myMap.events.add('click', function (e) {
                var coords = e.get('coords');



                getAddress(coords).then(function(gotAddress) {
 
                    var address =  gotAddress.properties.get('text');   


                    popup.style.display = 'block';
                    popup.style.top = e.clientY + 'px';
                    popup.style.left = e.clientX + 'px';
                    document.getElementById('address').innerText = address;                    

                    if(popup.offsetTop + popup.offsetHeight > map.offsetHeight) {
                        popup.style.top = '10px';
                    }

                    if(popup.offsetLeft + popup.offsetWidth > map.offsetWidth) {
                        popup.style.left = popup.offsetLeft - popup.offsetWidth + 'px';
                    } 

                                   

                    popup.addEventListener('click', function(e) {
                        if(e.target.value == 'Ваше имя' || e.target.value == 'Укажите место' || e.target.value == 'Поделитесь впечатлениями') {
                            e.target.value = '';    
                        };

                        if(e.target.id == 'closePopup') {
                           closePopup();  
                        } 

                        var name = document.getElementById('name').value;
                        var place = document.getElementById('place').value;
                        var text = document.getElementById('text').value;


                        if(e.target.id == 'submit' && name != 'Ваше имя' && place != 'Укажите место' && text != 'Поделитесь впечатлениями') {
                           mark(coords, gotAddress.properties.get('text'), name, place, text);
                           closePopup();

                            var xhr = new XMLHttpRequest();
                            xhr.open('post', 'http://localhost:3000/', true);
                            xhr.onloadend = function() {
                                console.log(xhr.response);
                            };
                            xhr.send(JSON.stringify({
                                op: "add",
                                review: {
                                    coords: {x: coords[0], y: coords[1]},
                                    address: gotAddress.properties.get('text'),
                                    name: name,
                                    place: place,
                                    text: text 
                                }
                            }))   
                        }                
                    });
                    myPlacemark = createPlacemark(coords);

                });
 
                
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
                //myPlacemark.properties.set('iconContent', 'поиск...');
                return ymaps.geocode(coords).then(function (res) {
                    return res.geoObjects.get(0);

 
                });
            }

            function mark(coords, address, name, place, text) {
                console.log(myPlacemark.properties); 
                //myPlacemark = createPlacemark(coords);   
                myPlacemark.properties
                    .set({
                        balloonContentHeader: place,
                        balloonContentBody: text,
                        balloonContentFooter: name
                });
                clusterer.add(myPlacemark);
                myPlacemark = createPlacemark(coords);
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






















