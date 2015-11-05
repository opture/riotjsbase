<sjuarticles-page>
	
		<iscroller animateitemclass="flipInUp" pulltorefresh="{true}" storename="SjuArticles" style="padding-top:4rem;">
			<sjuarticle each="{article in collection}" class="hidden animated-slow" article="{article}"></sjuarticle>
		</iscroller>
	
	<script>
		var self=this;	
	</script>

</sjuarticles-page>