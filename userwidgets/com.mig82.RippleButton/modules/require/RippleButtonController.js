define(function() {

	const doNothing = ()=>{};
	const MIN_RIPPLE_DIM = "5%";

	const rippleSteps = {
		10: {
			width: MIN_RIPPLE_DIM,
			height: MIN_RIPPLE_DIM,
			opacity: 1,
			stepConfig: {timingFunction: kony.anim.LINEAR}
		},
		100: {
			width: "100%",
			height: "100%",
			opacity: 1,
			stepConfig: {timingFunction: kony.anim.EASE_OUT}
		}
	};

	const rippleConfig = {
		"duration": 0.6,
		"iterationCount": 1,
		"delay": 0,
		"fillMode": kony.anim.FILL_MODE_FORWARDS
	};

	const backgroundSteps = {
		100: {
			opacity: 1,
			stepConfig: {timingFunction: kony.anim.EASE_OUT}
		}
	};

	const backgroundConfig = {
		"duration": 0.5,
		"iterationCount": 1,
		"delay": 0,
		"fillMode": kony.anim.FILL_MODE_FORWARDS
	};

	const fadeSteps = {
		100: {
			opacity: 0,
			stepConfig: {timingFunction: kony.anim.EASE_IN}
		}
	};

	const fadeConfig = {
		"duration": 0.4,
		"iterationCount": 1,
		"delay": 0,
		"fillMode": kony.anim.FILL_MODE_FORWARDS
	};

	return {
		keepEffectsRatio: function(){
			var l = this.view.width;
			this.view.effectsFlex.width = l;
			this.view.effectsFlex.height = l;
		},

		hideBackground: function(){
			this.view.background.opacity = 0;
		},

		showBackground: function(){
			//animate this.view.background.opacity = 1;
			try{
				var animation = kony.ui.createAnimation(backgroundSteps);
				this.view.background.animate(animation, backgroundConfig, {
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
				this.view.background.animate(animation, fadeConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						this.hideBackground();
					}
				});
				this.view.ripple.animate(animation, fadeConfig, {
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
				var animation = kony.ui.createAnimation(rippleSteps);
				this.view.ripple.animate(animation, rippleConfig, {
					animationStart: doNothing,
					animationEnd: () => {
						this.fadeEffects();
					}
				});
			}
			catch(e){
				kony.print(`RippleButton: error animating ripple:\n\t${e}`);
			}
		},

		isClicked: false,

		preShow: function(){
			this.keepEffectsRatio();
			this.hideBackground();
			this.hideRipple();
		},

		postShow: function(){
			this.view.button1.onClick = () => {
				if(!this.isClicked){
					this.showBackground();
					this.growRipple();
					this.isClicked = true;
				}
			};
		},

		constructor: function(/*baseConfig, layoutConfig, pspConfig*/) {
			this.view.preShow = this.preShow;
			this.view.postShow = this.postShow;
		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {

		}
	};
});