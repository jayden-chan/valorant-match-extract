export default class StringBuffer {
  private buffer: string;

  constructor(init?: string) {
    this.buffer = init ?? "";
  }

  pushLine(text?: string) {
    if (text) {
      this.buffer += text;
    }

    this.buffer += "\n";
  }

  get(): string {
    return this.buffer;
  }
}
