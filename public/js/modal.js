$('#signupModal').on('shown.bs.modal', function(e) {
    const title = $('main input[name ="title"]').val();
    const content = $('main textarea[name ="content"]').val();

    $('#signupModal input[name ="title"]').val(title);
    $('#signupModal input[name ="content"]').val(content);
});

$('#loginModal').on('shown.bs.modal', function(e) {
    const title = $('main input[name ="title"]').val();
    const content = $('main textarea[name ="content"]').val();

    $('#loginModal input[name ="title"]').val(title);
    $('#loginModal input[name ="content"]').val(content);
});
