const FACTOR_AXIS_HEIGHT = 240;
const MAX_GLYPH_RADIUS = 70;
//const MARGIN_HEIGHT_FOR_GLYPH = 40;
const MARGIN_HEIGHT_FOR_GLYPH = 40;
const GLYPH_CENTER_TO_BAR = 15;
//const FACTOR_TYPE_COLORMAP = [ "#84a7b2","#509766", "#CD6600","#3690c0", "#EEAD0E", "#996699"];
const FACTOR_TYPE_COLORMAP = [
  "rgb(0, 97, 176)",
  "rgb(123, 0, 193)",
  "rgb(0, 187, 199)",
  "rgb(71, 107, 0)",
  "rgb(209, 211, 0)",
  "rgb(211, 164, 0)"
];

const FACTOR_TYPE_COLORMAP_STREAMGRAPH = [
  "rgb(0, 97, 176, 0.8)",
  "rgb(123, 0, 193, 0.8)",
  "rgb(0, 187, 199, 0.8)",
  "rgb(71, 107, 0, 0.8)",
  "rgb(209, 211, 0, 0.8)",
  "rgb(211, 164, 0, 0.8)",
  "rgb(211, 164, 0, 0.8)",
  "rgb(209, 211, 0, 0.8)",
  "rgb(71, 107, 0, 0.8)",
  "rgb(0, 187, 199, 0.8)",
  "rgb(123, 0, 193, 0.8)",
  "rgb(0, 97, 176, 0.8)",
];
const MIN_OPACITY = 0.1;
const MAX_OPACITY = 0.6;
const FACTOR_TYPE_COLORMAP_MIN_OPACITY = [
  "rgb(0, 97, 176, 0.4)",
  "rgb(123, 0, 193, 0.4)",
  "rgb(0, 187, 199, 0.4)",
  "rgb(71, 107, 0, 0.4)",
  "rgb(209, 211, 0, 0.4)",
  "rgb(211, 164, 0, 0.4)"
];
//const FACTOR_TYPE_COLORMAP_MIN_OPACITY = [
//      "rgb(132, 167, 178, " + MIN_OPACITY+")",
//      "rgb(0, 71, 182, " + MIN_OPACITY+")",
//      "rgba(205, 102, 0, " + MIN_OPACITY+")",
//      "rgb(54, 144, 192, " + MIN_OPACITY+")",
//      "rgb(238, 173, 14, " + MIN_OPACITY+")",
//      "rgb(153, 102, 153, " + MIN_OPACITY+")",
//      ];
const FRAME_HEADER_HEIGHT = 52;
const BAR_COLOR = {
  "green": "#008000",
  "red": "#FF0000",
};

export default{
  FACTOR_AXIS_HEIGHT,
  MAX_GLYPH_RADIUS,
  GLYPH_CENTER_TO_BAR,
  MARGIN_HEIGHT_FOR_GLYPH,
  FACTOR_TYPE_COLORMAP,
  MIN_OPACITY,
  MAX_OPACITY,
  FACTOR_TYPE_COLORMAP_MIN_OPACITY,
  FRAME_HEADER_HEIGHT,
  BAR_COLOR,
  FACTOR_TYPE_COLORMAP_STREAMGRAPH,
}
