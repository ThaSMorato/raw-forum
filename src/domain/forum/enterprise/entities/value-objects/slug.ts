export class Slug {
  public value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): Slug {
    return new Slug(value)
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
