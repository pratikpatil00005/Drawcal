function addToHistory(item) {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
}

function clearHistory() {
    historyList.innerHTML = '';
}