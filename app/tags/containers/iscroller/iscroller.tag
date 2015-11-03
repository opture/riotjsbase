<iscroller>
	<div name="wrapper">
		<div name="innerscroller">
			<div class="pullDown">
				<span class="pullDownIcon">&nbsp;</span>
				<span name="pulldownlabel" class="pullDownLabel" style="position:absolute;top:-40px;width:100%;left:0;right:0;display:block;">Pull down to refresh...</span>
			</div>
			<yield/>
		</div>
	</div>
	<script>
		var self = this;
		self.scrollTimer = null;
		self.pullingForRefresh = false;
		self.releaseToRefresh = false;
		RiotControl.addStore(self);

		self.setupScroller = function(){
			self.iScroller = new IScroll(self.wrapper,{
			    mouseWheel: true,
    			scrollbars: true,
    			fadeScrollbars:true,
    			interactiveScrollbars:true,
    			shrinkScrollbars:'clip', //Make the scrollbar go out of view to appear as if its smaller.
    			probeType:3, //Make scroll event fire pixel by pixel.
			});			
			self.trigger('scrollerReady');
		}
		
		self.onScrollerReady = function(theScroller){
			//Set up scroller event listeners.
			self.iScroller.on('scroll', self.onScrolling);

			self.iScroller.on('scrollStart', self.onScrollStart);

			self.iScroller.on('scrollEnd', self.onScrollEnd);

		}
		self.onScrollStart = function(){
			if (self.iScroller.y == 0 && self.iScroller.directionY == -1){
				self.pullingForRefresh = true;
				self.pulldownlabel.innerHTML = 'Dra för att uppdatera';
			}			
		};

		self.onScrollEnd = function(){
			if (self.releaseToRefresh){
				RiotControl.trigger('Some-store-name-refresh');
			}
			self.pullingForRefresh = false;
			self.releaseToRefresh = false;
			self.pulldownlabel.innerHTML = '';
		};

		self.onScrolling = function(){

			clearTimeout(self.scrollTimer);
			if (self.pullingForRefresh) {
				if (self.iScroller.y >= 80 && self.iScroller.directionY == -1){
					self.pullingForRefresh = false;
					self.releaseToRefresh = true;
					self.pulldownlabel.innerHTML = 'Släpp för att uppdatera';
					console.log('Refresh me!');
				}
			}

			self.scrollTimer = setTimeout(function(){
				var hiddenElements = self.innerscroller.querySelectorAll('.hidden')
				for (var x = 0;x < hiddenElements.length; x++){
					self.animateElementInView(hiddenElements[x]);
				}
			},15);

		};
		self.animateElementInView = function(element){
	        if (element.offsetTop < (self.iScroller.y * -1) + self.wrapperHeight ) {
	        	element.classList.remove('hidden');
	        	element.classList.add(self.animateItemClass);
        	}
		};
		
		self.onUpdate = function(){
			if (self.iScroller){
				setTimeout(function(){
					self.iScroller.refresh();	
				},0)
			}
			//Run once if there are any items in view that are hidden.
			self.onScrolling();		
			self.wrapperHeight = self.wrapper.offsetHeight;	
			self.animateItemClass = opts.animateitemclass || 'fadeIn'; 
		}

		self.on('scrollerReady', self.onScrollerReady);
		
		self.on('update', self.onUpdate);	

		self.on('mount', self.setupScroller);

	</script>
</iscroller>