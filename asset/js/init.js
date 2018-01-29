(function($) {
    $('.post-content').toc({
        minItemsToShowToc: 2,
        contentsText: "目录",
        hideText: "隐藏",
        showText: "展开"
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