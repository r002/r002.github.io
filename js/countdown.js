(function() {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function renderCountdown(diffMs) {
    var el = document.getElementById('countdown');
    if (!el) return;

    if (diffMs <= 0) {
      el.textContent = '0d 00h 00m 00s';
      return;
    }

    var sec = Math.floor(diffMs / 1000);
    var days = Math.floor(sec / 86400);
    sec -= days * 86400;
    var hours = Math.floor(sec / 3600);
    sec -= hours * 3600;
    var mins = Math.floor(sec / 60);
    sec -= mins * 60;

    el.innerHTML = `<div style="line-height:1.5">
                      <span class="bolded">${days}</span> days,
                      <span class="bolded">${pad(hours)}</span> hours,
                      <span class="bolded">${pad(mins)}</span> minutes,
                      <span class="bolded">${pad(sec)}</span> seconds<br />` +
                      ` until <span class="boldedYellow">June 21, 2026</span> &nbsp;|&nbsp;
                        <a href="https://JamesVsRobert.com">JamesVsRobert.com</a></div>`;
  }

  function startCountdown(targetDate) {
    function tick() {
      var now = new Date();
      var diff = targetDate.getTime() - now.getTime();
      renderCountdown(diff);
    }
    tick();
    return setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', function() {
    var target = new Date(2026, 5, 21, 0, 0, 0);
    startCountdown(target);
  });
})();