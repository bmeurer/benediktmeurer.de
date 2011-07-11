//! Copyright (c) 2010, Mihail Szabolcs
//! Konami Code Cheat Code / Easter Egg Implementation
//! Reference: http://en.wikipedia.org/wiki/Konami_Code
//!
//! Happy Birthday Panda!
window.konamiCodeKeys = []; //! Empty Array
window.konamiCodeReset = function()
{
	window.konamiCodeKeys = []; //! Empty Array
	return false;
}
window.konamiCode = function(codeKeys)
{
	var len = codeKeys.length;
	
	if(len < 10)
		return;
		
	var pattern = [	38/*up*/,
					38/*up*/,
					40/*down*/,
					40/*down*/,
					37/*left*/,
					39/*right*/,
					37/*left*/,
					39/*right*/,
					98/*b*/,
					97/*a*/];	

	for(i=0;i<10;i++)
	{
		if(codeKeys[i] != pattern[i])
			return window.konamiCodeReset();
	}

	var panda_src = "/images/panda/panda.png";

	var d = new Date();
	if(d.getMonth() == 2 && d.getDate() == 31) //! Happy Birthday Panda!
	{
		panda_src = "/images/panda/panda_birthday.png";
	}

	var panda = document.createElement("img");
	panda.id = "panda";
	panda.style.border = "0px";
	panda.style.position = "absolute";
	panda.style.left = ((screen.width - 487) / 2) + "px";
	panda.style.top = "60px";
	panda.style.zIndex = "1009";
	panda.style.cursor = "pointer";
	panda.src = panda_src;
	panda.onclick = function()
	{
		//document.body.removeChild(this);
		window.location.reload();
	}

	document.body.appendChild(panda);
	return window.konamiCodeReset();
}

window.onkeydown = function(e)
{
	try
 	{
 		var evt = (e)?(e):((window.event)?window.event:null);
 		var key = e.which || e.keyCode;

		if(key == 27) //! Escape
			return window.konamiCodeReset();

		//! A=>a, B=>b
		key = (key==65)?97:(key==66)?98:key;

		window.konamiCodeKeys.push(key);
		window.konamiCode(window.konamiCodeKeys);
 	}
	catch(err)
	{
		alert("Shitters, errors, errors, errors ... were you trying to figure out the Konami Code?!!!");
	}
}
