#!/usr/bin/env python
import json
import os

with open("words") as fp:
    words = fp.readlines()
    data = dict(
        words={},
        sorted={},
        freq={},
        minFreq=-1,
        maxFreq=-1,
        )
    for line in words:
        line = line.strip()
        if line[0].upper() == line[0]:
            continue
        line = line.lower()
        data['words'][line] = True
        letters = "".join(sorted(list(line)))
        v = data['sorted'].get(letters, "")
        if v:
            v += ","
        v += line
        data['sorted'][letters] = v
        for letter in letters:
            f = data['freq'][letter] = data['freq'].get(letter, 0) + 1
            if f > data['maxFreq']:
                data['maxFreq'] = f

for letter in data['freq']:
    f = data['minFreq']
    if f == -1 or f < data['freq'][letter]:
        data['freq'][letter] = f

with open("words.js", "w") as fp:
    fp.write("var words = %s\n" % json.dumps(data, separators=(",", ":")))

print "Wrote %i bytes to words.js" % os.path.getsize("words.js")
