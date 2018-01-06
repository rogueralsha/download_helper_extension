let youtubeSource = {
    name: "youtube",
    regExp: new RegExp("https?:\\/\\/www\\.youtube\\.com\\/watch\\?v\\=(.+)", 'i'),


    isSupported: function(url) {
        return this.regExp.test(url);
    },

    getThumbnail: function(url) {
        if (this.regExp.test(url)) {
            var result = this.regExp.exec(url);
            return "https://img.youtube.com/vi/" + result[1] + "/0.jpg";
        }
        return null;
    },
};