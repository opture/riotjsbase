<sjuarticle>
	<h5>{ article.title }</h5>
	<div class="artImageContainer {noArticleImage : !article.imageSrc}" svg-icon="{article.youtubeUrls.length ? 'Play' : ''}">
		<div if="{!article.imageSrc}"></div>
		<img if="{article.imageSrc}" name="articleImage" if="{ article.imageSrc }" data-src="{ article.imageSrc }"  />
	</div>
	
	<p class="articlePreamble" name="artPreamble"><raw content="{article.preamble}"></raw></p>
	<p class="articleDate"><i>{moment(article.published).format('Do MMM YYYY')}, {article.articleAuthor.firstname} {article.articleAuthor.lastname}</i></p>
	<p class="followIcon" if={article.appCategoryName}>
		<img onclick="{toggleFollow}" name="favIcon" src="images/icons/stjarna_{article.favMarked ? 'gul' : 'gra' }_48x48.png"/>
	</p>
	<p class="followIcon" if={!article.appCategoryName}></p>
	<script>

		this.article = opts.article;
		this.on('update', function(){
			var self = this;
			setTimeout(function(){
				helpers.addIcons(self);	
			},1);
			
		});
	</script>
</sjuarticle>