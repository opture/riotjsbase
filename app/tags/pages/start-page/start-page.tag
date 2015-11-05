<start-page>
	<div>
			<large-icon
				name="startEntertainment"
				title="LÖPET"
				images="{ entertainmentImage }"
				data-link-to="entertainment-page"
				interval ="2600"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startFlow"
				title="MINA FAVORITER"
				images="img/icons/favoriter_128x128.png"
				data-link-to="favourites-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="StartModo"
				title="MODO"
				images="{ modoImage }"
				data-link-to="hockey-start-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startNearby"
				title="NÄRA MIG"
				images="img/icons/nara_mig_128x128.png"
				data-link-to="pois-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startFamily"
				title="FAMILJ"
				interval ="2400"
				images="{ familyImages }"
				data-link-to="family-start-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startRestaurants"
				title="ÄTA UTE"
				images="img/icons/ata_ute_256x256.png"
				data-link-to="sju-lunch-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startEvents"
				title="PÅ G"
				images="img/icons/kalender_128x128.png"
				data-link-to="sju-events-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

			<large-icon
				name="startSearch"
				title="SÖK"
				images="/img/icons/startsearch_128x128.png"
				data-link-to="default-search-page"
				class="animate-on-page-change animated-medium">
			</large-icon>

	</div>
	<script>
		onMount(){
			if(RiotControl){
				RiotControl.addStore(this);
			}
		}
		this.on('mount', function(){
			this.onMount();
		});

	</script>
</start-page>