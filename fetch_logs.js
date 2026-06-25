fetch('https://api.github.com/repos/dzmpa/myMacroBuddy.github.io/actions/runs/28179896010/jobs').then(r=>r.json()).then(d=>console.log(JSON.stringify(d, null, 2)))
