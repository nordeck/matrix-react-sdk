export default class Utils {

    public static randomUUID() : string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            return c == 'x' ? r.toString(16) : (r & 0x3 | 0x8).toString(16);
        });
    }

    public static async delay(timeMs: number)  {
        return new Promise((resolve) => {
            setTimeout(resolve, timeMs);
        });
    }
}
