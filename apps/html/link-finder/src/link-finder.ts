import {CssLinks, HtmlLinks, Link} from "./links.interface";
import * as htmlparser2 from "htmlparser2";

export class HtmlCallback implements Partial<htmlparser2.Handler> {
  private scriptMode = false;
  private styleMode = false;

  constructor(
    private links: HtmlLinks,
  ) {
  }

  onopentag(name: keyof HTMLElementTagNameMap | string, attrs: Record<string, string>) {
    switch (name) {
      case 'base': // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
        if (attrs.href) {
          this.links.base ||= attrs.href;
        }
        break;
      case "a":
        if (attrs.href) {
          this.links.anchors.push(new Link('anchor', attrs.href));
        }
        break;
      case "link":
        switch (attrs.rel) {
          case "stylesheet":
            if (attrs.href) {
              this.links.stylesheets.push(new Link('stylesheet', attrs.href, attrs.integrity));
            }
            break;
          case "preload":
            if (attrs.href) {
              this.links.preload.push(new Link('preload', attrs.href, attrs.integrity));
            }
            break;
        }
        break;
      case "script":
        if (attrs.src) {
          this.links.scripts.push(new Link('script', attrs.src, attrs.integrity));
        } else {
          this.scriptMode = true;
        }
        break;
      case "style":
        this.styleMode = true;
        break;
    }
  }

  ontext(data: string) {
    if (this.scriptMode) {
      this.links.scriptSources.push(data);
    }
    if (this.styleMode) {
      this.links.styleSources.push(data);
    }
  }

  onclosetag(name: keyof HTMLElementTagNameMap | string) {
    switch (name) {
      case "script":
        this.scriptMode = false;
        break;
      case "style":
        this.styleMode = false;
        break;
    }
  }
}

/**
 * Finds links in HTML sources.
 * Supported link types:
 * - `<base href>`
 * - `<a href>`
 * - `<link rel=stylesheet>`
 * - `<style>` content
 * - `<link rel=preload>`
 * - `<script src>`
 * - `<script>` content
 * @param html
 */
export function html(html: string): HtmlLinks {
  const links = new HtmlLinks();
  const handler = new HtmlCallback(links);
  const parser = new htmlparser2.Parser(handler, {
    decodeEntities: true,
    lowerCaseAttributeNames: true,
    lowerCaseTags: true,
    recognizeSelfClosing: true,
    recognizeCDATA: true,
  });
  parser.write(html);
  parser.end();
  return links;
}

const FONT_EXTENSIONS = new Set([
  '.woff',
  '.woff2',
  '.ttf',
]);
const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.bmp',
  '.tiff',
]);

export function css(css: string, url?: string): CssLinks {
  const urlRegex = /url\s*\(\s*(?:'([^']*)'|"([^"])"|(.*?))\s*\)/gi;
  const links = new CssLinks();

  for (const match of css.matchAll(urlRegex)) {
    const link = match[1] || match[2] || match[3];

    if (link.startsWith('data:')) {
      const mimeType = link.substring('data:'.length, link.indexOf(';'));
      if (mimeType.startsWith('font/')) {
        links.fonts.push(new Link('font', link));
      } else if (mimeType.startsWith('image/')) {
        links.images.push(new Link('image', link));
      } else if (mimeType === 'text/css') {
        links.styles.push(new Link('style', link));
      }
    } else {
      // convert to URL to strip query string, hash, etc.
      let extension: string;
      try {
        const url = new URL(link);
        extension = url.pathname.substring(url.pathname.lastIndexOf('.'));
      } catch (e) {
        extension = link.substring(link.lastIndexOf('.'));
      }
      if (FONT_EXTENSIONS.has(extension)) {
        links.fonts.push(new Link('font', link));
      } else if (IMAGE_EXTENSIONS.has(extension)) {
        links.images.push(new Link('image', link));
      } else if (extension === '.css') {
        // e.g. `@import url('foo/bar/baz.css');`
        links.styles.push(new Link('style', link));
      }
    }
  }

  return links;
}
