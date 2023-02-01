window.onload = async () => {
    //Stats
    let stats = window.localStorage.getItem('stats') ? JSON.parse(window.localStorage.getItem('stats')) : null;
    if (!stats || stats.time + 3600000 < Date.now()) {
        console.log('stat reload');
        window.localStorage.setItem('stats', JSON.stringify({ time: Date.now(), data: await (await fetch('https://data.mongodb-api.com/app/data-zowrx/endpoint/stats')).json() }));
        stats = JSON.parse(window.localStorage.getItem('stats'));
    }
    //Quotes
    function setQuoteTable(table) {
        let quotes = document.getElementById(table);
        let data = table === 'hm_quotes' ? stats.data.hm.quotes : stats.data.nm.quotes;
        data.forEach((quote) => {
            let row = document.createElement('tr');
            let id = document.createElement('td');
            let keyword = document.createElement('td');
            let content = document.createElement('td');
            let createdBy = document.createElement('td');
            let createdAt = document.createElement('td');
            id.innerHTML = `<a href='./hm/quote?id=${quote.id}'>${quote.id}</a>`;
            keyword.innerText = quote.keyword;
            if (quote.text.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
                let img = document.createElement('img');
                img.src = quote.text;
                img.width = 256;
                img.loading = 'lazy';
                img.alt = quote.text;
                img.setAttribute('loading', 'lazy');
                content.append(img);
                content.setAttribute('data-sort', 'image');
            } else if (quote.text.match(/\.(mp4|mov|webm)$/i)) {
                let video = document.createElement('video');
                video.controls = 'true';
                video.src = quote.text;
                video.width = 256;
                video.preload = 'metadata';
                video.setAttribute('loading', 'lazy');
                content.append(video);
                content.setAttribute('data-sort', 'video');
            } else if (quote.text.startsWith('https://tenor')) {
                content.innerHTML = `<div class="tenor-gif-embed" data-postid="${quote.text
                    .split('-')
                    .pop()}" data-share-method="host" data-aspect-ratio="1" data-width="256px"></div>`;
                content.setAttribute('data-sort', 'tenor');
            } else if (quote.text.startsWith('https://youtu.be')) {
                content.innerHTML = `<iframe width="256" src="https://www.youtube.com/embed/${
                    quote.text.split('/').pop().split('?')[0]
                }" title="YouTube video player" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                content.setAttribute('data-sort', 'youtube');
            } else if (quote.text.includes('youtube.com')) {
                content.innerHTML = `<iframe width="256" src="https://www.youtube.com/embed/${
                    quote.text.split('v=').pop().split('&')[0]
                }" title="YouTube video player" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                content.setAttribute('data-sort', 'youtube');
            } else if (quote.text.startsWith('https://open.spotify.com')) {
                content.innerHTML = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${
                    quote.text.split('/').pop().split('?')[0]
                }" width="256" frameBorder="0" loading="lazy" title="Spotify music embed"></iframe>`;
                content.setAttribute('data-sort', 'spotify');
            } else {
                loading = 'lazy';
                content.innerHTML = quote.text;
                content.setAttribute('data-sort', 'text');
            }
            createdBy.innerText = quote.createdBy;
            createdBy.setAttribute('data-sort', parseInt(quote.createdBy) / 100000000000000);
            createdAt.innerText = quote.createdAt;
            row.append(id, keyword, content, createdBy, createdAt);
            quotes.appendChild(row);
        });

        let embedurl = 'https://tenor.com/embed/';
        let canonical = document.querySelector("link[rel='canonical']");

        function ready() {
            installed = true;
            let elts = document.querySelectorAll('.tenor-embed:not([data-processed]), .tenor-gif-embed:not([data-processed])');
            for (let i = 0; i < elts.length; ++i) {
                e = elts[i];
                e.setAttribute('data-processed', true);
                let embedSubPath = e.getAttribute('data-postid');
                if (!embedSubPath) {
                    embedSubPath = e.getAttribute('data-type');
                }
                if (!embedSubPath) {
                    embedSubPath = e.getAttribute('data-insights-term');
                    if (embedSubPath) {
                        embedSubPath = 'insights/' + embedSubPath.replace(/\s+/g, '-');
                        embedSubPath += '?range=' + e.getAttribute('data-range');
                        embedSubPath += '&timestamp=' + e.getAttribute('data-timestamp');
                    }
                }

                let iframe = document.createElement('iframe');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowtransparency', 'true');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('scrolling', 'no');
                iframe.setAttribute('loading', 'lazy');
                let root;
                if (e.hasAttribute('data-height')) {
                    iframe.setAttribute('width', e.getAttribute('data-width'));
                    iframe.setAttribute('height', e.getAttribute('data-height'));
                    root = iframe;
                } else {
                    let framewrapper = document.createElement('div');
                    let aspect = e.getAttribute('data-aspect-ratio') || 1.33;
                    e.setAttribute('style', 'width:' + e.getAttribute('data-width') + ';' + 'position:relative;');
                    framewrapper.setAttribute('style', 'padding-top:' + (1 / aspect) * 100 + '%;');
                    iframe.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;');
                    framewrapper.appendChild(iframe);
                    root = framewrapper;
                }
                let url = embedurl + embedSubPath;
                let sharemethod = e.getAttribute('data-share-method') || 'tenor';
                if (sharemethod == 'host') {
                    let hosturl;
                    if (canonical) hosturl = canonical.href;
                    else hosturl = document.location.href;
                    url += '?canonicalurl=' + hosturl;
                }
                iframe.title = url;
                iframe.setAttribute('src', url);
                e.innerHTML = '';
                e.appendChild(root);
            }
        }

        function readystatechange() {
            if (document.readyState == 'complete') ready();
        }

        if (document.readyState == 'complete' || (!document.attachEvent && document.readyState == 'interactive')) {
            setTimeout(ready, 1);
        } else {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', ready, false);
                window.addEventListener('load', ready, false);
            } else {
                document.attachEvent('onreadystatechange', readystatechange);
                window.attachEvent('onload', ready);
            }
        }
    }
    setQuoteTable('hm_quotes');
    setQuoteTable('nm_quotes');

    //Scrollbar & scroll events
    const scrollbar = document.getElementsByClassName('scrollbar')[0];
    const scrollbarThumb = scrollbar.children[0];
    scrollbarThumb.style.top = `${(window.scrollY / document.body.scrollHeight) * document.body.clientHeight}px`;
    let mouseDown = 0;
    scrollbarThumb.onmousedown = () => (mouseDown = 1);
    window.onmouseup = () => (mouseDown = 0);
    const main = document.getElementById('landing');
    const hm = document.getElementById('hm');
    const landingButtons = document.querySelectorAll('[id="landing_anchor"]');
    const hmButtons = document.querySelectorAll('[id="hm_anchor"]');
    const nmButtons = document.querySelectorAll('[id="nm_anchor"]');
    let previous = 'main';
    function updateNavButtons() {
        if (window.scrollY > main.scrollHeight - 10 && window.scrollY < main.scrollHeight + hm.scrollHeight && previous !== 'hm') {
            previous = 'hm';
            for (const button of hmButtons) {
                button.classList.contains('active') ? null : button.classList.add('active');
            }
            for (const button of landingButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
            for (const button of nmButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
        } else if (window.scrollY > main.scrollHeight + hm.scrollHeight && previous !== 'nm') {
            previous = 'nm';
            for (const button of nmButtons) {
                button.classList.contains('active') ? null : button.classList.add('active');
            }
            for (const button of hmButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
            for (const button of landingButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
        } else if (window.scrollY < main.scrollHeight - 10 && previous !== 'main') {
            previous = 'main';
            for (const button of landingButtons) {
                button.classList.contains('active') ? null : button.classList.add('active');
            }
            for (const button of hmButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
            for (const button of nmButtons) {
                button.classList.contains('active') ? button.classList.remove('active') : null;
            }
        }
    }
    updateNavButtons();
    window.addEventListener('scroll', (event) => {
        //Main background movement
        main.style.setProperty('background-position', `50% 0px, 50% ${-window.scrollY * 0.02}`);
        updateNavButtons();
        //Scrollbar Thumb pos
        scrollbarThumb.style.top = `${(window.scrollY / document.body.scrollHeight) * document.body.clientHeight}px`;
    });
    scrollbarThumb.style.height = `${(document.body.scrollHeight - document.body.clientHeight) / 2}px`;
    scrollbar.addEventListener('mousedown', (event) => {
        window.scrollTo(0, event.clientY);
    });
    window.addEventListener('mousemove', (event) => {
        if (mouseDown > 0) {
            window.scrollTo(0, event.clientY);
            scrollbarThumb.style.background_color = 'hsla(286, 90%, 15%, 0.75)';
            scrollbarThumb.style.cursor = 'pointer';
        } else {
            scrollbarThumb.style.background_color = 'hsla(286, 90%, 35%, 1)';
            scrollbarThumb.style.cursor = 'unset';
        }
    });
};
