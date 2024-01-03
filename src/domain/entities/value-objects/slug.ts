export class Slug {
  public value: string
  constructor(value: string) {
    this.value = value
  }

  /**
   * Receives a string and normalize it as slug.
   *
   * Example: 'An example title' => 'an-exaple-title'
   *
   * @param text { string }
   */
  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD')
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/_/g, '-')
      .replace(/--+/g, '-')
      .replace(/-$/, '')

    return new Slug(slugText)

  }
}
