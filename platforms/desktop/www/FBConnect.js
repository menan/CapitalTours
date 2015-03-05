/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

function FBConnect()
{
	if(window.plugins.childBrowser == null)
	{
		ChildBrowser.install();
	}
}

FBConnect.prototype.connect = function(client_id, redirect_uri, display)
{
	this.client_id = client_id;
	this.redirect_uri = redirect_uri;
	var authorize_url = "https://graph.facebook.com/oauth/authorize?";
	authorize_url += "client_id=" + client_id;
	authorize_url += "&redirect_uri=" + redirect_uri;
	authorize_url += "&display="+ ( display ? display : "touch" );
	authorize_url += "&type=user_agent";
	
	//if you want to post message on the wall : publish_stream, offline_access,
	authorize_url += "&scope=publish_stream";
	window.plugins.childBrowser.showWebPage(authorize_url, { showLocationBar: false });
	var self = this;
	window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}

FBConnect.prototype.onLocationChange = function(newLoc)
{
	if(newLoc.indexOf(this.redirect_uri) == 0)
	{
		var result = unescape(newLoc).split("#")[1];
		result = unescape(result);
		
		// TODO: Error Check
		this.accessToken = result.split("&")[0].split("=")[1];		
		//this.expiresIn = result.split("&")[1].split("=")[1];
	
		window.plugins.childBrowser.close();
		this.onConnect();
	}
}

FBConnect.prototype.getFriends = function()
{
	var url = "https://graph.facebook.com/me/friends?access_token=" + this.accessToken;
	var req = new XMLHttpRequest();
	req.open("get",url,true);
	req.send(null);
	req.onerror = function(){alert("Error");};
	return req;
}

FBConnect.prototype.postFBWall = function(description, link, picture, name, message, cb)
{
	//console.log('inside postFBWall ' + description + ' urlPost=' + link + 'urlPicture=' + picture);
    
	var jqxhr = $.post("https://graph.facebook.com/me/feed",
		{
		  access_token: this.accessToken,
		  message: message,
		  picture: picture,
		  link: link,
		  name: name,
		  description: description,
		},
		function() {
			//console.log("Post to FB success.");
			cb();
    });
    
    jqxhr.complete(function (xhr, status) {
	    if (status === 'error' || !xhr.responseText) {
			console.log(xhr.responseText);
			console.log(status);
	    }
	    else {
	        cb();
	    }
	});
}

FBConnect.prototype.getUserInfo = function(callBack)
{
	var url = "https://graph.facebook.com/me?access_token=" + this.accessToken;

	var jqxhr = $.getJSON(url, function(json) {
		callBack(json);
	});
	
	jqxhr.error(function(e) { alert("FBConnect Error: Can't retrieve user info from Facebook."); })
}

FBConnect.prototype.postFBGraph = function(url)
{
	var req = new XMLHttpRequest();
	req.open("post", url, true);

	req.onreadystatechange = function() {
		if(req.readyState == 4 && req.status == 200) {
			//console.log(req.responseText);
		}
		else {
			//console.log(s"postFBGraph request failed: " + req.status);
		}
	};
	
	req.send(null);
	return req;
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
FBConnect.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.fbConnect = new FBConnect();
	return window.plugins.fbConnect;
}