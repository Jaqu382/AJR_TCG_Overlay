
const timerBox=document.getElementById('countdownTimer'),timerValue=document.getElementById('countdownValue');let timerState=normalizeTimer(null);
function updateTimerState(s){timerState=normalizeTimer(s.timer);timerBox.hidden=!timerState.visible;if(timerBox.dataset.color!==timerState.color)timerBox.dataset.color=timerState.color;paintTimer();}
function paintTimer(){const text=timerText(timerState);if(timerValue.textContent!==text)timerValue.textContent=text;}
setInterval(paintTimer,100);
