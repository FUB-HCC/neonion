neonionApp
    .filter('escape', function() {
    return window.encodeURIComponent;
})
.filter('truncate', function () {
    return function (text, position) {
        if (position == 'left')
            text = '[...]\u00A0' + text;

        if (position == 'right')
            text = text + '\u00A0[...]';

        return text;
    };
});