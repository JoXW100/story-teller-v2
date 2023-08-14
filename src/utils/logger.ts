
abstract class Logger
{
    public static log(sender: string, value: any): void
    {
        if (process.env.NODE_ENV !== "development") return;
        console.log(`[${this.time}]: ${sender} →`, value);
    }

    public static warn(sender: string, value: any): void
    {
        if (process.env.NODE_ENV === "development") {
            console.warn(`[${this.time}]: ${sender} →`, value);
        } else {
            console.warn(String(value));
        }
    }
    
    public static error(sender: string, value: any): void
    {
        if (process.env.NODE_ENV !== "development") return;
        console.error(`[${this.time}]: ${sender} →`, value);
    }

    public static throw(sender: string, value: unknown): void
    {
        if (process.env.NODE_ENV !== "development") return;
        console.error(`[${this.time}]: ${sender} →`, value);
        throw value;
    }

    private static get time(): string {
        let now: Date = new Date();
        let milliseconds = now.getMilliseconds();
        let msText = milliseconds.toString();
        let timeText = now.toLocaleString("sv-Se");
        return `${timeText}.${msText}${'0'.repeat(3 - msText.length)}`;
    }
}

export default Logger;