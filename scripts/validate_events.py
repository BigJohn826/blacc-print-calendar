import json, os, re, sys
from datetime import datetime

errors=[]
with open("events.json","r",encoding="utf-8") as f:
    events=json.load(f)
with open("updates.json","r",encoding="utf-8") as f:
    json.load(f)

required={"date","start","end","venue","location","status","notes","recurring"}
seen=set()
for i,e in enumerate(events,1):
    missing=required-set(e)
    if missing: errors.append(f"Event {i} missing: {', '.join(sorted(missing))}")
    try: datetime.strptime(e.get("date",""),"%Y-%m-%d")
    except ValueError: errors.append(f"Event {i} has invalid date: {e.get('date')}")
    key=(e.get("date"),e.get("venue"))
    if key in seen: errors.append(f"Duplicate event: {key[0]} / {key[1]}")
    seen.add(key)
    flyer=e.get("flyer")
    if flyer and not os.path.exists(flyer):
        errors.append(f"Missing flyer file for {e.get('venue')}: {flyer}")
    if e.get("status") not in {"Confirmed","Needs Details"}:
        errors.append(f"Unexpected status for {e.get('venue')}: {e.get('status')}")
if errors:
    print("\n".join("ERROR: "+x for x in errors))
    sys.exit(1)
print(f"Validated {len(events)} events successfully.")
