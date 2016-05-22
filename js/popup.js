define('popup', ['http', 'view'], function(http, view) {
    
    var remote = http('http://smelukov.com:3000');

    function onClick(e) {

        if(e.target.dataset.button == 'send' && document.querySelector('#namePopup').value !== '') {
            console.log(document.querySelector('#namePopup').placeholder);
            var review = {
                address: reviewPopup.address,
                name: reviewPopup.getWindow().querySelector('#namePopup').value,
                place: reviewPopup.getWindow().querySelector('#placePopup').value,
                text: reviewPopup.getWindow().querySelector('#textPopup').value,
                date: Date.now(),
                coords: reviewPopup.point                    
            };

            remote.add(review).then(function(reviews) {
                reviewPopup.trigger('addReview', review);
                reviewPopup.render(reviewPopup.template, reviewPopup.address, reviews);
            });

            e.preventDefault();
        };

        if(e.target.dataset.button == 'close') {
            reviewPopup.close();
        }            

    };

    var reviewPopup = {
        popup: null,
        openPopup: false,
        handlers: {},
        address: '',
        template: '',
        point: null,

        open: function(template, address, coords, point) {

            return remote.get(address).then(function(reviews) {

                var windowRect;

                this.address = address;
                this.point = point;
                this.popup = document.createElement('div');
                this.popup.id = 'popupOpen';
                this.render(template, address, reviews);

                document.body.appendChild(this.popup);

                windowRect = this.popup.getBoundingClientRect();
                var top = coords.y;
                var left = coords.x;


                /*if(coords.y + popupOpen.height > map.innerHeight) {
                    popupOpen.style.top = popupOpen.style.top - popupOpen.height;
                }*/

 

                if(popupOpen.offsetHeight + coords.y >= map.offsetHeight) {
                   top =  map.offsetHeight - popupOpen.offsetHeight;
                   console.log(top);
                } else {
                    top = coords.y;
                };

                if(popupOpen.offsetWidth + coords.x >= map.offsetWidth) {
                   left =  map.offsetWidth - popupOpen.offsetWidth;
                   console.log(left);
                } else {
                    left = coords.x;
                };                


                this.popup.style.top = top + 'px';
                this.popup.style.left = left + 'px';
                this.popup.addEventListener('click', onClick);

                this.openPopup = true;
            }.bind(this));


        return Promise.resolve();
    },

        close: function() {

            if (this.openPopup && this.popup) {
                this.popup.parentNode.removeChild(this.popup);
            };
        },        

        trigger: function(e) {
            this.handlers[e].apply(null, Array.prototype.slice.call(arguments, 1));
        },

        on: function(e, handler) {
            this.handlers[e] = handler;
        },

        render: function(template, address, reviews) {
            this.template = template;
            this.popup.innerHTML = view.render(this.template, {address: address, reviews: reviews});
            console.log(this.popup);       

        },

        getWindow: function() {
            return this.popup;
        }


    };

    return reviewPopup;
    });
