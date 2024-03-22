import {findLinks} from "./link-finder";

async function main() {
  // const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel';
  const url = 'https://earth.google.com/static/single-threaded/versions/10.49.0.0/index.html';
  const text = await fetch(url).then(response => response.text());
  const result = findLinks(text);
  console.log(result.absolute(url));
}

main();
