import {css, html} from "./link-finder";

async function main() {
  // const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel';
  const url = 'https://earth.google.com/static/single-threaded/versions/10.49.0.0/index.html';
  const text = await fetch(url).then(response => response.text());
  const result = html(text);
  const absolute = result.absolute(url);
  console.log(absolute);

  for (const styleSource of absolute.styleSources) {
    const cssLinks = css(styleSource);
    const cssAbsolute = cssLinks.absolute(url);
    console.log(cssAbsolute);
  }

  for (const stylesheet of absolute.stylesheets) {
    const cssText = await fetch(stylesheet).then(response => response.text());
    const cssLinks = css(cssText);
    const cssAbsolute = cssLinks.absolute(stylesheet);
    console.log(cssAbsolute);
  }
}

main();
