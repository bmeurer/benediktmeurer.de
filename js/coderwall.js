/*
	coderwall.js
	
	Code to display coderwall.com badges.
	
	Based on https://gist.github.com/1005886 .
*/

var Coderwall = function(config)
{
	this.config = 
	{
		height : 75,
		width : 75,
		target: '#coderwall'
	};
	
	// merge config
	for(var c in (config || {}))
		this.config[c] = config[c]
}

Coderwall.prototype = 
{
	init : function()
	{
		if(typeof this.config.username == undefined)
			return;
		
		var config = this.config;
		$(document).ready(function()
		{
			$.getJSON("http://www.coderwall.com/"+config.username+".json?callback=?", 
			function(result) 
			{
				$.each(result.data.badges, 
						function(i, item) 
						{
							$("<img/>").attr("src", item.badge)
							.attr("float", "left")
							.attr("title", item.name + ": " + item.description)
							.attr("alt", item.name)
							.attr("height", config.height)
							.attr("width", config.width)
							.appendTo(config.target)
							.hover(	function(){$(this).css("opacity","0.6").css("cursor","pointer");},
									function(){$(this).css("opacity","1.0").css("cursor","hand");} )
							.click( function(){ window.location = "http://www.coderwall.com/"+config.username+"/"; } );		
						});
			});
		});
	}
};

