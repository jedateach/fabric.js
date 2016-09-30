/**
 * Provides a list of files, marked with modules as approprite
 */
module.exports = function (srcDir, libDir) {

  /**
   * Helper for creating file objects
   */
  function file (file, include, exclude, lib) {
    var base = lib ? libDir : srcDir;
    var file = {
      path: base + file
    };
    // include in module
    if (include) {
      file.include = include;
    }
    if (exclude) {
      file.exclude = exclude;
    }
    return file;
  }

  /**
   * Orderd files list, marked with modules where appropriate
   */
  return [
    file('HEADER.js'),

    file('json2.js', 'serialization', 'json', true),
    file('event.js', 'gestures', null, true),

    file('mixins/observable.mixin.js'),
    file('mixins/collection.mixin.js'),

    file('util/misc.js'),
    file('util/arc.js'),
    file('util/lang_array.js'),
    file('util/lang_object.js'),
    file('util/lang_string.js'),
    file('util/lang_function.js'),
    file('util/lang_class.js'),
    file('util/dom_event.js'),
    file('util/dom_style.js'),
    file('util/dom_misc.js'),
    file('util/dom_request.js'),

    file('log.js'),

    file('util/animate.js', 'animation'),
    //'util/animate.js',
    file('util/anim_ease.js', 'easing'),

    file('parser.js', 'parser'),
    file('elements_parser.js', 'parser'),

    file('point.class.js'),
    file('intersection.class.js'),
    file('color.class.js'),

    file('gradient.class.js', 'gradient'),
    file('pattern.class.js', 'pattern'),
    file('shadow.class.js', 'shadow'),

    file('static_canvas.class.js'),

    file('brushes/base_brush.class.js', 'freedrawing'),

    file('brushes/pencil_brush.class.js', 'freedrawing'),
    file('brushes/circle_brush.class.js', 'freedrawing'),
    file('brushes/spray_brush.class.js', 'freedrawing'),
    file('brushes/pattern_brush.class.js', 'freedrawing'),

    file('canvas.class.js', 'interaction'),
    file('mixins/canvas_events.mixin.js', 'interaction'),
    file('mixins/canvas_grouping.mixin.js', 'interaction'),

    file('mixins/canvas_dataurl_exporter.mixin.js'),

    file('mixins/canvas_serialization.mixin.js', 'serialization'),
    file('mixins/canvas_gestures.mixin.js', 'gestures'),

    file('shapes/object.class.js'),
    file('mixins/object_origin.mixin.js'),
    file('mixins/object_geometry.mixin.js'),
    file('mixins/object_stacking.mixin.js'),
    file('mixins/object.svg_export.js'),
    file('mixins/stateful.mixin.js'),

    file('mixins/object_interactivity.mixin.js', 'interaction'),

    file('mixins/animation.mixin.js', 'animation'),
    //file('mixins/animation.mixin.js'),

    file('shapes/line.class.js'),
    file('shapes/circle.class.js'),
    file('shapes/triangle.class.js'),
    file('shapes/ellipse.class.js'),
    file('shapes/rect.class.js'),
    file('shapes/polyline.class.js'),
    file('shapes/polygon.class.js'),
    file('shapes/path.class.js'),
    file('shapes/path_group.class.js'),
    file('shapes/group.class.js'),
    file('shapes/image.class.js'),

    file('mixins/object_straightening.mixin.js', 'object_straightening'),

    file('filters/base_filter.class.js', 'image_filters'),
    file('filters/brightness_filter.class.js', 'image_filters'),
    file('filters/convolute_filter.class.js', 'image_filters'),
    file('filters/gradienttransparency_filter.class.js', 'image_filters'),
    file('filters/grayscale_filter.class.js', 'image_filters'),
    file('filters/invert_filter.class.js', 'image_filters'),
    file('filters/mask_filter.class.js', 'image_filters'),
    file('filters/noise_filter.class.js', 'image_filters'),
    file('filters/pixelate_filter.class.js', 'image_filters'),
    file('filters/removewhite_filter.class.js', 'image_filters'),
    file('filters/sepia_filter.class.js', 'image_filters'),
    file('filters/sepia2_filter.class.js', 'image_filters'),
    file('filters/tint_filter.class.js', 'image_filters'),
    file('filters/multiply_filter.class.js', 'image_filters'),
    file('filters/blend_filter.class.js', 'image_filters'),
    file('filters/resize_filter.class.js', 'image_filters'),
    file('filters/colormatrix_filter.class.js', 'image_filters'),

    file('shapes/text.class.js', 'text'),

    file('shapes/itext.class.js', 'itext'),
    file('mixins/itext_behavior.mixin.js', 'itext'),
    file('mixins/itext_click_behavior.mixin.js', 'itext'),
    file('mixins/itext_key_behavior.mixin.js', 'itext'),
    file('mixins/itext.svg_export.js', 'itext'),

    file('shapes/textbox.class.js', 'textbox'),
    file('mixins/textbox_behavior.mixin.js', 'textbox'),
    file('mixins/textbox_click_behavior.mixin.js', 'textbox'),

    file('node.js', 'node')
  ]
};
