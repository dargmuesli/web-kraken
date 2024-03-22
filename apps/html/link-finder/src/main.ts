import {findLinks} from "./link-finder";

async function main() {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel';
  const text = await fetch(url).then(response => response.text());
  const result = findLinks(text);
  console.log(result);
}

main();
