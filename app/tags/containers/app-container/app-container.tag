<app-container>
	<div class="pageHolder">
		<yield/>
	</div>
	<div class="sideMenu"></div>
	<div class="topMenu"><top-menu></top-menu></div>
	<script>
		RiotControl.addStore(this);
		this.on('show-sidebar', function(){
			console.log('show sidebar');
			this.root.classList.toggle('showMenu');
		});
	</script>
</app-container>