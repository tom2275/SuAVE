//
//  HTML5 PivotViewer
//
//  Original Code:
//    Copyright ( C ) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright ( C ) 2012-2014 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 ( see COPYING )
//
///
/// Tile Controller
/// used to create the initial tiles and their animation based on the locations set in the views
///
PivotViewer.Views.TileController = Object.subClass({
    init: function(ImageController) {
        this._tiles = [];
        this._tilesById = [];
        this._easing = new Easing.Easer({
            type: "circular",
            side: "both"
        });
        this._imageController = ImageController;

        var that = this;
        this._tiles.push = function(x) {
            this.__proto__.push.apply(that._tiles, [x]);
            that._tilesById[x.item.id] = x;
        }
        this.isZooming = false;
        this._started = false;
        this.isFirefox = typeof InstallTrigger !== 'undefined';

    },
    getTileById: function(id) {
        var item = this._tilesById[id];
        if (item == undefined) return null;
        return item;
    },
    initTiles: function(pivotCollectionItems, baseCollectionPath, canvasContext) {

        for (var i = 0; i < pivotCollectionItems.length; i++) {

            var tile = new PivotViewer.Views.Tile(this._imageController);
            tile.item = pivotCollectionItems[i];
            this._canvasContext = canvasContext;
            tile.context = this._canvasContext;
            tileLocation = new PivotViewer.Views.TileLocation();
            tile._locations.push(tileLocation);
            this._tiles.push(tile);

        }
        return this._tiles;
    },

    animateTiles: function() {

        var that = this;
        this._started = true;
        var context = null;
        var tiles = this._tiles;
        this._breaks = false;

        if (tiles.length > 0 && tiles[0].context != null) {

            context = tiles[0].context;
            //update canvas information while window size changes

            var cwidth = context.canvas.width = $('.pv-canvas').width();
            var cheight = context.canvas.height = $('.pv-canvas').height();

            var isZooming = false;
	    var txt = document.createElement("textarea");

            //Set tile properties

            for (var i = 0; i < tiles.length; i++) {

                var tile = tiles[i];
                var locations = tile._locations;

                //for each tile location...

                for (l = 0; l < locations.length; l++) {

                    var location = locations[l];

                    var now = PivotViewer.Utils.now() - tile.start;
                    var end = tile.end - tile.start;
                    //use the easing function to determine the next position
                    if (now <= end) {

                        //if the position is different from the
                        //destination position then zooming is
                        //happening

                        if (location.x != location.destinationx ||
                            location.y != location.destinationy)
                            isZooming = true;

                        location.x =
                            this._easing.ease(now, // curr time
                                location.startx, // start position
                                location.destinationx -
                                location.startx, // relative end position
                                end); // end time

                        location.y =
                            this._easing.ease(now,
                                location.starty,
                                location.destinationy -
                                location.starty,
                                end);

                        //if the width/height is different from the
                        //destination width/height then zooming is
                        //happening

                        if (tile.width != tile.destinationWidth ||
                            tile.height != tile.destinationHeight)
                            isZooming = true;

                        tile.width =
                            this._easing.ease(now,
                                tile.startwidth,
                                tile.destinationwidth -
                                tile.startwidth,
                                end);

                        tile.height =
                            this._easing.ease(now,
                                tile.startheight,
                                tile.destinationheight -
                                tile.startheight,
                                end);

                    } else {
                        location.x = location.destinationx;
                        location.y = location.destinationy;
                        tile.width = tile.destinationwidth;
                        tile.height = tile.destinationheight;

                        // if now and end are numbers when we get here
                        // then the animation has finished
                        // this._breaks = true;

                    }

                    // //check if the destination will be in the visible area
                    // if ((location.destinationx + tile.destinationwidth < 0) ||
                    //     (location.destinationx > cwidth) ||
                    //     (location.destinationy + tile.destinationheight < 0) ||
                    //     (location.destinationy > cheight))
                    //     tile.destinationVisible = false;
                    // else
                    //     tile.destinationVisible = true;

                }
            }
        }

        //fire zoom event

        if (this._isZooming != isZooming) {

            this._isZooming = isZooming;
            $.publish("/PivotViewer/ImageController/Zoom", [this._isZooming]);

        }

        //Clear drawing area

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //once properties set then draw

        var text_min_height = 12;
        var candidates = new Array(tiles.length);
        var context = tiles[0].context;
        context.font = text_min_height + "px Roboto,Helvetica,Arial,sans-serif";

        var width_sum = 0;
        var length_sum = 0;
        var max_width = 0;
        var max_chars = 0;
        var tile_width = 0;

        var cwidth = context.canvas.width;
        var cheight = context.canvas.height;

        for (var i = 0; i < tiles.length; i++) {

            var tile = tiles[i];
            var locations = tile._locations;

            candidates[i] = new Array(locations.length);

            //only draw if in visible area

            for (var l = 0; l < locations.length; l++) {

                var location = locations[l];

                var left = location.x;
                var top = location.y;
                var right = left + tile.width;
                var bottom = top + tile.height;

                var drawit =
                    this.inBox(left, right, top, bottom,
                        0, cwidth, 0, cheight) ||
                    this.inBox(0, cwidth, 0, cheight,
                        left, right, top, bottom) ||
                    this.crossBox([left, right], [bottom, bottom], [0, 0], [0, cheight]) ||
                    this.crossBox([left, right], [top, top], [0, 0], [0, cheight]) ||
                    this.crossBox([left, right], [bottom, bottom], [cwidth, cwidth], [0, cheight]) ||
                    this.crossBox([left, right], [top, top], [cwidth, cwidth], [0, cheight]) ||
                    this.crossBox([0, cwidth], [0, 0], [left, left], [bottom, top]) ||
                    this.crossBox([0, cwidth], [cheight, cheight], [left, left], [bottom, top]) ||
                    this.crossBox([0, cwidth], [0, 0], [right, right], [bottom, top]) ||
                    this.crossBox([0, cwidth], [cheight, cheight], [right, right], [bottom, top]);

                if (drawit) {

		    if ( tile.item.name != undefined ) {
			
			txt.innerHTML = tile.item.name;

			var m = context.measureText(txt.value)

			width_sum += m.width;
			if (m.width > max_width)
                            max_width = m.width;
			length_sum += txt.value.length;
			if (txt.value.length > max_chars)
                            max_chars = txt.value.length;

		    }
                    candidates[i][l] = tile.draw(l);
                    if (tile_width < tile.width)
                        tile_width = tile.width;

                }

            }

        }

	if ( max_chars > 0 ) {

            var tw_minus_24 = tile_width - 24;
            var text_height =
		Math.floor((tw_minus_24 / max_width) * text_min_height);
	    
            if (text_height > 30)
		text_height = 30;
            var ok = text_height >= text_min_height;
	    
            if (!ok) {
		
		var avg_charsize = width_sum / length_sum;
		var tile_limit = tw_minus_24 + (3 * avg_charsize);
		
		for (max_chars -= 3; max_chars >= 20 && !ok; max_chars--) {
		    
                    text_height =
			Math.floor((tile_limit /
				    (max_chars * avg_charsize)) *
				   text_min_height);
                    ok = text_height >= text_min_height;
		    
		}
		
            }
	    
        if (ok) {

            $.publish("/PivotViewer/ImageController/TooltipEnable", [false]);

            context.font = text_height + "px Roboto,Helvetica,Arial,sans-serif";
            var thx = this.getTextHeight(context.font);
            text_height = thx.height;
            text_ascent = thx.ascent;
            text_descent = thx.descent;
            for (var i = 0; i < tiles.length; i++) {

                var tile = tiles[i];
                var locations = tile._locations;

                for (var l = 0; l < locations.length; l++) {

                    var dims = candidates[i][l];

                    if ((dims != undefined) && (dims.width != 0)) {

                        location = locations[l];

                        var scaled_width = dims.width;
                        var scaled_height = dims.height;
                        var xmargin = dims.xmargin;
                        var ymargin = dims.ymargin;

                        txt.innerHTML = tile.item.name;
                        var text = txt.value;

                        var lines = [];
                        if (text.length > max_chars) {

                            var words = text.split(" ");
                            var string = "";

                            for (var w = 0; w < words.length; w++) {

                                var sl = string.length + words[w].length;

                                if (string.length > 0)
                                    sl++;

                                if (sl > max_chars) {

                                    lines.push(string);
                                    string = words[w];

                                } else
                                    string += " " + words[w];

                            }

                            lines.push(string);

                            if (lines.length > 3) {

                                lines = [];

                                lines.push(text.substr(0,
                                        max_chars - 3) +
                                    "...");

                            }

                        } else
                            lines.push(text);

                        var tw = 0;
                        for (var ln = 0; ln < lines.length; ln++) {

                            var m = context.measureText(lines[ln]);

                            if (tw < m.width)
                                tw = m.width;
                        }

                        var ths = text_height; // Text height plus space.
                        var th = lines.length * ths;
                        var location = locations[l];

                        var x1 = location.x + xmargin;
                        var y1 = location.y + ymargin;

                        context.save();
                        context.strokeStyle = "rgb( 0, 0, 0 )";
                        context.fillStyle = "rgba( 64, 64, 64, .5 )";

                        var rectw = tw + 8;
                        var recth = th;
                        hshift = this.isFirefox ? 4 : 8;

                        this.roundRect(context,
                            x1 + ((scaled_width - rectw) / 2),
                            y1 + scaled_height - (recth + hshift),
                            rectw, recth,
                            4,
                            true, false);
                        context.restore()

                        context.save();
                        context.textBaseline = "alphabetic";
                        context.textAlign = "center";
                        context.fillStyle = "white";

                        for (var ln = 0; ln < lines.length; ln++) {
			    
			    txt.innerHTML = lines[ln];
			    
                            context.fillText( txt.value,
					      x1 + (scaled_width / 2),
					      y1 - th + scaled_height +
					      text_ascent +
					     (ln * ths) - hshift - 1);

			}
                        context.restore();

                    }

                }

            }

            } else
		$.publish("/PivotViewer/ImageController/TooltipEnable", [true]);
	    
	} else
	    $.publish("/PivotViewer/ImageController/TooltipEnable", [false]);
	
        // request new frame
        if (!this._breaks)
            requestAnimFrame(function() {
                that.animateTiles();
            });
        else {

            window.setTimeout(function() {
                that.animateTiles()
            }, 250);

            this._started = false;
        }

    },
    crossBox: function(x1, y1, x2, y2) {

        var a = x1[1] - x1[0];
        var b = -(x2[1] - x2[0]);
        var c = y1[1] - y1[0];
        var d = -(y2[1] - y2[0]);
        var det = (a * d) - (b * c);

        var ret = false;
        if (det != 0) {

            var m00 = d / det;
            var m01 = -b / det;
            var m10 = -c / det;
            var m11 = a / det;

            var b1 = x2[0] - x1[0];
            var b2 = y2[0] - y1[0];

            var t1 = (m00 * b1) + (m01 * b2);
            var t2 = (m10 * b1) + (m11 * b2);

            ret = ((0 <= t1) && (t1 <= 1)) &&
                ((0 <= t2) && (t2 <= 1));

        }
        return ret;

    },
    inBox: function(left, right, top, bottom,
        bound_x0, bound_x1, bound_y0, bound_y1) {

        var left_inside = (bound_x0 <= left) && (left <= bound_x1);
        var right_inside = (bound_x0 <= right) && (right <= bound_x1);
        var top_inside = (bound_y0 <= top) && (top <= bound_y1);
        var bottom_inside = (bound_y0 <= bottom) && (bottom <= bound_y1);

        return (left_inside && top_inside) ||
            (left_inside && bottom_inside) ||
            (right_inside && top_inside) ||
            (right_inside && bottom_inside);

    },
    getTextHeight: function(font) {

        var text = $('<span>Hg</span>').css({
            "font": font
        });
        var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');

        var div = $('<div></div>');
        div.append(text, block);

        var body = $('body');
        body.append(div);

        try {

            var result = {};

            block.css({
                verticalAlign: 'baseline'
            });
            result.ascent = block.offset().top - text.offset().top;

            block.css({
                verticalAlign: 'bottom'
            });
            result.height = block.offset().top - text.offset().top;

            result.descent = result.height - result.ascent;

        } finally {
            div.remove();
        }

        return result;
    },
    /**
     * Pinched from answer #2 from
     * http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
     *
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {Boolean} [fill = false] Whether to fill the rectangle.
     * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
     */
    roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {

        if (typeof stroke == 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = {
                tl: radius,
                tr: radius,
                br: radius,
                bl: radius
            };
        } else {
            var defaultRadius = {
                tl: 0,
                tr: 0,
                br: 0,
                bl: 0
            };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }

    },

    beginAnimation: function() {

        if (!this._started && this._tiles.length > 0) {
            this._breaks = false;
            this.animateTiles();
        }

    },
    stopAnimation: function() {
        this._breaks = true;
    },
    setLinearEasingBoth: function() {
        this._easing = new Easing.Easer({
            type: "linear",
            side: "both"
        });
    },
    setCircularEasingBoth: function() {
        this._easing = new Easing.Easer({
            type: "circular",
            side: "both"
        });
    },
    setQuarticEasingOut: function() {
        this._easing = new Easing.Easer({
            type: "quartic",
            side: "out"
        });
    },
    getMaxTileRatio: function() {
        return this._imageController.MaxRatio;
    }
});

///
/// Tile
/// Used to contain the details of an individual tile, and to draw the tile on a given canvas context
///
PivotViewer.Views.Tile = Object.subClass({
    init: function(TileController) {
        if (!(this instanceof PivotViewer.Views.Tile)) {
            return new PivotViewer.Views.Tile(TileController);
        }
        this._imageLoaded = false;
        this._selected = false;
        this._images = null;
        this._locations = [];
        this._visible = true;
    },

    draw: function(loc) {

        if ((this.width == 0) ||
            (this.height == 0))
            return undefined;

        var location = this._locations[loc];
        var ctrlr = TileController._imageController;
        var context = this.context;

        var scaled_width = 0;
        var scaled_height = 0;

        this._images = ctrlr.getImages(this.item.img,
            this.width,
            this.height);

        if (this._images != null) {

            try {

                //A DrawLevel function returned - invoke
                var completeImageHeight = ctrlr.getHeight(this.item.img);
                var completeImageWidth = ctrlr.getWidth(this.item.img);

                var displayHeight =
                    this.height -
                    Math.ceil(this.height < 128 ? this.height / 16 : 8);
                var displayWidth =
                    this.width -
                    Math.ceil(this.width < 128 ? this.width / 16 : 8);

                //Narrower images need to be centered

                var blankWidth = (this.width - 8) - displayWidth;
                var blankHeight = (this.height - 8) - displayHeight;

                // Handle displaying the deepzoom image tiles ( move to deepzoom.js )

                var xmargin = 0;
                var ymargin = 0;
                scaled_width = displayWidth;
                scaled_height = displayHeight;

                var tileSize = ctrlr._tileSize;

                //Get image level

                var image_level =
                    Math.ceil(Math.log(this.width > this.height ?
                            this.width : this.height) /
                        Math.log(2));
                if (image_level == Infinity || image_level == -Infinity)
                    image_level = 0;

                var maxlevel = ctrlr.getMaxLevel(this.item.img);
                if (image_level > maxlevel)
                    image_level = maxlevel
                var level_factor =
                    1 << (maxlevel - image_level);

                var levelHeight =
                    Math.ceil(completeImageHeight / level_factor);
                var levelWidth =
                    Math.ceil(completeImageWidth / level_factor);

                //Image will need to be scaled to get the displayHeight

                var scaleh = displayHeight / levelHeight;
                var scalew = displayWidth / levelWidth;

                var scale = (scaleh < scalew) ? scaleh : scalew;

                scaled_width = Math.ceil(levelWidth * scale);
                scaled_height = Math.ceil(levelHeight * scale);

                xmargin =
                    Math.floor((displayWidth - scaled_width) / 2);
                ymargin =
                    Math.floor((displayHeight - scaled_height) / 2);

                if (typeof this._images == "function")
                    this._images(context,
                        location.x + xmargin,
                        location.y + ymargin,
                        scaled_width,
                        scaled_height);
                else if ((this._images.length > 0) &&
                    this._images[0] instanceof Image) {

                    //if the collection contains an image

                    if (ctrlr instanceof PivotViewer.Views.DeepZoomImageController) {

                        var tileSize = ctrlr._tileSize;

                        //Get image level
                        lvl = this._images[0].src.match(/_files\/[0-9]+\//g)[0];

                        var imageLevel =
                            parseInt(lvl.substring(7, lvl.length - 1));

                        var level_factor =
                            1 << (ctrlr.getMaxLevel(this.item.img) -
                                imageLevel);

                        var levelHeight =
                            Math.ceil(completeImageHeight / level_factor);
                        var levelWidth =
                            Math.ceil(completeImageWidth / level_factor);

                        //Image will need to be scaled to get the displayHeight

                        var scaleh = displayHeight / levelHeight;
                        var scalew = displayWidth / levelWidth;

                        var scale = (scaleh < scalew) ? scaleh : scalew;

                        scaled_width = levelWidth * scale;
                        scaled_height = levelHeight * scale;

                        xmargin =
                            Math.floor((displayWidth - scaled_width) / 2);
                        ymargin =
                            Math.floor((displayHeight - scaled_height) / 2);

                        // handle overlap
                        overlap = ctrlr.getOverlap(this.item.img);

                        var tex = 0;
                        var tey = 0;
                        for (var i = 0; i < this._images.length; i++) {

                            // We need to know where individual image tiles go
                            var source = this._images[i].src;
                            var n = source.match(/[0-9]+_[0-9]+/g);
                            var nl = n[n.length - 1];

                            var xPosition =
                                parseInt(nl.substring(0, nl.indexOf("_")));
                            var yPosition =
                                parseInt(nl.substring(nl.indexOf("_") + 1));

                            var imageTileHeight =
                                Math.floor(this._images[i].height * scale);
                            var imageTileWidth =
                                Math.floor(this._images[i].width * scale);

                            var ofactor =
                                ((tileSize - overlap) * scale);
                            var offsetx =
                                xmargin + (xPosition * ofactor);
                            var offsety =
                                ymargin + (yPosition * ofactor);

                            context.drawImage(this._images[i],
                                offsetx + location.x,
                                offsety + location.y,
                                imageTileWidth,
                                imageTileHeight);
                            var tx =
                                parseInt(offsetx +
                                    location.x +
                                    imageTileWidth);
                            var ty =
                                parseInt(offsety +
                                    location.y + imageTileHeight);
                            if (tex < tx)
                                tex = tx;
                            if (tey < ty)
                                tey = ty;

                        }
                        scaled_width =
                            parseInt(tex - (location.x + xmargin));
                        scaled_height =
                            parseInt(tey - (location.y + ymargin));

                    } else {
                        var offsetx = (Math.floor(blankWidth / 2)) + 4;
                        var offsety = 4;
                        context.drawImage(this._images[0],
                            offsetx + location.x,
                            offsety + location.y,
                            displayWidth, displayHeight);
                    }

                    if (this._selected) {
                        //draw a blue border
                        context.beginPath();
                        var offsetx = xmargin;
                        var offsety = ymargin;
                        context.rect(offsetx +
                            this._locations[this.selectedLoc].x,
                            offsety +
                            this._locations[this.selectedLoc].y,
                            scaled_width + 2, scaled_height + 2);
                        context.lineWidth = 4;
                        context.strokeStyle = "#92C4E1";
                        context.stroke();

                    }

                }

            } catch (e) {

                this.drawEmpty(loc);

            }

        } else
            this.drawEmpty(loc);
        var result = {};
        result.width = scaled_width;
        result.height = scaled_height;
        result.xmargin = xmargin;
        result.ymargin = ymargin;
        return result;

    },
    //http://simonsarris.com/blog/510-making-html5-canvas-useful
    contains: function(mx, my) {
        for (i = 0; i < this._locations.length; i++)
            if ((this._locations[i].x <= mx) &&
                (this._locations[i].x + this.width >= mx) &&
                (this._locations[i].y <= my) &&
                (this._locations[i].y + this.height >= my)) {
                return i;
            }

        return -1;

    },
    drawEmpty: function(loc) {

        var controller = TileController._imageController;
        var context = this.context;
        var location = this._locations[loc];

        if (controller.DrawLevel == undefined) {

            //draw an empty square

            context.beginPath();
            context.fillStyle = "#D7DDDD";
            context.fillRect(location.x + 4,
                location.y + 4,
                this.width - 8,
                this.height - 8);
            context.rect(location.x + 4,
                location.y + 4,
                this.width - 8,
                this.height - 8);
            context.lineWidth = 1;
            context.strokeStyle = "white";
            context.stroke();

        } else //use the controller's blank tile
            controller.DrawLevel(this.item,
                context,
                location.x + 4,
                location.y + 4,
                this.width - 8,
                this.height - 8);

    },
    now: null,
    end: null,
    width: 0,
    height: 0,
    origwidth: 0,
    origheight: 0,
    ratio: 1,
    startwidth: 0,
    startheight: 0,
    destinationwidth: 0,
    destinationheight: 0,
    destinationVisible: true,
    context: null,
    item: null,
    firstFilterItemDone: false,
    selectedLoc: 0,
    setSelected: function(selected, sLoc, cellLoc) {
        if (selected)
            $.publish("/PivotViewer/ImageController/Selected", [this]);
        this._selected = selected;
        if (sLoc != null) this.selectedLoc = sLoc;
        if (cellLoc != null) this.cellLoc = cellLoc;
    },
    isSelected: function() {
        return this._selected;
    }
});

///
/// Tile Location
///
/// Used to contain the location of a tile as in the graph view a tile
/// can appear multiple times
///

PivotViewer.Views.TileLocation = Object.subClass({
    init: function() {},
    x: 0,
    y: 0,
    startx: 0,
    starty: 0,
    destinationx: 0,
    destinationy: 0,
});
