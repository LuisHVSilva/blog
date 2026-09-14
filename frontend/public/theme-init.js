// Blocking head script: apply the preference before the first styled paint.
(() => {
    let saved;
    try {
        saved = localStorage.getItem('blog.theme');
    } catch { /* Storage may be denied. */
    }
    document.documentElement.dataset.theme = saved === 'dark' || saved === 'light'
        ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
