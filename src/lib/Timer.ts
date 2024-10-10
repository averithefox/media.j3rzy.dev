class TimerClass
{
  private startTime: number | null = null;
  private remainingTime: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly callback: () => void;
  
  public constructor( callback: () => void, duration: number )
  {
    this.remainingTime = duration;
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
      this.remainingTime -= Date.now() - this.startTime;
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
    
    if ( runCallback )
      this.callback();
  }
  
  public getTimePassed(): number
  {
    if ( !this.startTime ) return 0;
    
    return Date.now() - this.startTime;
  }
  
  public getTimeRemaining(): number
  {
    return this.remainingTime;
  }
  
  public getCompletedPercentage(): number
  {
    return this.getTimePassed() / (this.getTimePassed() + this.remainingTime);
  }
  
  public toString(): string
  {
    return `Timer { startTime: ${this.startTime}, remainingTime: ${this.remainingTime}, timeoutId: ${this.timeoutId} }`;
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