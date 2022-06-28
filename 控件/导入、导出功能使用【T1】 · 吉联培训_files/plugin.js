var selector;
var label;
var isVisibleByDefault;

require(["gitbook", "jQuery"], function(gitbook, $) {
    anchors.options = {
        placement: 'left'
    };

    gitbook.events.bind('start', function(e, config) {
        var configuration = config['intopic-toc'];
        selector = configuration.selector;
        isVisibleByDefault = configuration.visible;
        label = configuration.label;

        // Label can be language specific and could be specified via user configuration
        if (typeof label === 'object') {
            var language = gitbook.state.innerLanguage;

            if (language && label.hasOwnProperty(language)) {
                label = label[language];
            } else {
                label = '';
            }
        }

        // Hide navigation if a search is ative
        $bookSearchResults  = $('#book-search-results');

        var observer = new MutationObserver(() => {
            if ($bookSearchResults.hasClass('open')) {
                $('.intopic-toc').hide();
            }
            else {
                $('.intopic-toc').show();
            }
        });

        observer.observe($bookSearchResults[0], { attributes: true });        
    });

    gitbook.events.bind("page.change", function() {
        $(".header")
        .css("font-size","1.3em")
        .css("color","#555");
        $(".chapter").css("padding-left","30px");
        $(".gitbook-link").parent().remove();
        var codes = $("code");
        for(var i=0;i< codes.length;i++){
            var parent = $(codes[i]).parent();
            if(parent.length>0 && parent[0].tagName.toLowerCase() == "pre"){
                continue;
            }
            $(codes[i]).css("color","red")
                .css("font-weight","bold")
                .css("font-size","0.8em");
        }
        
        
        anchors.removeAll();
        anchors.add(selector);

        var isVisible = (isVisibleByDefault || gitbook.state.page.isTocVisible) && gitbook.state.page.isTocVisible != false;

        if (anchors.elements.length > 1 && isVisible) {
            var navigation = buildNavigation(anchors.elements);

            var section = document.body.querySelector('.page-wrapper');
            section.appendChild(navigation, section.firstChild);

            gumshoe.init({
                container: $(".book-body .body-inner")[0],
                offset: 20,
                scrollDelay: false,
                activeClass: 'selected'
            });
        }
    });
});

function buildNavigation(elements) {
    var navigation = document.createElement('nav');
    navigation.setAttribute('data-gumshoe-header', '');
    navigation.className = 'intopic-toc';

    var heading = document.createElement('h3');
    heading.innerText = label;
    navigation.appendChild(heading);

    var container = document.createElement('ol');
    container.setAttribute('data-gumshoe', '');
    navigation.appendChild(container);
    var h2Container;
    //数据进行分组
    for (var i = 0; i < elements.length; i++) {
        if(elements[i].tagName == "H2"){

            var text = elements[i].textContent;
            $(elements[i]).attr("targetRef",text);
            var href = elements[i].querySelector('.anchorjs-link').getAttribute('href');
            var item = document.createElement('li');
            var anchor = document.createElement('a');
            anchor.text = text;
            anchor.href = href;
            $(anchor).attr("sourceRef",text);
            item.appendChild(anchor);
            if (i === 0) {
                anchor.classList.add('selected');
            }
            container.appendChild(item);
            h2Container = document.createElement("ol");
            h2Container.setAttribute('data-gumshoe', '');
            item.appendChild(h2Container);

        }else{
            var text = elements[i].textContent;
            $(elements[i]).attr("targetRef",text);

            var href = elements[i].querySelector('.anchorjs-link').getAttribute('href');

            var item = document.createElement('li');

            
            var anchor = document.createElement('a');
            anchor.text = text;
            anchor.href = href;
            $(anchor).attr("sourceRef",text);
            if (i === 0) {
                anchor.classList.add('selected');
            }

            item.appendChild(anchor);
            if(h2Container){
                h2Container.appendChild(item);
            }else{
                container.appendChild(item);
            }
        }
    }

    return navigation;
}
