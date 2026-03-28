export class TimeFlag {
  private flag: boolean;
  private time: number;
  private maxTime: number;

  constructor(flag: boolean, time: number, maxTime: number) {
    this.flag    = flag;
    this.time    = time;
    this.maxTime = maxTime;
  }

  tickTime(delta: number = 5): void {
    if (this.flag) {
      if (this.time < this.maxTime) {
        this.time += delta;
      } else {
        this.flag = false;
      }
    } else {
      this.time = 0;
    }
  }

  setFlag(v: boolean): void {
    this.flag = v;
    if (v) this.time = 0;
  }

  getFlag(): boolean { return this.flag; }
  getTime(): number  { return this.time; }
  getRate(): number  { return this.time / this.maxTime; }
  resetTime(): void  { this.time = 0; }
}
