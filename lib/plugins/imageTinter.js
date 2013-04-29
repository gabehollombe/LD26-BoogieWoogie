ig.module(
	'plugins.imageTinter'
)
.requires(
	'impact.image',
    'impact.loader',
    'impact.background-map',
    'impact.animation'
)
.defines(function() {

    /* image extensions */
    ig.Image.prototype.tintColor = '#fff';
    ig.Image.prototype.tintAlpha = 0;
    ig.Image.prototype.doTint = false;
    ig.Image.prototype._init = ig.Image.prototype.init;
    ig.Image.prototype._load = ig.Image.prototype.load;
    ig.Image.prototype._reload = ig.Image.prototype.reload;
    ig.Image.prototype._staticInstantiate = ig.Image.prototype.staticInstantiate;
    ig.Image.prototype._onload = ig.Image.prototype.onload;

    ig.Image.prototype.init = function(path, tintColor, tintAlpha)
    {
        this.doTint = (tintColor != null && tintAlpha != null);
        this.tintColor = tintColor;
        this.tintAlpha = tintAlpha;
        this._init(path);
    },

    ig.Image.prototype.tintImage = function(tintColor, tintAlpha)
    {
        if (tintAlpha == 0 || this.tinted) return;
        //tintAlpha /=2;

        var img = ig.$new('canvas');
        img.width = this.width;
        img.height = this.height;
        var ctx = img.getContext('2d');
        ctx.drawImage( this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height );
        var px = ctx.getImageData(0, 0, this.width, this.height);
        var tint = new RGBColor(tintColor);
        //var hslTint = rgbToHsl(tint.r, tint.g, tint.b);
        for( var y = 0; y < this.data.height; y++ )
        {
            for( var x = 0; x < this.data.width; x++ )
            {
                var index = (y * this.data.width + x) * 4;
                var sr = px.data[index + 0];
                var sg = px.data[index + 1];
                var sb = px.data[index + 2];
                var sa = px.data[index + 3];
                var luminance = getLuminance(sr, sg, sb);
                /*
                var mixHSL = mixHslColors(color, hslTint, tintAlpha);
                var mix = hslToRgb(mixHSL.h, mixHSL.s, mixHSL.l);


                var r = mix.r;
                var g = mix.g;
                var b = mix.b;
                */

                // //(tint -source)*alpha + source
                var alpha = tintAlpha *  Math.sqrt(luminance);// * (sa/255);

                /*
                var r = (alpha * tint.r) + sr * (1 - alpha);
                var g = (alpha * tint.g) + sg * (1 - alpha);
                var b = (alpha * tint.b) + sb * (1 - alpha);
                */

                ///*
                var r = alpha * (tint.r - sr)  + sr;
                var g = alpha * (tint.g - sg)  + sg;
                var b = alpha * (tint.b - sb)  + sb;
                /*
                var hsl = rgbToHsl(r, g, b);
                var newcolor = hslToRgb(hsl.h, hsl.s, hsl.l);
                r = newcolor.r;
                g = newcolor.g;
                b = newcolor.b;
                ///*/

                // r
                px.data[index] = r < 0 ? 0 : r > 255 ? 255 : r;
                // g
                px.data[++index] = g < 0 ? 0 : g > 255 ? 255 : g;
                // b
                px.data[++index] = b < 0 ? 0 : b > 255 ? 255 : b;
            }
        }

        ctx.putImageData( px, 0, 0 );
        this.data = img;
        this.tinted = true;
    },

	ig.Image.prototype.load = function( loadCallback )
    {
        if (!this.doTint)
        {
            return this._load(loadCallback);
        }
        // we're tinting it.
		if( this.loaded )
        {
			if( loadCallback )
            {
				loadCallback(this.path, true);
			}
			return;
		}
		else if( !this.loaded && ig.ready )
        {
            this.loadCallback = loadCallback || null;

			this.data = new Image();
			this.data.onload = this.onload.bind(this);
			this.data.onerror = this.onerror.bind(this);


			this.data.src = this.path + ig.nocache;

		}
		else
        {
			ig.addResource( this );
		}

        var cacheName = this.buildCacheKey(this.path,  this.tintColor, this.tintAlpha);
		ig.Image.cache[cacheName] = this;
	},

    ig.Image.prototype.onload = function(event)
    {
        this._onload(event);
        if (this.doTint)
        {
            this.tintImage(this.tintColor, this.tintAlpha);
        }
    },

    ig.Image.prototype.buildCacheKey = function(path, color, alpha)
    {
        if (color == null || alpha == null)
        {
            return path;
        }
        return path + ';' + color + ';' + alpha;
    },

	ig.Image.prototype.reload = function() {
        if (!this.doTint)
        {
            return this._reload();
        }
        var caching = (ig.nocache == '');
        if (caching) ig.setNocache(true);    // disable caching.

		this.loaded = false;

        this.load(null);

        if (!caching) ig.setNocache(false); // reenable caching
	},

    ig.Image.prototype.staticInstantiate = function( path, color, alpha )
    {
        return this._staticInstantiate(this.buildCacheKey(path, color, alpha))
    },

    // background map extensions
    ig.BackgroundMap.prototype._setTileset = ig.BackgroundMap.prototype.setTileset;

	ig.BackgroundMap.prototype.setTileset = function( tileset )
    {
        if (this.layerTint == null)
        {
            return this._setTileset(tileset);
        }

		this.tilesetName  = tileset instanceof ig.Image ? tileset.path : tileset;
		this.tiles = new ig.Image(this.tilesetName, this.layerTint.color, this.layerTint.alpha);
		this.preRenderedChunks = null;
	},

    ig.BackgroundMap.prototype.setLayerTint = function(layerTint)
    {
        //if (this.layerTint == layerTint) return;
        if (this.tinted) return;
        this.layerTint = layerTint;
        if (layerTint != null)
        {
            this.setTileset(this.tilesetName);
            this.tinted = true;
        }
    },

    // animation sheet extension
    ig.AnimationSheet.prototype._init = ig.AnimationSheet.prototype.init;

	ig.AnimationSheet.prototype.init =  function( path, width, height, tintColor, tintAlpha )
    {
        if (tintAlpha == null || tintColor == null) return this._init(path, width, height);
		this.width = width;
		this.height = height;

		this.image = new ig.Image(path, tintColor, tintAlpha );
	}

});


/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    },

    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    },

    this.toHsl = function()
    {
        return rgbToHsl(this.r, this.g, this.b);
    }

}

function rgbToHsl(r, g, b)
{
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {h:h, s:s, l:l};
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
function hslToRgb(h, s, l)
{
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {r:r *255, g:g*255, b:b*255};
}

function getLuminance(r, g, b)
{
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    return (max + min) / 2;
}

function mixHslColors(base, tint, alpha)
{
    var distCCW = (base.h >= tint.h) ? base.h - tint.h : 1 + base.h - tint.h;
    var distCW = (base.h >= tint.h) ? 1 + tint.h - base.h : tint.h - base.h;
    var p = 1-alpha;

    var h = (distCW <= distCCW) ? base.h + (distCW * p) : base.h - (distCCW * p);
    if (h < 0) h = 1 + h;
    if (h > 1) h = h - 1;
    var s = (1 - p) * base.s + p * tint.s;
    var l = (1 - p) * base.l + p * tint.l;

    return {h:h, s:s, l:base.l};
}
