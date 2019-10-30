define(function(){
	return {
		postShow: function(){
			this.view.b3.onPressed = ()=>{
				var n = new kony.mvc.Navigation("Form1");
				n.navigate();
			};
		},
		onNavigate: function(){
			this.view.postShow = this.postShow;
		}
	};
});
