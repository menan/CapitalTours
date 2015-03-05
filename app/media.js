
function prepMediaPages() {
	(function(window, $, PhotoSwipe){

	  
		//initialize gallery pages to load photoswipe on pageshow
		$('#photo-gallery').live('pageshow', function(e){

      
  	  var photoSwipeInstance = null;
              		
				var currentPage = $(e.target);

        var options = { 
						allowUserZoom: false,
						preventSlideshow: true,
						captionAndToolbarAutoHideDelay: 10000
					}

					if (photoSwipeInstance == null ) {
					  photoSwipeInstance = $("ul.gallery a", e.target).photoSwipe(options,  currentPage.attr('id'));
					} 


        trackPage('gallery');  

        return true;				
			})
			
			.live('pagehide', function(e){
				var currentPage = $(e.target);
        var photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

				if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
					PhotoSwipe.detatch(photoSwipeInstance);
				}
				
				return true;
				
			});
		}(window, window.jQuery, window.Code.PhotoSwipe));
		

}

function playTutorial(language) {	
	var PhotoSwipe = window.Code.PhotoSwipe;
	
	if(typeof PhotoSwipe.instances !== 'undefined') {
		for (var x in PhotoSwipe.instances) {
			PhotoSwipe.detatch(PhotoSwipe.instances[x]);
		}
		
		var options = {
				preventHide: false,
				preventSlideshow: true,
				captionAndToolbarShowEmptyCaptions: false,
				allowUserZoom: false,
				getImageSource: function(obj){
					return obj.url;
				},
				getImageCaption: function(obj){
					return obj.caption;
				}
			};
			
			var slidesEn = [
				{ url: 'images/tutorial/tutorial-slide-1.jpg'},
				{ url: 'images/tutorial/tutorial-slide-2.jpg'},
				{ url: 'images/tutorial/tutorial-slide-3.jpg'},
				{ url: 'images/tutorial/tutorial-slide-4.jpg'}
			],
				slidesFr = [
				{ url: 'images/tutorial/tutorial-slide-1-fr.jpg'},
				{ url: 'images/tutorial/tutorial-slide-2-fr.jpg'},
				{ url: 'images/tutorial/tutorial-slide-3-fr.jpg'},
				{ url: 'images/tutorial/tutorial-slide-4-fr.jpg'}
			],
			slides = [];
			
			if (!language) {
			fetchLanguage(function(lang){
		      if(lang){
		        language = (lang == 'French') ? 'French' : 'English';
		      }else{
		        language = 'English';
		      }
		    });
		    }
		    
		    slides = (language == 'French') ? slidesFr : slidesEn;
		
			instance = PhotoSwipe.attach( 
			slides, 
			options
		);
		
		instance.show(0);
		trackPage('tutorial');
		return true;
	}		
}

var returnFromDialogue = 0;
//look for anchors with rel=definition and bind them to their definitions
function parseDefinitions() {
	$('a[rel=definition]').bind("tap", function(){
		var destUrl = ($($.mobile.activePage).attr('id') == 'fun-facts') ? '#fun-facts' : '#waypoint';
		returnFromDialogue = $(window).scrollTop();
		var defId = $(this).attr('def');
		var def = $(defId);
		$('[data-role=dialog]#definition .ui-title').text($(this).text());
		$('[data-role=dialog]#definition [data-role=content] .body').html(def.html());
		if ($('[data-role=dialog]#definition [data-role=content] .dialog-close .ui-btn-text').length)
		$('[data-role=dialog]#definition [data-role=content] .dialog-close .ui-btn-text').html(Brule.resources.Close);
		else $('[data-role=dialog]#definition [data-role=content] .dialog-close').html(Brule.resources.Close);
		$('[data-role=dialog]#definition [data-role=content] .dialog-close').attr('href', destUrl);
		trackPage('definition/'+$(this).text());
	});
}

$('#video').live('pagehide', function(e, data){
	//console.log('vid page is unloading');
	if ($('video').length) $('video').remove();
	data.nextPage.trigger('refresh');
});