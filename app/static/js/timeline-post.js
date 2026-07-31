/* Wires up the Timeline "Post" form. Fetched pages get their <script> tags
   stripped when the homepage clones them into the river (see index.html),
   so this lives as its own static file: it self-inits on DOMContentLoaded
   for the standalone /timeline page, and index.html calls
   window.initTimelinePost(root) again once it has appended the cloned
   Timeline section, the same way it re-runs scroll-reveal on river sections. */
(function () {
    async function sha256Hex(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function initTimelinePost(root) {
        var form = (root || document).querySelector('#timeline-form');
        if (!form || form.dataset.timelineBound) return;
        form.dataset.timelineBound = 'true';

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var name = form.name.value.trim();
            var email = form.email.value.trim();
            var content = form.content.value.trim();

            var res = await fetch('/api/timeline_post', {
                method: 'POST',
                body: new URLSearchParams({ name: name, email: email, content: content })
            });

            if (!res.ok) {
                alert('Something went wrong posting that.');
                return;
            }

            var post = await res.json();
            var hash = await sha256Hex(email.toLowerCase());

            var list = document.getElementById('timeline-list');
            var empty = list.querySelector('.timeline-empty');
            if (empty) empty.remove();

            var li = document.createElement('li');
            li.className = 'timeline-item';
            li.dataset.id = post.id;
            li.innerHTML =
                '<img class="timeline-avatar" src="https://www.gravatar.com/avatar/' + hash + '?d=identicon&s=64" alt="">' +
                '<div class="timeline-item-body">' +
                    '<div class="timeline-item-header">' +
                        '<span class="timeline-name">' + post.name + '</span>' +
                        '<time>' + new Date(post.created_at).toLocaleString() + '</time>' +
                    '</div>' +
                    '<p>' + post.content + '</p>' +
                '</div>';

            list.insertBefore(li, list.firstChild);
            form.reset();
        });
    }

    window.initTimelinePost = initTimelinePost;
    document.addEventListener('DOMContentLoaded', function () { initTimelinePost(document); });
})();
