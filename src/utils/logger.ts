
abstract class Logger
{
    public static log(sender: string, value: any): void
    {
        if (process.env.NODE_ENV != "development") return;
        console.log(`[${this.time}]: ${sender} →`, value);
    }
    
    public static error(sender: string, value: any): void
    {
        if (process.env.NODE_ENV != "development") return;
        console.error(`[${this.time}]: ${sender} →`, value);
    }

    public static throw(sender: string, value: unknown): void
    {
        if (process.env.NODE_ENV != "development") return;
        console.error(`[${this.time}]: ${sender} →`, value);
        throw value;
    }

    private static get time(): string {
        var now: Date = new Date();
        var milliseconds = now.getMilliseconds();
        var msText = milliseconds.toString();
        var timeText = now.toLocaleString("sv-Se");
        return `${timeText}.${msText}`;
    }
}

export default Logger;