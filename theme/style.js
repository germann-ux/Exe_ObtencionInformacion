var myTheme = {
    init: function () {
        // Common functions
        if (this.inIframe()) $('body').addClass('in-iframe');
        if (!$('body').hasClass('exe-web-site')) return;
        // Add menu and search bar togglers
        var togglers =
            '\
            <button type="button" id="siteNavToggler" class="toggler" title="' +
            $exe_i18n.menu +
            '">\
                <span class="sr-av">' +
            $exe_i18n.menu +
            '</span>\
            </button>\
            <button type="button" id="searchBarTogger" class="toggler" title="' +
            $exe_i18n.search +
            '">\
                <span class="sr-av">' +
            $exe_i18n.search +
            '</span>\
            </button>\
        ';
        $('#siteNav').before(togglers);
        // Check the current NAV status
        var url = window.location.href;
        url = url.split('?');
        if (url.length > 1) {
            if (url[1].indexOf('nav=false') != -1) {
                $('body').addClass('siteNav-off');
                myTheme.params('add');
            }
        }
        // Menu toggler
        $('#siteNavToggler').on('click', function () {
            if (myTheme.isLowRes()) {
                $('#exe-client-search').hide();
                if ($('body').hasClass('siteNav-off')) {
                    $('body').removeClass('siteNav-off');
                } else {
                    if ($('#siteNav').isInViewport()) {
                        $('body').addClass('siteNav-off');
                        myTheme.params('add');
                    }
                }
            } else {
                $('body').toggleClass('siteNav-off');
                myTheme.params(
                    $('body').hasClass('siteNav-off') ? 'add' : 'remove'
                );
            }
        });
        // Search bar toggler
        $('#searchBarTogger').on('click', function () {
            var bar = $('#exe-client-search');
            if (bar.is(':visible')) {
                bar.hide();
            } else {
                if (myTheme.isLowRes()) {
                    $('body').addClass('siteNav-off');
                }
                bar.show();
                $('#exe-client-search-text').focus();
            }
        });
        // Fixed navigation
        $('#siteNav').wrap('<div id="sidebar-nav"></div>');
        myTheme.checkNav();
        $(window).bind('resize', function () {
            myTheme.checkNav();
        });
        // Search form
        this.searchForm();

        // mover .page-title dentro de .page-content
        this.movePageTitle();
        this.landingParallax();
    },
    inIframe: function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },
    searchForm: function () {
        $('#exe-client-search-text').attr('class', 'form-control');
    },
    isLowRes: function () {
        return $('#siteNav').css('float') == 'none';
    },
    checkNav: function () {
        var wrapper = $('#sidebar-nav');
        var navH = $('#siteNav > ul').height(); // Menu height
        navH = navH + 50;
        if (navH < $(window).height()) wrapper.addClass('fixed');
        else wrapper.removeClass('fixed');
    },
    param: function (e, act) {
        if (act == 'add') {
            var ref = e.href;
            var con = '?';
            if (ref.indexOf('.html?') != -1) con = '&';
            var param = 'nav=false';
            if (ref.indexOf(param) == -1) {
                ref += con + param;
                e.href = ref;
            }
        } else {
            // This will remove all params
            var ref = e.href;
            ref = ref.split('?');
            e.href = ref[0];
        }
    },
    params: function (act) {
        $('.nav-buttons a').each(function () {
            myTheme.param(this, act);
        });
    },

    // function that move the h2 outside the header
    movePageTitle: function () {
        const tryMove = () => {
            const $header = $('.main-header .page-header');
            const $title = $header.find('.page-title').first();

            // Search container of content
            let $content = $('.page-content').first();
            if (!$content.length)
                $content = $('.content, main .content').first();
            if (!$content.length) $content = $('#main, #content').first();
            if (!$content.length && $header.length)
                $content = $header.nextAll(':not(header)').first();
            if (!$content.length && $header.length) $content = $header.parent();

            if ($header.length && $title.length && $content.length) {
                $content.prepend($title); // move it to the start
                return true;
            }
            return false;
        };

        if (tryMove()) return;

        const observer = new MutationObserver(() => {
            if (tryMove()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },
    landingParallax: function () {
        const scene = document.querySelector('[data-parallax-scene]');
        if (!scene) return;

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );
        if (reduceMotion.matches) return;

        const layers = scene.querySelectorAll('[data-depth]');
        layers.forEach((layer) => {
            layer.style.setProperty('--depth', layer.dataset.depth || '0.08');
        });

        let pointerX = 0;
        let pointerY = 0;
        let scrollY = 0;
        let pending = false;

        const render = () => {
            pending = false;
            scene.style.setProperty('--px', (pointerX + scrollY * 0.18).toFixed(2) + 'px');
            scene.style.setProperty('--py', (pointerY + scrollY).toFixed(2) + 'px');
        };

        const requestRender = () => {
            if (pending) return;
            pending = true;
            window.requestAnimationFrame(render);
        };

        const updateScroll = () => {
            const rect = scene.getBoundingClientRect();
            scrollY = Math.max(-90, Math.min(90, rect.top * -0.16));
            requestRender();
        };

        scene.addEventListener('pointermove', (event) => {
            const rect = scene.getBoundingClientRect();
            pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 34;
            pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 26;
            requestRender();
        });

        scene.addEventListener('pointerleave', () => {
            pointerX = 0;
            pointerY = 0;
            requestRender();
        });

        window.addEventListener('scroll', updateScroll, { passive: true });
        window.addEventListener('resize', updateScroll);
        updateScroll();
    },
    // 🔼
};

$(function () {
    myTheme.init();
});

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};
