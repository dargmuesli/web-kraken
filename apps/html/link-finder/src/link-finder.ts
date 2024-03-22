import {Links} from "./links.interface";
import * as htmlparser2 from "htmlparser2";

export class HtmlCallback implements Partial<htmlparser2.Handler> {
  private scriptMode = false;
  private styleMode = false;

  constructor(
    private links: Links,
  ) {
  }

  onopentag(name, attrs) {
    switch (name) {
      case "a":
        if (attrs.href) {
          this.links.anchors.push(attrs.href);
        }
        break;
      case "link":
        switch (attrs.rel) {
          case "stylesheet":
            if (attrs.href) {
              this.links.stylesheets.push(attrs.href);
            }
            break;
          case "preload":
            if (attrs.href) {
              this.links.preload.push(attrs.href);
            }
            break;
        }
        break;
      case "script":
        if (attrs.src) {
          this.links.scripts.push(attrs.src);
        } else {
          this.scriptMode = true;
        }
        break;
      case "style":
        this.styleMode = true;
        break;
    }
  }

  ontext(data) {
    if (this.scriptMode) {
      this.links.scriptSources.push(data);
    }
    if (this.styleMode) {
      this.links.styleSources.push(data);
    }
  }

  onclosetag(name) {
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

export function findLinks(html: string): Links {
  const links = new Links();
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
