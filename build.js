var fs = require('fs');
var path = require('path');
var icons2font = require('svgicons2svgfont');
var svg2ttf = require('svg2ttf');

var SPACE_CHARCODE = 32;
var DIST_DIR = path.join(__dirname, 'dist');
var FONT_NAME = 'testfont';

var charactersInFont = [];
if (process.argv.indexOf('--counterexample') !== -1) {
  // Generate a font with some glyphs, but no glyph for space character.
  for (var i = 0; i <= 300; i++) {
    if (i !== SPACE_CHARCODE) {
      charactersInFont.push(String.fromCharCode(i));
    }
  }
} else {
  // Generate a font with only one glyph for space character.
  charactersInFont.push(String.fromCharCode(SPACE_CHARCODE));
}

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR);
}

// Create a svg font.
var fontStream = new icons2font({
  fontName: FONT_NAME,
  fontHeight: 2000,
  normalize: true
});

var fontPath = path.join(DIST_DIR, FONT_NAME)

fontStream
  .pipe(fs.createWriteStream(fontPath + '.svg'))
  .on('finish', function () {
    // Create a TTF font from the svg font.
    var ttf = svg2ttf(fs.readFileSync(fontPath + '.svg', 'utf-8'), {});
    fs.writeFile(fontPath + '.ttf', bufferFrom(ttf.buffer), logError);
  })
  .on('error', logError);

var glyph = fs.createReadStream(path.join(__dirname, 'square.svg'));
// @ts-ignore
glyph.metadata = {
  unicode: charactersInFont,
  name: FONT_NAME
};

fontStream.write(glyph);
fontStream.end();

function bufferFrom(source) {
  return typeof Buffer.from === 'function' ? Buffer.from(source) : new Buffer(source);
}

function logError(err) {
  if (err) {
    console.error(err);
  }
}