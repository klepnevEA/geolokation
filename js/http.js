define('http', function() {
    
    return function(url) {
        
        function post(data) {
            
            return new Promise(function(resolve) {
               
                var xhr = new XMLHttpRequest();

                xhr.open('post', url, true);
                xhr.responseType = 'json';
                xhr.onloadend = function() {
                    resolve(xhr.response);
                };

                
                xhr.send(JSON.stringify(data));
            });
        }

        return {

            all: function() {
                return post({op: 'all'});
            },

            get: function(address) {
                //console.log(address);
                return post({op: 'get', address: address});
            },

            add: function(review) {
                //console.log(review);                
                return post({op: 'add', review: review});
            }
        };
    };
});

