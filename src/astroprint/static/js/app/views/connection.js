/*
 *  (c) Daniel Arroyo. 3DaGoGo, Inc. (daniel@3dagogo.com)
 *
 *  Distributed under the GNU Affero General Public License http://www.gnu.org/licenses/agpl.html
 */

var ConnectionView = Backbone.View.extend({
	el: '#connection-view',
	events: {
		'click i.printer': 'printerTapped',
		'click i.server': 'serverTapped',
		'click i.astroprint': 'astroprintTapped'
	},
	socketData: null,
	connect: function() {
		var self = this;

        $.ajax({
            url: API_BASEURL + "connection",
            method: "GET",
            dataType: "json",
            success: function(response) {
		        var data = {
		            "command": "connect",
		            "port": response.options.portPreference,
		            "baudrate": response.options.baudratePreference,
		            "autoconnect": true
		        };

		        if (response.current.state.substr(0,5) == 'Error' || response.current.state == 'Closed') {
			        $.ajax({
			            url: API_BASEURL + "connection",
			            type: "POST",
			            dataType: "json",
			            contentType: "application/json; charset=UTF-8",
			            data: JSON.stringify(data),
			            error: function() {
			            	self.setPrinterConnection('failed');
			            }
			        });
			    } else if (response.current.state != 'Connecting') {
			    	if (response.current.state == 'Printing' || response.current.state == 'Paused') {
		        		app.showPrinting();
		        	}

		        	self.setPrinterConnection('connected');
		        } else {
					self.setPrinterConnection('blink-animation');
		        }
            }
        });
	},
	disconnect: function() {
	    $.ajax({
	        url: API_BASEURL + "connection",
	        type: "POST",
	        dataType: "json",
	        contentType: "application/json; charset=UTF-8",
	        data: JSON.stringify({"command": "disconnect"}),
	        success: function(response) {
	        	self.$el.removeClass('connected');
	        }
	    });	
	},
	setServerConnection: function(className) {
		this.$el.find('i.server').removeClass('blink-animation connected failed').addClass(className);
	},
	setPrinterConnection: function(className) {
		this.$el.find('i.printer').removeClass('blink-animation connected failed').addClass(className);
	},
	setAstroprintConnection: function(className) {
		this.$el.find('i.astroprint').removeClass('blink-animation connected failed').addClass(className);
	},
	printerTapped: function(e) {
		if ($(e.target).hasClass('failed')) {
			this.connect();
		}
	},
	serverTapped: function(e) {
		if ($(e.target).hasClass('failed')) {
			this.socketData.reconnect();
			this.connect();
		}
	},
	astroprintTapped: function(e) {
		var icon = $(e.target);
		if (icon.hasClass('failed')) {
			if (LOGGED_IN) {
				icon.addClass('blink-animation');
		        $.ajax({
		            url: API_BASEURL + "boxrouter",
		            method: "POST",
		            dataType: "json",
		            complete: function(response) {
		            	icon.removeClass('blink-animation');
		            }
		        });
		    } else {
		    	$('#login-modal').foundation('reveal', 'open');
		    }
		}
	}
});