
define('view', ['handlebars'], function(Handlebars) {
    
    return {
    
        render: function(name, model) {
     
            name = name;
		
						console.log(name);	
    
            var templateElement = document.getElementById(name),
                templateSource = templateElement.innerHTML,
                renderFn = Handlebars.compile(templateSource);

            return renderFn(model);
        }
    };
});
