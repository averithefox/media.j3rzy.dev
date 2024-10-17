class TimerClass
{
  private readonly duration: number;
  private startTime: number | null = null;
  private remainingTime: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly callback: () => void;
  private totalElapsedTime: number = 0;
  
  public constructor( callback: () => void, duration: number )
  {
    this.remainingTime = this.duration = duration;
    this.callback = callback;
  }
  
  private clearTimeout(): void
  {
    if ( !this.timeoutId ) return;
    
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
  
  public start(): void
  {
    this.startTime = Date.now();
    this.timeoutId = setTimeout(this.callback, this.remainingTime);
  }
  
  public pause(): void
  {
    if ( !this.timeoutId ) return;
    
    this.clearTimeout();
    if ( this.startTime )
    {
      const currentElapsed = Date.now() - this.startTime;
      this.totalElapsedTime += currentElapsed;
      this.remainingTime -= currentElapsed;
      this.startTime = null;
    }
  }
  
  public resume(): void
  {
    if ( this.timeoutId ) return;
    
    this.startTime = Date.now();
    this.timeoutId = setTimeout(this.callback, this.remainingTime);
  }
  
  public stop( runCallback: boolean = false ): void
  {
    this.clearTimeout();
    
    if ( this.startTime )
    {
      this.totalElapsedTime += Date.now() - this.startTime;
      this.startTime = null;
    }
    
    if ( runCallback )
      this.callback();
  }
  
  public getTimePassed(): number
  {
    const currentElapsed = this.startTime ? Date.now() - this.startTime : 0;
    return this.totalElapsedTime + currentElapsed;
  }
  
  public getTimeRemaining(): number
  {
    return this.remainingTime;
  }
  
  public getCompletedPercentage(): number
  {
    return Math.min(100, this.getTimePassed() / this.duration * 100);
  }
  
  public toString(): string
  {
    return `Timer { startTime: ${this.startTime}, remainingTime: ${this.remainingTime}, timeoutId: ${this.timeoutId}, totalElapsedTime: ${this.totalElapsedTime} }`;
  }
}

interface TimerClassConstructor
{
  new( callback: () => void, duration: number ): TimerClass;
  
  ( callback: () => void, duration: number ): TimerClass;
}

const Timer = function( this: TimerClass | void, callback: () => void, duration: number )
{
  if ( this instanceof TimerClass ) return new TimerClass(callback, duration);
  
  const instance = new TimerClass(callback, duration);
  instance.start();
  return instance;
} as TimerClassConstructor;

Timer.prototype = TimerClass.prototype;

export default Timer;