/*jshint camelcase: false, quotmark: false */
/* exported SjuArticle, SjuArticles */
/* global ElasticStore */



var NewsArticle = function(item) {
    'use strict';

    this.isValidDate = function (d) {
        if (Object.prototype.toString.call(d) !== '[object Date]'){
            return false;
        }
        return !isNaN(d.getTime());
    };

    this.id = item.id || 0;
    this._type = "article";
    this.title = item.title || '';
    this.preamble = item.preamble || item['field_intro:value'] || '';
    this.body = item.body || item['field_text:value'] || '';
    this.image = item.image || item.imageSrc || null;
    this.imageSrc = item.image;
    this.articleLink = item['search_api_url'] || item.articleLink || '';
    this.articleAuthor = item.articleAuthor || {
        firstname: item['author:field_firstname'],
        lastname: item['author:field_surname'],
        email: item['author:mail'],
        phone: item['author:field_phone']
    };
    this.youtubeUrls = item['field_main_youtube:url'] ? item['field_main_youtube:url'] : [];
    this._starts = new Date(item.field_starts * 1000);
    this._published = new Date(item.published);
    this.published = this.isValidDate(this._starts) ? this._starts : this._published;
    this.category = item.category || item.field_section || null;
    //this.appCategoryName = reverseSjuCategoriesMap[this.category] || '';
    this.sortDate = this.published;
    this.favMarked = false;
    //Mark as favourite if this is in the favourites setting.
    (function(t){
        //if (!SettingsStore2) {t.favMarked = false; return;}
        //if (SettingsStore2.settings.favCategories.indexOf(t.appCategoryName) >= 0){
        //    t.favMarked = true;
        //}

    })(this);

};

NewsArticle.prototype.fullname = function() {
    'use strict';
    return this.articleAuthor.firstname + ' ' + this.articleAuthor.lastname;
};
NewsArticle.prototype.share = function() {
    'use strict';
    var self = this;

};




var SjuArticles = (function() {
    'use strict';
    var sjuArticles = new ElasticStore({
        url: 'http://www.lillagula.se/api/elasticsearch',
        storeName: 'SjuArticles',
        objectType: NewsArticle,
        objectWrapper: '_source',
        noCache:false,
        defaultSortFunction: function(a, b) {

            //if (b.published.toString() == 'Invalid Date') {return 1;}
            if (a.sortDate < b.sortDate) {
                return 1;
            } else if (a.sortDate > b.sortDate) {
                return -1;
            }
            return 0;
        },

        query: {
            bool: {
                must: [
                    {
                        match: {
                            field_frontpage: "true"
                        }
                    },
                    {
                        range: {"field_starts":{lt:((new Date().getTime()) / 1000)} }
                    }
                ],
                must_not: [ 
                    { wildcard: {"search_api_url": "*beta*" } },
                    { match: { "field_section": "4223" } }
                ]
            }
        },

        filter: {
            type: {
                value: 'content_index'
            }
        },

        sort: [{
            'field_starts': 'desc'
        }, {
            _score: 'desc'
        }],

        sourceMap: {
            exclude: 'field_related'
        },
    });
    return sjuArticles;
})();



// var NewsArticle = function(item) {
//     this.id = item.id || 0;
//     this.title = item.title || '';
//     this.preamble = item['field_intro:value'] || '';
//     this.body = item['field_text:value'] || '';
//     this.image = item.image || null;
//     this.author = {
//             firstname: item['author:field_firstname'],
//             lastname: item['author:field_surname'],
//             email: item['author:mail'],
//             phone: item['author:field_phone']
//         },
//         this.published = new Date(item.field_starts * 1000)

// }
// NewsArticle.prototype.fullname = function() {
//     return this.author.firstname + ' ' + this.author.lastname;
// }

// var apa = new ElasticStore({
//     url: 'http://www.lillagula.se/api/elasticsearch',
//     storeName: 'articles',
//     objectType: NewsArticle,
//     objectWrapper: '_source',
//     query: {
//         match: {
//             field_frontpage: true
//         }
//     },
//     filter: {
//         type: {
//             value: 'content_index'
//         }
//     },
//     sortDef: [{
//         'field_starts': 'desc'
//     }, {
//         _score: 'desc'
//     }],
//     sourceMap: {
//         exclude: 'field_related'
//     },
// });
