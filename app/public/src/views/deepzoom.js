//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2014 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Deep Zoom Image Getter
/// Retrieves and caches images
///
PivotViewer.Views.DeepZoomImageController = PivotViewer.Views.IImageController.subClass({
    init: function() {
        this._items = [];
        this._itemsById = [];
        this._collageItems = [];
        this.baseUrl = "";
        this._collageMaxLevel = 0;
        this._collageItemOverlap = 1;
        this._tileSize = 256;
        this._format = "";
        this._ratio = 1;
        this.MaxRatio = 0;

        this._dziQueue = [];
        this._zooming = false;
        this._max_sprite_level = -1;
        this._sprite_index = [];
        this._sprite_sheet_url = [];
        this._sprite_sheet_loaded = [];
        this._sprite_sheet = [];

        var that = this;

        //Events
        $.subscribe("/PivotViewer/ImageController/Zoom", function(evt) {
            that._zooming = evt;
        });
    },
    setup: function(deepzoomCollection) {
        //get base URL
        this.baseUrl = deepzoomCollection.substring(0, deepzoomCollection.lastIndexOf("/"));
        this._collageUrl = deepzoomCollection.substring(deepzoomCollection.lastIndexOf("/") + 1).replace('.xml', '_files');
        this.getSpriteIndex(deepzoomCollection, this.getDeepzoom);
    },
    getSpriteIndex: function(deepzoomCollection, callback) {
        this._dzc = deepzoomCollection;
        this._cb = callback;
        this._the_other = that;
        var that = this;

        $.ajax({
            type: "GET",
            url: this.baseUrl + "/sprite.idx",
            dataType: "xml",
            success: function(xml) {

                var sprite_index = $(xml).find("SpriteIndex");
                that._max_sprite_level = $(sprite_index).attr("maxdepth");

                var tiles = $(sprite_index).find("Tile");

                for (var t = 0; t < tiles.length; t++) {

                    var tile = tiles[t];
                    var params = [];

                    var tile_params = $(tile).find("TileParams");

                    for (var p = 0; p < tile_params.length; p++) {

                        var tile_param = tile_params[p];

                        params[$(tile_param).attr("level")] = {
                            width: $(tile_param).attr("width"),
                            height: $(tile_param).attr("height")
                        };

                    }

                    that._sprite_index[$(tile).attr("object")] = {
                        x: $(tile).attr("x"),
                        y: $(tile).attr("y"),
                        params: params
                    };

                }

                var sprite_sheets = $(xml).find("SpriteSheet");

                for (var ss = 0; ss < sprite_sheets.length; ss++) {

                    var sprite_sheet = sprite_sheets[ss];

                    var level = $(sprite_sheet).attr("index");
                    that._sprite_sheet_url[level] =
                        that.baseUrl + "/" + $(sprite_sheet).attr("sprite");

                    var img = new Image();
                    img.src = that._sprite_sheet_url[level];

                }
                that._cb(that._dzc);


            },
            error: function(jqXHR, textStatus, errorThrown) {

                // Not really an error. A sprite.idx just wasn't
                // created. We just happily proceed.

                that._cb(that._dzc);

            }

        });
    },
    getDeepzoom: function(deepzoomCollection) {
        var that = this;
        //load dzi and start creating array of id's and DeepZoomLevels
        $.ajax({
            type: "GET",
            url: deepzoomCollection,
            dataType: "xml",
            success: function(xml) {
                var collection = $(xml).find("Collection");
                that._tileSize = $(collection).attr("TileSize");
                that._format = $(collection).attr('Format');
                //save image format into PARA for annotation
                _options.imageFormat = that._format;
                that._collageMaxLevel = $(collection).attr('MaxLevel');
                var overlap = $(collection).attr('ItemOverlap');
                that._collageItemOverlap =
                    ((overlap != undefined) &&
                        (overlap != null)) ? overlap : 1;
                that._tileSize -= 2 * that._collageItemOverlap;
                var image_src = $(collection).attr('ImageSrc');
                if ((image_src != undefined) &&
                    (image_src != null))
                    that.baseUrl = image_src;

                var items = $(xml).find("I");
                if (items.length == 0) {
                    $('.pv-loading').remove();

                    //Throw an alert so the user knows something is wrong
                    var msg = 'No items in the DeepZoom Collection<br><br>';
                    msg += 'URL        : ' + this.url + '<br>';
                    msg += '<br>SuAVE cannot continue until this problem is resolved<br>';
                    $('.pv-wrapper').append("<div id=\"pv-dzloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    setTimeout(function() {
                        window.open("#pv-dzloading-error", "_self")
                    }, 1000)
                    return;
                }

                //If collection itself contains size information, use first one for now
                var dzcSize = $(items[0]).find('Size');
                if (dzcSize.length > 0) {
                    //calculate max level
                    that.MaxWidth = parseInt(dzcSize.attr("Width"));
                    // Use height of first image for now...
                    that.Height = parseInt(dzcSize.attr("Height"));
                    // spl
                    // that.MaxRatio = that.Height/that.MaxWidth;
                    that.MaxRatio = 0;

                    for (i = 0; i < items.length; i++) {
                        itemSize = $(items[i]).find("Size");
                        var width = parseInt(itemSize.attr("Width"));
                        var height = parseInt(itemSize.attr("Height"));
                        var maxDim = width > height ? width : height;
                        var maxLevel = Math.ceil(Math.log(maxDim) / Math.log(2));
                        that._ratio = height / width;
                        var dziSource = $(items[i]).attr('Source');
                        var itemId = $(items[i]).attr('Id');
                        var dzN = $(items[i]).attr('N');
                        var dzId = dziSource.substring(dziSource.lastIndexOf("/") + 1).
                        replace(/\.xml/gi, "").
                        replace(/\.dzi/gi, "");
                        var basePath = dziSource.substring(0, dziSource.lastIndexOf("/"));
                        if (basePath.length > 0) basePath = basePath + '/';
                        if (width > that.MaxWidth) that.MaxWidth = width;
                        // spl
                        // if (that._ratio > that.MaxRatio) that.MaxRatio = that._ratio;
                        that.MaxRatio += that._ratio;

                        var dzi = new PivotViewer.Views.DeepZoomItem(itemId, dzId, dzN, basePath, that._ratio, width, height, maxLevel, that.baseUrl, dziSource);
                        that._items.push(dzi);
                        that._itemsById[itemId] = dzi;
                    }
                }
                // spl
                that.MaxRatio /= items.length;

                //Loaded DeepZoom collection
                $.publish("/PivotViewer/ImageController/Collection/Loaded", null);
            },
            error: function(jqXHR, textStatus, errorThrown) {
		if(jqXHR.readyState != 0 || jqXHR.status != 0) {
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();
		    
                    //Throw an alert so the user knows something is wrong
                    var msg = 'Error loading from DeepZoom Cache<br><br>';
                    msg += 'URL        : ' + this.url + '<br>';
                    msg += 'Status : ' + jqXHR.status + ' ' + errorThrown + '<br>';
                    msg += 'Details    : ' + jqXHR.responseText + '<br>';
                    msg += '<br>SuAVE cannot continue until this problem is resolved<br>';
                    $('.pv-wrapper').append("<div id=\"pv-dzloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    setTimeout(function() {
			window.open("#pv-dzloading-error", "_self")
                    }, 1000);
		}
            }
        });
    },

    getImages: function(id, width, height) {
        var level = this.getLevelFromDimensions( width, height );
        return this.getImagesAtLevel(id, level);
    },

    getLevelFromDimensions: function( width, height ) {

        var level =
            Math.ceil(Math.log(width > height ? width : height) / Math.log(2));
        if (level == Infinity || level == -Infinity)
            level = 0;

	return level;

    },
	  
    getImageDimensions: function( id ) {

	return this._items[id];

    },
    
    getGoogleMapIcon: function( id, width, height ) {

	var level = this.getLevelFromDimensions( width, height );
	var icon;
	if ( this._max_sprite_level < 0 ) {

            var item = this._itemsById[id];
	    
            var il =
		this.getImageList(id,
				  this.baseUrl + "/" +
				  item.BasePath +
				  item.DZId + "_files/" +
				  level + "/", level);
	    icon = il[0];
	    
	} else {

            var item = this._itemsById[id];
	    
            var il =
		this.getImageList(id,
				  this.baseUrl + "/" +
				  item.BasePath +
				  item.DZId + "_files/" +
				  level + "/", level);
	    icon = il[0];
            // var index = this._sprite_index[id];
	    
            // var params = index.params[level];
            // var tile_size = 1 << level;
	    
            // var x_tile_loc = tile_size * index.x;
            // var y_tile_loc = tile_size * index.y;
	    
	    // icon = {
	    // 	url : this._sprite_sheet_url[level],
	    // 	size : new google.maps.Size( params.width, params.height ),
	    // 	scaledSize: new google.maps.Size( params.width, params.height ),
	    // 	origin : new google.maps.Point( x_tile_loc, y_tile_loc ),
	    // 	anchor: new google.maps.Point( 0, 0 )
	    // };

	}
	return icon;

    },


    getImagesAtLevel: function(id, level) {

        //       level = ( level <= 0 ? 6 : level );

        if (level < 0)
            level = 0;

        // _max_sprite_level will be -1 if we're not using sprites.
        if (level <= this._max_sprite_level)
            return this.spriteLoad(id, level);
        var item = this._itemsById[id];
        level = (level > item.MaxLevel ? item.MaxLevel : level);

        if ((item.Levels[level] == undefined) && !this._zooming) {

            //requested level does not exist, and the Levels list is
            //smaller than the requested level

            var imageList =
                this.getImageList(id,
                    this.baseUrl + "/" +
                    item.BasePath +
                    item.DZId + "_files/" +
                    level + "/", level);
            item.Levels[level] =
                new PivotViewer.Views.ImageLevel(imageList);

        }

        //get best loaded level to return
        for (var j = level; j > this._max_sprite_level; j--)
            if ((item.Levels[j] != undefined) &&
                (item.Levels[j].IsLoaded()))
                return item.Levels[j].getImages();

        //if request level has not been requested yet

        if ((item.Levels[level] == undefined) &&
            !this._zooming) {

            var imageList =
                this.getImageList(id,
                    this.baseUrl + "/" +
                    item.BasePath +
                    item.DZId + "_files/" +
                    level + "/", level);

            item.Levels[level] = new PivotViewer.Views.ImageLevel(imageList);

        }

        var rv = null;
        for (var l = this._max_sprite_level; l >= 0; l--) {

            rv = this.spriteLoad(id, l);
            if (rv != null)
                break;

        }

        return rv;

    },

    spriteLoad: function(id, level) {

        var rv = null;

        if (this._sprite_sheet[level] == undefined) {

            if (this._sprite_sheet_url[level] != undefined) {

                if (this._sprite_sheet_loaded[level] == undefined) {

                    this._sprite_sheet_loaded[level] = false;
                    this._sprite_sheet[level] = new Image();

                    this._sprite_sheet[level].src =
                        this._sprite_sheet_url[level];

                    var that = this;
                    var lvl = level;

                    this._sprite_sheet[level].onload = function() {

                        that._sprite_sheet_loaded[lvl] = true;

                    }

                }

            }

        } else {

            if (this._sprite_sheet_loaded[level]) {

                try {

                    var sheet = this._sprite_sheet[level];

                    var index = this._sprite_index[id];

                    var params = index.params[level];
                    var tile_size = 1 << level;

                    var x_tile_loc = tile_size * index.x;
                    var y_tile_loc = tile_size * index.y;

                    var tile_width = params.width;
                    var tile_height = params.height;

                    rv = function(context, x, y, w, h) {

                        var wscale = w / tile_width;
                        var hscale = h / tile_height;
                        var scale = (wscale < hscale) ? wscale : hscale;

                        var rendered_width = Math.floor(tile_width * scale);
                        var rendered_height = Math.floor(tile_height * scale);

                        var x_slop = Math.floor((w - rendered_width) / 2);
                        var y_slop = Math.floor((h - rendered_height) / 2);

                        context.drawImage(sheet,
                            x_tile_loc,
                            y_tile_loc,
                            tile_width,
                            tile_height,
                            x + x_slop, y + y_slop,
                            rendered_width, rendered_height);

                    }

                } catch (e) {

                    $('.pv-loading').remove();

                    //Throw an alert so the user knows something is wrong
                    var msg = 'Error in DeepZoom Collection<br><br>';
                    msg += "Unable to find id " + id + "<br>";
                    msg += '<br>SuAVE cannot continue until this problem is resolved<br>';
                    $('.pv-wrapper').append("<div id=\"pv-dzloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    setTimeout(function() {
                        window.open("#pv-dzloading-error", "_self")
                    }, 1000)
                    return;

                }

            }

        }
        return rv;
    },

    getImageList: function(id, basePath, level) {
        var fileNames = [];

        var tileSize = this._tileSize;

        var item = this._itemsById[id];
        var height = item.Height;
        var maxLevel = item.MaxLevel;
        // var format = item.Format == null ? this._format : item.Format;

        var levelWidth = Math.ceil((height / item.Ratio) / Math.pow(2, maxLevel - level));
        var levelHeight = Math.ceil(height / Math.pow(2, maxLevel - level));
        //based on the width for this level, get the slices based on the DZ Tile Size
        var hslices = Math.ceil(levelWidth / tileSize);
        var vslices = Math.ceil(levelHeight / tileSize);

        //Construct list of file names based on number of vertical and horizontal images
        for (var i = 0; i < hslices; i++) {
            for (var j = 0; j < vslices; j++) {
                fileNames.push(basePath + i + "_" + j + "." + this._format);
            }
        }

        return fileNames;
    },

    getWidthForImage: function(id, height) {
        return Math.floor(height / this._itemsById[id].Ratio);
    },
    getMaxLevel: function(id) {
        return this._itemsById[id].MaxLevel;
    },
    getHeight: function(id) {
        return this._itemsById[id].Height;
    },
    getWidth: function(id) {
        return this._itemsById[id].Width;
    },

    getOverlap: function(id) {
        return this._collageItemOverlap;
    },
    getRatio: function(id) {
        try {

            return this._itemsById[id].Ratio;

        } catch (e) {

            $('.pv-loading').remove();

            //Throw an alert so the user knows something is wrong
            var msg = 'Missing image in DeepZoom Collection<br><br>';
            msg += "Can't find '" + id + "'</br>";
            msg += '<br>SuAVE cannot continue until this problem is resolved<br>';
            $('.pv-wrapper').append("<div id=\"pv-dzloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
            setTimeout(function() {
                window.open("#pv-dzloading-error", "_self")
            }, 1000)
            return;

        }

    }
});

PivotViewer.Views.DeepZoomItem = Object.subClass({
    init: function(ItemId, DZId, DZn, BasePath, Ratio, Width, Height, MaxLevel, baseUrl, dziSource) {
        this.ItemId = ItemId,
            this.DZId = DZId,
            this.DZN = parseInt(DZn),
            this.BasePath = BasePath,
            this.Levels = [];
        this.Ratio = Ratio;
        this.Width = Width;
        this.Height = Height;
        this.MaxLevel = MaxLevel;
        var that = this;
        var dziQueue = TileController._imageController._dziQueue[DZId];
	if ( typeof( dziQueue ) == "function" )
	    dziQueue =
	    TileController._imageController._dziQueue[DZId] = undefined;

        if (dziQueue == undefined) {
            dziQueue = TileController._imageController._dziQueue[DZId] = [];
            dziQueue.push(this);
        } else dziQueue.push(this);
    }
});

PivotViewer.Views.ImageLevel = Object.subClass({
    init: function(images) {
        this._images = [],
            this._loaded = false;
        var that = this;
        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.src = images[i];
            img.onload = function() {
                that._loaded = true;
            };
            this._images.push(img);
        }
    },
    getImages: function() {
        return this._images;
    },
    IsLoaded: function() {
        return this._loaded;
    }
});
