export class Link {
  constructor(
    public type: 'script' | 'stylesheet' | 'preload' | 'style' | 'font' | 'image' | 'anchor',
    public href: string,
    public integrity?: string,
  ) {
  }

  absolute(baseUrl: string): Link {
    return new Link(this.type, new URL(this.href, baseUrl).href, this.integrity);
  }
}

export class HtmlLinks {
  base = '';
  anchors: Link[] = [];
  stylesheets: Link[] = [];
  styleSources: string[] = [];
  scripts: Link[] = [];
  scriptSources: string[] = [];
  preload: Link[] = [];

  absolute(baseUrl: string): HtmlLinks {
    const baseUri = new URL(this.base, baseUrl);
    const result = new HtmlLinks();
    result.scriptSources = this.scriptSources.slice();
    result.styleSources = this.styleSources.slice();
    for (const key of ['anchors', 'stylesheets', 'preload', 'scripts'] as const) {
      result[key] = this[key].map(link => link.absolute(baseUri.href));
    }
    return result;
  }

}

export class CssLinks {
  fonts: Link[] = [];
  images: Link[] = [];
  /** External stylesheets with `@import` */
  styles: Link[] = [];

  absolute(baseUrl: string): CssLinks {
    const baseUri = new URL(baseUrl);
    const result = new CssLinks();
    for (const key of ['fonts', 'images', 'styles'] as const) {
      result[key] = this[key].map(link => link.absolute(baseUri.href));
    }
    return result;
  }
}
