export function unixToDateString(unix: number): string {
    return new Date(unix * 1000).toLocaleDateString();
}