const render = (url, backurl, include) => {
	if (include != undefined && include == "include animations") {
		$(window).on('popstate', function(event) {
			const contentDivRnd = document.getElementById("content");
			const loadingOverlayRnd = document.querySelector(".loading-overlay");
			contentDivRnd.classList.add('fade-out');
			loadingOverlayRnd.style.opacity = '1';
			contentDivRnd.classList.remove('fade-out');
			$.ajax({
				url: backurl,
				type: 'GET',
				success: function(data) {
					$('#content').html('');
					$('#content').html(data);
					window.history.pushState({}, '', backurl);
				}
			});
		});
	} else if (include == "" || include == undefined) {
		$(window).on('popstate', function(event) {
			$.ajax({
				url: backurl,
				type: 'GET',
				success: function(data) {
					$('#content').html('');
					$('#content').html(data);
					window.history.pushState({}, '', backurl);
				}
			});
		});
	} else if (include == "include animations; force skip = bool:true" || include == "include animations; force skip=bool:true" || include == "include animations;force skip = bool:true" || include == "include animations;force skip=bool:true" || include == "include animations; force skip = bool: true" || include == "include animations; force skip=bool: true" || include == "include animations;force skip = bool: true" || include == "include animations;force skip=bool: true" ) {
		console.warn("Used force skip for \"popstate\"");
	} else {
		console.error("Unknown render.js syntax:", include, "Use \"\" or correct syntax");
		return;
	}
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data) {
			$('#content').html('');
			$('#content').html(data);
			window.history.pushState({}, '', url);
		}
	});
};


const sendPost = (url, params) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: 'POST',
            data: params,
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                // console.log(response);
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error("sendPost() error:", error);
                reject("Error");
            }
        });
    });
};

const sendPostJSON = (url, params) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(params),
            contentType: 'application/json',
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                // console.log(response);
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error("sendPost() error:", error);
                reject("Error");
            }
        });
    });
};

