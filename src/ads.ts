/**
 * Public Adsterra placement snippets supplied by the site owner. Add a unique
 * mobile banner snippet to bottomMobile when that format is issued. These are
 * public third-party codes, never account credentials.
 */
export const adsterraSnippets = {
  bottomDesktop: `<script>
  atOptions = {
    'key' : '3194ac4869fb7e968eb3add3dfe4ee3b',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/3194ac4869fb7e968eb3add3dfe4ee3b"></script>`,
  bottomMobile: '',
  sideLeft: `<script async="async" data-cfasync="false" src="https://bauval.org/21/22e7752534882e4d8facaea5fd448d94"></script>
<div id="container-22e7752534882e4d8facaea5fd448d94"></div>`,
  sideRight: `<script>
  atOptions = {
    'key' : '7f7c4ffaebd25f5413694d24518fed3c',
    'format' : 'iframe',
    'height' : 300,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/7f7c4ffaebd25f5413694d24518fed3c"></script>`,
} as const;
