//
//  HTML5 PivotViewer
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2013 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

PivotViewer.Utils.loadScript("lib/wicket/wicket.min.js");
PivotViewer.Utils.loadCSS("lib/leaflet/leaflet.css");
PivotViewer.Utils.loadScript("lib/leaflet/leaflet.js");
var markercluster_ok = true;

//IZ:070217
PivotViewer.Utils.loadScript("lib/oms.min.js");
if (markercluster_ok) {
PivotViewer.Utils.loadScript("lib/markercluster/markerclusterer.min.js");
}

///Map View
PivotViewer.Views.MapView = PivotViewer.Views.IPivotViewerView.subClass({
    init: function () {

        this._super();
        this.locCache = [];
        this.map = null;
        this.markers = [];
        this.geometries = [];
        this.overlay;
        this.overlayBaseImageUrl = null;
        this.itemsToGeocode = [];
        this.startGeocode;
        this.geocodeZero;
        this.applyBookmark = false;
        this.mapService = null;
        this.APIKey = null;
        this.geocodeService = null;
        this.hasGeometry = false;
        this.areaValues = [];
        this.areaObj;
        this.buckets = [];
        this.icons = [];
        this.strokeColors = []
        this.iconsSelected = [];
        this.selectedMarker = null;
        this.selectedGeometry = null;
        this.selectedBucket = -1;
        //this.infoWindow = null;

        var that = this;
        $.subscribe("/PivotViewer/Views/Item/Selected", function (evt) {
            if (!that.isActive) return;
            if (that.geometries.length>0) {
                that.selectGeometry(evt.item)
            }else {
                that.selectMarker(evt.item);
            }
        });
    },
    setup: function (width, height, offsetX, offsetY, tileMaxRatio) {
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
        if (Modernizr.localstorage) this.localStorage = true;
        else this.localStorage = false;
        window.mapView = this;
    },
    apiLoaded: function () {
        var that = this;
	    var styles = [
	    {
		featureType: "poi",
		elementType: "labels",
		stylers: [
		    { visibility: "off" }
		]
	    }
	];
	    var map_options = {
            scrollwheel : true,
            styles : styles,
            mapTypeId: 'satellite',
            gestureHandling : "greedy"
	    };
        this.map =  new google.maps.Map(document.getElementById('pv-map-canvas'),map_options );
        //IZ:070217
        this.oms = new OverlappingMarkerSpiderfier(this.map,{
						markersWontMove: true,
						markersWontHide: true,
						keepSpiderfied: true,
						circleSpiralSwitchover: 20
        });
        //this.infoWindow = new google.maps.InfoWindow();
        //this.anchor = new google.maps.Marker();
        if (markercluster_ok) {
						this.markerCluster = new MarkerClusterer(this.map,
				[],
				{
				    imagePath: 'lib/markercluster/images/m',
				    minimumClusterSize: 2,
				    maxZoom: 17
				});
        }
// tw - events for geometry
        this.map.data.addListener('mouseover', function(event) {
            this.map.data.revertStyle();
            this.map.data.overrideStyle(event.feature, {strokeWeight: 8, zindex:1000});
            //that.infoWindow.setContent(event.feature.getProperty("itemName"));
            //var ll = new google.maps.LatLng({lat: that.mouseLat, lng: that.mouseLng});
           // that.anchor.setPosition(ll);
            //that.infoWindow.setPosition({lat: that.mouseLat, lng: that.mouseLng});
            //that.infoWindow.open(this.map, that.anchor);

        });
        /*
        this.mouseLat = 0;
        this.mouseLng = 0;

        this.map.addListener('mousemove', function(event){
            that.mouseLat = event.latLng.lat();
            that.mouseLng = event.latLng.lng();
        })
        */

        this.map.data.addListener('mouseout', function(event) {
            this.map.data.revertStyle();
            //
            // that.infoWindow.close();
        });
        this.map.data.addListener('click', function(event) {
            //alert(event.feature.getProperty('itemID') +' '+ event.feature.getProperty('itemColor'));
            //alert(that.infoWindow.getPosition().lat());
            if(event.feature.getProperty('itemTile')) {
                var t= event.feature.getProperty('itemTile');
                $.publish("/PivotViewer/Views/Item/Selected", [{
                    item: t
                }]);
            }
        });

        this.map.data.addListener('dblclick', function(event) {
            alert(event.feature.getProperty('itemID') +' '+ event.feature.getProperty('itemColor'));

            if(event.feature.getProperty('itemTile')) {
                var t= event.feature.getProperty('itemTile');
                return function(t) {
                    $.publish("/PivotViewer/Views/Item/PopViewer", [{
                        item: t,
                        all: [t],
                        these: []
                    }])(t);
                }
            }
        });


        google.maps.event.addListener(this.map, 'zoom_changed', function () {
            $.publish("/PivotViewer/Views/Item/Updated", null);
            that.getOverlay();
        });
        google.maps.event.addListener(this.map, 'center_changed', function () {
            $.publish("/PivotViewer/Views/Item/Updated", null);
            that.getOverlay();
        });

        if ( options.map_icons != undefined ) {

            var path = options.map_icons.path;

            if ( path == undefined )
            path = "";

            if ( options.map_icons.icons != undefined ) {

            this.icons = [];
            this.iconsSelected = [];
            for ( var i = 0; i < options.map_icons.icons.length; i++ ) {

                var icon = path + options.map_icons.icons[i];
                this.icons.push( icon );
                this.iconsSelected.push( icon );

            }

            }
            if ( options.map_icons.icons_selected != undefined ) {

            var icons_selected = options.map_icons.icons_selected;
            this.iconsSelected = [];
            for ( var i = 0; i < icons_selected.length; i++ )
                this.iconsSelected.push( path +
                             icons_selected[i] );

            }

        } else {

            this.iconsSelected = this.icons = [
            "lib/markercluster/images/photo1.png",
            "lib/markercluster/images/photo2.png",
            "lib/markercluster/images/photo3.png",
            "lib/markercluster/images/photo4.png",
            "lib/markercluster/images/photo5.png",
            "lib/markercluster/images/photo6.png",
            "lib/markercluster/images/photo7.png",
            "lib/markercluster/images/photo8.png",
            "lib/markercluster/images/photo9.png",
            "lib/markercluster/images/photo10.png"
            ];

            this.strokeColors = [
                '#7700FF',
                '#0077FF',
                '#00BBCC',
                '#00AA00',
                '#77FF77',
                '#FFFF00',
                '#FFAA00',
                '#FF5500',
                '#FF0000',
                '#FFAAAA'

            ]
/*
blue to green to yellow to red
 '#0000FF',
 '#00AAFF',
 '#00DDDD',
 '#00AA77',
 '#77AA00',
 '#7FFF00',
 '#FFFF00',
 '#FFAA00',
 '#FF5500',
 '#AA0000'



red to yellow to green to blue
 '#AA0000',
 '#FF5500',
 '#FFAA00',
 '#FFFF00',
 '#7FFF00',
 '#77AA00',
 '#00AA77',
 '#00DDDD',
 '#00AAFF',
 '#0000FF',

* */
            /*this.strokeColors = [
                'red',
                'yellow',
                'lime',
                'magenta',
                'purple',
                'orange',
                'pink',
                'sky',
                'muave',
                'gold',
                'green'
            ]*/
                // this.icons = [
            // 	'lib/leaflet/images/Red.png',
            // 	'lib/leaflet/images/Yellow.png',
            // 	'lib/leaflet/images/DarkGreen.png',
            // 	'lib/leaflet/images/Blue.png',
            // 	'lib/leaflet/images/Purple.png',
            // 	'lib/leaflet/images/Orange.png',
            // 	'lib/leaflet/images/Pink.png',
            // 	'lib/leaflet/images/Sky.png',
            // 	'lib/leaflet/images/Lime.png',
            // 	'lib/leaflet/images/Gold.png',
            // 	'lib/leaflet/images/Green.png'
            // ];
                // this.iconsSelected = [
            // 	'lib/leaflet/images/RedDot.png',
            // 	'lib/leaflet/images/YellowDot.png',
            // 	'lib/leaflet/images/DarkGreenDot.png',
            // 	'lib/leaflet/images/BlueDot.png',
            // 	'lib/leaflet/images/PurpleDot.png',
            // 	'lib/leaflet/images/OrangeDot.png',
            // 	'lib/leaflet/images/PinkDot.png',
            // 	'lib/leaflet/images/SkyDot.png',
            // 	'lib/leaflet/images/LimeDot.png',
            // 	'lib/leaflet/images/GoldDot.png',
            // 	'lib/leaflet/images/GreenDot.png'
            // ];

        }
            this.clearMarkers = function () {
                for (var i = 0; i < this.tiles.length; i++) {
                    var marker = this.tiles[i].marker;
                    if(marker != undefined)
                marker.setMap(null);



                }
    //IZ:070217
                this.markers=[];
                this.oms.clearMarkers();
            };

            this.clearGeometries = function(){

                var theMap = this.map;
                this.map.data.forEach(function(feature) {
                  // If you want, check here for some constraints.
                    theMap.data.remove(feature);
                });

                this.geometries = [];
            };
            this.selectGeometry = function(tile){
                var bucket = that.getBucketNumber(tile);
                if (tile.Geometry==that.selectedGeometry) {
                    var bucket = that.getBucketNumber(tile);
                    that.selectedGeometry = null;

                    that.selectedBucket = -1;
                    $('.pv-toolbarpanel-info').empty();
                    $('.pv-altinfopanel').fadeIn();
                }else{
                    if (bucket instanceof Array) bucket = bucket[0];
                    //tile.marker.setIcon(that.iconsSelected[bucket]);
                    //tile.marker.setZIndex(1000000000);
                    that.selected = tile;
                    if (that.selectedGeometry != null) {
                        //that.selectedMarker.setZIndex(0);
                        //that.selectedMarker.setIcon(that.icons[that.selectedBucket]);
                    }
                    that.selectedGeometry = tile.Geometry;
                    that.selectedBucket = bucket;

                    //that.map.panTo(tile.loc);
                    var bounds = new google.maps.LatLngBounds();
                    tile.Geometry.forEachLatLng(function (latlng) {
                        bounds.extend(latlng);
                    });
                    this.map.fitBounds(bounds);

                    $('.pv-toolbarpanel-info').empty();
                    var toolbarContent = "<img style='height:15px;width:auto' src='" + that.icons[bucket] + "'></img>";
                    if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                        toolbarContent += that.buckets[bucket].startRange;
                    else toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange;
                    $('.pv-toolbarpanel-info').append(toolbarContent);
                    $('.pv-altinfopanel').hide();

                }

            }
            this.selectMarker = function(tile) {
                var bucket = that.getBucketNumber(tile);
                    if (tile.marker == that.selectedMarker) {
                        tile.marker.setIcon(that.icons[bucket]);
                        that.selected = null;
                        that.selectedMarker.setZIndex(0);
                        that.selectedMarker = null;
                        that.selectedBucket = -1;
                        $('.pv-toolbarpanel-info').empty();
                        $('.pv-altinfopanel').fadeIn();

                    }
                    else {
                        if (bucket instanceof Array) bucket = bucket[0];
                        tile.marker.setIcon(that.iconsSelected[bucket]);
                        tile.marker.setZIndex(1000000000);
                        that.selected = tile;
                        if (that.selectedMarker != null) {
                            that.selectedMarker.setZIndex(0);
                            that.selectedMarker.setIcon(that.icons[that.selectedBucket]);
                        }
                        that.selectedMarker = tile.marker;
                        that.selectedBucket = bucket;
                        that.map.panTo(tile.loc);
                        $('.pv-toolbarpanel-info').empty();
                        var toolbarContent = "<img style='height:15px;width:auto' src='" + that.icons[bucket] + "'></img>";
                        if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                            toolbarContent += that.buckets[bucket].startRange;
                        else toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange;
                        $('.pv-toolbarpanel-info').append(toolbarContent);
                        $('.pv-altinfopanel').hide();
                    }

            };

            this.message = "Click for info";
            this.message += "\n" + "Double click to view ";


            this.newGeometry = function(tile){
                //var wkt = new Wkt.Wkt();
                //wkt.read(tile.Geom);
                var props;
                //tile.Geometry = wkt.toObject(props);
                //alert(wkt.write());
                //L.geoJson()

                var substring = "";
                var trackline;
                var polecoord = 85.0;
                var path =[];
                var theMap = this.map;

                if (!tile.Geometry) {
                    if (tile.WKT.indexOf("MULTILINESTRING((") > -1) {
                        var lineParts = [];
                        startidx = tile.WKT.indexOf("MULTILINESTRING((") + 17;
                        endidx = tile.WKT.indexOf("))");
                        substring = tile.WKT.substr(startidx, endidx);

                        //mulitpart
                        var parts = substring.split("),(");
                        parts.forEach(function (part) {
                            coords = part.split(",");
                            path=[];
                            coords.forEach(function (pairs) {
                                pair = pairs.split(" ");
                                if (Math.abs(parseFloat(pair[1])) < polecoord) {
                                    //path.push(new google.maps.LatLng('{lat:' + pair[1] + ',lng:' + pair[0] + '}'));
                                    path.push({lat: parseFloat(pair[1]), lng: parseFloat(pair[0])});
                                }else{
                                    if (parseFloat(pair[1]) > 0 )                        {
                                        path.push({lat: 85.0, lng: parseFloat(pair[0])});
                                    }else{
                                        path.push({lat: -85.0, lng: parseFloat(pair[0])});
                                    }
                                }
                            });
                            //props = { 'strokeColor': this.strokeColors[this.buckets.ids[tile.item.id]]};
                            trackline = new google.maps.Data.LineString(path);
                            lineParts.push(trackline);

                        });

                        var mls = new google.maps.Data.MultiLineString(lineParts);
                        tile.Geometry = mls;
                        this.geometries.push(mls);
                    }

                    if(tile.WKT.indexOf("MULTIPOLYGON (((") > -1 ){
                        var polyParts = [];
                        startidx = tile.WKT.indexOf("MULTIPOLYGON (((") + 16;
                        endidx = tile.WKT.indexOf(")))");
                        substring = tile.WKT.substr(startidx, endidx);

                        //mulitpart
                        var polygons = [];

                        var polys = substring.split(")),((");
                        if (polys.length>1){
                            var xxx = 1;
                        }
                        polys.forEach(function(subparts) {
                            polyParts = [];
                            parts = subparts.split("),(")
                            if (parts.length > 1){
                                xxx = 2;
                            }
                            parts.forEach(function (part) {
                                coords = part.split(",");
                                path = [];
                                coords.forEach(function (pairs) {

                                    pair = pairs.trim().split(" ");
                                    if (Math.abs(parseFloat(pair[1])) < polecoord) {
                                        //path.push(new google.maps.LatLng('{lat:' + pair[1] + ',lng:' + pair[0] + '}'));
                                        //skip the last one.. google doesn't
                                        path.push({lat: parseFloat(pair[1]), lng: parseFloat(pair[0])});
                                    }else{
                                        if (parseFloat(pair[1]) > 0 )                        {
                                            path.push({lat: 85.0, lng: parseFloat(pair[0])});
                                        }else{
                                            path.push({lat: -85.0, lng: parseFloat(pair[0])});
                                        }
                                    }
                                });
                                //props = { 'strokeColor': this.strokeColors[this.buckets.ids[tile.item.id]]};
                                //path.pop();
                                trackline = new google.maps.Data.LinearRing(path);
                                polyParts.push(trackline);

                            });


                            var poly = new google.maps.Data.Polygon(polyParts);
                            polygons.push(poly);
                        });

                        tile.Geometry = new google.maps.Data.MultiPolygon(polygons);



                    }
                }
                //feat.setGeometry(mls);
                this.map.data.add({geometry: tile.Geometry});
                this.geometries.push(tile.Geometry);
                var bids = this.buckets.ids;
                var colorbucket = this.strokeColors;
                var tempmap = this.map;


                this.map.data.forEach(function (feature) {
                    var g = feature.getGeometry();
                    if (g && g == tile.Geometry) {
                        feature.setProperty('itemID', tile.item.id);
                        feature.setProperty('itemColor', colorbucket[bids[tile.item.id]]);
                        feature.setProperty('itemTile', tile);
                        feature.setProperty('itemName',tile.item.name)
                        //tempmap.data.overrideStyle(feature,{'strokeColor',c});

                    }

                });


            };

            this.newMarker = function (tile) {
                tile.marker = new google.maps.Marker({ position: tile.loc,
                               map: this.map,
                               tile: tile,
                               title: this.message
                             });
            tile.marker.setIcon(this.icons[this.buckets.ids[tile.item.id]]);
            var timer = null; // Single click timeout.

                google.maps.event.addListener(tile.marker,
                          "click",
                          (function (tile) {
                            return function () {
                                if ( timer != null )
                                    clearTimeout( timer )
                                timer = 
                                    setTimeout(
                                    function () {
                                        $.publish("/PivotViewer/Views/Item/Selected", [{
                                            item: tile}
                                        ]);
                                    }
                                )
                            }

                          })(tile));

            //spl:072117 Double click handler
            google.maps.event.addListener(tile.marker,
                          "dblclick",
                          (function (tile,markers,oms) {
                              return function() {

                              // Get the neighborhood
                              var near =
                                  oms.markersNearAnyOtherMarker();
                              // Get all the tiles.
                              var all = [];
                              for ( var i = 0; i < markers.length; i++ )
                                  all.push( markers[i].tile.item );
                              // Get the tiles in
                              // the neighborhoord
                              var these = [];
                              for ( var i = 0; i < near.length; i++ )
                                  these.push( near[i].tile.item );

                              $.publish("/PivotViewer/Views/Item/PopViewer", [
                                  {
                                  item: tile,
                                  all: all,
                                  near: these
                                  }
                              ]);
                              }
                          })(tile,this.markers,this.oms));

    //IZ:070217

               this.markers.push(tile.marker);
               this.oms.addMarker(tile.marker);
            }

            this.refitBounds = function () {
                //alert('refit ' + this.geometries.length);
                var markerPos = [];

                for (i = 0; i < this.filterList.length; i++) {
                    //extend the bounds to include each marker's position
                    var tile = this.filterList[i];
                    if (tile.marker && tile.marker != undefined) markerPos.push(tile.marker.getPosition());
                }
                var bounds = new google.maps.LatLngBounds();
                markerPos.forEach(function (latlng) {
                    bounds.extend(latlng);

                });
                //var bounds = new google.maps.LatLngBounds();
                //if (this.map.data.features) alert (this.map.data.features.length);

                this.map.data.forEach(function (feature) {
                    // If you want, check here for some constraints.
                    //this.map.data.remove(feature);
                    //var gg = feature.getGeometry();
                    if (feature.getGeometry()) {
                        feature.getGeometry().forEachLatLng(function (latlng) {
                            bounds.extend(latlng);
                        });
                    }

                });
                /*
                 wkt = new Wkt.Wkt();
                 for (i = 0; i < this.filterList.length; i++) {
                 //extend the bounds to include each marker's position
                 var tile = this.filterList[i];
                 if (tile.loc != undefined && (Settings.showMissing || !tile.missing)) bounds.extend(tile.marker.position);


                 //tw work with WKT geometries
                 if (tile.Geometry != undefined){

                 var geobounds = new google.maps.LatLngBounds();
                 obj = tile.Geometry;
                 if (Wkt.isArray(obj)) { // Distinguish multigeometries (Arrays) from objects

                 for (ii in obj) {
                 if (obj.hasOwnProperty(ii) && !Wkt.isArray(obj[ii])) {
                 if(wkt.type === 'point' || wkt.type === 'multipoint')
                 geobounds.extend(obj[ii].getPosition());
                 //else
                 //obj[ii].getPath().forEach(function(element,index){
                 //alert(element.toString());
                 //     geobounds.extend(element)
                 //alert(geobounds.toString()+'\n'+ii+'\n'+obj.length+);
                 //});

                 }
                 }

                 } else {
                 if(wkt.type === 'point' || wkt.type === 'multipoint')
                 geobounds.extend(obj.getPosition());
                 else
                 obj.getPath().forEach(function(element,index){geobounds.extend(element)});
                 }
                 bounds.extend(geobounds.getNorthEast());
                 bounds.extend(geobounds.getSouthWest());


                 }

                 }
                 */
                //now fit the map to the newly inclusive bounds
                if (bounds.isEmpty()) bounds.extend({lat:-80,lng:-1}).extend({lat:80,lng:1})
                this.map.fitBounds(bounds);


            }

            this.getOverlay = function () {
                if (this.overlayBaseImageUrl != null) {
            // Get the boundary and use to get image to overlay
            var mapBounds = this.map.getBounds();
            if (mapBounds) {
                    var southWest = mapBounds.getSouthWest();
                    var northEast = mapBounds.getNorthEast();
                    var width = $('#pv-map-canvas').width();
                    var height = $('#pv-map-canvas').height();
                    if (this.overlay)

			this.overlay.setMap(null);
                    var overlayImageUrl =
			this.overlayBaseImageUrl+ "&bbox=" + southWest.lng() + "," + southWest.lat() + "," + northEast.lng() + "," + northEast.lat() + "&width=" + width + "&height=" + height ;
                    this.overlay =
			new google.maps.GroundOverlay (overlayImageUrl, mapBounds, {opacity: 0.4});


                    this.overlay.setMap(this.map);
                }
            }
        }
	    
        $('.pv-mainpanel').append("<div class='pv-altinfopanel' id='pv-altinfopanel'></div>");
        $('.pv-altinfopanel').css('left', (($('.pv-mainpanel').offset().left + $('.pv-mainpanel').width()) - 205) + 'px').css('height', $(window).height() - $('.pv-toolbarpanel').height() - 58 + 'px');



        this.activate();
    },
    setOptions: function (options) {
        $('.pv-viewpanel').append("<div class='pv-mapview-canvas' id='pv-map-canvas'></div>");
        if (options.MapService == undefined || options.MapService.toLowerCase() != "openstreetmap") {
            this.APIKey = options.GoogleAPIKey != undefined ? options.GoogleAPIKey : "AIzaSyAnPWLPKMYKQZa2g1p11d_vllwwT7CFdQg";
            this.mapService = "google";
            PivotViewer.Utils.loadScript("lib/wicket/wicket-gmap3.min.js");
            if (options.GeocodeService == "Google") this.geocodeService = "Google";
            else GeocodeService = "Nominatim"
        }
        else {
            this.mapService = "openstreetmap";
            this.geocodeService = "Nominatim";
            PivotViewer.Utils.loadScript("lib/wicket/wicket-leaflet.min.js");

            this.map = new L.Map(document.getElementById('pv-map-canvas'));

            // create the tile layer with correct attribution
            var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            var osmAttrib = 'Map data © OpenStreetMap contributors';
            this.osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
            this.map.addLayer(this.osm);

            // create the icon set
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Red.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Yellow.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/DarkGreen.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Blue.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Purple.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Orange.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Pink.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Sky.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Lime.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Gold.png' } }));
            this.icons.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/Green.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/RedDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/YellowDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/DarkGreenDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/BlueDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/PurpleDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/OrangeDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/PinkDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/SkyDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/LimeDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/GoldDot.png' } }));
            this.iconsSelected.push(L.Icon.Default.extend({ options: { iconUrl: 'lib/leaflet/images/GreenDot.png' } }));
            var that = this;
            this.map.on('zoomend', function (e) {
                $.publish("/PivotViewer/Views/Item/Updated", null);
                that.getOverlay();
            });
            this.map.on('moveend', function (e) {
                $.publish("/PivotViewer/Views/Item/Updated", null);
                that.getOverlay();
            });

			
            this.clearMarkers = function () {
                for (var i = 0; i < this.tiles.length; i++) {
                    var marker = this.tiles[i].marker;
                    if(marker != undefined) this.map.removeLayer(marker);
                }

//IZ:070317
                this.markers=[];
                this.oms.clearMarkers();
            }

            this.selectMarker = function (tile) {
                var bucket = that.getBucketNumber(tile);
                if (tile.marker == that.selectedMarker) {
                    tile.marker.setIcon(new that.icons[bucket]);
                    that.selected = null;
                    that.selectedMarker.setZIndexOffset(0);
                    that.selectedMarker = null;
                    that.selectedBucket = -1;
                    $('.pv-toolbarpanel-info').empty();
                    $('.pv-altinfopanel').fadeIn();
                }
                else {
                    tile.marker.setIcon(new that.iconsSelected[bucket]);
                    tile.marker.setZIndexOffset(1000000000);
                    that.selected = tile;
                    if (that.selectedMarker != null) {
                        that.selectedMarker.setIcon(new that.icons[that.selectedBucket]);
                        that.selectedMarker.setZIndexOffset(0);
                    }
                    that.selectedMarker = tile.marker;
                    that.selectedBucket = bucket;
                    that.map.panTo(tile.loc);
                    $('.pv-toolbarpanel-info').empty();
                    var toolbarContent = "<img style='height:15px;width:auto' src='" + tile.marker._icon.src + "'></img>";
                    if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                        toolbarContent += that.buckets[bucket].startRange;
                    else toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange;
                    $('.pv-toolbarpanel-info').append(toolbarContent);
                    $('.pv-altinfopanel').hide();

                }
            }

            this.newMarker = function (tile) {
                tile.marker = new L.Marker(tile.loc, { title: tile.item.name });
                this.map.addLayer(tile.marker);
                tile.marker.setIcon(new this.icons[this.buckets.ids[tile.item.id]]);
                tile.marker.on('click', (function (tile) {
                    return function () {$.publish("/PivotViewer/Views/Item/Selected", [{ item: tile}]);}
                })(tile));
                return tile.marker;
            }

            this.refitBounds = function () {
                var markerPos = [];

                for (i = 0; i < this.filterList.length; i++) {
                    //extend the bounds to include each marker's position
                    var tile = this.filterList[i];
                    if(tile.marker != undefined) markerPos.push(tile.marker.getLatLng());
                }
                var bounds = new L.LatLngBounds(markerPos);

                this.map.data.forEach(function(feature) {
                    // If you want, check here for some constraints.
                    //this.map.data.remove(feature);
                    var g = feature.getGeometry();
                    g.forEachLatLng(latlng)
                    {
                        bounds.extend(latlng);
                    }

                });

                //now fit the map to the newly inclusive bounds
                this.map.fitBounds(bounds);
            }

            this.getOverlay = function () {
                // Get the boundary and use to get image to overlay
                var mapBounds = this.map.getBounds();
                var west = mapBounds.getWest();
                var east = mapBounds.getEast();
                var north = mapBounds.getNorth();
                var south = mapBounds.getSouth();
                var mapSize = this.map.getSize();
                var width = mapSize.x;
                var height = mapSize.y;
                if (this.overlayBaseImageUrl != null) {
                    if (this.overlay && this.map.hasLayer(this.overlay)) this.map.removeLayer(this.overlay);
                    var overlayImageUrl = this.overlayBaseImageUrl+ "&bbox=" + west + "," + south + "," + east + "," + north + "&width=" + width + "&height=" + height ;
                    this.overlay = new L.imageOverlay (overlayImageUrl, mapBounds, {opacity: 0.4});
                    this.overlay.addTo(this.map);
                }
            }
        }
        if (options.MapOverlay != undefined) this.overlayBaseImageUrl = options.MapOverlay;
    },
    activate: function () {
        if (!Modernizr.canvas) return;
        if (this.mapService == "google" && this.map == null) {
            PivotViewer.Utils.loadScript("https://maps.googleapis.com/maps/api/js?key=" + this.APIKey + "&sensor=false&callback=mapView.apiLoaded");
        }
        else this._super();
        $('.pv-toolbarpanel-info').fadeIn();
        $('.pv-altinfopanel').fadeIn();
        $('.pv-toolbarpanel-zoomcontrols').hide();
        $('.pv-toolbarpanel-zoomcontrols').css('border-width', '0');
        $('#MAIN_BODY').css('overflow', 'auto');
        $('.pv-mapview-canvas').fadeIn();
        $('.pv-toolbarpanel-sort').fadeIn();
        if(this.map != null) {
            this.refitBounds();
            // spl:091117 There appears to be a bug in how marker clusters
            // get repainted.
            
            //<https://stackoverflow.com/questions/20861402/markers-not-showing-until-map-moved-slightly-or-clicked>
            
            // This hack attempts to fix the issue until the author
            // manages to actually repair it
            this.markerCluster.repaint();
            var that = this;
            setTimeout( function() {
                that.markerCluster.repaint();
            }, 500 );
        }
    },
    deactivate: function () {
        this._super();
        $('.pv-altinfopanel').fadeOut();
        $('.pv-toolbarpanel-info').fadeOut();
        $('.pv-mapview-canvas').fadeOut();
        $('.pv-toolbarpanel-sort').fadeOut();
    },
    getBucketNumber: function (tile) {
        var bkt = this.buckets.ids[tile.item.id];
        return bkt != undefined ? bkt : -1;
    },
    bucketize: function (tiles, filterList, orderBy) {
        category = PivotCollection.getCategoryByName(orderBy);
        if (filterList[0].item.getFacetByName(orderBy) == undefined)
            return [{ startRange: "(no info)", endRange: "(no info)", tiles: [filterList[0]], values: ["(no info)"], startLabel: "(no info)", endLabel: "(no info)" }];

        var min = filterList[0].item.getFacetByName(orderBy).values[0].value;
        for (var i = filterList.length - 1; i > 0; i--) {
            if (filterList[i].item.getFacetByName(orderBy) != undefined) break;
        }
        var max = filterList[i].item.getFacetByName(orderBy).values[0].value;

        if (category.isDateTime()) {
            //Start with biggest time difference
            min = new Date(min); max = new Date(max);
            if (max.getFullYear() - min.getFullYear() + min.getFullYear() % 10 > 9) {
                return PivotViewer.Utils.getBuckets(filterList, orderBy,
                    function (value) { var year = new Date(value.value).getFullYear(); return (year - year % 10); },
                    function (value) { var year = new Date(value.value).getFullYear(); return (year - year % 10) + "s"; }
                );
            }
            else if (max.getFullYear() > min.getFullYear())
                return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getFullYear(); },
                    function (value) { return new Date(value.value).getFullYear().toString(); });
            else if (max.getMonth() > min.getMonth())
                return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getMonth(); },
                    function (value) { var date = new Date(value.value); return PivotViewer.Utils.getMonthName(date) + " " + date.getFullYear(); });
            else if (max.getDate() > min.getDate())
                return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getDate(); },
                    function (value) { var date = new Date(value.value); return PivotViewer.Utils.getMonthName(date) + " " + date.getDate() + ", " + date.getFullYear(); });
            else if (max.getHours() > min.getHours())
                return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getHours(); },
                    function (value) {
                        var date = new Date(value.value);
                        return PivotViewer.Utils.getMonthName(date) + " " + date.getDate() + ", " + date.getFullYear() + " " + PivotViewer.Utils.getHour(date) + " " + PivotViewer.Utils.getMeridian(date);
                    });
            else if (max.getMinutes() > min.getMinutes())
                return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getMinutes(); },
                    function (value) {
                        var date = new Date(value);
                        return PivotViewer.Utils.getMonthName(date) + " " + date.getDate() + ", " + date.getFullYear() + " " + PivotViewer.Utils.getHour(date) + ":" + date.getMinutes() + " " + PivotViewer.Utils.getMeridian(date);
                    });
            else return PivotViewer.Utils.getBuckets(filterList, orderBy, function (value) { return new Date(value.value).getSeconds(); },
                function (value) {
                    var date = new Date(value.value);
                    return PivotViewer.Utils.getMonthName(date) + " " + date.getDate() + ", " + date.getFullYear() + " " + PivotViewer.Utils.getHour(date) + ":" + date.getMinutes() + "::" + date.getSeconds() + " " + PivotViewer.Utils.getMeridian(date);
                });
        }
        return PivotViewer.Utils.getBuckets(filterList, orderBy);
        //Got rid of multiple values for now
    },
    filter: function () {
        var that = this;
        var g = 0;  //keeps track of the no. of geocode locations;
        this.buckets = this.bucketize(this.tiles, this.filterList, this.sortCategory);

        //Clear legend info in toolbar
        $('.pv-toolbarpanel-info').empty();
        if (this.selected == null) $('.pv-altinfopanel').fadeIn();

        //Check for geometry facet
        //This should contain a geometry definition im WKT that applies to the whole collection
        //E.g. where a geometry filterList has been applied
        /*
        for(var i = 0; i < PivotCollection.categories.length; i++) {
            var category = PivotCollection.categories[i];
            if (category.name.toUpperCase().indexOf("GEOMETRY") >= 0) {
                for (j = 0; j < this.filterList.length; j++) {
                    var facet = this.filterList[j].item.getFacetByName(category.name);
                    if (facet == undefined) continue;
                    this.geometryValue = facet.values[0].value;
                    break;
                }
                if (j < this.filterList.length) break;
            }
        }

        //Check for area facet
        for (var i = 0; i < PivotCollection.categories.length; i++) {
            var category = PivotCollection.categories[i];
            if (category.name.toUpperCase().indexOf("AREA") >= 0) {
                for (j = 0; j < this.filterList.length; j++) {
                    var facet = this.filterList[j].item.getFacetByName(category.name);
                    if (facet == undefined) continue;
                    this.areaValues.push({ id: this.filterList[j].item.id, area: facet.values[0].value });
                    break;
                }
            }
        }
        */

        var category, category1 = null, category2 = null, geomcategory=null;
        for (var i = 0; i < PivotCollection.categories.length; i++) {
            var category = PivotCollection.categories[i], name = category.name.toLowerCase();
            if (category.isLocation()) {
                if (category.uiInit == false) PV.initUICategory(category);
                break;
            }
            // tw 091117
            // support for WKT geometries

            if (name.indexOf("geometry") >= 0) geomcategory = category;
            if (name.indexOf("latitude") >= 0) category1 = category;
            else if (name.indexOf("longitude") >= 0) category2 = category;
            if (category1 != null && category2 != null) {
                if (category1.uiInit == false) PV.initUICategory(category1);
                if (category2.uiInit == false) PV.initUICategory(category2);
                break;
            }
            if(geomcategory != null){
                this.hasGeometry = true;
                if (geomcategory.uiInit==false) PV.initUICategory(geomcategory);
            }

        }

        for (var i = 0; i < this.filterList.length; i++) {
            var tile = this.filterList[i], c;

            if (!Settings.showMissing && tile.missing) continue;
            //Have we cached the item location?
            if (tile.loc == undefined) {
                //First try to get co-ordinate information from the facets
                var facet1 = null, facet2 = null;
                if (category1 != null && category2 != null) {
                    facet1 = tile.item.getFacetByName(category1.name);
                    facet2 = tile.item.getFacetByName(category2.name);

                    if (facet1 != undefined && facet2 != undefined) {
                        var latitude = facet1.values[0].value;
                        var longitude = facet2.values[0].value;

                        if (longitude != null && latitude != null) {
                            if (typeof latitude == "string") latitude = parseFloat(latitude);
                            if (typeof longitude == "string") longitude = parseFloat(longitude);
                            if (!isNaN(longitude) && !isNaN(latitude)) tile.loc = new L.LatLng(latitude, longitude);
                        }
                    }
                }
                else if (category != null) {
                    var facet = tile.item.getFacetByName(category.name);
                    if (facet == undefined) continue;
                    var value = facet.values[0].value;
                    if (value.toLowerCase().indexOf("point(") == 0) {
                        var longitude = parseFloat(value.substring(6, value.indexOf(' ', 6) - 6));
                        var latitude = parseFloat(value.substring(value.indexOf(' ', 6) + 1, value.indexOf(')') - (value.indexOf(' ') + 1)));
                        if (!isNaN(latitude) && !isNaN(longitude)) tile.loc = new L.LatLng(latitude, longitude);
                    }
                    else if (value.indexOf(",") > -1) {
                        //Could be a co-ordinate pair
                        var latitude = parseFloat(value.substring(0, value.indexOf(',')));
                        var longitude = parseFloat(value.substring(value.indexOf(',')));
                        if (!isNaN(latitude) && !isNaN(longitude)) tile.loc = new L.LatLng(latitude, longitude);
                        else if (value.length > 1) {
                            var geoLoc = value.toUpperCase();
                            // Is it in the cache?
                            if (this.locCache[geoLoc] != undefined) tile.loc = this.locCache[geoLoc];
                            else if (false) {
                                // Now try the users persistent cache
                                var loc = JSON.parse(localStorage.getItem(geoLoc));
                                if (loc) {
                                    var latitude = parseFloat(loc.latitude);
                                    var longitude = parseFloat(loc.longitude);
                                    if (!isNaN(latitude) && !isNaN(longitude)) {
                                        tile.loc = new L.LatLng(latitude, longitude);
                                        this.locCache[geoLoc] = loc;
                                    }
                                }
                            }
                            // it's auto geocoding... don't want it to do that.
                            else if(false) {
                                // Not in local or persistent cache so will have to use geocode service
                                if (g < 1000) {//limiting the number of items to geocode at once to 1000 for now
                                    if (this.itemsToGeocode[geoLoc] == undefined) {
                                        this.itemsToGeocode[geoLoc] = [];
                                        g++;
                                    }
                                    this.itemsToGeocode[geoLoc].push(tile);
                                }
                            }
                        }
                    }
                }
            }
            // tw 091117
            // support for WKT geometries

            if(tile.WKT == undefined){

                if(geomcategory != null){
                    facet1 = tile.item.getFacetByName(geomcategory.name);
                    //alert(facet1);
                    var geom = facet1.values[0].value;
                    geom = geom.replace(/, /g,",");

                    //var wkt = new Wkt.Wkt();
                    //try { wkt.read(geom); }
                    //catch (e1) {
                    //    try { wkt.read(geom.replace('\n', '').replace('\r', '').replace('\t', '')); }
                    //    catch (e2) {
                    //        if (e2.name === 'WKTError')
                    //            Debug.log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                    //    }

                    //}

                    tile.WKT = geom;
                    //alert(geom);


                }

            }

        }
        if (g > 0) this.getLocationsFromNames();
        $('.pv-mapview-canvas').css('height', this.height - 12 + 'px');
        $('.pv-mapview-canvas').css('width', this.width - 415 + 'px');

        this.createMap();
    },
    getButtonImage: function () {return 'images/MapView.png';},
    getButtonImageSelected: function () {return 'images/MapViewSelected.png';},
    getViewName: function () { return 'Map View'; },
    makeGeocodeCallBack: function(locName) {
        var that = this;

        var geocodeCallBack = function(data) {
          results = data.results;
          status = data.status;
            var loc = new L.LatLng(0, 0);

            if (status == google.maps.GeocoderStatus.OK) {
                var googleLoc = results[0].geometry.location;
                var lat = googleLoc.lat;
                var long = googleLoc.lng;
                if (lat && long) loc = new L.LatLng(lat, long);
            }

            // Add to local cache
            that.locCache[locName] = loc;

            // Add to persistent cache
            if (that.localStorage) localStorage.setItem(locName, JSON.stringify(loc));

            // Find items that have that location
            for (var i = 0; i < that.itemsToGeocode[locName].length; i++) {
                that.itemsToGeocode[locName][i].loc = loc;
            }
            delete that.itemsToGeocode[locName];

            // If geocoding has taken more than 20 secs then try to set
            // the bookmark.  Otherwise, if the time taken is more than
            // 2 secs make the pins we have so far
            var now = new Date();
            if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                that.redrawMarkers();
                that.startGeocode = new Date();
            }
            else if ((now.getTime() - that.startGeocode.getTime()) / 1000 > 2) {
                that.redrawMarkers();
                that.refitBounds();
                that.getOverlay();
                that.startGeocode = new Date();
            }

            if(Object.keys(that.itemsToGeocode).length == 0) that.createMap();
        }
        /*
        if (this.geocodeService == "Google"){
            var geocodeCallBack = function(results, status) {
                var loc = new L.LatLng(0, 0);

                if (status == google.maps.GeocoderStatus.OK) {
                    var googleLoc = results[0].geometry.location;
                    var lat = googleLoc.lat();
                    var long = googleLoc.lng();
                    if (lat && long) loc = new L.LatLng(lat, long);
                }

                // Add to local cache
                that.locCache[locName] = loc;

                // Add to persistent cache
                if (that.localStorage) localStorage.setItem(locName, JSON.stringify(loc));

                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode[locName].length; i++) {
                    that.itemsToGeocode[locName][i].loc = loc;
                }
                delete that.itemsToGeocode[locName];

                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                    that.redrawMarkers();
                    that.startGeocode = new Date();
                }
                else if ((now.getTime() - that.startGeocode.getTime()) / 1000 > 2) {
                    that.redrawMarkers();
                    that.refitBounds();
                    that.getOverlay();
                    that.startGeocode = new Date();
                }

                if(Object.keys(that.itemsToGeocode).length == 0) that.createMap();
            }
        }
        else {
            var geocodeCallBack = function (xml) {
                var loc = new L.LatLng(0, 0);
                var results = $(xml).find("searchresults");
                var place = $(xml).find("place");

                if (place) {
                    var lat = $(place).attr("lat");
                    var lon = $(place).attr("lon");
                    if (lat && lon) loc = new L.LatLng(lat, lon);
                }

                that.locCache[place] = loc;

                // Add to persistent cache
                if (that.localStorage) localStorage.setItem(locName, JSON.stringify(loc));

                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode[locName].length; i++) {
                    that.itemsToGeocode[locName][i].loc = loc;
                }
                delete that.itemsToGeocode[locName];

                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime()) / 1000 > 20) {
                    that.redrawMarkers();
                    that.startGeocode = new Date();
                }
                else if ((now.getTime() - that.startGeocode.getTime()) / 1000 > 2) {
                    that.redrawMarkers();
                    that.refitBounds();
                    that.getOverlay();
                    that.startGeocode = new Date();
                }

                if (Object.keys(that.itemsToGeocode).length == 0) that.createMap();
            }

        }*/
        return geocodeCallBack;
    },
    geocode: function (locName, callbackFunction) {
      var that = this;
      var nominatimUrl = "http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=" + encodeURIComponent(locName);
      $.ajax({
          type: "GET",
          url: nominatimUrl,
          dataType: 'jsonp',
          success: function(data){
            callbackFunction(data);
          }
      });
      /*
        if (this.geocodeService == "Google"){
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( {address: locName}, this.makeGeocodeCallBack(locName));
        }
        else {
            var that = this;
            var nominatimUrl = "http://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(locName) + "&format=xml";
            $.ajax({
                type: "GET",
                url: nominatimUrl,
                success: callbackFunction
            });
        }*/
    },
    getLocationsFromNames: function () {
        for (var e = 0; e < Object.keys(this.itemsToGeocode).length; e++) {
            var t = Object.keys(this.itemsToGeocode)[e];
            this.geocode(t, this.makeGeocodeCallBack(t))
        }
        this.startGeocode = new Date();
        this.startGeocode.setSeconds(this.startGeocode.getSeconds() + 2);
        this.geocodeZero = new Date();
    },
    createMap: function () {
        //Add geometry to map using wicket library for reading WKT
        /*
        if (this.geometryValue != null) {
            var wkt = new Wkt.Wkt();
            try { wkt.read(this.geometryValue); }
            catch (e1) {
                try { wkt.read(this.geometryValue.replace('\n', '').replace('\r', '').replace('\t', '')); }
                catch (e2) {
                    if (e2.name === 'WKTError')
                        Debug.log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                }
            }

            var obj = wkt.toObject(this.map.defaults);
            if (Wkt.isArray(obj)) {
                for (var o = 0; o < obj.length; o++) {
                    this.map.addLayer(obj[o]);
                }
            }
            else this.map.addLayer(obj);
        }*/

        this.createMarkers();
        this.createGeometries();
        this.refitBounds();
        this.getOverlay();

        this.createLegend();
    },
    createGeometries: function(){
        if(this.clearGeometries) this.clearGeometries();
        //alert (this.filterList.length+' vs '+this.tiles.length);
        //alert(this.filterList[0].Geom);
        if (this.tiles.length > 1000 && this.filterList.length==this.tiles.length) {
            // do not draw

        }else{

            for (i = 0; i < this.filterList.length; i++) {
                var tile = this.filterList[i];
                if (tile.WKT != undefined && (Settings.showMissing || !tile.missing))
                    this.newGeometry(tile);

            }
            this.map.data.setStyle(function (feature) {
                var color = 'gray';
                if (feature.getProperty('itemColor')) {
                    color = feature.getProperty('itemColor');
                }
                return /** @type {google.maps.Data.StyleOptions} */({
                    fillColor: color,
                    strokeColor: color,
                    strokeWeight: 2
                });
            });
        }

    },
    createMarkers: function () {
        //if(this.clearMarkers)
	    //this.clearMarkers();

        //spl:071517 Removed redundant clearing of individual markers.

        //IZ:070317

        if (markercluster_ok) {
                this.markerCluster.clearMarkers();
        }
        this.clearMarkers();

        for (i = 0; i < this.filterList.length; i++) {
            var tile = this.filterList[i];
            if(tile.loc != undefined && (Settings.showMissing || !tile.missing))
                this.newMarker(tile);

        }

        //spl:071517 Moved instantiation to apiLoaded.
        if (markercluster_ok) {
            this.markerCluster.addMarkers( this.markers, false );
        }
    },
    drawArea: function () {
        var areaValue;
        var areaWkt = new Wkt.Wkt();

        //clear existing area object
        if (this.areaObj)
            this.map.removeLayer(this.areaObj);
        for (var i = 0; i < this.areaValues.length; i++) {
            if (this.areaValues[i].id == this.selected.item.id) {
                areaValue = this.areaValues[i].area;
                break;
            }
        }
        if (areaValue) {
            var geometryOK = true;
            try { // Catch any malformed WKT strings
                areaWkt.read(areaValue);
            }
            catch (e1) {
                try {
                    areaWkt.read(areaValue.replace('\n', '').replace('\r', '').replace('\t', ''));
                }
                catch (e2) {
                    if (e2.name === 'WKTError') {
                        Debug.log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                        geometryOK = false;
                    }
                }
            }
            if (geometryOK) {
                this.areaObj = areaWkt.toObject({color:'#990000',fillColor:'#EEFFCC',fillOpacity:0.6});
                if (Wkt.isArray(this.areaObj)) {
                    for (var o = 0; o < this.areaObj.length; o++) {
                        this.map.addLayer(this.areaObj[o]);
                    }
                }
                else this.map.addLayer(this.areaObj);
            }
        }
    },
    redrawMarkers: function () {
        this.createMarkers();
        this.drawArea();
    },
    createLegend: function() {
        // Get width of the info panel (width of icon image = 30 )
        var width = $('.pv-altinfopanel').width() - 32;
        $('.pv-altinfopanel').empty();
        $('.pv-altinfopanel').append("<div class='pv-legend-heading' style='height:28px' title='" + this.sortCategory + "'>" + this.sortCategory + "</div>");
        var tableContent = "<table id='pv-legend-data' style='color:#484848;'>";
        if (this.hasGeometry && this.geometries.length==0){
            tableContent += "<tr><td>There are too many features in this data set to draw all at once. Please select one or more facet categories on the left to draw the associated features</div></td>";
        }else {
            for (var i = 0; i < this.buckets.length; i++) {
                if (this.hasGeometry) {
                    tableContent += "<tr><td width='25' height='25'><div style='width: 100%; height: 100%; background-color: " + this.strokeColors[i] + "'></div></td>";

                } else {
                    var iconFile = this.mapService == "google" ? this.icons[i] : (new this.icons[i]).options.iconUrl;
                    tableContent += "<tr><td><img src='" + iconFile + "'></img></td>";
                }
                if (this.buckets[i].startRange == this.buckets[i].endRange)
                    tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startLabel + "</div></td></tr>";
                else tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startLabel + " to " + this.buckets[i].endLabel + "</div></td></tr>";
                
            }
            tableContent += "<tr><td colspan='2'></hr> *Click items on the map to see details.</td></tr>"
        }
        
        tableContent +="</table>";
         // don't draw legend when one item is faceted - show the item instead
        //alert(document.getElementById('pv-toolbarpanel-countbox').innerHTML);
       
        $('.pv-altinfopanel').append(tableContent);
        if (document.getElementById('pv-toolbarpanel-countbox').innerHTML == "1") {
        
            //document.getElementById('pv-altinfopanel').style.display='none';
            setTimeout(function(){
                //alert('going to do it')
                $('.pv-altinfopanel').hide();
            }, 300);

        }
    }
});
//# sourceURL=mapview.js
//@ sourceURL=mapview.js
