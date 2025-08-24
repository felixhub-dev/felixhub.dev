class TimeLeftData {
    days!: number;
    hours!: number;
    minutes!: number;
    seconds!: number;
    milliseconds!: number;

    constructor(totalMs: number) {
        this.update(totalMs);
    }

    public update(totalMs: number) {
        this.days = Math.floor(totalMs / (24 * 60 * 60 * 1000));
        totalMs %= 24 * 60 * 60 * 1000;

        this.hours = Math.floor(totalMs / (60 * 60 * 1000));
        totalMs %= 60 * 60 * 1000;

        this.minutes = Math.floor(totalMs / (60 * 1000));
        totalMs %= 60 * 1000;

        this.seconds = Math.floor(totalMs / 1000);
        this.milliseconds = totalMs % 1000;
    }


    public toHTML(): string {
        return `
            <br>
            <span class="timer-unit days">${this.days}d</span>
            <span class="timer-unit hours">${this.hours}h</span>
            <span class="timer-unit minutes">${this.minutes}m</span>
            <span class="timer-unit seconds">${this.seconds}s</span>
            <span class="timer-unit milliseconds">${this.milliseconds}s</span>
            till hell ends.
        `;
    }

}


const timer = document.querySelector<HTMLElement>(".time-left");

if (!timer) {
    throw new Error(`time-left element not found on page ${document.title}`);
}

(async () => {
    let text;
    const response = await fetch("/time/remaining_time");
    if (!response.ok) {
        text = "Time could not be retrieved.";
    }

    if (response.body == null) {
        text = "Server did not return the correct response";
    }

    let end_time = await response.json();
    const timeLeft = new TimeLeftData(0);

    let t = setInterval((() => {
        let date = end_time - Date.now();

        if (date < 0) date = 0;

        timeLeft.update(date);
        timer.innerHTML = timeLeft.toHTML();
    }), 1);

})();

const panel = document.getElementById("timer-panel")!;
const arrow = document.getElementById("timer-arrow")!;

arrow.addEventListener("click", () => {
    panel.classList.toggle("open");
    arrow.classList.toggle("open");
});
