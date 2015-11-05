var helpers = {
    getIconById: function (iconId) {
        'use strict';
        var iconCollectionElement = document.getElementsByTagName('entypo-icons')[0];
        //Return a cloned node.
        return iconCollectionElement._tag.getIcon(iconId).cloneNode(true);
    },
    addSvgIcon: function (element) {
        'use strict';
        //Get the id of the icon to fetch.
        var iconId = element.getAttribute('svg-icon');
        //If entypo-icon wasnt set then just return.
        if (!iconId) {
            return;
        }
        //Fetch the icon.
        var svgIcon = helpers.getIconById(iconId);
        //Apend it to the element. (No checking for self-closing elements.)
        element.insertBefore(svgIcon, element.firstChild);
        //element.appendChild(svgIcon);
        //Set class added-svg so we dont try to add the icon again.
        element.classList.add('added-svg');
    },
    addIcons: function (tag) {
        'use strict';
        //Get icons in the tag.
        var icons = tag.root.querySelectorAll('[svg-icon]:not(.added-svg)');

        //Loop over and inject svg in element.
        for (var i = 0; i < icons.length; i++) {
            helpers.addSvgIcon(icons[i]);
        }
    }
}