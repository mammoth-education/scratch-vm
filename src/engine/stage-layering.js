class StageLayering {
    static get BACKGROUND_LAYER () {
        return 'background';
    }

    static get MJPG_STREAMER_LAYER () {
        return 'mjpg_streamer';
    }

    static get VIDEO_LAYER () {
        return 'video';
    }

    static get PEN_LAYER () {
        return 'pen';
    }

    static get SPRITE_LAYER () {
        return 'sprite';
    }

    // Order of layer groups relative to each other,
    static get LAYER_GROUPS () {
        return [
            StageLayering.BACKGROUND_LAYER,
            StageLayering.MJPG_STREAMER_LAYER,
            StageLayering.VIDEO_LAYER,
            StageLayering.PEN_LAYER,
            StageLayering.SPRITE_LAYER
        ];
    }
}

module.exports = StageLayering;
