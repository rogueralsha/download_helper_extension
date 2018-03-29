let tinyTinyRssSource = {
    name : "tt-rss",
    process : async function (url, output){
        let result = false;
        let bodyEle = document.getElementsByClassName("ttrss_main");
        if(bodyEle.length>0) {

            let linkElements = document.querySelectorAll("div#headlines-frame a.title");
            for(let i = 0; i < linkElements.length; i++) {
                let linkElement = linkElements[i];
                let link = linkElement.href;
                output.artist = siteRegexp.exec(url)[1];

                output.addLink(createLink({url: link, type: "page"}));
            }

            result = true;
        }
        if(result) {
            output.saveByDefault = false;
        }

    return result;
    }
};

