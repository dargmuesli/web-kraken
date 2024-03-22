export class HtmlLinks {
  base = '';
  anchors: string[] = [];
  stylesheets: string[] = [];
  styleSources: string[] = [];
  scripts: string[] = [];
  scriptSources: string[] = [];
  preload: string[] = [];

  absolute(baseUrl: string): HtmlLinks {
    const baseUri = new URL(this.base, baseUrl);
    const result = new HtmlLinks();
    result.scriptSources = this.scriptSources.slice();
    result.styleSources = this.styleSources.slice();
    for (const key of ['anchors', 'stylesheets', 'preload', 'scripts'] as const) {
      result[key] = this[key].map((link: string) => new URL(link, baseUri).href);
    }
    return result;
  }

}
