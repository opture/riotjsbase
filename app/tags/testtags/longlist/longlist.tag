<longlist>
	<div each={arrItem in testArr} class="hidden animated-slow">
	{arrItem}
	</div>
	<script>
		var self = this;
		this.testArr = [];
		this.on('mount', function(){
			for (var x=0;x<300;x++){
				this.testArr.push('abc12' + x);
			}
			setTimeout(function(){
				riot.update();
			},250)
			
		});

	</script>
</longlist>