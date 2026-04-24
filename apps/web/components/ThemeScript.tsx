export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'light') { document.documentElement.classList.remove('dark'); return; }
        if (stored === 'dark') { document.documentElement.classList.add('dark'); return; }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch(e) {}
    })();
  `.trim()

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
