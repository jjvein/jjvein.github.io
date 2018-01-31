(function($) {
    $('.post-content').toc({
        minItemsToShowToc: 2,
        contentsText: "",
        hideText: "<img src='/images/menu-open.png' width='28px' height='28px' />",
        showText: "<img src='/images/menu-close.png' width='28px' height='28px'/>"
    });
    var $menuIcon = $('.menu-icon');
    if ($menuIcon.length > 0) {
       $menuIcon.on('click', function () {
           $trigger = $('.trigger');
           if ($trigger.hasClass('open')) {
               $trigger.removeClass('open');
           } else {
               $trigger.addClass('open');
           }
       });
    }
})($);