define(function() {

	const doNothing = ()=>{};

	const LONG_PRESS_DETECTION_WINDOW = 0.2; //Seconds

	const MIN_RIPPLE_DIM = "0%";

	const DEFAULT_BACKGROUND_OPACITY = 0.25;
	const DEFAULT_RIPPLE_OPACITY = 0.25;

	const DEFAULT_RIPPLE_DURATION = 0.6; //Seconds
	const DEFAULT_LONG_RIPPLE_DURATION = 1.5; //Seconds

	const DEFAULT_BACKGROUND_DURATION = 0.5; //Seconds
	const DEFAULT_LONG_BACKGROUND_DURATION = 1.5; //Seconds

	const DEFAULT_FADE_DURATION = 0.4; //Seconds

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
				this.animConfig.duration = this.isLongPress?this._longBackgroundDuration:this._backgroundDuration;
				this.view.background.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: this.fadeBackground
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

		fadeBackground: function(){
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
			}
			catch(e){
				kony.print(`RippleButton: ${this.view.id} error fading background away:\n\t${e}`);
			}
		},

		fadeRipple: function(){
			//animate the opacity of both effects back to 0.
			try{
				var animation = kony.ui.createAnimation(fadeSteps);
				this.animConfig.duration = this._fadeDuration;
				this.view.ripple.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						/*TODO: All of the below should be done at the end of the longest
						fade animation. Not at the end of the ripple fade always.*/
						this.hideRipple();
						//Reset the values used for long-press detection.
						delete this.duration;
						delete this.start;
						this.isFired = false;
					}
				});
			}
			catch(e){
				kony.print(`RippleButton: ${this.view.id} error fading ripple away:\n\t${e}`);
			}
		},

		invokeOnPressed: function(){
			if(typeof this.onPressed === "function"){
				this.onPressed();
			}
		},

		growRipple: function(){

			try{
				//Place the ripple where the user touched.
				this.rippleSteps[0].centerX = this.rippleCenterStartX;
				this.rippleSteps[0].centerY = this.rippleCenterStartY;
				//Set the target position of the animation to the center.
				this.rippleSteps[100].centerX = this.rippleSteps[100].centerY = "50%";
				//Set the opacity of the ripple.
				this.rippleSteps[0].opacity = this.rippleSteps[100].opacity = this._rippleOpacity;
				//Create the animation object.
				var animation = kony.ui.createAnimation(this.rippleSteps);

				//Use the normal or long press duration depending on the case.
				this.animConfig.duration = this.isLongPress?this._longRippleDuration:this._rippleDuration;

				this.view.ripple.animate(animation, this.animConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						//Allow the button to be pressed again.
						this.isClicked = false;
						/*If it is released, then it was a brief press, so fade background and ripple.
						If it's not released, then it's a long press, so don't fade backcround and ripple.*/
						if(this.isReleased) this.fadeRipple();

						//Invoke the custom event set by the developer.
						this.invokeOnPressed();
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

		/*Whether the ripple animations have already been fired. This avoids the
		race condition of the animations being fired twice onTouchStart and onTouchEnd
		which occurs with very quick clicks —e.g. under 10 milliseconds.*/
		isFired: false,

		fireAnimations: function(){
			if(!this.isFired){
				this.isFired = true;
				//If there is no duration calculated yet or if it's longer than the window, then it's a long press.
				if(typeof this.duration === "undefined" || this.duration > LONG_PRESS_DETECTION_WINDOW * 1000){
					this.isLongPress = true;
				}
				else{
					this.isLongPress = false;
				}
				this.showRippleBackground();
				this.growRipple();
			}
		},

		hideEffects: function(){
			this.hideRipple();
			this.hideBackground();
		},

		placeRipple: function(x, y){
			kony.print(`RippleButton touchX: ${x}, touchY: ${y}`);

			var offsetX = this.view.rippleFlex.frame.x;
			var offsetY = this.view.rippleFlex.frame.y;
			kony.print(`RippleButton offsetX: ${offsetX}, offsetY: ${offsetY}`);

			this.rippleCenterStartX = `${x - offsetX}dp`;
			this.rippleCenterStartY = `${y - offsetY}dp`;
			kony.print(`RippleButton rippleX: ${this.rippleCenterStartX}, rippleY: ${this.rippleCenterStartY}`);
		},

		preShow: function(){
			this.keepRippleRatio();
			this.hideEffects();
			this.isClicked = false;
			this.isReleased = true;
			this.isFired = false;
		},

		postShow: function(){
			this.view.button1.onTouchStart = (button, x, y) => {
				if(!this.isClicked){
					//Avoid double click.
					this.isClicked = true;

					//Avoid fading effects right away if it's a long press.
					this.isReleased = false;

					//Start calculating the duration of the click.
					this.start = Date.now();

					//Place the ripple where the user's finger touched.
					this.placeRipple(x, y);

					//Give ourselves time to detect whether it's a quick or long press.
					this.animTimerId = `RippleButton.${this.view.id}.${this.start}`;
					kony.timer.schedule(this.view.id, () => {
						this.fireAnimations();
					}, LONG_PRESS_DETECTION_WINDOW, false);
				}
			};
			this.view.button1.onTouchEnd = () => {
				//Calculate duration to detect long-press.
				this.duration = Date.now() - this.start;
				this.isReleased = true;

				//Quick press
				if(this.isClicked){
					/*Gotta try catch cancelling the timer so it doesn't throw
					an error in iOS when the timer has already been cancelled*/
					try{kony.timer.cancel(this.animTimerId);}catch(e){}
					this.fireAnimations();
				}
				//Long press
				else{
					/*If the button is not clicked by the time it's released, it means
					the button is being released after a long press, and the ripple and
					background animations have likely finished already, so we fade the
					background and ripple.*/
					this.fadeRipple();
					this.fadeBackground();
				}
			};
		},

		constructor: function(/*baseConfig, layoutConfig, pspConfig*/) {
			/*Make the ripple and background visible again in case
			the developer made them invisible at design time.*/
			this.view.rippleFlex.isVisible = true;
			this.view.backgroundFlex.isVisible = true;

			/*Make the focus skin the same as the normal one. The idea
			is to avoid a double effect of ripple and focus skin*/
			this.view.button1.focusSkin = this.view.button1.skin;
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

			//Ripple animation duration.
			defineGetter(this, "longRippleDuration", () => {return this._longRippleDuration;});
			defineSetter(this, "longRippleDuration", (longRippleDuration) => {
				this._longRippleDuration = parseFloat(longRippleDuration) || DEFAULT_LONG_RIPPLE_DURATION;
			});

			//Background animation duration.
			defineGetter(this, "backgroundDuration", () => {return this._backgroundDuration;});
			defineSetter(this, "backgroundDuration", (backgroundDuration) => {
				this._backgroundDuration = parseFloat(backgroundDuration) || DEFAULT_BACKGROUND_DURATION;
			});

			//Long background animation duration.
			defineGetter(this, "longBackgroundDuration", () => {return this._longBackgroundDuration;});
			defineSetter(this, "longBackgroundDuration", (longBackgroundDuration) => {
				this._longBackgroundDuration = parseFloat(longBackgroundDuration) || DEFAULT_LONG_BACKGROUND_DURATION;
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