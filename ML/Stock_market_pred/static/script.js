document.getElementById("predictForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        open: document.getElementById("open").value,
        high: document.getElementById("high").value,
        low: document.getElementById("low").value,
        close: document.getElementById("close").value,
        volume: document.getElementById("volume").value,
        year: document.getElementById("year").value,
        month: document.getElementById("month").value,
        day: document.getElementById("day").value
    };

    const response = await fetch("/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.prediction) {
        document.getElementById("result").innerText =
            "Predicted Adj Close Price: " + result.prediction;
    } else {
        document.getElementById("result").innerText =
            "Error: " + result.error;
    }
});
