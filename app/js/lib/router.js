var routeData = {
    curPage: null
}
riot.route(function (tag, id, action) {
    var switchTo;
    var switchOutAnimation = 'fadeOut';
    var switchInAnimation = 'fadeIn';
    // $('#app-tag').children().each(function (a, d) {
    //     var tagName = d.tagName.toLowerCase().replace('-page', '')

    //     if (tagName == tag) {
    //         switchTo = d;
    //     }
    // });
    var appTag = document.querySelector('.pageHolder');
    for (var x = 0;x < appTag.childNodes.length;x++){
        var tagName = appTag.childNodes[x].tagName.toLowerCase().replace('-page', '')
        console.log(tagName);
        if (tagName == tag) {
            switchTo = appTag.childNodes[x];
        } 
    }
    // if ((tag == 'shop' || tag == 'mypages' )&& id) {
    //     console.log('swithcto: ' + tag);
    //     console.log('view: ' + id);
    //     console.log(switchTo._tag.viewsMenu._tag.selectedView);
    //     switchTo._tag.viewsMenu._tag.selectedView = id;
    //     switchTo._tag.update();

    // }

    if (!routeData.curPage) {
        //Hide all the tags and insert the proper tag.
      
        setTimeout(function () {
            switchTo.style.display = '';
            switchTo.classList.add(switchInAnimation);
            routeData.curPage = switchTo;
        }, 250);

    } else {
        //Fade out the old tag and fade in the new one.
        if (routeData.curPage != switchTo) {
            routeData.curPage.classList.remove(switchInAnimation);
            routeData.curPage.classList.add(switchOutAnimation);
        }

        
        //switchTo.style.display = 'block';
        setTimeout(function () {
            switchTo.style.display = '';
            switchTo.classList.add(switchInAnimation);
            if (routeData.curPage != switchTo) {
                routeData.curPage.style.display = 'none';
                routeData.curPage.classList.remove(switchOutAnimation);
                setTimeout(function () { routeData.curPage = switchTo; }, 1);
            }
        }, 250);

    }
    RiotControl.trigger('ROUTE_CHANGED', { tag: tag, id: id, action: action })
});


