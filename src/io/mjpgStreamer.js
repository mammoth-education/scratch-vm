const StageLayering = require('../engine/stage-layering');

class MjpgStreamer {
  constructor(runtime) {
    this.runtime = runtime;
    /**
     * Id representing a Scratch Renderer skin the video is rendered to for
     * previewing.
     * @type {number}
     */
    this._skinId = -1;
    /**
     * Id for a drawable using the video's skin that will render as a video
     * preview.
     * @type {Drawable}
     */
    this._drawable = -1;
    /**
     * Store the last state of the video transparency ghost effect
     * @type {number}
     */
    this._ghost = 0;

    /**
     * Store a flag that allows the preview to be forced transparent.
     * @type {number}
     */
    this._forceTransparentPreview = false;

    /**
     * Store a flag that flip vertically
     * @type {string}
     */
    this._rotation = 'normal';
  }

  /**
   * Dimensions the video stream is analyzed at after its rendered to the
   * sample canvas.
   * @type {Array.<number>}
   */
  static get DIMENSIONS() {
    return [480, 360];
  }

  start(url) {
    const { renderer } = this.runtime;
    if (!renderer) return;

    const image = new Image();
    if (image.complete && image.naturalWidth === 0) {
      console.warn('Image failed to load');
      return;
    }
    image.crossOrigin = 'anonymous';
    image.src = url;

    if (this._skinId === -1 && this._drawable === -1) {
      this._skinId = renderer.createBitmapSkin(new ImageData(...MjpgStreamer.DIMENSIONS), 1);
      this._drawable = renderer.createDrawable(StageLayering.MJPG_STREAMER_LAYER);
      renderer.updateDrawableSkinId(this._drawable, this._skinId);
    }

    // if we haven't already created and started a preview frame render loop, do so
    if (!this._renderPreviewFrame) {
      renderer.updateDrawableEffect(this._drawable, 'ghost', this._forceTransparentPreview ? 100 : this._ghost);
      renderer.updateDrawableVisible(this._drawable, true);

      this._renderPreviewFrame = () => {
        clearTimeout(this._renderPreviewTimeout);
        if (!this._renderPreviewFrame) {
          return;
        }

        this._renderPreviewTimeout = setTimeout(this._renderPreviewFrame, this.runtime.currentStepTime);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');


        // 设置Canvas的尺寸与图像尺寸相同
        canvas.width = MjpgStreamer.DIMENSIONS[0];
        canvas.height = MjpgStreamer.DIMENSIONS[1];

        let drawOrigin = [0, 0];
        if (this._rotation == "inverted") {
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate(Math.PI);
          drawOrigin = [-canvas.width / 2, -canvas.height / 2];
        }
        context.drawImage(image,
          0, 0, image.width, image.height,
          ...drawOrigin, ...MjpgStreamer.DIMENSIONS);

        const imageData = context.getImageData(0, 0, ...MjpgStreamer.DIMENSIONS);

        if (!imageData) {
          renderer.updateBitmapSkin(this._skinId, new ImageData(...MjpgStreamer.DIMENSIONS), 1);
          return;
        }

        renderer.updateBitmapSkin(this._skinId, imageData, 1);
        this.runtime.requestRedraw();
      };

      this._renderPreviewFrame();
    }
  }
  stop() {
    if (this._skinId !== -1) {
      this.runtime.renderer.updateBitmapSkin(this._skinId, new ImageData(...MjpgStreamer.DIMENSIONS), 1);
      this.runtime.renderer.updateDrawableVisible(this._drawable, false);
    }
    this._renderPreviewFrame = null;
  }

  /**
   * Set rotation
   * @param {bool} rotation 
   */
  setRotation(rotation) {
    this._rotation = rotation;
  }
  /**
   * Set the preview ghost effect
   * @param {number} ghost from 0 (visible) to 100 (invisible) - ghost effect
   */
  setPreviewGhost(ghost) {
    this._ghost = ghost;
    // Confirm that the default value has been changed to a valid id for the drawable
    if (this._drawable !== -1) {
      this.runtime.renderer.updateDrawableEffect(
        this._drawable,
        'ghost',
        this._forceTransparentPreview ? 100 : ghost
      );
    }
  }

}

module.exports = MjpgStreamer;