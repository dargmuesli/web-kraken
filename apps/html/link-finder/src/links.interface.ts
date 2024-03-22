export class Links {
  anchors: string[] = [];
  stylesheets: string[] = [];
  styleSources: string[] = [];
  scripts: string[] = [];
  scriptSources: string[] = [];
  preload: string[] = [];

  absolute(baseUrl: string): Links {
    const result = new Links();
    result.scriptSources = this.scriptSources.slice();
    result.styleSources = this.styleSources.slice();
    for (const key of ['anchors', 'stylesheets', 'preload', 'scripts'] as const) {
      result[key] = this[key].map((link: string) => new URL(link, baseUrl).href);
    }
    return result;
  }

}
