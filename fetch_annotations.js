fetch('https://api.github.com/repos/dzmpa/myMacroBuddy.github.io/check-runs/83467803681/annotations').then(r=>r.json()).then(d=>console.log(JSON.stringify(d, null, 2)))
