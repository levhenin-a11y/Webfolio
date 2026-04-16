(function ($) {
    if (!$) {
        return;
    }

    var $portfolio = $('#portfolio');
    var $filtersList = $('#filter-works ul');
    var $projectsContainer = $('#projects-container');

    if (!$portfolio.length || !$filtersList.length || !$projectsContainer.length) {
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalizeImageUrl(value) {
        return encodeURI(String(value || ''));
    }

    function buildFilters(filters) {
        if (!$.isArray(filters) || !filters.length) {
            return;
        }

        var html = '';

        $.each(filters, function (index, filter) {
            var label = escapeHtml(filter.label || 'Filtre');
            var selector = escapeHtml(filter.selector || '*');
            var liClass = index === 0 ? ' class="active"' : '';

            html += '<li' + liClass + '><a href="#" data-filter="' + selector + '">' + label + '</a></li>';
        });

        $filtersList.html(html);
    }

    function buildItems(items) {
        if (!$.isArray(items) || !items.length) {
            return;
        }

        var html = '';

        $.each(items, function (_, item) {
            var classes = $.isArray(item.classes) ? item.classes.join(' ') : '';
            var title = escapeHtml(item.title || 'Sans titre');
            var subtitle = escapeHtml(item.subtitle || 'Galerie');
            var thumb = item.thumb || '';
            var images = $.isArray(item.images) ? item.images.join(',') : '';
            var description = escapeHtml(item.description || 'Galerie generee automatiquement.');
            var visibleCount = item.visibleImages || ($.isArray(item.images) ? item.images.length : 0);
            var totalCount = item.totalImagesInFolder || visibleCount;

            if (!thumb || !images) {
                return;
            }

            html += '<article class="project-item ' + classes + '">';
            html += '<img class="img-responsive project-image" src="' + normalizeImageUrl(thumb) + '" alt="' + title + '">';
            html += '<div class="hover-mask">';
            html += '<h2 class="project-title">' + title + '</h2>';
            html += '<p>' + subtitle + '</p>';
            html += '</div>';
            html += '<div class="sr-only project-description" data-images="' + escapeHtml(images) + '">';
            html += '<p>' + description + '</p>';
            html += '<p><strong>' + visibleCount + ' image(s) affichee(s) sur ' + totalCount + ' dans le dossier.</strong></p>';
            html += '</div>';
            html += '</article>';
        });

        $projectsContainer.html(html);
    }

    function refreshMasonry() {
        if (!$.fn.masonry) {
            return;
        }

        if ($projectsContainer.data('masonry')) {
            $projectsContainer.masonry('reload');
        } else {
            $projectsContainer.css({ visibility: 'visible' });
            $projectsContainer.masonry({
                itemSelector: '.project-item:not(.filtered)',
                isFitWidth: true,
                isResizable: true,
                isAnimated: !Modernizr.csstransitions,
                gutterWidth: 25
            });
        }

        setTimeout(function () {
            $('body').scrollspy('refresh');
            if ($.waypoints) {
                $.waypoints('refresh');
            }
        }, 400);
    }

    $(function () {
        var source = $portfolio.data('gallery-source') || 'assets/data/galleries.fr.json';

        $.getJSON(source)
            .done(function (data) {
                if (!data || !$.isArray(data.items) || !data.items.length) {
                    return;
                }

                buildFilters(data.filters || []);
                buildItems(data.items);
                refreshMasonry();
            })
            .fail(function () {
                if (window.console && console.warn) {
                    console.warn('Impossible de charger les galeries JSON. Fallback HTML conserve.');
                }
            });
    });
})(window.jQuery);
