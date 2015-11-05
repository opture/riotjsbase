<iscroller>
	<div name="wrapper">
		<div name="innerscroller">
			<div if={pullToRefreshEnabled} class="pullDown">
				<span name="pulldownlabel" class="pullDownLabel">Dra för att uppdatera...</span>
			</div>
			<yield/>
		</div>
	</div>
	<script>
		var self = this;
		this.scrollTimer = null;
		this.pullingForRefresh = false;
		this.releaseToRefresh = false;
		this.pullToRefreshEnabled = opts.pulltorefresh;
		this.itemTagName = opts.itemtag; //The tag to use for detail items.
		this.storeName = opts.storename; //This is used to listen for store update events.
		this.collection = [];
		RiotControl.addStore(self);

		setupScroller(){
			this.iScroller = new IScroll(this.wrapper,{
			    mouseWheel: true,
    			scrollbars: false,
    			//fadeScrollbars:true,
    			//interactiveScrollbars:true,
    			//shrinkScrollbars:'clip', //Make the scrollbar go out of view to appear as if its smaller.
    			probeType:3, //Make scroll event fire pixel by pixel.
			});			
			this.trigger('scrollerReady');
		}
		
		onMount(){
			this.setupScroller();
			RiotControl.trigger(this.storeName + '-list-init')
		}
		onScrollerReady (theScroller){
			//Set up scroller event listeners.
			this.iScroller.on('scroll', this.onScrolling);

			this.iScroller.on('scrollStart', this.onScrollStart);

			this.iScroller.on('scrollEnd', this.onScrollEnd);

		}
		onScrollStart(){
			if (this.iScroller.y == 0 && this.iScroller.directionY == -1 && this.pullToRefreshEnabled){
				this.pullingForRefresh = true;
				this.pulldownlabel.innerHTML = 'Dra för att uppdatera...';
			}			

		};

		onScrollEnd(){
			if (this.releaseToRefresh){
				this.trigger('do-refresh');
				RiotControl.trigger(this.storeName + '-check-for-new');
			}
			this.pullingForRefresh = false;
			this.releaseToRefresh = false;
			this.pulldownlabel.innerHTML = '';
		};

		onScrolling(){

			clearTimeout(this.scrollTimer);
			if (this.pullingForRefresh) {
				if (this.iScroller.y >= 60 && this.iScroller.directionY == -1){
					this.pullingForRefresh = false;
					this.releaseToRefresh = true;
					this.pulldownlabel.innerHTML = 'Släpp för att uppdatera...';
					console.log('Refresh me!');
				}
			}

			this.scrollTimer = setTimeout(function(){
				var hiddenElements = self.innerscroller.querySelectorAll('.hidden')
				for (var x = 0;x < hiddenElements.length; x++){
					self.loadImageInView(hiddenElements[x]);
					self.animateElementInView(hiddenElements[x]);
				}
				//self.iScroller.refresh();
				if ((self.iScroller.y*-1) >= (self.innerscroller.offsetHeight - self.wrapperHeight - 125) && self.iScroller.directionY == 1){
					//console.log('this is the bottom, fetch some more please');
					RiotControl.trigger(self.storeName + '-reached-end');
				}
			},5);

		};
		animateElementInView(element){
			var hasChanged = false;
	        if (element.offsetTop < (this.iScroller.y * -1) + this.wrapperHeight ) {
	        	element.classList.remove('hidden');
	        	element.classList.add(this.animateItemClass);
	        	hasChanged = true;
        	}
        	if (hasChanged) {self.iScroller.refresh();}
		};
		
		loadImageInView(element){
			var hasChanged = false;
			var hiddenImages = element.querySelectorAll('[data-src]');
			for (var x = 0;x < hiddenImages.length; x++){
				hiddenImages[x].setAttribute('src',hiddenImages[x].getAttribute('data-src') );
				hiddenImages[x].removeAttribute('data-src','');
				hasChanged = true;
			}
			if (hasChanged) {self.iScroller.refresh();}
		}

		onUpdate(){
			if (this.iScroller){
				setTimeout(function(){
					self.iScroller.refresh();	
				},0)
			}
			//Run once if there are any items in view that are hidden.
			this.getOpts();
			this.onScrolling();
			this.wrapperHeight = this.wrapper.offsetHeight;	
			this.pullingForRefresh = false;
		}
		getOpts(){
			this.animateItemClass = opts.animateitemclass || 'fadeIn'; 
			this.pullToRefreshEnabled = opts.pulltorefresh || false;
			this.storeName = opts.storename; //This is used to listen for store update events.
			this.itemTagName = opts.itemtag;
		}
		this.on('scrollerReady', this.onScrollerReady);
		
		this.on('update', this.onUpdate);	

		this.on('mount', this.onMount);

		this.on(this.storeName + '-collection-changed', function(coll){
			console.log('scroller got noticed about a collection change');
			this.collection = coll;
			setTimeout(function(){
				self.update();
				self.iScroller.refresh();
			}, 50);
			//self.update();

			
		})

	</script>
</iscroller>