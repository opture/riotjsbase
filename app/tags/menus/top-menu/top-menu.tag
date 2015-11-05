<top-menu>
	<div onclick="{showMenu}" svg-icon="Menu"></div>
	<div svg-icon="Chevron_left"></div>
	<div></div>
	<div></div>
	<div svg-icon="Magnifying_glass"></div>
	<script>
		RiotControl.addStore(this);
		this.on('mount', function(){
			RiotControl.addStore(this);
			helpers.addIcons(this);
		});
		showMenu(){
			RiotControl.trigger('show-sidebar');
		}

	</script>
</top-menu>