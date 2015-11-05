<large-icon>
	<div id="icomImage" style="background-image:url('{ displayImage }');width:100%;height:100%;">
		<p>{ title }</p>
	</div>
	<script>
		'use strict';
		var self = this;
		this.name = opts.name;
		this.title = opts.title;
		this.interval = opts.interval || 2500;
		this.currentImage = 0;

		onUpdate(){
			this.imageArray = [].concat(opts.images);
			this.displayImage = this.imageArray[this.currentImage];
		}
		updateImage(){
			if (this.imageArray.length === 1) {
				this.displayImage = this.imageArray[0];
				this.update();
				return;
			}
			if (this.currentImage === this.imageArray.length) {
				this.currentImage = 0;
			}
			this.displayImage = this.imageArray[this.currentImage];
			this.update();
			this.currentImage++;			
		}
		this.on('update', function(){
			this.onUpdate();
		});

		//Changes the background image
		setInterval(this.updateImage, this.interval);
	</script>
</large-icon>