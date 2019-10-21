define(function() {

	const doNothing = ()=>{};

	const MIN_RIPPLE_DIM = "5%";

	const DEFAULT_BACKGROUND_OPACITY = 0.25;
	const DEFAULT_RIPPLE_OPACITY = 0.25;

	const DEFAULT_RIPPLE_DURATION = 0.6;
	const DEFAULT_BACKGROUND_DURATION = 0.5;
	const DEFAULT_FADE_DURATION = 0.4;

	const fadeSteps = {
		100: {
			opacity: 0,
			stepConfig: {timingFunction: kony.anim.EASE_IN}
		}
	};

	return {
		rippleSteps: {
			0: {
				width: MIN_RIPPLE_DIM,
				height: MIN_RIPPLE_DIM,
				opacity: DEFAULT_RIPPLE_OPACITY,
				stepConfig: {timingFunction: kony.anim.LINEAR}
			},
			100: {
				width: "100%",
				height: "100%",
				opacity: DEFAULT_RIPPLE_OPACITY,
				stepConfig: {timingFunction: kony.anim.EASE_OUT}
			}
		},

		backgroundSteps: {
			100: {
				opacity: DEFAULT_BACKGROUND_OPACITY,
				stepConfig: {timingFunction: kony.anim.EASE_OUT}
			}
		},

		animConfig: {
			"iterationCount": 1,
			"delay": 0,
			"fillMode": kony.anim.FILL_MODE_FORWARDS
		},

		keepRippleRatio: function(){
			//TODO: Keep the ripple circular.
			/*var maxPixels, maxDim;
			if(this.view.frame.width >= this.view.frame.height){
				maxDim = this.view.width;
				maxPixels = this.view.frame.width;
			}
			else{
				maxDim = this.view.height;
				maxPixels = this.view.frame.height;
			}

			//Make the effects (background and ripple) as large as the widget.
			//this.view.effectsFlex.width = maxDim;
			//this.view.effectsFlex.height = maxDim;

			var pixelsPerDp = this.view.dummy100Dp.frame.width / 100;
			if(this.view.width && /%$/.test(this.view.width)){
				var DPs = maxPixels / pixelsPerDp + "dp";
				//rippleSteps[100].height = DPs;
				//this.view.effectsFlex.height = DPs;
			}*/

			//rippleSteps[100].width = this.view.ripple.width;
			//rippleSteps[100].height = this.view.ripple.height;
			//kony.print(`${this.view.id}\t Ripple Width: ${rippleSteps[100].width}\tHeight: ${rippleSteps[100].height}`);
			//kony.print(`${this.view.id}\tmaxDim: ${maxDim}\tmaxPixels: ${maxPixels}`);
		},

		hideBackground: function(){
			this.view.background.opacity = 0;
		},

		showRippleBackground: function(){
			//animate this.view.background.opacity = 1;
			try{
				this.backgroundSteps[100].opacity = this._backgroundOpacity;
				var animation = kony.ui.createAnimation(this.backgroundSteps);
				this.animConfig.duration = this._backgroundDuration;
				this.view.background.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: doNothing
				});
			}
			catch(e){
				kony.print(`RippleButton: error animating background:\n\t${e}`);
			}
		},

		hideRipple: function(){
			this.view.ripple.opacity = 0;
			this.view.ripple.width = MIN_RIPPLE_DIM;
			this.view.ripple.height = MIN_RIPPLE_DIM;
		},

		fadeEffects: function(){
			//animate the opacity of both effects back to 0.
			try{
				var animation = kony.ui.createAnimation(fadeSteps);
				this.animConfig.duration = this._fadeDuration;
				this.view.background.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						this.hideBackground();
					}
				});
				this.view.ripple.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						this.hideRipple();
						this.isClicked = false;
					}
				});
			}
			catch(e){
				kony.print(`RippleButton: error fading effects away:\n\t${e}`);
			}
		},

		growRipple: function(){
			//animate this.view.ripple opacity to 1 and width and height to 100%
			try{
				this.rippleSteps[0].opacity = this.rippleSteps[100].opacity = this._rippleOpacity;
				var animation = kony.ui.createAnimation(this.rippleSteps);
				this.animConfig.duration = this._rippleDuration;
				this.view.ripple.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						//If it's not released, then it's a long press, so don't fade backcround and ripple.
						if(!this.isReleased) this.isClicked = false;
						//If it is released, then it was a brief press, so fade background and ripple.
						else this.fadeEffects();
					}
				});
			}
			catch(e){
				kony.print(`RippleButton: error animating ripple:\n\t${e}`);
			}
		},

		//Whether the button has been clicked the animation is ongoing.
		isClicked: false,

		//Whether the button has been released, used to not fade effects in long press.
		isReleased: true,

		preShow: function(){
			this.keepRippleRatio();
			this.hideBackground();
			this.hideRipple();
		},

		postShow: function(){
			this.view.button1.onTouchStart = () => {
				if(!this.isClicked){
					this.isClicked = true;
					this.isReleased = false;
					this.showRippleBackground();
					this.growRipple();
				}
			};
			this.view.button1.onTouchEnd = () => {
				this.isReleased = true;
				//If the button is released after a long press, fade background and ripple.
				if(!this.isClicked)this.fadeEffects();
			};
		},

		constructor: function(/*baseConfig, layoutConfig, pspConfig*/) {
			this.view.preShow = this.preShow;
			this.view.postShow = this.postShow;
		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {
			//Ripple animation duration.
			defineGetter(this, "rippleDuration", () => {return this._rippleDuration;});
			defineSetter(this, "rippleDuration", (rippleDuration) => {
				this._rippleDuration = parseFloat(rippleDuration) || DEFAULT_RIPPLE_DURATION;
			});

			//Background animation duration.
			defineGetter(this, "backgroundDuration", () => {return this._backgroundDuration;});
			defineSetter(this, "backgroundDuration", (backgroundDuration) => {
				this._backgroundDuration = parseFloat(backgroundDuration) || DEFAULT_BACKGROUND_DURATION;
			});

			//Fade animation duration.
			defineGetter(this, "fadeDuration", () => {return this._fadeDuration;});
			defineSetter(this, "fadeDuration", (fadeDuration) => {
				this._fadeDuration = parseFloat(fadeDuration) || DEFAULT_FADE_DURATION;
			});

			//Ripple opacity.
			defineGetter(this, "rippleOpacity", () => {return this._rippleOpacity;});
			defineSetter(this, "rippleOpacity", (rippleOpacity) => {
				this._rippleOpacity = parseFloat(rippleOpacity) || DEFAULT_RIPPLE_OPACITY;
			});

			//Background opacity.
			defineGetter(this, "backgroundOpacity", () => {return this._backgroundOpacity;});
			defineSetter(this, "backgroundOpacity", (backgroundOpacity) => {
				this._backgroundOpacity = parseFloat(backgroundOpacity) || DEFAULT_BACKGROUND_OPACITY;
			});
		}
	};
});