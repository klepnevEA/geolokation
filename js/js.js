(function() {
 new Promise(function(resolve) {
    if(document.readyState === 'complete') {
        resolve();
    } else {
        window.onload = resolve;
    }

 }).then(function() {
       
    ymaps.ready(function () {
            var name = document.getElementById('name'),
                place = document.getElementById('place'),
                text = document.getElementById('text'),
                addressMap = document.getElementById('addressMap'),
                xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.open('post', 'http://localhost:3000/', true);
            xhr.onload = function() {

                for(var k in xhr.response) {
                    var reviews = xhr.response[k];
                    reviews.forEach(function(review) {
                        mark([review.coords.x, review.coords.y], review.address, review.name, review.place, review.text);
                    });
                };
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
                behaviors: ['default', 'scrollZoom'],
                controls: ['geolocationControl']
            }, {
                searchControlProvider: 'yandex#search'
            }),
 
                customItemContentLayout = ymaps.templateLayoutFactory.createClass(
 
                '<div class="ballon_header"><h3>{{ properties.balloonContentHeader|raw }}</h3></div>' +
                '<div class="ballon_body"><a class="list_item">{{ properties.balloonContentBody|raw }}</a></div>' +
                '<div class="ballon_footer">{{ properties.balloonContentFooter|raw }}</div>'
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
                openPopup(event.clientX, event.clientY);

                getAddress(dataMap.coords).then(function(gotAddress) {
                    dataMap.address = gotAddress.properties.get('text');
                    addressMap.innerText = dataMap.address;
                });
                
            });


            /*вот здесь открывается попап по сстыке, но это не раболтает*/
            /*document.addEventListener('click', function(e) {
                if(e.target.classList.contains('list_item')) {
                    var address = e.target.innerText;
                    openPopup(10, 10, address);
                }
            });*/
 


            popup.addEventListener('click', function(e) {
                 console.log(name.value);   
                if(e.target.id == 'submit') {
                   pushPlacemark();    
                };

                if(e.target.value == 'Ваше имя' || e.target.value == 'Укажите место' || e.target.value == 'Поделитесь впечатлениями') {
                    e.target.value = '';    
                };

                if(e.target.id == 'closePopup') {
                   closePopup();  
                } 
            });

            function pushPlacemark() {
                    dataMap.name = name.value;
                    dataMap.place = place.value;
                    dataMap.text = text.value;
                    myPlacemark = createPlacemark(dataMap.coords);   
                    myPlacemark.properties
                        .set({
                            balloonContentHeader: dataMap.place,
                            balloonContentBody: dataMap.address,
                            balloonContentFooter: dataMap.name,
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

                    if(reviews.innerHTML == 'нет здесь ничего') {
                        reviews.innerHTML = '';
                    }

                    var newLi = document.createElement('li');
                    newLi.innerHTML = "<b>" + dataMap.name + "</b><br>" + dataMap.place + "<br>" + dataMap.text;
                    reviews.appendChild(newLi);
                        
                    clearPopup(); 
            };

            function openPopup(x, y) {
                name.value = 'Ваше имя';
                place.value = 'Укажите место';
                text.value = 'Поделитесь впечатлениями';                
                popup.style.display = 'block';
                reviews.innerText = 'нет здесь ничего';

                /*ЭТО ДОЛЖНО КАКТО РАБОТАТЬ ПРИ ОТКРЫТИ ПОПАПА ПО ССЫЛКЕ, НО ОНО НЕ РАБОТАЕТ*/
                // if(arguments.length>2) {
                //     var valAddres = arguments[2];
                //     createPlacemark(valAddres);
                //     addressMap.innerText = valAddres;
                //     var source = itemTemplate.innerHTML,
                //     templateFn = Handlebars.compile(source),
                //     template = templateFn({list: xhr.response[valAddres]});
                //     reviews.innerHTML = template;                    
                // };

                if(popup.offsetWidth + x >= map.offsetWidth) {
                   popup.style.left = x - popup.offsetWidth + 'px'; 
                } else {
                    popup.style.left = x + 'px';
                };

                if(popup.offsetHeight + y >=  map.offsetHeight) {
                     popup.style.top = y - popup.offsetHeight + 'px'; 
                } else { 
                    popup.style.top = y + 'px';                   
                };

                if (popup.offsetTop <= map.offsetTop){
                    popup.style.top = map.style.top;
                }
            }

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
                        balloonContentBody: address,
                        balloonContentFooter: name
                });
                clusterer.add(myPlacemark);
                //myPlacemark = createPlacemark(coords);
            };


            function clearPopup() {
                name.value = 'Ваше имя';
                place.value = 'Укажите место';
                text.value = 'Поделитесь впечатлениями'; 
            }


            //Прячем попап
            function closePopup() {
                popup.style.display = 'none';
            }
        });
 });
}());


